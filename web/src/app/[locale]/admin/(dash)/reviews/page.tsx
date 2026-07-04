// Admin — modération des avis (publier / masquer).
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import type { Review } from "@/lib/types";
import ReviewsAdmin from "@/components/admin/ReviewsAdmin";

export default async function AdminReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);

  const { data } = await sb
    .from("reviews")
    .select("id, client_display_name, rating, comment, status, published_at, created_at")
    .in("status", ["submitted", "published", "hidden"])
    .order("created_at", { ascending: false })
    .limit(200);
  const reviews = (data as Review[]) ?? [];

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-medium text-foreground">{pick(l, "Avis", "Reviews")}</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {pick(
          l,
          "Les avis soumis n'apparaissent sur le site qu'une fois publiés.",
          "Submitted reviews appear on the site only once published.",
        )}
      </p>
      <ReviewsAdmin locale={l} reviews={reviews} />
    </div>
  );
}
