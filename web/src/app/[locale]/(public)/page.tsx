// Accueil — page d'accueil publique. Contenu issu du cahier des charges de Dimitri.
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
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
import AnimatedCard from "@/components/AnimatedCard";
import DimitriGuide from "@/components/DimitriGuide";

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
      "Dimitri Gauthier · Sexothérapie, la TRAME® & numérologie salomique",
      "Dimitri Gauthier · Sex therapy, the TRAME® & salomic numerology",
    ),
    description: pick(
      l,
      "Sexothérapeute pour homme, femme, couple et adolescent. Une approche qui relie tête, corps et cœur : sexothérapie, la TRAME® et numérologie salomique. Consultations en visio.",
      "Sex therapist for men, women, couples and teenagers. An approach connecting mind, body and heart: sex therapy, the TRAME® and salomic numerology. Online sessions.",
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
        "Un espace pour parler sans tabou de ce qui bloque : panne, désir, plaisir, communication dans le couple. On avance à votre rythme.",
        "A space to talk without taboo about what blocks you: performance, desire, pleasure, communication within the couple. We move at your pace.",
      ),
    },
    {
      icon: Sparkles,
      title: "La TRAME®",
      body: pick(
        l,
        "Une technique vibratoire qui libère les tensions du corps et remet en mouvement ce qui était figé.",
        "A vibratory technique that releases the body's tensions and sets in motion what had become stuck.",
      ),
    },
    {
      icon: Compass,
      title: pick(l, "Numérologie salomique", "Salomic numerology"),
      body: pick(
        l,
        "Un éclairage sur votre chemin de vie pour mieux comprendre vos élans, vos cycles et ce qui vous ressemble vraiment.",
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
        "Désir, plaisir, douleurs, rapport au corps. Un accompagnement bienveillant et à votre écoute.",
        "Desire, pleasure, pain, relationship to the body. Caring support that listens to you.",
      ),
    },
    {
      title: pick(l, "Couple", "Couples"),
      body: pick(
        l,
        "Un souci relationnel, un manque de communication, un désir en décalage. On avance ensemble vers un équilibre qui vous ressemble.",
        "A relational strain, a lack of communication, mismatched desire. We move together toward a balance that suits you.",
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
      <section className="full-bleed relative flex min-h-[92vh] items-center overflow-hidden bg-gradient-warm">
        {/* Taches douces pour animer le dégradé */}
        <div className="blob animate-blob absolute -left-24 top-20 h-72 w-72 rounded-full bg-primary/20" />
        <div
          className="blob animate-blob absolute -right-20 bottom-12 h-80 w-80 rounded-full bg-gold/25"
          style={{ animationDelay: "-6s" }}
        />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-28 md:grid-cols-2 md:gap-14">
          {/* Colonne texte */}
          <div className="text-center md:text-left">
            <p className="animate-fade-up mb-5 text-sm font-medium uppercase tracking-[0.2em] text-primary">
              {siteConfig.tagline[l]}
            </p>
            <h1 className="animate-fade-up text-balance font-serif text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
              {pick(l, "Éclairer votre ", "Light up your ")}
              <em className="text-gradient not-italic">
                {pick(l, "intimité", "intimacy")}
              </em>
              {pick(l, " pour vous réaliser pleinement", " to fully realize yourself")}
            </h1>
            <p className="animate-fade-up mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:mx-0">
              {pick(
                l,
                "Je suis Dimitri Gauthier. Je vous propose un espace d'écoute pour réconcilier l'esprit, le corps, le cœur et le désir.",
                "I am Dimitri Gauthier. I offer you a space to be heard, to reconcile the mind, the body, the heart and desire.",
              )}
            </p>
            <div className="animate-fade-up mt-10 flex flex-col items-center gap-4 md:items-start">
              <a
                href={experienceHref(l)}
                className="experience-btn group inline-flex items-center gap-3 rounded-full px-9 py-4 text-base font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-1 sm:px-12 sm:py-5 sm:text-lg"
              >
                <Sparkles className="h-5 w-5" />
                {pick(l, "Prendre rendez-vous", "Book an appointment")}
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>

            <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-muted-foreground md:justify-start">
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

          {/* Colonne photo de Dimitri au premier plan + mascotte cupidon */}
          <div className="animate-fade-up relative mx-auto w-full max-w-sm md:mx-0 md:justify-self-end">
            {/* Halo doux derrière la photo */}
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-full bg-primary/10 blur-2xl"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border-4 border-card shadow-soft ring-1 ring-primary/10">
              <Image
                src="/img/coach.jpg"
                alt={siteConfig.practitionerName}
                fill
                priority
                sizes="(min-width: 768px) 42vw, 90vw"
                className="object-cover"
              />
            </div>
            {/* Cupidon : signature de marque, flotte au-dessus de la photo */}
            <Image
              src="/img/cupid.png"
              alt=""
              aria-hidden
              width={190}
              height={183}
              className="animate-float absolute -left-8 -top-10 w-28 select-none drop-shadow-[0_10px_24px_hsl(14_42%_48%/0.25)] sm:w-32"
            />
          </div>
        </div>
      </section>

      {/* ── Intro ──────────────────────────────────────────── */}
      <section id="guide-intro" className="full-bleed bg-gradient-soft py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
          <Reveal direction="left">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft">
              <Image
                src="/img/detail.jpg"
                alt=""
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
              {pick(l, "Un accompagnement humain, sans tabou et sans jugement", "Human support, without taboo or judgment")}
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">
              <p>
                {pick(
                  l,
                  "Ce qui touche à l'intime se vit souvent dans le silence. Mon rôle est d'ouvrir un espace de parole simple et respectueux, où l'on peut poser ce qui pèse et avancer pas à pas.",
                  "What touches the intimate is often lived in silence. My role is to open a simple, respectful space where you can put down what weighs on you and move forward, step by step.",
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
      <section id="guide-manifeste" className="full-bleed relative overflow-hidden bg-gradient-warm py-24">
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
            <p className="mt-6 font-serif text-2xl italic leading-relaxed text-foreground sm:text-3xl">
              {pick(
                l,
                "« Attendre ou espérer, c'est désirer ce qui ne dépend pas de nous. Vouloir, c'est désirer ce qui dépend de nous. »",
                "“To wait or to hope is to desire what does not depend on us. To will is to desire what depends on us.”",
              )}
            </p>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              {pick(
                l,
                "Tout commence par là : vouloir. Quand une personne le veut vraiment, elle se donne tous les moyens. Mon rôle n'est pas de vouloir à votre place, mais de créer les conditions pour que vous avanciez.",
                "It all starts there: to will. When a person truly wants it, they give themselves every means. My role isn't to want in your place, but to create the conditions for you to move forward.",
              )}
            </p>
            <p className="mt-8 font-serif text-2xl leading-relaxed text-foreground sm:text-3xl">
              {pick(
                l,
                "Selon moi, « accompagnant en intime », la sexothérapie ne se limite en rien à la performance sexuelle.",
                "In my eyes, as an “intimacy companion”, sex therapy is in no way limited to sexual performance.",
              )}
            </p>
            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-muted-foreground">
              {pick(
                l,
                "Je considère la sexualité comme une dimension globale de l'identité, du bien-être et des relations humaines, dans un cadre éthique, confidentiel et sans jugement. Bien souvent, un blocage sexuel n'est pas la cause : c'est la conséquence de quelque chose de plus profond.",
                "I see sexuality as a global dimension of identity, well-being and human relationships, within an ethical, confidential and non-judgmental framework. Very often, a sexual block isn't the cause: it's the consequence of something deeper.",
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
                  "Mon rôle, en tant qu'accompagnant, est d'accueillir, d'écouter, d'observer, d'éclairer votre chemin, et de libérer le mouvement de l'ÊTRE bien qui vient de l'intérieur de vous.",
                  "My role, as a companion, is to welcome, to listen, to observe, to light up your path, and to free the movement of the well-BEING that comes from within you.",
                )}
              </p>
              <p className="mt-5 text-sm font-medium text-primary">— {siteConfig.practitionerName}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Les 3 piliers ─────────────────────────────────── */}
      <section id="guide-piliers" className="full-bleed py-24">
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
                "Ces trois outils ne s'opposent pas : ils se complètent. En alignant la tête, le corps et le cœur, on remet toute votre vie en mouvement.",
                "These three tools don't compete: they complement each other. By aligning mind, body and heart, we set your whole life back in motion.",
              )}
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 120}>
                  <AnimatedCard className="h-full rounded-3xl border border-border/60 bg-card p-8 shadow-card">
                    <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon size={26} />
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-foreground">{p.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{p.body}</p>
                  </AnimatedCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Galerie ───────────────────────────────────────── */}
      <section id="guide-cadre" className="full-bleed pb-24">
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
      <section id="guide-pourqui" className="full-bleed bg-gradient-warm py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-4xl font-medium text-foreground">
              {pick(l, "Pour qui ?", "For whom?")}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {pick(
                l,
                "Chacun avance avec son histoire. L'accompagnement s'adapte à qui vous êtes et à ce que vous traversez.",
                "Everyone moves forward with their own story. Support adapts to who you are and what you're going through.",
              )}
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {profiles.map((p, i) => (
              <Reveal key={p.title} delay={i * 120}>
                <AnimatedCard className="glass h-full rounded-3xl p-8">
                  <h3 className="font-serif text-2xl font-medium text-foreground">{p.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{p.body}</p>
                </AnimatedCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Accompagnements (services depuis la DB) ────────── */}
      {services.length > 0 ? (
        <section id="guide-accompagnements" className="full-bleed py-24">
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
                  <AnimatedCard className="h-full rounded-3xl border border-border/60 bg-card p-7 shadow-card">
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
                  </AnimatedCard>
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
        <section id="guide-avis" className="full-bleed bg-gradient-soft py-24">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal className="mb-12 text-center">
              <h2 className="font-serif text-4xl font-medium text-foreground">
                {pick(l, "Ils m'ont fait confiance", "They trusted me")}
              </h2>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {reviews.map((r, i) => (
                <Reveal key={r.id} delay={i * 120}>
                  <AnimatedCard className="h-full rounded-3xl border border-border/60 bg-card p-7 shadow-card">
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
                  </AnimatedCard>
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

      {/* ── Dimitri accompagne le défilement (prise de confiance) ── */}
      <DimitriGuide
        name={siteConfig.practitionerName}
        role={pick(l, "Votre accompagnant", "Your companion")}
        steps={[
          {
            id: "guide-intro",
            caption: pick(
              l,
              "Ravi de vous accueillir. Ici, on avance à votre rythme, sans jugement.",
              "Glad to welcome you. Here, we move at your pace, without judgment.",
            ),
          },
          {
            id: "guide-manifeste",
            caption: pick(
              l,
              "Mon rôle : créer les conditions pour que vous puissiez vous changer vous-même.",
              "My role: creating the conditions for you to change yourself.",
            ),
          },
          {
            id: "guide-piliers",
            caption: pick(
              l,
              "Tête, corps et cœur : trois clés que je combine selon qui vous êtes.",
              "Mind, body and heart: three keys I combine to fit who you are.",
            ),
          },
          {
            id: "guide-cadre",
            caption: pick(
              l,
              "Un cadre doux et confidentiel, en visioconférence.",
              "A gentle, confidential setting, by video.",
            ),
          },
          {
            id: "guide-pourqui",
            caption: pick(
              l,
              "Homme, femme, couple ou adolescent : votre histoire guide l'accompagnement.",
              "Man, woman, couple or teenager: your story guides the support.",
            ),
          },
          {
            id: "guide-accompagnements",
            caption: pick(
              l,
              "Trouvons l'accompagnement qui vous correspond.",
              "Let's find the support that fits you.",
            ),
          },
          {
            id: "guide-avis",
            caption: pick(
              l,
              "D'autres ont osé le premier pas. Leurs mots parlent pour eux.",
              "Others dared the first step. Their words speak for them.",
            ),
          },
        ]}
      />

    </div>
  );
}
