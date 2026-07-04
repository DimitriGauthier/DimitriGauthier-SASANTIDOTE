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
    return <p className="text-sm text-neutral-500">{pick(locale, "Aucun message.", "No messages.")}</p>;
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`rounded-lg border p-4 ${m.status === "new" ? "border-neutral-300 bg-neutral-50" : "border-neutral-200"}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium text-neutral-800">
              {m.name} <span className="text-xs font-normal text-neutral-500">· {m.email}</span>
            </div>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{m.status}</span>
          </div>
          {m.subject ? <div className="mt-1 text-sm font-medium text-neutral-600">{m.subject}</div> : null}
          {m.phone ? <div className="text-xs text-neutral-500">{m.phone}</div> : null}
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">{m.message}</p>
          <div className="mt-3 flex gap-2">
            <a
              href={`mailto:${m.email}`}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white hover:bg-neutral-700"
            >
              {pick(locale, "Répondre", "Reply")}
            </a>
            {m.status !== "read" ? (
              <button
                type="button"
                disabled={busy === m.id}
                onClick={() => setStatus(m.id, "read")}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 disabled:opacity-50"
              >
                {pick(locale, "Marquer lu", "Mark read")}
              </button>
            ) : null}
            {m.status !== "archived" ? (
              <button
                type="button"
                disabled={busy === m.id}
                onClick={() => setStatus(m.id, "archived")}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 disabled:opacity-50"
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
