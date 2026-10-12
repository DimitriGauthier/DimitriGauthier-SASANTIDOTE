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
      "Une synergie unique entre sexothérapie, la TRAME® et numérologie salomique pour aligner la tête, le corps et le cœur.",
      "A unique synergy between sex therapy, the TRAME® and salomic numerology to align mind, body and heart.",
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
                "C'est pour ça que je combine trois outils. Non pas pour les empiler, mais pour créer une réelle synergie et vous permettre de vous réaligner vous-même.",
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
              />
            }
            items={[
              {
                icon: <Brain className="h-6 w-6" />,
                title: pick(l, "La tête", "The mind"),
                body: pick(
                  l,
                  "Croyances, schéma de pensées, éducation reçue.",
                  "Beliefs, thought patterns, upbringing.",
                ),
              },
              {
                icon: <Waves className="h-6 w-6" />,
                title: pick(l, "Le corps", "The body"),
                body: pick(
                  l,
                  "Les mémoires physiques.",
                  "The body's memories.",
                ),
              },
              {
                icon: <Heart className="h-6 w-6" />,
                title: pick(l, "Le cœur", "The heart"),
                body: pick(
                  l,
                  "Les émotions.",
                  "The emotions.",
                ),
              },
            ]}
          />

          <SplitSection
            reverse
            image="/img/cabinet-3.jpg"
            imageAlt=""
            eyebrow={pick(l, "Le principe", "The principle")}
            title={pick(l, "S'aligner pour avancer", "Align to move forward")}
          >
            <p>
              {pick(
                l,
                "Chaque séance est différente car je m'adapte à vos problématiques et vos besoins du moment, aucun protocole figé.",
                "Each session is different, because I adapt to your challenges and your needs of the moment. No fixed protocol.",
              )}
            </p>
          </SplitSection>

          <QuoteBlock tone="warm" cite="Dimitri Gauthier">
            {pick(
              l,
              "Mon rôle en tant qu'accompagnant est de vous accueillir, vous écouter, observer et éclairer votre chemin. Libérer le mouvement de guérison qui vient de l'intérieur de vous-même.",
              "My role as a companion is to welcome you, to listen to you, to observe and to light up your path. To free the movement of healing that comes from within you.",
            )}
          </QuoteBlock>
        </>
      )}

      <CTABanner
        href={href(l, "reservation")}
        title={pick(l, "Réservez une séance", "Book a session")}
        sub={pick(l, "Réservez une première séance et avançons ensemble, à votre rythme.", "Book a first session and let's move forward together, at your own pace.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </article>
  );
}
