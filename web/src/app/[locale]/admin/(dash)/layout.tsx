// Layout de l'espace admin authentifié (groupe (dash)). Garde d'accès + chrome latéral.
// N'hérite PAS du layout public : header/footer publics absents ici.
import { isLocale, type Locale } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminDashLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { user } = await requireAdmin(l);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar locale={l} email={user.email ?? ""} />
      <main className="flex-1 overflow-x-auto px-6 py-8">{children}</main>
    </div>
  );
}
