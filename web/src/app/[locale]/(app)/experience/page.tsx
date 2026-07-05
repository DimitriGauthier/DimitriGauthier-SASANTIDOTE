// Expérience — application plein écran (sous-domaine intime.), sans menu.
// Charge les données d'admission côté serveur puis monte le tunnel guidé par Dimitri.
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { getIntakeData } from "@/lib/data";
import { EmptyState } from "@/components/ui";
import BookingTunnel from "@/components/booking/BookingTunnel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "Tente l'expérience", "Try the experience"),
    description: pick(
      l,
      "Un parcours guidé, simple et confidentiel. Dimitri t'accompagne pas à pas jusqu'à ton rendez-vous.",
      "A guided, simple and confidential journey. Dimitri walks you step by step to your appointment.",
    ),
  };
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { services, topics, questions } = await getIntakeData();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          {pick(l, "L'expérience", "The experience")}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl">
          {pick(l, "On avance ensemble, à ton rythme", "We move forward together, at your pace")}
        </h1>
      </div>

      {services.length > 0 ? (
        <BookingTunnel locale={l} services={services} topics={topics} questions={questions} />
      ) : (
        <EmptyState>
          {pick(
            l,
            "L'expérience en ligne sera disponible très prochainement. En attendant, contacte-moi directement par téléphone ou WhatsApp.",
            "The online experience will be available very soon. In the meantime, contact me directly by phone or WhatsApp.",
          )}
        </EmptyState>
      )}
    </div>
  );
}
