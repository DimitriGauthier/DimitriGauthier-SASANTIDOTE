// Avatars illustrés (SVG inline, aucun asset externe) pour l'étape « Pour qui ? » du tunnel INTIMY.
// Trois profils : homme · femme · couple. Palette chaude accordée au thème (skin #e7b48f, cheveux #3f2d22,
// terracotta = hsl(var(--primary))). Petites animations SMIL douces (clignements, respiration, cœur qui bat)
// pour donner vie au questionnaire sans dépendre de JS. Cohérent avec DimitriAvatar.tsx.

type AvatarProps = {
  size?: number;
  active?: boolean;
  className?: string;
};

// Peaux et traits partagés
const SKIN = "#e7b48f";
const SKIN_SHADOW = "#d89e73";
const HAIR = "#3f2d22";
const HAIR_WARM = "#4a3326";
const SMILE = "#8a4b38";

/** Clignement d'œil discret (ré-ouvre l'œil ~toutes les 4-5 s). */
function Blink({ dur = "4.6s" }: { dur?: string }) {
  return (
    <animate
      attributeName="ry"
      dur={dur}
      repeatCount="indefinite"
      keyTimes="0;0.62;0.9;0.93;0.96;1"
      values="2.8;2.8;2.8;0.4;2.8;2.8"
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Homme
// ─────────────────────────────────────────────────────────────
export function HommeAvatar({ size = 84, active = false, className = "" }: AvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Homme"
      className={className}
    >
      <defs>
        <clipPath id="av-homme-clip">
          <circle cx="60" cy="60" r="58" />
        </clipPath>
      </defs>

      <g clipPath="url(#av-homme-clip)">
        <rect x="0" y="0" width="120" height="120" fill="hsl(var(--secondary))" />

        {/* Respiration très légère de l'ensemble buste + tête */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            dur="5s"
            repeatCount="indefinite"
            values="0 0; 0 -1.1; 0 0"
          />

          {/* Buste / épaules */}
          <path d="M12 120 C12 93 33 83 60 83 C87 83 108 93 108 120 Z" fill="hsl(var(--deep))" />
          {/* Col en V */}
          <path d="M50 84 C54 95 66 95 70 84 L70 93 C64 100 56 100 50 93 Z" fill="#000" opacity="0.12" />

          {/* Cou */}
          <rect x="52" y="70" width="16" height="20" rx="8" fill={SKIN_SHADOW} />
          {/* Oreilles */}
          <circle cx="37" cy="56" r="5" fill={SKIN} />
          <circle cx="83" cy="56" r="5" fill={SKIN} />
          {/* Tête */}
          <ellipse cx="60" cy="53" rx="24" ry="27" fill={SKIN} />

          {/* Barbe / voile de barbe */}
          <path
            d="M37 55 C37 76 49 84 60 84 C71 84 83 76 83 55 C83 70 72 76 60 76 C48 76 37 70 37 55 Z"
            fill={HAIR}
            opacity="0.16"
          />

          {/* Cheveux courts */}
          <path
            d="M35 54 C33 30 49 20 60 20 C71 20 88 30 85 54 C81 43 73 38 60 38 C47 38 39 43 35 54 Z"
            fill={HAIR}
          />

          {/* Sourcils */}
          <path d="M45 47 C48 45 53 45 56 47" fill="none" stroke={HAIR} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M64 47 C67 45 72 45 75 47" fill="none" stroke={HAIR} strokeWidth="2.6" strokeLinecap="round" />

          {/* Yeux (clignement) */}
          <ellipse cx="51" cy="53" rx="2.8" ry="2.8" fill={HAIR}>
            <Blink />
          </ellipse>
          <ellipse cx="69" cy="53" rx="2.8" ry="2.8" fill={HAIR}>
            <Blink />
          </ellipse>

          {/* Nez */}
          <path d="M60 55 C59 59 58 61 56.5 62.5" fill="none" stroke={SKIN_SHADOW} strokeWidth="2" strokeLinecap="round" />
          {/* Sourire */}
          <path d="M50 65 C55 71 65 71 70 65" fill="none" stroke={SMILE} strokeWidth="2.6" strokeLinecap="round" />
        </g>
      </g>

      <circle
        cx="60"
        cy="60"
        r="58"
        fill="none"
        stroke={active ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.22)"}
        strokeWidth={active ? "3" : "2"}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Femme
// ─────────────────────────────────────────────────────────────
export function FemmeAvatar({ size = 84, active = false, className = "" }: AvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Femme"
      className={className}
    >
      <defs>
        <clipPath id="av-femme-clip">
          <circle cx="60" cy="60" r="58" />
        </clipPath>
      </defs>

      <g clipPath="url(#av-femme-clip)">
        <rect x="0" y="0" width="120" height="120" fill="hsl(var(--secondary))" />

        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            dur="5.4s"
            repeatCount="indefinite"
            values="0 0; 0 -1.1; 0 0"
          />

          {/* Buste / épaules (terracotta) */}
          <path d="M12 120 C12 93 33 83 60 83 C87 83 108 93 108 120 Z" fill="hsl(var(--primary))" />
          {/* Encolure */}
          <path d="M48 84 C54 96 66 96 72 84 L72 92 C64 99 56 99 48 92 Z" fill="hsl(var(--deep))" opacity="0.28" />

          {/* Cou */}
          <rect x="52" y="70" width="16" height="20" rx="8" fill={SKIN_SHADOW} />

          {/* Cheveux longs (arrière, encadrent le visage jusqu'aux épaules) */}
          <path
            d="M31 54 C29 28 45 17 60 17 C75 17 91 28 89 54 C92 74 88 96 84 104 L74 104 C80 84 79 66 76 57 C72 45 68 40 60 40 C52 40 48 45 44 57 C41 66 40 84 46 104 L36 104 C32 96 28 74 31 54 Z"
            fill={HAIR_WARM}
          />

          {/* Oreilles */}
          <circle cx="37" cy="56" r="4.5" fill={SKIN} />
          <circle cx="83" cy="56" r="4.5" fill={SKIN} />
          {/* Boucles d'oreille (or) */}
          <circle cx="37" cy="63" r="2.2" fill="hsl(var(--gold))" />
          <circle cx="83" cy="63" r="2.2" fill="hsl(var(--gold))" />

          {/* Tête */}
          <ellipse cx="60" cy="53" rx="23" ry="26.5" fill={SKIN} />

          {/* Frange / mèches avant */}
          <path
            d="M37 52 C36 32 48 22 60 22 C72 22 84 32 83 52 C79 42 72 39 66 40 C70 44 71 49 70 52 C66 44 58 43 52 46 C50 49 49 51 48 53 C46 47 42 46 37 52 Z"
            fill={HAIR_WARM}
          />

          {/* Sourcils */}
          <path d="M46 48 C49 46 53 46 56 48" fill="none" stroke={HAIR} strokeWidth="2.3" strokeLinecap="round" />
          <path d="M64 48 C67 46 71 46 74 48" fill="none" stroke={HAIR} strokeWidth="2.3" strokeLinecap="round" />

          {/* Yeux (clignement) */}
          <ellipse cx="51" cy="54" rx="2.8" ry="2.8" fill={HAIR}>
            <Blink dur="5.1s" />
          </ellipse>
          <ellipse cx="69" cy="54" rx="2.8" ry="2.8" fill={HAIR}>
            <Blink dur="5.1s" />
          </ellipse>

          {/* Joues rosées */}
          <circle cx="47" cy="60" r="3.4" fill="hsl(var(--primary) / 0.22)" />
          <circle cx="73" cy="60" r="3.4" fill="hsl(var(--primary) / 0.22)" />

          {/* Nez */}
          <path d="M60 56 C59.5 59 59 60.5 58 61.5" fill="none" stroke={SKIN_SHADOW} strokeWidth="1.8" strokeLinecap="round" />
          {/* Sourire */}
          <path d="M51 65 C56 71 64 71 69 65" fill="none" stroke={SMILE} strokeWidth="2.6" strokeLinecap="round" />
        </g>
      </g>

      <circle
        cx="60"
        cy="60"
        r="58"
        fill="none"
        stroke={active ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.22)"}
        strokeWidth={active ? "3" : "2"}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Couple (deux visages + un cœur qui bat)
// ─────────────────────────────────────────────────────────────
export function CoupleAvatar({ size = 84, active = false, className = "" }: AvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Couple"
      className={className}
    >
      <defs>
        <clipPath id="av-couple-clip">
          <circle cx="60" cy="60" r="58" />
        </clipPath>
      </defs>

      <g clipPath="url(#av-couple-clip)">
        <rect x="0" y="0" width="120" height="120" fill="hsl(var(--secondary))" />

        {/* Buste de gauche (femme) */}
        <path d="M2 120 C2 98 18 89 40 89 C62 89 78 98 78 120 Z" fill="hsl(var(--primary))" />
        {/* Buste de droite (homme) */}
        <path d="M44 120 C44 100 60 92 80 92 C100 92 116 100 116 120 Z" fill="hsl(var(--deep))" />

        {/* ---- Personne de gauche (femme) ---- */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            dur="5.2s"
            repeatCount="indefinite"
            values="0 0; 0 -1; 0 0"
          />
          {/* Cheveux longs */}
          <path
            d="M20 58 C19 39 30 30 42 30 C54 30 65 39 64 58 C66 72 63 88 60 94 L52 94 C56 80 55 68 53 62 C50 53 47 50 42 50 C37 50 34 53 31 62 C29 68 28 80 32 94 L24 94 C21 88 18 72 20 58 Z"
            fill={HAIR_WARM}
          />
          <rect x="36" y="60" width="12" height="15" rx="6" fill={SKIN_SHADOW} />
          <ellipse cx="42" cy="46" rx="17" ry="19" fill={SKIN} />
          {/* Frange */}
          <path d="M26 46 C25 32 34 25 42 25 C50 25 59 32 58 46 C55 38 49 36 42 36 C35 36 29 38 26 46 Z" fill={HAIR_WARM} />
          {/* Yeux */}
          <ellipse cx="36" cy="47" rx="2.4" ry="2.4" fill={HAIR}>
            <animate attributeName="ry" dur="4.8s" repeatCount="indefinite" keyTimes="0;0.62;0.9;0.93;0.96;1" values="2.4;2.4;2.4;0.35;2.4;2.4" />
          </ellipse>
          <ellipse cx="48" cy="47" rx="2.4" ry="2.4" fill={HAIR}>
            <animate attributeName="ry" dur="4.8s" repeatCount="indefinite" keyTimes="0;0.62;0.9;0.93;0.96;1" values="2.4;2.4;2.4;0.35;2.4;2.4" />
          </ellipse>
          {/* Joues */}
          <circle cx="33" cy="52" r="2.6" fill="hsl(var(--primary) / 0.22)" />
          <circle cx="51" cy="52" r="2.6" fill="hsl(var(--primary) / 0.22)" />
          {/* Sourire */}
          <path d="M36 55 C39 59 45 59 48 55" fill="none" stroke={SMILE} strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* ---- Personne de droite (homme) ---- */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            dur="5.7s"
            repeatCount="indefinite"
            values="0 0; 0 -1; 0 0"
          />
          <rect x="72" y="62" width="12" height="16" rx="6" fill={SKIN_SHADOW} />
          <ellipse cx="78" cy="48" rx="18" ry="20" fill={SKIN} />
          {/* Barbe légère */}
          <path d="M61 49 C61 64 69 70 78 70 C87 70 95 64 95 49 C95 60 87 64 78 64 C69 64 61 60 61 49 Z" fill={HAIR} opacity="0.15" />
          {/* Cheveux courts */}
          <path d="M60 49 C58 30 69 22 78 22 C87 22 98 30 96 49 C93 39 87 35 78 35 C69 35 63 39 60 49 Z" fill={HAIR} />
          {/* Yeux */}
          <ellipse cx="72" cy="49" rx="2.5" ry="2.5" fill={HAIR}>
            <animate attributeName="ry" dur="5.5s" repeatCount="indefinite" keyTimes="0;0.62;0.9;0.93;0.96;1" values="2.5;2.5;2.5;0.35;2.5;2.5" />
          </ellipse>
          <ellipse cx="84" cy="49" rx="2.5" ry="2.5" fill={HAIR}>
            <animate attributeName="ry" dur="5.5s" repeatCount="indefinite" keyTimes="0;0.62;0.9;0.93;0.96;1" values="2.5;2.5;2.5;0.35;2.5;2.5" />
          </ellipse>
          {/* Sourire */}
          <path d="M72 57 C75 61 81 61 84 57" fill="none" stroke={SMILE} strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* Cœur qui bat entre les deux */}
        <g transform="translate(60 30)">
          <g>
            <animateTransform
              attributeName="transform"
              type="scale"
              dur="1.7s"
              repeatCount="indefinite"
              values="0.85;1.12;0.85"
              keyTimes="0;0.4;1"
            />
            <path
              d="M0 5 C0 5 -6 1 -6 -2.6 C-6 -5.2 -3.8 -6.2 -2.2 -5.2 C-1.2 -4.6 -0.5 -3.6 0 -2.6 C0.5 -3.6 1.2 -4.6 2.2 -5.2 C3.8 -6.2 6 -5.2 6 -2.6 C6 1 0 5 0 5 Z"
              fill="hsl(var(--primary))"
            />
          </g>
        </g>
      </g>

      <circle
        cx="60"
        cy="60"
        r="58"
        fill="none"
        stroke={active ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.22)"}
        strokeWidth={active ? "3" : "2"}
      />
    </svg>
  );
}
