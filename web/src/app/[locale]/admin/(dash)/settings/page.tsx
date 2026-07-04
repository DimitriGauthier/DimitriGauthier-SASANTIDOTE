// Admin — paramètres du site (singleton) + connexion Google Agenda.
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import { functionsBase } from "@/lib/env";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);
  const { data } = await sb.from("settings").select("*").eq("id", 1).maybeSingle();

  const base = functionsBase();
  // Démarrage OAuth Google (Edge Function à câbler côté backend). Non actif tant que non configuré.
  const googleStart = base ? `${base}/google-oauth-start` : null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">{pick(l, "Paramètres", "Settings")}</h1>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">{pick(l, "Informations du site", "Site information")}</h2>
        <SettingsForm locale={l} initial={data ?? null} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{pick(l, "Google Agenda", "Google Calendar")}</h2>
        <div className="max-w-2xl rounded-lg border border-neutral-200 p-5">
          <p className="text-sm text-neutral-600">
            {pick(
              l,
              "La connexion à Google Agenda permet de lire tes disponibilités et de créer les événements de rendez-vous. Elle s'effectue via une autorisation Google (OAuth).",
              "Connecting Google Calendar lets the site read your availability and create appointment events. It is set up via a Google authorization (OAuth).",
            )}
          </p>
          <div className="mt-4">
            {googleStart ? (
              <a
                href={googleStart}
                className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
              >
                {pick(l, "Connecter Google Agenda", "Connect Google Calendar")}
              </a>
            ) : (
              <span className="inline-flex items-center rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-400">
                {pick(l, "Backend non configuré", "Backend not configured")}
              </span>
            )}
          </div>
          <p className="mt-3 text-xs text-neutral-400">
            {pick(
              l,
              "Note technique : le jeton de rafraîchissement est stocké côté serveur (Supabase Vault) et n'est jamais exposé au navigateur.",
              "Technical note: the refresh token is stored server-side (Supabase Vault) and is never exposed to the browser.",
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
