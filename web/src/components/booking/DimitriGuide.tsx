// Guide « Dimitri » : la mascotte + une bulle de dialogue qui accompagne l'utilisateur.
// Deux variantes : « sidebar » (colonne de gauche, desktop) et « bar » (compacte, mobile).
// Le message se ré-anime à chaque changement (key={message}) — effet « Dimitri qui parle ».
//
// Personnalisation : dès qu'on connaît le profil (homme / femme / couple), un mini avatar
// du prospect apparaît « connecté » à Dimitri, avec un petit cœur au point de rencontre.
// Le prénom, une fois saisi, remplace le « toi / vous » sous les deux visages.

import { Heart } from "lucide-react";
import { DimitriAvatar } from "@/components/DimitriAvatar";
import { HommeAvatar, FemmeAvatar, CoupleAvatar } from "@/components/booking/ProfileAvatars";
import type { Audience } from "@/lib/types";

const PROSPECT_AVATAR = { homme: HommeAvatar, femme: FemmeAvatar, couple: CoupleAvatar } as const;

function prospectAvatarFor(audience?: Audience | null) {
  if (audience && audience in PROSPECT_AVATAR) {
    return PROSPECT_AVATAR[audience as keyof typeof PROSPECT_AVATAR];
  }
  return null;
}

/** Petit cœur « de connexion » posé entre les deux avatars. */
function LinkHeart({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center rounded-full border border-border/60 bg-card shadow-card ${className}`}
    >
      <Heart className="fill-primary text-primary" style={{ width: "58%", height: "58%" }} />
    </span>
  );
}

export default function DimitriGuide({
  message,
  name,
  role,
  variant = "sidebar",
  audience,
  companion,
  hideAvatar = false,
}: {
  message: string;
  name: string;
  role: string;
  variant?: "sidebar" | "bar";
  audience?: Audience | null;
  companion?: string;
  hideAvatar?: boolean;
}) {
  // Pendant le vol « FLIP » (depuis l'accueil), on masque l'avatar réel tout en gardant sa place.
  const targetStyle = hideAvatar ? { visibility: "hidden" as const } : undefined;
  const ProspectAvatar = prospectAvatarFor(audience);
  const paired = Boolean(ProspectAvatar);
  const duoName = paired && companion ? `${name} & ${companion}` : name;

  if (variant === "bar") {
    // Mobile : on empile le guide pour que les DEUX avatars et les DEUX prénoms
    // soient bien lisibles (centrés, en toutes lettres), puis la bulle pleine largeur.
    return (
      <div className="mb-5 lg:hidden">
        <div className="flex flex-col items-center text-center">
          {ProspectAvatar ? (
            <div className="relative flex items-end justify-center">
              <span data-dimitri-target className="inline-flex" style={targetStyle}>
                <DimitriAvatar size={60} className="animate-float" />
              </span>
              <div className="-ml-3">
                <ProspectAvatar size={50} active className="animate-float" />
              </div>
              <LinkHeart className="absolute left-1/2 top-1 h-6 w-6 -translate-x-1/2" />
            </div>
          ) : (
            <span data-dimitri-target className="inline-flex" style={targetStyle}>
              <DimitriAvatar size={64} className="animate-float" />
            </span>
          )}
          <p className="mt-1.5 font-serif text-[15px] font-medium leading-tight text-foreground [overflow-wrap:anywhere]">
            {duoName}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary">{role}</p>
        </div>
        <div className="relative mt-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-card">
          <span
            aria-hidden
            className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-border/60 bg-card"
          />
          <p key={message} className="animate-fade-up relative text-[0.95rem] leading-snug text-foreground [overflow-wrap:anywhere]">
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28">
        <div className="flex flex-col items-center text-center">
          {ProspectAvatar ? (
            <div className="relative flex items-end justify-center">
              <span data-dimitri-target className="inline-flex" style={targetStyle}>
                <DimitriAvatar size={92} className="animate-float" />
              </span>
              <div className="-ml-4">
                <ProspectAvatar size={64} active className="animate-float" />
              </div>
              <LinkHeart className="absolute left-1/2 top-3 h-7 w-7 -translate-x-1/2" />
            </div>
          ) : (
            <span data-dimitri-target className="inline-flex" style={targetStyle}>
              <DimitriAvatar size={108} className="animate-float" />
            </span>
          )}
          <p className="mt-3 font-serif text-lg font-medium text-foreground">{duoName}</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">{role}</p>
        </div>
        <div className="relative mt-6 rounded-2xl border border-border/60 bg-card p-4 shadow-card">
          <span
            aria-hidden
            className="absolute -top-2 left-9 h-4 w-4 rotate-45 border-l border-t border-border/60 bg-card"
          />
          <p key={message} className="animate-fade-up relative text-sm leading-relaxed text-foreground">
            {message}
          </p>
        </div>
      </div>
    </aside>
  );
}
