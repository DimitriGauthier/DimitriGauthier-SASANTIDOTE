// Admin — CRUD des motifs de consultation (topics).
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import RecordsManager, { type Field } from "@/components/admin/RecordsManager";

export default async function AdminTopicsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);
  const { data } = await sb.from("topics").select("*").order("sort_order");

  const audienceOpts = [
    { value: "homme", label: pick(l, "Homme", "Man") },
    { value: "femme", label: pick(l, "Femme", "Woman") },
    { value: "couple", label: pick(l, "Couple", "Couple") },
    { value: "tous", label: pick(l, "Tous", "Everyone") },
  ];

  const fields: Field[] = [
    { key: "title", label: pick(l, "Titre (FR)", "Title (FR)"), type: "text" },
    { key: "title_en", label: pick(l, "Titre (EN)", "Title (EN)"), type: "text" },
    { key: "slug", label: "Slug (FR)", type: "text" },
    { key: "slug_en", label: "Slug (EN)", type: "text" },
    { key: "description", label: pick(l, "Description (FR)", "Description (FR)"), type: "textarea", colSpan: 2 },
    { key: "description_en", label: pick(l, "Description (EN)", "Description (EN)"), type: "textarea", colSpan: 2 },
    { key: "audiences", label: pick(l, "Publics", "Audiences"), type: "multiselect", options: audienceOpts, colSpan: 2 },
    { key: "sort_order", label: pick(l, "Ordre", "Order"), type: "number" },
    { key: "is_active", label: pick(l, "Actif", "Active"), type: "checkbox" },
  ];

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-medium text-foreground">{pick(l, "Motifs de consultation", "Consultation topics")}</h1>
      <RecordsManager
        locale={l}
        table="topics"
        fields={fields}
        rows={data ?? []}
        titleKey="title"
        subtitleKey="slug"
        defaults={{ is_active: true, sort_order: 0, audiences: [] }}
      />
    </div>
  );
}
