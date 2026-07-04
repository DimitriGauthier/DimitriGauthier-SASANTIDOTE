"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { completeBooking } from "@/lib/edge";

export default function CompleteBookingButton({
  locale,
  bookingId,
}: {
  locale: Locale;
  bookingId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    try {
      const sb = getSupabaseBrowser();
      const { data } = (await sb?.auth.getSession()) ?? { data: { session: null } };
      const token = data.session?.access_token;
      if (!token) throw new Error("no_session");
      await completeBooking(bookingId, token);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        {loading ? "…" : pick(locale, "Marquer terminé + inviter à laisser un avis", "Mark completed + invite review")}
      </button>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
