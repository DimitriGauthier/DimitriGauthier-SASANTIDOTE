// FAQ — questions fréquentes. Contenu de base (à enrichir par Dimitri).
import type { Metadata } from "next";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { href, siteConfig, whatsappUrl, experienceHref } from "@/lib/site";
import { PageHero, CTABanner } from "@/components/sections";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import { MessageCircle, Mail, CalendarHeart, Sparkles, ArrowRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "FAQ · Questions fréquentes", "FAQ · Frequently asked questions"),
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
      fr: "Une séance dure 1h15 en individuel et 1h30 en couple, en visioconférence.",
      en: "A session lasts 1h15 individually and 1h30 as a couple, by video.",
    },
  },
  {
    q: { fr: "Est-ce confidentiel ?", en: "Is it confidential?" },
    a: {
      fr: "Chaque séance se déroule dans un cadre confidentiel et sans jugement.",
      en: "Every session takes place in a confidential, non-judgmental setting.",
    },
  },
  {
    q: { fr: "Combien de séances sont nécessaires ?", en: "How many sessions are needed?" },
    a: {
      fr: "Le nombre de séances nécessaires dépend de chacun. Certaines situations se dénouent en quelques séances, d'autres demandent un suivi plus long.",
      en: "The number of sessions needed depends on each person. Some situations resolve in a few sessions, others call for longer follow-up.",
    },
  },
  {
    q: { fr: "Comment se passe le paiement ?", en: "How does payment work?" },
    a: {
      fr: "Pour toute séance, le paiement se fait en ligne, de façon sécurisée, au moment de la confirmation du rendez-vous.",
      en: "For every session, payment is made online, securely, when the appointment is confirmed.",
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
      <PageHero
        eyebrow={pick(l, "FAQ", "FAQ")}
        title={pick(l, "Questions fréquentes", "Frequently asked questions")}
      />

      <section className="full-bleed py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <Reveal key={i} delay={(i % 4) * 80}>
                <details className="group rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-card transition-colors open:border-primary/30">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg text-foreground">
                    {pick(l, item.q.fr, item.q.en)}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{pick(l, item.a.fr, item.a.en)}</p>
                </details>
              </Reveal>
            ))}
          </div>

          <Reveal direction="right">
            <aside className="lg:sticky lg:top-24">
              <div className="rounded-3xl border border-primary/15 bg-gradient-warm p-7 shadow-card">
                <h2 className="font-serif text-xl font-medium text-foreground">{pick(l, "Une autre question ?", "Another question?")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pick(
                    l,
                    "Écrivez-moi, je vous réponds avec plaisir. Ou réservez directement votre première séance.",
                    "Write to me, I'll be glad to answer. Or book your first session directly.",
                  )}
                </p>
                <div className="mt-5 space-y-2.5">
                  <a
                    href={whatsappUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 text-sm text-foreground shadow-card transition-colors hover:text-primary"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary"><MessageCircle className="h-4 w-4" /></span>
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 text-sm text-foreground shadow-card transition-colors hover:text-primary"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary"><Mail className="h-4 w-4" /></span>
                    {pick(l, "M'écrire un message", "Send me a message")}
                  </a>
                  <Link
                    href={href(l, "reservation")}
                    className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15"><CalendarHeart className="h-4 w-4" /></span>
                    {pick(l, "Prendre rendez-vous", "Book an appointment")}
                  </Link>
                </div>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* Clin d'œil : les vraies réponses se vivent en séance → passerelle vers l'expérience */}
      <section className="full-bleed bg-gradient-soft py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Reveal>
            <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <p className="font-serif text-2xl italic leading-relaxed text-foreground sm:text-3xl">
              {pick(
                l,
                "Les meilleures réponses ne se lisent pas : elles se trouvent en consultation.",
                "The best answers aren't read: they're found in consultation.",
              )}
            </p>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
              {pick(
                l,
                "Les réponses sont déjà en vous. Mon rôle consiste à vous les révéler.",
                "The answers are already within you. My role is simply to reveal them to you.",
              )}
            </p>
            <Link
              href={experienceHref(l)}
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-[hsl(var(--gold))] bg-[length:180%_auto] bg-left px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-500 hover:-translate-y-0.5 hover:bg-right"
            >
              <Sparkles className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12" />
              {pick(l, "Prendre rendez-vous", "Book an appointment")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      <CTABanner
        href={href(l, "reservation")}
        title={pick(l, "Prêt·e à faire le premier pas ?", "Ready to take the first step?")}
        sub={pick(l, "La réservation est simple, guidée et confidentielle.", "Booking is simple, guided and confidential.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </div>
  );
}
