// Numérologie & sexualité — page thématique. Éditable via content_pages (slug "numerologie-sexualite").
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getContentPage } from "@/lib/data";
import { PageTitle, Section, Prose, CTASection } from "@/components/ui";
import { Check } from "lucide-react";

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
      <PageTitle
        eyebrow={pick(l, "Symboles & sens", "Symbols & meaning")}
        sub={pick(l, "Un éclairage sur ton chemin de vie", "Insight into your life path")}
      >
        {pick(l, "Numérologie & sexualité", "Numerology & sexuality")}
      </PageTitle>

      {html ? (
        <Prose html={html} />
      ) : (
        <>
          <Section>
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
                "Sur le plan intime, cet éclairage aide à comprendre ta manière d'aimer, de désirer, de te lier. Il ne remplace pas le travail thérapeutique : il l'accompagne, en donnant du sens à ce que tu traverses.",
                "On an intimate level, this insight helps you understand how you love, desire and connect. It doesn't replace therapeutic work: it supports it, giving meaning to what you're going through.",
              )}
            </p>
          </Section>

          <Section title={pick(l, "Ce que la numérologie apporte", "What numerology brings")}>
            <ul className="space-y-3">
              {[
                pick(l, "Mieux comprendre tes cycles et tes moments-clés", "Better understanding your cycles and key moments"),
                pick(l, "Repérer ce qui te ressemble vraiment", "Spotting what truly resembles you"),
                pick(l, "Donner du sens à tes blocages et à tes élans", "Giving meaning to your blocks and drives"),
                pick(l, "Poser des choix plus alignés, dans ta vie et ton couple", "Making more aligned choices, in your life and your relationship"),
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>
        </>
      )}

      <CTASection
        href={href(l, "reservation")}
        title={pick(l, "Envie d'y voir plus clair ?", "Want to see more clearly?")}
        sub={pick(l, "Réserve une séance et donnons du sens à ton chemin.", "Book a session and let's give meaning to your path.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </article>
  );
}
