// Route handler — dépôt d'avis via lien à token. Insert/maj via service-role (server-only).
// L'avis passe en statut "submitted" ; la publication reste une action de modération (admin).
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const token = String(body.token ?? "").trim();
  const rating = Number(body.rating);
  const comment = body.comment ? String(body.comment).trim() : null;
  const displayName = body.display_name ? String(body.display_name).trim() : null;

  if (!token) return NextResponse.json({ error: "missing_token" }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "invalid_rating" }, { status: 400 });
  }
  if (comment && comment.length > 3000) {
    return NextResponse.json({ error: "comment_too_long" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    // Pas encore câblé : on accepte sans persister (mode dev/placeholder).
    return NextResponse.json({ ok: true, persisted: false }, { status: 202 });
  }

  // On ne met à jour que les avis encore "invited" (anti-rejeu).
  const { data, error } = await sb
    .from("reviews")
    .update({
      rating,
      comment,
      client_display_name: displayName,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("invite_token", token)
    .eq("status", "invited")
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "invalid_or_used" }, { status: 409 });

  return NextResponse.json({ ok: true, persisted: true }, { status: 200 });
}
