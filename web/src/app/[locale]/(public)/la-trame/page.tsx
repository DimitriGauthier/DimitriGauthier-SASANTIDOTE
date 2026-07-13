// La TRAME® — page thématique. Éditable via content_pages (slug "la-trame").
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getContentPage } from "@/lib/data";
import { Prose } from "@/components/ui";
import { PageHero, SplitSection, FeatureGrid, Steps, CTABanner, SectionHeading, Pill, QuoteBlock } from "@/components/sections";
import { Waves, Wind, Unlock, Feather, HandHeart, Sparkles, Compass, Sprout, Award, Clock, ShieldAlert } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "La TRAME® · technique vibratoire", "The TRAME® · vibratory technique"),
    description: pick(
      l,
      "La TRAME® : une technique vibratoire douce qui rétablit la circulation de l'information dans le corps et remet en mouvement ce qui était figé.",
      "The TRAME®: a gentle vibratory technique that restores the circulation of information in the body and sets moving again what had become stuck.",
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
        eyebrow={pick(l, "Technique vibratoire", "Vibratory technique")}
        title={pick(l, "La TRAME®", "The TRAME®")}
        sub={pick(
          l,
          "Se reconnecter à soi, en douceur. Une technique vibratoire, douce et non intrusive, en complément de la parole.",
          "Reconnecting with yourself, gently. A soft, non-intrusive vibratory technique, alongside talking.",
        )}
        badges={
          <>
            <Pill icon={<Feather className="h-4 w-4" />}>{pick(l, "Doux", "Gentle")}</Pill>
            <Pill icon={<HandHeart className="h-4 w-4" />}>{pick(l, "Non intrusif", "Non-intrusive")}</Pill>
            <Pill icon={<Waves className="h-4 w-4" />}>{pick(l, "Vibratoire", "Vibratory")}</Pill>
            <Pill icon={<Clock className="h-4 w-4" />}>{pick(l, "30 à 45 min", "30 to 45 min")}</Pill>
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
            title={pick(l, "Une technique vibratoire", "A vibratory technique")}
          >
            <p>
              {pick(
                l,
                "La TRAME® est une technique vibratoire, composée de seize mouvements précis, le long de la colonne. Son but : rétablir la circulation de l'information dans le corps, quand elle est perturbée par des obstacles que l'on se crée, souvent liés à des émotions, conscientes ou non.",
                "The TRAME® is a vibratory technique, made of sixteen precise movements along the spine. Its purpose: to restore the circulation of information in the body when it's disrupted by the obstacles we create for ourselves, often tied to emotions, whether we're aware of them or not.",
              )}
            </p>
            <p>
              {pick(
                l,
                "Elle permet de faire, ou de refaire, circuler cette information de façon harmonieuse.",
                "It lets this information flow, or flow again, in a harmonious way.",
              )}
            </p>
            <p>
              {pick(
                l,
                "Le principe est simple : tu restes habillé·e, allongé·e. Rien d'intrusif, jamais.",
                "The principle is simple: you stay dressed, lying down. Nothing intrusive, ever.",
              )}
            </p>
            <p>
              {pick(
                l,
                "Beaucoup de blocages intimes s'ancrent dans le corps. Travailler cette dimension, en complément de la parole, permet souvent de débloquer ce qui résistait. La TRAME® s'adresse à toute personne en quête d'équilibre et de rééquilibrage.",
                "Many intimate blocks are anchored in the body. Working on this dimension, alongside talking, often unlocks what had been resisting. The TRAME® is for anyone seeking balance and rebalancing.",
              )}
            </p>
            <p className="flex items-start gap-2.5 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground/80">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                {pick(
                  l,
                  "Je suis praticien certifié La TRAME®, formé en 2020. Un cadre sérieux, pour une séance qui reste toujours douce et respectueuse.",
                  "I'm a certified TRAME® practitioner, trained in 2020. A serious framework, for a session that always stays gentle and respectful.",
                )}
              </span>
            </p>
            <p className="flex items-start gap-2.5 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-foreground/80">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>
                {pick(
                  l,
                  "Un préalable indispensable : avant toute séance, on remplit ensemble un court questionnaire médical. La TRAME® est contre-indiquée dans certains cas, notamment en cas de pacemaker, de stent ou de certains antécédents. Dans ces situations, on ne la pratique pas : ta sécurité passe avant tout.",
                  "A necessary first step: before any session, we fill out a short medical questionnaire together. The TRAME® is contraindicated in certain cases, notably with a pacemaker, a stent or some medical histories. In those situations, we don't perform it: your safety comes first.",
                )}
              </span>
            </p>
          </SplitSection>

          <FeatureGrid
            tone="soft"
            heading={
              <SectionHeading eyebrow={pick(l, "Les bienfaits", "The benefits")} title={pick(l, "Les bienfaits couramment observés", "Commonly observed benefits")}>
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
                  "Les émotions qui étaient figées se décristallisent, se dénouent et circulent à nouveau.",
                  "Emotions that had frozen decrystallize, loosen and flow again.",
                ),
              },
              {
                icon: <Sparkles className="h-6 w-6" />,
                title: pick(l, "Une clarté nouvelle", "New clarity"),
                body: pick(
                  l,
                  "Une clarification qui se fait, sur le plan émotionnel comme physique.",
                  "A clarification that settles in, on both the emotional and the physical level.",
                ),
              },
              {
                icon: <Compass className="h-6 w-6" />,
                title: pick(l, "La capacité de choisir", "The power to choose"),
                body: pick(
                  l,
                  "Retrouver la capacité de faire des choix et de prendre des décisions, plus simplement.",
                  "Regaining the capacity to make choices and decisions, more simply.",
                ),
              },
              {
                icon: <Sprout className="h-6 w-6" />,
                title: pick(l, "De nouveaux potentiels", "New potential"),
                body: pick(
                  l,
                  "Un élan qui se remet en mouvement, et des possibles qui s'ouvrent.",
                  "A momentum that starts moving again, and possibilities that open up.",
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
                title: pick(l, "La séance vibratoire", "The vibratory session"),
                body: pick(l, "La séance, douce et non intrusive : habillé·e, allongé·e, seize mouvements le long de la colonne.", "The gentle, non-intrusive session: dressed, lying down, sixteen movements along the spine."),
              },
              {
                title: pick(l, "Ressentir & intégrer", "Feel & integrate"),
                body: pick(l, "Un temps pour ressentir et laisser le mouvement s'installer.", "A time to feel and let the movement settle in."),
              },
            ]}
          />

          <QuoteBlock tone="warm" cite="Dimitri Gauthier">
            {pick(
              l,
              "Mon rôle, c'est de t'accueillir, de t'écouter, d'observer et d'éclairer ton chemin. Le reste, c'est le mouvement de guérison qui vient de l'intérieur de toi-même.",
              "My role is to welcome you, to listen, to observe and to shed light on your path. The rest is the healing movement that comes from within you.",
            )}
          </QuoteBlock>
        </>
      )}

      <CTABanner
        href={href(l, "reservation")}
        title={pick(l, "Envie de relâcher ce qui pèse ?", "Ready to release what weighs on you?")}
        sub={pick(l, "Réserve une séance de TRAME® et remets le mouvement en toi, en douceur.", "Book a TRAME® session and set movement back in you, gently.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </article>
  );
}
