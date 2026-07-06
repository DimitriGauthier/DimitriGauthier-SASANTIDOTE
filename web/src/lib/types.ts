// Types DB — reflètent supabase/migrations/0001_init.sql (variantes _en pour l'i18n).

export type Audience = "homme" | "femme" | "couple" | "tous";
export type BookingStatus = "hold" | "scheduled" | "completed" | "cancelled" | "no_show";
export type PaymentStatus = "created" | "paid" | "failed" | "refunded";
export type ReviewStatus = "invited" | "submitted" | "published" | "hidden";
export type ArticleStatus = "draft" | "published";
export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multi_choice"
  | "scale"
  | "boolean"
  | "date";
export type MessageStatus = "new" | "read" | "archived";
export type LocationType = "cabinet" | "visio" | "domicile";

export interface PublicSettings {
  practitioner_name: string | null;
  whatsapp: string | null;
  address: string | null;
  timezone: string;
  currency: string;
  default_locale: string;
  supported_locales: string[];
}

export interface Service {
  id: string;
  slug: string;
  slug_en: string | null;
  title: string;
  title_en: string | null;
  subtitle: string | null;
  subtitle_en: string | null;
  description: string | null;
  description_en: string | null;
  audiences: Audience[];
  duration_min: number;
  price_cents: number;
  currency: string;
  location_type: LocationType;
  color: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Topic {
  id: string;
  slug: string;
  slug_en: string | null;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  audiences: Audience[];
  is_active: boolean;
  sort_order: number;
}

export interface QuestionOption {
  value: string;
  label: string;
  label_en?: string | null;
}

export interface Question {
  id: string;
  topic_id: string | null;
  audiences: Audience[];
  label: string;
  label_en: string | null;
  help_text: string | null;
  help_text_en: string | null;
  section: string | null;
  type: QuestionType;
  options: QuestionOption[] | null;
  required: boolean;
  sort_order: number;
  is_active: boolean;
  // Questionnaire adaptatif (voir migrations 0003 / 0005) :
  //  • code    : identifiant stable (slug) référencé par le show_if d'autres questions.
  //  • show_if : condition d'affichage. null = toujours affichée.
  code: string | null;
  show_if: QuestionCondition | null;
}

// Condition d'affichage d'une question, évaluée contre la réponse d'une autre
// question identifiée par son `code`. Formes supportées :
//   { code: "affective_status", in: ["couple"] }  → visible si la réponse ∈ liste
//   { code: "prior_support",     eq: true }        → visible si la réponse === valeur
export interface QuestionCondition {
  code: string;
  in?: unknown[];
  eq?: unknown;
}

export interface Review {
  id: string;
  client_display_name: string | null;
  rating: number | null;
  comment: string | null;
  status: ReviewStatus;
  published_at: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  slug: string;
  slug_en: string | null;
  title: string;
  title_en: string | null;
  excerpt: string | null;
  excerpt_en: string | null;
  cover_image_url: string | null;
  body_html: string | null;
  body_html_en: string | null;
  status: ArticleStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_title_en: string | null;
  seo_description: string | null;
  seo_description_en: string | null;
  og_image_url: string | null;
  tags: string[] | null;
  reading_minutes: number | null;
}

export interface ContentPage {
  id: string;
  slug: string;
  slug_en: string | null;
  title: string;
  title_en: string | null;
  body_html: string | null;
  body_html_en: string | null;
  updated_at: string;
}

export interface Booking {
  id: string;
  audience: Audience;
  service_id: string;
  topic_id: string | null;
  status: BookingStatus;
  slot_start: string;
  slot_end: string;
  timezone: string;
  locale: "fr" | "en";
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_phone: string | null;
  client_note: string | null;
  price_cents: number;
  currency: string;
  token: string;
  google_event_link: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string | null;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  receipt_url: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: MessageStatus;
  created_at: string;
}

// Réponse de l'Edge Function get-slots
export interface Slot {
  start: string;
  end: string;
}
export interface GetSlotsResponse {
  service: {
    id: string;
    title: string;
    title_en: string | null;
    duration_min: number;
    price_cents: number;
    currency: string;
  };
  timezone: string;
  slots: Slot[];
}

// Payload create-hold
export interface CreateHoldPayload {
  service_id: string;
  topic_id?: string | null;
  audience?: Audience;
  slot_start: string;
  client: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    note?: string;
  };
  answers?: { question_id?: string | null; label: string; value: unknown }[];
  consent_rgpd: boolean;
  locale: "fr" | "en";
}
export interface CreateHoldResponse {
  checkout_url: string;
  booking_token: string;
  hold_expires_at: string;
}
