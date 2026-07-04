// Admin — CRUD des articles de blog. Le corps est saisi en HTML (éditeur riche possible plus tard).
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import RecordsManager, { type Field } from "@/components/admin/RecordsManager";

export default async function AdminBlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);
  const { data } = await sb.from("articles").select("*").order("created_at", { ascending: false });

  const fields: Field[] = [
    { key: "title", label: pick(l, "Titre (FR)", "Title (FR)"), type: "text", colSpan: 2 },
    { key: "title_en", label: pick(l, "Titre (EN)", "Title (EN)"), type: "text", colSpan: 2 },
    { key: "slug", label: "Slug (FR)", type: "text" },
    { key: "slug_en", label: "Slug (EN)", type: "text" },
    { key: "status", label: pick(l, "Statut", "Status"), type: "select", options: [
      { value: "draft", label: pick(l, "Brouillon", "Draft") },
      { value: "published", label: pick(l, "Publié", "Published") },
    ] },
    { key: "published_at", label: pick(l, "Date de publication (ISO)", "Published at (ISO)"), type: "text", placeholder: "2026-07-25T08:00:00Z" },
    { key: "reading_minutes", label: pick(l, "Temps de lecture (min)", "Reading time (min)"), type: "number" },
    { key: "tags", label: "Tags", type: "tags", placeholder: "sexualité, couple" },
    { key: "cover_image_url", label: pick(l, "Image de couverture (URL)", "Cover image (URL)"), type: "text", colSpan: 2 },
    { key: "excerpt", label: pick(l, "Extrait (FR)", "Excerpt (FR)"), type: "textarea", colSpan: 2 },
    { key: "excerpt_en", label: pick(l, "Extrait (EN)", "Excerpt (EN)"), type: "textarea", colSpan: 2 },
    { key: "body_html", label: pick(l, "Contenu HTML (FR)", "HTML content (FR)"), type: "textarea", colSpan: 2 },
    { key: "body_html_en", label: pick(l, "Contenu HTML (EN)", "HTML content (EN)"), type: "textarea", colSpan: 2 },
    { key: "seo_title", label: pick(l, "SEO — titre (FR)", "SEO title (FR)"), type: "text", colSpan: 2 },
    { key: "seo_description", label: pick(l, "SEO — description (FR)", "SEO description (FR)"), type: "textarea", colSpan: 2 },
  ];

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-medium text-foreground">{pick(l, "Blog", "Blog")}</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {pick(
          l,
          "Un article n'apparaît en anglais que si son slug et son contenu EN sont renseignés.",
          "An article appears in English only if its EN slug and content are filled in.",
        )}
      </p>
      <RecordsManager
        locale={l}
        table="articles"
        fields={fields}
        rows={data ?? []}
        titleKey="title"
        subtitleKey="status"
        defaults={{ status: "draft", tags: [] }}
      />
    </div>
  );
}
