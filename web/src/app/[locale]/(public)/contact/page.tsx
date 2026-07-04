// Contact — coordonnées + formulaire (→ contact_messages via /api/contact).
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { siteConfig, whatsappUrl } from "@/lib/site";
import { PageTitle, Section, Card } from "@/components/ui";
import ContactForm from "@/components/ContactForm";

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
      <PageTitle sub={pick(l, "Une question ? Écris-moi.", "A question? Write to me.")}>
        {pick(l, "Contact", "Contact")}
      </PageTitle>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <ContactForm locale={l} />
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="mb-3 font-semibold">{pick(l, "Me joindre directement", "Reach me directly")}</h2>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="hover:text-neutral-900">
                  {pick(l, "Téléphone", "Phone")} : {siteConfig.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="hover:text-neutral-900">
                  {pick(l, "E-mail", "Email")} : {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-900"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-900"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="mb-1 font-semibold">{pick(l, "Zone & format", "Area & format")}</h2>
            <p className="text-sm text-neutral-600">
              {siteConfig.zone[l]} · {pick(l, "consultations en visio", "online sessions")}
            </p>
          </Card>
        </aside>
      </div>

      <Section title={pick(l, "Confidentialité", "Confidentiality")}>
        <p className="text-sm text-neutral-600">
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
