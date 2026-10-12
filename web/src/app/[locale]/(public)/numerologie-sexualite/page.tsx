// Numérologie & sexualité — page thématique. Éditable via content_pages (slug "numerologie-sexualite").
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getContentPage } from "@/lib/data";
import { Prose } from "@/components/ui";
import { PageHero, SplitSection, QuoteBlock, CTABanner } from "@/components/sections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "Numérologie salomique", "Salomic numerology"),
    description: pick(
      l,
      "Comment la numérologie salomique éclaire votre chemin de vie, vos cycles et votre rapport à l'intimité.",
      "How salomic numerology sheds light on your life path, your cycles and your relationship to intimacy.",
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
        title={pick(l, "Numérologie salomique", "Salomic numerology")}
        sub={pick(
          l,
          "La sexualité repose sur trois piliers : le corps, l'éducation, la pensée. La numérologie salomique permet de lire ces trois dimensions à travers les nombres, révélant l'origine des blocages éducatifs et des dysfonctionnements mentaux qui influencent le désir. Elle offre ainsi une clé précise pour situer et dénouer le blocage.",
          "Sexuality rests on three pillars: the body, upbringing, thought. Salomic numerology reads these three dimensions through numbers, revealing the origin of educational blocks and mental dysfunctions that influence desire. It thus offers a precise key to locate and untie the block.",
        )}
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
            reverse
            image="/img/cabinet-3.jpg"
            imageAlt=""
            eyebrow={pick(l, "La méthode que j'utilise", "The method I use")}
            title={pick(l, "La numérologie salomique", "Salomic numerology")}
          >
            <p>
              {pick(
                l,
                "Globalement, c'est une méthode complète pour comprendre la personnalité, les motivations et les complexités de nos réactions et celles de notre environnement.",
                "Broadly, it is a complete method to understand personality, motivations and the complexities of our reactions and those of our environment.",
              )}
            </p>
          </SplitSection>

          <QuoteBlock tone="warm" cite="Dimitri Gauthier">
            {pick(
              l,
              "La numérologie salomique accompagne le travail thérapeutique en donnant du sens à ce que vous traversez.",
              "Salomic numerology supports therapeutic work by giving meaning to what you are going through.",
            )}
          </QuoteBlock>
        </>
      )}

      <CTABanner
        href={href(l, "reservation")}
        title={pick(l, "Envie d'y voir plus clair ?", "Want to see more clearly?")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </article>
  );
}
