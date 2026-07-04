"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { ContactMessage } from "@/lib/types";

export default function MessagesAdmin({ locale, messages }: { locale: Locale; messages: ContactMessage[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(id: string, status: "read" | "archived" | "new") {
    setBusy(id);
    const sb = getSupabaseBrowser();
    await sb?.from("contact_messages").update({ status }).eq("id", id);
    setBusy(null);
    router.refresh();
  }

  if (messages.length === 0) {
    return <p className="text-sm text-muted-foreground">{pick(locale, "Aucun message.", "No messages.")}</p>;
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`rounded-2xl border bg-card p-5 shadow-card ${m.status === "new" ? "border-primary/40" : "border-border/60"}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium text-foreground">
              {m.name} <span className="text-xs font-normal text-muted-foreground">· {m.email}</span>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{m.status}</span>
          </div>
          {m.subject ? <div className="mt-1 text-sm font-medium text-foreground">{m.subject}</div> : null}
          {m.phone ? <div className="text-xs text-muted-foreground">{m.phone}</div> : null}
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{m.message}</p>
          <div className="mt-3 flex gap-2">
            <a
              href={`mailto:${m.email}`}
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:brightness-105"
            >
              {pick(locale, "Répondre", "Reply")}
            </a>
            {m.status !== "read" ? (
              <button
                type="button"
                disabled={busy === m.id}
                onClick={() => setStatus(m.id, "read")}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {pick(locale, "Marquer lu", "Mark read")}
              </button>
            ) : null}
            {m.status !== "archived" ? (
              <button
                type="button"
                disabled={busy === m.id}
                onClick={() => setStatus(m.id, "archived")}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {pick(locale, "Archiver", "Archive")}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
