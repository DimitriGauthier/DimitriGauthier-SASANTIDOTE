// Admin — CRUD des accompagnements (services).
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import RecordsManager, { type Field } from "@/components/admin/RecordsManager";

export default async function AdminServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);
  const { data } = await sb.from("services").select("*").order("sort_order");

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
    { key: "subtitle", label: pick(l, "Sous-titre (FR)", "Subtitle (FR)"), type: "text", colSpan: 2 },
    { key: "subtitle_en", label: pick(l, "Sous-titre (EN)", "Subtitle (EN)"), type: "text", colSpan: 2 },
    { key: "description", label: pick(l, "Description (FR)", "Description (FR)"), type: "textarea", colSpan: 2 },
    { key: "description_en", label: pick(l, "Description (EN)", "Description (EN)"), type: "textarea", colSpan: 2 },
    { key: "audiences", label: pick(l, "Publics", "Audiences"), type: "multiselect", options: audienceOpts, colSpan: 2 },
    { key: "duration_min", label: pick(l, "Durée (min)", "Duration (min)"), type: "number" },
    { key: "price_cents", label: pick(l, "Tarif (€)", "Price (€)"), type: "money", help: pick(l, "Stocké en centimes", "Stored in cents") },
    { key: "currency", label: pick(l, "Devise", "Currency"), type: "text" },
    { key: "location_type", label: pick(l, "Lieu", "Location"), type: "select", options: [
      { value: "visio", label: pick(l, "Visio", "Online") },
      { value: "cabinet", label: pick(l, "Cabinet", "Office") },
      { value: "domicile", label: pick(l, "Domicile", "Home") },
    ] },
    { key: "color", label: pick(l, "Couleur", "Color"), type: "text" },
    { key: "sort_order", label: pick(l, "Ordre", "Order"), type: "number" },
    { key: "is_active", label: pick(l, "Actif", "Active"), type: "checkbox" },
  ];

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-medium text-foreground">{pick(l, "Accompagnements", "Sessions")}</h1>
      <RecordsManager
        locale={l}
        table="services"
        fields={fields}
        rows={data ?? []}
        titleKey="title"
        subtitleKey="slug"
        defaults={{ currency: "EUR", location_type: "visio", is_active: true, sort_order: 0, audiences: [], duration_min: 60 }}
      />
    </div>
  );
}
