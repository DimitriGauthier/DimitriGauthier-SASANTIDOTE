// Gabarits d'emails FR/EN. La langue vient de booking.locale (choix du client).
// Les emails destinés à Dimitri restent en FR (voir stripe-webhook).

export type Lang = "fr" | "en";

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

// Confirmation de RDV (client)
export function bookingConfirmation(
  lang: Lang,
  p: { firstName: string; when: string; practitioner: string },
): { subject: string; html: string } {
  if (lang === "en") {
    return {
      subject: "Your appointment is confirmed",
      html: `<p>Hello ${p.firstName},</p>
        <p>Your appointment is confirmed for <strong>${p.when}</strong> (Réunion time).</p>
        <p>You will also receive a calendar invitation. Your payment has been received.</p>
        <p>See you soon,<br>${p.practitioner}</p>`,
    };
  }
  return {
    subject: "Votre rendez-vous est confirmé",
    html: `<p>Bonjour ${p.firstName},</p>
      <p>Votre rendez-vous est confirmé pour le <strong>${p.when}</strong> (heure de La Réunion).</p>
      <p>Vous recevez également une invitation dans votre agenda. Paiement bien reçu.</p>
      <p>À très bientôt,<br>${p.practitioner}</p>`,
  };
}

// Invitation à laisser un avis (client)
export function reviewInvite(
  lang: Lang,
  p: { firstName: string; link: string; practitioner: string },
): { subject: string; html: string } {
  if (lang === "en") {
    return {
      subject: "Your feedback matters",
      html: `<p>Hello ${p.firstName},</p>
        <p>Thank you for your trust. If you wish, you can share your experience:</p>
        <p><a href="${p.link}">Leave a review</a></p>
        <p>Your feedback is valuable (it will be reviewed before publication).</p>
        <p>${p.practitioner}</p>`,
    };
  }
  return {
    subject: "Votre avis compte",
    html: `<p>Bonjour ${p.firstName},</p>
      <p>Merci de votre confiance. Si vous le souhaitez, vous pouvez partager votre ressenti :</p>
      <p><a href="${p.link}">Laisser un avis</a></p>
      <p>Votre retour est précieux (il sera relu avant publication).</p>
      <p>${p.practitioner}</p>`,
  };
}

// Notification à Dimitri : NOUVEAU PROSPECT (questionnaire terminé, arrivé au paiement,
// paiement pas encore confirmé). Toujours en FR. `answersHtml` est déjà échappé/sûr.
export function practitionerNewProspect(p: {
  firstName: string; lastName: string; email: string; phone: string | null;
  audience: string; serviceTitle: string; when: string; amount: string; lang: Lang; answersHtml: string;
}): { subject: string; html: string } {
  return {
    subject: `Nouveau prospect — ${p.firstName} ${p.lastName}`,
    html: `<p>Un nouveau prospect vient de terminer le questionnaire et d'arriver au paiement :</p>
      <ul>
        <li><strong>${esc(p.firstName)} ${esc(p.lastName)}</strong> — ${esc(p.email)} — ${esc(p.phone ?? "—")}</li>
        <li>Créneau visé : <strong>${esc(p.when)}</strong> (heure de La Réunion)</li>
        <li>Accompagnement : ${esc(p.serviceTitle)} · ${esc(p.amount)}</li>
        <li>Profil : ${esc(p.audience)} · Langue : ${p.lang.toUpperCase()}</li>
      </ul>
      ${p.answersHtml ? `<p><strong>Réponses au questionnaire</strong></p>${p.answersHtml}` : ""}
      <p style="color:#888;font-size:12px">Paiement pas encore confirmé — vous recevrez un second email si le rendez-vous est payé.</p>`,
  };
}
