// Retour Stripe — succès. Le RDV est confirmé côté serveur par le webhook Stripe.
import type { Metadata } from "next";
import { isLocale, type Locale, pick, getDict } from "@/lib/i18n";
import { href } from "@/lib/site";
import { PageTitle, CTAButton } from "@/components/ui";

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
    <div className="mx-auto max-w-xl text-center">
      <div className="mb-4 text-4xl">✓</div>
      <PageTitle>{t.booking.confirmedTitle}</PageTitle>
      <p className="mt-2 text-neutral-600">{t.booking.confirmedBody}</p>
      <div className="mt-8">
        <CTAButton href={href(l)}>{pick(l, "Retour à l'accueil", "Back to home")}</CTAButton>
      </div>
    </div>
  );
}
