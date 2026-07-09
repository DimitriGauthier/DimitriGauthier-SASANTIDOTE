// Habillage des pages publiques (splash d'entrée + header + footer + bouton WhatsApp).
// Le groupe de route (public) n'apparaît pas dans l'URL ; l'admin a son propre layout.
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { getPublicSettings } from "@/lib/data";
import { siteConfig, experienceHref } from "@/lib/site";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import SiteSplash from "@/components/SiteSplash";
import FloatingHearts from "@/components/FloatingHearts";
import ExperienceCTA from "@/components/ExperienceCTA";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const settings = await getPublicSettings();
  const name = settings?.practitioner_name ?? siteConfig.practitionerName;
  return (
    <>
      <FloatingHearts />
      <SiteSplash
        name={name}
        tagline={siteConfig.tagline[l]}
        skipLabel={pick(l, "Entrer", "Enter")}
      />
      <SiteHeader locale={l} settings={settings} />
      <main className="mx-auto max-w-6xl px-4 py-16">{children}</main>
      <SiteFooter locale={l} settings={settings} />
      <WhatsAppButton settings={settings} locale={l} />
      <ExperienceCTA
        href={experienceHref(l)}
        label={pick(l, "Tente l'expérience", "Try the experience")}
        hint={pick(l, "Ton parcours guidé t'attend", "Your guided journey awaits")}
        closeLabel={pick(l, "Fermer", "Close")}
      />
    </>
  );
}
