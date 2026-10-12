// La TRAME® — page thématique. Éditable via content_pages (slug "la-trame").
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getContentPage } from "@/lib/data";
import { Prose } from "@/components/ui";
import { PageHero, SplitSection, FeatureGrid, CTABanner, SectionHeading, Pill } from "@/components/sections";
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
        sub={pick(l, "Se reconnecter à soi.", "Reconnecting with yourself.")}
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
                "La TRAME® est une technique vibratoire qui a pour but de rétablir la circulation de l'information qui peut être perturbée par des obstacles que l'on se crée, liés aux émotions conscientisées ou non.",
                "The TRAME® is a vibratory technique whose purpose is to restore the circulation of information that can be disrupted by obstacles we create for ourselves, tied to emotions, conscious or not.",
              )}
            </p>
            <p>
              {pick(
                l,
                "La TRAME® permet de faire ou de refaire circuler l'information de manière harmonieuse.",
                "The TRAME® lets this information flow, or flow again, in a harmonious way.",
              )}
            </p>
            <p className="flex items-start gap-2.5 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground/80">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{pick(l, "Certifié depuis 2020.", "Certified since 2020.")}</span>
            </p>
            <p className="flex items-start gap-2.5 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-foreground/80">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>
                {pick(
                  l,
                  "Un préalable indispensable : nous discutons avant toute séance afin de faire connaissance et de nous assurer d'aucune contre-indication.",
                  "A necessary first step: we talk before any session to get to know each other and make sure there is no contraindication.",
                )}
              </span>
            </p>
          </SplitSection>

          <FeatureGrid
            tone="soft"
            heading={
              <SectionHeading eyebrow={pick(l, "Les bienfaits", "The benefits")} title={pick(l, "Les bienfaits couramment observés", "Commonly observed benefits")} />
            }
            items={[
              {
                icon: <Feather className="h-6 w-6" />,
                title: pick(l, "Apaisement", "Calm"),
                body: pick(l, "Moins d'agitation mentale.", "Less mental agitation."),
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

        </>
      )}

      <CTABanner
        href={href(l, "reservation")}
        title={pick(l, "Envie de réserver une séance de TRAME ?", "Want to book a TRAME® session?")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </article>
  );
}
