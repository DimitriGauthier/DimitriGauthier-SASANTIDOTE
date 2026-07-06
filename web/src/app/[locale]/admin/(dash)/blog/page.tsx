// Admin — gestion des articles de blog avec éditeur à aperçu live et insertion d'images.
import { isLocale, type Locale, pick } from "@/lib/i18n";
import { requireAdmin } from "@/lib/admin";
import BlogManager from "@/components/admin/BlogManager";
import type { Article } from "@/lib/types";

export default async function AdminBlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "fr";
  const { sb } = await requireAdmin(l);
  const { data } = await sb.from("articles").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-medium text-foreground">{pick(l, "Blog", "Blog")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {pick(
          l,
          "Rédigez avec l'aperçu en temps réel à droite. Un article n'apparaît en anglais que si son titre, son slug et son contenu EN sont renseignés.",
          "Write with the live preview on the right. An article appears in English only if its EN title, slug and content are filled in.",
        )}
      </p>
      <BlogManager locale={l} articles={(data as Article[]) ?? []} />
    </div>
  );
}
