// stripe-webhook — Réception des événements Stripe.
// checkout.session.completed => paiement OK => on crée l'événement Google (invitation .ics au client),
//   passe le RDV en "scheduled", et notifie client + Dimitri.
// checkout.session.expired / async_payment_failed => paiement KO => hold libéré.
// Public (verify_jwt=false) — la sécurité vient de la signature Stripe.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14?target=deno";
import { adminClient } from "../_shared/supabase.ts";
import { getAccessToken, createEvent } from "../_shared/google.ts";
import { sendEmail } from "../_shared/resend.ts";
import { bookingConfirmation, practitionerNewBooking, fmtReunion, Lang } from "../_shared/emails.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2024-06-20",
});

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig!, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
  } catch (e) {
    return new Response("signature invalide: " + String(e), { status: 400 });
  }

  const admin = adminClient();

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      if (!bookingId) return new Response("ok (sans booking_id)", { status: 200 });

      // Paiement -> payé (idempotent via stripe_session_id)
      await admin.from("payments").update({
        status: "paid",
        stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
        paid_at: new Date().toISOString(),
        raw: session as unknown as Record<string, unknown>,
      }).eq("stripe_session_id", session.id);

      const { data: booking } = await admin.from("bookings").select("*").eq("id", bookingId).single();
      if (!booking) return new Response("ok (booking introuvable)", { status: 200 });
      if (booking.status === "scheduled") return new Response("ok (déjà planifié)", { status: 200 }); // idempotent

      // Événement Google Calendar (le client est invité => Google envoie l'.ics)
      let googleEventId: string | null = null;
      let googleLink: string | null = null;
      try {
        const { data: service } = await admin.from("services").select("title, location_type").eq("id", booking.service_id).single();
        const { token, calendarId } = await getAccessToken(admin);
        const ev = await createEvent(token, calendarId, {
          summary: `${service?.title ?? "RDV"} — ${booking.client_first_name} ${booking.client_last_name}`,
          description: `Réservation via le site.\nProfil: ${booking.audience}\nTél: ${booking.client_phone ?? "—"}\nRéf: ${booking.token}`,
          start: { dateTime: booking.slot_start, timeZone: booking.timezone ?? "Indian/Reunion" },
          end: { dateTime: booking.slot_end, timeZone: booking.timezone ?? "Indian/Reunion" },
          attendees: [{ email: booking.client_email, displayName: `${booking.client_first_name} ${booking.client_last_name}` }],
          reminders: { useDefault: true },
        });
        googleEventId = ev.id ?? null;
        googleLink = ev.htmlLink ?? null;
      } catch (e) {
        console.error("createEvent échoué:", e); // le RDV reste valide même si Google échoue
      }

      await admin.from("bookings").update({
        status: "scheduled",
        hold_expires_at: null,
        google_event_id: googleEventId,
        google_event_link: googleLink,
      }).eq("id", bookingId);

      const lang = (booking.locale === "en" ? "en" : "fr") as Lang;
      const { data: settings } = await admin.from("settings").select("practitioner_name, email").eq("id", 1).single();
      const practitioner = settings?.practitioner_name ?? "Dimitri Gauthier";
      const SITE = (Deno.env.get("SITE_URL") ?? "https://www.dimitrigauthier.com").replace(/\/$/, "");
      const manageUrl = `${SITE}/${lang}/rdv/${booking.token}`;

      // Email de confirmation au client (dans sa langue) — avec bouton « Gérer mon rendez-vous »
      const conf = bookingConfirmation(lang, { firstName: booking.client_first_name, when: fmtReunion(booking.slot_start, lang), practitioner, manageUrl });
      await sendEmail(admin, {
        to: booking.client_email,
        subject: conf.subject,
        type: "booking_confirmation",
        booking_id: bookingId,
        html: conf.html,
      });

      // Notification à Dimitri (toujours en FR) — nouveau RDV + paiement confirmé
      if (settings?.email) {
        const montant = new Intl.NumberFormat("fr-FR", {
          style: "currency", currency: booking.currency ?? "EUR",
        }).format((booking.price_cents ?? 0) / 100);
        const notif = practitionerNewBooking({
          firstName: booking.client_first_name,
          lastName: booking.client_last_name,
          email: booking.client_email,
          phone: booking.client_phone ?? null,
          audience: booking.audience,
          when: fmtReunion(booking.slot_start, "fr"),
          amount: montant,
          lang,
        });
        await sendEmail(admin, {
          to: settings.email,
          subject: notif.subject,
          type: "practitioner_new_booking",
          booking_id: bookingId,
          html: notif.html,
        });
      }
    }

    if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      await admin.from("payments").update({ status: "failed" }).eq("stripe_session_id", session.id);
      if (bookingId) {
        await admin.from("bookings")
          .update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancel_reason: "paiement non finalisé" })
          .eq("id", bookingId).eq("status", "hold"); // ne touche pas un RDV déjà planifié
      }
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("webhook erreur:", e);
    return new Response("erreur interne", { status: 500 });
  }
});
