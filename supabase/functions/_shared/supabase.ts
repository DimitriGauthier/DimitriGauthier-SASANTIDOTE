import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Client service-role (bypass RLS) — à n'utiliser QUE côté serveur (Edge Functions).
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

// Vérifie que l'appelant (via son JWT) est un admin enregistré.
export async function requireAdmin(req: Request, admin: SupabaseClient): Promise<string> {
  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!jwt) throw new Error("non authentifié");
  const { data: { user }, error } = await admin.auth.getUser(jwt);
  if (error || !user) throw new Error("jeton invalide");
  const { data } = await admin.from("app_admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) throw new Error("accès refusé");
  return user.id;
}
