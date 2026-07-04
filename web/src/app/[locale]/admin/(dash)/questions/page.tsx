// Admin — CRUD du questionnaire d'admission (questions).
// Le champ "options" (choix) est édité en JSON : [{ "value": "...", "label": "...", "label_en": "..." }]
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import RecordsManager, { type Field } from "@/components/admin/RecordsManager";

export default async function AdminQuestionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);
  const [{ data: questions }, { data: topics }] = await Promise.all([
    sb.from("questions").select("*").order("section").order("sort_order"),
    sb.from("topics").select("id, title").order("sort_order"),
  ]);

  const audienceOpts = [
    { value: "homme", label: pick(l, "Homme", "Man") },
    { value: "femme", label: pick(l, "Femme", "Woman") },
    { value: "couple", label: pick(l, "Couple", "Couple") },
    { value: "tous", label: pick(l, "Tous", "Everyone") },
  ];
  const topicOpts = (topics ?? []).map((t) => ({ value: t.id as string, label: t.title as string }));

  const fields: Field[] = [
    { key: "label", label: pick(l, "Question (FR)", "Question (FR)"), type: "text", colSpan: 2 },
    { key: "label_en", label: pick(l, "Question (EN)", "Question (EN)"), type: "text", colSpan: 2 },
    { key: "help_text", label: pick(l, "Aide (FR)", "Help (FR)"), type: "text", colSpan: 2 },
    { key: "help_text_en", label: pick(l, "Aide (EN)", "Help (EN)"), type: "text", colSpan: 2 },
    { key: "type", label: pick(l, "Type", "Type"), type: "select", options: [
      { value: "short_text", label: pick(l, "Texte court", "Short text") },
      { value: "long_text", label: pick(l, "Texte long", "Long text") },
      { value: "single_choice", label: pick(l, "Choix unique", "Single choice") },
      { value: "multi_choice", label: pick(l, "Choix multiple", "Multiple choice") },
      { value: "scale", label: pick(l, "Échelle (0-4)", "Scale (0-4)") },
      { value: "boolean", label: pick(l, "Oui / Non", "Yes / No") },
      { value: "date", label: pick(l, "Date", "Date") },
    ] },
    { key: "topic_id", label: pick(l, "Motif (vide = tronc commun)", "Topic (empty = common)"), type: "select", options: topicOpts },
    { key: "section", label: pick(l, "Section", "Section"), type: "text" },
    { key: "audiences", label: pick(l, "Publics", "Audiences"), type: "multiselect", options: audienceOpts, colSpan: 2 },
    { key: "options", label: pick(l, "Choix (JSON)", "Options (JSON)"), type: "json", colSpan: 2, placeholder: '[{"value":"oui","label":"Oui"}]' },
    { key: "sort_order", label: pick(l, "Ordre", "Order"), type: "number" },
    { key: "required", label: pick(l, "Obligatoire", "Required"), type: "checkbox" },
    { key: "is_active", label: pick(l, "Actif", "Active"), type: "checkbox" },
  ];

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-medium text-foreground">{pick(l, "Questionnaire d'admission", "Intake questionnaire")}</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        {pick(
          l,
          "Les questions sans motif s'affichent pour tous les parcours (tronc commun).",
          "Questions without a topic appear for every path (common trunk).",
        )}
      </p>
      <RecordsManager
        locale={l}
        table="questions"
        fields={fields}
        rows={questions ?? []}
        titleKey="label"
        subtitleKey="section"
        defaults={{ type: "short_text", required: false, is_active: true, sort_order: 0, audiences: ["tous"], topic_id: null }}
      />
    </div>
  );
}
