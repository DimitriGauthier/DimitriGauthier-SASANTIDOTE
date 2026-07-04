// Contact — coordonnées + formulaire (→ contact_messages via /api/contact).
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { siteConfig, whatsappUrl } from "@/lib/site";
import { PageTitle, Section, Card } from "@/components/ui";
import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import ContactForm from "@/components/ContactForm";

// Glyphe Instagram en SVG (les icônes de marque ne font plus partie de lucide-react).
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "Contact", "Contact"),
    description: pick(
      l,
      "Une question ? Écris-moi. Je te réponds au plus vite.",
      "A question? Write to me. I'll get back to you as soon as possible.",
    ),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";

  return (
    <div>
      <PageTitle eyebrow={pick(l, "Contact", "Get in touch")} sub={pick(l, "Une question ? Écris-moi.", "A question? Write to me.")}>
        {pick(l, "Contact", "Contact")}
      </PageTitle>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <ContactForm locale={l} />
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="mb-4 font-serif text-lg font-medium text-foreground">{pick(l, "Me joindre directement", "Reach me directly")}</h2>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary"><Phone className="h-4 w-4" /></span>
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary"><Mail className="h-4 w-4" /></span>
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary"><MessageCircle className="h-4 w-4" /></span>
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary"><InstagramIcon className="h-4 w-4" /></span>
                  Instagram
                </a>
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="mb-2 flex items-center gap-2 font-serif text-lg font-medium text-foreground">
              <MapPin className="h-4 w-4 text-primary" /> {pick(l, "Zone & format", "Area & format")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {siteConfig.zone[l]} · {pick(l, "consultations en visio", "online sessions")}
            </p>
          </Card>
        </aside>
      </div>

      <Section title={pick(l, "Confidentialité", "Confidentiality")}>
        <p className="text-sm text-muted-foreground">
          {pick(
            l,
            "Tes informations sont traitées de manière confidentielle et ne sont utilisées que pour te répondre. Voir la politique de confidentialité.",
            "Your information is handled confidentially and used only to respond to you. See the privacy policy.",
          )}
        </p>
      </Section>
    </div>
  );
}
