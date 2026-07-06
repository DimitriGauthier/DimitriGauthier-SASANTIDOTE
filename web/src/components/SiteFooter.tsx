import Link from "next/link";
import Image from "next/image";
import { Lock, Phone, Mail } from "lucide-react";
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
  const phone = settings?.whatsapp ?? siteConfig.phone;

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border/60 bg-gradient-soft">
      {/* Mascotte cupidon en filigrane, très discrète, comme signature de marque */}
      <Image
        src="/img/cupid.png"
        alt=""
        aria-hidden
        width={300}
        height={288}
        className="pointer-events-none absolute -right-12 -top-10 hidden w-64 select-none opacity-[0.07] md:block"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-[1.5fr_1fr_1.3fr]">
        {/* Bloc marque : logo Dimitri + baseline */}
        <div>
          <Image
            src="/img/logo.png"
            alt={name}
            width={220}
            height={77}
            className="h-14 w-auto"
          />
          <p className="mt-5 max-w-xs text-sm italic leading-relaxed text-muted-foreground">
            {siteConfig.tagline[locale]}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            {siteConfig.zone[locale]}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 text-sm">
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary/80">
            {locale === "en" ? "Explore" : "Explorer"}
          </p>
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

        {/* Contact + mentions */}
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p className="mb-0 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary/80">
            {locale === "en" ? "Get in touch" : "Me contacter"}
          </p>
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4 text-primary/70" />
            {siteConfig.phone}
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="inline-flex items-center gap-2 break-all transition-colors hover:text-primary"
          >
            <Mail className="h-4 w-4 shrink-0 text-primary/70" />
            {siteConfig.email}
          </a>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-primary"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary/70" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
            </svg>
            Instagram
          </a>

          <div className="mt-3 flex flex-col gap-1.5 border-t border-border/60 pt-3 text-xs">
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
              className="mt-0.5 inline-flex w-fit items-center gap-1 text-muted-foreground/60 transition-colors hover:text-primary"
            >
              <Lock className="h-3 w-3" />
              {locale === "en" ? "Admin area" : "Espace admin"}
            </Link>
          </div>
        </div>
      </div>

      <div className="relative border-t border-border/60 px-4 py-5 text-center text-xs text-muted-foreground">
        © {year} {name} · {siteConfig.legalEntity.name}
      </div>
    </footer>
  );
}
