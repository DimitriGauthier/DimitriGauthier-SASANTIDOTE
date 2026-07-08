// contact-notify — Notifie Dimitri par email d'un nouveau message du formulaire de contact.
// Reçoit { contact_id }, relit le message en base (service-role, donc contenu non falsifiable),
// envoie l'email via Resend puis journalise dans notifications_log.
// Public (verify_jwt=false) : appelé côté serveur par la route Next /api/contact après insertion.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { cors, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/supabase.ts";
import { sendEmail } from "../_shared/resend.ts";
import { contactMessage } from "../_shared/emails.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { contact_id } = await req.json().catch(() => ({}));
    if (!contact_id) return json({ error: "contact_id requis" }, 400);

    const admin = adminClient();

    // On relit le message en base : le contenu de l'email ne peut donc pas être injecté via le payload.
    const { data: msg, error } = await admin
      .from("contact_messages")
      .select("id, name, email, phone, subject, message")
      .eq("id", contact_id)
      .single();
    if (error || !msg) return json({ error: "message introuvable" }, 404);

    // Adresse de notification de Dimitri (table settings, ligne unique id=1).
    const { data: settings } = await admin.from("settings").select("email").eq("id", 1).single();
    if (!settings?.email) return json({ ok: false, reason: "email praticien non configuré" }, 200);

    const mail = contactMessage({
      name: msg.name,
      email: msg.email,
      phone: msg.phone ?? null,
      subject: msg.subject ?? null,
      message: msg.message,
    });

    const r = await sendEmail(admin, {
      to: settings.email,
      subject: mail.subject,
      html: mail.html,
      type: "contact",
      contact_id: msg.id,
    });

    return json({ ok: r.ok });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
