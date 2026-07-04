"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Direction = "up" | "left" | "right";

const baseClass: Record<Direction, string> = {
  up: "reveal",
  left: "reveal-left",
  right: "reveal-right",
};

/**
 * Enveloppe un bloc pour le faire apparaître en douceur au défilement.
 * Sans JS, le <noscript> du layout garde le contenu visible.
 */
export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cls = `${baseClass[direction]}${shown ? " in" : ""} ${className}`.trim();
  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <Tag
      // @ts-expect-error — ref polymorphe volontairement large
      ref={ref}
      className={cls}
      style={style}
    >
      {children}
    </Tag>
  );
}
