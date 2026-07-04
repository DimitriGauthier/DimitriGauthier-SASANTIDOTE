// i18n — fr (défaut) + en. Routing par préfixe /fr /en (cf. middleware).
// Le schéma DB porte déjà les variantes `_en` (fallback FR si vide).

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export function isLocale(x: string | undefined | null): x is Locale {
  return !!x && (locales as readonly string[]).includes(x);
}

/** Choisit la variante EN si dispo, sinon fallback FR. */
export function pick<T>(locale: Locale, fr: T, en: T | null | undefined): T {
  if (locale === "en" && en != null && en !== ("" as unknown as T)) return en;
  return fr;
}

type Dict = {
  nav: Record<
    "home" | "about" | "approach" | "numerology" | "trame" | "services" | "pricing" | "faq" | "reviews" | "blog" | "contact" | "book",
    string
  >;
  common: Record<
    "book" | "contactUs" | "readMore" | "loading" | "send" | "back" | "next" | "requiredField" | "whatsapp" | "phone" | "email" | "adminLogin",
    string
  >;
  tunnel: Record<
    "title" | "stepProfile" | "stepTopic" | "stepForm" | "stepContact" | "stepSlot" | "profileMan" | "profileWoman" | "profileCouple" | "chooseTopic" | "yourAnswers" | "yourInfo" | "firstName" | "lastName" | "phone" | "note" | "consent" | "chooseSlot" | "noSlots" | "pay" | "holdInfo",
    string
  >;
  booking: Record<"confirmedTitle" | "confirmedBody" | "cancelledTitle" | "cancelledBody", string>;
  review: Record<"title" | "rating" | "comment" | "submit" | "thanks" | "invalid", string>;
};

const fr: Dict = {
  nav: {
    home: "Accueil",
    about: "À propos",
    approach: "Mon approche",
    numerology: "Numérologie & sexualité",
    trame: "La TRAME®",
    services: "Accompagnements",
    pricing: "Tarifs",
    faq: "FAQ",
    reviews: "Avis",
    blog: "Blog",
    contact: "Contact",
    book: "Prendre rendez-vous",
  },
  common: {
    book: "Prendre rendez-vous",
    contactUs: "Nous contacter",
    readMore: "Lire la suite",
    loading: "Chargement…",
    send: "Envoyer",
    back: "Retour",
    next: "Continuer",
    requiredField: "Champ requis",
    whatsapp: "WhatsApp",
    phone: "Téléphone",
    email: "E-mail",
    adminLogin: "Espace praticien",
  },
  tunnel: {
    title: "Prendre rendez-vous",
    stepProfile: "Votre profil",
    stepTopic: "Votre motif",
    stepForm: "Questionnaire",
    stepContact: "Vos coordonnées",
    stepSlot: "Créneau & paiement",
    profileMan: "Homme",
    profileWoman: "Femme",
    profileCouple: "Couple",
    chooseTopic: "Choisissez votre motif de consultation",
    yourAnswers: "Vos réponses",
    yourInfo: "Vos coordonnées",
    firstName: "Prénom",
    lastName: "Nom",
    phone: "Téléphone",
    note: "Message (facultatif)",
    consent: "J'accepte la politique de confidentialité et le traitement de mes données.",
    chooseSlot: "Choisissez un créneau",
    noSlots: "Aucun créneau disponible pour l'instant.",
    pay: "Payer et confirmer",
    holdInfo: "Votre créneau est réservé 10 minutes le temps du paiement.",
  },
  booking: {
    confirmedTitle: "Rendez-vous confirmé",
    confirmedBody: "Merci ! Votre paiement est validé et votre rendez-vous est confirmé. Vous recevez un e-mail de confirmation avec l'invitation agenda.",
    cancelledTitle: "Paiement non finalisé",
    cancelledBody: "Votre paiement n'a pas été finalisé, le créneau a été libéré. Vous pouvez reprendre une réservation quand vous le souhaitez.",
  },
  review: {
    title: "Votre avis",
    rating: "Votre note",
    comment: "Votre commentaire",
    submit: "Envoyer mon avis",
    thanks: "Merci pour votre avis !",
    invalid: "Ce lien d'avis n'est pas valide ou a déjà été utilisé.",
  },
};

const en: Dict = {
  nav: {
    home: "Home",
    about: "About",
    approach: "My approach",
    numerology: "Numerology & sexuality",
    trame: "The TRAME®",
    services: "Sessions",
    pricing: "Pricing",
    faq: "FAQ",
    reviews: "Reviews",
    blog: "Blog",
    contact: "Contact",
    book: "Book an appointment",
  },
  common: {
    book: "Book an appointment",
    contactUs: "Contact us",
    readMore: "Read more",
    loading: "Loading…",
    send: "Send",
    back: "Back",
    next: "Continue",
    requiredField: "Required field",
    whatsapp: "WhatsApp",
    phone: "Phone",
    email: "Email",
    adminLogin: "Practitioner area",
  },
  tunnel: {
    title: "Book an appointment",
    stepProfile: "Your profile",
    stepTopic: "Your reason",
    stepForm: "Questionnaire",
    stepContact: "Your details",
    stepSlot: "Slot & payment",
    profileMan: "Man",
    profileWoman: "Woman",
    profileCouple: "Couple",
    chooseTopic: "Choose your reason for consultation",
    yourAnswers: "Your answers",
    yourInfo: "Your details",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    note: "Message (optional)",
    consent: "I accept the privacy policy and the processing of my data.",
    chooseSlot: "Choose a slot",
    noSlots: "No slots available right now.",
    pay: "Pay and confirm",
    holdInfo: "Your slot is held for 10 minutes while you pay.",
  },
  booking: {
    confirmedTitle: "Appointment confirmed",
    confirmedBody: "Thank you! Your payment is confirmed and your appointment is booked. You will receive a confirmation email with the calendar invite.",
    cancelledTitle: "Payment not completed",
    cancelledBody: "Your payment was not completed, so the slot has been released. You can start a new booking whenever you like.",
  },
  review: {
    title: "Your review",
    rating: "Your rating",
    comment: "Your comment",
    submit: "Send my review",
    thanks: "Thank you for your review!",
    invalid: "This review link is invalid or has already been used.",
  },
};

const dictionaries: Record<Locale, Dict> = { fr, en };

export function getDict(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries.fr;
}
