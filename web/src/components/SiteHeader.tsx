import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";
import { navItems, href, siteConfig } from "@/lib/site";
import type { PublicSettings } from "@/lib/types";
import LocaleSwitcher from "./LocaleSwitcher";

export default function SiteHeader({
  locale,
  settings,
}: {
  locale: Locale;
  settings: PublicSettings | null;
}) {
  const t = getDict(locale);
  const name = settings?.practitioner_name ?? siteConfig.practitionerName;

  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href={href(locale)} className="flex flex-col leading-tight">
          <span className="text-lg font-semibold">{name}</span>
          <span className="text-xs text-neutral-500">{siteConfig.tagline[locale]}</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.slug}
              href={href(locale, item.slug)}
              className="text-neutral-600 hover:text-neutral-900"
            >
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher current={locale} />
          <Link
            href={href(locale, "reservation")}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            {t.nav.book}
          </Link>
        </div>
      </div>
    </header>
  );
}
