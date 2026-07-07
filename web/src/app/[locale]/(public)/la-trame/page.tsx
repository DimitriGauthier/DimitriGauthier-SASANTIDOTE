// La TRAME® — page thématique. Éditable via content_pages (slug "la-trame").
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getContentPage } from "@/lib/data";
import { Prose } from "@/components/ui";
import { PageHero, SplitSection, FeatureGrid, Steps, CTABanner, SectionHeading, Pill } from "@/components/sections";
import { Waves, Wind, Unlock, Feather, HandHeart, Sparkles, Compass, Sprout, Award } from "lucide-react";

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
      <PageHero
        tone="warm"
        eyebrow={pick(l, "Travail énergétique", "Energy work")}
        title={pick(l, "La TRAME®", "The TRAME®")}
        sub={pick(
          l,
          "Libérer le corps, remettre l'énergie en mouvement. Un soin doux et non intrusif, en complément de la parole.",
          "Freeing the body, setting energy back in motion. Gentle, non-intrusive care, alongside talking.",
        )}
        badges={
          <>
            <Pill icon={<Feather className="h-4 w-4" />}>{pick(l, "Doux", "Gentle")}</Pill>
            <Pill icon={<HandHeart className="h-4 w-4" />}>{pick(l, "Non intrusif", "Non-intrusive")}</Pill>
            <Pill icon={<Waves className="h-4 w-4" />}>{pick(l, "Énergétique", "Energy-based")}</Pill>
            <Pill icon={<Award className="h-4 w-4" />}>{pick(l, "Praticien certifié 2020", "Certified practitioner 2020")}</Pill>
          </>
        }
      />

      {html ? (
        <section className="full-bleed py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-4">
            <Prose html={html} />
          </div>
        </section>
      ) : (
        <>
          <SplitSection
            image="/img/cabinet-5.jpg"
            imageAlt=""
            eyebrow={pick(l, "En quoi ça consiste", "What it is")}
            title={pick(l, "Un soin énergétique", "An energy treatment")}
          >
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
            <p className="flex items-start gap-2.5 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground/80">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                {pick(
                  l,
                  "Je suis praticien certifié La TRAME®, formé en 2020. Un cadre sérieux, pour un soin qui reste toujours doux et respectueux.",
                  "I'm a certified TRAME® practitioner, trained in 2020. A serious framework, for care that always stays gentle and respectful.",
                )}
              </span>
            </p>
          </SplitSection>

          <FeatureGrid
            tone="soft"
            heading={
              <SectionHeading eyebrow={pick(l, "Les effets ressentis", "The felt effects")} title={pick(l, "Ce que la TRAME® apporte", "What the TRAME® brings")}>
                {pick(
                  l,
                  "Chaque personne vit sa séance à sa façon. Voici ce que beaucoup ressentent, séance après séance.",
                  "Everyone experiences their session in their own way. Here's what many feel, session after session.",
                )}
              </SectionHeading>
            }
            items={[
              {
                icon: <Feather className="h-6 w-6" />,
                title: pick(l, "Un apaisement profond", "Deep calm"),
                body: pick(
                  l,
                  "Le mental se pose, le corps se détend. Un calme qui revient de l'intérieur.",
                  "The mind settles, the body relaxes. A calm that returns from within.",
                ),
              },
              {
                icon: <Unlock className="h-6 w-6" />,
                title: pick(l, "La libération des émotions", "Emotional release"),
                body: pick(
                  l,
                  "Ce qui était retenu peut enfin se dénouer et circuler à nouveau.",
                  "What was held back can finally loosen and flow again.",
                ),
              },
              {
                icon: <Sparkles className="h-6 w-6" />,
                title: pick(l, "Une clarté nouvelle", "New clarity"),
                body: pick(
                  l,
                  "Les idées s'éclaircissent, on voit plus juste ce qui compte vraiment.",
                  "Thoughts clear up, you see more truly what really matters.",
                ),
              },
              {
                icon: <Compass className="h-6 w-6" />,
                title: pick(l, "La capacité de choisir", "The power to choose"),
                body: pick(
                  l,
                  "Retrouver sa liberté de décider, avancer sans se sentir bloqué.",
                  "Reclaiming your freedom to decide, moving forward without feeling stuck.",
                ),
              },
              {
                icon: <Sprout className="h-6 w-6" />,
                title: pick(l, "De nouveaux potentiels", "New potential"),
                body: pick(
                  l,
                  "Une énergie qui se remet en mouvement, et des possibles qui s'ouvrent.",
                  "Energy that starts moving again, and possibilities that open up.",
                ),
              },
              {
                icon: <Wind className="h-6 w-6" />,
                title: pick(l, "Les tensions qui partent", "Tension that leaves"),
                body: pick(
                  l,
                  "Le corps laisse filer ce qu'il portait, parfois depuis très longtemps.",
                  "The body lets go of what it carried, sometimes for a very long time.",
                ),
              },
            ]}
          />

          <Steps
            tone="plain"
            heading={
              <SectionHeading eyebrow={pick(l, "Le déroulé", "How it unfolds")} title={pick(l, "Comment se déroule une séance", "How a session unfolds")} />
            }
            items={[
              {
                title: pick(l, "Un temps d'échange", "A time to talk"),
                body: pick(l, "On échange pour comprendre ce que tu traverses.", "We talk to understand what you're going through."),
              },
              {
                title: pick(l, "Le soin énergétique", "The energy treatment"),
                body: pick(l, "Le soin, doux et non intrusif, le long de la colonne.", "The gentle, non-intrusive treatment along the spine."),
              },
              {
                title: pick(l, "Ressentir & intégrer", "Feel & integrate"),
                body: pick(l, "Un temps pour ressentir et laisser le mouvement s'installer.", "A time to feel and let the movement settle in."),
              },
            ]}
          />
        </>
      )}

      <CTABanner
        href={href(l, "reservation")}
        title={pick(l, "Envie de relâcher ce qui pèse ?", "Ready to release what weighs on you?")}
        sub={pick(l, "Réserve une séance de TRAME® et remets ton énergie en mouvement.", "Book a TRAME® session and set your energy back in motion.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </article>
  );
}
