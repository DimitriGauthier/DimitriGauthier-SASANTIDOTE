// Admin — paramètres du site (singleton) + connexion Google Agenda.
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import { functionsBase } from "@/lib/env";
import SettingsForm from "@/components/admin/SettingsForm";

// Retour de la connexion Google (le callback redirige vers ?google=<statut>).
function googleStatus(l: Locale, code?: string): { tone: "ok" | "err"; text: string } | null {
  if (!code) return null;
  const ok = (fr: string, en: string) => ({ tone: "ok" as const, text: pick(l, fr, en) });
  const err = (fr: string, en: string) => ({ tone: "err" as const, text: pick(l, fr, en) });
  switch (code) {
    case "connected":
      return ok("Google Agenda connecté avec succès.", "Google Calendar connected successfully.");
    case "wrong_account":
      return err(
        "Compte Google inattendu. Reconnecte-toi avec le compte déjà associé à l'agenda.",
        "Unexpected Google account. Reconnect with the account already linked to the calendar.",
      );
    case "no_refresh":
      return err(
        "Connexion incomplète : révoque l'accès du site dans ton compte Google, puis reconnecte.",
        "Incomplete connection: revoke the site's access in your Google account, then reconnect.",
      );
    case "refus":
      return err("Connexion annulée.", "Connection cancelled.");
    default:
      return err("La connexion a échoué, réessaie.", "Connection failed, please try again.");
  }
}

export default async function AdminSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ google?: string }>;
}) {
  const { locale } = await params;
  const { google } = await searchParams;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);
  const { data } = await sb.from("settings").select("*").eq("id", 1).maybeSingle();

  const base = functionsBase();
  const googleStart = base ? `${base}/google-oauth-start` : null;
  const status = googleStatus(l, google);

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-medium text-foreground">{pick(l, "Paramètres", "Settings")}</h1>

      <section className="mb-10">
        <h2 className="mb-3 font-serif text-xl font-medium text-foreground">{pick(l, "Informations du site", "Site information")}</h2>
        <SettingsForm locale={l} initial={data ?? null} />
      </section>

      <section>
        <h2 className="mb-3 font-serif text-xl font-medium text-foreground">{pick(l, "Google Agenda", "Google Calendar")}</h2>
        {status ? (
          <div
            className={`mb-4 max-w-2xl rounded-xl border px-4 py-3 text-sm ${
              status.tone === "ok"
                ? "border-emerald-300/60 bg-emerald-50 text-emerald-800"
                : "border-red-300/60 bg-red-50 text-red-800"
            }`}
          >
            {status.text}
          </div>
        ) : null}
        <div className="max-w-2xl rounded-2xl border border-border/60 bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">
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
                className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:brightness-105"
              >
                {pick(l, "Connecter Google Agenda", "Connect Google Calendar")}
              </a>
            ) : (
              <span className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
                {pick(l, "Backend non configuré", "Backend not configured")}
              </span>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
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
