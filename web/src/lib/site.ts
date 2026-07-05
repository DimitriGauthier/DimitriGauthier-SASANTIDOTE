// Config statique du site (fallback quand la table settings n'est pas encore câblée).
// Valeurs issues du cahier des charges rempli par Dimitri.
import type { Locale } from "./i18n";

export const siteConfig = {
  practitionerName: "Dimitri Gauthier",
  tagline: {
    fr: "Sexothérapie · La TRAME® · Numérologie",
    en: "Sex therapy · The TRAME® · Numerology",
  },
  phone: "+262 692 52 72 86",
  whatsappDigits: "262692527286", // pour wa.me (sans + ni espaces)
  email: "dimitrigauthier974@gmail.com",
  instagram: "https://instagram.com/dimitrigauthier",
  zone: { fr: "La Réunion & métropole", en: "Réunion Island & mainland France" },
  currency: "EUR",
  legalEntity: {
    name: "ANTIDOTE SAS",
    capital: "1 000 €",
    address: "5 chemin Grand Canal · Immeuble Thalès A, 2ᵉ étage · ZAC Triangle · 97490 Sainte-Clotilde · La Réunion",
    rcs: "RCS Saint-Denis 902 472 117",
  },
} as const;

export function whatsappUrl(digits: string = siteConfig.whatsappDigits): string {
  return `https://wa.me/${digits}`;
}

// Navigation principale : slug de route + clé de libellé (cf. i18n getDict().nav)
export type NavKey =
  | "about"
  | "approach"
  | "numerology"
  | "trame"
  | "services"
  | "pricing"
  | "faq"
  | "reviews"
  | "blog"
  | "contact";

export const navItems: { slug: string; key: NavKey }[] = [
  { slug: "a-propos", key: "about" },
  { slug: "mon-approche", key: "approach" },
  { slug: "numerologie-sexualite", key: "numerology" },
  { slug: "la-trame", key: "trame" },
  { slug: "accompagnements", key: "services" },
  { slug: "tarifs", key: "pricing" },
  { slug: "faq", key: "faq" },
  { slug: "avis", key: "reviews" },
  { slug: "blog", key: "blog" },
  { slug: "contact", key: "contact" },
];

/** Construit un chemin localisé : href("fr","a-propos") => "/fr/a-propos" */
export function href(locale: Locale, slug = ""): string {
  return `/${locale}${slug ? `/${slug}` : ""}`;
}

// ── Application « expérience » INTIMY (sous-domaine intimy.dimitrigauthier.com) ──
// Configurables par variable d'env pour basculer sans changer le code :
//   NEXT_PUBLIC_EXPERIENCE_URL = https://intimy.dimitrigauthier.com
//   NEXT_PUBLIC_SITE_URL       = https://dimitrigauthier.com
// En local (envs vides), on retombe sur les routes internes.
const EXPERIENCE_BASE = (process.env.NEXT_PUBLIC_EXPERIENCE_URL ?? "").replace(/\/$/, "");
const SITE_BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

/** Lien vers l'expérience : sous-domaine dédié si configuré, sinon route interne. */
export function experienceHref(locale: Locale): string {
  return EXPERIENCE_BASE ? `${EXPERIENCE_BASE}/${locale}` : `/${locale}/experience`;
}

/** Lien vers le site principal (utile depuis le sous-domaine « intime. »). */
export function mainSiteHref(locale: Locale, slug = ""): string {
  const path = href(locale, slug);
  return SITE_BASE ? `${SITE_BASE}${path}` : path;
}
