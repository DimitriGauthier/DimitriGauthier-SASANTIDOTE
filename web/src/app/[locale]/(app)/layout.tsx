// Layout « application » plein écran pour l'expérience INTIMY (sous-domaine intimy.).
// Volontairement dépouillé : pas de menu ni de footer riche — immersif, comme une app.
import Link from "next/link";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { siteConfig, mainSiteHref } from "@/lib/site";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import FloatingHearts from "@/components/FloatingHearts";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-soft">
      {/* Cœurs flottants (au-dessus du fond dégradé, sous le contenu en z-10) */}
      <FloatingHearts zIndex={1} />

      {/* Décor discret */}
      <span aria-hidden className="blob animate-blob absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/15" />
      <span
        aria-hidden
        className="blob animate-blob absolute -right-20 bottom-8 h-80 w-80 rounded-full bg-gold/15"
        style={{ animationDelay: "-6s" }}
      />

      {/* Barre minimale */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href={mainSiteHref(l)} className="font-serif text-lg font-medium text-foreground">
          {siteConfig.practitionerName}
        </Link>
        <div className="flex items-center gap-4">
          <LocaleSwitcher current={l} />
          <Link href={mainSiteHref(l)} className="story-link text-sm text-muted-foreground">
            {pick(l, "Retour au site", "Back to site")}
          </Link>
        </div>
      </header>

      {/* Contenu */}
      <main className="relative z-10 flex flex-1 items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full">{children}</div>
      </main>

      {/* Réassurance */}
      <footer className="relative z-10 px-5 py-5 text-center text-xs text-muted-foreground">
        {pick(
          l,
          "Confidentiel · Paiement sécurisé · Sans engagement",
          "Confidential · Secure payment · No commitment",
        )}
      </footer>
    </div>
  );
}
