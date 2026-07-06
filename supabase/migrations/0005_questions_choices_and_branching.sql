-- 0005_questions_choices_and_branching.sql
-- =============================================================================
-- 1) (B, version minimale) Deux questions oui/non → choix cliquables nuancés :
--       • « Est-ce à chaque rapport ? »        (érection, éjac. précoce, éjac. tardive)
--       • « Avez-vous des érections matinales ? » (érection)
-- 2) (C) Questionnaire adaptatif : on pose un `code` sur 3 déclencheurs et un
--    `show_if` sur les 3 questions de suivi qui n'ont de sens que selon la réponse.
--
-- ⚠️ Sécurité prod : on ne convertit / ne modifie QUE des questions actives SANS
-- réponse déjà enregistrée (booking_answers). Sinon on laisse tel quel (aucune
-- perte d'historique). Idempotent.
-- =============================================================================

begin;

-- ── 1) Conversions oui/non → single_choice (B minimal) ───────────────────────

-- « Est-ce à chaque rapport ? »
update questions q
set type = 'single_choice',
    options = $J$[
      {"value":"toujours","label":"À chaque fois","label_en":"Every time"},
      {"value":"souvent","label":"Souvent","label_en":"Often"},
      {"value":"parfois","label":"De temps en temps","label_en":"From time to time"},
      {"value":"rarement","label":"Rarement","label_en":"Rarely"}
    ]$J$::jsonb
where q.label = $Q$Est-ce à chaque rapport ?$Q$
  and q.is_active
  and q.type = 'boolean'
  and not exists (select 1 from booking_answers ba where ba.question_id = q.id);

-- « Avez-vous des érections matinales ? »
update questions q
set type = 'single_choice',
    options = $J$[
      {"value":"regulier","label":"Oui, régulièrement","label_en":"Yes, regularly"},
      {"value":"parfois","label":"Parfois","label_en":"Sometimes"},
      {"value":"rarement","label":"Rarement","label_en":"Rarely"},
      {"value":"jamais","label":"Jamais","label_en":"Never"}
    ]$J$::jsonb
where q.label = $Q$Avez-vous des érections matinales ?$Q$
  and q.is_active
  and q.type = 'boolean'
  and not exists (select 1 from booking_answers ba where ba.question_id = q.id);

-- ── 2) Déclencheurs : identifiant stable (code) ──────────────────────────────
update questions set code = 'affective_status'
where label = $Q$Situation affective$Q$ and is_active;

update questions set code = 'prior_support'
where label = $Q$Vous êtes-vous déjà fait accompagner pour cela ?$Q$ and is_active;

update questions set code = 'prior_therapy'
where label = $Q$Avez-vous déjà consulté un(e) sexothérapeute / thérapeute ?$Q$ and is_active;

-- ── 3) Suivi : ne s'affiche que selon la réponse au déclencheur ───────────────
-- « Depuis combien de temps en couple ? » → seulement si Situation affective = En couple
update questions set show_if = '{"code":"affective_status","in":["couple"]}'::jsonb
where label = $Q$Si en couple : depuis combien de temps ? (et prénom du partenaire)$Q$ and is_active;

-- « Si oui, comment cela s'est-il passé ? » → seulement si « déjà accompagné » = Oui
update questions set show_if = '{"code":"prior_support","eq":true}'::jsonb
where label = $Q$Si oui, comment cela s'est-il passé ?$Q$ and is_active;

-- « Si oui, avec qui… » → seulement si « déjà consulté » = Oui
update questions set show_if = '{"code":"prior_therapy","eq":true}'::jsonb
where label = $Q$Si oui, avec qui, et comment cela s'est passé ?$Q$ and is_active;

commit;
