// Admin — fiche client d'un rendez-vous : coordonnées + réponses au questionnaire.
// Imprimable en PDF (bouton → window.print()). La fiche est stylée @media print
// pour ne sortir QUE le contenu clinique (le reste de l'admin est masqué).
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime, formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import PrintButton from "@/components/admin/PrintButton";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const AUDIENCE_LABEL: Record<string, { fr: string; en: string }> = {
  homme: { fr: "Homme", en: "Man" },
  femme: { fr: "Femme", en: "Woman" },
  couple: { fr: "Couple", en: "Couple" },
  tous: { fr: "Tous", en: "Everyone" },
};

const STATUS_LABEL: Record<string, { fr: string; en: string }> = {
  hold: { fr: "En attente de paiement", en: "Awaiting payment" },
  scheduled: { fr: "Confirmé", en: "Scheduled" },
  completed: { fr: "Terminé", en: "Completed" },
  cancelled: { fr: "Annulé", en: "Cancelled" },
  no_show: { fr: "Absent", en: "No-show" },
};

/** Rend une réponse lisible, qu'elle soit stockée en texte ou en JSON. */
function fmtAnswer(answerText: string | null, answerJson: unknown, l: Locale): string {
  if (answerText && answerText.trim() !== "") return answerText;
  const v = answerJson;
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "boolean") return v ? pick(l, "Oui", "Yes") : pick(l, "Non", "No");
  if (Array.isArray(v)) return v.map((x) => String(x)).join(", ");
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if ("label" in o && typeof o.label === "string") return o.label;
    if ("value" in o) return String(o.value);
    return Object.values(o).map((x) => String(x)).join(", ");
  }
  return String(v);
}

type AnswerRow = {
  id: string;
  question_id: string | null;
  question_label_snapshot: string;
  answer_text: string | null;
  answer_json: unknown;
  created_at: string;
  questions: { section: string | null; sort_order: number } | null;
};

export default async function BookingFichePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);

  const { data: booking } = await sb
    .from("bookings")
    .select(
      "id, status, audience, slot_start, slot_end, timezone, client_first_name, client_last_name, client_email, client_phone, client_note, price_cents, currency, created_at, consent_rgpd, services(title, title_en, duration_min, location_type), topics(title, title_en)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!booking) notFound();

  const service = booking.services as unknown as
    | { title: string; title_en: string | null; duration_min: number; location_type: string }
    | null;
  const topic = booking.topics as unknown as { title: string; title_en: string | null } | null;

  const { data: rawAnswers } = await sb
    .from("booking_answers")
    .select("id, question_id, question_label_snapshot, answer_text, answer_json, created_at, questions(section, sort_order)")
    .eq("booking_id", id);

  const answers = ((rawAnswers as unknown as AnswerRow[]) ?? [])
    .map((a, i) => ({ ...a, _i: i }))
    .sort((a, b) => {
      const sa = a.questions?.section ?? "";
      const sb_ = b.questions?.section ?? "";
      if (sa !== sb_) return sa < sb_ ? -1 : 1;
      const oa = a.questions?.sort_order ?? 9999;
      const ob = b.questions?.sort_order ?? 9999;
      if (oa !== ob) return oa - ob;
      return a._i - b._i;
    });

  // Regroupement par section (les questions sans section tombent dans "Questionnaire").
  const sections = new Map<string, AnswerRow[]>();
  for (const a of answers) {
    const key = a.questions?.section ?? pick(l, "Questionnaire", "Questionnaire");
    const arr = sections.get(key) ?? [];
    arr.push(a);
    sections.set(key, arr);
  }

  const fullName = `${booking.client_first_name} ${booking.client_last_name}`;
  const serviceTitle = service ? pick(l, service.title, service.title_en) : pick(l, "Consultation", "Consultation");
  const topicTitle = topic ? pick(l, topic.title, topic.title_en) : null;
  const audience = AUDIENCE_LABEL[booking.audience] ?? { fr: booking.audience, en: booking.audience };
  const status = STATUS_LABEL[booking.status] ?? { fr: booking.status, en: booking.status };

  return (
    <div className="mx-auto max-w-3xl print:max-w-none">
      {/* Barre d'action (masquée à l'impression) */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/${l}/admin/bookings`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> {pick(l, "Retour aux rendez-vous", "Back to appointments")}
        </Link>
        <PrintButton label={pick(l, "Imprimer / PDF", "Print / PDF")} />
      </div>

      {/* Fiche imprimable */}
      <article className="rounded-2xl border border-border/60 bg-card p-8 shadow-card print:rounded-none print:border-0 print:p-0 print:shadow-none">
        {/* En-tête */}
        <header className="mb-6 border-b border-border pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                {pick(l, "Fiche de consultation", "Consultation record")}
              </p>
              <h1 className="mt-1 font-serif text-2xl font-medium text-foreground">{fullName}</h1>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="font-serif text-base text-foreground">{siteConfig.practitionerName}</div>
              <div>{pick(l, "Sexothérapie", "Sex therapy")}</div>
            </div>
          </div>
        </header>

        {/* Coordonnées & rendez-vous */}
        <section className="mb-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          <Field label={pick(l, "Profil", "Profile")} value={pick(l, audience.fr, audience.en)} />
          <Field label={pick(l, "Statut", "Status")} value={pick(l, status.fr, status.en)} />
          <Field label={pick(l, "E-mail", "Email")} value={booking.client_email} />
          <Field label={pick(l, "Téléphone", "Phone")} value={booking.client_phone ?? "—"} />
          <Field label={pick(l, "Accompagnement", "Session")} value={serviceTitle} />
          {topicTitle ? <Field label={pick(l, "Motif", "Reason")} value={topicTitle} /> : null}
          <Field label={pick(l, "Rendez-vous", "Appointment")} value={formatDateTime(booking.slot_start, l)} />
          <Field
            label={pick(l, "Durée · montant", "Duration · amount")}
            value={`${service?.duration_min ?? "—"} min · ${formatPrice(booking.price_cents, booking.currency, l)}`}
          />
        </section>

        {booking.client_note ? (
          <section className="mb-6">
            <FieldLabel>{pick(l, "Note du client", "Client note")}</FieldLabel>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{booking.client_note}</p>
          </section>
        ) : null}

        {/* Questionnaire */}
        <section>
          <h2 className="mb-4 font-serif text-lg font-medium text-foreground">
            {pick(l, "Réponses au questionnaire", "Questionnaire answers")}
          </h2>
          {sections.size === 0 ? (
            <p className="text-sm text-muted-foreground">
              {pick(l, "Aucune réponse enregistrée pour ce rendez-vous.", "No answers recorded for this appointment.")}
            </p>
          ) : (
            <div className="space-y-6">
              {[...sections.entries()].map(([sectionName, rows]) => (
                <div key={sectionName} className="break-inside-avoid">
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-primary">{sectionName}</h3>
                  <dl className="space-y-3">
                    {rows.map((a) => {
                      const val = fmtAnswer(a.answer_text, a.answer_json, l);
                      return (
                        <div key={a.id} className="break-inside-avoid border-b border-border/40 pb-3 last:border-0">
                          <dt className="text-sm font-medium text-foreground">{a.question_label_snapshot}</dt>
                          <dd className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                            {val || pick(l, "(sans réponse)", "(no answer)")}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pied de fiche */}
        <footer className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
          {pick(l, "Document confidentiel — usage clinique uniquement.", "Confidential document — clinical use only.")}
          {" · "}
          {pick(l, "Réservé le", "Booked on")} {formatDateTime(booking.created_at, l)}
        </footer>
      </article>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{children}</span>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="break-inside-avoid">
      <FieldLabel>{label}</FieldLabel>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  );
}
