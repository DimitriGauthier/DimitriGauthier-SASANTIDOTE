// complete-booking — Action admin "Terminé".
// Dimitri clique "Terminé" sur un RDV honoré => statut completed + création d'un avis "invited"
//   + envoi de l'email d'invitation à déposer un avis (lien /avis/{invite_token}).
// Protégé (verify_jwt=true) + vérification app_admins.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { cors, json } from "../_shared/cors.ts";
import { adminClient, requireAdmin } from "../_shared/supabase.ts";
import { sendEmail } from "../_shared/resend.ts";
import { reviewInvite, Lang } from "../_shared/emails.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const admin = adminClient();
    await requireAdmin(req, admin); // lève une erreur si non admin

    const { booking_id } = await req.json().catch(() => ({}));
    if (!booking_id) return json({ error: "booking_id requis" }, 400);

    const { data: booking, error } = await admin.from("bookings").select("*").eq("id", booking_id).single();
    if (error || !booking) return json({ error: "RDV introuvable" }, 404);
    if (booking.status === "completed") {
      const { data: existing } = await admin.from("reviews").select("invite_token").eq("booking_id", booking_id).maybeSingle();
      return json({ ok: true, already: true, review_token: existing?.invite_token ?? null }); // idempotent
    }
    if (booking.status !== "scheduled") return json({ error: `RDV non planifié (statut: ${booking.status})` }, 409);

    // 1) Marquer terminé
    await admin.from("bookings")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", booking_id);

    // 2) Créer l'invitation d'avis
    const { data: review, error: rErr } = await admin.from("reviews").insert({
      booking_id,
      client_display_name: booking.client_first_name,
      status: "invited",
    }).select("invite_token").single();
    if (rErr) return json({ error: "création avis: " + rErr.message }, 400);

    // 3) Email d'invitation à laisser un avis (dans la langue du client)
    const SITE = Deno.env.get("SITE_URL") ?? "https://www.dimitrigauthier.com";
    const { data: settings } = await admin.from("settings").select("practitioner_name").eq("id", 1).single();
    const lang = (booking.locale === "en" ? "en" : "fr") as Lang;
    const link = `${SITE}/${lang}/avis/${review.invite_token}`;
    const tpl = reviewInvite(lang, {
      firstName: booking.client_first_name,
      link,
      practitioner: settings?.practitioner_name ?? "Dimitri Gauthier",
    });
    await sendEmail(admin, {
      to: booking.client_email,
      subject: tpl.subject,
      type: "review_invite",
      booking_id,
      html: tpl.html,
    });

    return json({ ok: true, review_url: link });
  } catch (e) {
    const msg = String(e);
    const status = /non authentifié|jeton invalide|accès refusé/.test(msg) ? 401 : 500;
    return json({ error: msg }, status);
  }
});
