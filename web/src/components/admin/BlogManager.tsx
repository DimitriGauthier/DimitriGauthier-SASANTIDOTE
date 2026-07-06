"use client";
// Gestion des articles de blog : liste + création/édition via l'éditeur à aperçu live.
// La suppression et le rafraîchissement passent par le client navigateur (RLS is_admin()).

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { pick, type Locale } from "@/lib/i18n";
import { href } from "@/lib/site";
import { formatDayLabel } from "@/lib/format";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Article } from "@/lib/types";
import BlogEditor from "@/components/admin/BlogEditor";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

export default function BlogManager({ locale, articles }: { locale: Locale; articles: Article[] }) {
  const router = useRouter();
  // null = liste ; undefined = nouvel article ; Article = édition.
  const [editing, setEditing] = useState<Article | null | undefined>(null);

  async function remove(a: Article) {
    if (!confirm(pick(locale, `Supprimer « ${a.title} » ?`, `Delete “${a.title}”?`))) return;
    const sb = getSupabaseBrowser();
    await sb?.from("articles").delete().eq("id", a.id);
    router.refresh();
  }

  if (editing !== null) {
    return (
      <BlogEditor
        locale={locale}
        article={editing ?? null}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setEditing(undefined)}
        className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5"
      >
        <Plus className="h-4 w-4" /> {pick(locale, "Nouvel article", "New article")}
      </button>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-border/60 bg-card px-4 py-6 text-sm text-muted-foreground">
          {pick(locale, "Aucun article pour l'instant.", "No articles yet.")}
        </p>
      ) : (
        <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card">
          {articles.map((a) => {
            const published = a.status === "published";
            return (
              <div key={a.id} className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{a.title}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {published ? pick(locale, "Publié", "Published") : pick(locale, "Brouillon", "Draft")}
                    </span>
                    {a.title_en ? <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-primary">EN</span> : null}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    /{a.slug}
                    {a.published_at ? ` · ${formatDayLabel(a.published_at, locale)}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {published ? (
                    <Link
                      href={href(locale, `blog/${a.slug}`)}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> {pick(locale, "Voir", "View")}
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setEditing(a)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
                  >
                    <Pencil className="h-3.5 w-3.5" /> {pick(locale, "Modifier", "Edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(a)}
                    className="inline-flex items-center gap-1 rounded-full border border-destructive/30 px-3 py-1.5 text-xs text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {pick(locale, "Supprimer", "Delete")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
