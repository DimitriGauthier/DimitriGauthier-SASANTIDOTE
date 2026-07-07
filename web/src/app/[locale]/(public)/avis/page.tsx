// Avis — liste des avis publiés (modérés via l'espace admin).
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getPublishedReviews } from "@/lib/data";
import { formatDayLabel } from "@/lib/format";
import { EmptyState } from "@/components/ui";
import { PageHero, CTABanner, Pill } from "@/components/sections";
import Reveal from "@/components/Reveal";
import { Star } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "Avis", "Reviews"),
    description: pick(
      l,
      "Les retours des personnes que j'ai accompagnées.",
      "Feedback from the people I've supported.",
    ),
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="text-lg text-gold" aria-label={`${rating}/5`}>
      {"★".repeat(rating)}
      <span className="text-border">{"★".repeat(5 - rating)}</span>
    </div>
  );
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const reviews = await getPublishedReviews(60);

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
      : 0;

  return (
    <div>
      <PageHero
        eyebrow={pick(l, "Témoignages", "Testimonials")}
        title={pick(l, "Ils m'ont fait confiance", "They trusted me")}
        sub={pick(
          l,
          "Les mots de celles et ceux que j'ai accompagnés. Leurs retours parlent pour eux.",
          "Words from the people I've supported. Their feedback speaks for itself.",
        )}
        badges={
          reviews.length > 0 ? (
            <Pill icon={<Star className="h-4 w-4 fill-current" />}>
              <span className="font-medium text-foreground">{avg.toFixed(1)}/5</span>
              <span className="text-muted-foreground">
                · {reviews.length} {pick(l, "avis", reviews.length > 1 ? "reviews" : "review")}
              </span>
            </Pill>
          ) : undefined
        }
      />

      <section className="full-bleed py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          {reviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r, i) => (
                <Reveal key={r.id} delay={(i % 3) * 100}>
                  <div className="hover-lift flex h-full flex-col rounded-3xl border border-border/60 bg-card p-7 shadow-card">
                    {r.rating ? <Stars rating={r.rating} /> : null}
                    {r.comment ? (
                      <p className="mt-3 flex-1 font-serif text-lg italic leading-relaxed text-foreground/90">« {r.comment} »</p>
                    ) : <div className="flex-1" />}
                    <p className="mt-5 text-xs text-muted-foreground">
                      {r.client_display_name ?? pick(l, "Anonyme", "Anonymous")}
                      {r.published_at ? ` · ${formatDayLabel(r.published_at, l)}` : ""}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState>
              {pick(l, "Les premiers avis s'afficheront ici bientôt.", "The first reviews will appear here soon.")}
            </EmptyState>
          )}
        </div>
      </section>

      <CTABanner
        href={href(l, "reservation")}
        title={pick(l, "Envie de commencer ton chemin ?", "Ready to begin your journey?")}
        sub={pick(l, "Réserve ta première séance en toute confidentialité.", "Book your first session in full confidentiality.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </div>
  );
}
