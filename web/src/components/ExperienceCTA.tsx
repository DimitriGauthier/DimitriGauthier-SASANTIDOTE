"use client";

// Invitation flottante « Tente l'expérience » — apparaît dès que l'on quitte le hero,
// pour donner rapidement envie de lancer le parcours guidé. Refermable.
// Reprend la mascotte Dimitri pour rester cohérent avec le guide du tunnel.

import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { DimitriAvatar } from "@/components/DimitriAvatar";

export default function ExperienceCTA({
  href,
  label,
  hint,
  closeLabel,
}: {
  href: string;
  label: string;
  hint: string;
  closeLabel: string;
}) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 460);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 transition-all duration-500 ease-out sm:bottom-6 sm:right-6 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={closeLabel}
          className="absolute -right-2 -top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <a
          href={href}
          className="group flex items-center gap-3 rounded-full border border-primary/20 bg-card/90 py-2 pl-2 pr-4 shadow-soft backdrop-blur transition-transform duration-300 hover:-translate-y-0.5"
        >
          <DimitriAvatar size={46} className="animate-float shrink-0" />
          <span className="pr-1">
            <span className="hidden text-[11px] leading-tight text-muted-foreground sm:block">{hint}</span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              {label}
              <ArrowRight className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </span>
        </a>
      </div>
    </div>
  );
}
