// Formatage — tout est stocké en UTC ; l'affichage se fait en Indian/Reunion (UTC+4, sans DST).
import type { Locale } from "./i18n";

export const TZ = "Indian/Reunion";

function intlLocale(locale: Locale): string {
  return locale === "en" ? "en-GB" : "fr-FR";
}

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDayLabel(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export function formatTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Clé de jour (yyyy-mm-dd) en heure locale Réunion, pour regrouper les créneaux. */
export function reunionDayKey(iso: string): string {
  return new Date(new Date(iso).getTime() + 4 * 3600_000).toISOString().slice(0, 10);
}

export function formatPrice(cents: number, currency = "EUR", locale: Locale = "fr"): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatDuration(min: number, locale: Locale = "fr"): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (locale === "en") return h ? `${h} h${m ? ` ${m}` : ""}` : `${m} min`;
  return h ? `${h} h${m ? ` ${m}` : ""}` : `${m} min`;
}
