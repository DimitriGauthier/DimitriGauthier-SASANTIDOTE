// Retour Stripe — paiement non finalisé. Le créneau a été libéré (hold expiré/annulé).
import type { Metadata } from "next";
import { isLocale, type Locale, pick, getDict } from "@/lib/i18n";
import { href } from "@/lib/site";
import { CTAButton } from "@/components/ui";
import { RotateCcw } from "lucide-react";

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
    <div className="mx-auto max-w-xl py-10 text-center sm:py-16">
      <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary shadow-soft">
        <RotateCcw className="h-7 w-7" />
      </div>
      <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        {t.booking.cancelledTitle}
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">{t.booking.cancelledBody}</p>
      <div className="mt-8">
        <CTAButton href={href(l, "reservation")}>{pick(l, "Reprendre une réservation", "Start a new booking")}</CTAButton>
      </div>
    </div>
  );
}
