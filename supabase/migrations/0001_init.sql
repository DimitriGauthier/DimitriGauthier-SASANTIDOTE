-- 0001_init.sql — Backend site Dimitri Gauthier (sexothérapie · TRAME · numérologie)
-- Convention: tout est stocké en UTC en base ; l'affichage/calcul se fait en Indian/Reunion (UTC+4, sans DST).
-- Sécurité: le public (clé anon) ne fait AUCUNE écriture directe. Tout passe par des Edge Functions (service-role).
-- i18n FR/EN: chaque champ de contenu a une variante `_en`. Règle d'affichage: si `_en` est vide -> fallback FR.

-- ========================= Extensions =========================
create extension if not exists pgcrypto;    -- gen_random_uuid()
create extension if not exists btree_gist;   -- contrainte d'exclusion anti-chevauchement

-- ========================= Enums =========================
create type audience_type  as enum ('homme','femme','couple','tous');
create type booking_status as enum ('hold','scheduled','completed','cancelled','no_show');
create type payment_status as enum ('created','paid','failed','refunded');
create type review_status  as enum ('invited','submitted','published','hidden');
create type article_status as enum ('draft','published');
create type question_type  as enum ('short_text','long_text','single_choice','multi_choice','scale','boolean','date');
create type message_status as enum ('new','read','archived');

-- ========================= Utilitaire updated_at =========================
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ========================= Admins & is_admin() =========================
create table app_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER => contourne la RLS de app_admins (pas de récursion de policy)
create or replace function is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from app_admins where user_id = auth.uid());
$$;

-- ========================= Paramètres (singleton) =========================
create table settings (
  id               int primary key default 1 check (id = 1),
  practitioner_name text,
  email            text,
  phone            text,
  whatsapp         text,
  address          text,
  timezone         text not null default 'Indian/Reunion',
  currency         text not null default 'EUR',   -- devise des paiements clients (La Réunion = €)
  default_locale   text not null default 'fr',    -- langue par défaut du site
  supported_locales text[] not null default '{fr,en}',
  min_notice_hours int  not null default 24,       -- délai minimum avant un créneau
  max_advance_days int  not null default 60,       -- horizon de réservation
  buffer_min       int  not null default 0,        -- battement entre deux RDV
  google_connected boolean not null default false,
  updated_at       timestamptz not null default now()
);
insert into settings (id) values (1) on conflict do nothing;

-- Vue publique = uniquement les champs non sensibles (contourne la RLS de settings)
create view public_settings as
  select practitioner_name, whatsapp, address, timezone, currency, default_locale, supported_locales
  from settings where id = 1;
grant select on public_settings to anon, authenticated;

-- ========================= Identifiants Google (OAuth) =========================
create table google_credentials (
  id            int primary key default 1 check (id = 1),
  admin_user_id uuid references auth.users(id),
  refresh_token text,      -- ⚠️ à stocker via Supabase Vault en prod
  access_token  text,
  token_expiry  timestamptz,
  calendar_id   text not null default 'primary',
  scope         text,
  connected_at  timestamptz
);
-- Aucune policy => aucun accès anon/authenticated. Seul le service-role (bypass RLS) y touche.

-- ========================= Horaires d'ouverture =========================
create table availability_rules (
  id         uuid primary key default gen_random_uuid(),
  weekday    smallint not null check (weekday between 0 and 6),  -- 0 = dimanche
  start_time time not null,
  end_time   time not null,
  is_active  boolean not null default true,
  valid_from date,
  valid_to   date,
  check (start_time < end_time)
);
-- NB: les congés = simples événements dans le Google Calendar de Dimitri (comptés "occupé").

-- ========================= Services =========================
create table services (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  slug_en       text unique,        -- URL EN dédiée (fallback: slug FR si vide)
  title         text not null,
  title_en      text,
  subtitle      text,
  subtitle_en   text,
  description   text,
  description_en text,
  audiences     audience_type[] not null default '{tous}',
  duration_min  int not null check (duration_min > 0),
  price_cents   int not null check (price_cents >= 0),
  currency      text not null default 'EUR',
  location_type text not null default 'cabinet' check (location_type in ('cabinet','visio','domicile')),
  color         text,
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger t_services_updated before update on services for each row execute function set_updated_at();

-- ========================= Problématiques (motifs de consultation) =========================
-- Le questionnaire est piloté par la PROBLÉMATIQUE (érection, désir, vaginisme, addiction…),
--   pas par le type de séance. Chaque problématique cible un ou plusieurs profils (homme/femme/couple).
create table topics (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  slug_en       text unique,
  title         text not null,
  title_en      text,
  description   text,           -- courte intro affichée avant le questionnaire
  description_en text,
  audiences     audience_type[] not null default '{tous}',  -- profils auxquels ce motif est proposé
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger t_topics_updated before update on topics for each row execute function set_updated_at();

-- ========================= Questions d'admission =========================
create table questions (
  id         uuid primary key default gen_random_uuid(),
  topic_id   uuid references topics(id) on delete cascade,    -- null = tronc commun (anamnèse), posé à tous les motifs
  audiences  audience_type[] not null default '{tous}',       -- profils concernés
  label      text not null,
  label_en   text,
  help_text  text,
  help_text_en text,
  section    text,            -- regroupement d'affichage (ex. "Fréquence et durée", "Santé")
  type       question_type not null default 'long_text',
  options    jsonb,           -- pour single_choice / multi_choice / scale — chaque option: {value, label, label_en}
  required   boolean not null default false,
  sort_order int not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);
-- Questionnaire (motif M, profil P) =
--   questions where (topic_id is null or topic_id = M)
--     and (audiences && array['tous', P]::audience_type[]) and is_active  order by section, sort_order.
--   topic_id null = tronc commun anamnèse (fiche "Suivi consultant" + questions prospects), posé à tout le monde.

-- ========================= Réservations =========================
create table bookings (
  id                uuid primary key default gen_random_uuid(),
  audience          audience_type not null,
  service_id        uuid not null references services(id),
  topic_id          uuid references topics(id),   -- problématique/motif choisi (pilote le questionnaire)
  status            booking_status not null default 'hold',
  hold_expires_at   timestamptz,
  slot_start        timestamptz not null,
  slot_end          timestamptz not null,
  timezone          text not null default 'Indian/Reunion',
  locale            text not null default 'fr' check (locale in ('fr','en')), -- langue des emails client
  client_first_name text not null,
  client_last_name  text not null,
  client_email      text not null,
  client_phone      text,
  client_note       text,
  price_cents       int not null,
  currency          text not null default 'EUR',
  token             uuid not null unique default gen_random_uuid(),  -- suivi client + lien avis
  google_event_id   text,
  google_event_link text,
  completed_at      timestamptz,
  cancelled_at      timestamptz,
  cancel_reason     text,
  reminder_sent_at  timestamptz,
  consent_rgpd      boolean not null default false,
  source            text default 'site',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (slot_end > slot_start)
);
create trigger t_bookings_updated before update on bookings for each row execute function set_updated_at();

-- Anti-chevauchement (praticien seul): aucun RDV actif ne peut chevaucher un autre.
alter table bookings add constraint bookings_no_overlap
  exclude using gist (tstzrange(slot_start, slot_end) with &&)
  where (status in ('hold','scheduled'));

-- ========================= Réponses au questionnaire (SENSIBLE) =========================
create table booking_answers (
  id                     uuid primary key default gen_random_uuid(),
  booking_id             uuid not null references bookings(id) on delete cascade,
  question_id            uuid references questions(id),
  question_label_snapshot text not null,     -- fige le libellé tel qu'affiché
  answer_text            text,
  answer_json            jsonb,
  created_at             timestamptz not null default now()
);

-- ========================= Paiements =========================
create table payments (
  id                    uuid primary key default gen_random_uuid(),
  booking_id            uuid references bookings(id) on delete set null,
  stripe_session_id     text unique,
  stripe_payment_intent text,
  amount_cents          int not null,
  currency              text not null default 'EUR',
  status                payment_status not null default 'created',
  receipt_url           text,
  raw                   jsonb,
  paid_at               timestamptz,
  refunded_at           timestamptz,
  created_at            timestamptz not null default now()
);

-- ========================= Avis =========================
create table reviews (
  id                 uuid primary key default gen_random_uuid(),
  booking_id         uuid references bookings(id) on delete set null,
  client_display_name text,
  rating             smallint check (rating between 1 and 5),
  comment            text,
  status             review_status not null default 'invited',
  invite_token       uuid not null unique default gen_random_uuid(),
  invited_at         timestamptz default now(),
  submitted_at       timestamptz,
  published_at       timestamptz,
  hidden_reason      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger t_reviews_updated before update on reviews for each row execute function set_updated_at();

-- ========================= Blog =========================
-- Règle blog EN (décidée): un article n'apparaît dans /en/blog QUE s'il est réellement traduit,
--   signalé par slug_en NOT NULL (opt-in EN). Sinon FR-only, masqué du listing anglais.
--   (Les autres contenus — services, pages légales — gardent le fallback FR si _en vide.)
create table articles (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  slug_en         text unique,        -- renseigné = article publié en EN (sinon masqué de /en/blog)
  title           text not null,
  title_en        text,
  excerpt         text,
  excerpt_en      text,
  cover_image_url text,
  body            jsonb,        -- document TipTap (FR)
  body_en         jsonb,        -- document TipTap (EN)
  body_html       text,         -- rendu HTML FR (affichage + SEO)
  body_html_en    text,         -- rendu HTML EN
  status          article_status not null default 'draft',
  published_at    timestamptz,
  seo_title       text,
  seo_title_en    text,
  seo_description text,
  seo_description_en text,
  og_image_url    text,
  tags            text[] default '{}',
  reading_minutes int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger t_articles_updated before update on articles for each row execute function set_updated_at();

-- ========================= Pages de contenu (légal) =========================
create table content_pages (
  id         uuid primary key default gen_random_uuid(),
  slug         text unique not null,   -- 'mentions-legales' | 'confidentialite' | 'cgv' ...
  slug_en      text unique,            -- URL EN dédiée (fallback: slug FR si vide)
  title        text not null,
  title_en     text,
  body_html    text,
  body_html_en text,
  updated_at   timestamptz not null default now()
);
create trigger t_content_pages_updated before update on content_pages for each row execute function set_updated_at();

-- ========================= Messages de contact =========================
create table contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  status     message_status not null default 'new',
  created_at timestamptz not null default now()
);

-- ========================= Journal des notifications =========================
create table notifications_log (
  id                  uuid primary key default gen_random_uuid(),
  booking_id          uuid references bookings(id) on delete set null,
  review_id           uuid references reviews(id) on delete set null,
  contact_id          uuid references contact_messages(id) on delete set null,
  type                text not null,       -- booking_confirmation | practitioner_new_booking | reminder_24h | review_invite | contact
  channel             text not null default 'email',
  to_email            text,
  subject             text,
  provider_message_id text,
  status              text not null default 'sent',
  error               text,
  created_at          timestamptz not null default now()
);

-- ========================= Index =========================
create index on bookings (slot_start);
create index on bookings (status);
create index on bookings (client_email);
create index on booking_answers (booking_id);
create index on payments (booking_id);
create index on reviews (status);
create index on articles (status, published_at);
create index on questions (topic_id);
create index on bookings (topic_id);

-- ========================= RLS =========================
alter table app_admins         enable row level security;
alter table settings           enable row level security;
alter table google_credentials enable row level security;
alter table availability_rules enable row level security;
alter table services           enable row level security;
alter table topics             enable row level security;
alter table questions          enable row level security;
alter table bookings           enable row level security;
alter table booking_answers    enable row level security;
alter table payments           enable row level security;
alter table reviews            enable row level security;
alter table articles           enable row level security;
alter table content_pages      enable row level security;
alter table contact_messages   enable row level security;
alter table notifications_log  enable row level security;

-- --- Lecture publique (contenus publiés uniquement) ---
create policy pub_services_read     on services          for select using (is_active);
create policy pub_topics_read       on topics            for select using (is_active);
create policy pub_questions_read    on questions         for select using (is_active);
create policy pub_reviews_read      on reviews           for select using (status = 'published');
create policy pub_articles_read     on articles          for select using (status = 'published' and (published_at is null or published_at <= now()));
create policy pub_pages_read        on content_pages     for select using (true);
create policy pub_availability_read on availability_rules for select using (is_active);

-- --- Admin: accès total sur ses tables ---
create policy adm_settings on settings           for all using (is_admin()) with check (is_admin());
create policy adm_avail    on availability_rules for all using (is_admin()) with check (is_admin());
create policy adm_services on services           for all using (is_admin()) with check (is_admin());
create policy adm_topics    on topics            for all using (is_admin()) with check (is_admin());
create policy adm_questions on questions         for all using (is_admin()) with check (is_admin());
create policy adm_bookings on bookings           for all using (is_admin()) with check (is_admin());
create policy adm_answers  on booking_answers    for all using (is_admin()) with check (is_admin());
create policy adm_payments on payments           for all using (is_admin()) with check (is_admin());
create policy adm_reviews  on reviews            for all using (is_admin()) with check (is_admin());
create policy adm_articles on articles           for all using (is_admin()) with check (is_admin());
create policy adm_pages    on content_pages      for all using (is_admin()) with check (is_admin());
create policy adm_contact  on contact_messages   for all using (is_admin()) with check (is_admin());
create policy adm_admins   on app_admins         for select using (is_admin());
create policy adm_notifs   on notifications_log  for select using (is_admin());

-- bookings / booking_answers / payments : PAS de policy anon => bloqués. Écritures via Edge Functions (service-role).
-- google_credentials / notifications_log (write) : idem, service-role uniquement.
