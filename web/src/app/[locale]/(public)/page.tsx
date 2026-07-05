// Accueil — page d'accueil publique. Contenu issu du cahier des charges de Dimitri.
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Video,
  MessageCircle,
  Heart,
  Sparkles,
  Compass,
} from "lucide-react";
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { siteConfig, href, experienceHref } from "@/lib/site";
import { getServices, getPublishedReviews } from "@/lib/data";
import { formatPrice, formatDuration } from "@/lib/format";
import { CTAButton } from "@/components/ui";
import Reveal from "@/components/Reveal";
import ExperienceCTA from "@/components/ExperienceCTA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  return {
    title: pick(
      l,
      "Dimitri Gauthier · Sexothérapie, TRAME® & numérologie",
      "Dimitri Gauthier · Sex therapy, TRAME® & numerology",
    ),
    description: pick(
      l,
      "Sexothérapeute pour homme, femme et couple. Une approche qui relie tête, corps et cœur : sexothérapie, TRAME® et numérologie. Consultations en visio.",
      "Sex therapist for men, women and couples. An approach connecting mind, body and heart: sex therapy, TRAME® and numerology. Online sessions.",
    ),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const [services, reviews] = await Promise.all([getServices(), getPublishedReviews(3)]);

  const pillars = [
    {
      icon: Heart,
      title: pick(l, "Sexothérapie", "Sex therapy"),
      body: pick(
        l,
        "Un espace pour parler sans tabou de ce qui bloque : panne, désir, plaisir, communication dans le couple. On avance à ton rythme.",
        "A space to talk without taboo about what blocks you: performance, desire, pleasure, communication within the couple. We move at your pace.",
      ),
    },
    {
      icon: Sparkles,
      title: "La TRAME®",
      body: pick(
        l,
        "Un travail énergétique qui libère les tensions du corps et remet en mouvement ce qui était figé.",
        "Energy work that releases the body's tensions and sets in motion what had become stuck.",
      ),
    },
    {
      icon: Compass,
      title: pick(l, "Numérologie", "Numerology"),
      body: pick(
        l,
        "Un éclairage sur ton chemin de vie pour mieux comprendre tes élans, tes cycles et ce qui te ressemble vraiment.",
        "Insight into your life path to better understand your drives, your cycles and what truly resembles you.",
      ),
    },
  ];

  const profiles = [
    {
      title: pick(l, "Homme", "Men"),
      body: pick(
        l,
        "Panne, éjaculation, désir, confiance en soi. On en parle simplement, sans jugement.",
        "Performance, ejaculation, desire, self-confidence. We talk about it simply, without judgment.",
      ),
    },
    {
      title: pick(l, "Femme", "Women"),
      body: pick(
        l,
        "Désir, plaisir, douleurs, rapport au corps. Un accompagnement bienveillant et à ton écoute.",
        "Desire, pleasure, pain, relationship to the body. Caring support that listens to you.",
      ),
    },
    {
      title: pick(l, "Couple", "Couples"),
      body: pick(
        l,
        "Communication, désir, complicité. Retrouver ensemble un équilibre qui vous ressemble.",
        "Communication, desire, closeness. Finding together a balance that suits you.",
      ),
    },
  ];

  const gallery = [
    "/img/cabinet-1.jpg",
    "/img/cabinet-2.jpg",
    "/img/cabinet-3.jpg",
    "/img/cabinet-4.jpg",
    "/img/cabinet-5.jpg",
    "/img/cabinet-6.jpg",
  ];

  return (
    <div className="-my-16">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="full-bleed relative flex min-h-[92vh] items-center overflow-hidden">
        <Image
          src="/img/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="blob animate-blob absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/40" />
        <div
          className="blob animate-blob absolute -right-16 bottom-16 h-80 w-80 rounded-full bg-gold/40"
          style={{ animationDelay: "-6s" }}
        />

        <div className="relative mx-auto w-full max-w-5xl px-4 py-28 text-center">
          <p className="animate-fade-up mb-5 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            {siteConfig.tagline[l]}
          </p>
          <h1 className="animate-fade-up text-balance font-serif text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl md:text-7xl">
            {pick(l, "S'accomplir pleinement, dans sa vie comme dans son ", "Fully flourish, in your life as in your ")}
            <em className="text-gradient not-italic">
              {pick(l, "intimité", "intimacy")}
            </em>
          </h1>
          <p className="animate-fade-up mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {pick(
              l,
              "Je suis Dimitri Gauthier, sexothérapeute. J'accompagne les hommes, les femmes et les couples à mettre des mots sur ce qui coince et à retrouver un équilibre entre la tête, le corps et le cœur.",
              "I'm Dimitri Gauthier, sex therapist. I support men, women and couples in putting words to what's stuck and finding balance again between mind, body and heart.",
            )}
          </p>
          <div className="animate-fade-up mt-10 flex flex-col items-center gap-4">
            <a
              href={experienceHref(l)}
              className="experience-btn group inline-flex items-center gap-3 rounded-full px-9 py-4 text-base font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-1 sm:px-12 sm:py-5 sm:text-lg"
            >
              <Sparkles className="h-5 w-5" />
              {pick(l, "Tente l'expérience", "Try the experience")}
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <p className="text-xs text-muted-foreground">
              {pick(l, "Un parcours guidé de 2 minutes, simple, confidentiel et sans engagement", "A 2-minute guided journey: simple, confidential, no commitment")}
            </p>
            <Link href={href(l, "mon-approche")} className="story-link text-sm font-medium text-primary">
              {pick(l, "Ou découvrir mon approche d'abord", "Or discover my approach first")}
            </Link>
          </div>

          <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              {pick(l, "Saint-Denis & Saint-Pierre", "Saint-Denis & Saint-Pierre")}
            </span>
            <span className="inline-flex items-center gap-2">
              <Video size={16} className="text-primary" />
              {pick(l, "Consultations en visio", "Online sessions")}
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageCircle size={16} className="text-primary" />
              {pick(l, "Échange par WhatsApp", "Chat on WhatsApp")}
            </span>
          </div>
        </div>
      </section>

      {/* ── Intro ──────────────────────────────────────────── */}
      <section className="full-bleed bg-gradient-soft py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
          <Reveal direction="left">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft">
              <Image
                src="/img/coach.jpg"
                alt={siteConfig.practitionerName}
                fill
                sizes="(min-width: 768px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal direction="right">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              {pick(l, "Faire connaissance", "Let's meet")}
            </p>
            <h2 className="mt-3 font-serif text-4xl font-medium text-foreground">
              {pick(l, "Un accompagnement humain, sans tabou", "Human support, without taboo")}
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">
              <p>
                {pick(
                  l,
                  "Ce qui touche à l'intime se vit souvent dans le silence. Mon rôle est d'ouvrir un espace de parole simple et respectueux, où l'on peut poser ce qui pèse et avancer pas à pas.",
                  "What touches the intimate is often lived in silence. My role is to open a simple, respectful space where you can put down what weighs on you and move forward, step by step.",
                )}
              </p>
              <p>
                {pick(
                  l,
                  "Je reçois à La Réunion, en cabinet à Saint-Denis et Saint-Pierre, ainsi qu'en visio partout ailleurs.",
                  "I welcome you on Réunion Island, at my practices in Saint-Denis and Saint-Pierre, as well as online everywhere else.",
                )}
              </p>
            </div>
            <div className="mt-7">
              <CTAButton href={href(l, "a-propos")} variant="outline">
                {pick(l, "En savoir plus sur moi", "More about me")}
                <ArrowRight size={16} />
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Manifeste : ma vision de la sexothérapie ──────── */}
      <section className="full-bleed relative overflow-hidden bg-gradient-warm py-24">
        <span aria-hidden className="blob animate-blob absolute -left-16 top-10 h-64 w-64 rounded-full bg-primary/20" />
        <span
          aria-hidden
          className="blob animate-blob absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-gold/25"
          style={{ animationDelay: "-7s" }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              {pick(l, "Ma vision de la sexothérapie", "My view of sex therapy")}
            </p>
            <p className="mt-6 font-serif text-2xl leading-relaxed text-foreground sm:text-3xl">
              {pick(
                l,
                "Selon moi, « accompagnant en intime », la sexothérapie ne se limite en rien à la performance sexuelle.",
                "In my eyes, as an “intimacy companion”, sex therapy is in no way limited to sexual performance.",
              )}
            </p>
            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-muted-foreground">
              {pick(
                l,
                "Je considère la sexualité comme une dimension globale de l'identité, du bien-être et des relations humaines, dans un cadre éthique, confidentiel et sans jugement.",
                "I see sexuality as a global dimension of identity, well-being and human relationships, within an ethical, confidential and non-judgmental framework.",
              )}
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-14">
            <h2 className="font-serif text-3xl font-medium text-foreground sm:text-4xl">
              {pick(l, "Qu'est-ce qu'un thérapeute ?", "What is a therapist?")}
            </h2>
            <div className="mx-auto mt-5 max-w-2xl space-y-4 leading-relaxed text-muted-foreground">
              <p>
                {pick(
                  l,
                  "C'est un compagnon de service, un assistant dévoué. Celui qui vient soutenir l'autre, non pour le dominer ni le guérir de force, mais pour l'accompagner avec présence et attention.",
                  "A companion in service, a devoted assistant. Someone who comes to support the other, not to dominate them, nor to cure them by force, but to walk beside them with presence and attention.",
                )}
              </p>
              <p className="font-serif text-xl italic leading-relaxed text-foreground">
                {pick(
                  l,
                  "Le thérapeute ne change rien chez l'autre. Il crée les conditions dans lesquelles l'autre peut se changer lui-même.",
                  "A therapist changes nothing in the other. They create the conditions in which the other can change themselves.",
                )}
              </p>
            </div>
          </Reveal>

          <Reveal delay={200} className="mt-12">
            <div className="mx-auto max-w-2xl rounded-3xl border border-primary/15 bg-card/70 p-8 shadow-card backdrop-blur">
              <p className="font-serif text-xl leading-relaxed text-foreground sm:text-2xl">
                {pick(
                  l,
                  "Mon rôle, en tant qu'accompagnant, est d'accueillir, d'écouter, d'observer, d'éclairer ton chemin, et de libérer le mouvement de l'ÊTRE bien qui vient de l'intérieur de toi.",
                  "My role, as a companion, is to welcome, to listen, to observe, to light up your path, and to free the movement of the well-BEING that comes from within you.",
                )}
              </p>
              <p className="mt-5 text-sm font-medium text-primary">— {siteConfig.practitionerName}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Les 3 piliers ─────────────────────────────────── */}
      <section className="full-bleed py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              {pick(l, "Mon approche", "My approach")}
            </p>
            <h2 className="mt-3 font-serif text-4xl font-medium text-foreground">
              {pick(l, "Une approche en trois dimensions", "A three-dimensional approach")}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {pick(
                l,
                "Ces trois outils ne s'opposent pas : ils se complètent. En alignant la tête, le corps et le cœur, on remet toute ta vie en mouvement.",
                "These three tools don't compete: they complement each other. By aligning mind, body and heart, we set your whole life back in motion.",
              )}
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 120}>
                  <div className="hover-lift h-full rounded-3xl border border-border/60 bg-card p-8 shadow-card">
                    <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon size={26} />
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-foreground">{p.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Galerie ───────────────────────────────────────── */}
      <section className="full-bleed pb-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mb-10 text-center">
            <h2 className="font-serif text-4xl font-medium text-foreground">
              {pick(l, "Un cadre apaisant", "A soothing setting")}
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {pick(l, "Quelques images de l'espace de consultation.", "A few glimpses of the consultation space.")}
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {gallery.map((src, i) => (
              <Reveal key={src} delay={(i % 3) * 100}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-card">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 30vw, 45vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pour qui ? ────────────────────────────────────── */}
      <section className="full-bleed bg-gradient-warm py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-4xl font-medium text-foreground">
              {pick(l, "Pour qui ?", "For whom?")}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {pick(
                l,
                "Chacun avance avec son histoire. L'accompagnement s'adapte à qui tu es et à ce que tu traverses.",
                "Everyone moves forward with their own story. Support adapts to who you are and what you're going through.",
              )}
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {profiles.map((p, i) => (
              <Reveal key={p.title} delay={i * 120}>
                <div className="glass hover-lift h-full rounded-3xl p-8">
                  <h3 className="font-serif text-2xl font-medium text-foreground">{p.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Accompagnements (services depuis la DB) ────────── */}
      {services.length > 0 ? (
        <section className="full-bleed py-24">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal className="mb-12 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                {pick(l, "Consultations", "Sessions")}
              </p>
              <h2 className="mt-3 font-serif text-4xl font-medium text-foreground">
                {pick(l, "Les accompagnements", "The sessions")}
              </h2>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              {services.map((s, i) => (
                <Reveal key={s.id} delay={(i % 2) * 100}>
                  <div className="hover-lift h-full rounded-3xl border border-border/60 bg-card p-7 shadow-card">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-serif text-2xl font-medium text-foreground">
                        {pick(l, s.title, s.title_en)}
                      </h3>
                      <span className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDuration(s.duration_min, l)} · {formatPrice(s.price_cents, s.currency, l)}
                      </span>
                    </div>
                    {pick(l, s.subtitle, s.subtitle_en) ? (
                      <p className="mt-3 leading-relaxed text-muted-foreground">
                        {pick(l, s.subtitle, s.subtitle_en)}
                      </p>
                    ) : null}
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href={href(l, "accompagnements")}
                className="story-link inline-flex items-center gap-1 font-medium text-primary"
              >
                {pick(l, "Voir tous les accompagnements", "See all sessions")} →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Avis ──────────────────────────────────────────── */}
      {reviews.length > 0 ? (
        <section className="full-bleed bg-gradient-soft py-24">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal className="mb-12 text-center">
              <h2 className="font-serif text-4xl font-medium text-foreground">
                {pick(l, "Ils m'ont fait confiance", "They trusted me")}
              </h2>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {reviews.map((r, i) => (
                <Reveal key={r.id} delay={i * 120}>
                  <div className="hover-lift h-full rounded-3xl border border-border/60 bg-card p-7 shadow-card">
                    {r.rating ? (
                      <div className="mb-3 text-gold" aria-label={`${r.rating}/5`}>
                        {"★".repeat(r.rating)}
                        <span className="text-border">{"★".repeat(5 - r.rating)}</span>
                      </div>
                    ) : null}
                    {r.comment ? (
                      <p className="font-serif text-lg italic leading-relaxed text-foreground/90">
                        « {r.comment} »
                      </p>
                    ) : null}
                    {r.client_display_name ? (
                      <p className="mt-4 text-sm font-medium text-muted-foreground">
                        — {r.client_display_name}
                      </p>
                    ) : null}
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href={href(l, "avis")}
                className="story-link inline-flex items-center gap-1 font-medium text-primary"
              >
                {pick(l, "Lire tous les avis", "Read all reviews")} →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── CTA final ─────────────────────────────────────── */}
      <section className="full-bleed py-24">
        <div className="mx-auto max-w-4xl px-4">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-deep px-8 py-16 text-center shadow-soft">
              <div className="blob animate-blob absolute -left-10 -top-10 h-56 w-56 rounded-full bg-primary/40" />
              <div
                className="blob animate-blob absolute -bottom-12 -right-8 h-64 w-64 rounded-full bg-gold/30"
                style={{ animationDelay: "-6s" }}
              />
              <div className="relative">
                <h2 className="font-serif text-4xl font-medium text-background">
                  {pick(l, "Prêt·e à faire le premier pas ?", "Ready to take the first step?")}
                </h2>
                <p className="mx-auto mt-4 max-w-xl leading-relaxed text-background/80">
                  {pick(
                    l,
                    "La réservation est simple, guidée et confidentielle. Le tarif s'affiche au moment de confirmer.",
                    "Booking is simple, guided and confidential. The price is shown when you confirm.",
                  )}
                </p>
                <div className="mt-8 flex justify-center">
                  <Link
                    href={href(l, "reservation")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-3.5 text-sm font-medium text-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {pick(l, "Prendre rendez-vous", "Book an appointment")}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Invitation flottante ──────────────────────────── */}
      <ExperienceCTA
        href={experienceHref(l)}
        label={pick(l, "Tente l'expérience", "Try the experience")}
        hint={pick(l, "Ton parcours guidé t'attend", "Your guided journey awaits")}
        closeLabel={pick(l, "Fermer", "Close")}
      />
    </div>
  );
}
