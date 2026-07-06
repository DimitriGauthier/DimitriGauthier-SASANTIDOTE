// reschedule-booking — Report d'un RDV par le client, depuis la page /rdv/{token}.
// Sécurité : le `token` du booking fait foi. Public (verify_jwt=false).
// Le nouveau créneau doit venir de get-slots (déjà filtré). On revérifie ici :
//   délai mini, non-passé, non-chevauchement (holds/RDV actifs + Google FreeBusy).
// Effets : met à jour l'événement Google (nouvel .ics au client), déplace le RDV,
//   notifie le client (email brandé) + Dimitri.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { cors, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/supabase.ts";
import { getAccessToken, freeBusy, updateEvent, createEvent, Interval } from "../_shared/google.ts";
import { sendEmail } from "../_shared/resend.ts";
import { bookingRescheduled, practitionerBookingChange, fmtReunion, Lang } from "../_shared/emails.ts";

function overlaps(aS: Date, aE: Date, bS: Date, bE: Date): boolean {
  return aS.getTime() < bE.getTime() && bS.getTime() < aE.getTime();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { token, slot_start } = await req.json().catch(() => ({}));
    if (!token || !slot_start) return json({ error: "token et slot_start requis" }, 400);

    const admin = adminClient();
    const { data: booking } = await admin.from("bookings").select("*").eq("token", token).single();
    if (!booking) return json({ error: "réservation introuvable" }, 404);
    if (booking.status !== "scheduled") return json({ error: "réservation non modifiable" }, 409);

    const { data: service } = await admin.from("services").select("*").eq("id", booking.service_id).single();
    const duration = service?.duration_min ?? Math.round((new Date(booking.slot_end).getTime() - new Date(booking.slot_start).getTime()) / 60_000);

    const start = new Date(slot_start);
    const end = new Date(start.getTime() + duration * 60_000);
    if (isNaN(start.getTime())) return json({ error: "créneau invalide" }, 400);

    // Créneau identique ? rien à faire.
    if (start.toISOString() === new Date(booking.slot_start).toISOString()) {
      return json({ ok: true, unchanged: true });
    }

    // Délai mini d'annonce.
    const { data: settings } = await admin.from("settings").select("min_notice_hours, practitioner_name, email").eq("id", 1).single();
    const notBefore = new Date(Date.now() + (settings?.min_notice_hours ?? 24) * 3600_000);
    if (start < notBefore) return json({ error: "créneau trop proche" }, 409);

    // Anti-chevauchement : Google FreeBusy + holds/RDV actifs (hors ce booking).
    let busy: Interval[] = [];
    try {
      const { token: gToken, calendarId } = await getAccessToken(admin);
      busy = await freeBusy(gToken, calendarId, start.toISOString(), end.toISOString());
    } catch (_e) { /* Google non connecté : on se base sur les holds internes */ }

    const { data: others } = await admin.from("bookings")
      .select("id, slot_start, slot_end, status, hold_expires_at")
      .in("status", ["hold", "scheduled"])
      .lt("slot_start", end.toISOString())
      .gt("slot_end", start.toISOString())
      .neq("id", booking.id);
    const now = new Date();
    for (const b of others ?? []) {
      if (b.status === "hold" && b.hold_expires_at && new Date(b.hold_expires_at) < now) continue;
      busy.push({ start: new Date(b.slot_start), end: new Date(b.slot_end) });
    }
    if (busy.some((b) => overlaps(start, end, b.start, b.end))) {
      return json({ error: "créneau déjà réservé" }, 409);
    }

    const oldStartIso = booking.slot_start;

    // 1) Base d'abord (la contrainte d'exclusion gist protège contre les courses).
    const { error: uErr } = await admin.from("bookings").update({
      slot_start: start.toISOString(),
      slot_end: end.toISOString(),
    }).eq("id", booking.id).eq("status", "scheduled");
    if (uErr) {
      if ((uErr as { code?: string }).code === "23P01") return json({ error: "créneau déjà réservé" }, 409);
      return json({ error: uErr.message }, 400);
    }

    // 2) Google Calendar — met à jour (ou recrée) l'événement. Best-effort.
    let googleEventId: string | null = booking.google_event_id ?? null;
    let googleLink: string | null = booking.google_event_link ?? null;
    try {
      const { token: gToken, calendarId } = await getAccessToken(admin);
      const tz = booking.timezone ?? "Indian/Reunion";
      if (booking.google_event_id) {
        const ev = await updateEvent(gToken, calendarId, booking.google_event_id, {
          start: { dateTime: start.toISOString(), timeZone: tz },
          end: { dateTime: end.toISOString(), timeZone: tz },
        });
        googleLink = ev.htmlLink ?? googleLink;
      } else {
        const ev = await createEvent(gToken, calendarId, {
          summary: `${service?.title ?? "RDV"} — ${booking.client_first_name} ${booking.client_last_name}`,
          description: `Réservation via le site.\nProfil: ${booking.audience}\nTél: ${booking.client_phone ?? "—"}\nRéf: ${booking.token}`,
          start: { dateTime: start.toISOString(), timeZone: tz },
          end: { dateTime: end.toISOString(), timeZone: tz },
          attendees: [{ email: booking.client_email, displayName: `${booking.client_first_name} ${booking.client_last_name}` }],
          reminders: { useDefault: true },
        });
        googleEventId = ev.id ?? null;
        googleLink = ev.htmlLink ?? null;
        await admin.from("bookings").update({ google_event_id: googleEventId, google_event_link: googleLink }).eq("id", booking.id);
      }
    } catch (e) {
      console.error("maj Google échouée:", e);
    }

    // 3) Emails.
    const lang = (booking.locale === "en" ? "en" : "fr") as Lang;
    const practitioner = settings?.practitioner_name ?? "Dimitri Gauthier";
    const SITE = (Deno.env.get("SITE_URL") ?? "https://www.dimitrigauthier.com").replace(/\/$/, "");
    const manageUrl = `${SITE}/${lang}/rdv/${booking.token}`;

    const conf = bookingRescheduled(lang, {
      firstName: booking.client_first_name,
      oldWhen: fmtReunion(oldStartIso, lang),
      newWhen: fmtReunion(start.toISOString(), lang),
      practitioner, manageUrl,
    });
    await sendEmail(admin, {
      to: booking.client_email, subject: conf.subject, html: conf.html,
      type: "booking_rescheduled", booking_id: booking.id,
    });

    if (settings?.email) {
      const notif = practitionerBookingChange({
        kind: "rescheduled",
        firstName: booking.client_first_name, lastName: booking.client_last_name,
        email: booking.client_email, phone: booking.client_phone ?? null,
        oldWhen: fmtReunion(oldStartIso, "fr"),
        newWhen: fmtReunion(start.toISOString(), "fr"),
      });
      await sendEmail(admin, {
        to: settings.email, subject: notif.subject, html: notif.html,
        type: "practitioner_booking_rescheduled", booking_id: booking.id,
      });
    }

    return json({ ok: true, slot_start: start.toISOString(), slot_end: end.toISOString() });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
