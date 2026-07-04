// Layout racine par langue : définit <html lang> + <body>. L'habillage public/admin
// est géré par des layouts imbriqués ((public) et /admin).
import "../globals.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

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
      default: `${siteConfig.practitionerName} — ${siteConfig.tagline[l]}`,
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
    <html lang={locale}>
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
