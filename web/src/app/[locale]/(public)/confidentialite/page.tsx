// Politique de confidentialité — éditable via content_pages (slug "confidentialite"), sinon fallback RGPD.
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import { getContentPage } from "@/lib/data";
import { PageTitle, Section, Prose } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return { title: pick(l, "Politique de confidentialité", "Privacy policy") };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const page = await getContentPage("confidentialite");
  const html = pick(l, page?.body_html, page?.body_html_en);

  return (
    <article className="mx-auto max-w-3xl">
      <PageTitle eyebrow={pick(l, "Vos données", "Your data")}>{pick(l, "Politique de confidentialité", "Privacy policy")}</PageTitle>

      {html ? (
        <Prose html={html} />
      ) : (
        <>
          <Section title={pick(l, "Responsable du traitement", "Data controller")}>
            <p className="text-sm text-muted-foreground">
              {siteConfig.legalEntity.name} — {siteConfig.practitionerName}, {siteConfig.email}.
            </p>
          </Section>

          <Section title={pick(l, "Données collectées", "Data collected")}>
            <p className="text-sm text-muted-foreground">
              {pick(
                l,
                "Dans le cadre d'une prise de rendez-vous ou d'une demande de contact, sont collectés : nom, prénom, e-mail, téléphone, réponses au questionnaire d'admission et informations de paiement. Certaines de ces données relèvent de l'intimité et sont traitées avec une vigilance particulière.",
                "When booking or contacting, the following is collected: last name, first name, email, phone, intake questionnaire answers and payment information. Some of this data relates to your intimacy and is handled with particular care.",
              )}
            </p>
          </Section>

          <Section title={pick(l, "Finalités & base légale", "Purposes & legal basis")}>
            <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              <li>{pick(l, "Gérer les rendez-vous et le suivi thérapeutique.", "Manage appointments and therapeutic follow-up.")}</li>
              <li>{pick(l, "Traiter les paiements en ligne.", "Process online payments.")}</li>
              <li>{pick(l, "Répondre aux demandes de contact.", "Respond to contact requests.")}</li>
            </ul>
          </Section>

          <Section title={pick(l, "Conservation & sécurité", "Retention & security")}>
            <p className="text-sm text-muted-foreground">
              {pick(
                l,
                "Les données sont conservées le temps nécessaire au suivi puis archivées ou supprimées conformément à la réglementation. Elles sont stockées de manière sécurisée et ne sont jamais revendues.",
                "Data is kept for as long as needed for follow-up, then archived or deleted in accordance with regulations. It is stored securely and never resold.",
              )}
            </p>
          </Section>

          <Section title={pick(l, "Tes droits", "Your rights")}>
            <p className="text-sm text-muted-foreground">
              {pick(
                l,
                "Tu disposes d'un droit d'accès, de rectification, d'effacement et d'opposition sur tes données. Pour l'exercer, écris à ",
                "You have the right to access, rectify, erase and object to your data. To exercise it, write to ",
              )}
              <a href={`mailto:${siteConfig.email}`} className="story-link text-primary">
                {siteConfig.email}
              </a>
              .
            </p>
          </Section>
        </>
      )}
    </article>
  );
}
