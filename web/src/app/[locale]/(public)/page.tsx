// Accueil — page d'accueil publique. Contenu issu du cahier des charges de Dimitri.
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { siteConfig, href } from "@/lib/site";
import { getServices, getPublishedReviews } from "@/lib/data";
import { formatPrice, formatDuration } from "@/lib/format";
import { CTAButton, Card, Section } from "@/components/ui";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(
      l,
      "Dimitri Gauthier — Sexothérapie, TRAME® & numérologie",
      "Dimitri Gauthier — Sex therapy, TRAME® & numerology",
    ),
    description: pick(
      l,
      "Sexothérapeute pour homme, femme et couple. Une approche qui relie tête, corps et cœur — sexothérapie, TRAME® et numérologie. Consultations en visio.",
      "Sex therapist for men, women and couples. An approach connecting mind, body and heart — sex therapy, TRAME® and numerology. Online sessions.",
    ),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const [services, reviews] = await Promise.all([getServices(), getPublishedReviews(3)]);

  const pillars = [
    {
      title: pick(l, "Sexothérapie", "Sex therapy"),
      body: pick(
        l,
        "Un espace pour parler sans tabou de ce qui bloque : panne, désir, plaisir, communication dans le couple. On avance à ton rythme.",
        "A space to talk without taboo about what blocks you: performance, desire, pleasure, communication within the couple. We move at your pace.",
      ),
    },
    {
      title: "La TRAME®",
      body: pick(
        l,
        "Un travail énergétique qui libère les tensions du corps et remet en mouvement ce qui était figé.",
        "Energy work that releases the body's tensions and sets in motion what had become stuck.",
      ),
    },
    {
      title: pick(l, "Numérologie", "Numerology"),
      body: pick(
        l,
        "Un éclairage sur ton chemin de vie pour mieux comprendre tes élans, tes cycles et ce qui te ressemble vraiment.",
        "Insight into your life path to better understand your drives, your cycles and what truly resembles you.",
      ),
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">
          {siteConfig.tagline[l]}
        </p>
        <h1 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
          {pick(
            l,
            "S'accomplir pleinement, dans sa vie comme dans son intimité",
            "Fully flourish, in your life as in your intimacy",
          )}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600">
          {pick(
            l,
            "Je suis Dimitri Gauthier, sexothérapeute. J'accompagne les hommes, les femmes et les couples à mettre des mots sur ce qui coince et à retrouver un équilibre — tête, corps et cœur.",
            "I'm Dimitri Gauthier, sex therapist. I support men, women and couples in putting words to what's stuck and finding balance again — mind, body and heart.",
          )}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CTAButton href={href(l, "reservation")}>
            {pick(l, "Prendre rendez-vous", "Book an appointment")}
          </CTAButton>
          <CTAButton href={href(l, "mon-approche")} variant="outline">
            {pick(l, "Découvrir mon approche", "Discover my approach")}
          </CTAButton>
        </div>
        <blockquote className="mx-auto mt-10 max-w-xl border-l-2 border-neutral-300 pl-4 text-left text-neutral-500 italic">
          {pick(
            l,
            "« Vouloir, c'est désirer ce qui dépend de nous. »",
            "\"To will is to desire what depends on us.\"",
          )}
        </blockquote>
      </section>

      {/* Les 3 piliers */}
      <Section title={pick(l, "Une approche en trois dimensions", "A three-dimensional approach")}>
        <div className="grid gap-5 sm:grid-cols-3">
          {pillars.map((p) => (
            <Card key={p.title}>
              <h3 className="mb-2 text-lg font-semibold">{p.title}</h3>
              <p className="text-sm text-neutral-600">{p.body}</p>
            </Card>
          ))}
        </div>
        <p className="text-neutral-600">
          {pick(
            l,
            "Ces trois outils ne s'opposent pas : ils se complètent. Un mal-être sexuel prend souvent racine ailleurs. En alignant la tête, le corps et le cœur, on remet toute ta vie en mouvement.",
            "These three tools don't compete: they complement each other. Sexual discomfort often takes root elsewhere. By aligning mind, body and heart, we set your whole life back in motion.",
          )}
        </p>
      </Section>

      {/* Pour qui */}
      <Section title={pick(l, "Pour qui ?", "For whom?")}>
        <div className="grid gap-5 sm:grid-cols-3">
          <Card>
            <h3 className="mb-1 font-semibold">{pick(l, "Homme", "Men")}</h3>
            <p className="text-sm text-neutral-600">
              {pick(
                l,
                "Panne, éjaculation, désir, confiance en soi. On en parle simplement, sans jugement.",
                "Performance, ejaculation, desire, self-confidence. We talk about it simply, without judgment.",
              )}
            </p>
          </Card>
          <Card>
            <h3 className="mb-1 font-semibold">{pick(l, "Femme", "Women")}</h3>
            <p className="text-sm text-neutral-600">
              {pick(
                l,
                "Désir, plaisir, douleurs, rapport au corps. Un accompagnement bienveillant et à ton écoute.",
                "Desire, pleasure, pain, relationship to the body. Caring support that listens to you.",
              )}
            </p>
          </Card>
          <Card>
            <h3 className="mb-1 font-semibold">{pick(l, "Couple", "Couples")}</h3>
            <p className="text-sm text-neutral-600">
              {pick(
                l,
                "Communication, désir, complicité. Retrouver ensemble un équilibre qui vous ressemble.",
                "Communication, desire, closeness. Finding together a balance that suits you.",
              )}
            </p>
          </Card>
        </div>
      </Section>

      {/* Accompagnements (services depuis la DB si câblée) */}
      {services.length > 0 ? (
        <Section title={pick(l, "Les accompagnements", "The sessions")}>
          <div className="grid gap-5 sm:grid-cols-2">
            {services.map((s) => (
              <Card key={s.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-semibold">{pick(l, s.title, s.title_en)}</h3>
                  <span className="whitespace-nowrap text-sm text-neutral-500">
                    {formatDuration(s.duration_min, l)} · {formatPrice(s.price_cents, s.currency, l)}
                  </span>
                </div>
                {pick(l, s.subtitle, s.subtitle_en) ? (
                  <p className="mt-2 text-sm text-neutral-600">{pick(l, s.subtitle, s.subtitle_en)}</p>
                ) : null}
              </Card>
            ))}
          </div>
          <div className="pt-2">
            <Link href={href(l, "accompagnements")} className="text-sm font-medium underline">
              {pick(l, "Voir tous les accompagnements", "See all sessions")} →
            </Link>
          </div>
        </Section>
      ) : null}

      {/* Avis */}
      {reviews.length > 0 ? (
        <Section title={pick(l, "Ils m'ont fait confiance", "They trusted me")}>
          <div className="grid gap-5 sm:grid-cols-3">
            {reviews.map((r) => (
              <Card key={r.id}>
                {r.rating ? (
                  <div className="mb-2 text-amber-500" aria-label={`${r.rating}/5`}>
                    {"★".repeat(r.rating)}
                    <span className="text-neutral-300">{"★".repeat(5 - r.rating)}</span>
                  </div>
                ) : null}
                {r.comment ? <p className="text-sm text-neutral-600">« {r.comment} »</p> : null}
                {r.client_display_name ? (
                  <p className="mt-2 text-xs font-medium text-neutral-500">
                    — {r.client_display_name}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
          <div className="pt-2">
            <Link href={href(l, "avis")} className="text-sm font-medium underline">
              {pick(l, "Lire tous les avis", "Read all reviews")} →
            </Link>
          </div>
        </Section>
      ) : null}

      {/* CTA final */}
      <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center">
        <h2 className="text-2xl font-semibold">
          {pick(l, "Prêt·e à faire le premier pas ?", "Ready to take the first step?")}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-neutral-600">
          {pick(
            l,
            "La réservation est simple, guidée et confidentielle. Le tarif s'affiche au moment de confirmer.",
            "Booking is simple, guided and confidential. The price is shown when you confirm.",
          )}
        </p>
        <div className="mt-6">
          <CTAButton href={href(l, "reservation")}>
            {pick(l, "Prendre rendez-vous", "Book an appointment")}
          </CTAButton>
        </div>
      </section>
    </div>
  );
}
