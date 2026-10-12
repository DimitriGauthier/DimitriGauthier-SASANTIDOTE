// À propos — parcours de Dimitri. Contenu éditable via content_pages (slug "a-propos"), sinon fallback riche.
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getContentPage } from "@/lib/data";
import { Prose } from "@/components/ui";
import { PageHero, SplitSection, Timeline, FeatureGrid, QuoteBlock, CTABanner, SectionHeading, Pill } from "@/components/sections";
import { Award, Sparkles, Compass, Dumbbell, Video } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "À propos · Dimitri Gauthier", "About · Dimitri Gauthier"),
    description: pick(
      l,
      "Sexothérapeute depuis 2006, certifié La TRAME® et en numérologie salomique. Un métier d'accompagnement, une vocation.",
      "Sex therapist since 2006, certified in the TRAME® and salomic numerology. A profession of support, a calling.",
    ),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const page = await getContentPage("a-propos");
  const html = pick(l, page?.body_html, page?.body_html_en);

  return (
    <article>
      <PageHero
        eyebrow={pick(l, "Qui je suis", "Who I am")}
        title={pick(l, "À propos", "About")}
        sub={pick(
          l,
          "Je suis Dimitri Gauthier. Depuis plus de 20 ans, j'accompagne mes clients à se sentir mieux dans leur corps, mieux dans leur tête et à écouter leur cœur.",
          "I am Dimitri Gauthier. For over 20 years, I have helped my clients feel better in their body, better in their mind and listen to their heart.",
        )}
        image="/img/coach.jpg"
        imageAlt="Dimitri Gauthier"
        badges={
          <>
            <Pill icon={<Video className="h-4 w-4" />}>{pick(l, "Consultations en visio", "Online sessions")}</Pill>
            <Pill icon={<Award className="h-4 w-4" />}>{pick(l, "Certifié depuis 2006", "Certified since 2006")}</Pill>
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
            eyebrow={pick(l, "Mon histoire", "My story")}
            title={pick(l, "Un fil rouge : accompagner", "One common thread: to support")}
          >
            <p>
              {pick(
                l,
                "Aujourd'hui, j'accompagne les hommes, les femmes, les couples et les adolescents sur leur sexualité et leur intimité.",
                "Today I support men, women, couples and teenagers with their sexuality and intimacy.",
              )}
            </p>
            <p>
              {pick(
                l,
                "Fort de mon expérience, j'accompagne homme, femme, couple et adolescent en visio partout dans le monde.",
                "Drawing on my experience, I support men, women, couples and teenagers by video, everywhere in the world.",
              )}
            </p>
          </SplitSection>

          <Timeline
            tone="soft"
            heading={
              <SectionHeading eyebrow={pick(l, "Parcours", "Journey")} title={pick(l, "Un chemin, pas à pas", "A path, step by step")} />
            }
            items={[
              {
                marker: pick(l, "Depuis 2006", "Since 2006"),
                title: pick(l, "Les métiers de l'accompagnement", "The support professions"),
                body: pick(
                  l,
                  "Le début d'une vocation : être présent aux côtés des personnes et les accompagner sur leur chemin.",
                  "The start of a calling: being present beside people and supporting them on their path.",
                ),
              },
              {
                marker: pick(l, "Formations & certifications", "Training & certifications"),
                title: pick(l, "Sexothérapie, la TRAME® & numérologie salomique", "Sex therapy, the TRAME® & salomic numerology"),
                body: pick(
                  l,
                  "Trois approches complémentaires, réunies pour relier la tête, le corps et le cœur.",
                  "Three complementary approaches, brought together to connect mind, body and heart.",
                ),
              },
              {
                marker: pick(l, "Aujourd'hui", "Today"),
                title: pick(l, "Accompagnant en intime", "Companion in intimacy"),
                body: pick(
                  l,
                  "J'accompagne hommes, femmes, couples et adolescents, en visio partout dans le monde.",
                  "I support men, women, couples and teenagers, online worldwide.",
                ),
              },
            ]}
          />

          <FeatureGrid
            cols={4}
            tone="plain"
            heading={
              <SectionHeading
                eyebrow={pick(l, "Certifications", "Certifications")}
                title={pick(l, "Mes formations", "My qualifications")}
              >
                {pick(
                  l,
                  "Un socle solide, au service d'un accompagnement honnête et sur mesure.",
                  "A solid foundation, in service of honest, tailored support.",
                )}
              </SectionHeading>
            }
            items={[
              { icon: <Award className="h-6 w-6" />, title: pick(l, "Sexothérapie", "Sex therapy"), body: pick(l, "Certifié par la Secret Therapy Academy.", "Certified by the Secret Therapy Academy.") },
              { icon: <Sparkles className="h-6 w-6" />, title: "La TRAME®", body: pick(l, "Praticien certifié, formé en 2020.", "Certified practitioner, trained in 2020.") },
              { icon: <Compass className="h-6 w-6" />, title: pick(l, "Numérologie salomique", "Salomic numerology"), body: pick(l, "Lecture salomique des nombres.", "Salomic reading of numbers.") },
              { icon: <Dumbbell className="h-6 w-6" />, title: pick(l, "Coaching", "Coaching"), body: pick(l, "Brevet d'État d'éducateur sportif (2003).", "State diploma in sports education (2003).") },
            ]}
          />

          <QuoteBlock tone="warm" cite="Dimitri Gauthier">
            {pick(
              l,
              "Je ne fais pas de miracles. J'accompagne. Vous êtes votre propre thérapeute : mon rôle est de vous éclairer, de vous donner des clés et de cheminer avec vous.",
              "I don't perform miracles. I support. You are your own therapist: my role is to shed light, hand you keys and walk alongside you.",
            )}
          </QuoteBlock>
        </>
      )}

      <CTABanner
        href={href(l, "reservation")}
        title={pick(l, "Faisons connaissance", "Let's get to know each other")}
        sub={pick(l, "Réservez une première séance, en toute confidentialité.", "Book a first session, in full confidentiality.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </article>
  );
}
