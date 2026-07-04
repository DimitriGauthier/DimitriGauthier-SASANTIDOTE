// Mentions légales — éditable via content_pages (slug "mentions-legales"), sinon fallback ANTIDOTE SAS.
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
  return { title: pick(l, "Mentions légales", "Legal notice") };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const page = await getContentPage("mentions-legales");
  const html = pick(l, page?.body_html, page?.body_html_en);
  const le = siteConfig.legalEntity;

  return (
    <article className="mx-auto max-w-3xl">
      <PageTitle>{pick(l, "Mentions légales", "Legal notice")}</PageTitle>

      {html ? (
        <Prose html={html} />
      ) : (
        <>
          <Section title={pick(l, "Éditeur du site", "Site publisher")}>
            <ul className="space-y-1 text-sm text-neutral-700">
              <li>{le.name}</li>
              <li>{pick(l, "Capital social", "Share capital")} : {le.capital}</li>
              <li>{le.address}</li>
              <li>{le.rcs}</li>
              <li>
                {pick(l, "Représenté par", "Represented by")} : {siteConfig.practitionerName}
              </li>
              <li>
                {pick(l, "Contact", "Contact")} : {siteConfig.email} · {siteConfig.phone}
              </li>
            </ul>
          </Section>

          <Section title={pick(l, "Hébergement", "Hosting")}>
            <p className="text-sm text-neutral-700">
              {pick(
                l,
                "Le site est hébergé par son prestataire d'hébergement. Les coordonnées complètes de l'hébergeur seront précisées ici lors de la mise en production.",
                "The site is hosted by its hosting provider. The host's full details will be specified here at production launch.",
              )}
            </p>
          </Section>

          <Section title={pick(l, "Propriété intellectuelle", "Intellectual property")}>
            <p className="text-sm text-neutral-700">
              {pick(
                l,
                "L'ensemble des contenus (textes, images, logo) est protégé. Toute reproduction sans autorisation est interdite.",
                "All content (text, images, logo) is protected. Any reproduction without authorization is prohibited.",
              )}
            </p>
          </Section>
        </>
      )}
    </article>
  );
}
