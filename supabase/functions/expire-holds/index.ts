// expire-holds — Libère les réservations « hold » expirées.
// Un hold pose un verrou anti-chevauchement (contrainte gist sur status in ('hold','scheduled')).
// S'il n'est pas payé avant hold_expires_at, il faut le passer en 'cancelled' pour rouvrir le créneau.
//
// Déclenchement attendu : tâche planifiée (pg_cron / Supabase Scheduled Functions), ~toutes les minutes.
//   Aucune écriture publique : protégé par un secret partagé (EXPIRE_HOLDS_SECRET) si défini.
//
// Idempotent : ne touche que les holds réellement expirés ; peut être rejoué sans effet de bord.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { cors, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // Garde optionnelle : si EXPIRE_HOLDS_SECRET est défini, exiger un header correspondant.
  const secret = Deno.env.get("EXPIRE_HOLDS_SECRET");
  if (secret) {
    const provided = req.headers.get("x-cron-secret") ??
      req.headers.get("Authorization")?.replace("Bearer ", "");
    if (provided !== secret) return json({ error: "non autorisé" }, 401);
  }

  try {
    const admin = adminClient();
    const nowIso = new Date().toISOString();

    // Passe en 'cancelled' tous les holds dont le délai est dépassé.
    const { data: released, error } = await admin
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: nowIso,
        cancel_reason: "hold_expired",
      })
      .eq("status", "hold")
      .lt("hold_expires_at", nowIso)
      .select("id");
    if (error) return json({ error: error.message }, 500);

    const ids = (released ?? []).map((b) => b.id);

    // Marque les paiements associés jamais réglés comme 'failed' (nettoyage, best-effort).
    if (ids.length) {
      await admin
        .from("payments")
        .update({ status: "failed" })
        .in("booking_id", ids)
        .eq("status", "created");
    }

    return json({ released: ids.length, ids });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
