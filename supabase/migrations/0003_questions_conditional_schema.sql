-- 0003_questions_conditional_schema.sql
-- =============================================================================
-- Questionnaire adaptatif : on ajoute de quoi masquer une question selon une
-- réponse précédente (« si célibataire → ne pas demander depuis quand en couple »).
--
--   • code    : identifiant STABLE d'une question (slug), pour qu'une condition
--               puisse la référencer sans dépendre de l'UUID (différent par env).
--   • show_if : condition d'affichage (jsonb). Formes supportées côté front :
--                 { "code": "<code_declencheur>", "in":  ["couple"] }
--                 { "code": "<code_declencheur>", "eq":  true }
--               show_if = null  → question toujours affichée (comportement actuel).
--
-- 100 % rétro-compatible : colonnes nullables, aucune donnée existante modifiée.
-- =============================================================================

begin;

alter table questions
  add column if not exists code    text,
  add column if not exists show_if jsonb;

-- Un code, s'il est renseigné, doit être unique (référencé par les conditions).
create unique index if not exists questions_code_key
  on questions (code)
  where code is not null;

comment on column questions.code is
  'Identifiant stable (slug) référencé par show_if d''autres questions.';
comment on column questions.show_if is
  'Condition d''affichage jsonb : {"code":"...","in":[...]} ou {"code":"...","eq":...}. null = toujours affichée.';

commit;
