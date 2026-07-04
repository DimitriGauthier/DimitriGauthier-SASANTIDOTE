// Admin — journal des paiements (lecture seule).
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime, formatPrice } from "@/lib/format";

type PaymentRow = {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  receipt_url: string | null;
  paid_at: string | null;
  created_at: string;
  bookings: { client_first_name: string; client_last_name: string; client_email: string } | null;
};

const STATUS: Record<string, { fr: string; en: string; cls: string }> = {
  created: { fr: "Initié", en: "Created", cls: "bg-amber-100 text-amber-700" },
  paid: { fr: "Payé", en: "Paid", cls: "bg-green-100 text-green-700" },
  failed: { fr: "Échoué", en: "Failed", cls: "bg-red-100 text-red-700" },
  refunded: { fr: "Remboursé", en: "Refunded", cls: "bg-neutral-200 text-neutral-700" },
};

export default async function AdminPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);

  const { data } = await sb
    .from("payments")
    .select("id, amount_cents, currency, status, receipt_url, paid_at, created_at, bookings(client_first_name, client_last_name, client_email)")
    .order("created_at", { ascending: false })
    .limit(200);
  const payments = (data as unknown as PaymentRow[]) ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">{pick(l, "Paiements", "Payments")}</h1>
      {payments.length === 0 ? (
        <p className="text-sm text-neutral-500">{pick(l, "Aucun paiement.", "No payments.")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">{pick(l, "Date", "Date")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Client", "Client")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Statut", "Status")}</th>
                <th className="px-4 py-3 text-right font-medium">{pick(l, "Montant", "Amount")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Reçu", "Receipt")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {payments.map((p) => {
                const st = STATUS[p.status] ?? { fr: p.status, en: p.status, cls: "bg-neutral-100 text-neutral-600" };
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-neutral-600">{formatDateTime(p.paid_at ?? p.created_at, l)}</td>
                    <td className="px-4 py-3 text-neutral-700">
                      {p.bookings ? `${p.bookings.client_first_name} ${p.bookings.client_last_name}` : "—"}
                      {p.bookings ? <span className="block text-xs text-neutral-400">{p.bookings.client_email}</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${st.cls}`}>{pick(l, st.fr, st.en)}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-700">{formatPrice(p.amount_cents, p.currency, l)}</td>
                    <td className="px-4 py-3">
                      {p.receipt_url ? (
                        <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="text-xs underline">
                          {pick(l, "Voir", "View")}
                        </a>
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
