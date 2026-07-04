import { siteConfig, whatsappUrl } from "@/lib/site";
import type { PublicSettings } from "@/lib/types";

export default function WhatsAppButton({ settings }: { settings: PublicSettings | null }) {
  const digits = settings?.whatsapp
    ? settings.whatsapp.replace(/[^\d]/g, "")
    : siteConfig.whatsappDigits;
  if (!digits) return null;
  return (
    <a
      href={whatsappUrl(digits)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-green-700"
    >
      WhatsApp
    </a>
  );
}
