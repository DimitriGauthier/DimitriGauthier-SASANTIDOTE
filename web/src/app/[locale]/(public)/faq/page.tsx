// FAQ — questions fréquentes. Contenu de base (à enrichir par Dimitri).
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href } from "@/lib/site";
import { PageTitle, CTAButton } from "@/components/ui";

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
      <PageTitle sub={pick(l, "Tout ce que tu veux savoir avant de commencer", "Everything you want to know before starting")}>
        {pick(l, "Questions fréquentes", "Frequently asked questions")}
      </PageTitle>

      <div className="divide-y divide-neutral-200 border-y border-neutral-200">
        {FAQ.map((item, i) => (
          <details key={i} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-neutral-800">
              {pick(l, item.q.fr, item.q.en)}
              <span className="text-neutral-400 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-neutral-600">{pick(l, item.a.fr, item.a.en)}</p>
          </details>
        ))}
      </div>

      <div className="mt-10">
        <CTAButton href={href(l, "reservation")}>
          {pick(l, "Prendre rendez-vous", "Book an appointment")}
        </CTAButton>
      </div>
    </div>
  );
}
