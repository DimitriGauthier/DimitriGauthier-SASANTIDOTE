"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { getDict, pick, type Locale } from "@/lib/i18n";
import { href, experienceHref, siteConfig, type NavKey } from "@/lib/site";
import type { PublicSettings } from "@/lib/types";
import LocaleSwitcher from "./LocaleSwitcher";

// Navigation cohérente : deux menus déroulants regroupent les pages proches,
// le reste en liens simples. On garde tout dans le menu mobile (organisé par blocs).
type Entry =
  | { type: "link"; key: NavKey; slug: string }
  | { type: "menu"; id: string; labelFr: string; labelEn: string; items: { key: NavKey; slug: string }[] };

const NAV: Entry[] = [
  { type: "link", key: "about", slug: "a-propos" },
  {
    type: "menu",
    id: "approche",
    labelFr: "Approche",
    labelEn: "Approach",
    items: [
      { key: "approach", slug: "mon-approche" },
      { key: "numerology", slug: "numerologie-sexualite" },
      { key: "trame", slug: "la-trame" },
    ],
  },
  {
    type: "menu",
    id: "consultations",
    labelFr: "Consultations",
    labelEn: "Sessions",
    items: [
      { key: "services", slug: "accompagnements" },
      { key: "faq", slug: "faq" },
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
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        solid
          ? "glass border-b border-border/60"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href={href(locale)}
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/img/logo.png"
            alt={name}
            width={160}
            height={56}
            priority
            className="h-11 w-auto md:h-12"
          />
          <span className="sr-only">{name}</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-x-7 lg:flex">
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
                <div className="invisible absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="glass overflow-hidden rounded-2xl border border-border/60 p-1.5 shadow-soft">
                    {entry.items.map((it) => (
                      <Link
                        key={it.slug}
                        href={href(locale, it.slug)}
                        className="block rounded-xl px-3.5 py-2.5 text-[0.95rem] font-medium text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        {t.nav[it.key]}
                      </Link>
                    ))}
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
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 sm:inline-flex"
          >
            {t.nav.book}
          </Link>
          {/* Bouton menu mobile */}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-foreground transition-colors hover:bg-muted lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant — organisé par blocs cohérents */}
      {open && (
        <div className="glass border-t border-border/60 lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {NAV.map((entry) =>
              entry.type === "link" ? (
                <Link
                  key={entry.slug}
                  href={href(locale, entry.slug)}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                >
                  {t.nav[entry.key]}
                </Link>
              ) : (
                <div key={entry.id} className="mt-1">
                  <p className="px-3 pb-1 pt-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {pick(locale, entry.labelFr, entry.labelEn)}
                  </p>
                  {entry.items.map((it) => (
                    <Link
                      key={it.slug}
                      href={href(locale, it.slug)}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                    >
                      {t.nav[it.key]}
                    </Link>
                  ))}
                </div>
              ),
            )}
            <Link
              href={experienceHref(locale)}
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft"
            >
              {t.nav.book}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
