"use client";

// Tunnel de réservation guidé : profil → service → motif → questionnaire → coordonnées → créneau → paiement.
// Les données (services, topics, questions) sont chargées côté serveur puis filtrées ici.
// get-slots / create-hold sont des Edge Functions (clé anon). Redirige vers Stripe au paiement.

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { pick, getDict } from "@/lib/i18n";
import type { Audience, Service, Topic, Question, Slot } from "@/lib/types";
import { getSlots, createHold } from "@/lib/edge";
import { formatPrice, formatDuration, formatDayLabel, formatTime, reunionDayKey } from "@/lib/format";

type Props = {
  locale: Locale;
  services: Service[];
  topics: Topic[];
  questions: Question[];
};

type ClientInfo = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  note: string;
};

const AUDIENCES: Audience[] = ["homme", "femme", "couple"];

function matchesAudience(audiences: Audience[], a: Audience): boolean {
  return audiences.includes(a) || audiences.includes("tous");
}

export default function BookingTunnel({ locale, services, topics, questions }: Props) {
  const t = getDict(locale);
  const [step, setStep] = useState(0);

  const [audience, setAudience] = useState<Audience | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [client, setClient] = useState<ClientInfo>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    note: "",
  });
  const [consent, setConsent] = useState(false);

  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Données filtrées selon le profil ----
  const availServices = useMemo(
    () => (audience ? services.filter((s) => matchesAudience(s.audiences, audience)) : []),
    [services, audience],
  );
  const availTopics = useMemo(
    () => (audience ? topics.filter((tp) => matchesAudience(tp.audiences, audience)) : []),
    [topics, audience],
  );
  const availQuestions = useMemo(() => {
    if (!audience) return [];
    return questions.filter(
      (q) =>
        matchesAudience(q.audiences, audience) &&
        (q.topic_id === null || q.topic_id === topicId),
    );
  }, [questions, audience, topicId]);

  const service = availServices.find((s) => s.id === serviceId) ?? null;

  // Questions groupées par section (pour l'affichage)
  const sections = useMemo(() => {
    const map = new Map<string, Question[]>();
    for (const q of availQuestions) {
      const key = q.section ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(q);
    }
    return [...map.entries()];
  }, [availQuestions]);

  // ---- Navigation ----
  function next() {
    setError(null);
    setStep((s) => s + 1);
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function canLeaveProfile(): boolean {
    return Boolean(audience && serviceId);
  }
  function canLeaveQuestions(): boolean {
    for (const q of availQuestions) {
      if (!q.required) continue;
      const v = answers[q.id];
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
        setError(pick(locale, "Merci de répondre aux questions obligatoires.", "Please answer the required questions."));
        return false;
      }
    }
    return true;
  }
  function canLeaveContact(): boolean {
    if (!client.first_name.trim() || !client.last_name.trim() || !client.email.trim()) {
      setError(pick(locale, "Prénom, nom et e-mail sont requis.", "First name, last name and email are required."));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
      setError(pick(locale, "Adresse e-mail invalide.", "Invalid email address."));
      return false;
    }
    if (!consent) {
      setError(pick(locale, "Merci d'accepter la politique de confidentialité.", "Please accept the privacy policy."));
      return false;
    }
    return true;
  }

  async function loadSlots() {
    if (!serviceId) return;
    setLoadingSlots(true);
    setError(null);
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

  async function goToSlots() {
    if (!canLeaveContact()) return;
    next();
    await loadSlots();
  }

  async function pay() {
    if (!serviceId || !selectedSlot) {
      setError(pick(locale, "Choisis un créneau.", "Choose a slot."));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await createHold({
        service_id: serviceId,
        topic_id: topicId,
        audience: audience ?? "tous",
        slot_start: selectedSlot,
        client: {
          first_name: client.first_name.trim(),
          last_name: client.last_name.trim(),
          email: client.email.trim(),
          phone: client.phone.trim() || undefined,
          note: client.note.trim() || undefined,
        },
        answers: availQuestions.map((q) => ({
          question_id: q.id,
          label: pick(locale, q.label, q.label_en),
          value: answers[q.id] ?? null,
        })),
        consent_rgpd: consent,
        locale,
      });
      window.location.href = res.checkout_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : pick(locale, "Le paiement n'a pas pu démarrer.", "Payment could not start."));
      setSubmitting(false);
    }
  }

  // Regroupe les créneaux par jour (heure Réunion)
  const slotsByDay = useMemo(() => {
    if (!slots) return [];
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const key = reunionDayKey(s.start);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return [...map.entries()];
  }, [slots]);

  const stepLabels = [t.tunnel.stepProfile, t.tunnel.stepTopic, t.tunnel.stepForm, t.tunnel.stepContact, t.tunnel.stepSlot];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Indicateur d'étapes */}
      <ol className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-400">
        {stepLabels.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                i === step
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : i < step
                    ? "border-neutral-400 text-neutral-600"
                    : "border-neutral-200"
              }`}
            >
              {i + 1}
            </span>
            <span className={i === step ? "font-medium text-neutral-800" : ""}>{label}</span>
            {i < stepLabels.length - 1 ? <span className="mx-1 text-neutral-200">—</span> : null}
          </li>
        ))}
      </ol>

      {/* ÉTAPE 0 — Profil + service */}
      {step === 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t.tunnel.stepProfile}</h2>
          <div className="grid grid-cols-3 gap-3">
            {AUDIENCES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setAudience(a);
                  setServiceId(null);
                  setTopicId(null);
                }}
                className={`rounded-lg border px-4 py-6 text-sm font-medium transition ${
                  audience === a
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {a === "homme" ? t.tunnel.profileMan : a === "femme" ? t.tunnel.profileWoman : t.tunnel.profileCouple}
              </button>
            ))}
          </div>

          {audience && availServices.length > 0 ? (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium text-neutral-700">
                {pick(locale, "Choisis ton accompagnement", "Choose your session")}
              </h3>
              <div className="space-y-2">
                {availServices.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setServiceId(s.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition ${
                      serviceId === s.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    <span>
                      <span className="font-medium">{pick(locale, s.title, s.title_en)}</span>
                      {pick(locale, s.subtitle, s.subtitle_en) ? (
                        <span className="block text-xs text-neutral-500">{pick(locale, s.subtitle, s.subtitle_en)}</span>
                      ) : null}
                    </span>
                    <span className="whitespace-nowrap text-neutral-500">
                      {formatDuration(s.duration_min, locale)} · {formatPrice(s.price_cents, s.currency, locale)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {audience && availServices.length === 0 ? (
            <p className="mt-6 text-sm text-neutral-500">
              {pick(locale, "Aucun accompagnement disponible pour ce profil pour l'instant.", "No session available for this profile right now.")}
            </p>
          ) : null}

          <Nav
            locale={locale}
            onNext={() => (canLeaveProfile() ? next() : setError(pick(locale, "Choisis un profil et un accompagnement.", "Choose a profile and a session.")))}
            error={error}
          />
        </section>
      ) : null}

      {/* ÉTAPE 1 — Motif */}
      {step === 1 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t.tunnel.chooseTopic}</h2>
          {availTopics.length > 0 ? (
            <div className="space-y-2">
              {availTopics.map((tp) => (
                <button
                  key={tp.id}
                  type="button"
                  onClick={() => setTopicId(tp.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                    topicId === tp.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <span className="font-medium">{pick(locale, tp.title, tp.title_en)}</span>
                  {pick(locale, tp.description, tp.description_en) ? (
                    <span className="block text-xs text-neutral-500">{pick(locale, tp.description, tp.description_en)}</span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              {pick(locale, "Pas de motif à préciser, tu peux continuer.", "No specific reason to select, you can continue.")}
            </p>
          )}
          <Nav locale={locale} onBack={back} onNext={next} error={error} />
        </section>
      ) : null}

      {/* ÉTAPE 2 — Questionnaire */}
      {step === 2 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t.tunnel.yourAnswers}</h2>
          {availQuestions.length > 0 ? (
            <div className="space-y-6">
              {sections.map(([sec, qs]) => (
                <fieldset key={sec || "default"} className="space-y-4">
                  {sec ? <legend className="mb-1 text-sm font-semibold text-neutral-700">{sec}</legend> : null}
                  {qs.map((q) => (
                    <QuestionField
                      key={q.id}
                      q={q}
                      locale={locale}
                      value={answers[q.id]}
                      onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                    />
                  ))}
                </fieldset>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              {pick(locale, "Aucune question pour ce parcours.", "No questions for this path.")}
            </p>
          )}
          <Nav locale={locale} onBack={back} onNext={() => (canLeaveQuestions() ? next() : null)} error={error} />
        </section>
      ) : null}

      {/* ÉTAPE 3 — Coordonnées */}
      {step === 3 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t.tunnel.yourInfo}</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label={t.tunnel.firstName} value={client.first_name} onChange={(v) => setClient({ ...client, first_name: v })} required />
              <TextInput label={t.tunnel.lastName} value={client.last_name} onChange={(v) => setClient({ ...client, last_name: v })} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label={t.common.email} type="email" value={client.email} onChange={(v) => setClient({ ...client, email: v })} required />
              <TextInput label={t.tunnel.phone} value={client.phone} onChange={(v) => setClient({ ...client, phone: v })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">{t.tunnel.note}</label>
              <textarea
                rows={4}
                value={client.note}
                onChange={(e) => setClient({ ...client, note: e.target.value })}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
              />
            </div>
            <label className="flex items-start gap-2 text-sm text-neutral-600">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
              <span>{t.tunnel.consent}</span>
            </label>
          </div>
          <Nav locale={locale} onBack={back} onNext={goToSlots} error={error} />
        </section>
      ) : null}

      {/* ÉTAPE 4 — Créneau & paiement */}
      {step === 4 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t.tunnel.chooseSlot}</h2>

          {service ? (
            <p className="mb-4 text-sm text-neutral-500">
              {pick(locale, service.title, service.title_en)} · {formatDuration(service.duration_min, locale)} ·{" "}
              <span className="font-medium text-neutral-700">{formatPrice(service.price_cents, service.currency, locale)}</span>
            </p>
          ) : null}

          {loadingSlots ? (
            <p className="text-sm text-neutral-500">{t.common.loading}</p>
          ) : slotsByDay.length > 0 ? (
            <div className="space-y-5">
              {slotsByDay.map(([day, daySlots]) => (
                <div key={day}>
                  <h3 className="mb-2 text-sm font-medium capitalize text-neutral-700">
                    {formatDayLabel(daySlots[0].start, locale)}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((s) => (
                      <button
                        key={s.start}
                        type="button"
                        onClick={() => setSelectedSlot(s.start)}
                        className={`rounded-md border px-3 py-1.5 text-sm transition ${
                          selectedSlot === s.start ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 hover:border-neutral-500"
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
            <p className="text-sm text-neutral-500">{t.tunnel.noSlots}</p>
          )}

          <p className="mt-6 text-xs text-neutral-400">{t.tunnel.holdInfo}</p>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <div className="mt-6 flex items-center justify-between">
            <button type="button" onClick={back} className="text-sm text-neutral-500 hover:text-neutral-800">
              ← {t.common.back}
            </button>
            <button
              type="button"
              onClick={pay}
              disabled={submitting || !selectedSlot}
              className="inline-flex items-center rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              {submitting ? t.common.loading : t.tunnel.pay}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

// ---- Sous-composants ----

function Nav({
  locale,
  onBack,
  onNext,
  error,
}: {
  locale: Locale;
  onBack?: () => void;
  onNext: () => void;
  error: string | null;
}) {
  const t = getDict(locale);
  return (
    <>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      <div className="mt-6 flex items-center justify-between">
        {onBack ? (
          <button type="button" onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-800">
            ← {t.common.back}
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          {t.common.next}
        </button>
      </div>
    </>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
      />
    </div>
  );
}

function QuestionField({
  q,
  locale,
  value,
  onChange,
}: {
  q: Question;
  locale: Locale;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = pick(locale, q.label, q.label_en);
  const help = pick(locale, q.help_text, q.help_text_en);
  const inputCls = "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";
  const opts = q.options ?? [];

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
        {q.required ? " *" : ""}
      </label>
      {help ? <p className="mb-1 text-xs text-neutral-400">{help}</p> : null}

      {q.type === "short_text" ? (
        <input className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : null}

      {q.type === "long_text" ? (
        <textarea rows={3} className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : null}

      {q.type === "date" ? (
        <input type="date" className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : null}

      {q.type === "boolean" ? (
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          {pick(locale, "Oui", "Yes")}
        </label>
      ) : null}

      {q.type === "single_choice" ? (
        <div className="flex flex-wrap gap-2">
          {opts.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`rounded-md border px-3 py-1.5 text-sm transition ${
                value === o.value ? "border-neutral-900 bg-neutral-50" : "border-neutral-300 hover:border-neutral-500"
              }`}
            >
              {pick(locale, o.label, o.label_en)}
            </button>
          ))}
        </div>
      ) : null}

      {q.type === "multi_choice" ? (
        <div className="flex flex-wrap gap-2">
          {opts.map((o) => {
            const arr = Array.isArray(value) ? (value as string[]) : [];
            const on = arr.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange(on ? arr.filter((v) => v !== o.value) : [...arr, o.value])}
                className={`rounded-md border px-3 py-1.5 text-sm transition ${
                  on ? "border-neutral-900 bg-neutral-50" : "border-neutral-300 hover:border-neutral-500"
                }`}
              >
                {pick(locale, o.label, o.label_en)}
              </button>
            );
          })}
        </div>
      ) : null}

      {q.type === "scale" ? (
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`h-9 w-9 rounded-md border text-sm transition ${
                value === n ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 hover:border-neutral-500"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
