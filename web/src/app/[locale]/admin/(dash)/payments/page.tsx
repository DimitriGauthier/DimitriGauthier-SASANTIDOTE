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
  refunded: { fr: "Remboursé", en: "Refunded", cls: "bg-muted text-foreground" },
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
      <h1 className="mb-6 font-serif text-3xl font-medium text-foreground">{pick(l, "Paiements", "Payments")}</h1>
      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{pick(l, "Aucun paiement.", "No payments.")}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{pick(l, "Date", "Date")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Client", "Client")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Statut", "Status")}</th>
                <th className="px-4 py-3 text-right font-medium">{pick(l, "Montant", "Amount")}</th>
                <th className="px-4 py-3 font-medium">{pick(l, "Reçu", "Receipt")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {payments.map((p) => {
                const st = STATUS[p.status] ?? { fr: p.status, en: p.status, cls: "bg-muted text-muted-foreground" };
                return (
                  <tr key={p.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(p.paid_at ?? p.created_at, l)}</td>
                    <td className="px-4 py-3 text-foreground">
                      {p.bookings ? `${p.bookings.client_first_name} ${p.bookings.client_last_name}` : "—"}
                      {p.bookings ? <span className="block text-xs text-muted-foreground">{p.bookings.client_email}</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${st.cls}`}>{pick(l, st.fr, st.en)}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">{formatPrice(p.amount_cents, p.currency, l)}</td>
                    <td className="px-4 py-3">
                      {p.receipt_url ? (
                        <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                          {pick(l, "Voir", "View")}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
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
