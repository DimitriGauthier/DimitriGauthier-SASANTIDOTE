// Layout racine par langue : définit <html lang> + <body>. L'habillage public/admin
// est géré par des layouts imbriqués ((public) et /admin).
import "../globals.css";
import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Fraunces : serif « Old Style » chaleureux, à empattements doux.
// Plus incarné et rassurant que Cormorant — parfait pour installer la confiance
// tout en gardant une élégance premium. Axe optique « soft » activé.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
  variable: "--font-fraunces",
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
    <html lang={locale} className={`${inter.variable} ${fraunces.variable}`}>
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
