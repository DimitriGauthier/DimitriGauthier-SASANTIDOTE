import Link from "next/link";
import { Lock } from "lucide-react";
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
    <footer className="mt-24 border-t border-border/60 bg-gradient-soft">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-3">
        <div>
          <div className="font-serif text-xl font-medium text-foreground">{name}</div>
          <div className="mt-1 text-sm italic text-muted-foreground">
            {siteConfig.tagline[locale]}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">{siteConfig.zone[locale]}</div>
        </div>

        <nav className="flex flex-col gap-1.5 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.slug}
              href={href(locale, item.slug)}
              className="story-link inline-block w-fit text-muted-foreground transition-colors hover:text-primary"
            >
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <a
            href={`tel:${(settings?.whatsapp ?? siteConfig.phone).replace(/\s/g, "")}`}
            className="transition-colors hover:text-primary"
          >
            {t.common.phone}: {siteConfig.phone}
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="transition-colors hover:text-primary"
          >
            {t.common.email}: {siteConfig.email}
          </a>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-primary"
          >
            Instagram
          </a>
          <div className="mt-4 flex flex-col gap-1.5">
            <Link
              href={href(locale, "mentions-legales")}
              className="transition-colors hover:text-primary"
            >
              {locale === "en" ? "Legal notice" : "Mentions légales"}
            </Link>
            <Link
              href={href(locale, "confidentialite")}
              className="transition-colors hover:text-primary"
            >
              {locale === "en" ? "Privacy policy" : "Confidentialité"}
            </Link>
            <Link
              href={href(locale, "admin/login")}
              className="mt-1 inline-flex w-fit items-center gap-1 text-xs text-muted-foreground/70 transition-colors hover:text-primary"
            >
              <Lock className="h-3 w-3" />
              {locale === "en" ? "Admin area" : "Espace admin"}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-5 text-center text-xs text-muted-foreground">
        © {year} {name} · {siteConfig.legalEntity.name}
      </div>
    </footer>
  );
}
