// Tarifs — affiche les prix des services (DB) ; le tarif exact est confirmé au moment du paiement.
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getServices } from "@/lib/data";
import { formatPrice, formatDuration } from "@/lib/format";
import { PageTitle, Section, Card, CTASection } from "@/components/ui";
import { Clock, Check } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "Tarifs", "Pricing"),
    description: pick(
      l,
      "Les tarifs des accompagnements. Le paiement se fait en ligne, de façon simple et sécurisée.",
      "Session pricing. Payment is made online, simply and securely.",
    ),
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const services = await getServices();

  return (
    <div>
      <PageTitle
        eyebrow={pick(l, "Tarifs", "Pricing")}
        sub={pick(l, "Clair, simple, sans surprise", "Clear, simple, no surprises")}
      >
        {pick(l, "Tarifs", "Pricing")}
      </PageTitle>

      {services.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {services.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-medium text-foreground">{pick(l, s.title, s.title_en)}</h2>
                  {pick(l, s.subtitle, s.subtitle_en) ? (
                    <p className="mt-1 text-sm text-muted-foreground">{pick(l, s.subtitle, s.subtitle_en)}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <div className="font-serif text-3xl font-medium text-primary">{formatPrice(s.price_cents, s.currency, l)}</div>
                  <div className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {formatDuration(s.duration_min, l)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-muted-foreground">
            {pick(
              l,
              "Le tarif de chaque accompagnement s'affiche au moment de la réservation, juste avant le paiement. Tu sais exactement ce que tu règles avant de confirmer.",
              "The price of each session is shown at booking time, right before payment. You know exactly what you're paying before confirming.",
            )}
          </p>
        </Card>
      )}

      <Section title={pick(l, "Paiement & réservation", "Payment & booking")}>
        <ul className="space-y-3">
          {[
            pick(l, "Réservation 100 % en ligne, guidée et confidentielle.", "100% online booking, guided and confidential."),
            pick(l, "Paiement sécurisé au moment de confirmer le créneau.", "Secure payment when you confirm your slot."),
            pick(l, "Séances en visio, où que tu sois.", "Online sessions, wherever you are."),
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <Check className="h-3 w-3" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <CTASection
        href={href(l, "reservation")}
        title={pick(l, "Réserve ta séance", "Book your session")}
        sub={pick(l, "Le tarif s'affiche clairement avant le paiement, aucune surprise.", "The price is shown clearly before payment, no surprises.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </div>
  );
}
