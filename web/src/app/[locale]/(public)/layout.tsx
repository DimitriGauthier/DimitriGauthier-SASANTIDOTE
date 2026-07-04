// Habillage des pages publiques (header + footer + bouton WhatsApp).
// Le groupe de route (public) n'apparaît pas dans l'URL ; l'admin a son propre layout.
import { isLocale, type Locale } from "@/lib/i18n";
import { getPublicSettings } from "@/lib/data";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";

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
  return (
    <>
      <SiteHeader locale={l} settings={settings} />
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      <SiteFooter locale={l} settings={settings} />
      <WhatsAppButton settings={settings} />
    </>
  );
}
