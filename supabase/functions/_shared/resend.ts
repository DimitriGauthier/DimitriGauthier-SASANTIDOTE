import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Envoi d'un email via Resend + journalisation dans notifications_log.
export async function sendEmail(
  admin: SupabaseClient,
  opts: { to: string; subject: string; html: string; type: string; booking_id?: string; review_id?: string; contact_id?: string },
) {
  let providerId: string | null = null;
  let status = "sent";
  let error: string | null = null;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("MAIL_FROM") ?? "Dimitri Gauthier <contact@dimitrigauthier.com>",
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { status = "failed"; error = JSON.stringify(j); }
    providerId = j.id ?? null;
  } catch (e) {
    status = "failed";
    error = String(e);
  }
  await admin.from("notifications_log").insert({
    type: opts.type, channel: "email", to_email: opts.to, subject: opts.subject,
    provider_message_id: providerId, status, error,
    booking_id: opts.booking_id ?? null, review_id: opts.review_id ?? null, contact_id: opts.contact_id ?? null,
  });
  return { ok: status === "sent", providerId, error };
}
