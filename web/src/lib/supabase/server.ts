// Client Supabase côté serveur (RSC / route handlers) via @supabase/ssr + cookies.
// Renvoie null si non configuré : les pages affichent un état vide propre.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, supabaseConfigured } from "@/lib/env";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSupabaseServer(): Promise<SupabaseClient | null> {
  if (!supabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // setAll appelé depuis un RSC en lecture seule : ignoré (le middleware rafraîchit la session).
        }
      },
    },
  });
}
