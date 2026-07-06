"use client";

import Link from "next/link";
import Image from "next/image";
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
    <aside className="glass sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border/60 p-4 print:hidden">
      <div className="mb-6 px-2">
        <Link href={base} className="flex items-center gap-2">
          <Image
            src="/img/logo.png"
            alt=""
            width={120}
            height={40}
            className="h-9 w-auto"
          />
        </Link>
        <div className="mt-3 font-serif text-lg font-medium text-foreground">
          {pick(locale, "Espace praticien", "Practitioner area")}
        </div>
        <div className="mt-0.5 truncate text-xs text-muted-foreground">{email}</div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto text-sm">
        {NAV.map((item) => {
          const path = item.slug ? `${base}/${item.slug}` : base;
          const active = item.slug ? pathname.startsWith(path) : pathname === base;
          return (
            <Link
              key={item.slug || "home"}
              href={path}
              className={`rounded-lg px-3 py-2 transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {pick(locale, item.fr, item.en)}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mt-4 rounded-full border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {pick(locale, "Se déconnecter", "Sign out")}
      </button>
    </aside>
  );
}
