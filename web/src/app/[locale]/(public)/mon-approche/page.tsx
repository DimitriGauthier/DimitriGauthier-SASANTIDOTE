// Mon approche — la synergie sexothérapie × TRAME® × numérologie.
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getContentPage } from "@/lib/data";
import { PageTitle, Section, Prose, IconCard, CTASection } from "@/components/ui";
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
      "Une synergie unique entre sexothérapie, TRAME® et numérologie pour aligner la tête, le corps et le cœur.",
      "A unique synergy between sex therapy, TRAME® and numerology to align mind, body and heart.",
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
      <PageTitle
        eyebrow={pick(l, "Ma méthode", "My method")}
        sub={pick(l, "Une approche globale : tête, corps et cœur", "A holistic approach: mind, body and heart")}
      >
        {pick(l, "Mon approche", "My approach")}
      </PageTitle>

      {html ? (
        <Prose html={html} />
      ) : (
        <>
          <Section>
            <p>
              {pick(
                l,
                "S'accomplir pleinement, ce n'est pas régler un seul problème isolé. C'est un ensemble : le sentimental, le professionnel, le sexuel. Quelqu'un qui va mal dans sa sexualité porte souvent une difficulté qui vient d'ailleurs.",
                "Fully flourishing isn't about fixing one isolated problem. It's a whole: emotional life, work, sexuality. Someone struggling with their sexuality often carries a difficulty that comes from elsewhere.",
              )}
            </p>
            <p>
              {pick(
                l,
                "C'est pour ça que je combine trois outils. Non pas pour les empiler, mais pour créer une réelle synergie et t'aider à te réaligner.",
                "That's why I combine three tools. Not to stack them, but to create a real synergy and help you realign.",
              )}
            </p>
          </Section>

          <Section title={pick(l, "Trois outils, une synergie", "Three tools, one synergy")}>
            <div className="mb-5 grid gap-5 sm:grid-cols-3">
              <IconCard icon={<Brain className="h-5 w-5" />} title={pick(l, "La tête", "The mind")}>
                {pick(
                  l,
                  "La sexothérapie pour comprendre, mettre des mots et déposer ce qui pèse.",
                  "Sex therapy to understand, put words to things and set down what weighs on you.",
                )}
              </IconCard>
              <IconCard icon={<Waves className="h-5 w-5" />} title={pick(l, "Le corps", "The body")}>
                {pick(
                  l,
                  "La TRAME® pour libérer les tensions et remettre l'énergie en mouvement.",
                  "TRAME® to release tension and set the energy back in motion.",
                )}
              </IconCard>
              <IconCard icon={<Heart className="h-5 w-5" />} title={pick(l, "Le cœur", "The heart")}>
                {pick(
                  l,
                  "La numérologie pour éclairer ton chemin et ce qui te ressemble vraiment.",
                  "Numerology to light up your path and what truly resembles you.",
                )}
              </IconCard>
            </div>
            <p>
              {pick(
                l,
                "Le principe : aligner ces trois dimensions pour que ta vie soit plus juste, plus fluide, plus toi.",
                "The principle: aligning these three dimensions so your life becomes truer, smoother, more you.",
              )}
            </p>
          </Section>

          <Section title={pick(l, "Ce que je ne suis pas", "What I am not")}>
            <p>
              {pick(
                l,
                "Je ne fais pas de miracles. Je ne te promets pas une solution magique. Je t'accompagne, avec honnêteté et bienveillance. Le vrai thérapeute, c'est toi : je marche à tes côtés pour que tu trouves ton propre chemin.",
                "I don't perform miracles. I won't promise you a magic fix. I support you, honestly and with care. The real therapist is you: I walk beside you so you find your own path.",
              )}
            </p>
          </Section>
        </>
      )}

      <CTASection
        href={href(l, "reservation")}
        title={pick(l, "Prêt·e à te réaligner ?", "Ready to realign?")}
        sub={pick(l, "Réserve une première séance et avançons ensemble, à ton rythme.", "Book a first session and let's move forward together, at your own pace.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </article>
  );
}
