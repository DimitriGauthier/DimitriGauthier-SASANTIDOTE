// Accès centralisé aux variables d'environnement (côté public NEXT_PUBLIC_*).
// L'app doit fonctionner même si tout est vide (mode "pas encore câblé").

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  functionsUrl: process.env.NEXT_PUBLIC_FUNCTIONS_URL ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr",
  // Serveur uniquement — jamais exposé au client (pas de préfixe NEXT_PUBLIC_).
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
};

/** True quand Supabase est configuré (URL + clé anon). */
export function supabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

/** Base URL des Edge Functions. */
export function functionsBase(): string {
  if (env.functionsUrl) return env.functionsUrl.replace(/\/$/, "");
  if (env.supabaseUrl) return `${env.supabaseUrl.replace(/\/$/, "")}/functions/v1`;
  return "";
}
