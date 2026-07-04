// Dépôt d'avis via lien à token (envoyé après la séance).
// Valide le token côté serveur (service-role) puis affiche le formulaire ou un message.
import type { Metadata } from "next";
import { isLocale, type Locale, pick, getDict } from "@/lib/i18n";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PageTitle } from "@/components/ui";
import ReviewForm from "@/components/ReviewForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type State = "form" | "already" | "invalid";

async function resolveState(token: string): Promise<State> {
  const sb = getSupabaseAdmin();
  if (!sb) return "form"; // mode dev/placeholder : on montre le formulaire
  const { data } = await sb
    .from("reviews")
    .select("status")
    .eq("invite_token", token)
    .maybeSingle();
  if (!data) return "invalid";
  if (data.status === "invited") return "form";
  if (data.status === "submitted" || data.status === "published") return "already";
  return "invalid";
}

export default async function ReviewInvitePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const t = getDict(l);
  const state = await resolveState(token);

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle sub={pick(l, "Ton retour compte beaucoup", "Your feedback matters")}>
        {t.review.title}
      </PageTitle>

      {state === "form" ? (
        <ReviewForm locale={l} token={token} />
      ) : state === "already" ? (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-neutral-700">
          {t.review.thanks}
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
          {t.review.invalid}
        </div>
      )}
    </div>
  );
}
