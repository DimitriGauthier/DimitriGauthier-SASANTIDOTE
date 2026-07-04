// Client Supabase à privilèges service-role — SERVEUR UNIQUEMENT (route handlers).
// Ne jamais importer depuis un composant client. Renvoie null si non configuré.
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!env.supabaseUrl || !env.serviceRoleKey) return null;
  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
