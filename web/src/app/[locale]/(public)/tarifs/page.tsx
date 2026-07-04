// Tarifs — affiche les prix des services (DB) ; le tarif exact est confirmé au moment du paiement.
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getServices } from "@/lib/data";
import { formatPrice, formatDuration } from "@/lib/format";
import { PageTitle, Section, Card, CTAButton } from "@/components/ui";

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
      <PageTitle sub={pick(l, "Clair, simple, sans surprise", "Clear, simple, no surprises")}>
        {pick(l, "Tarifs", "Pricing")}
      </PageTitle>

      {services.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">{pick(l, "Accompagnement", "Session")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Durée", "Duration")}</th>
                <th className="px-4 py-3 text-right font-medium">{pick(l, "Tarif", "Price")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {services.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-neutral-800">
                    {pick(l, s.title, s.title_en)}
                    {pick(l, s.subtitle, s.subtitle_en) ? (
                      <span className="block text-xs font-normal text-neutral-500">
                        {pick(l, s.subtitle, s.subtitle_en)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{formatDuration(s.duration_min, l)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-neutral-800">
                    {formatPrice(s.price_cents, s.currency, l)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card>
          <p className="text-neutral-600">
            {pick(
              l,
              "Le tarif de chaque accompagnement s'affiche au moment de la réservation, juste avant le paiement. Tu sais exactement ce que tu règles avant de confirmer.",
              "The price of each session is shown at booking time, right before payment. You know exactly what you're paying before confirming.",
            )}
          </p>
        </Card>
      )}

      <Section title={pick(l, "Paiement & réservation", "Payment & booking")}>
        <ul className="list-disc space-y-1 pl-6">
          <li>{pick(l, "Réservation 100 % en ligne, guidée et confidentielle.", "100% online booking, guided and confidential.")}</li>
          <li>{pick(l, "Paiement sécurisé au moment de confirmer le créneau.", "Secure payment when you confirm your slot.")}</li>
          <li>{pick(l, "Séances en visio, où que tu sois.", "Online sessions, wherever you are.")}</li>
        </ul>
      </Section>

      <div className="mt-8">
        <CTAButton href={href(l, "reservation")}>
          {pick(l, "Prendre rendez-vous", "Book an appointment")}
        </CTAButton>
      </div>
    </div>
  );
}
