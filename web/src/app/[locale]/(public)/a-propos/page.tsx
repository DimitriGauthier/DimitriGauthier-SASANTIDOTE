// À propos — parcours de Dimitri. Contenu éditable via content_pages (slug "a-propos"), sinon fallback statique.
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getContentPage } from "@/lib/data";
import { PageTitle, Section, Prose, CTAButton } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "À propos — Dimitri Gauthier", "About — Dimitri Gauthier"),
    description: pick(
      l,
      "Sexothérapeute depuis 2006, certifié en TRAME® et numérologie. Un métier d'accompagnement, une vocation.",
      "Sex therapist since 2006, certified in TRAME® and numerology. A profession of support, a calling.",
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
      <PageTitle sub={pick(l, "Sexothérapeute — La Réunion & métropole", "Sex therapist — Réunion Island & mainland France")}>
        {pick(l, "À propos", "About")}
      </PageTitle>

      {html ? (
        <Prose html={html} />
      ) : (
        <>
          <Section>
            <p>
              {pick(
                l,
                "Je m'appelle Dimitri Gauthier. Depuis 2006, j'exerce des métiers d'accompagnement — c'est le fil rouge de ma vie. J'ai toujours aimé être aux côtés des gens pour les aider à avancer.",
                "My name is Dimitri Gauthier. Since 2006 I've worked in support professions — it's the common thread of my life. I've always loved being alongside people to help them move forward.",
              )}
            </p>
            <p>
              {pick(
                l,
                "Aujourd'hui, j'accompagne les hommes, les femmes et les couples sur leur sexualité et leur intimité. Mais je ne m'arrête pas là : quand quelqu'un va mal sexuellement, la cause est souvent ailleurs — dans le sentimental, le professionnel, le rapport à soi.",
                "Today I support men, women and couples with their sexuality and intimacy. But I don't stop there: when someone struggles sexually, the cause is often elsewhere — in their emotional life, their work, their relationship with themselves.",
              )}
            </p>
          </Section>

          <Section title={pick(l, "Mon parcours & mes certifications", "My background & certifications")}>
            <ul className="list-disc space-y-1 pl-6">
              <li>{pick(l, "Certification de sexothérapeute", "Sex therapy certification")}</li>
              <li>{pick(l, "Praticien certifié La TRAME®", "Certified TRAME® practitioner")}</li>
              <li>{pick(l, "Numérologue certifié", "Certified numerologist")}</li>
              <li>{pick(l, "Brevet d'État de coach sportif", "State diploma in sports coaching")}</li>
            </ul>
          </Section>

          <Section title={pick(l, "Ma vision", "My vision")}>
            <p>
              {pick(
                l,
                "Je ne fais pas de miracles. J'accompagne. Tu es ton propre thérapeute : mon rôle est de t'éclairer, de te donner des clés et de cheminer avec toi. L'objectif ? T'aider à t'accomplir pleinement — dans ta vie comme dans ton intimité.",
                "I don't perform miracles. I support. You are your own therapist: my role is to shed light, hand you keys and walk alongside you. The goal? Helping you fully flourish — in your life as in your intimacy.",
              )}
            </p>
          </Section>
        </>
      )}

      <div className="mt-10">
        <CTAButton href={href(l, "reservation")}>
          {pick(l, "Prendre rendez-vous", "Book an appointment")}
        </CTAButton>
      </div>
    </article>
  );
}
