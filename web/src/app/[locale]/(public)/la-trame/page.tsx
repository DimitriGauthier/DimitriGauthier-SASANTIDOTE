// La TRAME® — page thématique. Éditable via content_pages (slug "la-trame").
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getContentPage } from "@/lib/data";
import { PageTitle, Section, Prose, CTASection } from "@/components/ui";
import { Check } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "La TRAME® · travail énergétique", "The TRAME® · energy work"),
    description: pick(
      l,
      "La TRAME® : un travail énergétique doux qui libère les tensions du corps et remet en mouvement ce qui était figé.",
      "The TRAME®: gentle energy work that releases the body's tensions and sets in motion what had become stuck.",
    ),
  };
}

export default async function TramePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const page = await getContentPage("la-trame");
  const html = pick(l, page?.body_html, page?.body_html_en);

  return (
    <article>
      <PageTitle
        eyebrow={pick(l, "Travail énergétique", "Energy work")}
        sub={pick(l, "Libérer le corps, remettre l'énergie en mouvement", "Freeing the body, setting energy back in motion")}
      >
        {pick(l, "La TRAME®", "The TRAME®")}
      </PageTitle>

      {html ? (
        <Prose html={html} />
      ) : (
        <>
          <Section>
            <p>
              {pick(
                l,
                "La TRAME® est un soin énergétique. Par des gestes précis le long de la colonne, elle relance la circulation de l'énergie vitale et aide le corps à relâcher les tensions qu'il retient, parfois depuis longtemps.",
                "The TRAME® is an energy treatment. Through precise gestures along the spine, it revives the flow of vital energy and helps the body release the tensions it holds, sometimes for a long time.",
              )}
            </p>
            <p>
              {pick(
                l,
                "Beaucoup de blocages intimes s'ancrent dans le corps. Travailler cette dimension, en complément de la parole, permet souvent de débloquer ce qui résistait.",
                "Many intimate blocks are anchored in the body. Working on this dimension, alongside talking, often unlocks what had been resisting.",
              )}
            </p>
          </Section>

          <Section title={pick(l, "Comment se déroule une séance", "How a session unfolds")}>
            <ul className="space-y-3">
              {[
                pick(l, "Un temps d'échange pour comprendre ce que tu traverses", "A time to talk and understand what you're going through"),
                pick(l, "Le soin énergétique, doux et non intrusif", "The energy treatment, gentle and non-intrusive"),
                pick(l, "Un temps pour ressentir et intégrer", "A time to feel and integrate"),
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
        </>
      )}

      <CTASection
        href={href(l, "reservation")}
        title={pick(l, "Envie de relâcher ce qui pèse ?", "Ready to release what weighs on you?")}
        sub={pick(l, "Réserve une séance de TRAME® et remets ton énergie en mouvement.", "Book a TRAME® session and set your energy back in motion.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </article>
  );
}
