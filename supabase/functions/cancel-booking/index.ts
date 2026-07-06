// cancel-booking — Annulation d'un RDV par le client, depuis la page /rdv/{token}.
// Sécurité : le `token` du booking fait foi (secret non devinable). Public (verify_jwt=false).
// Effets : supprime l'événement Google (l'.ics d'annulation part au client), passe le RDV
//   en "cancelled", notifie le client (email brandé) + Dimitri.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { cors, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/supabase.ts";
import { getAccessToken, deleteEvent } from "../_shared/google.ts";
import { sendEmail } from "../_shared/resend.ts";
import { bookingCancelled, practitionerBookingChange, fmtReunion, Lang } from "../_shared/emails.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { token } = await req.json().catch(() => ({}));
    if (!token) return json({ error: "token requis" }, 400);

    const admin = adminClient();
    const { data: booking } = await admin.from("bookings").select("*").eq("token", token).single();
    if (!booking) return json({ error: "réservation introuvable" }, 404);

    // Idempotent : déjà annulé => on renvoie ok.
    if (booking.status === "cancelled") return json({ ok: true, already: true });
    if (booking.status !== "scheduled") return json({ error: "réservation non annulable" }, 409);
    if (new Date(booking.slot_start) < new Date()) return json({ error: "rendez-vous déjà passé" }, 409);

    // 1) Google Calendar — best-effort (le RDV reste annulable même si Google échoue).
    if (booking.google_event_id) {
      try {
        const { token: gToken, calendarId } = await getAccessToken(admin);
        await deleteEvent(gToken, calendarId, booking.google_event_id);
      } catch (e) {
        console.error("deleteEvent échoué:", e);
      }
    }

    // 2) Base : passe en cancelled (rouvre le créneau).
    await admin.from("bookings").update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancel_reason: "annulé par le client",
      google_event_id: null,
      google_event_link: null,
    }).eq("id", booking.id);

    // 3) Emails.
    const lang = (booking.locale === "en" ? "en" : "fr") as Lang;
    const { data: settings } = await admin.from("settings").select("practitioner_name, email").eq("id", 1).single();
    const practitioner = settings?.practitioner_name ?? "Dimitri Gauthier";
    const SITE = (Deno.env.get("SITE_URL") ?? "https://www.dimitrigauthier.com").replace(/\/$/, "");

    const conf = bookingCancelled(lang, {
      firstName: booking.client_first_name,
      when: fmtReunion(booking.slot_start, lang),
      practitioner,
      rebookUrl: `${SITE}/${lang}/experience`,
    });
    await sendEmail(admin, {
      to: booking.client_email, subject: conf.subject, html: conf.html,
      type: "booking_cancelled", booking_id: booking.id,
    });

    if (settings?.email) {
      const notif = practitionerBookingChange({
        kind: "cancelled",
        firstName: booking.client_first_name, lastName: booking.client_last_name,
        email: booking.client_email, phone: booking.client_phone ?? null,
        oldWhen: fmtReunion(booking.slot_start, "fr"),
      });
      await sendEmail(admin, {
        to: settings.email, subject: notif.subject, html: notif.html,
        type: "practitioner_booking_cancelled", booking_id: booking.id,
      });
    }

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
