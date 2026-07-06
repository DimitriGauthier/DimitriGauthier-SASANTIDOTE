"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

// Sélecteur de langue par drapeaux (au lieu de « FR » / « EN »).
// Drapeaux dessinés en SVG (rendu identique sur tous les OS, contrairement aux emojis).
const FLAGS: Record<Locale, { label: string; svg: ReactNode }> = {
  fr: {
    label: "Français",
    svg: (
      <svg viewBox="0 0 3 2" className="h-full w-full" aria-hidden>
        <rect width="1" height="2" x="0" fill="#0055A4" />
        <rect width="1" height="2" x="1" fill="#fff" />
        <rect width="1" height="2" x="2" fill="#EF4135" />
      </svg>
    ),
  },
  en: {
    label: "English",
    svg: (
      <svg viewBox="0 0 60 30" className="h-full w-full" aria-hidden>
        <clipPath id="uk-c">
          <rect width="60" height="30" rx="0" />
        </clipPath>
        <g clipPath="url(#uk-c)">
          <rect width="60" height="30" fill="#012169" />
          <path d="M0,0 60,30 M60,0 0,30" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 60,30 M60,0 0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#uk-c)" />
          <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
        </g>
      </svg>
    ),
  },
};

export default function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() || `/${current}`;
  const rest = pathname.replace(/^\/(fr|en)(?=\/|$)/, "") || "";
  return (
    <div className="flex items-center gap-1.5">
      {locales.map((l) => {
        const active = l === current;
        return (
          <Link
            key={l}
            href={`/${l}${rest}`}
            aria-label={FLAGS[l].label}
            aria-current={active ? "true" : undefined}
            title={FLAGS[l].label}
            className={`block h-5 w-7 overflow-hidden rounded-[3px] shadow-sm ring-1 transition-all duration-200 ${
              active
                ? "ring-primary/60 opacity-100"
                : "opacity-45 ring-border grayscale hover:opacity-100 hover:grayscale-0"
            }`}
          >
            {FLAGS[l].svg}
          </Link>
        );
      })}
    </div>
  );
}
