// Layout racine par langue : définit <html lang> + <body>. L'habillage public/admin
// est géré par des layouts imbriqués ((public) et /admin).
import "../globals.css";
import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : "fr";
  return {
    title: {
      default: `${siteConfig.practitionerName} · ${siteConfig.tagline[l]}`,
      template: `%s · ${siteConfig.practitionerName}`,
    },
    description: siteConfig.tagline[l],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {/* Sans JS, les blocs à apparition restent visibles */}
        <noscript>
          <style>{`.reveal,.reveal-left,.reveal-right{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
