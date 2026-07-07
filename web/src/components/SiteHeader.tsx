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

  // La pilule reste translucide en haut de page ; son fond « verre dépoli »
  // s'intensifie au défilement (ou menu mobile ouvert) pour rester lisible.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || open;

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-3 pt-3 sm:px-4 sm:pt-4">
        {/* Barre « pilule » flottante aux bords arrondis : verre dépoli, teinte chaude
            et léger relief. Le fond s'intensifie au défilement. */}
        <div
          className={`relative flex items-center justify-between gap-2 rounded-full border py-2 pl-4 pr-2 backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ${
            solid
              ? "border-border/50 bg-card/85 shadow-[0_18px_50px_-20px_hsl(var(--deep)/0.34)] ring-1 ring-white/45"
              : "border-border/35 bg-card/55 shadow-[0_12px_40px_-22px_hsl(var(--deep)/0.26)] ring-1 ring-white/25"
          }`}
        >
          {/* Reflet doux en haut + soupçon des couleurs de la marque pour le relief */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 rounded-full bg-gradient-to-b from-white/45 via-transparent to-transparent"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 rounded-full bg-gradient-to-r from-[hsl(var(--primary)/0.05)] via-transparent to-[hsl(var(--gold)/0.08)]"
          />

          {/* Logo posé sur la barre (descendu et intégré, plus de gros logo flottant) */}
          <Link
            href={href(locale)}
            onClick={() => setOpen(false)}
            aria-label={name}
            className="group relative z-10 flex shrink-0 items-center"
          >
            <Image
              src="/img/logo.png"
              alt={name}
              width={1000}
              height={350}
              priority
              className="h-9 w-auto drop-shadow-[0_8px_18px_hsl(var(--primary)/0.22)] transition-transform duration-500 group-hover:scale-[1.04] sm:h-10 lg:h-12"
            />
          </Link>

          {/* Nav desktop */}
          <nav className="relative z-10 hidden items-center gap-x-5 lg:flex xl:gap-x-7">
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
                  {/* Passerelle invisible (pt-4) pour ne pas perdre le survol sous la pilule */}
                  <div className="invisible absolute left-1/2 top-full z-50 w-[19rem] -translate-x-1/2 translate-y-1 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/95 p-2 shadow-soft backdrop-blur-xl backdrop-saturate-150">
                      {entry.items.map((it) => {
                        const Icon = it.icon;
                        return (
                          <Link
                            key={it.slug}
                            href={href(locale, it.slug)}
                            className="group/item flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-primary/10"
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

          <div className="relative z-10 flex items-center gap-2 md:gap-2.5">
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/70 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted lg:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile — panneau arrondi flottant sous la pilule, organisé par blocs */}
      {open && (
        <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:hidden">
          <div className="mt-2 overflow-hidden rounded-3xl border border-border/50 bg-card/90 shadow-[0_22px_54px_-22px_hsl(var(--deep)/0.34)] backdrop-blur-xl backdrop-saturate-150">
            <nav className="flex flex-col gap-1 p-3">
              {NAV.map((entry) =>
                entry.type === "link" ? (
                  <Link
                    key={entry.slug}
                    href={href(locale, entry.slug)}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-3 py-2.5 text-base font-medium text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
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
                          className="group/item flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-primary/10"
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
        </div>
      )}
    </header>
  );
}
