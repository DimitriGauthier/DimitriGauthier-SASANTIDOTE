// Expérience INTIMY — application plein écran (sous-domaine intimy.), sans menu.
// Charge les données d'admission côté serveur puis monte le tunnel guidé par Dimitri.
import type { Metadata } from "next";
import Image from "next/image";
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
      {/* En-tête compacte sur mobile : on réduit marges + wordmark + titre pour laisser
          le questionnaire remonter plus haut dans l'écran (moins de vide en haut). */}
      <div className="mb-4 text-center sm:mb-8">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-primary">
          {pick(l, "L'expérience", "The experience")}
        </p>
        <Image
          src="/img/intimy.png"
          alt="INTIMY"
          width={1200}
          height={500}
          priority
          className="mx-auto mt-1.5 h-11 w-auto drop-shadow-[0_10px_22px_hsl(var(--primary)/0.18)] sm:mt-2 sm:h-16"
        />
        <h1 className="mt-1.5 font-serif text-lg font-medium leading-tight text-foreground sm:mt-3 sm:text-3xl">
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
