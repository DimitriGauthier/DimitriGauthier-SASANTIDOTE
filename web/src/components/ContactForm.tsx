"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

type Status = "idle" | "sending" | "ok" | "error";

export default function ContactForm({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const labelCls = "mb-1 block text-sm font-medium text-neutral-700";
  const inputCls =
    "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";

  if (status === "ok") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-800">
        {pick(
          locale,
          "Merci, ton message a bien été envoyé. Je te réponds au plus vite.",
          "Thank you, your message has been sent. I'll get back to you as soon as possible.",
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="name">
            {pick(locale, "Nom", "Name")} *
          </label>
          <input id="name" name="name" required className={inputCls} autoComplete="name" />
        </div>
        <div>
          <label className={labelCls} htmlFor="email">
            {pick(locale, "E-mail", "Email")} *
          </label>
          <input id="email" name="email" type="email" required className={inputCls} autoComplete="email" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="phone">
            {pick(locale, "Téléphone", "Phone")}
          </label>
          <input id="phone" name="phone" className={inputCls} autoComplete="tel" />
        </div>
        <div>
          <label className={labelCls} htmlFor="subject">
            {pick(locale, "Sujet", "Subject")}
          </label>
          <input id="subject" name="subject" className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls} htmlFor="message">
          {pick(locale, "Message", "Message")} *
        </label>
        <textarea id="message" name="message" required rows={6} className={inputCls} />
      </div>

      {status === "error" ? (
        <p className="text-sm text-red-600">
          {pick(
            locale,
            "Une erreur est survenue. Merci de réessayer ou de me contacter directement.",
            "Something went wrong. Please try again or contact me directly.",
          )}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
      >
        {status === "sending"
          ? pick(locale, "Envoi…", "Sending…")
          : pick(locale, "Envoyer", "Send")}
      </button>
    </form>
  );
}
