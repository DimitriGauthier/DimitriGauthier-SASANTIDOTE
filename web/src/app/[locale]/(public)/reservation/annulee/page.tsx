// Retour Stripe — paiement non finalisé. Le créneau a été libéré (hold expiré/annulé).
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
  return { title: pick(l, "Paiement non finalisé", "Payment not completed") };
}

export default async function CancelledPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const t = getDict(l);

  return (
    <div className="mx-auto max-w-xl text-center">
      <PageTitle>{t.booking.cancelledTitle}</PageTitle>
      <p className="mt-2 text-neutral-600">{t.booking.cancelledBody}</p>
      <div className="mt-8">
        <CTAButton href={href(l, "reservation")}>{pick(l, "Reprendre une réservation", "Start a new booking")}</CTAButton>
      </div>
    </div>
  );
}
