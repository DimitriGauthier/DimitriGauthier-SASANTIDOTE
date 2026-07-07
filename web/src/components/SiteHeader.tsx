"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  Brain,
  Compass,
  Sparkles,
  HeartHandshake,
  HelpCircle,
} from "lucide-react";
import { getDict, pick, type Locale } from "@/lib/i18n";
import { href, experienceHref, siteConfig, type NavKey } from "@/lib/site";
import type { PublicSettings } from "@/lib/types";
import LocaleSwitcher from "./LocaleSwitcher";

// Navigation cohérente : deux menus déroulants regroupent les pages proches,
// le reste en liens simples. On garde tout dans le menu mobile (organisé par blocs).
// Les entrées de sous-menu portent une icône + une accroche pour un rendu plus vivant.
type IconType = React.ComponentType<{ className?: string }>;
type SubItem = { key: NavKey; slug: string; icon: IconType; descFr: string; descEn: string };
type Entry =
  | { type: "link"; key: NavKey; slug: string }
  | { type: "menu"; id: string; labelFr: string; labelEn: string; items: SubItem[] };

const NAV: Entry[] = [
  { type: "link", key: "about", slug: "a-propos" },
  {
    type: "menu",
    id: "approche",
    labelFr: "Approche",
    labelEn: "Approach",
    items: [
      { key: "approach", slug: "mon-approche", icon: Brain, descFr: "Tête, corps & cœur", descEn: "Mind, body & heart" },
      { key: "numerology", slug: "numerologie-sexualite", icon: Compass, descFr: "Ton chemin en chiffres", descEn: "Your path in numbers" },
      { key: "trame", slug: "la-trame", icon: Sparkles, descFr: "Libérer les tensions", descEn: "Release tension" },
    ],
  },
  {
    type: "menu",
    id: "consultations",
    labelFr: "Consultations",
    labelEn: "Sessions",
    items: [
      { key: "services", slug: "accompagnements", icon: HeartHandshake, descFr: "Séances en visio", descEn: "Online sessions" },
      { key: "faq", slug: "faq", icon: HelpCircle, descFr: "Questions fréquentes", descEn: "Common questions" },
    ],
  },
  { type: "link", key: "reviews", slug: "avis" },
  { type: "link", key: "blog", slug: "blog" },
  { type: "link", key: "contact", slug: "contact" },
];

const linkClass =
  "text-[0.95rem] font-medium text-foreground/75 transition-colors hover:text-primary";

export default function SiteHeader({
  locale,
  settings,
}: {
  locale: Locale;
  settings: PublicSettings | null;
}) {
  const t = getDict(locale);
  const name = settings?.practitioner_name ?? siteConfig.practitionerName;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Barre transparente en haut de page ; le fond « verre dépoli » n'apparaît
  // qu'au défilement (ou menu mobile ouvert) pour rester lisible.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || open;

  return (
    <header className="sticky top-0 z-50 border-b border-transparent">
      {/* Fond doux qui n'apparaît qu'au défilement : verre dépoli + voile chaud + ombre douce.
          Séparé du contenu pour laisser le logo « flotter » par-dessus la barre. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 ${
          solid ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-card/70 backdrop-blur-xl backdrop-saturate-150" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--gold)/0.10)] via-transparent to-transparent" />
        <div className="absolute inset-0 shadow-[0_16px_44px_-24px_hsl(var(--deep)/0.28)]" />
        {/* Filet coloré en bas de barre pour le relief */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      </div>

      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        {/* Logo agrandi qui flotte par-dessus la barre (positionné en absolu → n'affecte
            pas la hauteur de la barre). Halo doux pour rester lisible sur toute image. */}
        <Link
          href={href(locale)}
          onClick={() => setOpen(false)}
          aria-label={name}
          className="group relative z-20 flex shrink-0 items-center"
        >
          <span
            aria-hidden
            className="block h-11 w-[152px] md:w-[184px] lg:w-[208px] xl:w-[248px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[190%] w-[128%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-xl"
            style={{
              background:
                "radial-gradient(closest-side, hsl(var(--background) / 0.85), hsl(var(--background) / 0.35) 55%, transparent 78%)",
            }}
          />
          <Image
            src="/img/logo.png"
            alt={name}
            width={1000}
            height={350}
            priority
            className="animate-float-soft pointer-events-none absolute left-0 top-1/2 h-14 w-auto max-w-none -translate-y-1/2 drop-shadow-[0_12px_24px_hsl(var(--primary)/0.28)] transition-transform duration-500 group-hover:scale-[1.03] md:h-16 lg:h-[4.5rem] xl:h-[5.5rem]"
          />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-x-6 lg:flex xl:gap-x-8">
          {NAV.map((entry) =>
            entry.type === "link" ? (
              <Link
                key={entry.slug}
                href={href(locale, entry.slug)}
                className={`story-link ${linkClass}`}
              >
                {t.nav[entry.key]}
              </Link>
            ) : (
              <div key={entry.id} className="group relative">
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 ${linkClass} group-hover:text-primary group-focus-within:text-primary`}
                >
                  {pick(locale, entry.labelFr, entry.labelEn)}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180" />
                </button>
                {/* Passerelle invisible (pt-3) pour ne pas perdre le survol */}
                <div className="invisible absolute left-1/2 top-full z-50 w-[19rem] -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-2 shadow-soft backdrop-blur-xl backdrop-saturate-150">
                    {entry.items.map((it) => {
                      const Icon = it.icon;
                      return (
                        <Link
                          key={it.slug}
                          href={href(locale, it.slug)}
                          className="group/item flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-primary/10"
                        >
                          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover/item:bg-primary group-hover/item:text-primary-foreground">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[0.92rem] font-medium text-foreground transition-colors group-hover/item:text-primary">
                              {t.nav[it.key]}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {pick(locale, it.descFr, it.descEn)}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <LocaleSwitcher current={locale} />
          <Link
            href={experienceHref(locale)}
            className="group hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-[hsl(var(--gold))] bg-[length:180%_auto] bg-left px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-500 hover:-translate-y-0.5 hover:bg-right hover:shadow-[0_16px_36px_-12px_hsl(var(--primary)/0.5)] sm:inline-flex"
          >
            <Sparkles className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-12" />
            {t.nav.book}
          </Link>
          {/* Bouton menu mobile */}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/60 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant — organisé par blocs cohérents, avec icônes */}
      {open && (
        <div className="glass relative border-t border-border/60 lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {NAV.map((entry) =>
              entry.type === "link" ? (
                <Link
                  key={entry.slug}
                  href={href(locale, entry.slug)}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-base font-medium text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {t.nav[entry.key]}
                </Link>
              ) : (
                <div key={entry.id} className="mt-1">
                  <p className="px-3 pb-1 pt-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {pick(locale, entry.labelFr, entry.labelEn)}
                  </p>
                  {entry.items.map((it) => {
                    const Icon = it.icon;
                    return (
                      <Link
                        key={it.slug}
                        href={href(locale, it.slug)}
                        onClick={() => setOpen(false)}
                        className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-primary/10"
                      >
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover/item:bg-primary group-hover/item:text-primary-foreground">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-base font-medium text-foreground/85 group-hover/item:text-primary">
                            {t.nav[it.key]}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {pick(locale, it.descFr, it.descEn)}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ),
            )}
            <Link
              href={experienceHref(locale)}
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-[hsl(var(--gold))] px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              <Sparkles className="h-4 w-4" />
              {t.nav.book}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
