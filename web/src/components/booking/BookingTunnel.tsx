"use client";

// Tunnel de réservation guidé, une question à la fois (auto-advance style Typeform).
// Flux : profil → accompagnement → motif → questionnaire (1 écran/question) → coordonnées → créneau → paiement.
// Les réponses à choix unique / oui-non / échelle passent AUTOMATIQUEMENT à l'écran suivant.
// Les champs texte et choix multiples gardent un bouton « Continuer ».
// Données (services, topics, questions) chargées côté serveur puis filtrées ici.
// get-slots / create-hold sont des Edge Functions (clé anon). Redirige vers Stripe au paiement.

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, User, Users } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { pick, getDict } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import type { Audience, Service, Topic, Question, Slot } from "@/lib/types";
import { getSlots, createHold } from "@/lib/edge";
import { formatPrice, formatDuration, formatDayLabel, formatTime, reunionDayKey } from "@/lib/format";
import DimitriGuide from "@/components/booking/DimitriGuide";

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

type Screen =
  | { k: "profile" }
  | { k: "service" }
  | { k: "topic" }
  | { k: "question"; q: Question }
  | { k: "contact" }
  | { k: "slot" };

const AUDIENCES: Audience[] = ["homme", "femme", "couple"];
const AUDIENCE_ICON: Record<Audience, typeof User> = { homme: User, femme: User, couple: Users, tous: Heart };

function matchesAudience(audiences: Audience[], a: Audience): boolean {
  return audiences.includes(a) || audiences.includes("tous");
}

function isAnswered(v: unknown): boolean {
  if (v === undefined || v === null || v === "") return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

// Ces types de question sautent automatiquement à l'écran suivant au clic.
function autoAdvances(type: Question["type"]): boolean {
  return type === "single_choice" || type === "boolean" || type === "scale";
}

export default function BookingTunnel({ locale, services, topics, questions }: Props) {
  const t = getDict(locale);

  const [index, setIndex] = useState(0);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [client, setClient] = useState<ClientInfo>({ first_name: "", last_name: "", email: "", phone: "", note: "" });
  const [consent, setConsent] = useState(false);

  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timer = useRef<number | null>(null);

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
      (q) => matchesAudience(q.audiences, audience) && (q.topic_id === null || q.topic_id === topicId),
    );
  }, [questions, audience, topicId]);

  const service = availServices.find((s) => s.id === serviceId) ?? null;

  // ---- Liste dynamique des écrans ----
  const screens = useMemo<Screen[]>(() => {
    const arr: Screen[] = [{ k: "profile" }, { k: "service" }];
    if (availTopics.length > 0) arr.push({ k: "topic" });
    for (const q of availQuestions) arr.push({ k: "question", q });
    arr.push({ k: "contact" }, { k: "slot" });
    return arr;
  }, [availTopics.length, availQuestions]);

  const safeIndex = Math.min(index, screens.length - 1);
  const screen = screens[safeIndex];

  // Libellé du groupe courant (pour l'indicateur d'étape)
  const groupLabel = useMemo(() => {
    switch (screen.k) {
      case "profile":
        return t.tunnel.stepProfile;
      case "service":
        return pick(locale, "Accompagnement", "Session");
      case "topic":
        return t.tunnel.stepTopic;
      case "question":
        return t.tunnel.stepForm;
      case "contact":
        return t.tunnel.stepContact;
      case "slot":
        return t.tunnel.stepSlot;
    }
  }, [screen, t, locale]);

  const progress = Math.round(((safeIndex + 1) / screens.length) * 100);
  const stepNum = safeIndex + 1;
  const stepTotal = screens.length;

  // Petite phrase d'encouragement — esprit « jeu / parcours ».
  const encouragement = useMemo(() => {
    if (screen.k === "slot") return pick(locale, "Dernière étape : choisis ton moment.", "Last step: choose your moment.");
    if (screen.k === "contact") return pick(locale, "On y est presque — juste tes coordonnées.", "Almost there — just your details.");
    if (safeIndex === 0) return pick(locale, "C'est parti — on avance ensemble, à ton rythme.", "Here we go — we move forward together, at your pace.");
    const ratio = stepNum / stepTotal;
    if (ratio < 0.5) return pick(locale, "Tu avances bien, continue.", "You're doing great, keep going.");
    return pick(locale, "Plus que quelques pas.", "Just a few more steps.");
  }, [screen, safeIndex, stepNum, stepTotal, locale]);

  // ---- Navigation ----
  function goForward() {
    setError(null);
    setIndex((i) => Math.min(screens.length - 1, i + 1));
  }
  function goBack() {
    setError(null);
    if (timer.current) window.clearTimeout(timer.current);
    setIndex((i) => Math.max(0, i - 1));
  }
  // Applique une sélection puis avance en douceur (laisse voir la surbrillance).
  function selectAndAdvance(apply: () => void) {
    apply();
    setError(null);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setIndex((i) => Math.min(screens.length - 1, i + 1)), 260);
  }

  function continueQuestion(q: Question) {
    if (q.required && !isAnswered(answers[q.id])) {
      setError(pick(locale, "Merci de répondre à cette question.", "Please answer this question."));
      return;
    }
    goForward();
  }

  function validateContact(): boolean {
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

  async function contactContinue() {
    if (!validateContact()) return;
    goForward();
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

  const guideName = siteConfig.practitionerName.split(" ")[0];
  const guideRole = pick(locale, "Ton accompagnant", "Your companion");

  return (
    <div className="mx-auto max-w-4xl lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
      {/* Guide « Dimitri » — colonne de gauche (desktop) */}
      <DimitriGuide message={encouragement} name={guideName} role={guideRole} variant="sidebar" />

      <div>
      {/* Guide compact (mobile) */}
      <DimitriGuide message={encouragement} name={guideName} role={guideRole} variant="bar" />

      {/* Progression — barre dégradée + encouragement (esprit « parcours ») */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium uppercase tracking-[0.2em] text-primary">{groupLabel}</span>
          <span className="text-muted-foreground">
            {pick(locale, "Étape", "Step")} {stepNum} / {stepTotal}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--gold)))] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{encouragement}</p>
      </div>

      <div key={safeIndex} className="animate-fade-up">
        {/* ── PROFIL ── */}
        {screen.k === "profile" ? (
          <section>
            <h2 className="mb-6 font-serif text-2xl font-medium text-foreground sm:text-3xl">
              {pick(locale, "Pour qui est cet accompagnement ?", "Who is this session for?")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {AUDIENCES.map((a) => {
                const Icon = AUDIENCE_ICON[a];
                const active = audience === a;
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() =>
                      selectAndAdvance(() => {
                        setAudience(a);
                        setServiceId(null);
                        setTopicId(null);
                        setAnswers({});
                      })
                    }
                    className={`flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-7 text-center transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] ${
                      active
                        ? "animate-pop border-primary bg-secondary/50 shadow-soft"
                        : "border-border bg-card hover:border-primary/40 hover:bg-secondary/30 hover:shadow-card"
                    }`}
                  >
                    <span
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${
                        active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-serif text-lg text-foreground">
                      {a === "homme" ? t.tunnel.profileMan : a === "femme" ? t.tunnel.profileWoman : t.tunnel.profileCouple}
                    </span>
                  </button>
                );
              })}
            </div>
            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
          </section>
        ) : null}

        {/* ── ACCOMPAGNEMENT ── */}
        {screen.k === "service" ? (
          <section>
            <h2 className="mb-6 font-serif text-2xl font-medium text-foreground sm:text-3xl">
              {pick(locale, "Choisis ton accompagnement", "Choose your session")}
            </h2>
            {availServices.length > 0 ? (
              <div className="space-y-3">
                {availServices.map((s) => {
                  const active = serviceId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectAndAdvance(() => setServiceId(s.id))}
                      className={`flex w-full items-center justify-between gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                        active ? "animate-pop border-primary bg-secondary/50 shadow-soft" : "border-border bg-card hover:border-primary/40 hover:bg-secondary/30 hover:shadow-card"
                      }`}
                    >
                      <span>
                        <span className="font-serif text-lg text-foreground">{pick(locale, s.title, s.title_en)}</span>
                        {pick(locale, s.subtitle, s.subtitle_en) ? (
                          <span className="mt-0.5 block text-sm text-muted-foreground">{pick(locale, s.subtitle, s.subtitle_en)}</span>
                        ) : null}
                      </span>
                      <span className="flex items-center gap-3 whitespace-nowrap">
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(s.duration_min, locale)} · {formatPrice(s.price_cents, s.currency, locale)}
                        </span>
                        {active ? <Check className="h-5 w-5 shrink-0 text-primary" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {pick(locale, "Aucun accompagnement disponible pour ce profil pour l'instant.", "No session available for this profile right now.")}
              </p>
            )}
            <BackBar locale={locale} onBack={goBack} />
          </section>
        ) : null}

        {/* ── MOTIF ── */}
        {screen.k === "topic" ? (
          <section>
            <h2 className="mb-6 font-serif text-2xl font-medium text-foreground sm:text-3xl">{t.tunnel.chooseTopic}</h2>
            <div className="space-y-3">
              {availTopics.map((tp) => {
                const active = topicId === tp.id;
                return (
                  <button
                    key={tp.id}
                    type="button"
                    onClick={() => selectAndAdvance(() => setTopicId(tp.id))}
                    className={`flex w-full items-center justify-between gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                      active ? "border-primary bg-secondary/50 shadow-soft" : "border-border bg-card hover:border-primary/40 hover:bg-secondary/30"
                    }`}
                  >
                    <span>
                      <span className="font-serif text-lg text-foreground">{pick(locale, tp.title, tp.title_en)}</span>
                      {pick(locale, tp.description, tp.description_en) ? (
                        <span className="mt-0.5 block text-sm text-muted-foreground">{pick(locale, tp.description, tp.description_en)}</span>
                      ) : null}
                    </span>
                    {active ? <Check className="h-5 w-5 shrink-0 text-primary" /> : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <button type="button" onClick={goBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
                <ArrowLeft className="h-4 w-4" /> {t.common.back}
              </button>
              <button
                type="button"
                onClick={() => selectAndAdvance(() => setTopicId(null))}
                className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
              >
                {pick(locale, "Je préfère ne pas préciser", "I'd rather not specify")}
              </button>
            </div>
          </section>
        ) : null}

        {/* ── QUESTION (une à la fois) ── */}
        {screen.k === "question" ? (
          <QuestionScreen
            q={screen.q}
            locale={locale}
            value={answers[screen.q.id]}
            error={error}
            onSelectAdvance={(v) => selectAndAdvance(() => setAnswers((prev) => ({ ...prev, [screen.q.id]: v })))}
            onChange={(v) => setAnswers((prev) => ({ ...prev, [screen.q.id]: v }))}
            onBack={goBack}
            onContinue={() => continueQuestion(screen.q)}
          />
        ) : null}

        {/* ── COORDONNÉES ── */}
        {screen.k === "contact" ? (
          <section>
            <h2 className="mb-2 font-serif text-2xl font-medium text-foreground sm:text-3xl">{t.tunnel.yourInfo}</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {pick(locale, "Ces informations restent strictement confidentielles.", "This information stays strictly confidential.")}
            </p>
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
                <label className="mb-1.5 block text-sm font-medium text-foreground">{t.tunnel.note}</label>
                <textarea
                  rows={4}
                  value={client.note}
                  onChange={(e) => setClient({ ...client, note: e.target.value })}
                  className={inputCls}
                />
              </div>
              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
                />
                <span>{t.tunnel.consent}</span>
              </label>
            </div>
            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
            <div className="mt-8 flex items-center justify-between">
              <button type="button" onClick={goBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
                <ArrowLeft className="h-4 w-4" /> {t.common.back}
              </button>
              <button type="button" onClick={contactContinue} className={primaryBtn}>
                {t.common.next} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        ) : null}

        {/* ── CRÉNEAU & PAIEMENT ── */}
        {screen.k === "slot" ? (
          <section>
            <h2 className="mb-2 font-serif text-2xl font-medium text-foreground sm:text-3xl">{t.tunnel.chooseSlot}</h2>
            {service ? (
              <p className="mb-6 text-sm text-muted-foreground">
                {pick(locale, service.title, service.title_en)} · {formatDuration(service.duration_min, locale)} ·{" "}
                <span className="font-medium text-foreground">{formatPrice(service.price_cents, service.currency, locale)}</span>
              </p>
            ) : null}

            {loadingSlots ? (
              <p className="text-sm text-muted-foreground">{t.common.loading}</p>
            ) : slotsByDay.length > 0 ? (
              <div className="space-y-5">
                {slotsByDay.map(([day, daySlots]) => (
                  <div key={day}>
                    <h3 className="mb-2 text-sm font-medium capitalize text-foreground">{formatDayLabel(daySlots[0].start, locale)}</h3>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((s) => (
                        <button
                          key={s.start}
                          type="button"
                          onClick={() => setSelectedSlot(s.start)}
                          className={`rounded-full border-2 px-4 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
                            selectedSlot === s.start
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
              <p className="text-sm text-muted-foreground">{t.tunnel.noSlots}</p>
            )}

            <p className="mt-6 text-xs text-muted-foreground">{t.tunnel.holdInfo}</p>
            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

            <div className="mt-8 flex items-center justify-between">
              <button type="button" onClick={goBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
                <ArrowLeft className="h-4 w-4" /> {t.common.back}
              </button>
              <button type="button" onClick={pay} disabled={submitting || !selectedSlot} className={`${primaryBtn} disabled:opacity-50`}>
                {submitting ? t.common.loading : t.tunnel.pay}
              </button>
            </div>
          </section>
        ) : null}
      </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles partagés
// ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
const primaryBtn =
  "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105";

// ─────────────────────────────────────────────────────────────
// Sous-composants
// ─────────────────────────────────────────────────────────────
function BackBar({ locale, onBack }: { locale: Locale; onBack: () => void }) {
  const t = getDict(locale);
  return (
    <div className="mt-6">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> {t.common.back}
      </button>
    </div>
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
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required ? " *" : ""}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  );
}

function QuestionScreen({
  q,
  locale,
  value,
  error,
  onSelectAdvance,
  onChange,
  onBack,
  onContinue,
}: {
  q: Question;
  locale: Locale;
  value: unknown;
  error: string | null;
  onSelectAdvance: (v: unknown) => void;
  onChange: (v: unknown) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const t = getDict(locale);
  const label = pick(locale, q.label, q.label_en);
  const help = pick(locale, q.help_text, q.help_text_en);
  const opts = q.options ?? [];
  const auto = autoAdvances(q.type);

  const chip = (active: boolean) =>
    `rounded-2xl border-2 px-5 py-3.5 text-left text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
      active ? "animate-pop border-primary bg-secondary/50 text-foreground shadow-soft" : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/30 hover:shadow-card"
    }`;

  return (
    <section>
      <h2 className="mb-1.5 font-serif text-2xl font-medium leading-snug text-foreground sm:text-3xl">
        {label}
        {q.required ? <span className="text-primary"> *</span> : null}
      </h2>
      {help ? <p className="mb-6 text-sm text-muted-foreground">{help}</p> : <div className="mb-6" />}

      {/* Choix unique */}
      {q.type === "single_choice" ? (
        <div className="grid gap-3">
          {opts.map((o) => {
            const active = value === o.value;
            return (
              <button key={o.value} type="button" onClick={() => onSelectAdvance(o.value)} className={`flex items-center justify-between ${chip(active)}`}>
                <span className="font-medium">{pick(locale, o.label, o.label_en)}</span>
                {active ? <Check className="h-5 w-5 text-primary" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Oui / Non */}
      {q.type === "boolean" ? (
        <div className="grid grid-cols-2 gap-3">
          {[
            { v: true, label: pick(locale, "Oui", "Yes") },
            { v: false, label: pick(locale, "Non", "No") },
          ].map((o) => {
            const active = value === o.v;
            return (
              <button key={String(o.v)} type="button" onClick={() => onSelectAdvance(o.v)} className={`text-center font-medium ${chip(active)}`}>
                {o.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Échelle 0–4 */}
      {q.type === "scale" ? (
        <div className="flex flex-wrap gap-2.5">
          {[0, 1, 2, 3, 4].map((n) => {
            const active = value === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onSelectAdvance(n)}
                className={`h-12 w-12 rounded-full border-2 text-base font-medium transition-all duration-300 hover:-translate-y-0.5 active:scale-90 ${
                  active ? "animate-pop border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-card text-foreground hover:border-primary/50"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Choix multiple */}
      {q.type === "multi_choice" ? (
        <div className="grid gap-3">
          {opts.map((o) => {
            const arr = Array.isArray(value) ? (value as string[]) : [];
            const on = arr.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange(on ? arr.filter((v) => v !== o.value) : [...arr, o.value])}
                className={`flex items-center justify-between ${chip(on)}`}
              >
                <span className="font-medium">{pick(locale, o.label, o.label_en)}</span>
                {on ? <Check className="h-5 w-5 text-primary" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Texte court */}
      {q.type === "short_text" ? (
        <input className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} autoFocus />
      ) : null}

      {/* Texte long */}
      {q.type === "long_text" ? (
        <textarea rows={4} className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} autoFocus />
      ) : null}

      {/* Date */}
      {q.type === "date" ? (
        <input type="date" className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : null}

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <div className="mt-8 flex items-center justify-between">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> {t.common.back}
        </button>
        {/* Auto-advance : pas de bouton Continuer pour les choix uniques/oui-non/échelle */}
        {!auto ? (
          <button type="button" onClick={onContinue} className={primaryBtn}>
            {t.common.next} <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">{pick(locale, "Sélectionne une réponse", "Pick an answer")}</span>
        )}
      </div>
    </section>
  );
}
