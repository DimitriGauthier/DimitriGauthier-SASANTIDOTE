"use client";
// Bouton d'impression → PDF. Utilise la boîte d'impression native du navigateur
// (« Enregistrer en PDF »), sans dépendance. La mise en page @media print de la
// fiche masque le reste de l'admin pour ne sortir que le contenu clinique.
import { Printer } from "lucide-react";

export default function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 active:scale-95 print:hidden"
    >
      <Printer className="h-4 w-4" /> {label}
    </button>
  );
}
