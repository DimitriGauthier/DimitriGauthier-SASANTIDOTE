"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { pick, getDict } from "@/lib/i18n";

type Status = "idle" | "sending" | "ok" | "error";

export default function ReviewForm({ locale, token }: { locale: Locale; token: string }) {
  const t = getDict(locale);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, rating, comment, display_name: displayName }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-primary/20 bg-secondary/40 p-6 text-foreground shadow-card">
        {t.review.thanks}
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t.review.rating}</label>
        <div className="flex gap-1 text-3xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n}/5`}
              className={`transition-transform hover:scale-110 ${(hover || rating) >= n ? "text-gold" : "text-border"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="displayName">
          {pick(locale, "Nom affiché (facultatif)", "Display name (optional)")}
        </label>
        <input
          id="displayName"
          className={inputCls}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={pick(locale, "Ex. : Marie D.", "e.g. Marie D.")}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="comment">
          {t.review.comment}
        </label>
        <textarea id="comment" rows={5} className={inputCls} value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>

      {status === "error" ? (
        <p className="text-sm text-destructive">
          {rating < 1
            ? pick(locale, "Merci de choisir une note.", "Please choose a rating.")
            : pick(locale, "Une erreur est survenue. Réessaie.", "Something went wrong. Please try again.")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60"
      >
        {status === "sending" ? t.common.loading : t.review.submit}
      </button>
    </form>
  );
}
