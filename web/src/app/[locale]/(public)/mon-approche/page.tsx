// Mon approche — la synergie sexothérapie × TRAME® × numérologie.
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getContentPage } from "@/lib/data";
import { Prose } from "@/components/ui";
import { PageHero, SplitSection, FeatureGrid, QuoteBlock, CTABanner, SectionHeading, Pill } from "@/components/sections";
import { Brain, Waves, Heart } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "Mon approche · tête, corps & cœur", "My approach · mind, body & heart"),
    description: pick(
      l,
      "Une synergie unique entre sexothérapie, la TRAME® et numérologie pour aligner la tête, le corps et le cœur.",
      "A unique synergy between sex therapy, the TRAME® and numerology to align mind, body and heart.",
    ),
  };
}

export default async function ApproachPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const page = await getContentPage("mon-approche");
  const html = pick(l, page?.body_html, page?.body_html_en);

  return (
    <article>
      <PageHero
        tone="warm"
        eyebrow={pick(l, "Ma méthode", "My method")}
        title={
          l === "fr" ? (
            <>
              Une approche <em className="text-gradient not-italic">globale</em> : tête, corps &amp; cœur
            </>
          ) : (
            <>
              A <em className="text-gradient not-italic">holistic</em> approach: mind, body &amp; heart
            </>
          )
        }
        sub={pick(
          l,
          "Trois outils qui ne s'empilent pas mais se répondent, pour te réaligner en profondeur.",
          "Three tools that don't stack but answer one another, to realign you deeply.",
        )}
        badges={
          <>
            <Pill icon={<Brain className="h-4 w-4" />}>{pick(l, "La tête", "The mind")}</Pill>
            <Pill icon={<Waves className="h-4 w-4" />}>{pick(l, "Le corps", "The body")}</Pill>
            <Pill icon={<Heart className="h-4 w-4" />}>{pick(l, "Le cœur", "The heart")}</Pill>
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
            image="/img/detail.jpg"
            imageAlt=""
            eyebrow={pick(l, "Le point de départ", "The starting point")}
            title={pick(l, "S'accomplir, c'est un tout", "Flourishing is a whole")}
          >
            <p>
              {pick(
                l,
                "S'accomplir pleinement, ce n'est pas régler un seul problème isolé. C'est un ensemble : le sentimental, le professionnel, le sexuel. Très souvent, ce qui se joue dans la sexualité n'est pas la cause mais la conséquence. La vraie racine est ailleurs.",
                "Fully flourishing isn't about fixing one isolated problem. It's a whole: emotional life, work, sexuality. Very often, what plays out in sexuality isn't the cause but the consequence. The real root lies elsewhere.",
              )}
            </p>
            <p>
              {pick(
                l,
                "C'est pour ça que je combine trois outils. Non pas pour les empiler, mais pour créer une réelle synergie et te permettre de te réaligner toi-même.",
                "That's why I combine three tools. Not to stack them, but to create a real synergy so you can realign yourself.",
              )}
            </p>
          </SplitSection>

          <FeatureGrid
            tone="soft"
            heading={
              <SectionHeading
                eyebrow={pick(l, "Trois clés", "Three keys")}
                title={pick(l, "Trois outils, une synergie", "Three tools, one synergy")}
              >
                {pick(
                  l,
                  "Chacun agit sur une dimension. Ensemble, ils remettent toute ta vie en mouvement.",
                  "Each works on one dimension. Together, they set your whole life back in motion.",
                )}
              </SectionHeading>
            }
            items={[
              {
                icon: <Brain className="h-6 w-6" />,
                title: pick(l, "La tête", "The mind"),
                body: pick(
                  l,
                  "La sexothérapie pour comprendre, mettre des mots et déposer ce qui pèse.",
                  "Sex therapy to understand, put words to things and set down what weighs on you.",
                ),
              },
              {
                icon: <Waves className="h-6 w-6" />,
                title: pick(l, "Le corps", "The body"),
                body: pick(
                  l,
                  "La TRAME®, technique vibratoire, pour libérer les tensions du corps et remettre le mouvement.",
                  "The TRAME®, a vibratory technique, to release the body's tensions and set movement back in motion.",
                ),
              },
              {
                icon: <Heart className="h-6 w-6" />,
                title: pick(l, "Le cœur", "The heart"),
                body: pick(
                  l,
                  "La numérologie pour éclairer ton chemin et ce qui te ressemble vraiment.",
                  "Numerology to light up your path and what truly resembles you.",
                ),
              },
            ]}
          />

          <SplitSection
            reverse
            image="/img/cabinet-3.jpg"
            imageAlt=""
            eyebrow={pick(l, "Le principe", "The principle")}
            title={pick(l, "Aligner pour avancer", "Align to move forward")}
          >
            <p>
              {pick(
                l,
                "Le principe : aligner ces trois dimensions pour que ta vie soit plus juste, plus fluide, plus toi.",
                "The principle: aligning these three dimensions so your life becomes truer, smoother, more you.",
              )}
            </p>
            <p>
              {pick(
                l,
                "On ne suit pas un protocole figé : on choisit, à chaque étape, l'outil le plus juste pour ce que tu traverses.",
                "We don't follow a fixed protocol: at each step, we choose the tool that best fits what you're going through.",
              )}
            </p>
          </SplitSection>

          <QuoteBlock tone="warm" cite="Dimitri Gauthier">
            {pick(
              l,
              "Je ne fais pas de miracles et je ne te promets pas de solution magique. Le vrai thérapeute, c'est toi : je marche à tes côtés pour que tu trouves ton propre chemin.",
              "I don't perform miracles and I won't promise you a magic fix. The real therapist is you: I walk beside you so you find your own path.",
            )}
          </QuoteBlock>
        </>
      )}

      <CTABanner
        href={href(l, "reservation")}
        title={pick(l, "Prêt·e à te réaligner ?", "Ready to realign?")}
        sub={pick(l, "Réserve une première séance et avançons ensemble, à ton rythme.", "Book a first session and let's move forward together, at your own pace.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </article>
  );
}
