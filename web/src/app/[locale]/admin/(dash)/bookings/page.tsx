// Admin — liste des rendez-vous. Action "terminer" (=> complete-booking + invitation avis).
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime, formatPrice } from "@/lib/format";
import CompleteBookingButton from "@/components/admin/CompleteBookingButton";

type BookingRow = {
  id: string;
  status: string;
  slot_start: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_phone: string | null;
  audience: string;
  price_cents: number;
  currency: string;
  google_event_link: string | null;
  services: { title: string } | null;
};

const STATUS_LABEL: Record<string, { fr: string; en: string; cls: string }> = {
  hold: { fr: "En attente de paiement", en: "Awaiting payment", cls: "bg-amber-100 text-amber-700" },
  scheduled: { fr: "Confirmé", en: "Scheduled", cls: "bg-green-100 text-green-700" },
  completed: { fr: "Terminé", en: "Completed", cls: "bg-neutral-200 text-neutral-700" },
  cancelled: { fr: "Annulé", en: "Cancelled", cls: "bg-red-100 text-red-700" },
  no_show: { fr: "Absent", en: "No-show", cls: "bg-red-100 text-red-700" },
};

export default async function AdminBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);

  const { data } = await sb
    .from("bookings")
    .select(
      "id, status, slot_start, client_first_name, client_last_name, client_email, client_phone, audience, price_cents, currency, google_event_link, services(title)",
    )
    .order("slot_start", { ascending: false })
    .limit(200);
  const bookings = (data as unknown as BookingRow[]) ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">{pick(l, "Rendez-vous", "Appointments")}</h1>

      {bookings.length === 0 ? (
        <p className="text-sm text-neutral-500">{pick(l, "Aucun rendez-vous pour l'instant.", "No appointments yet.")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">{pick(l, "Créneau", "Slot")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Client", "Client")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Accompagnement", "Session")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Statut", "Status")}</th>
                <th className="px-4 py-3 text-right font-medium">{pick(l, "Montant", "Amount")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Action", "Action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {bookings.map((b) => {
                const st = STATUS_LABEL[b.status] ?? { fr: b.status, en: b.status, cls: "bg-neutral-100 text-neutral-600" };
                return (
                  <tr key={b.id} className="align-top">
                    <td className="px-4 py-3 text-neutral-700">
                      {formatDateTime(b.slot_start, l)}
                      {b.google_event_link ? (
                        <a href={b.google_event_link} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs underline">
                          {pick(l, "Événement agenda", "Calendar event")}
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-800">
                        {b.client_first_name} {b.client_last_name}
                      </div>
                      <div className="text-xs text-neutral-500">{b.client_email}</div>
                      {b.client_phone ? <div className="text-xs text-neutral-500">{b.client_phone}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {b.services?.title ?? "—"}
                      <span className="block text-xs text-neutral-400">{b.audience}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${st.cls}`}>
                        {pick(l, st.fr, st.en)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-700">
                      {formatPrice(b.price_cents, b.currency, l)}
                    </td>
                    <td className="px-4 py-3">
                      {b.status === "scheduled" ? (
                        <CompleteBookingButton locale={l} bookingId={b.id} />
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
