// Réservation — charge les données d'admission côté serveur puis monte le tunnel client.
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { getIntakeData } from "@/lib/data";
import { PageTitle, EmptyState } from "@/components/ui";
import BookingTunnel from "@/components/booking/BookingTunnel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "Prendre rendez-vous", "Book an appointment"),
    description: pick(
      l,
      "Réserve ta séance en quelques étapes : profil, motif, questionnaire, créneau et paiement sécurisé.",
      "Book your session in a few steps: profile, reason, questionnaire, slot and secure payment.",
    ),
  };
}

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { services, topics, questions } = await getIntakeData();

  return (
    <div>
      <PageTitle sub={pick(l, "Simple, guidé et confidentiel", "Simple, guided and confidential")}>
        {pick(l, "Prendre rendez-vous", "Book an appointment")}
      </PageTitle>

      {services.length > 0 ? (
        <BookingTunnel locale={l} services={services} topics={topics} questions={questions} />
      ) : (
        <EmptyState>
          {pick(
            l,
            "La réservation en ligne sera disponible très prochainement. En attendant, contacte-moi directement par téléphone ou WhatsApp.",
            "Online booking will be available very soon. In the meantime, contact me directly by phone or WhatsApp.",
          )}
        </EmptyState>
      )}
    </div>
  );
}
