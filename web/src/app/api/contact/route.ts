// Route handler du formulaire de contact — insert via service-role (server-only).
// Défensif : si Supabase n'est pas câblé, on renvoie 202 (accepté) pour ne pas casser l'UX de dev.
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { env, functionsBase } from "@/lib/env";

// Notifie Dimitri du nouveau message (edge function Resend). Non bloquant :
// une panne d'email ne doit jamais casser l'envoi du formulaire côté visiteur.
async function notifyPractitioner(contactId: string) {
  const base = functionsBase();
  if (!base) return;
  try {
    await fetch(`${base}/contact-notify`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: env.supabaseAnonKey,
        authorization: `Bearer ${env.serviceRoleKey || env.supabaseAnonKey}`,
      },
      body: JSON.stringify({ contact_id: contactId }),
    });
  } catch {
    // silencieux : le message est déjà enregistré et visible dans l'espace admin.
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const phone = body.phone ? String(body.phone).trim() : null;
  const subject = body.subject ? String(body.subject).trim() : null;

  if (!name || !email || !message) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "message_too_long" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    // Pas encore câblé : on accepte sans persister (mode dev/placeholder).
    return NextResponse.json({ ok: true, persisted: false }, { status: 202 });
  }

  const { data: inserted, error } = await sb
    .from("contact_messages")
    .insert({ name, email, phone, subject, message })
    .select("id")
    .single();

  if (error || !inserted) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // Email d'information à Dimitri (attendu mais tolérant aux pannes).
  await notifyPractitioner(inserted.id as string);

  return NextResponse.json({ ok: true, persisted: true }, { status: 201 });
}
