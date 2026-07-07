// Numérologie & sexualité — page thématique. Éditable via content_pages (slug "numerologie-sexualite").
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getContentPage } from "@/lib/data";
import { Prose } from "@/components/ui";
import { PageHero, SplitSection, FeatureGrid, QuoteBlock, CTABanner, SectionHeading, Pill } from "@/components/sections";
import { Compass, Calendar, Fingerprint, Sparkles, Hash } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "Numérologie & sexualité", "Numerology & sexuality"),
    description: pick(
      l,
      "Comment la numérologie éclaire ton chemin de vie, tes cycles et ton rapport à l'intimité.",
      "How numerology sheds light on your life path, your cycles and your relationship to intimacy.",
    ),
  };
}

export default async function NumerologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const page = await getContentPage("numerologie-sexualite");
  const html = pick(l, page?.body_html, page?.body_html_en);

  return (
    <article>
      <PageHero
        eyebrow={pick(l, "Symboles & sens", "Symbols & meaning")}
        title={pick(l, "Numérologie & sexualité", "Numerology & sexuality")}
        sub={pick(
          l,
          "Un langage de symboles pour éclairer ton chemin de vie, tes cycles et ta manière d'aimer.",
          "A language of symbols to light up your life path, your cycles and your way of loving.",
        )}
        badges={
          <>
            <Pill icon={<Hash className="h-4 w-4" />}>{pick(l, "Chemin de vie", "Life path")}</Pill>
            <Pill icon={<Calendar className="h-4 w-4" />}>{pick(l, "Cycles", "Cycles")}</Pill>
            <Pill icon={<Compass className="h-4 w-4" />}>{pick(l, "Éclairage, pas prédiction", "Insight, not prediction")}</Pill>
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
            image="/img/cabinet-2.jpg"
            imageAlt=""
            eyebrow={pick(l, "En quoi ça consiste", "What it is")}
            title={pick(l, "Un langage de symboles", "A language of symbols")}
          >
            <p>
              {pick(
                l,
                "La numérologie est un langage de symboles. À partir de ta date de naissance et de ton nom, elle dessine une carte : tes élans, tes forces, tes cycles, les périodes où l'on avance et celles où l'on se recentre.",
                "Numerology is a language of symbols. From your date of birth and your name, it draws a map: your drives, your strengths, your cycles, the periods when we move forward and those when we refocus.",
              )}
            </p>
            <p>
              {pick(
                l,
                "Sur le plan intime, cet éclairage aide à comprendre ta manière d'aimer, de désirer, de te lier.",
                "On an intimate level, this insight helps you understand how you love, desire and connect.",
              )}
            </p>
          </SplitSection>

          <FeatureGrid
            cols={4}
            tone="soft"
            heading={
              <SectionHeading eyebrow={pick(l, "Ce que ça t'apporte", "What it brings you")} title={pick(l, "Ce que la numérologie apporte", "What numerology brings")} />
            }
            items={[
              {
                icon: <Calendar className="h-6 w-6" />,
                title: pick(l, "Tes cycles", "Your cycles"),
                body: pick(l, "Mieux comprendre tes cycles et tes moments-clés.", "Better understanding your cycles and key moments."),
              },
              {
                icon: <Fingerprint className="h-6 w-6" />,
                title: pick(l, "Ce qui te ressemble", "What resembles you"),
                body: pick(l, "Repérer ce qui te ressemble vraiment.", "Spotting what truly resembles you."),
              },
              {
                icon: <Sparkles className="h-6 w-6" />,
                title: pick(l, "Du sens", "Meaning"),
                body: pick(l, "Donner du sens à tes blocages et à tes élans.", "Giving meaning to your blocks and drives."),
              },
              {
                icon: <Compass className="h-6 w-6" />,
                title: pick(l, "Des choix alignés", "Aligned choices"),
                body: pick(l, "Poser des choix plus alignés, dans ta vie et ton couple.", "Making more aligned choices, in your life and your relationship."),
              },
            ]}
          />

          <QuoteBlock tone="warm">
            {pick(
              l,
              "La numérologie ne remplace pas le travail thérapeutique : elle l'accompagne, en donnant du sens à ce que tu traverses.",
              "Numerology doesn't replace therapeutic work: it supports it, giving meaning to what you're going through.",
            )}
          </QuoteBlock>
        </>
      )}

      <CTABanner
        href={href(l, "reservation")}
        title={pick(l, "Envie d'y voir plus clair ?", "Want to see more clearly?")}
        sub={pick(l, "Réserve une séance et donnons du sens à ton chemin.", "Book a session and let's give meaning to your path.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </article>
  );
}
