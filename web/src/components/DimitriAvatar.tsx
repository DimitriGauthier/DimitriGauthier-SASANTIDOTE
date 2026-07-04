// Petite mascotte illustrée à l'effigie de Dimitri (SVG inline, aucun asset externe).
// Palette chaude accordée au thème : buste terracotta (primary), fond secondary.
// Sert de « guide » qui accompagne l'utilisateur tout au long du parcours de réservation.

export function DimitriAvatar({
  size = 96,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Dimitri"
      className={className}
    >
      <defs>
        <clipPath id="dg-avatar-clip">
          <circle cx="60" cy="60" r="58" />
        </clipPath>
      </defs>

      <g clipPath="url(#dg-avatar-clip)">
        {/* Fond */}
        <rect x="0" y="0" width="120" height="120" fill="hsl(var(--secondary))" />

        {/* Buste / épaules */}
        <path d="M16 120 C16 95 35 85 60 85 C85 85 104 95 104 120 Z" fill="hsl(var(--primary))" />
        {/* Col en V, ton plus sombre */}
        <path d="M50 86 C54 96 66 96 70 86 L70 94 C64 101 56 101 50 94 Z" fill="hsl(var(--deep))" opacity="0.35" />

        {/* Cou */}
        <rect x="52" y="70" width="16" height="20" rx="8" fill="#d89e73" />
        {/* Oreilles */}
        <circle cx="37" cy="56" r="5" fill="#e7b48f" />
        <circle cx="83" cy="56" r="5" fill="#e7b48f" />

        {/* Tête */}
        <ellipse cx="60" cy="53" rx="24" ry="27" fill="#e7b48f" />

        {/* Barbe courte (léger voile) */}
        <path
          d="M37 55 C37 76 49 84 60 84 C71 84 83 76 83 55 C83 70 72 75 60 75 C48 75 37 70 37 55 Z"
          fill="#3f2d22"
          opacity="0.18"
        />

        {/* Cheveux */}
        <path
          d="M35 55 C33 31 48 21 60 21 C72 21 87 31 85 55 C80 44 72 39 60 39 C48 39 40 44 35 55 Z"
          fill="#3f2d22"
        />

        {/* Sourcils */}
        <path d="M45 47 C48 45 53 45 56 47" fill="none" stroke="#3f2d22" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M64 47 C67 45 72 45 75 47" fill="none" stroke="#3f2d22" strokeWidth="2.6" strokeLinecap="round" />

        {/* Yeux */}
        <circle cx="51" cy="53" r="2.7" fill="#3f2d22" />
        <circle cx="69" cy="53" r="2.7" fill="#3f2d22" />
        <circle cx="52" cy="52.1" r="0.9" fill="#fff" opacity="0.9" />
        <circle cx="70" cy="52.1" r="0.9" fill="#fff" opacity="0.9" />

        {/* Nez (ombre douce) */}
        <path d="M60 55 C59 59 58 61 56.5 62.5" fill="none" stroke="#d89e73" strokeWidth="2" strokeLinecap="round" />

        {/* Sourire bienveillant */}
        <path d="M50 65 C55 71 65 71 70 65" fill="none" stroke="#8a4b38" strokeWidth="2.6" strokeLinecap="round" />
      </g>

      {/* Anneau */}
      <circle cx="60" cy="60" r="58" fill="none" stroke="hsl(var(--primary) / 0.25)" strokeWidth="2" />
    </svg>
  );
}
