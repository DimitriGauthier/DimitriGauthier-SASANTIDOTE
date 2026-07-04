import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";
import { navItems, href, siteConfig } from "@/lib/site";
import type { PublicSettings } from "@/lib/types";

export default function SiteFooter({
  locale,
  settings,
}: {
  locale: Locale;
  settings: PublicSettings | null;
}) {
  const t = getDict(locale);
  const name = settings?.practitioner_name ?? siteConfig.practitionerName;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="text-base font-semibold">{name}</div>
          <div className="mt-1 text-sm text-neutral-500">{siteConfig.tagline[locale]}</div>
          <div className="mt-3 text-sm text-neutral-600">{siteConfig.zone[locale]}</div>
        </div>

        <nav className="flex flex-col gap-1 text-sm">
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

        <div className="flex flex-col gap-1 text-sm text-neutral-600">
          <a href={`tel:${(settings?.whatsapp ?? siteConfig.phone).replace(/\s/g, "")}`}>
            {t.common.phone}: {siteConfig.phone}
          </a>
          <a href={`mailto:${siteConfig.email}`}>{t.common.email}: {siteConfig.email}</a>
          <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <div className="mt-3 flex flex-col gap-1">
            <Link href={href(locale, "mentions-legales")} className="hover:text-neutral-900">
              {locale === "en" ? "Legal notice" : "Mentions légales"}
            </Link>
            <Link href={href(locale, "confidentialite")} className="hover:text-neutral-900">
              {locale === "en" ? "Privacy policy" : "Confidentialité"}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-200 px-4 py-4 text-center text-xs text-neutral-400">
        © {year} {name} · {siteConfig.legalEntity.name}
      </div>
    </footer>
  );
}
