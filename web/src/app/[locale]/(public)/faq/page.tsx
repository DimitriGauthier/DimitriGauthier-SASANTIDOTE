// FAQ — questions fréquentes. Contenu de base (à enrichir par Dimitri).
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { PageTitle, CTASection } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "FAQ — Questions fréquentes", "FAQ — Frequently asked questions"),
    description: pick(
      l,
      "Les réponses aux questions les plus fréquentes sur les séances, le déroulé, la confidentialité et le paiement.",
      "Answers to the most common questions about sessions, how they unfold, confidentiality and payment.",
    ),
  };
}

type QA = { q: { fr: string; en: string }; a: { fr: string; en: string } };

const FAQ: QA[] = [
  {
    q: { fr: "Comment se déroule une séance ?", en: "How does a session work?" },
    a: {
      fr: "Chaque séance a lieu en visio. On commence par un temps d'écoute, puis on avance avec les outils les plus adaptés à ta situation — sexothérapie, TRAME® ou numérologie.",
      en: "Each session is online. We start with a time of listening, then move forward with the tools best suited to your situation — sex therapy, TRAME® or numerology.",
    },
  },
  {
    q: { fr: "Est-ce confidentiel ?", en: "Is it confidential?" },
    a: {
      fr: "Oui, totalement. Ce qui se dit en séance reste entre nous. Tes données personnelles sont traitées avec le plus grand soin, conformément au RGPD.",
      en: "Yes, completely. What is said in session stays between us. Your personal data is handled with the utmost care, in line with the GDPR.",
    },
  },
  {
    q: { fr: "Faut-il venir en couple ?", en: "Do we need to come as a couple?" },
    a: {
      fr: "Non. J'accompagne aussi bien les personnes seules que les couples. Tu choisis le format qui te convient au moment de la réservation.",
      en: "No. I support individuals as well as couples. You choose the format that suits you when booking.",
    },
  },
  {
    q: { fr: "Combien de séances sont nécessaires ?", en: "How many sessions are needed?" },
    a: {
      fr: "Cela dépend de chacun. Certaines situations se dénouent en quelques séances, d'autres demandent un suivi plus long. On en parle ensemble, sans jamais rien t'imposer.",
      en: "It depends on each person. Some situations resolve in a few sessions, others call for longer follow-up. We discuss it together, never imposing anything on you.",
    },
  },
  {
    q: { fr: "Comment se passe le paiement ?", en: "How does payment work?" },
    a: {
      fr: "Le paiement se fait en ligne, de façon sécurisée, au moment où tu confirmes ton créneau. Le tarif s'affiche clairement avant que tu valides.",
      en: "Payment is made online, securely, when you confirm your slot. The price is shown clearly before you validate.",
    },
  },
];

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";

  return (
    <div>
      <PageTitle
        eyebrow={pick(l, "FAQ", "FAQ")}
        sub={pick(l, "Tout ce que tu veux savoir avant de commencer", "Everything you want to know before starting")}
      >
        {pick(l, "Questions fréquentes", "Frequently asked questions")}
      </PageTitle>

      <div className="space-y-3">
        {FAQ.map((item, i) => (
          <details key={i} className="group rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-card transition-colors open:border-primary/30">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg text-foreground">
              {pick(l, item.q.fr, item.q.en)}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-muted-foreground">{pick(l, item.a.fr, item.a.en)}</p>
          </details>
        ))}
      </div>

      <CTASection
        href={href(l, "reservation")}
        title={pick(l, "Une autre question ?", "Another question?")}
        sub={pick(l, "Écris-moi ou réserve directement ta première séance.", "Write to me or book your first session directly.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </div>
  );
}
