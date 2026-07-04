// Gabarits d'emails FR/EN. La langue vient de booking.locale (choix du client).
// Les emails destinés à Dimitri restent en FR (voir stripe-webhook).

export type Lang = "fr" | "en";

// Date lisible en heure locale Réunion, dans la langue voulue.
export function fmtReunion(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
    timeZone: "Indian/Reunion", dateStyle: "full", timeStyle: "short",
  }).format(new Date(iso));
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
