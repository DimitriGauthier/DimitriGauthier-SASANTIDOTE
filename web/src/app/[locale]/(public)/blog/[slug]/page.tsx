// Article de blog. Le corps est du HTML stocké en DB (rendu via Prose).
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getArticleBySlug } from "@/lib/data";
import { formatDayLabel } from "@/lib/format";
import { Prose } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const article = await getArticleBySlug(slug, l);
  if (!article) return { title: pick(l, "Article", "Article") };
  return {
    title: pick(l, article.seo_title ?? article.title, article.seo_title_en ?? article.title_en),
    description: pick(l, article.seo_description ?? article.excerpt, article.seo_description_en ?? article.excerpt_en) ?? undefined,
    openGraph: article.og_image_url ? { images: [article.og_image_url] } : undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const article = await getArticleBySlug(slug, l);
  if (!article) notFound();

  const body = pick(l, article.body_html, article.body_html_en);

  return (
    <article className="mx-auto max-w-3xl pt-6 sm:pt-8">
      <Link href={href(l, "blog")} className="story-link text-sm text-muted-foreground hover:text-primary">
        ← {pick(l, "Tous les articles", "All articles")}
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        {pick(l, article.title, article.title_en)}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {article.published_at ? formatDayLabel(article.published_at, l) : ""}
        {article.reading_minutes ? ` · ${article.reading_minutes} min` : ""}
      </p>
      {article.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.cover_image_url}
          alt=""
          className="mt-6 w-full rounded-2xl border border-border object-cover shadow-card"
        />
      ) : null}
      <div className="mt-8">
        {body ? <Prose html={body} /> : <p className="text-muted-foreground">{pick(l, "Contenu à venir.", "Content coming soon.")}</p>}
      </div>
    </article>
  );
}
