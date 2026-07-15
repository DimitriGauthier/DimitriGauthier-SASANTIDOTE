// À propos — parcours de Dimitri. Contenu éditable via content_pages (slug "a-propos"), sinon fallback riche.
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getContentPage } from "@/lib/data";
import { Prose } from "@/components/ui";
import { PageHero, SplitSection, Timeline, FeatureGrid, QuoteBlock, CTABanner, SectionHeading, Pill } from "@/components/sections";
import { Award, Sparkles, Compass, Dumbbell, MapPin, Video } from "lucide-react";

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
      "Sexothérapeute depuis 2006, certifié La TRAME® et en numérologie. Un métier d'accompagnement, une vocation.",
      "Sex therapist since 2006, certified in the TRAME® and numerology. A profession of support, a calling.",
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
          "Sexothérapeute à La Réunion et en visio partout dans le monde. Depuis près de vingt ans, mon métier est d'accompagner.",
          "Sex therapist on Réunion Island and online worldwide. For nearly twenty years, my work has been to support people.",
        )}
        image="/img/coach.jpg"
        imageAlt="Dimitri Gauthier"
        badges={
          <>
            <Pill icon={<MapPin className="h-4 w-4" />}>{pick(l, "La Réunion", "Réunion Island")}</Pill>
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
                "Je m'appelle Dimitri Gauthier. Depuis 2006, j'exerce des métiers d'accompagnement, c'est le fil rouge de ma vie. J'ai toujours aimé être aux côtés des gens et cheminer avec eux. Ce qui me porte, ce n'est pas une méthode toute faite : c'est l'expérience, le vécu, les années passées à écouter.",
                "My name is Dimitri Gauthier. Since 2006 I've worked in support professions, and it's the common thread of my life. I've always loved being beside people and walking with them. What carries me isn't a ready-made method: it's experience, real life, the years spent listening.",
              )}
            </p>
            <p>
              {pick(
                l,
                "Aujourd'hui, j'accompagne les hommes, les femmes et les couples sur leur sexualité et leur intimité. Mais je ne m'arrête pas là : quand quelqu'un va mal sexuellement, la cause est souvent ailleurs, dans le sentimental, le professionnel, le rapport à soi.",
                "Today I support men, women and couples with their sexuality and intimacy. But I don't stop there: when someone struggles sexually, the cause is often elsewhere, in their emotional life, their work, their relationship with themselves.",
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
                title: pick(l, "Sexothérapie, la TRAME® & numérologie", "Sex therapy, the TRAME® & numerology"),
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
                  "J'accompagne hommes, femmes et couples, en cabinet à La Réunion comme en visio partout dans le monde.",
                  "I support men, women and couples, in person on Réunion Island and online worldwide.",
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
              { icon: <Compass className="h-6 w-6" />, title: pick(l, "Numérologie", "Numerology"), body: pick(l, "Numérologue certifié.", "Certified numerologist.") },
              { icon: <Dumbbell className="h-6 w-6" />, title: pick(l, "Coaching", "Coaching"), body: pick(l, "Brevet d'État d'éducateur sportif (2003).", "State diploma in sports education (2003).") },
            ]}
          />

          <QuoteBlock tone="warm" cite="Dimitri Gauthier">
            {pick(
              l,
              "Je ne fais pas de miracles. J'accompagne. Tu es ton propre thérapeute : mon rôle est de t'éclairer, de te donner des clés et de cheminer avec toi.",
              "I don't perform miracles. I support. You are your own therapist: my role is to shed light, hand you keys and walk alongside you.",
            )}
          </QuoteBlock>
        </>
      )}

      <CTABanner
        href={href(l, "reservation")}
        title={pick(l, "Faisons connaissance", "Let's get to know each other")}
        sub={pick(l, "Réserve une première séance, en toute confidentialité.", "Book a first session, in full confidentiality.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </article>
  );
}
