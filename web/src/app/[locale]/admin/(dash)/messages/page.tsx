// Admin — messages du formulaire de contact.
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import type { ContactMessage } from "@/lib/types";
import MessagesAdmin from "@/components/admin/MessagesAdmin";

export default async function AdminMessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);

  const { data } = await sb
    .from("contact_messages")
    .select("*")
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(200);
  const messages = (data as ContactMessage[]) ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">{pick(l, "Messages", "Messages")}</h1>
      <MessagesAdmin locale={l} messages={messages} />
    </div>
  );
}
