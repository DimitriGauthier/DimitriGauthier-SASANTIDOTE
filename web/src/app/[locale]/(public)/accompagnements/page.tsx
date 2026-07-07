// Accompagnements — liste des services (depuis la DB si câblée), sinon présentation générique.
import type { Metadata } from "next";
import { isLocale, type Locale, pick, getDict } from "@/lib/i18n";
import { href } from "@/lib/site";
import { getServices } from "@/lib/data";
import { formatPrice, formatDuration } from "@/lib/format";
import { PageHero, FeatureGrid, Steps, CTABanner, SectionHeading, Pill } from "@/components/sections";
import { Heart, Users, Sparkles, ArrowRight, Video, Clock, ShieldCheck } from "lucide-react";
import Reveal from "@/components/Reveal";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(l, "Accompagnements", "Sessions"),
    description: pick(
      l,
      "Consultations individuelles et de couple, en visio. Homme, femme, couple : un accompagnement adapté à ta situation.",
      "Individual and couple sessions, online. Man, woman, couple: support tailored to your situation.",
    ),
  };
}

const AUDIENCE_LABEL: Record<string, { fr: string; en: string }> = {
  homme: { fr: "Homme", en: "Man" },
  femme: { fr: "Femme", en: "Woman" },
  couple: { fr: "Couple", en: "Couple" },
  tous: { fr: "Tous", en: "Everyone" },
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  getDict(l);
  const services = await getServices();

  return (
    <div>
      <PageHero
        eyebrow={pick(l, "Séances en visio", "Online sessions")}
        title={pick(l, "Les accompagnements", "The sessions")}
        sub={pick(
          l,
          "Des séances en visioconférence, à ton rythme, où que tu sois. On choisit ensemble les outils les plus justes pour ce que tu traverses.",
          "Online video sessions, at your pace, wherever you are. Together we choose the tools that best fit what you're going through.",
        )}
        badges={
          <>
            <Pill icon={<Video className="h-4 w-4" />}>{pick(l, "En visio", "Online")}</Pill>
            <Pill icon={<Clock className="h-4 w-4" />}>{pick(l, "À ton rythme", "At your pace")}</Pill>
            <Pill icon={<ShieldCheck className="h-4 w-4" />}>{pick(l, "Confidentiel", "Confidential")}</Pill>
          </>
        }
        cta={{ href: href(l, "reservation"), label: pick(l, "Réserver une séance", "Book a session") }}
      />

      {services.length > 0 ? (
        <section className="full-bleed py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <SectionHeading eyebrow={pick(l, "Consultations", "Consultations")} title={pick(l, "Choisis ton accompagnement", "Choose your session")}>
              {pick(
                l,
                "Chaque accompagnement démarre par un temps d'écoute pour comprendre ta situation.",
                "Every session starts with a time of listening to understand your situation.",
              )}
            </SectionHeading>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {services.map((s, i) => (
                <Reveal key={s.id} delay={(i % 2) * 100}>
                  <div className="hover-lift flex h-full flex-col rounded-3xl border border-border/60 bg-card p-8 shadow-card">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="font-serif text-2xl font-medium text-foreground">{pick(l, s.title, s.title_en)}</h2>
                      <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {formatPrice(s.price_cents, s.currency, l)}
                      </span>
                    </div>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {formatDuration(s.duration_min, l)}
                    </p>
                    {pick(l, s.subtitle, s.subtitle_en) ? (
                      <p className="mt-3 font-serif text-lg italic text-foreground/80">{pick(l, s.subtitle, s.subtitle_en)}</p>
                    ) : null}
                    {pick(l, s.description, s.description_en) ? (
                      <p className="mt-3 leading-relaxed text-muted-foreground">{pick(l, s.description, s.description_en)}</p>
                    ) : null}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {s.audiences.map((a) => (
                        <span
                          key={a}
                          className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {pick(l, AUDIENCE_LABEL[a]?.fr ?? a, AUDIENCE_LABEL[a]?.en ?? a)}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 flex-1" />
                    <Link
                      href={href(l, "reservation")}
                      className="story-link inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                    >
                      {pick(l, "Réserver cet accompagnement", "Book this session")} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <FeatureGrid
          tone="plain"
          heading={
            <SectionHeading eyebrow={pick(l, "Consultations", "Consultations")} title={pick(l, "Des séances adaptées à toi", "Sessions tailored to you")}>
              {pick(
                l,
                "Le détail des séances et les tarifs s'affichent au moment de la réservation.",
                "Session details and prices are shown at booking time.",
              )}
            </SectionHeading>
          }
          items={[
            {
              icon: <Heart className="h-6 w-6" />,
              title: pick(l, "Séance individuelle", "Individual session"),
              body: pick(
                l,
                "Pour les hommes et les femmes : panne, désir, plaisir, confiance, rapport au corps.",
                "For men and women: performance, desire, pleasure, confidence, relationship to the body.",
              ),
            },
            {
              icon: <Users className="h-6 w-6" />,
              title: pick(l, "Séance de couple", "Couple session"),
              body: pick(
                l,
                "Communication, désir, complicité : retrouver ensemble un équilibre qui vous ressemble.",
                "Communication, desire, closeness: finding together a balance that suits you.",
              ),
            },
            {
              icon: <Sparkles className="h-6 w-6" />,
              title: pick(l, "Séance TRAME® / numérologie", "TRAME® / numerology session"),
              body: pick(
                l,
                "Un travail énergétique ou un éclairage numérologique, en complément du suivi.",
                "Energy work or a numerology reading, alongside the follow-up.",
              ),
            },
          ]}
        />
      )}

      <Steps
        tone="soft"
        heading={
          <SectionHeading eyebrow={pick(l, "Le déroulé", "How it works")} title={pick(l, "Comment ça se passe", "What to expect")}>
            {pick(
              l,
              "Un cadre simple et rassurant, de la réservation à la séance.",
              "A simple, reassuring path, from booking to session.",
            )}
          </SectionHeading>
        }
        items={[
          {
            title: pick(l, "Tu réserves en ligne", "You book online"),
            body: pick(
              l,
              "Tu choisis ton créneau en quelques minutes. Le tarif s'affiche clairement avant de confirmer.",
              "You pick your slot in a few minutes. The price is shown clearly before you confirm.",
            ),
          },
          {
            title: pick(l, "On fait connaissance", "We get acquainted"),
            body: pick(
              l,
              "La séance démarre par un temps d'écoute pour comprendre ta situation, sans jugement.",
              "The session starts with a time of listening to understand your situation, without judgment.",
            ),
          },
          {
            title: pick(l, "On avance ensemble", "We move forward together"),
            body: pick(
              l,
              "On choisit les outils les plus justes : sexothérapie, TRAME® ou numérologie, selon ton besoin.",
              "We choose the most fitting tools: sex therapy, TRAME® or numerology, depending on your need.",
            ),
          },
        ]}
      />

      <CTABanner
        href={href(l, "reservation")}
        title={pick(l, "Prêt·e à avancer ?", "Ready to move forward?")}
        sub={pick(l, "Réserve ta séance en quelques minutes, en toute confidentialité.", "Book your session in a few minutes, in full confidentiality.")}
        cta={pick(l, "Prendre rendez-vous", "Book an appointment")}
      />
    </div>
  );
}
