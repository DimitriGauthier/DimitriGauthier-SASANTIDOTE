// Avis — liste des avis publiés (modérés via l'espace admin).
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getPublishedReviews } from "@/lib/data";
import { formatDayLabel } from "@/lib/format";
import { PageTitle, Card, EmptyState, CTASection } from "@/components/ui";

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
      <PageTitle
        eyebrow={pick(l, "Témoignages", "Testimonials")}
        sub={pick(l, "La confiance de celles et ceux que j'accompagne", "The trust of those I support")}
      >
        {pick(l, "Avis", "Reviews")}
      </PageTitle>

      {reviews.length > 0 ? (
        <>
          <div className="mb-8 flex items-center gap-3">
            <Stars rating={Math.round(avg)} />
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{avg.toFixed(1)}/5</span> · {reviews.length}{" "}
              {pick(l, "avis", reviews.length > 1 ? "reviews" : "review")}
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {reviews.map((r) => (
              <Card key={r.id}>
                {r.rating ? <Stars rating={r.rating} /> : null}
                {r.comment ? <p className="mt-3 font-serif text-lg italic leading-relaxed text-foreground">« {r.comment} »</p> : null}
                <p className="mt-4 text-xs text-muted-foreground">
                  {r.client_display_name ?? pick(l, "Anonyme", "Anonymous")}
                  {r.published_at ? ` · ${formatDayLabel(r.published_at, l)}` : ""}
                </p>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <EmptyState>
          {pick(
            l,
            "Les premiers avis s'afficheront ici bientôt.",
            "The first reviews will appear here soon.",
          )}
        </EmptyState>
      )}

      <CTASection
        href={href(l, "reservation")}
        title={pick(l, "Envie de commencer ton chemin ?", "Ready to begin your journey?")}
        sub={pick(l, "Réserve ta première séance en toute confidentialité.", "Book your first session in full confidentiality.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </div>
  );
}
