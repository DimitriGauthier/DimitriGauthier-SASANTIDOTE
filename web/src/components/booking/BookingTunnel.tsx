"use client";

// Tunnel de réservation guidé, une question à la fois (auto-advance style Typeform).
// Flux : intro → prénom+nom → profil → motif → questionnaire (1 écran/question) → accompagnement → coordonnées → créneau → paiement.
// On demande le prénom+nom EN PREMIER : le guide « Dimitri » s'adresse ainsi à la
// personne par son prénom pendant tout le parcours. Les coordonnées de fin ne
// redemandent donc que l'e-mail / téléphone.
// L'accompagnement (formule + prix) est choisi APRÈS le questionnaire, pas au début.
// Les réponses à choix unique / oui-non / échelle passent AUTOMATIQUEMENT à l'écran suivant.
// Les champs texte et choix multiples gardent un bouton « Continuer ».
// Données (services, topics, questions) chargées côté serveur puis filtrées ici.
// get-slots / create-hold sont des Edge Functions (clé anon). Redirige vers Stripe au paiement.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Ref } from "react";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Clock, Heart } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { pick, getDict } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import type { Audience, Service, Topic, Question, QuestionCondition, Slot } from "@/lib/types";
import { getSlots, createHold, EdgeTimeoutError } from "@/lib/edge";
import { formatPrice, formatDuration, formatDayLabel, formatTime, reunionDayKey } from "@/lib/format";
import DimitriGuide from "@/components/booking/DimitriGuide";
import { HommeAvatar, FemmeAvatar, CoupleAvatar } from "@/components/booking/ProfileAvatars";
import { DimitriAvatar } from "@/components/DimitriAvatar";

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
  | { k: "identity" }
  | { k: "profile" }
  | { k: "service" }
  | { k: "topic" }
  | { k: "question"; q: Question }
  | { k: "contact" }
  | { k: "slot" };

const AUDIENCES = ["homme", "femme", "couple"] as const satisfies readonly Audience[];
const AUDIENCE_AVATAR = { homme: HommeAvatar, femme: FemmeAvatar, couple: CoupleAvatar } as const;

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

// ── Questionnaire adaptatif ──────────────────────────────────────────────────
// Une question porteuse d'un `show_if` ne s'affiche que si la réponse à sa
// question « déclencheur » (référencée par son `code`) satisfait la condition.
//   { code:"affective_status", in:["couple"] } → visible si la réponse ∈ liste
//   { code:"prior_support",     eq:true }       → visible si la réponse === valeur
// La réponse peut être un scalaire (choix unique / oui-non) ou un tableau
// (choix multiple) : dans ce dernier cas on teste l'intersection.
function conditionMet(cond: QuestionCondition, answer: unknown): boolean {
  if (cond.eq !== undefined) {
    if (Array.isArray(answer)) return answer.includes(cond.eq);
    return answer === cond.eq;
  }
  if (Array.isArray(cond.in)) {
    if (Array.isArray(answer)) return answer.some((a) => cond.in!.includes(a));
    return cond.in.includes(answer);
  }
  return true; // condition mal formée → on n'empêche pas l'affichage
}

// Une question est visible si elle n'a pas de condition, si son déclencheur est
// absent du parcours (autre profil → on ne masque pas par erreur), ou si la
// condition est satisfaite par la réponse en cours.
function isVisible(q: Question, answers: Record<string, unknown>, codeToId: Map<string, string>): boolean {
  const cond = q.show_if;
  if (!cond) return true;
  const controllerId = codeToId.get(cond.code);
  if (!controllerId) return true;
  return conditionMet(cond, answers[controllerId]);
}

// SSR-safe : useLayoutEffect côté client, useEffect au rendu serveur (évite le warning).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Emplacement « d'arrivée » de Dimitri actuellement visible (sidebar desktop OU barre mobile).
// On ignore les cibles masquées par media-query (display:none → aucun rect).
function visibleDimitriTarget(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-dimitri-target]"));
  return nodes.find((n) => n.getClientRects().length > 0) ?? null;
}

export default function BookingTunnel({ locale, services, topics, questions }: Props) {
  const t = getDict(locale);

  const [started, setStarted] = useState(false);
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

  // FLIP « hero » : Dimitri vole de l'accueil vers sa place de guide au clic sur « Commencer ».
  const [flying, setFlying] = useState(false);
  const introAvatarRef = useRef<HTMLSpanElement>(null);
  const flyFromRect = useRef<DOMRect | null>(null);
  const flyRef = useRef<HTMLDivElement>(null);

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

  // Table code → id (déclencheurs présents dans le parcours), pour évaluer les show_if.
  const codeToId = useMemo(() => {
    const m = new Map<string, string>();
    for (const q of availQuestions) if (q.code) m.set(q.code, q.id);
    return m;
  }, [availQuestions]);

  // Questionnaire adaptatif : on retire les questions dont la condition n'est pas
  // satisfaite (ex. « depuis combien de temps en couple ? » masquée si célibataire).
  const visibleQuestions = useMemo(
    () => availQuestions.filter((q) => isVisible(q, answers, codeToId)),
    [availQuestions, answers, codeToId],
  );

  const service = availServices.find((s) => s.id === serviceId) ?? null;

  // ---- Liste dynamique des écrans ----
  const screens = useMemo<Screen[]>(() => {
    // Ordre : prénom+nom → profil → motif → questionnaire → accompagnement → coordonnées → créneau.
    // On commence par l'identité pour tutoyer la personne par son prénom ensuite.
    // Le choix de l'accompagnement (formule + prix) vient APRÈS le questionnaire.
    const arr: Screen[] = [{ k: "identity" }, { k: "profile" }];
    if (availTopics.length > 0) arr.push({ k: "topic" });
    for (const q of visibleQuestions) arr.push({ k: "question", q });
    arr.push({ k: "service" }, { k: "contact" }, { k: "slot" });
    return arr;
  }, [availTopics.length, visibleQuestions]);

  const safeIndex = Math.min(index, screens.length - 1);
  const screen = screens[safeIndex];

  // Libellé du groupe courant (pour l'indicateur d'étape)
  const groupLabel = useMemo(() => {
    switch (screen.k) {
      case "identity":
        return pick(locale, "Faisons connaissance", "Let's meet");
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
  // Dès que le prénom est connu, le guide s'adresse à la personne par son prénom.
  const encouragement = useMemo(() => {
    const fn = client.first_name.trim();
    if (screen.k === "identity")
      return pick(locale, "Avant tout, dis-moi ton prénom : j'aime savoir à qui je parle.", "First, tell me your name: I like to know who I'm talking to.");
    if (screen.k === "slot")
      return fn
        ? pick(locale, `Dernière étape ${fn} : choisis ton moment.`, `Last step ${fn}: choose your moment.`)
        : pick(locale, "Dernière étape : choisis ton moment.", "Last step: choose your moment.");
    if (screen.k === "contact")
      return fn
        ? pick(locale, `On y est presque ${fn}, juste tes coordonnées.`, `Almost there ${fn}, just your details.`)
        : pick(locale, "On y est presque, juste tes coordonnées.", "Almost there, just your details.");
    if (screen.k === "profile")
      return fn
        ? pick(locale, `Enchanté ${fn}, on avance ensemble, à ton rythme.`, `Nice to meet you ${fn}, we move forward together, at your pace.`)
        : pick(locale, "C'est parti, on avance ensemble, à ton rythme.", "Here we go, we move forward together, at your pace.");
    const ratio = stepNum / stepTotal;
    if (ratio < 0.5)
      return fn
        ? pick(locale, `Tu avances bien ${fn}, continue.`, `You're doing great ${fn}, keep going.`)
        : pick(locale, "Tu avances bien, continue.", "You're doing great, keep going.");
    return pick(locale, "Plus que quelques pas.", "Just a few more steps.");
  }, [screen, stepNum, stepTotal, locale, client.first_name]);

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

  // Étape 1 : prénom + nom (indispensables pour tutoyer la personne ensuite).
  function identityContinue() {
    if (!client.first_name.trim() || !client.last_name.trim()) {
      setError(pick(locale, "Ton prénom et ton nom, pour commencer.", "Your first and last name, to begin."));
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
        answers: visibleQuestions.map((q) => ({
          question_id: q.id,
          label: pick(locale, q.label, q.label_en),
          value: answers[q.id] ?? null,
        })),
        consent_rgpd: consent,
        locale,
      });
      if (!res.checkout_url) {
        throw new Error(pick(locale, "Le paiement n'a pas pu démarrer.", "Payment could not start."));
      }
      window.location.href = res.checkout_url;
    } catch (e) {
      const msg = e instanceof EdgeTimeoutError
        ? pick(locale, "Le paiement met trop de temps à démarrer. Vérifie ta connexion et réessaie dans un instant.", "Payment is taking too long to start. Check your connection and try again in a moment.")
        : e instanceof Error
          ? e.message
          : pick(locale, "Le paiement n'a pas pu démarrer.", "Payment could not start.");
      setError(msg);
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

  // ---- FLIP « hero » Dimitri : de l'accueil vers sa place de guide ----
  function handleStart() {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = introAvatarRef.current;
    if (!reduce && el) {
      flyFromRect.current = el.getBoundingClientRect();
      setFlying(true);
    }
    setStarted(true);
  }

  useIsoLayoutEffect(() => {
    if (!started || !flying) return;
    const from = flyFromRect.current;
    const fly = flyRef.current;
    const target = visibleDimitriTarget();
    if (!from || !fly || !target) {
      setFlying(false);
      return;
    }
    const to = target.getBoundingClientRect();
    const scale = to.width / from.width;
    // First : le clone démarre pile sur l'avatar d'accueil (aucune transition).
    fly.style.transition = "none";
    fly.style.transformOrigin = "top left";
    fly.style.transform = `translate(${from.left}px, ${from.top}px) scale(1)`;
    void fly.getBoundingClientRect(); // force le reflow avant de jouer la transition
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setFlying(false); // révèle l'avatar réel du guide (identique, même place → sans accroc)
    };
    const raf = requestAnimationFrame(() => {
      // Play : il glisse et se met à l'échelle de sa place de guide.
      fly.style.transition = "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)";
      fly.style.transform = `translate(${to.left}px, ${to.top}px) scale(${scale})`;
    });
    fly.addEventListener("transitionend", finish, { once: true });
    const fallback = window.setTimeout(finish, 950);
    return () => {
      cancelAnimationFrame(raf);
      fly.removeEventListener("transitionend", finish);
      window.clearTimeout(fallback);
    };
  }, [started, flying]);

  const guideName = siteConfig.practitionerName.split(" ")[0];
  // Nom du prospect affiché sous le duo d'avatars : son prénom dès qu'il est saisi
  // (collecté en première étape), sinon un « toi » (ou « vous deux » pour un couple).
  const firstName = client.first_name.trim();
  const companion =
    firstName ||
    (audience === "couple" ? pick(locale, "vous deux", "you two") : pick(locale, "toi", "you"));
  const guideRole = audience
    ? pick(locale, "Vous avancez ensemble", "Moving forward together")
    : pick(locale, "Ton accompagnant", "Your companion");

  // Écran d'accueil : on explique l'expérience avant de lancer le formulaire.
  if (!started) {
    return <IntroScreen locale={locale} name={guideName} onStart={handleStart} avatarRef={introAvatarRef} />;
  }

  return (
    <>
    {/* Clone volant de Dimitri (FLIP) : pont visuel entre l'accueil et sa place de guide. */}
    {flying ? (
      <div
        ref={flyRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60]"
        style={{ transform: "translate(-9999px, -9999px)", transformOrigin: "top left" }}
      >
        <DimitriAvatar size={100} />
      </div>
    ) : null}
    <div className="mx-auto min-w-0 max-w-4xl lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
      {/* Guide « Dimitri » — colonne de gauche (desktop) */}
      <DimitriGuide message={encouragement} name={guideName} role={guideRole} variant="sidebar" audience={audience} companion={companion} hideAvatar={flying} />

      {/* min-w-0 : empêche cette colonne de forcer une largeur supérieure au viewport
          (bug de débordement horizontal sur mobile — flex/grid child min-width auto). */}
      <div className="min-w-0">
      {/* Guide compact (mobile) */}
      <DimitriGuide message={encouragement} name={guideName} role={guideRole} variant="bar" audience={audience} companion={companion} hideAvatar={flying} />

      {/* Progression — barre dégradée. L'encouragement n'est PAS répété ici :
          il est déjà porté par la bulle de Dimitri (guide) juste au-dessus. */}
      <div className="mb-6">
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
      </div>

      <div key={safeIndex} className="animate-fade-up">
        {/* ── IDENTITÉ (prénom + nom, en premier) ── */}
        {screen.k === "identity" ? (
          <section>
            <h2 className="mb-2 font-serif text-2xl font-medium text-foreground sm:text-3xl">
              {pick(locale, "Faisons connaissance", "Let's get to know each other")}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {pick(
                locale,
                "Comment t'appelles-tu ? Je pourrai ainsi t'accompagner par ton prénom tout au long du parcours.",
                "What's your name? That way I can guide you by your first name throughout.",
              )}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label={t.tunnel.firstName}
                value={client.first_name}
                onChange={(v) => setClient({ ...client, first_name: v })}
                onEnter={identityContinue}
                autoFocus
                required
              />
              <TextInput
                label={t.tunnel.lastName}
                value={client.last_name}
                onChange={(v) => setClient({ ...client, last_name: v })}
                onEnter={identityContinue}
                required
              />
            </div>
            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
            <div className="mt-8 flex items-center justify-end">
              <button type="button" onClick={identityContinue} className={primaryBtn}>
                {t.common.next} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        ) : null}

        {/* ── PROFIL ── */}
        {screen.k === "profile" ? (
          <section>
            <h2 className="mb-2 font-serif text-2xl font-medium text-foreground sm:text-3xl">
              {pick(locale, "Pour qui est cet accompagnement ?", "Who is this session for?")}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {pick(locale, "Aucune bonne ou mauvaise réponse, choisis ce qui te ressemble.", "No right or wrong answer, pick what feels like you.")}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {AUDIENCES.map((a) => {
                const Avatar = AUDIENCE_AVATAR[a];
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
                    className={`group flex flex-col items-center gap-2 rounded-2xl border-2 px-2 py-4 text-center transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] sm:gap-3 sm:px-4 sm:py-6 ${
                      active
                        ? "animate-pop border-primary bg-secondary/50 shadow-soft"
                        : "border-border bg-card hover:border-primary/40 hover:bg-secondary/30 hover:shadow-card"
                    }`}
                  >
                    <Avatar
                      size={84}
                      active={active}
                      className={`h-16 w-16 transition-transform duration-300 sm:h-[84px] sm:w-[84px] ${active ? "animate-float" : "group-hover:scale-105"}`}
                    />
                    <span className="font-serif text-sm text-foreground sm:text-lg">
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
            <h2 className="mb-2 font-serif text-2xl font-medium text-foreground sm:text-3xl">
              {client.first_name.trim()
                ? pick(locale, `Merci ${client.first_name.trim()}, comment te joindre ?`, `Thanks ${client.first_name.trim()}, how can I reach you?`)
                : t.tunnel.yourInfo}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {pick(locale, "Ces informations restent strictement confidentielles.", "This information stays strictly confidential.")}
            </p>
            <div className="space-y-4">
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
    </>
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

// Écran d'accueil de l'expérience : explique le parcours puis lance le formulaire.
function IntroScreen({
  locale,
  name,
  onStart,
  avatarRef,
}: {
  locale: Locale;
  name: string;
  onStart: () => void;
  avatarRef?: Ref<HTMLSpanElement>;
}) {
  const points = [
    {
      Icon: ShieldCheck,
      title: pick(locale, "100 % confidentiel", "100% confidential"),
      text: pick(locale, "Tes réponses restent entre toi et Dimitri.", "Your answers stay between you and Dimitri."),
    },
    {
      Icon: Heart,
      title: pick(locale, "À ton rythme", "At your pace"),
      text: pick(locale, "Pas de bonne ou mauvaise réponse, tu peux revenir en arrière.", "No right or wrong answer, you can go back anytime."),
    },
    {
      Icon: Clock,
      title: pick(locale, "3 à 5 minutes", "3 to 5 minutes"),
      text: pick(locale, "Quelques questions simples, puis le choix de ton créneau.", "A few simple questions, then pick your slot."),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 text-center shadow-soft sm:p-12">
        <div aria-hidden className="blob pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/40" />
        <div className="relative">
          {/* Span mesurable (ref) : point de départ du vol de Dimitri vers le guide. */}
          <span ref={avatarRef} className="inline-block">
            <DimitriAvatar size={100} className="animate-float" />
          </span>
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            {pick(locale, "L'expérience INTIMY", "The INTIMY experience")}
          </p>
          <h2 className="mt-2 font-serif text-2xl font-medium text-foreground sm:text-3xl">
            {pick(locale, `Bienvenue, je suis ${name}`, `Welcome, I'm ${name}`)}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {pick(
              locale,
              "Ce parcours confidentiel me permet de mieux te connaître avant notre séance. Je te pose quelques questions simples, en toute intimité. Rien n'est envoyé tant que tu n'as pas terminé.",
              "This confidential journey helps me get to know you before our session. I'll ask a few simple questions, in full privacy. Nothing is sent until you're done.",
            )}
          </p>

          <div className="mt-7 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4">
            {points.map(({ Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-border/60 bg-background/60 p-3 text-center sm:p-4">
                <span className="mx-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary sm:h-10 sm:w-10">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <p className="mt-1.5 text-xs font-medium leading-snug text-foreground sm:mt-2 sm:text-sm">{title}</p>
                <p className="mt-1 hidden text-xs leading-snug text-muted-foreground sm:block">{text}</p>
              </div>
            ))}
          </div>

          <button type="button" onClick={onStart} className={`${primaryBtn} mt-7 justify-center sm:mt-9`}>
            {pick(locale, "Commencer", "Start")} <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            {pick(locale, "Tu pourras t'arrêter et reprendre quand tu veux.", "You can pause and resume whenever you like.")}
          </p>
        </div>
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  onEnter,
  type = "text",
  required = false,
  autoFocus = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onEnter ? (e) => { if (e.key === "Enter") { e.preventDefault(); onEnter(); } } : undefined}
        autoFocus={autoFocus}
        className={inputCls}
      />
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
    `rounded-2xl border-2 px-4 py-3 text-left text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] sm:px-5 sm:py-3.5 ${
      active ? "animate-pop border-primary bg-secondary/50 text-foreground shadow-soft" : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/30 hover:shadow-card"
    }`;

  return (
    <section>
      <h2 className="mb-1.5 font-serif text-xl font-medium leading-snug text-foreground sm:text-3xl">
        {label}
        {q.required ? <span className="text-primary"> *</span> : null}
      </h2>
      {help ? <p className="mb-5 text-sm text-muted-foreground sm:mb-6">{help}</p> : <div className="mb-5 sm:mb-6" />}

      {/* Choix unique */}
      {q.type === "single_choice" ? (
        <div className="grid gap-2.5 sm:gap-3">
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
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
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
        <div className="grid gap-2.5 sm:gap-3">
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

      <div className="mt-6 flex items-center justify-between sm:mt-8">
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
