// google-oauth-start — Démarre la connexion OAuth Google Agenda (redirige vers Google).
// Public (verify_jwt=false) : ouvert par un simple lien <a> depuis l'espace admin
//   (une navigation navigateur ne peut pas porter le JWT admin).
// Sécurité : on émet un `state` SIGNÉ (HMAC, valable 10 min) revérifié au callback,
//   et le callback n'accepte QUE le compte dont l'email correspond au calendar_id déjà
//   enregistré → un tiers ne peut pas brancher SON agenda à la place de Dimitri.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { adminClient } from "../_shared/supabase.ts";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
// calendar : lire les dispos (FreeBusy) + créer/modifier/supprimer les événements.
// openid+email : connaître le compte connecté (contrôle anti-détournement au callback).
const SCOPES = ["https://www.googleapis.com/auth/calendar", "openid", "email"].join(" ");

// State signé et URL-safe : "<timestamp>.<hmac base64url>" — sans stockage serveur.
async function signState(secret: string): Promise<string> {
  const payload = String(Date.now());
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const b64url = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${payload}.${b64url}`;
}

serve(async () => {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!clientId || !clientSecret || !supabaseUrl) {
    return new Response("Configuration Google incomplète (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / SUPABASE_URL).", { status: 500 });
  }

  // Pré-remplit le bon compte Google si on en connaît déjà un (confort, non contraignant).
  let loginHint: string | null = null;
  try {
    const { data } = await adminClient().from("google_credentials").select("calendar_id").eq("id", 1).maybeSingle();
    if (data?.calendar_id && data.calendar_id !== "primary") loginHint = data.calendar_id;
  } catch { /* best-effort */ }

  const redirectUri = `${supabaseUrl}/functions/v1/google-oauth-callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",       // pour obtenir un refresh_token
    prompt: "consent",            // force le renvoi du refresh_token même en re-consentement
    include_granted_scopes: "true",
    state: await signState(clientSecret),
  });
  if (loginHint) params.set("login_hint", loginHint);

  return new Response(null, { status: 302, headers: { location: `${GOOGLE_AUTH}?${params.toString()}` } });
});
