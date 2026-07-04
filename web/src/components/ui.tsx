// Petits blocs UI réutilisables — habillage chaud « terre / terracotta ».
import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

/** Petit sur-titre en capitales espacées, ton primary. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block text-xs font-medium uppercase tracking-[0.3em] text-primary">
      {children}
    </span>
  );
}

/** En-tête de page : bandeau doux pleine largeur, sur-titre + titre serif + intro. */
export function PageTitle({
  children,
  sub,
  eyebrow,
}: {
  children: ReactNode;
  sub?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="full-bleed relative -mt-16 mb-14 overflow-hidden bg-gradient-soft">
      <span
        aria-hidden
        className="blob absolute -left-20 -top-16 h-64 w-64 animate-blob rounded-full bg-primary/25"
      />
      <span
        aria-hidden
        className="blob absolute -bottom-24 -right-10 h-72 w-72 animate-blob rounded-full bg-accent/40"
        style={{ animationDelay: "5s" }}
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-24 sm:pb-20 sm:pt-28">
        <Reveal>
          {eyebrow ? <div className="mb-4">{typeof eyebrow === "string" ? <Eyebrow>{eyebrow}</Eyebrow> : eyebrow}</div> : null}
          <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            {children}
          </h1>
          {sub ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{sub}</p>
          ) : null}
        </Reveal>
      </div>
    </header>
  );
}

export function Section({
  title,
  eyebrow,
  children,
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <Reveal as="section" className="mb-14">
      {eyebrow ? <div className="mb-3"><Eyebrow>{eyebrow}</Eyebrow></div> : null}
      {title ? (
        <h2 className="mb-5 font-serif text-2xl font-medium text-foreground sm:text-3xl">{title}</h2>
      ) : null}
      <div className="space-y-4 text-base leading-relaxed text-muted-foreground">{children}</div>
    </Reveal>
  );
}

export function Prose({ html }: { html: string }) {
  return (
    <div
      className="max-w-none space-y-4 leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a:hover]:opacity-80 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-foreground [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function CTAButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
}) {
  const cls =
    variant === "primary"
      ? "bg-primary text-primary-foreground shadow-soft hover:brightness-105"
      : "border border-primary/40 text-primary hover:bg-primary/5";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium tracking-wide transition-all duration-300 hover:-translate-y-0.5 ${cls}`}
    >
      {children}
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`hover-lift rounded-2xl border border-border/60 bg-card p-6 shadow-card ${className}`}>
      {children}
    </div>
  );
}

/** Carte « feature » : pastille icône + titre serif + texte. */
export function IconCard({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="hover-lift group rounded-2xl border border-border/60 bg-card p-6 shadow-card">
      {icon ? (
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {icon}
        </div>
      ) : null}
      <h3 className="font-serif text-xl font-medium text-foreground">{title}</h3>
      {children ? <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div> : null}
    </div>
  );
}

/** Bandeau d'appel à l'action en fin de page (fond profond). */
export function CTASection({
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
    <Reveal as="section" className="full-bleed relative my-16 overflow-hidden bg-deep">
      <span aria-hidden className="blob absolute -right-10 -top-16 h-64 w-64 animate-blob rounded-full bg-primary/40" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center sm:py-20">
        <h2 className="font-serif text-3xl font-medium text-background sm:text-4xl">{title}</h2>
        {sub ? <p className="max-w-xl text-base leading-relaxed text-background/70">{sub}</p> : null}
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
        >
          {cta}
        </Link>
      </div>
    </Reveal>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center text-muted-foreground">
      {children}
    </div>
  );
}
