"use client";
// Éditeur d'article de blog avec APERÇU LIVE et insertion d'images.
// — Colonne gauche : champs + corps HTML avec barre d'outils (titre, gras, liste, image…).
// — Colonne droite : rendu en temps réel, identique à la page publique (composant Prose).
// Les images peuvent être téléversées (bucket Supabase « blog-images ») ou collées par URL ;
// si le bucket n'est pas encore créé, on retombe proprement sur l'insertion par URL.

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { pick, type Locale } from "@/lib/i18n";
import { formatDayLabel } from "@/lib/format";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Prose } from "@/components/ui";
import type { Article } from "@/lib/types";
import {
  Heading2, Heading3, Pilcrow, Bold, Italic, List, Quote, Link2, ImagePlus,
  Eye, Save, X, Settings2, Upload, Loader2,
} from "lucide-react";

type ContentLang = "fr" | "en";

type FormState = {
  title: string; title_en: string;
  slug: string; slug_en: string;
  excerpt: string; excerpt_en: string;
  body_html: string; body_html_en: string;
  cover_image_url: string;
  status: "draft" | "published";
  published_at: string;
  reading_minutes: string;
  tags: string;
  seo_title: string; seo_title_en: string;
  seo_description: string; seo_description_en: string;
};

function articleToForm(a: Article | null): FormState {
  return {
    title: a?.title ?? "", title_en: a?.title_en ?? "",
    slug: a?.slug ?? "", slug_en: a?.slug_en ?? "",
    excerpt: a?.excerpt ?? "", excerpt_en: a?.excerpt_en ?? "",
    body_html: a?.body_html ?? "", body_html_en: a?.body_html_en ?? "",
    cover_image_url: a?.cover_image_url ?? "",
    status: (a?.status as "draft" | "published") ?? "draft",
    published_at: a?.published_at ?? "",
    reading_minutes: a?.reading_minutes != null ? String(a.reading_minutes) : "",
    tags: Array.isArray(a?.tags) ? a!.tags!.join(", ") : "",
    seo_title: a?.seo_title ?? "", seo_title_en: a?.seo_title_en ?? "",
    seo_description: a?.seo_description ?? "", seo_description_en: a?.seo_description_en ?? "",
  };
}

/** Slug lisible à partir d'un titre (accents retirés, tirets). */
function slugify(s: string): string {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function BlogEditor({
  locale, article, onClose,
}: {
  locale: Locale;
  article: Article | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => articleToForm(article));
  const [clang, setClang] = useState<ContentLang>("fr");
  const [showSettings, setShowSettings] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [imgAlt, setImgAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const bodyKey = clang === "fr" ? "body_html" : "body_html_en";
  const titleKey = clang === "fr" ? "title" : "title_en";

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  // ── Insertion au curseur dans le corps HTML ──
  function wrap(before: string, after: string, placeholder: string) {
    const cur = form[bodyKey];
    const ta = bodyRef.current;
    if (!ta) {
      set({ [bodyKey]: cur + before + placeholder + after } as Partial<FormState>);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = cur.slice(start, end) || placeholder;
    const next = cur.slice(0, start) + before + sel + after + cur.slice(end);
    set({ [bodyKey]: next } as Partial<FormState>);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + before.length + sel.length + after.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function insertBlock(html: string) {
    const cur = form[bodyKey];
    const ta = bodyRef.current;
    const insert = (cur && !cur.endsWith("\n") ? "\n" : "") + html + "\n";
    if (!ta) {
      set({ [bodyKey]: cur + insert } as Partial<FormState>);
      return;
    }
    const start = ta.selectionStart;
    const next = cur.slice(0, start) + insert + cur.slice(start);
    set({ [bodyKey]: next } as Partial<FormState>);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + insert.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function insertImage(url: string, alt: string) {
    const safeUrl = url.replace(/"/g, "&quot;");
    const safeAlt = alt.replace(/"/g, "&quot;");
    const fig = safeAlt
      ? `<figure><img src="${safeUrl}" alt="${safeAlt}" /><figcaption>${alt}</figcaption></figure>`
      : `<figure><img src="${safeUrl}" alt="" /></figure>`;
    insertBlock(fig);
    setShowImage(false);
    setImgUrl("");
    setImgAlt("");
  }

  /** Téléverse un fichier vers le bucket public et renvoie l'URL, ou null si indisponible. */
  async function uploadToStorage(file: File): Promise<string | null> {
    setError(null);
    setNotice(null);
    const sb = getSupabaseBrowser();
    if (!sb) {
      setError(pick(locale, "Backend non configuré.", "Backend not configured."));
      return null;
    }
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await sb.storage
        .from("blog-images")
        .upload(path, file, { cacheControl: "31536000", upsert: false });
      if (upErr) {
        // Bucket absent ou droits manquants : bascule sur l'insertion par URL.
        setNotice(
          pick(
            locale,
            "Téléversement indisponible pour l'instant (stockage à activer). Colle plutôt l'adresse de l'image.",
            "Upload not available yet (storage to enable). Paste the image URL instead.",
          ),
        );
        return null;
      }
      return sb.storage.from("blog-images").getPublicUrl(path).data.publicUrl;
    } catch {
      setNotice(pick(locale, "Téléversement impossible. Utilise une URL d'image.", "Upload failed. Use an image URL instead."));
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function uploadFile(file: File) {
    const url = await uploadToStorage(file);
    if (url) insertImage(url, imgAlt);
  }

  async function uploadCover(file: File) {
    const url = await uploadToStorage(file);
    if (url) set({ cover_image_url: url });
  }

  async function save() {
    setBusy(true);
    setError(null);
    const sb = getSupabaseBrowser();
    if (!sb) {
      setError(pick(locale, "Backend non configuré.", "Backend not configured."));
      setBusy(false);
      return;
    }
    const publishedAt =
      form.published_at.trim() !== ""
        ? form.published_at.trim()
        : form.status === "published"
          ? new Date().toISOString()
          : null;
    const payload = {
      title: form.title.trim(),
      title_en: form.title_en.trim() || null,
      slug: form.slug.trim() || slugify(form.title),
      slug_en: form.slug_en.trim() || null,
      excerpt: form.excerpt.trim() || null,
      excerpt_en: form.excerpt_en.trim() || null,
      body_html: form.body_html || null,
      body_html_en: form.body_html_en || null,
      cover_image_url: form.cover_image_url.trim() || null,
      status: form.status,
      published_at: publishedAt,
      reading_minutes: form.reading_minutes.trim() === "" ? null : Number(form.reading_minutes),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      seo_title: form.seo_title.trim() || null,
      seo_title_en: form.seo_title_en.trim() || null,
      seo_description: form.seo_description.trim() || null,
      seo_description_en: form.seo_description_en.trim() || null,
    };
    const res = article?.id
      ? await sb.from("articles").update(payload).eq("id", article.id)
      : await sb.from("articles").insert(payload);
    setBusy(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    router.refresh();
    onClose();
  }

  // ── Aperçu live (fidèle à la page publique) ──
  const previewBody = form[bodyKey];
  const previewTitle = form[titleKey] || pick(locale, "Titre de l'article", "Article title");
  const previewDate = useMemo(() => {
    if (!form.published_at) return "";
    try { return formatDayLabel(form.published_at, clang); } catch { return ""; }
  }, [form.published_at, clang]);

  const tools: { icon: React.ReactNode; label: string; run: () => void }[] = [
    { icon: <Heading2 className="h-4 w-4" />, label: pick(locale, "Titre", "Heading"), run: () => wrap("<h2>", "</h2>", pick(locale, "Titre de section", "Section title")) },
    { icon: <Heading3 className="h-4 w-4" />, label: pick(locale, "Sous-titre", "Subheading"), run: () => wrap("<h3>", "</h3>", pick(locale, "Sous-titre", "Subheading")) },
    { icon: <Pilcrow className="h-4 w-4" />, label: pick(locale, "Paragraphe", "Paragraph"), run: () => wrap("<p>", "</p>", pick(locale, "Votre texte…", "Your text…")) },
    { icon: <Bold className="h-4 w-4" />, label: pick(locale, "Gras", "Bold"), run: () => wrap("<strong>", "</strong>", pick(locale, "texte", "text")) },
    { icon: <Italic className="h-4 w-4" />, label: pick(locale, "Italique", "Italic"), run: () => wrap("<em>", "</em>", pick(locale, "texte", "text")) },
    { icon: <List className="h-4 w-4" />, label: pick(locale, "Liste", "List"), run: () => insertBlock(`<ul>\n  <li>${pick(locale, "Premier élément", "First item")}</li>\n  <li>${pick(locale, "Deuxième élément", "Second item")}</li>\n</ul>`) },
    { icon: <Quote className="h-4 w-4" />, label: pick(locale, "Citation", "Quote"), run: () => wrap("<blockquote>", "</blockquote>", pick(locale, "Citation…", "Quote…")) },
    { icon: <Link2 className="h-4 w-4" />, label: pick(locale, "Lien", "Link"), run: () => { const u = window.prompt(pick(locale, "Adresse du lien (https://…)", "Link URL (https://…)")); if (u) wrap(`<a href="${u.replace(/"/g, "&quot;")}">`, "</a>", pick(locale, "texte du lien", "link text")); } },
    { icon: <ImagePlus className="h-4 w-4" />, label: pick(locale, "Image", "Image"), run: () => { setShowImage((v) => !v); setError(null); setNotice(null); } },
  ];

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card sm:p-6">
      {/* Barre supérieure */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-medium text-foreground">
          {article ? pick(locale, "Modifier l'article", "Edit article") : pick(locale, "Nouvel article", "New article")}
        </h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            {pick(locale, "Statut", "Status")}
            <select
              className={`${inputCls} w-auto py-1.5`}
              value={form.status}
              onChange={(e) => set({ status: e.target.value as "draft" | "published" })}
            >
              <option value="draft">{pick(locale, "Brouillon", "Draft")}</option>
              <option value="published">{pick(locale, "Publié", "Published")}</option>
            </select>
          </label>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted">
            <X className="h-4 w-4" /> {pick(locale, "Fermer", "Close")}
          </button>
          <button type="button" onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {busy ? pick(locale, "Enregistrement…", "Saving…") : pick(locale, "Enregistrer", "Save")}
          </button>
        </div>
      </div>

      {/* Onglets de langue du contenu */}
      <div className="mb-4 inline-flex rounded-full border border-border bg-background p-0.5 text-sm">
        {(["fr", "en"] as ContentLang[]).map((cl) => (
          <button
            key={cl}
            type="button"
            onClick={() => setClang(cl)}
            className={`rounded-full px-4 py-1.5 transition-colors ${clang === cl ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
          >
            {cl === "fr" ? "Français" : "English"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Colonne édition ── */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              {pick(locale, "Titre", "Title")} {clang === "en" ? "(EN)" : "(FR)"}
            </label>
            <input
              className={inputCls}
              value={form[titleKey]}
              placeholder={pick(locale, "Le titre de votre article", "Your article title")}
              onChange={(e) => {
                const v = e.target.value;
                if (clang === "fr") {
                  // Slug auto tant qu'il n'a pas été personnalisé.
                  const auto = form.slug === "" || form.slug === slugify(form.title);
                  set({ title: v, ...(auto ? { slug: slugify(v) } : {}) });
                } else {
                  set({ title_en: v });
                }
              }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              {pick(locale, "Extrait", "Excerpt")} {clang === "en" ? "(EN)" : "(FR)"}
            </label>
            <textarea
              rows={2}
              className={inputCls}
              value={clang === "fr" ? form.excerpt : form.excerpt_en}
              placeholder={pick(locale, "Résumé court affiché dans la liste des articles.", "Short summary shown in the article list.")}
              onChange={(e) => set(clang === "fr" ? { excerpt: e.target.value } : { excerpt_en: e.target.value })}
            />
          </div>

          {/* Barre d'outils du corps */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              {pick(locale, "Contenu", "Content")} {clang === "en" ? "(EN)" : "(FR)"}
            </label>
            <div className="flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-border bg-muted/50 p-1.5">
              {tools.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  title={t.label}
                  onClick={t.run}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-primary"
                >
                  {t.icon}
                </button>
              ))}
            </div>

            {/* Panneau d'insertion d'image */}
            {showImage ? (
              <div className="space-y-2 border border-b-0 border-border bg-secondary/40 p-3">
                <input
                  className={inputCls}
                  value={imgAlt}
                  placeholder={pick(locale, "Texte alternatif (description de l'image)", "Alt text (image description)")}
                  onChange={(e) => setImgAlt(e.target.value)}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {pick(locale, "Téléverser", "Upload")}
                  </button>
                  <span className="text-xs text-muted-foreground">{pick(locale, "ou", "or")}</span>
                  <input
                    className={`${inputCls} flex-1`}
                    value={imgUrl}
                    placeholder="https://…"
                    onChange={(e) => setImgUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => imgUrl.trim() && insertImage(imgUrl.trim(), imgAlt)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
                  >
                    {pick(locale, "Insérer l'URL", "Insert URL")}
                  </button>
                </div>
                {notice ? <p className="text-xs text-amber-700">{notice}</p> : null}
              </div>
            ) : null}

            <textarea
              ref={bodyRef}
              rows={16}
              className={`${inputCls} rounded-t-none font-mono text-xs leading-relaxed`}
              value={form[bodyKey]}
              placeholder={pick(locale, "Rédigez votre article… Utilisez la barre d'outils pour les titres, listes et images.", "Write your article… Use the toolbar for headings, lists and images.")}
              onChange={(e) => set({ [bodyKey]: e.target.value } as Partial<FormState>)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {pick(locale, "Astuce : sélectionnez du texte puis cliquez sur un outil pour l'appliquer.", "Tip: select text then click a tool to apply it.")}
            </p>
          </div>

          {/* Réglages avancés (repliés) */}
          <div className="rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground"
            >
              <Settings2 className="h-4 w-4 text-primary" />
              {pick(locale, "Réglages (slug, image de couverture, SEO, tags…)", "Settings (slug, cover, SEO, tags…)")}
            </button>
            {showSettings ? (
              <div className="space-y-3 border-t border-border p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Labeled label={`Slug ${clang === "en" ? "(EN)" : "(FR)"}`}>
                    <input className={inputCls} value={clang === "fr" ? form.slug : form.slug_en}
                      onChange={(e) => set(clang === "fr" ? { slug: e.target.value } : { slug_en: e.target.value })} />
                  </Labeled>
                  <Labeled label={pick(locale, "Temps de lecture (min)", "Reading time (min)")}>
                    <input type="number" className={inputCls} value={form.reading_minutes}
                      onChange={(e) => set({ reading_minutes: e.target.value })} />
                  </Labeled>
                </div>
                <Labeled label={pick(locale, "Image de couverture (URL)", "Cover image (URL)")}>
                  <div className="flex gap-2">
                    <input className={inputCls} value={form.cover_image_url} placeholder="https://…"
                      onChange={(e) => set({ cover_image_url: e.target.value })} />
                    <button type="button" onClick={() => coverRef.current?.click()} disabled={uploading}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-xs text-foreground transition-colors hover:bg-muted disabled:opacity-60">
                      {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      {pick(locale, "Téléverser", "Upload")}
                    </button>
                    <input ref={coverRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = ""; }} />
                  </div>
                </Labeled>
                <Labeled label="Tags">
                  <input className={inputCls} value={form.tags} placeholder={pick(locale, "sexualité, couple, désir", "sexuality, couple, desire")}
                    onChange={(e) => set({ tags: e.target.value })} />
                </Labeled>
                <Labeled label={pick(locale, "Date de publication (ISO, optionnel)", "Published at (ISO, optional)")}>
                  <input className={inputCls} value={form.published_at} placeholder="2026-07-25T08:00:00Z"
                    onChange={(e) => set({ published_at: e.target.value })} />
                </Labeled>
                <Labeled label={`SEO — ${pick(locale, "titre", "title")} ${clang === "en" ? "(EN)" : "(FR)"}`}>
                  <input className={inputCls} value={clang === "fr" ? form.seo_title : form.seo_title_en}
                    onChange={(e) => set(clang === "fr" ? { seo_title: e.target.value } : { seo_title_en: e.target.value })} />
                </Labeled>
                <Labeled label={`SEO — ${pick(locale, "description", "description")} ${clang === "en" ? "(EN)" : "(FR)"}`}>
                  <textarea rows={2} className={inputCls} value={clang === "fr" ? form.seo_description : form.seo_description_en}
                    onChange={(e) => set(clang === "fr" ? { seo_description: e.target.value } : { seo_description_en: e.target.value })} />
                </Labeled>
              </div>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        {/* ── Colonne aperçu live ── */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-primary">
            <Eye className="h-4 w-4" /> {pick(locale, "Aperçu en temps réel", "Live preview")}
          </div>
          <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-border bg-background p-5 sm:p-6">
            <article className="mx-auto max-w-3xl">
              <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {previewTitle}
              </h1>
              {previewDate || form.reading_minutes ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {previewDate}
                  {form.reading_minutes ? `${previewDate ? " · " : ""}${form.reading_minutes} min` : ""}
                </p>
              ) : null}
              {form.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.cover_image_url} alt="" className="mt-6 w-full rounded-2xl border border-border object-cover shadow-card" />
              ) : null}
              <div className="mt-8">
                {previewBody ? (
                  <Prose html={previewBody} />
                ) : (
                  <p className="text-muted-foreground">{pick(locale, "Le contenu apparaîtra ici au fil de votre saisie.", "Content will appear here as you type.")}</p>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
