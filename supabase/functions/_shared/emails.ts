// Gabarits d'emails FR/EN. La langue vient de booking.locale (choix du client).
// Les emails destinés à Dimitri restent en FR.
//
// Tous les emails passent par emailLayout() : un gabarit HTML « brandé » (tables +
// styles inline, ~600px) qui reprend l'identité visuelle du site (crème, terracotta,
// or, serif). Objectif : des emails qui ressemblent à la plateforme, pas à du texte brut.

export type Lang = "fr" | "en";

// ── Palette de marque (hex — les emails ne comprennent pas les variables CSS) ──
const C = {
  bg: "#F9F6F1", // crème (fond)
  card: "#FCFAF8", // carte
  ink: "#372B25", // texte principal
  muted: "#78675E", // texte secondaire
  border: "#E3DBD3", // filets
  primary: "#AE5F47", // terracotta (boutons, titres)
  gold: "#C09559", // or (accents)
  onPrimary: "#FDFBF7", // texte sur terracotta
} as const;

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

// Date lisible en heure locale Réunion, dans la langue voulue.
export function fmtReunion(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
    timeZone: "Indian/Reunion", dateStyle: "full", timeStyle: "short",
  }).format(new Date(iso));
}

// Échappe une valeur (saisie utilisateur) destinée à du HTML d'email.
export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Bouton « bulletproof » (rendu fiable sur tous les clients mail) ──
export function emailButton(label: string, url: string, variant: "primary" | "ghost" = "primary"): string {
  const bg = variant === "primary" ? C.primary : "transparent";
  const color = variant === "primary" ? C.onPrimary : C.primary;
  const border = variant === "primary" ? C.primary : C.border;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px auto;">
    <tr><td align="center" style="border-radius:10px;background:${bg};border:1px solid ${border};">
      <a href="${url}" target="_blank" style="display:inline-block;padding:13px 30px;font-family:${SANS};font-size:15px;font-weight:600;line-height:1;color:${color};text-decoration:none;letter-spacing:.2px;">${esc(label)}</a>
    </td></tr>
  </table>`;
}

// ── Ligne « fiche » (label + valeur) pour les blocs récap ──
function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-family:${SANS};font-size:13px;color:${C.muted};width:42%;vertical-align:top;">${esc(label)}</td>
    <td style="padding:6px 0;font-family:${SANS};font-size:14px;color:${C.ink};font-weight:600;vertical-align:top;">${value}</td>
  </tr>`;
}

// ── Encart mis en avant (ex. date du rendez-vous) ──
function highlight(inner: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
    <tr><td style="background:${C.bg};border:1px solid ${C.border};border-left:3px solid ${C.gold};border-radius:8px;padding:16px 20px;">
      ${inner}
    </td></tr>
  </table>`;
}

/**
 * Gabarit HTML brandé. `bodyHtml` est du HTML de confiance (construit en interne).
 * `preheader` = texte d'aperçu (masqué dans le corps). `signature` = signature bas de page.
 */
export function emailLayout(p: {
  lang: Lang;
  preheader: string;
  heading: string;
  bodyHtml: string;
  signature?: string;
}): string {
  const year = new Date().getFullYear();
  const footerNote = p.lang === "en"
    ? "You received this email following an appointment request on dimitrigauthier.com."
    : "Vous recevez cet email suite à une demande de rendez-vous sur dimitrigauthier.com.";
  const sign = p.signature ?? "Dimitri Gauthier";
  const tagline = p.lang === "en"
    ? "Sex therapy · The TRAME® · Numerology"
    : "Sexothérapie · La TRAME® · Numérologie";

  return `<!DOCTYPE html>
<html lang="${p.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${esc(p.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${C.bg};">${esc(p.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:${C.card};border:1px solid ${C.border};border-radius:16px;overflow:hidden;">
        <!-- En-tête / wordmark -->
        <tr><td style="padding:30px 40px 22px;text-align:center;border-bottom:1px solid ${C.border};">
          <div style="font-family:${SERIF};font-size:23px;letter-spacing:.5px;color:${C.primary};font-weight:600;">Dimitri Gauthier</div>
          <div style="font-family:${SANS};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.gold};margin-top:7px;">${tagline}</div>
        </td></tr>
        <!-- Corps -->
        <tr><td style="padding:34px 40px 8px;">
          <h1 style="margin:0 0 18px;font-family:${SERIF};font-size:22px;line-height:1.3;color:${C.ink};font-weight:600;">${esc(p.heading)}</h1>
          <div style="font-family:${SANS};font-size:15px;line-height:1.65;color:${C.ink};">${p.bodyHtml}</div>
        </td></tr>
        <!-- Signature -->
        <tr><td style="padding:8px 40px 34px;">
          <p style="margin:22px 0 0;font-family:${SERIF};font-size:15px;color:${C.primary};">${esc(sign)}</p>
        </td></tr>
        <!-- Pied -->
        <tr><td style="padding:22px 40px;background:${C.bg};border-top:1px solid ${C.border};text-align:center;">
          <p style="margin:0 0 6px;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.muted};">${footerNote}</p>
          <p style="margin:0;font-family:${SANS};font-size:11px;color:${C.muted};">© ${year} Dimitri Gauthier · La Réunion &amp; métropole</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Petit paragraphe utilitaire pour composer les corps.
function para(html: string): string {
  return `<p style="margin:0 0 14px;">${html}</p>`;
}

// ── Confirmation de RDV (client) ──
export function bookingConfirmation(
  lang: Lang,
  p: { firstName: string; when: string; practitioner: string; manageUrl?: string },
): { subject: string; html: string } {
  const en = lang === "en";
  const heading = en ? `It's confirmed, ${esc(p.firstName)}` : `C'est confirmé, ${esc(p.firstName)}`;
  const body = [
    para(en
      ? "Your appointment is booked and your payment has been received. Here are the details:"
      : "Votre rendez-vous est réservé et votre paiement bien reçu. Voici les détails :"),
    highlight(`<p style="margin:0;font-family:${SANS};font-size:12px;letter-spacing:.5px;text-transform:uppercase;color:${C.gold};">${en ? "Your appointment" : "Votre rendez-vous"}</p>
      <p style="margin:6px 0 0;font-family:${SERIF};font-size:18px;color:${C.ink};">${esc(p.when)}</p>
      <p style="margin:4px 0 0;font-family:${SANS};font-size:12px;color:${C.muted};">${en ? "Réunion time" : "heure de La Réunion"}</p>`),
    para(en
      ? "A calendar invitation is on its way — accept it to receive an automatic reminder."
      : "Une invitation agenda vous parvient — acceptez-la pour recevoir un rappel automatique."),
    p.manageUrl
      ? emailButton(en ? "Manage my appointment" : "Gérer mon rendez-vous", p.manageUrl) +
        para(`<span style="font-size:13px;color:${C.muted};">${en
          ? "Need to reschedule or cancel? Use the button above."
          : "Besoin de reporter ou d'annuler ? Utilisez le bouton ci-dessus."}</span>`)
      : "",
  ].join("");
  return {
    subject: en ? "Your appointment is confirmed" : "Votre rendez-vous est confirmé",
    html: emailLayout({
      lang,
      preheader: en ? `Confirmed for ${p.when}` : `Confirmé pour le ${p.when}`,
      heading,
      bodyHtml: body,
      signature: p.practitioner,
    }),
  };
}

// ── Rappel (client) — envoyé ~14h avant le RDV ──
export function bookingReminder(
  lang: Lang,
  p: { firstName: string; when: string; practitioner: string; manageUrl?: string },
): { subject: string; html: string } {
  const en = lang === "en";
  const heading = en ? `See you soon, ${esc(p.firstName)}` : `À très bientôt, ${esc(p.firstName)}`;
  const body = [
    para(en
      ? "A gentle reminder about your upcoming appointment:"
      : "Un petit rappel concernant votre prochain rendez-vous :"),
    highlight(`<p style="margin:0;font-family:${SANS};font-size:12px;letter-spacing:.5px;text-transform:uppercase;color:${C.gold};">${en ? "Appointment" : "Rendez-vous"}</p>
      <p style="margin:6px 0 0;font-family:${SERIF};font-size:18px;color:${C.ink};">${esc(p.when)}</p>
      <p style="margin:4px 0 0;font-family:${SANS};font-size:12px;color:${C.muted};">${en ? "Réunion time" : "heure de La Réunion"}</p>`),
    para(en
      ? "Take a quiet moment for yourself beforehand. I look forward to welcoming you."
      : "Prenez un moment calme pour vous avant notre échange. Je serai heureux de vous accueillir."),
    p.manageUrl
      ? emailButton(en ? "Reschedule or cancel" : "Reporter ou annuler", p.manageUrl, "ghost")
      : "",
  ].join("");
  return {
    subject: en ? "Reminder: your appointment tomorrow" : "Rappel : votre rendez-vous",
    html: emailLayout({
      lang,
      preheader: en ? `Reminder — ${p.when}` : `Rappel — ${p.when}`,
      heading,
      bodyHtml: body,
      signature: p.practitioner,
    }),
  };
}

// ── RDV reporté (client) ──
export function bookingRescheduled(
  lang: Lang,
  p: { firstName: string; oldWhen: string; newWhen: string; practitioner: string; manageUrl?: string },
): { subject: string; html: string } {
  const en = lang === "en";
  const heading = en ? `Your appointment was moved` : `Votre rendez-vous est reporté`;
  const body = [
    para(en ? `Hello ${esc(p.firstName)}, your appointment has been rescheduled.`
            : `Bonjour ${esc(p.firstName)}, votre rendez-vous a bien été reporté.`),
    highlight(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:0 0 8px;font-family:${SANS};font-size:13px;color:${C.muted};text-decoration:line-through;">${esc(p.oldWhen)}</td></tr>
      <tr><td style="padding:8px 0 0;border-top:1px solid ${C.border};">
        <p style="margin:0;font-family:${SANS};font-size:12px;letter-spacing:.5px;text-transform:uppercase;color:${C.gold};">${en ? "New date" : "Nouvelle date"}</p>
        <p style="margin:6px 0 0;font-family:${SERIF};font-size:18px;color:${C.ink};">${esc(p.newWhen)}</p>
        <p style="margin:4px 0 0;font-family:${SANS};font-size:12px;color:${C.muted};">${en ? "Réunion time" : "heure de La Réunion"}</p>
      </td></tr></table>`),
    para(en ? "Your updated calendar invitation is on its way." : "Votre invitation agenda mise à jour vous parvient."),
    p.manageUrl ? emailButton(en ? "Manage my appointment" : "Gérer mon rendez-vous", p.manageUrl, "ghost") : "",
  ].join("");
  return {
    subject: en ? "Your appointment has been rescheduled" : "Votre rendez-vous a été reporté",
    html: emailLayout({
      lang,
      preheader: en ? `New date: ${p.newWhen}` : `Nouvelle date : ${p.newWhen}`,
      heading,
      bodyHtml: body,
      signature: p.practitioner,
    }),
  };
}

// ── RDV annulé (client) ──
export function bookingCancelled(
  lang: Lang,
  p: { firstName: string; when: string; practitioner: string; rebookUrl?: string },
): { subject: string; html: string } {
  const en = lang === "en";
  const heading = en ? `Appointment cancelled` : `Rendez-vous annulé`;
  const body = [
    para(en
      ? `Hello ${esc(p.firstName)}, your appointment of ${esc(p.when)} (Réunion time) has been cancelled.`
      : `Bonjour ${esc(p.firstName)}, votre rendez-vous du ${esc(p.when)} (heure de La Réunion) a bien été annulé.`),
    para(en
      ? "If you'd like, you can book another moment whenever you're ready."
      : "Si vous le souhaitez, vous pouvez réserver un autre moment quand vous serez prêt·e."),
    p.rebookUrl ? emailButton(en ? "Book a new appointment" : "Réserver un nouveau rendez-vous", p.rebookUrl) : "",
  ].join("");
  return {
    subject: en ? "Your appointment has been cancelled" : "Votre rendez-vous a été annulé",
    html: emailLayout({
      lang,
      preheader: en ? "Appointment cancelled" : "Rendez-vous annulé",
      heading,
      bodyHtml: body,
      signature: p.practitioner,
    }),
  };
}

// ── Invitation à laisser un avis (client) ──
export function reviewInvite(
  lang: Lang,
  p: { firstName: string; link: string; practitioner: string },
): { subject: string; html: string } {
  const en = lang === "en";
  const heading = en ? `Thank you, ${esc(p.firstName)}` : `Merci, ${esc(p.firstName)}`;
  const body = [
    para(en
      ? "Thank you for your trust. If you wish, you can share how you experienced our work together:"
      : "Merci de votre confiance. Si vous le souhaitez, vous pouvez partager votre ressenti sur notre accompagnement :"),
    emailButton(en ? "Leave a review" : "Laisser un avis", p.link),
    para(`<span style="font-size:13px;color:${C.muted};">${en
      ? "Your feedback is valuable — it will be reviewed before publication."
      : "Votre retour est précieux — il sera relu avant publication."}</span>`),
  ].join("");
  return {
    subject: en ? "Your feedback matters" : "Votre avis compte",
    html: emailLayout({
      lang,
      preheader: en ? "Share your experience" : "Partagez votre ressenti",
      heading,
      bodyHtml: body,
      signature: p.practitioner,
    }),
  };
}

// ── Notification à Dimitri : NOUVEAU PROSPECT (questionnaire terminé, arrivé au
// paiement, paiement pas encore confirmé). Toujours en FR. `answersHtml` déjà échappé. ──
export function practitionerNewProspect(p: {
  firstName: string; lastName: string; email: string; phone: string | null;
  audience: string; serviceTitle: string; when: string; amount: string; lang: Lang; answersHtml: string;
}): { subject: string; html: string } {
  const recap = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${detailRow("Personne", `${esc(p.firstName)} ${esc(p.lastName)}`)}
    ${detailRow("Email", esc(p.email))}
    ${detailRow("Téléphone", esc(p.phone ?? "—"))}
    ${detailRow("Créneau visé", esc(p.when))}
    ${detailRow("Accompagnement", `${esc(p.serviceTitle)} · ${esc(p.amount)}`)}
    ${detailRow("Profil / langue", `${esc(p.audience)} · ${p.lang.toUpperCase()}`)}
  </table>`;
  const body = [
    para("Un nouveau prospect vient de terminer le questionnaire et d'arriver au paiement."),
    highlight(recap),
    p.answersHtml
      ? `<p style="margin:20px 0 10px;font-family:${SERIF};font-size:15px;color:${C.primary};">Réponses au questionnaire</p>` +
        `<div style="font-family:${SANS};font-size:14px;line-height:1.6;color:${C.ink};">${p.answersHtml}</div>`
      : "",
    para(`<span style="font-size:12px;color:${C.muted};">Paiement pas encore confirmé — un second email suivra si le rendez-vous est payé.</span>`),
  ].join("");
  return {
    subject: `Nouveau prospect — ${p.firstName} ${p.lastName}`,
    html: emailLayout({
      lang: "fr",
      preheader: `${p.firstName} ${p.lastName} — questionnaire terminé`,
      heading: "Nouveau prospect",
      bodyHtml: body,
      signature: "Notification automatique",
    }),
  };
}

// ── Notification à Dimitri : NOUVEAU RDV PAYÉ (webhook Stripe). Toujours en FR. ──
export function practitionerNewBooking(p: {
  firstName: string; lastName: string; email: string; phone: string | null;
  audience: string; when: string; amount: string; lang: Lang;
}): { subject: string; html: string } {
  const recap = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${detailRow("Rendez-vous", `${esc(p.when)} (heure de La Réunion)`)}
    ${detailRow("Montant réglé", `<span style="color:${C.primary};">${esc(p.amount)}</span>`)}
    ${detailRow("Personne", `${esc(p.firstName)} ${esc(p.lastName)}`)}
    ${detailRow("Email", esc(p.email))}
    ${detailRow("Téléphone", esc(p.phone ?? "—"))}
    ${detailRow("Profil / langue", `${esc(p.audience)} · ${p.lang.toUpperCase()}`)}
  </table>`;
  const body = [
    para("Un rendez-vous vient d'être <strong>payé et confirmé</strong>. L'événement a été ajouté à votre agenda."),
    highlight(recap),
  ].join("");
  return {
    subject: `Nouveau RDV payé (${p.amount}) — ${p.firstName} ${p.lastName}`,
    html: emailLayout({
      lang: "fr",
      preheader: `RDV payé — ${p.firstName} ${p.lastName} · ${p.amount}`,
      heading: "Nouveau rendez-vous payé",
      bodyHtml: body,
      signature: "Notification automatique",
    }),
  };
}

// ── Notification à Dimitri : RDV reporté ou annulé par le client. FR. ──
export function practitionerBookingChange(p: {
  kind: "rescheduled" | "cancelled";
  firstName: string; lastName: string; email: string; phone: string | null;
  oldWhen: string; newWhen?: string;
}): { subject: string; html: string } {
  const cancelled = p.kind === "cancelled";
  const recap = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${detailRow("Personne", `${esc(p.firstName)} ${esc(p.lastName)}`)}
    ${detailRow("Email", esc(p.email))}
    ${detailRow("Téléphone", esc(p.phone ?? "—"))}
    ${detailRow(cancelled ? "Créneau annulé" : "Ancien créneau", esc(p.oldWhen))}
    ${!cancelled && p.newWhen ? detailRow("Nouveau créneau", `<span style="color:${C.primary};">${esc(p.newWhen)}</span>`) : ""}
  </table>`;
  const body = [
    para(cancelled
      ? "Un client vient d'<strong>annuler</strong> son rendez-vous depuis la page de gestion."
      : "Un client vient de <strong>reporter</strong> son rendez-vous depuis la page de gestion. Votre agenda est mis à jour."),
    highlight(recap),
  ].join("");
  return {
    subject: cancelled
      ? `RDV annulé — ${p.firstName} ${p.lastName}`
      : `RDV reporté — ${p.firstName} ${p.lastName}`,
    html: emailLayout({
      lang: "fr",
      preheader: cancelled ? "Un client a annulé son rendez-vous" : "Un client a reporté son rendez-vous",
      heading: cancelled ? "Rendez-vous annulé" : "Rendez-vous reporté",
      bodyHtml: body,
      signature: "Notification automatique",
    }),
  };
}
