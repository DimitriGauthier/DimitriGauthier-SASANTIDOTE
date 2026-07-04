// Retour Stripe — succès. Le RDV est confirmé côté serveur par le webhook Stripe.
import type { Metadata } from "next";
import { isLocale, type Locale, pick, getDict } from "@/lib/i18n";
import { href } from "@/lib/site";
import { CTAButton } from "@/components/ui";
import { Check } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return { title: pick(l, "Rendez-vous confirmé", "Appointment confirmed") };
}

export default async function ConfirmedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const t = getDict(l);

  return (
    <div className="mx-auto max-w-xl py-10 text-center sm:py-16">
      <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary shadow-soft">
        <Check className="h-8 w-8" />
      </div>
      <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        {t.booking.confirmedTitle}
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">{t.booking.confirmedBody}</p>
      <div className="mt-8">
        <CTAButton href={href(l)}>{pick(l, "Retour à l'accueil", "Back to home")}</CTAButton>
      </div>
    </div>
  );
}
