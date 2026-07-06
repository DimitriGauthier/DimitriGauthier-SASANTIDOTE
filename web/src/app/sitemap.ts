// Sitemap dynamique — Next.js le sert sur /sitemap.xml.
// Positionnement mondial : deux langues (fr/en) référencées à parts égales, avec
// hreflang (alternates.languages) pour que Google serve la bonne langue à chaque
// visiteur, où qu'il soit dans le monde.
import type { MetadataRoute } from "next";
import { CANONICAL_SITE, navItems } from "@/lib/site";
import { getPublishedArticles } from "@/lib/data";
import type { Locale } from "@/lib/i18n";

const LOCALES: Locale[] = ["fr", "en"];

function url(locale: Locale, slug = ""): string {
  return `${CANONICAL_SITE}/${locale}${slug ? `/${slug}` : ""}`;
}

/** Entrée bilingue : une URL par langue + hreflang réciproque. */
function bilingual(
  slugs: { fr: string; en: string },
  opts: { changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"]; priority?: number; lastModified?: string | Date } = {},
): MetadataRoute.Sitemap {
  const languages = {
    fr: url("fr", slugs.fr),
    en: url("en", slugs.en),
    "x-default": url("fr", slugs.fr),
  };
  return LOCALES.map((l) => ({
    url: url(l, l === "fr" ? slugs.fr : slugs.en),
    lastModified: opts.lastModified,
    changeFrequency: opts.changeFrequency ?? "monthly",
    priority: opts.priority ?? 0.6,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Pages statiques : les slugs de nav sont partagés entre fr/en (mêmes dossiers).
  const staticSlugs = ["", ...navItems.map((n) => n.slug), "confidentialite", "mentions-legales"];
  const staticEntries = staticSlugs.flatMap((slug) =>
    bilingual(
      { fr: slug, en: slug },
      {
        priority: slug === "" ? 1 : slug === "blog" ? 0.7 : 0.6,
        changeFrequency: slug === "" || slug === "blog" ? "weekly" : "monthly",
        lastModified: now,
      },
    ),
  );

  // Articles de blog publiés (slug localisé). On tolère l'absence de backend.
  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const [fr, en] = await Promise.all([
      getPublishedArticles("fr"),
      getPublishedArticles("en"),
    ]);
    const enBySlugFr = new Map(en.map((a) => [a.slug, a.slug_en]));
    articleEntries = fr.flatMap((a) => {
      const enSlug = enBySlugFr.get(a.slug) ?? null;
      const lastModified = a.published_at ? new Date(a.published_at) : now;
      if (enSlug) {
        return bilingual(
          { fr: `blog/${a.slug}`, en: `blog/${enSlug}` },
          { priority: 0.5, changeFrequency: "monthly", lastModified },
        );
      }
      // Article non traduit : seulement la version FR.
      return [
        {
          url: url("fr", `blog/${a.slug}`),
          lastModified,
          changeFrequency: "monthly" as const,
          priority: 0.5,
        },
      ];
    });
  } catch {
    // En cas d'indisponibilité du backend, on renvoie au moins les pages statiques.
    articleEntries = [];
  }

  return [...staticEntries, ...articleEntries];
}
