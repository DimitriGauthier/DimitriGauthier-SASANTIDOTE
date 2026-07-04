// Numérologie & sexualité — page thématique. Éditable via content_pages (slug "numerologie-sexualite").
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
      <PageTitle sub={pick(l, "Un éclairage sur ton chemin de vie", "Insight into your life path")}>
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
            <ul className="list-disc space-y-1 pl-6">
              <li>{pick(l, "Mieux comprendre tes cycles et tes moments-clés", "Better understanding your cycles and key moments")}</li>
              <li>{pick(l, "Repérer ce qui te ressemble vraiment", "Spotting what truly resembles you")}</li>
              <li>{pick(l, "Donner du sens à tes blocages et à tes élans", "Giving meaning to your blocks and drives")}</li>
              <li>{pick(l, "Poser des choix plus alignés, dans ta vie et ton couple", "Making more aligned choices, in your life and your relationship")}</li>
            </ul>
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
