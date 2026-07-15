// Blocs de sections riches et réutilisables pour les pages internes du site.
// But : donner à chaque page une identité visuelle propre (héros imagé, splits
// texte/image réversibles, étapes numérotées, timeline, cartes en relief,
// citations sur fond profond) tout en réutilisant le vocabulaire de la home
// (full-bleed, blobs, dégradés chauds). Compatibles Server Components.
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import AnimatedCard from "@/components/AnimatedCard";
import { Eyebrow } from "@/components/ui";

// Motif « cœurs » en filigrane (repris du hero de la home).
const HEART_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='54' height='54' viewBox='0 0 54 54'%3E%3Cpath d='M27 37C27 37 16 29.5 16 22C16 18.1 19 15.6 22.3 16.8C24.4 17.5 27 20 27 20C27 20 29.6 17.5 31.7 16.8C35 15.6 38 18.1 38 22C38 29.5 27 37 27 37Z' fill='%23AE5F47'/%3E%3C/svg%3E\")";

type SectionTone = "plain" | "soft" | "warm";
const sectionBg: Record<SectionTone, string> = {
  plain: "",
  soft: "bg-gradient-soft",
  warm: "bg-gradient-warm",
};

/** Petite pastille d'information (icône optionnelle + libellé). */
export function Pill({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-3.5 py-1.5 text-sm text-muted-foreground shadow-card backdrop-blur">
      {icon ? <span className="text-primary">{icon}</span> : null}
      {children}
    </span>
  );
}

/** Héros de page : full-bleed, blobs, filigrane cœurs. Photo & CTA optionnels. */
export function PageHero({
  eyebrow,
  title,
  sub,
  image,
  imageAlt = "",
  badges,
  cta,
  tone = "soft",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  image?: string;
  imageAlt?: string;
  badges?: ReactNode;
  cta?: { href: string; label: ReactNode };
  tone?: "soft" | "warm";
}) {
  const bg = tone === "warm" ? "bg-gradient-warm" : "bg-gradient-soft";
  return (
    <header className={`full-bleed relative -mt-16 overflow-hidden ${bg}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: HEART_PATTERN, backgroundSize: "54px 54px" }}
      />
      <span aria-hidden className="blob animate-blob absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/20" />
      <span
        aria-hidden
        className="blob animate-blob absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-gold/25"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className={`relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-28 md:pb-20 md:pt-32 ${
          image ? "md:grid-cols-2" : ""
        }`}
      >
        <Reveal>
          {eyebrow ? <div className="mb-4"><Eyebrow>{eyebrow}</Eyebrow></div> : null}
          <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          {sub ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{sub}</p> : null}
          {badges ? <div className="mt-7 flex flex-wrap gap-2.5">{badges}</div> : null}
          {cta ? (
            <div className="mt-8">
              <Link
                href={cta.href}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
              >
                {cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </Reveal>
        {image ? (
          <Reveal direction="right" className="mx-auto w-full max-w-sm md:mx-0 md:justify-self-end">
            <div className="relative">
              <div aria-hidden className="absolute -inset-6 -z-10 rounded-full bg-primary/10 blur-2xl" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border-4 border-card shadow-soft ring-1 ring-primary/10">
                <Image src={image} alt={imageAlt} fill sizes="(min-width: 768px) 42vw, 90vw" className="object-cover" />
              </div>
            </div>
          </Reveal>
        ) : null}
      </div>
    </header>
  );
}

/** En-tête de section : sur-titre + titre serif + intro, centré ou aligné à gauche. */
export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "center",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? <div className="mb-3"><Eyebrow>{eyebrow}</Eyebrow></div> : null}
      <h2 className="font-serif text-3xl font-medium text-foreground sm:text-4xl">{title}</h2>
      {children ? <p className="mt-4 leading-relaxed text-muted-foreground">{children}</p> : null}
    </Reveal>
  );
}

/** Section image + texte, réversible, avec fond optionnel (plein largeur). */
export function SplitSection({
  eyebrow,
  title,
  image,
  imageAlt = "",
  reverse = false,
  tone = "plain",
  cta,
  children,
}: {
  eyebrow?: ReactNode;
  title?: ReactNode;
  image: string;
  imageAlt?: string;
  reverse?: boolean;
  tone?: SectionTone;
  cta?: { href: string; label: ReactNode };
  children?: ReactNode;
}) {
  return (
    <section className={`full-bleed ${sectionBg[tone]} py-20 sm:py-24`}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
        <Reveal direction={reverse ? "right" : "left"} className={reverse ? "md:order-2" : ""}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft">
            <Image src={image} alt={imageAlt} fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
          </div>
        </Reveal>
        <Reveal direction={reverse ? "left" : "right"} className={reverse ? "md:order-1" : ""}>
          {eyebrow ? <div className="mb-3"><Eyebrow>{eyebrow}</Eyebrow></div> : null}
          {title ? <h2 className="font-serif text-3xl font-medium text-foreground sm:text-4xl">{title}</h2> : null}
          <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">{children}</div>
          {cta ? (
            <div className="mt-7">
              <Link
                href={cta.href}
                className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-6 py-2.5 text-sm font-medium text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/5"
              >
                {cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

/** Grille de cartes « feature » en relief (pastille icône + titre + texte). */
export function FeatureGrid({
  items,
  cols = 3,
  tone = "plain",
  heading,
}: {
  items: { icon?: ReactNode; title: ReactNode; body?: ReactNode }[];
  cols?: 2 | 3 | 4;
  tone?: SectionTone;
  heading?: ReactNode;
}) {
  const grid =
    cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3";
  return (
    <section className={`full-bleed ${sectionBg[tone]} py-20 sm:py-24`}>
      <div className="mx-auto max-w-6xl px-4">
        {heading ? <div className="mb-12">{heading}</div> : null}
        <div className={`grid gap-6 ${grid}`}>
          {items.map((it, i) => (
            <Reveal key={i} delay={(i % 3) * 100}>
              <AnimatedCard className="h-full rounded-3xl border border-border/60 bg-card p-8 shadow-card">
                {it.icon ? (
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    {it.icon}
                  </div>
                ) : null}
                <h3 className="font-serif text-2xl font-medium text-foreground">{it.title}</h3>
                {it.body ? <div className="mt-3 leading-relaxed text-muted-foreground">{it.body}</div> : null}
              </AnimatedCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Étapes numérotées (2 à 4). */
export function Steps({
  items,
  heading,
  tone = "plain",
}: {
  items: { title: ReactNode; body?: ReactNode }[];
  heading?: ReactNode;
  tone?: SectionTone;
}) {
  const cols =
    items.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : items.length === 2 ? "sm:grid-cols-2" : "md:grid-cols-3";
  return (
    <section className={`full-bleed ${sectionBg[tone]} py-20 sm:py-24`}>
      <div className="mx-auto max-w-6xl px-4">
        {heading ? <div className="mb-12">{heading}</div> : null}
        <div className={`grid gap-6 ${cols}`}>
          {items.map((it, i) => (
            <Reveal key={i} delay={i * 100}>
              <AnimatedCard className="h-full rounded-3xl border border-border/60 bg-card p-7 shadow-card">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary font-serif text-lg font-medium text-primary-foreground shadow-soft transition-transform duration-500 group-hover:scale-110">
                  {i + 1}
                </span>
                <h3 className="font-serif text-xl font-medium text-foreground">{it.title}</h3>
                {it.body ? <p className="mt-2 leading-relaxed text-muted-foreground">{it.body}</p> : null}
              </AnimatedCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Timeline verticale (parcours, étapes chronologiques). */
export function Timeline({
  items,
  heading,
  tone = "soft",
}: {
  items: { marker: ReactNode; title: ReactNode; body?: ReactNode }[];
  heading?: ReactNode;
  tone?: SectionTone;
}) {
  return (
    <section className={`full-bleed ${sectionBg[tone]} py-20 sm:py-24`}>
      <div className="mx-auto max-w-3xl px-4">
        {heading ? <div className="mb-12">{heading}</div> : null}
        <ol className="space-y-8">
          {items.map((it, i) => (
            <Reveal as="li" key={i} delay={i * 100} className="flex gap-5">
              <div className="flex flex-col items-center">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-lg font-medium text-primary">
                  {i + 1}
                </span>
                {i < items.length - 1 ? <span aria-hidden className="mt-2 w-px flex-1 bg-primary/20" /> : null}
              </div>
              <div className="pb-2">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{it.marker}</p>
                <h3 className="mt-1 font-serif text-xl font-medium text-foreground">{it.title}</h3>
                {it.body ? <p className="mt-2 leading-relaxed text-muted-foreground">{it.body}</p> : null}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Citation mise en valeur : fond profond (deep) ou chaud (warm). */
export function QuoteBlock({
  children,
  cite,
  tone = "deep",
}: {
  children: ReactNode;
  cite?: ReactNode;
  tone?: "deep" | "warm";
}) {
  if (tone === "warm") {
    return (
      <section className="full-bleed relative overflow-hidden bg-gradient-warm py-20 sm:py-24">
        <span aria-hidden className="blob animate-blob absolute -left-16 top-8 h-64 w-64 rounded-full bg-primary/20" />
        <span
          aria-hidden
          className="blob animate-blob absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-gold/25"
          style={{ animationDelay: "-7s" }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <Reveal>
            <p className="font-serif text-2xl italic leading-relaxed text-foreground sm:text-3xl">{children}</p>
            {cite ? <p className="mt-6 text-sm font-medium text-primary">— {cite}</p> : null}
          </Reveal>
        </div>
      </section>
    );
  }
  return (
    <section className="full-bleed relative overflow-hidden bg-deep py-20 sm:py-24">
      <span aria-hidden className="blob animate-blob absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/40" />
      <span
        aria-hidden
        className="blob animate-blob absolute -bottom-12 -right-8 h-72 w-72 rounded-full bg-gold/25"
        style={{ animationDelay: "-6s" }}
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <Reveal>
          <p className="font-serif text-2xl leading-relaxed text-background sm:text-3xl">{children}</p>
          {cite ? <p className="mt-6 text-sm font-medium text-background/70">— {cite}</p> : null}
        </Reveal>
      </div>
    </section>
  );
}

/** Bandeau d'appel à l'action de fin de page (fond profond, collé au footer). */
export function CTABanner({
  title,
  sub,
  href,
  cta,
}: {
  title: ReactNode;
  sub?: ReactNode;
  href: string;
  cta: ReactNode;
}) {
  return (
    <section className="full-bleed relative -mb-16 overflow-hidden bg-deep">
      <span aria-hidden className="blob animate-blob absolute -left-10 -top-10 h-56 w-56 rounded-full bg-primary/40" />
      <span
        aria-hidden
        className="blob animate-blob absolute -bottom-12 -right-8 h-64 w-64 rounded-full bg-gold/30"
        style={{ animationDelay: "-6s" }}
      />
      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:py-24">
        <Reveal>
          <h2 className="font-serif text-3xl font-medium text-background sm:text-4xl">{title}</h2>
          {sub ? <p className="mx-auto mt-4 max-w-xl leading-relaxed text-background/80">{sub}</p> : null}
          <div className="mt-8 flex justify-center">
            <Link
              href={href}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-3.5 text-sm font-medium text-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5"
            >
              {cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
