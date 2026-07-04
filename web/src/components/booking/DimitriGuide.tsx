// Guide « Dimitri » : la mascotte + une bulle de dialogue qui accompagne l'utilisateur.
// Deux variantes : « sidebar » (colonne de gauche, desktop) et « bar » (compacte, mobile).
// Le message se ré-anime à chaque changement (key={message}) — effet « Dimitri qui parle ».

import { DimitriAvatar } from "@/components/DimitriAvatar";

export default function DimitriGuide({
  message,
  name,
  role,
  variant = "sidebar",
}: {
  message: string;
  name: string;
  role: string;
  variant?: "sidebar" | "bar";
}) {
  if (variant === "bar") {
    return (
      <div className="mb-6 flex items-center gap-3 lg:hidden">
        <DimitriAvatar size={48} className="animate-float shrink-0" />
        <div className="relative flex-1 rounded-2xl rounded-tl-sm border border-border/60 bg-card px-4 py-2.5 shadow-card">
          <p key={message} className="animate-fade-up text-sm leading-snug text-foreground">
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
          <DimitriAvatar size={108} className="animate-float" />
          <p className="mt-3 font-serif text-lg font-medium text-foreground">{name}</p>
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
