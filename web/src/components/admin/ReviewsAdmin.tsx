"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Review } from "@/lib/types";

export default function ReviewsAdmin({ locale, reviews }: { locale: Locale; reviews: Review[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(id: string, status: "published" | "hidden") {
    setBusy(id);
    const sb = getSupabaseBrowser();
    const patch: Record<string, unknown> = { status };
    if (status === "published") patch.published_at = new Date().toISOString();
    await sb?.from("reviews").update(patch).eq("id", id);
    setBusy(null);
    router.refresh();
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">{pick(locale, "Aucun avis.", "No reviews.")}</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div className="text-gold">
              {"★".repeat(r.rating ?? 0)}
              <span className="text-border">{"★".repeat(5 - (r.rating ?? 0))}</span>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{r.status}</span>
          </div>
          {r.comment ? <p className="mt-2 font-serif text-base italic text-foreground/90">« {r.comment} »</p> : null}
          <p className="mt-1 text-xs text-muted-foreground">{r.client_display_name ?? pick(locale, "Anonyme", "Anonymous")}</p>
          <div className="mt-3 flex gap-2">
            {r.status !== "published" ? (
              <button
                type="button"
                disabled={busy === r.id}
                onClick={() => setStatus(r.id, "published")}
                className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:brightness-105 disabled:opacity-50"
              >
                {pick(locale, "Publier", "Publish")}
              </button>
            ) : null}
            {r.status !== "hidden" ? (
              <button
                type="button"
                disabled={busy === r.id}
                onClick={() => setStatus(r.id, "hidden")}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {pick(locale, "Masquer", "Hide")}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
