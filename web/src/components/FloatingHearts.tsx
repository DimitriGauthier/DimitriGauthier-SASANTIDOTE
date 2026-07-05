"use client";

// Cœurs flottants d'ambiance : une couche fixe, derrière le contenu (z-index:-1),
// où de petits cœurs dérivent lentement vers le haut avec une légère oscillation.
// 100 % auto-contenu (SVG inline + keyframes CSS scopées), paramètres déterministes
// (pas de Math.random au rendu → aucun décalage d'hydratation). Coupé en reduced-motion.

const HEART_D =
  "M12 21 C12 21 3 14 3 8.2 C3 5 5.4 3 8 3 C9.7 3 11.2 4 12 5.4 C12.8 4 14.3 3 16 3 C18.6 3 21 5 21 8.2 C21 14 12 21 12 21 Z";

// left%, largeur px, durée s, délai s, opacité, dérive X (px), rotation finale (deg), teinte
type H = { l: number; w: number; d: number; delay: number; o: number; dx: number; rot: number; gold?: boolean };

const HEARTS: H[] = [
  { l: 4, w: 26, d: 20, delay: 0, o: 0.16, dx: 40, rot: 25 },
  { l: 12, w: 16, d: 26, delay: -6, o: 0.12, dx: -30, rot: -20, gold: true },
  { l: 20, w: 34, d: 23, delay: -14, o: 0.14, dx: 24, rot: 18 },
  { l: 29, w: 14, d: 28, delay: -3, o: 0.1, dx: -20, rot: -14, gold: true },
  { l: 37, w: 22, d: 21, delay: -18, o: 0.15, dx: 36, rot: 22 },
  { l: 45, w: 18, d: 30, delay: -9, o: 0.11, dx: -26, rot: -16 },
  { l: 53, w: 30, d: 24, delay: -2, o: 0.13, dx: 30, rot: 20, gold: true },
  { l: 61, w: 15, d: 27, delay: -20, o: 0.1, dx: -22, rot: -12 },
  { l: 69, w: 24, d: 22, delay: -11, o: 0.15, dx: 34, rot: 24 },
  { l: 77, w: 17, d: 29, delay: -5, o: 0.11, dx: -28, rot: -18, gold: true },
  { l: 85, w: 32, d: 25, delay: -16, o: 0.13, dx: 26, rot: 16 },
  { l: 92, w: 15, d: 31, delay: -8, o: 0.1, dx: -18, rot: -10 },
  { l: 66, w: 20, d: 33, delay: -22, o: 0.12, dx: 22, rot: 14, gold: true },
  { l: 33, w: 19, d: 32, delay: -13, o: 0.11, dx: -24, rot: -15 },
];

export default function FloatingHearts({ zIndex = 30 }: { zIndex?: number }) {
  // Couche d'ambiance en léger sur-vol du contenu (opacité très basse, clics traversants).
  // z-index par défaut 30 : au-dessus du contenu, sous le header (z-50) et le bouton WhatsApp
  // (z-40). Sur un layout au contenu centré (ex. l'expérience), passer un z-index bas pour
  // laisser les cœurs flotter dans les marges, derrière le contenu.
  return (
    <div className="fh-root" aria-hidden style={{ zIndex }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {HEARTS.map((h, i) => (
        <span
          key={i}
          className={`fh ${h.gold ? "fh-gold" : ""}`}
          style={
            {
              left: `${h.l}%`,
              width: `${h.w}px`,
              opacity: h.o,
              animationDuration: `${h.d}s`,
              animationDelay: `${h.delay}s`,
              "--dx": `${h.dx}px`,
              "--rot": `${h.rot}deg`,
            } as React.CSSProperties & Record<string, string | number>
          }
        >
          <svg viewBox="0 0 24 24" width="100%" height="100%">
            <path d={HEART_D} fill="currentColor" />
          </svg>
        </span>
      ))}
    </div>
  );
}

const CSS = `
.fh-root{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}
.fh{position:absolute;top:0;aspect-ratio:1;color:hsl(var(--primary));will-change:transform,opacity;
  transform:translateY(108vh);animation-name:fh-rise;animation-timing-function:linear;animation-iteration-count:infinite}
.fh-gold{color:hsl(var(--gold))}
.fh svg{display:block}
@keyframes fh-rise{
  0%{transform:translateY(108vh) translateX(0) rotate(0) scale(.9)}
  100%{transform:translateY(-24vh) translateX(var(--dx)) rotate(var(--rot)) scale(1.05)}
}
@media (prefers-reduced-motion: reduce){.fh-root{display:none}}
`;
