// Couche de lecture publique (RSC). Tout est défensif : si la DB n'est pas câblée,
// on renvoie des valeurs vides pour que le site s'affiche quand même.
import { getSupabaseServer } from "@/lib/supabase/server";
import type {
  PublicSettings,
  Service,
  Topic,
  Question,
  Review,
  Article,
  ContentPage,
  Audience,
} from "@/lib/types";

export async function getPublicSettings(): Promise<PublicSettings | null> {
  const sb = await getSupabaseServer();
  if (!sb) return null;
  const { data } = await sb.from("public_settings").select("*").maybeSingle();
  return (data as PublicSettings) ?? null;
}

export async function getServices(): Promise<Service[]> {
  const sb = await getSupabaseServer();
  if (!sb) return [];
  const { data } = await sb
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as Service[]) ?? [];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const sb = await getSupabaseServer();
  if (!sb) return null;
  const { data } = await sb
    .from("services")
    .select("*")
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .eq("is_active", true)
    .maybeSingle();
  return (data as Service) ?? null;
}

export async function getTopics(audience?: Audience): Promise<Topic[]> {
  const sb = await getSupabaseServer();
  if (!sb) return [];
  let q = sb.from("topics").select("*").eq("is_active", true).order("sort_order");
  if (audience) q = q.overlaps("audiences", ["tous", audience]);
  const { data } = await q;
  return (data as Topic[]) ?? [];
}

export async function getQuestions(
  topicId: string | null,
  audience: Audience,
): Promise<Question[]> {
  const sb = await getSupabaseServer();
  if (!sb) return [];
  let q = sb
    .from("questions")
    .select("*")
    .eq("is_active", true)
    .overlaps("audiences", ["tous", audience])
    .order("section")
    .order("sort_order");
  // tronc commun (topic_id null) + questions du motif choisi
  q = topicId ? q.or(`topic_id.is.null,topic_id.eq.${topicId}`) : q.is("topic_id", null);
  const { data } = await q;
  return (data as Question[]) ?? [];
}

export async function getPublishedReviews(limit = 30): Promise<Review[]> {
  const sb = await getSupabaseServer();
  if (!sb) return [];
  const { data } = await sb
    .from("reviews")
    .select("id, client_display_name, rating, comment, status, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data as Review[]) ?? [];
}

export async function getPublishedArticles(locale: "fr" | "en"): Promise<Article[]> {
  const sb = await getSupabaseServer();
  if (!sb) return [];
  let q = sb
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  // En EN, on ne liste que les articles réellement traduits (slug_en non nul).
  if (locale === "en") q = q.not("slug_en", "is", null);
  const { data } = await q;
  return (data as Article[]) ?? [];
}

export async function getArticleBySlug(
  slug: string,
  locale: "fr" | "en",
): Promise<Article | null> {
  const sb = await getSupabaseServer();
  if (!sb) return null;
  const col = locale === "en" ? "slug_en" : "slug";
  const { data } = await sb
    .from("articles")
    .select("*")
    .eq(col, slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as Article) ?? null;
}

/** Toutes les données nécessaires au tunnel de réservation, en une passe.
 *  Les questions/topics sont filtrés côté client selon le profil et le motif choisis. */
export async function getIntakeData(): Promise<{
  services: Service[];
  topics: Topic[];
  questions: Question[];
}> {
  const sb = await getSupabaseServer();
  if (!sb) return { services: [], topics: [], questions: [] };
  const [servicesRes, topicsRes, questionsRes] = await Promise.all([
    sb.from("services").select("*").eq("is_active", true).order("sort_order"),
    sb.from("topics").select("*").eq("is_active", true).order("sort_order"),
    sb.from("questions").select("*").eq("is_active", true).order("section").order("sort_order"),
  ]);
  return {
    services: (servicesRes.data as Service[]) ?? [],
    topics: (topicsRes.data as Topic[]) ?? [],
    questions: (questionsRes.data as Question[]) ?? [],
  };
}

export async function getContentPage(slug: string): Promise<ContentPage | null> {
  const sb = await getSupabaseServer();
  if (!sb) return null;
  const { data } = await sb
    .from("content_pages")
    .select("*")
    .or(`slug.eq.${slug},slug_en.eq.${slug}`)
    .maybeSingle();
  return (data as ContentPage) ?? null;
}
