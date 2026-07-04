// Admin — CRUD des règles de disponibilité (créneaux hebdomadaires).
// Les congés se gèrent directement dans le Google Agenda (comptés comme "occupé").
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import RecordsManager, { type Field } from "@/components/admin/RecordsManager";

export default async function AdminAvailabilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);
  const { data } = await sb.from("availability_rules").select("*").order("weekday").order("start_time");

  const weekdays = [
    { value: "1", label: pick(l, "Lundi", "Monday") },
    { value: "2", label: pick(l, "Mardi", "Tuesday") },
    { value: "3", label: pick(l, "Mercredi", "Wednesday") },
    { value: "4", label: pick(l, "Jeudi", "Thursday") },
    { value: "5", label: pick(l, "Vendredi", "Friday") },
    { value: "6", label: pick(l, "Samedi", "Saturday") },
    { value: "0", label: pick(l, "Dimanche", "Sunday") },
  ];

  const fields: Field[] = [
    { key: "weekday", label: pick(l, "Jour", "Weekday"), type: "select", options: weekdays, numeric: true },
    { key: "start_time", label: pick(l, "Heure de début", "Start time"), type: "text", placeholder: "09:00" },
    { key: "end_time", label: pick(l, "Heure de fin", "End time"), type: "text", placeholder: "17:00" },
    { key: "valid_from", label: pick(l, "Valide à partir du", "Valid from"), type: "text", placeholder: "2026-07-25" },
    { key: "valid_to", label: pick(l, "Valide jusqu'au", "Valid until"), type: "text" },
    { key: "is_active", label: pick(l, "Active", "Active"), type: "checkbox" },
  ];

  const dayLabel = (w: unknown) => weekdays.find((d) => d.value === String(w))?.label ?? String(w);
  const rows = (data ?? []).map((r) => ({
    ...r,
    _label: `${dayLabel(r.weekday)} · ${String(r.start_time).slice(0, 5)}–${String(r.end_time).slice(0, 5)}`,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">{pick(l, "Disponibilités", "Availability")}</h1>
      <p className="mb-4 text-sm text-neutral-500">
        {pick(
          l,
          "Définis tes plages hebdomadaires. Les créneaux réellement libres tiennent compte de ton Google Agenda.",
          "Set your weekly ranges. Actually free slots take your Google Calendar into account.",
        )}
      </p>
      <RecordsManager
        locale={l}
        table="availability_rules"
        fields={fields}
        rows={rows}
        titleKey="_label"
        defaults={{ weekday: "1", start_time: "09:00", end_time: "17:00", is_active: true }}
      />
    </div>
  );
}
