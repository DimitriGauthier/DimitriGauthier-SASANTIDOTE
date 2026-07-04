// Blog — liste des articles publiés. En EN, seuls les articles traduits sont listés.
import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getPublishedArticles } from "@/lib/data";
import { formatDayLabel } from "@/lib/format";
import { PageTitle, Card, EmptyState } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "Blog", "Blog"),
    description: pick(
      l,
      "Articles et réflexions sur la sexualité, le couple, la TRAME® et la numérologie.",
      "Articles and reflections on sexuality, couples, TRAME® and numerology.",
    ),
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const articles = await getPublishedArticles(l);

  return (
    <div>
      <PageTitle
        eyebrow={pick(l, "Le journal", "The journal")}
        sub={pick(l, "Réflexions & ressources", "Reflections & resources")}
      >
        {pick(l, "Blog", "Blog")}
      </PageTitle>

      {articles.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {articles.map((a) => {
            const slug = pick(l, a.slug, a.slug_en) ?? a.slug;
            return (
              <Card key={a.id} className="group transition-shadow hover:shadow-soft">
                <Link href={href(l, `blog/${slug}`)} className="block">
                  <h2 className="font-serif text-xl font-medium text-foreground transition-colors group-hover:text-primary">{pick(l, a.title, a.title_en)}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.published_at ? formatDayLabel(a.published_at, l) : ""}
                    {a.reading_minutes ? ` · ${a.reading_minutes} min` : ""}
                  </p>
                  {pick(l, a.excerpt, a.excerpt_en) ? (
                    <p className="mt-2 text-sm text-muted-foreground">{pick(l, a.excerpt, a.excerpt_en)}</p>
                  ) : null}
                  <span className="story-link mt-3 inline-block text-sm font-medium text-primary">
                    {pick(l, "Lire la suite", "Read more")} →
                  </span>
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState>
          {pick(l, "Les premiers articles arrivent bientôt.", "The first articles are coming soon.")}
        </EmptyState>
      )}
    </div>
  );
}
