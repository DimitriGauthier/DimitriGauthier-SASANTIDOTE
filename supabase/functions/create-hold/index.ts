// create-hold — Pose un "hold" (réservation provisoire) + crée le paiement Stripe.
// Ordre voulu: le client choisit un créneau -> on bloque 10 min -> il paie ->
// l'événement Google n'est créé QUE si le paiement réussit (webhook). Paiement abandonné = créneau libéré.
// Public (verify_jwt=false). Écrit via service-role.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14?target=deno";
import { cors, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/supabase.ts";

const HOLD_MINUTES = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const body = await req.json().catch(() => ({}));
    const { service_id, topic_id, audience, slot_start, client, answers, consent_rgpd, locale } = body;

    // --- Validation minimale ---
    if (!service_id || !slot_start) return json({ error: "service_id et slot_start requis" }, 400);
    if (!client?.first_name || !client?.last_name || !client?.email) return json({ error: "coordonnées client incomplètes" }, 400);
    if (!consent_rgpd) return json({ error: "consentement RGPD requis" }, 400);

    const admin = adminClient();

    const { data: service, error: sErr } = await admin
      .from("services").select("*").eq("id", service_id).eq("is_active", true).single();
    if (sErr || !service) return json({ error: "service introuvable" }, 404);

    const start = new Date(slot_start);
    const end = new Date(start.getTime() + service.duration_min * 60_000);

    // Anti-réservation trop proche
    const { data: settings } = await admin.from("settings").select("min_notice_hours").eq("id", 1).single();
    const notBefore = new Date(Date.now() + (settings?.min_notice_hours ?? 24) * 3600_000);
    if (start < notBefore) return json({ error: "créneau trop proche" }, 409);

    const aud = (audience && ["homme", "femme", "couple"].includes(audience)) ? audience : "tous";
    const lang = locale === "en" ? "en" : "fr";
    const holdExpires = new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString();

    // --- Insertion du hold (la contrainte d'exclusion garantit l'anti-doublon) ---
    const { data: booking, error: bErr } = await admin.from("bookings").insert({
      audience: aud,
      service_id,
      topic_id: topic_id ?? null,
      status: "hold",
      hold_expires_at: holdExpires,
      slot_start: start.toISOString(),
      slot_end: end.toISOString(),
      locale: lang,
      client_first_name: client.first_name,
      client_last_name: client.last_name,
      client_email: client.email,
      client_phone: client.phone ?? null,
      client_note: client.note ?? null,
      price_cents: service.price_cents,
      currency: service.currency,
      consent_rgpd: true,
    }).select().single();

    if (bErr) {
      if ((bErr as { code?: string }).code === "23P01") return json({ error: "créneau déjà réservé" }, 409);
      return json({ error: bErr.message }, 400);
    }

    // --- Réponses au questionnaire (libellés figés) ---
    if (Array.isArray(answers) && answers.length) {
      const rows = answers.map((a: { question_id?: string; label: string; value: unknown }) => ({
        booking_id: booking.id,
        question_id: a.question_id ?? null,
        question_label_snapshot: a.label,
        answer_text: typeof a.value === "string" ? a.value : null,
        answer_json: typeof a.value === "string" ? null : a.value,
      }));
      await admin.from("booking_answers").insert(rows);
    }

    // --- Stripe Checkout (paiement total obligatoire) ---
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: "2024-06-20",
    });
    const SITE = Deno.env.get("SITE_URL") ?? "https://www.dimitrigauthier.com";
    const productName = (lang === "en" && service.title_en) ? service.title_en : service.title;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: lang, // langue de la page de paiement Stripe
      customer_email: client.email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: (service.currency ?? "eur").toLowerCase(),
          unit_amount: service.price_cents,
          product_data: { name: productName },
        },
      }],
      metadata: { booking_id: booking.id, booking_token: booking.token },
      // Pas d'expires_at Stripe (min 30 min) : notre hold de 10 min + cron expire-holds font foi.
      success_url: `${SITE}/${lang}/reservation/confirmee?token=${booking.token}`,
      cancel_url: `${SITE}/${lang}/reservation/annulee?token=${booking.token}`,
    });

    await admin.from("payments").insert({
      booking_id: booking.id,
      stripe_session_id: session.id,
      amount_cents: service.price_cents,
      currency: service.currency,
      status: "created",
    });

    return json({ checkout_url: session.url, booking_token: booking.token, hold_expires_at: holdExpires });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
