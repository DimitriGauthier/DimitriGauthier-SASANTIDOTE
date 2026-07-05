"use client";

// Formulaire de contact « auto-advance » (une question à la fois, style Typeform).
// Champs texte : on avance avec Entrée ou le bouton « Continuer » (Ctrl+Entrée pour le message).
// Envoi final vers /api/contact avec les mêmes clés qu'avant (name, email, phone, subject, message).

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Send } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

type Status = "idle" | "sending" | "ok" | "error";
type FieldKey = "name" | "email" | "phone" | "subject" | "message";

type Step = {
  key: FieldKey;
  type: "text" | "email" | "tel" | "textarea";
  required: boolean;
  title: string;
  help: string;
  placeholder: string;
  autoComplete: string;
};

export default function ContactForm({ locale }: { locale: Locale }) {
  const steps = useMemo<Step[]>(
    () => [
      {
        key: "name",
        type: "text",
        required: true,
        title: pick(locale, "Comment t'appelles-tu ?", "What's your name?"),
        help: pick(locale, "Ton prénom suffit si tu préfères.", "Your first name is enough if you prefer."),
        placeholder: pick(locale, "Ton nom", "Your name"),
        autoComplete: "name",
      },
      {
        key: "email",
        type: "email",
        required: true,
        title: pick(locale, "Ton adresse e-mail ?", "Your email address?"),
        help: pick(locale, "C'est là que je te répondrai.", "That's where I'll reply to you."),
        placeholder: "email@exemple.com",
        autoComplete: "email",
      },
      {
        key: "phone",
        type: "tel",
        required: false,
        title: pick(locale, "Un numéro où te joindre ?", "A number to reach you?"),
        help: pick(locale, "Facultatif, seulement si tu préfères qu'on t'appelle.", "Optional, only if you'd rather be called."),
        placeholder: pick(locale, "Téléphone (facultatif)", "Phone (optional)"),
        autoComplete: "tel",
      },
      {
        key: "subject",
        type: "text",
        required: false,
        title: pick(locale, "Le sujet de ton message ?", "What's it about?"),
        help: pick(locale, "En quelques mots (facultatif).", "In a few words (optional)."),
        placeholder: pick(locale, "Sujet (facultatif)", "Subject (optional)"),
        autoComplete: "off",
      },
      {
        key: "message",
        type: "textarea",
        required: true,
        title: pick(locale, "Ton message", "Your message"),
        help: pick(locale, "Écris-moi ce que tu veux partager. Tout reste confidentiel.", "Write whatever you'd like to share. Everything stays confidential."),
        placeholder: pick(locale, "Ton message…", "Your message…"),
        autoComplete: "off",
      },
    ],
    [locale],
  );

  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Record<FieldKey, string>>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const step = steps[index];
  const isLast = index === steps.length - 1;
  const progress = Math.round(((index + 1) / steps.length) * 100);

  useEffect(() => {
    inputRef.current?.focus();
  }, [index]);

  function setValue(v: string) {
    setValues((prev) => ({ ...prev, [step.key]: v }));
  }

  function validateStep(): boolean {
    const v = values[step.key].trim();
    if (step.required && !v) {
      setError(pick(locale, "Ce champ est nécessaire pour continuer.", "This field is needed to continue."));
      return false;
    }
    if (step.key === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setError(pick(locale, "Adresse e-mail invalide.", "Invalid email address."));
      return false;
    }
    return true;
  }

  async function submit() {
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  function next() {
    if (!validateStep()) return;
    setError(null);
    if (isLast) void submit();
    else setIndex((i) => Math.min(steps.length - 1, i + 1));
  }
  function back() {
    setError(null);
    setStatus("idle");
    setIndex((i) => Math.max(0, i - 1));
  }
  function skip() {
    setError(null);
    setIndex((i) => Math.min(steps.length - 1, i + 1));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    if (step.type === "textarea") {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        next();
      }
      return;
    }
    e.preventDefault();
    next();
  }

  const inputCls =
    "w-full rounded-xl border-2 border-border bg-background px-4 py-3.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10";

  // ── Écran de succès ──
  if (status === "ok") {
    return (
      <div className="rounded-3xl border border-primary/20 bg-secondary/40 p-8 text-center shadow-card">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
          <Check className="h-7 w-7" />
        </div>
        <p className="font-serif text-2xl text-foreground">{pick(locale, "Message envoyé", "Message sent")}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {pick(
            locale,
            "Merci, ton message a bien été envoyé. Je te réponds au plus vite.",
            "Thank you, your message has been sent. I'll get back to you as soon as possible.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card sm:p-8">
      {/* Progression */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium uppercase tracking-[0.2em] text-primary">{pick(locale, "Écris-moi", "Write to me")}</span>
          <span className="text-muted-foreground">
            {pick(locale, "Étape", "Step")} {index + 1} / {steps.length}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--gold)))] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div key={index} className="animate-fade-up">
        <h2 className="font-serif text-2xl font-medium leading-snug text-foreground sm:text-3xl">
          {step.title}
          {step.required ? <span className="text-primary"> *</span> : null}
        </h2>
        {step.help ? <p className="mb-6 mt-1.5 text-sm text-muted-foreground">{step.help}</p> : <div className="mb-6" />}

        {step.type === "textarea" ? (
          <textarea
            ref={(el) => {
              inputRef.current = el;
            }}
            rows={5}
            className={inputCls}
            value={values[step.key]}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={step.placeholder}
          />
        ) : (
          <input
            ref={(el) => {
              inputRef.current = el;
            }}
            type={step.type}
            className={inputCls}
            value={values[step.key]}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={step.placeholder}
            autoComplete={step.autoComplete}
          />
        )}

        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        {status === "error" ? (
          <p className="mt-4 text-sm text-destructive">
            {pick(
              locale,
              "Une erreur est survenue. Merci de réessayer ou de me contacter directement.",
              "Something went wrong. Please try again or contact me directly.",
            )}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-4">
          {index > 0 ? (
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> {pick(locale, "Retour", "Back")}
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-4">
            {!step.required && !isLast ? (
              <button
                type="button"
                onClick={skip}
                className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
              >
                {pick(locale, "Passer", "Skip")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={next}
              disabled={status === "sending"}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 active:scale-95 disabled:opacity-60"
            >
              {isLast ? (
                status === "sending" ? (
                  pick(locale, "Envoi…", "Sending…")
                ) : (
                  <>
                    {pick(locale, "Envoyer", "Send")} <Send className="h-4 w-4" />
                  </>
                )
              ) : (
                <>
                  {pick(locale, "Continuer", "Continue")} <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {step.type === "textarea"
            ? pick(locale, "Astuce : Ctrl + Entrée pour envoyer.", "Tip: Ctrl + Enter to send.")
            : pick(locale, "Astuce : appuie sur Entrée pour continuer.", "Tip: press Enter to continue.")}
        </p>
      </div>
    </div>
  );
}
