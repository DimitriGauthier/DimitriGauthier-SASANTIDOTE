// Garde d'accès à l'espace admin (RSC). S'appuie sur la session cookie + is_admin() (RPC).
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";

export type AdminContext = { sb: SupabaseClient; user: User };

/** Renvoie le contexte admin si l'utilisateur est connecté ET admin, sinon null. */
export async function getAdminContext(): Promise<AdminContext | null> {
  const sb = await getSupabaseServer();
  if (!sb) return null;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await sb.rpc("is_admin");
  if (!isAdmin) return null;
  return { sb, user };
}

/** Exige un admin ; sinon redirige vers la page de connexion. */
export async function requireAdmin(locale: string): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) redirect(`/${locale}/admin/login`);
  return ctx;
}
