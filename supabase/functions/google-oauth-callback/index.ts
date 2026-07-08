// google-oauth-callback — Reçoit le `code` de Google, l'échange contre les tokens,
// stocke le refresh_token dans google_credentials (id=1) puis renvoie vers l'admin.
// Public (verify_jwt=false) : c'est Google qui appelle cette URL (redirect_uri).
//
// Sécurité :
//   1) `state` signé (HMAC, 10 min) revérifié → anti-CSRF.
//   2) L'email du compte Google connecté doit correspondre au calendar_id déjà enregistré
//      → un tiers ne peut pas substituer SON agenda à celui de Dimitri.
//
// Retour : redirection vers /fr/admin/settings?google=<statut> (connected | wrong_account | …).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/supabase.ts";

const TOKEN_URL = "https://oauth2.googleapis.com/token";

// base64url (JWT / signature) → octets, avec padding tolérant.
function b64urlToBytes(s: string): Uint8Array {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  return Uint8Array.from(atob(norm), (c) => c.charCodeAt(0));
}

// Email du compte connecté, lu depuis le payload de l'id_token (aucun appel réseau).
function emailFromIdToken(idToken?: string): string | null {
  if (!idToken) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(idToken.split(".")[1])));
    return typeof payload.email === "string" ? payload.email : null;
  } catch { return null; }
}

async function verifyState(state: string | null, secret: string): Promise<boolean> {
  if (!state) return false;
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return false;
  const age = Date.now() - Number(payload);
  if (!(age >= 0 && age < 10 * 60_000)) return false; // 10 min
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"],
  );
  return await crypto.subtle.verify("HMAC", key, b64urlToBytes(sig), new TextEncoder().encode(payload));
}

serve(async (req) => {
  const url = new URL(req.url);
  const SITE = (Deno.env.get("SITE_URL") ?? "https://www.dimitrigauthier.com").replace(/\/$/, "");
  const back = (status: string) =>
    new Response(null, { status: 302, headers: { location: `${SITE}/fr/admin/settings?google=${status}` } });

  if (url.searchParams.get("error")) return back("refus"); // l'utilisateur a refusé l'accès
  const code = url.searchParams.get("code");
  if (!code) return back("missing_code");

  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!clientId || !clientSecret || !supabaseUrl) return back("config");

  if (!(await verifyState(url.searchParams.get("state"), clientSecret))) return back("state");

  try {
    const redirectUri = `${supabaseUrl}/functions/v1/google-oauth-callback`;
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: redirectUri, grant_type: "authorization_code",
      }),
    });
    const tj = await res.json();
    if (!res.ok) { console.error("échange token:", tj); return back("token"); }

    const email = emailFromIdToken(tj.id_token);
    const admin = adminClient();
    const { data: existing } = await admin.from("google_credentials").select("calendar_id").eq("id", 1).maybeSingle();

    // Anti-détournement : si un agenda est déjà lié, le compte connecté doit correspondre.
    const known = existing?.calendar_id && existing.calendar_id !== "primary" ? existing.calendar_id : null;
    if (known && email && known.toLowerCase() !== email.toLowerCase()) return back("wrong_account");

    // Sans refresh_token, impossible de rafraîchir hors-ligne (prompt=consent devrait l'éviter).
    if (!tj.refresh_token) return back("no_refresh");

    const tokenExpiry = new Date(Date.now() + Number(tj.expires_in ?? 3600) * 1000).toISOString();
    const { error: upErr } = await admin.from("google_credentials").upsert({
      id: 1,
      refresh_token: tj.refresh_token,
      access_token: tj.access_token ?? null,
      token_expiry: tokenExpiry,
      calendar_id: known ?? email ?? "primary",
      scope: tj.scope ?? null,
      connected_at: new Date().toISOString(),
    }, { onConflict: "id" });
    if (upErr) { console.error("sauvegarde creds:", upErr); return back("save"); }

    // Synchronise le drapeau d'affichage de l'admin.
    await admin.from("settings").update({ google_connected: true }).eq("id", 1);

    return back("connected");
  } catch (e) {
    console.error("callback erreur:", e);
    return back("error");
  }
});
