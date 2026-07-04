"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const NAV: { slug: string; fr: string; en: string }[] = [
  { slug: "", fr: "Tableau de bord", en: "Dashboard" },
  { slug: "bookings", fr: "Rendez-vous", en: "Appointments" },
  { slug: "payments", fr: "Paiements", en: "Payments" },
  { slug: "reviews", fr: "Avis", en: "Reviews" },
  { slug: "messages", fr: "Messages", en: "Messages" },
  { slug: "blog", fr: "Blog", en: "Blog" },
  { slug: "services", fr: "Accompagnements", en: "Sessions" },
  { slug: "topics", fr: "Motifs", en: "Topics" },
  { slug: "questions", fr: "Questionnaire", en: "Questionnaire" },
  { slug: "availability", fr: "Disponibilités", en: "Availability" },
  { slug: "settings", fr: "Paramètres", en: "Settings" },
];

export default function AdminSidebar({ locale, email }: { locale: Locale; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/${locale}/admin`;

  async function logout() {
    const sb = getSupabaseBrowser();
    await sb?.auth.signOut();
    router.replace(`/${locale}/admin/login`);
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-6 px-2">
        <div className="text-sm font-semibold">{pick(locale, "Espace praticien", "Practitioner area")}</div>
        <div className="mt-0.5 truncate text-xs text-neutral-500">{email}</div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 text-sm">
        {NAV.map((item) => {
          const path = item.slug ? `${base}/${item.slug}` : base;
          const active = item.slug ? pathname.startsWith(path) : pathname === base;
          return (
            <Link
              key={item.slug || "home"}
              href={path}
              className={`rounded-md px-3 py-2 ${active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-200"}`}
            >
              {pick(locale, item.fr, item.en)}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={logout}
        className="mt-4 rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-200"
      >
        {pick(locale, "Se déconnecter", "Sign out")}
      </button>
    </aside>
  );
}
