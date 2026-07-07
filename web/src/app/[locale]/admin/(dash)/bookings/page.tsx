// Admin — liste des rendez-vous. Action "terminer" (=> complete-booking + invitation avis).
import Link from "next/link";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime, formatPrice } from "@/lib/format";
import CompleteBookingButton from "@/components/admin/CompleteBookingButton";
import { FileText } from "lucide-react";

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
  google_meet_link: string | null;
  services: { title: string } | null;
};

const STATUS_LABEL: Record<string, { fr: string; en: string; cls: string }> = {
  hold: { fr: "En attente de paiement", en: "Awaiting payment", cls: "bg-amber-100 text-amber-700" },
  scheduled: { fr: "Confirmé", en: "Scheduled", cls: "bg-green-100 text-green-700" },
  completed: { fr: "Terminé", en: "Completed", cls: "bg-muted text-foreground" },
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
      "id, status, slot_start, client_first_name, client_last_name, client_email, client_phone, audience, price_cents, currency, google_event_link, google_meet_link, services(title)",
    )
    .order("slot_start", { ascending: false })
    .limit(200);
  const bookings = (data as unknown as BookingRow[]) ?? [];

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-medium text-foreground">{pick(l, "Rendez-vous", "Appointments")}</h1>

      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">{pick(l, "Aucun rendez-vous pour l'instant.", "No appointments yet.")}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-card">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{pick(l, "Créneau", "Slot")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Client", "Client")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Accompagnement", "Session")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Statut", "Status")}</th>
                <th className="px-4 py-3 text-right font-medium">{pick(l, "Montant", "Amount")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Action", "Action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {bookings.map((b) => {
                const st = STATUS_LABEL[b.status] ?? { fr: b.status, en: b.status, cls: "bg-muted text-muted-foreground" };
                return (
                  <tr key={b.id} className="align-top transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 text-foreground">
                      {formatDateTime(b.slot_start, l)}
                      {b.google_event_link ? (
                        <a href={b.google_event_link} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs text-primary underline">
                          {pick(l, "Événement agenda", "Calendar event")}
                        </a>
                      ) : null}
                      {b.google_meet_link ? (
                        <a href={b.google_meet_link} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs text-primary underline">
                          {pick(l, "Rejoindre la visio", "Join video call")}
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {b.client_first_name} {b.client_last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">{b.client_email}</div>
                      {b.client_phone ? <div className="text-xs text-muted-foreground">{b.client_phone}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {b.services?.title ?? "—"}
                      <span className="block text-xs text-muted-foreground">{b.audience}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${st.cls}`}>
                        {pick(l, st.fr, st.en)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {formatPrice(b.price_cents, b.currency, l)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-2">
                        <Link
                          href={`/${l}/admin/bookings/${b.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5" /> {pick(l, "Fiche & questionnaire", "Record & answers")}
                        </Link>
                        {b.status === "scheduled" ? (
                          <CompleteBookingButton locale={l} bookingId={b.id} />
                        ) : null}
                      </div>
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
