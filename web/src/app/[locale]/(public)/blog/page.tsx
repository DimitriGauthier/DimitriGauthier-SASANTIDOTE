// Blog — liste des articles publiés. En EN, seuls les articles traduits sont listés.
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href, experienceHref } from "@/lib/site";
import { getPublishedArticles } from "@/lib/data";
import { formatDayLabel } from "@/lib/format";
import { EmptyState } from "@/components/ui";
import { PageHero, CTABanner } from "@/components/sections";
import Reveal from "@/components/Reveal";
import { ArrowRight } from "lucide-react";

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
      "Articles and reflections on sexuality, couples, the TRAME® and numerology.",
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
      <PageHero
        eyebrow={pick(l, "Le journal", "The journal")}
        title={pick(l, "Réflexions & ressources", "Reflections & resources")}
        sub={pick(
          l,
          "Des articles pour comprendre, prendre du recul et avancer : sexualité, couple, la TRAME® et numérologie.",
          "Articles to understand, step back and move forward: sexuality, couples, the TRAME® and numerology.",
        )}
      />

      {/* CTA obligatoire : redirige vers l'expérience INTIMY (sous-domaine dédié). */}
      <div className="mx-auto max-w-6xl px-4">
        <a
          href={experienceHref(l)}
          className="experience-btn group mx-auto mt-10 flex w-full max-w-md items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-soft transition-transform duration-300 hover:-translate-y-0.5"
        >
          {pick(l, "Tente l'expérience", "Try the experience")}
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>
      </div>

      <section className="full-bleed py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          {articles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((a, i) => {
                const slug = pick(l, a.slug, a.slug_en) ?? a.slug;
                const cover = a.cover_image_url;
                return (
                  <Reveal key={a.id} delay={(i % 3) * 100}>
                    <Link
                      href={href(l, `blog/${slug}`)}
                      className="hover-lift group flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        {cover ? (
                          <Image
                            src={cover}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-warm">
                            <span className="font-serif text-2xl text-primary/40">INTIMY</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <p className="text-xs text-muted-foreground">
                          {a.published_at ? formatDayLabel(a.published_at, l) : ""}
                          {a.reading_minutes ? ` · ${a.reading_minutes} min` : ""}
                        </p>
                        <h2 className="mt-2 font-serif text-xl font-medium text-foreground transition-colors group-hover:text-primary">
                          {pick(l, a.title, a.title_en)}
                        </h2>
                        {pick(l, a.excerpt, a.excerpt_en) ? (
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{pick(l, a.excerpt, a.excerpt_en)}</p>
                        ) : <div className="flex-1" />}
                        <span className="story-link mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                          {pick(l, "Lire la suite", "Read more")} <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <EmptyState>
              {pick(l, "Les premiers articles arrivent bientôt.", "The first articles are coming soon.")}
            </EmptyState>
          )}
        </div>
      </section>

      <CTABanner
        href={href(l, "reservation")}
        title={pick(l, "Envie d'en parler ?", "Want to talk about it?")}
        sub={pick(l, "Réserve une séance et avançons ensemble, à ton rythme.", "Book a session and let's move forward together, at your own pace.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </div>
  );
}
