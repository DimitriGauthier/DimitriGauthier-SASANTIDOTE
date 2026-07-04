"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { getDict, type Locale } from "@/lib/i18n";
import { navItems, href, siteConfig, type NavKey } from "@/lib/site";
import type { PublicSettings } from "@/lib/types";
import LocaleSwitcher from "./LocaleSwitcher";

// Sous-ensemble affiché sur grand écran (le menu mobile garde tout).
const primaryKeys: NavKey[] = [
  "about",
  "approach",
  "services",
  "pricing",
  "reviews",
  "faq",
  "contact",
];

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

  const primary = navItems.filter((i) => primaryKeys.includes(i.key));

  return (
    <header className="glass sticky top-0 z-50 border-b border-border/60">
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
        <nav className="hidden items-center gap-x-6 lg:flex">
          {primary.map((item) => (
            <Link
              key={item.slug}
              href={href(locale, item.slug)}
              className="story-link font-serif text-[1.05rem] italic text-foreground/80 transition-colors hover:text-primary"
            >
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <LocaleSwitcher current={locale} />
          <Link
            href={href(locale, "reservation")}
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

      {/* Menu mobile déroulant */}
      {open && (
        <div className="glass border-t border-border/60 lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.slug}
                href={href(locale, item.slug)}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 font-serif text-lg italic text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
              >
                {t.nav[item.key]}
              </Link>
            ))}
            <Link
              href={href(locale, "reservation")}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft"
            >
              {t.nav.book}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
