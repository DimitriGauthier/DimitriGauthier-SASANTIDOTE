"use client";

// « Dimitri qui accompagne le défilement ».
// Une pastille fixe (photo réelle de Dimitri) reste visible tout au long de la
// page ; sa légende change au fil des sections (« étapes ») grâce à un scroll-spy.
// Objectif : garder une présence humaine et rassurante pendant toute la visite →
// grosse prise de confiance. Repliable, discret, respecte prefers-reduced-motion.

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type GuideStep = { id: string; caption: string };

export default function DimitriGuide({
  name,
  role,
  photo = "/img/coach-avatar.jpg",
  steps,
}: {
  name: string;
  role: string;
  photo?: string;
  steps: GuideStep[];
}) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const activeRef = useRef(0);

  // Sur mobile, on démarre replié (juste la pastille) pour ne pas encombrer le
  // bas de l'écran déjà occupé par WhatsApp et l'invitation « expérience ».
  useEffect(() => {
    if (window.matchMedia("(max-width: 639px)").matches) setCollapsed(true);
  }, []);

  // Scroll-spy : la section qui traverse la bande centrale de l'écran devient active.
  useEffect(() => {
    const found = steps
      .map((s, i) => {
        const el = document.getElementById(s.id);
        return el ? { el, i } : null;
      })
      .filter((x): x is { el: HTMLElement; i: number } => x !== null);
    if (found.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = found.find((f) => f.el === e.target)?.i;
          if (idx != null && idx !== activeRef.current) {
            activeRef.current = idx;
            setActive(idx);
          }
        }
      },
      { rootMargin: "-46% 0px -46% 0px", threshold: 0 },
    );
    found.forEach(({ el }) => io.observe(el));
    return () => io.disconnect();
  }, [steps]);

  // Apparaît une fois le hero passé ; s'efface tout en bas (zone du CTA/footer).
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const nearBottom =
        y + window.innerHeight > document.documentElement.scrollHeight - 260;
      setVisible(y > 520 && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const caption = steps[active]?.caption ?? steps[0]?.caption ?? "";

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 max-w-[min(20rem,calc(100vw-2rem))] transition-all duration-500 ease-out sm:bottom-6 sm:left-6 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <style dangerouslySetInnerHTML={{ __html: DG_CSS }} />

      {collapsed ? (
        // Replié : uniquement la pastille (Dimitri reste visible).
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label={name}
          className="dg-avatar-btn block h-14 w-14 overflow-hidden rounded-full border-2 border-card shadow-soft"
        >
          <Image
            src={photo}
            alt={name}
            width={56}
            height={56}
            className="h-full w-full object-cover"
            style={{ objectPosition: "center" }}
          />
        </button>
      ) : (
        <div className="dg-card flex items-center gap-3 rounded-2xl border border-primary/15 bg-card/90 py-2.5 pl-2.5 pr-3 shadow-soft backdrop-blur">
          <span className="dg-float relative block h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-card shadow-sm ring-1 ring-primary/15 sm:h-14 sm:w-14">
            <Image
              src={photo}
              alt={name}
              width={56}
              height={56}
              className="h-full w-full object-cover"
              style={{ objectPosition: "50% 22%" }}
            />
          </span>

          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="text-[0.82rem] font-semibold leading-tight text-foreground">
                {name}
              </span>
              <span className="dg-dot" aria-hidden />
            </span>
            <span className="block text-[0.62rem] font-medium uppercase tracking-[0.1em] text-primary/80">
              {role}
            </span>
            {/* La légende « slide » à chaque changement de section */}
            <span key={active} className="dg-caption mt-1 block text-[0.8rem] leading-snug text-muted-foreground">
              {caption}
            </span>
          </span>

          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Réduire"
            className="ml-0.5 self-start rounded-full p-1 text-muted-foreground/70 transition-colors hover:text-primary"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

const DG_CSS = `
.dg-card{animation:dg-rise .5s cubic-bezier(.16,1,.3,1) both}
.dg-avatar-btn{animation:dg-rise .4s cubic-bezier(.16,1,.3,1) both}
.dg-float{animation:dg-float 4.5s ease-in-out infinite}
.dg-caption{animation:dg-cap .45s cubic-bezier(.16,1,.3,1) both}
.dg-dot{width:6px;height:6px;border-radius:9999px;background:hsl(var(--primary));
  box-shadow:0 0 0 0 hsl(var(--primary) / .5);animation:dg-pulse 2.4s ease-in-out infinite}

@keyframes dg-rise{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
@keyframes dg-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes dg-cap{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
@keyframes dg-pulse{0%,100%{box-shadow:0 0 0 0 hsl(var(--primary) / .45)}50%{box-shadow:0 0 0 6px hsl(var(--primary) / 0)}}

@media (prefers-reduced-motion: reduce){
  .dg-card,.dg-avatar-btn,.dg-float,.dg-caption,.dg-dot{animation:none}
}
`;
