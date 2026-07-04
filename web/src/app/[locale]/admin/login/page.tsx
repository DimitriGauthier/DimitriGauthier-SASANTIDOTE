// Connexion à l'espace praticien. En dehors du groupe (dash) => pas de garde (sinon boucle).
import type { Metadata } from "next";
import Image from "next/image";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-soft px-4 py-16">
      <div className="blob animate-blob absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/30" />
      <div
        className="blob animate-blob absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-gold/30"
        style={{ animationDelay: "-6s" }}
      />
      <div className="relative w-full max-w-sm rounded-3xl border border-border/60 bg-card p-8 shadow-soft">
        <Image
          src="/img/logo.png"
          alt=""
          width={140}
          height={48}
          className="mb-6 h-11 w-auto"
        />
        <h1 className="mb-1 font-serif text-3xl font-medium text-foreground">
          {pick(l, "Espace praticien", "Practitioner area")}
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">{siteConfig.practitionerName}</p>
        <LoginForm locale={l} />
      </div>
    </div>
  );
}
