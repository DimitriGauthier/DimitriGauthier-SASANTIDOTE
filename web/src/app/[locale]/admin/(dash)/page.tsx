// Tableau de bord admin — compteurs clés + accès rapides.
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";

async function countBy(sb: SupabaseClient, table: string, col: string, val: string): Promise<number> {
  const { count } = await sb.from(table).select("*", { count: "exact", head: true }).eq(col, val);
  return count ?? 0;
}

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);
  const base = `/${l}/admin`;

  const [upcoming, reviewsToModerate, newMessages, paidCount] = await Promise.all([
    countBy(sb, "bookings", "status", "scheduled"),
    countBy(sb, "reviews", "status", "submitted"),
    countBy(sb, "contact_messages", "status", "new"),
    countBy(sb, "payments", "status", "paid"),
  ]);

  const cards = [
    { label: pick(l, "RDV à venir", "Upcoming appointments"), value: upcoming, href: `${base}/bookings` },
    { label: pick(l, "Avis à modérer", "Reviews to moderate"), value: reviewsToModerate, href: `${base}/reviews` },
    { label: pick(l, "Nouveaux messages", "New messages"), value: newMessages, href: `${base}/messages` },
    { label: pick(l, "Paiements reçus", "Payments received"), value: paidCount, href: `${base}/payments` },
  ];

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-medium text-foreground">{pick(l, "Tableau de bord", "Dashboard")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="hover-lift rounded-2xl border border-border/60 bg-card p-5 shadow-card"
          >
            <div className="font-serif text-4xl font-medium text-primary">{c.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{c.label}</div>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 mb-3 font-serif text-xl font-medium text-foreground">{pick(l, "Gérer le contenu", "Manage content")}</h2>
      <div className="flex flex-wrap gap-2 text-sm">
        {[
          { slug: "blog", fr: "Blog", en: "Blog" },
          { slug: "services", fr: "Accompagnements", en: "Sessions" },
          { slug: "topics", fr: "Motifs", en: "Topics" },
          { slug: "questions", fr: "Questionnaire", en: "Questionnaire" },
          { slug: "availability", fr: "Disponibilités", en: "Availability" },
          { slug: "settings", fr: "Paramètres", en: "Settings" },
        ].map((x) => (
          <Link
            key={x.slug}
            href={`${base}/${x.slug}`}
            className="rounded-full border border-border px-4 py-2 text-foreground transition-colors hover:bg-muted"
          >
            {pick(l, x.fr, x.en)}
          </Link>
        ))}
      </div>
    </div>
  );
}
