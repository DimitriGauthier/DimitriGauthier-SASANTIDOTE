"use client";

// Splash d'entrée « INTIMY » : Cupidon décoche une flèche à tête de cœur qui traverse
// l'écran en laissant une traînée de cœurs et de roses, frappe le centre (halo + pétales),
// révèle le logo Dimitri Gauthier, puis « ouvre » le site (deux panneaux qui s'écartent).
//
// 100 % auto-contenu : SVG inline (même style que les avatars) + keyframes CSS scopées.
// Joué une seule fois par session (sessionStorage). Ignoré si prefers-reduced-motion.
// Bouton « Entrer » pour passer. Aucune dépendance externe.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import SplashCupid from "./SplashCupid";

// SSR-safe : useLayoutEffect côté client, useEffect au rendu serveur.
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SEEN_KEY = "intimy_splash_seen";
const TOTAL_MS = 3500; // durée totale avant démontage (l'ouverture finit ~3.45 s)

type CSSVars = React.CSSProperties & Record<string, string | number>;

// ── Icônes (cœur, rose, pétale) — réutilisées pour la traînée et l'explosion ──
const HEART_D =
  "M0 6 C0 6 -9 -1 -9 -7 C-9 -11 -5 -13 -2 -11 C-0.6 -10 0 -8.6 0 -8.6 C0 -8.6 0.6 -10 2 -11 C5 -13 9 -11 9 -7 C9 -1 0 6 0 6 Z";

function Heart() {
  return (
    <svg viewBox="-12 -14 24 24" width="100%" height="100%" aria-hidden>
      <path d={HEART_D} fill="hsl(var(--primary))" />
    </svg>
  );
}

function Rose() {
  return (
    <svg viewBox="-20 -20 40 40" width="100%" height="100%" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse
          key={i}
          cx="0"
          cy="-7.5"
          rx="5.2"
          ry="7.5"
          fill="hsl(var(--primary))"
          transform={`rotate(${i * 72})`}
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse
          key={`b${i}`}
          cx="0"
          cy="-4.5"
          rx="3.4"
          ry="5"
          fill="hsl(var(--primary) / 0.75)"
          transform={`rotate(${i * 72 + 36})`}
        />
      ))}
      <circle r="4" fill="hsl(var(--gold))" />
    </svg>
  );
}

function Petal() {
  return (
    <svg viewBox="-10 -10 20 20" width="100%" height="100%" aria-hidden>
      <path
        d="M0 -8 C6 -4 6 4 0 8 C-6 4 -6 -4 0 -8 Z"
        fill="hsl(var(--gold) / 0.9)"
      />
    </svg>
  );
}

function Icon({ kind }: { kind: "heart" | "rose" | "petal" }) {
  if (kind === "rose") return <Rose />;
  if (kind === "petal") return <Petal />;
  return <Heart />;
}

// ── La flèche (tête de cœur, empennage doré), pointe vers la droite ──
function Arrow() {
  return (
    <svg viewBox="0 0 132 44" width="100%" height="100%" aria-hidden className="splash-arrow-svg">
      {/* hampe */}
      <line x1="14" y1="22" x2="96" y2="22" stroke="hsl(var(--deep))" strokeWidth="4" strokeLinecap="round" />
      {/* empennage */}
      <path d="M8 22 L26 11 L21 22 L26 33 Z" fill="hsl(var(--gold))" />
      <path d="M20 22 L38 11 L33 22 L38 33 Z" fill="hsl(var(--primary))" />
      {/* petite lueur */}
      <circle cx="70" cy="22" r="2.4" fill="hsl(var(--gold) / 0.9)" />
      {/* tête en cœur */}
      <g transform="translate(106 22) scale(1.55)">
        <path d={HEART_D} fill="hsl(var(--primary))" />
      </g>
    </svg>
  );
}

// Le Cupidon utilisé est le vrai chérubin illustré du logo Dimitri Gauthier
// (découpé depuis /img/logo.png → /img/cupid.png). Il vise à gauche dans le logo,
// on le retourne horizontalement (scaleX(-1)) pour qu'il décoche vers le centre.

// Traînée de cœurs & roses le long de la trajectoire de la flèche.
const TRAIL: { left: string; top: string; kind: "heart" | "rose" | "petal"; delay: number }[] = [
  { left: "26%", top: "49%", kind: "heart", delay: 1.0 },
  { left: "31%", top: "53%", kind: "rose", delay: 1.08 },
  { left: "36%", top: "48%", kind: "petal", delay: 1.16 },
  { left: "40%", top: "52%", kind: "heart", delay: 1.24 },
  { left: "44%", top: "49%", kind: "rose", delay: 1.32 },
  { left: "47%", top: "51%", kind: "petal", delay: 1.4 },
];

// Explosion au point d'impact (cercle de cœurs / roses / pétales).
const BURST = Array.from({ length: 15 }).map((_, i) => {
  const ang = (i / 15) * Math.PI * 2;
  const dist = 92 + (i % 3) * 30;
  const kind = (i % 3 === 0 ? "rose" : i % 3 === 1 ? "heart" : "petal") as "heart" | "rose" | "petal";
  return {
    tx: Math.round(Math.cos(ang) * dist),
    ty: Math.round(Math.sin(ang) * dist),
    r: (i % 2 ? 1 : -1) * (120 + i * 9),
    kind,
    delay: (i % 5) * 0.03,
  };
});

export default function SiteSplash({
  tagline,
  skipLabel,
  name,
}: {
  tagline: string;
  skipLabel: string;
  name: string;
}) {
  const [show, setShow] = useState(true);
  const timer = useRef<number | null>(null);

  useIso(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (reduce || seen) {
      setShow(false); // retour de session ou motion réduit → pas de splash (avant paint)
      return;
    }
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* stockage indisponible : on joue quand même une fois */
    }
    document.body.style.overflow = "hidden";
    timer.current = window.setTimeout(() => setShow(false), TOTAL_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      document.body.style.overflow = "";
    };
  }, []);

  function skip() {
    if (timer.current) window.clearTimeout(timer.current);
    document.body.style.overflow = "";
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="splash-root" role="presentation">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Panneaux qui s'écartent pour « ouvrir » le site */}
      <div className="splash-door splash-door-l">
        <span aria-hidden className="blob animate-blob splash-blob" style={{ left: "-20%", top: "12%" }} />
      </div>
      <div className="splash-door splash-door-r">
        <span
          aria-hidden
          className="blob animate-blob splash-blob"
          style={{ right: "-20%", bottom: "10%", background: "hsl(var(--gold) / 0.4)", animationDelay: "-6s" }}
        />
      </div>

      {/* Acteurs (Cupidon + flèche + traînée + explosion) — s'effacent avant l'ouverture */}
      <div className="splash-actors">
        <div className="splash-cupid">
          <SplashCupid />
        </div>

        <div className="splash-arrow">
          <Arrow />
        </div>

        {TRAIL.map((it, i) => (
          <div
            key={i}
            className="splash-trail-item"
            style={{ left: it.left, top: it.top, animationDelay: `${it.delay}s` }}
          >
            <Icon kind={it.kind} />
          </div>
        ))}

        <div className="splash-ring" />
        <div className="splash-burst">
          {BURST.map((b, i) => (
            <span
              key={i}
              className={`splash-burst-item splash-burst-${b.kind}`}
              style={
                {
                  "--tx": `${b.tx}px`,
                  "--ty": `${b.ty}px`,
                  "--r": `${b.r}deg`,
                  animationDelay: `${1.75 + b.delay}s`,
                } as CSSVars
              }
            >
              <Icon kind={b.kind} />
            </span>
          ))}
        </div>
      </div>

      {/* Logo révélé */}
      <div className="splash-logo-wrap">
        <div className="splash-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo.png" alt={name} className="splash-logo-img" />
          <p className="splash-tag">{tagline}</p>
        </div>
      </div>

      <button type="button" onClick={skip} className="splash-skip">
        {skipLabel}
      </button>

      <noscript>
        <style>{`.splash-root{display:none!important}`}</style>
      </noscript>
    </div>
  );
}

const CSS = `
.splash-root{position:fixed;inset:0;z-index:200;overflow:hidden;background:transparent}
.splash-root *{box-sizing:border-box}

/* Panneaux */
.splash-door{position:absolute;top:0;bottom:0;width:50.5%;background:var(--gradient-warm);overflow:hidden;will-change:transform}
.splash-door-l{left:0;box-shadow:inset -34px 0 70px hsl(var(--deep) / 0.06);animation:sp-door-l .85s cubic-bezier(.7,0,.25,1) 2.6s both}
.splash-door-r{right:0;box-shadow:inset 34px 0 70px hsl(var(--deep) / 0.06);animation:sp-door-r .85s cubic-bezier(.7,0,.25,1) 2.6s both}
.splash-blob{position:absolute;width:min(46vw,420px);aspect-ratio:1;border-radius:9999px;background:hsl(var(--primary) / 0.35)}

/* Acteurs */
.splash-actors{position:absolute;inset:0;animation:sp-fade-out .5s ease 2.35s both}

.splash-cupid{position:absolute;left:14%;top:50%;width:clamp(150px,25vw,250px);transform:translate(-50%,-50%)}

.splash-arrow{position:absolute;left:20%;top:50%;width:clamp(66px,13vw,120px);opacity:1;
  animation:sp-arrow-x 2s cubic-bezier(.5,0,.2,1) .4s both, sp-arrow-pose 2s cubic-bezier(.5,0,.2,1) .4s both;will-change:left,transform,opacity}
.splash-arrow-svg{display:block;filter:drop-shadow(0 4px 10px hsl(var(--primary) / 0.25))}

.splash-trail-item{position:absolute;width:clamp(16px,3vw,26px);aspect-ratio:1;transform:translate(-50%,-50%);opacity:0;animation:sp-trail .8s ease-out both}

.splash-ring{position:absolute;left:50%;top:50%;width:clamp(120px,26vw,240px);aspect-ratio:1;border-radius:9999px;border:2px solid hsl(var(--primary) / 0.5);transform:translate(-50%,-50%) scale(.2);opacity:0;animation:sp-ring .9s ease-out 1.75s both}

.splash-burst{position:absolute;left:50%;top:50%}
.splash-burst-item{position:absolute;left:0;top:0;aspect-ratio:1;transform:translate(-50%,-50%);opacity:0;animation:sp-burst .95s ease-out both;will-change:transform,opacity}
.splash-burst-heart{width:clamp(16px,2.8vw,26px)}
.splash-burst-rose{width:clamp(18px,3.2vw,30px)}
.splash-burst-petal{width:clamp(12px,2.2vw,20px)}

/* Logo */
.splash-logo-wrap{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;animation:sp-fade-out .45s ease 2.95s both}
.splash-logo{opacity:0;display:flex;flex-direction:column;align-items:center;gap:.7rem;animation:sp-logo-in .7s cubic-bezier(.16,1,.3,1) 1.8s both}
.splash-logo-img{width:clamp(190px,44vw,330px);height:auto}
.splash-tag{margin:0;opacity:0;font-size:clamp(.7rem,1.6vw,.9rem);letter-spacing:.2em;text-transform:uppercase;font-weight:500;color:hsl(var(--primary));animation:sp-tag-in .6s ease-out 2.15s both}

/* Bouton passer */
.splash-skip{position:absolute;left:50%;bottom:clamp(1.4rem,5vh,3rem);transform:translateX(-50%);z-index:20;
  border:1px solid hsl(var(--border));background:hsl(var(--card) / 0.7);backdrop-filter:blur(6px);color:hsl(var(--muted-foreground));
  padding:.5rem 1.1rem;border-radius:9999px;font-size:.8rem;font-weight:500;cursor:pointer;transition:color .2s,border-color .2s;
  opacity:0;animation:sp-fade-in-late .5s ease 1s both}
.splash-skip:hover{color:hsl(var(--primary));border-color:hsl(var(--primary) / 0.5)}

@keyframes sp-arrow-x{0%{left:20%}22%{left:18%}32%{left:18%}68%{left:50%}100%{left:50%}}
@keyframes sp-arrow-pose{
  0%{transform:translate(-50%,-50%) rotate(0) scale(1);opacity:1}
  22%{transform:translate(-50%,-50%) rotate(-4deg) scale(1)}
  32%{transform:translate(-50%,-50%) rotate(0) scale(1)}
  68%{transform:translate(-50%,-52%) rotate(0) scale(1.22);opacity:1}
  76%{opacity:1}
  84%{transform:translate(-50%,-52%) rotate(0) scale(1.32);opacity:0}
  100%{opacity:0}
}
@keyframes sp-trail{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,-120%) scale(1)}}
@keyframes sp-ring{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}20%{opacity:.6}100%{opacity:0;transform:translate(-50%,-50%) scale(2.4)}}
@keyframes sp-burst{
  0%{opacity:0;transform:translate(-50%,-50%) scale(.2) rotate(0)}
  25%{opacity:1}
  100%{opacity:0;transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(1) rotate(var(--r))}
}
@keyframes sp-logo-in{0%{opacity:0;transform:scale(.6)}60%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
@keyframes sp-tag-in{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
@keyframes sp-fade-out{to{opacity:0}}
@keyframes sp-fade-in-late{to{opacity:1}}
@keyframes sp-door-l{to{transform:translateX(-100%)}}
@keyframes sp-door-r{to{transform:translateX(100%)}}

@media (prefers-reduced-motion: reduce){.splash-root{display:none}}
`;
