"use client";
// Gestion d'une réservation par le client (page /rdv/{token}) : reporter ou annuler.
// Sécurisé côté serveur par le token secret du booking (Edge Functions reschedule/cancel).

import { useMemo, useState } from "react";
import { getSlots, rescheduleBooking, cancelBooking } from "@/lib/edge";
import { formatDayLabel, formatTime, reunionDayKey } from "@/lib/format";
import type { Slot } from "@/lib/types";
import { pick, type Locale } from "@/lib/i18n";
import { href, experienceHref } from "@/lib/site";
import { CalendarClock, X, ArrowLeft, Check, CalendarHeart } from "lucide-react";

type Props = {
  token: string;
  locale: Locale;
  firstName: string;
  serviceId: string;
  serviceTitle: string;
  whenLabel: string;
  slotStart: string;
};

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50";
const ghostBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/50 disabled:opacity-50";
const dangerBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-destructive/40 bg-card px-6 py-3 text-sm font-medium text-destructive transition-all duration-300 hover:border-destructive hover:bg-destructive/5 active:scale-95 disabled:opacity-50";

export default function ManageBooking(props: Props) {
  const { token, locale, firstName, serviceId, serviceTitle } = props;
  const [mode, setMode] = useState<"idle" | "reschedule" | "cancelConfirm">("idle");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | { kind: "rescheduled" | "cancelled"; whenLabel?: string }>(null);

  const slotsByDay = useMemo(() => {
    if (!slots) return [] as [string, Slot[]][];
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const key = reunionDayKey(s.start);
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [slots]);

  async function openReschedule() {
    setMode("reschedule");
    setError(null);
    if (slots) return;
    setLoadingSlots(true);
    try {
      const res = await getSlots({ service_id: serviceId, days: 30 });
      setSlots(res.slots);
    } catch (e) {
      setError(e instanceof Error ? e.message : pick(locale, "Impossible de charger les créneaux.", "Unable to load slots."));
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function confirmReschedule() {
    if (!selected) {
      setError(pick(locale, "Choisis un nouveau créneau.", "Choose a new slot."));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await rescheduleBooking(token, selected);
      setDone({ kind: "rescheduled", whenLabel: `${formatDayLabel(selected, locale)} · ${formatTime(selected, locale)}` });
    } catch (e) {
      setError(e instanceof Error ? e.message : pick(locale, "Report impossible.", "Reschedule failed."));
    } finally {
      setBusy(false);
    }
  }

  async function confirmCancel() {
    setBusy(true);
    setError(null);
    try {
      await cancelBooking(token);
      setDone({ kind: "cancelled" });
    } catch (e) {
      setError(e instanceof Error ? e.message : pick(locale, "Annulation impossible.", "Cancellation failed."));
    } finally {
      setBusy(false);
    }
  }

  // ── État final (report ou annulation effectué) ──
  if (done) {
    const cancelled = done.kind === "cancelled";
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary shadow-soft">
          {cancelled ? <X className="h-8 w-8" /> : <Check className="h-8 w-8" />}
        </div>
        <h2 className="font-serif text-2xl font-medium text-foreground sm:text-3xl">
          {cancelled
            ? pick(locale, "Rendez-vous annulé", "Appointment cancelled")
            : pick(locale, "Rendez-vous reporté", "Appointment rescheduled")}
        </h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground">
          {cancelled
            ? pick(locale, "Votre créneau a bien été libéré. Un e-mail de confirmation vous a été envoyé.", "Your slot has been released. A confirmation email has been sent to you.")
            : pick(locale, `C'est noté ! Votre nouveau rendez-vous : ${done.whenLabel}. Un e-mail de confirmation vous a été envoyé.`, `All set! Your new appointment: ${done.whenLabel}. A confirmation email has been sent to you.`)}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={href(locale)} className={ghostBtn}>{pick(locale, "Retour à l'accueil", "Back to home")}</a>
          {cancelled ? (
            <a href={experienceHref(locale)} className={primaryBtn}>
              <CalendarHeart className="h-4 w-4" /> {pick(locale, "Réserver un nouveau moment", "Book a new moment")}
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Récap du rendez-vous actuel */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          {mode === "reschedule" ? pick(locale, "Rendez-vous actuel", "Current appointment") : pick(locale, "Votre rendez-vous", "Your appointment")}
        </p>
        <p className="mt-2 font-serif text-xl text-foreground sm:text-2xl">{props.whenLabel}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {serviceTitle} · {pick(locale, "heure de La Réunion", "Réunion time")}
        </p>
      </div>

      {/* Mode inactif : choix reporter / annuler */}
      {mode === "idle" ? (
        <div className="mt-8">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {pick(locale, `${firstName}, vous pouvez reporter votre rendez-vous à un autre créneau ou l'annuler. Un e-mail vous confirmera le changement.`, `${firstName}, you can move your appointment to another slot or cancel it. An email will confirm the change.`)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={openReschedule} className={primaryBtn}>
              <CalendarClock className="h-4 w-4" /> {pick(locale, "Reporter le rendez-vous", "Reschedule")}
            </button>
            <button type="button" onClick={() => { setMode("cancelConfirm"); setError(null); }} className={dangerBtn}>
              <X className="h-4 w-4" /> {pick(locale, "Annuler le rendez-vous", "Cancel appointment")}
            </button>
          </div>
        </div>
      ) : null}

      {/* Mode report : sélection d'un nouveau créneau */}
      {mode === "reschedule" ? (
        <div className="mt-8">
          <h3 className="mb-4 font-serif text-lg font-medium text-foreground">
            {pick(locale, "Choisissez un nouveau créneau", "Choose a new slot")}
          </h3>
          {loadingSlots ? (
            <p className="text-sm text-muted-foreground">{pick(locale, "Chargement…", "Loading…")}</p>
          ) : slotsByDay.length > 0 ? (
            <div className="space-y-5">
              {slotsByDay.map(([day, daySlots]) => (
                <div key={day}>
                  <h4 className="mb-2 text-sm font-medium capitalize text-foreground">{formatDayLabel(daySlots[0].start, locale)}</h4>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((s) => (
                      <button
                        key={s.start}
                        type="button"
                        onClick={() => setSelected(s.start)}
                        className={`rounded-full border-2 px-4 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
                          selected === s.start
                            ? "animate-pop border-primary bg-primary text-primary-foreground shadow-soft"
                            : "border-border bg-card text-foreground hover:border-primary/50"
                        }`}
                      >
                        {formatTime(s.start, locale)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{pick(locale, "Aucun créneau disponible pour l'instant.", "No slots available right now.")}</p>
          )}

          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

          <div className="mt-8 flex items-center justify-between">
            <button type="button" onClick={() => { setMode("idle"); setSelected(null); setError(null); }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> {pick(locale, "Retour", "Back")}
            </button>
            <button type="button" onClick={confirmReschedule} disabled={busy || !selected} className={`${primaryBtn}`}>
              {busy ? pick(locale, "Report…", "Rescheduling…") : pick(locale, "Confirmer le report", "Confirm reschedule")}
            </button>
          </div>
        </div>
      ) : null}

      {/* Mode annulation : confirmation */}
      {mode === "cancelConfirm" ? (
        <div className="mt-8 rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-5 sm:p-6">
          <h3 className="font-serif text-lg font-medium text-foreground">
            {pick(locale, "Annuler ce rendez-vous ?", "Cancel this appointment?")}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {pick(locale, "Cette action est définitive et libère votre créneau. Vous pourrez toujours réserver un autre moment plus tard.", "This is final and releases your slot. You can always book another moment later.")}
          </p>
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
          <div className="mt-6 flex items-center justify-between">
            <button type="button" onClick={() => { setMode("idle"); setError(null); }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> {pick(locale, "Garder mon rendez-vous", "Keep my appointment")}
            </button>
            <button type="button" onClick={confirmCancel} disabled={busy} className={dangerBtn}>
              {busy ? pick(locale, "Annulation…", "Cancelling…") : pick(locale, "Oui, annuler", "Yes, cancel")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
