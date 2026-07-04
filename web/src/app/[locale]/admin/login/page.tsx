// Connexion à l'espace praticien. En dehors du groupe (dash) => pas de garde (sinon boucle).
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-16">
      <h1 className="mb-1 text-2xl font-semibold">{pick(l, "Espace praticien", "Practitioner area")}</h1>
      <p className="mb-8 text-sm text-neutral-500">{siteConfig.practitionerName}</p>
      <LoginForm locale={l} />
    </div>
  );
}
