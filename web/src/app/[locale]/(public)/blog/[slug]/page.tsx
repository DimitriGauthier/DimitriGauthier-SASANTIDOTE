// Article de blog. Le corps est du HTML stocké en DB (rendu via Prose).
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href, experienceHref } from "@/lib/site";
import { getArticleBySlug } from "@/lib/data";
import { formatDayLabel } from "@/lib/format";
import { Prose } from "@/components/ui";
import { ArrowRight } from "lucide-react";

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
          className="mt-6 aspect-[16/9] w-full rounded-2xl border border-border object-cover shadow-card"
        />
      ) : null}
      <div className="mt-8">
        {body ? <Prose html={body} /> : <p className="text-muted-foreground">{pick(l, "Contenu à venir.", "Content coming soon.")}</p>}
      </div>

      {/* CTA obligatoire : redirige vers l'expérience INTIMY (sous-domaine dédié). */}
      <div className="mt-14 rounded-3xl border border-primary/15 bg-gradient-warm p-8 text-center shadow-card sm:p-10">
        <h2 className="font-serif text-2xl font-medium text-foreground">
          {pick(l, "Prêt·e à ressentir la différence ?", "Ready to feel the difference?")}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {pick(
            l,
            "Lance ton parcours guidé et découvre l'expérience INTIMY.",
            "Start your guided journey and discover the INTIMY experience.",
          )}
        </p>
        <a
          href={experienceHref(l)}
          className="experience-btn group mt-6 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-soft transition-transform duration-300 hover:-translate-y-0.5"
        >
          {pick(l, "Tente l'expérience", "Try the experience")}
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>
      </div>
    </article>
  );
}
