// send-reminders — Rappel automatique ~14h avant le RDV (email brandé au client).
// Déclenchement attendu : tâche planifiée (pg_cron / Scheduled Functions), ex. toutes les 15 min.
//   Protégé par un secret partagé (SEND_REMINDERS_SECRET) si défini.
// Idempotent : un rappel n'est envoyé qu'une fois (reminder_sent_at posé, en amont, atomiquement).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { cors, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/supabase.ts";
import { sendEmail } from "../_shared/resend.ts";
import { bookingReminder, fmtReunion, Lang } from "../_shared/emails.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const secret = Deno.env.get("SEND_REMINDERS_SECRET");
  if (secret) {
    const provided = req.headers.get("x-cron-secret") ??
      req.headers.get("Authorization")?.replace("Bearer ", "");
    if (provided !== secret) return json({ error: "non autorisé" }, 401);
  }

  try {
    const admin = adminClient();
    const hours = Number(Deno.env.get("REMINDER_HOURS") ?? "14");
    const now = new Date();
    const until = new Date(now.getTime() + hours * 3600_000);

    // RDV confirmés, à venir dans la fenêtre, sans rappel déjà envoyé.
    const { data: due, error } = await admin
      .from("bookings")
      .select("id, token, locale, client_first_name, client_email, slot_start")
      .eq("status", "scheduled")
      .is("reminder_sent_at", null)
      .gt("slot_start", now.toISOString())
      .lte("slot_start", until.toISOString());
    if (error) return json({ error: error.message }, 500);
    if (!due?.length) return json({ sent: 0 });

    const { data: settings } = await admin.from("settings").select("practitioner_name").eq("id", 1).single();
    const practitioner = settings?.practitioner_name ?? "Dimitri Gauthier";
    const SITE = (Deno.env.get("SITE_URL") ?? "https://www.dimitrigauthier.com").replace(/\/$/, "");

    let sent = 0;
    for (const b of due) {
      // Verrou anti-doublon : on pose le drapeau AVANT l'envoi, de façon atomique.
      const { data: claimed } = await admin
        .from("bookings")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", b.id)
        .is("reminder_sent_at", null)
        .select("id");
      if (!claimed?.length) continue; // déjà pris par un run concurrent

      const lang = (b.locale === "en" ? "en" : "fr") as Lang;
      const msg = bookingReminder(lang, {
        firstName: b.client_first_name,
        when: fmtReunion(b.slot_start, lang),
        practitioner,
        manageUrl: `${SITE}/${lang}/rdv/${b.token}`,
      });
      await sendEmail(admin, {
        to: b.client_email, subject: msg.subject, html: msg.html,
        type: "reminder_14h", booking_id: b.id,
      });
      sent++;
    }

    return json({ sent });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
