// Accompagnements — liste des services (depuis la DB si câblée), sinon présentation générique.
import type { Metadata } from "next";
import { isLocale, type Locale, pick, getDict } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getServices } from "@/lib/data";
import { formatPrice, formatDuration } from "@/lib/format";
import { PageTitle, Section, Card, EmptyState, CTAButton } from "@/components/ui";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "Accompagnements", "Sessions"),
    description: pick(
      l,
      "Consultations individuelles et de couple, en visio. Homme, femme, couple : un accompagnement adapté à ta situation.",
      "Individual and couple sessions, online. Man, woman, couple: support tailored to your situation.",
    ),
  };
}

const AUDIENCE_LABEL: Record<string, { fr: string; en: string }> = {
  homme: { fr: "Homme", en: "Man" },
  femme: { fr: "Femme", en: "Woman" },
  couple: { fr: "Couple", en: "Couple" },
  tous: { fr: "Tous", en: "Everyone" },
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  getDict(l);
  const services = await getServices();

  return (
    <div>
      <PageTitle sub={pick(l, "Des séances en visio, à ton rythme", "Online sessions, at your pace")}>
        {pick(l, "Accompagnements", "Sessions")}
      </PageTitle>

      <Section>
        <p>
          {pick(
            l,
            "Chaque accompagnement démarre par un temps d'écoute pour comprendre ta situation. Ensemble, on choisit les outils les plus justes : sexothérapie, TRAME® et numérologie, selon ce dont tu as besoin.",
            "Every session starts with a time of listening to understand your situation. Together we choose the most fitting tools: sex therapy, TRAME® and numerology, depending on what you need.",
          )}
        </p>
      </Section>

      {services.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {services.map((s) => (
            <Card key={s.id}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">{pick(l, s.title, s.title_en)}</h2>
                <span className="whitespace-nowrap text-sm font-medium text-neutral-500">
                  {formatDuration(s.duration_min, l)} · {formatPrice(s.price_cents, s.currency, l)}
                </span>
              </div>
              {pick(l, s.subtitle, s.subtitle_en) ? (
                <p className="mt-1 text-sm text-neutral-500">{pick(l, s.subtitle, s.subtitle_en)}</p>
              ) : null}
              {pick(l, s.description, s.description_en) ? (
                <p className="mt-3 text-sm text-neutral-600">{pick(l, s.description, s.description_en)}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {s.audiences.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-500"
                  >
                    {pick(l, AUDIENCE_LABEL[a]?.fr ?? a, AUDIENCE_LABEL[a]?.en ?? a)}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <Link href={href(l, "reservation")} className="text-sm font-medium underline">
                  {pick(l, "Réserver cet accompagnement", "Book this session")} →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-3">
          <Card>
            <h2 className="mb-1 font-semibold">{pick(l, "Séance individuelle", "Individual session")}</h2>
            <p className="text-sm text-neutral-600">
              {pick(
                l,
                "Pour les hommes et les femmes : panne, désir, plaisir, confiance, rapport au corps.",
                "For men and women: performance, desire, pleasure, confidence, relationship to the body.",
              )}
            </p>
          </Card>
          <Card>
            <h2 className="mb-1 font-semibold">{pick(l, "Séance de couple", "Couple session")}</h2>
            <p className="text-sm text-neutral-600">
              {pick(
                l,
                "Communication, désir, complicité : retrouver ensemble un équilibre qui vous ressemble.",
                "Communication, desire, closeness: finding together a balance that suits you.",
              )}
            </p>
          </Card>
          <Card>
            <h2 className="mb-1 font-semibold">{pick(l, "Séance TRAME® / numérologie", "TRAME® / numerology session")}</h2>
            <p className="text-sm text-neutral-600">
              {pick(
                l,
                "Un travail énergétique ou un éclairage numérologique, en complément du suivi.",
                "Energy work or a numerology reading, alongside the follow-up.",
              )}
            </p>
          </Card>
        </div>
      )}

      {services.length === 0 ? (
        <div className="mt-6">
          <EmptyState>
            {pick(
              l,
              "Le détail des séances et les tarifs s'affichent au moment de la réservation.",
              "Session details and prices are shown at booking time.",
            )}
          </EmptyState>
        </div>
      ) : null}

      <div className="mt-10">
        <CTAButton href={href(l, "reservation")}>
          {pick(l, "Prendre rendez-vous", "Book an appointment")}
        </CTAButton>
      </div>
    </div>
  );
}
