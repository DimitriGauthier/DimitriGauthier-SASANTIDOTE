// Réservation — redirige vers l'expérience INTIMY (parcours immersif plein écran, guidé par Dimitri).
// Tous les boutons « Prendre rendez-vous » du site convergent ici, puis vers l'expérience
// (sous-domaine intimy. en prod, /experience en local). Le tunnel n'est plus rendu « dans le site ».
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { experienceHref } from "@/lib/site";

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  redirect(experienceHref(l));
}
