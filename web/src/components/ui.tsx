// Petits blocs UI réutilisables — style fonctionnel neutre (design différé).
import Link from "next/link";
import type { ReactNode } from "react";

export function PageTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{children}</h1>
      {sub ? <p className="mt-3 max-w-2xl text-lg text-neutral-600">{sub}</p> : null}
    </header>
  );
}

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      {title ? <h2 className="mb-3 text-xl font-semibold">{title}</h2> : null}
      <div className="space-y-3 text-neutral-700 leading-relaxed">{children}</div>
    </section>
  );
}

export function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose-neutral max-w-none space-y-4 leading-relaxed text-neutral-700 [&_a]:underline [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6"
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
      ? "bg-neutral-900 text-white hover:bg-neutral-700"
      : "border border-neutral-300 text-neutral-800 hover:bg-neutral-100";
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-md px-5 py-2.5 text-sm font-medium ${cls}`}
    >
      {children}
    </Link>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-neutral-200 p-5">{children}</div>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
      {children}
    </div>
  );
}
