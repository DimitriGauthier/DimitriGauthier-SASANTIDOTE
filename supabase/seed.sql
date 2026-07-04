-- seed.sql — Données initiales du site Dimitri Gauthier (sexothérapie · TRAME · numérologie)
-- ---------------------------------------------------------------------------------------------
-- ⚠️ À exécuter UNE FOIS sur une base fraîche (après 0001_init.sql).
--    Les sections `settings`, `services`, `topics`, `content_pages` sont ré-exécutables
--    (upsert par slug / id). Les sections `availability_rules` et `questions` NE le sont PAS :
--    elles ré-insèrent sans dédoublonner. Ne pas rejouer ce fichier après la mise en ligne.
--
-- Contenus repris du cahier des charges rempli par Dimitri :
--   Documentation/04b_Reponses_Dimitri_Cahier_des_Charges.md
--   Documentation/06_Questionnaires_Client_Draft.md   (⚠️ BROUILLON clinique — à valider par Dimitri)
--   Documentation/11_Questionnaire_Couple_Dallaire.md
--
-- Convention i18n : les variantes `_en` sont laissées vides -> fallback FR (voir pick() côté front).
-- Les prix (price_cents) sont des PLACEHOLDERS : Dimitri annonce ses tarifs « au moment du paiement ».
--   -> à confirmer avec lui avant la mise en ligne (TODO PRIX).
-- ---------------------------------------------------------------------------------------------

begin;

-- ========================= 1) Paramètres (singleton id = 1) =========================
insert into settings (id, practitioner_name, email, phone, whatsapp, address,
                      timezone, currency, default_locale, supported_locales,
                      min_notice_hours, max_advance_days, buffer_min)
values (1, 'Dimitri Gauthier', 'dimitrigauthier974@gmail.com',
        '+262 692 52 72 86', '+262 692 52 72 86',
        null,                       -- exercice en visio ; adresse à compléter au 1er RDV
        'Indian/Reunion', 'EUR', 'fr', '{fr,en}',
        24,   -- délai minimum avant un créneau (h)
        60,   -- horizon de réservation (jours)
        15)   -- battement entre deux RDV (min)
on conflict (id) do update set
  practitioner_name = excluded.practitioner_name,
  email             = excluded.email,
  phone             = excluded.phone,
  whatsapp          = excluded.whatsapp,
  timezone          = excluded.timezone,
  currency          = excluded.currency,
  default_locale    = excluded.default_locale,
  supported_locales = excluded.supported_locales,
  min_notice_hours  = excluded.min_notice_hours,
  max_advance_days  = excluded.max_advance_days,
  buffer_min        = excluded.buffer_min,
  updated_at        = now();

-- ========================= 2) Services (visio) =========================
-- Cahier D. : lieu d'exercice = visio ; profils homme / femme / couple (+ adolescent -> mappé « tous »).
-- TODO PRIX : montants placeholders, à confirmer avec Dimitri.
insert into services (slug, title, subtitle, description, audiences, duration_min, price_cents, currency, location_type, is_active, sort_order)
values
  ('seance-individuelle',
   'Séance individuelle',
   'Sexothérapie · TRAME® · numérologie',
   'Un accompagnement individuel pour éclairer ta problématique et avancer, en articulant sexothérapie, TRAME® et numérologie. En visioconférence.',
   '{homme,femme}'::audience_type[], 60, 9000, 'EUR', 'visio', true, 1),
  ('seance-couple',
   'Séance de couple',
   'Retrouver du lien et du désir',
   'Une séance pour le couple : mettre des mots sur ce qui coince, restaurer la communication et le désir. En visioconférence.',
   '{couple}'::audience_type[], 90, 15000, 'EUR', 'visio', true, 2),
  ('seance-decouverte',
   'Séance découverte',
   'Premier échange pour faire connaissance',
   'Un premier temps d''échange pour clarifier ta demande et voir comment l''accompagnement peut t''aider. En visioconférence.',
   '{tous}'::audience_type[], 45, 6000, 'EUR', 'visio', true, 3)
on conflict (slug) do update set
  title        = excluded.title,
  subtitle     = excluded.subtitle,
  description  = excluded.description,
  audiences    = excluded.audiences,
  duration_min = excluded.duration_min,
  price_cents  = excluded.price_cents,
  location_type= excluded.location_type,
  is_active    = excluded.is_active,
  sort_order   = excluded.sort_order,
  updated_at   = now();

-- ========================= 3) Problématiques (motifs -> pilotent le questionnaire) =========================
insert into topics (slug, title, description, audiences, is_active, sort_order)
values
  ('troubles-erectiles',     'Troubles de l''érection',        'Difficultés à obtenir ou maintenir une érection.',                 '{homme}'::audience_type[], true, 1),
  ('ejaculation-precoce',    'Éjaculation précoce / rapide',   'Éjaculation qui survient plus tôt que souhaité.',                  '{homme}'::audience_type[], true, 2),
  ('ejaculation-tardive',    'Éjaculation tardive / anéjaculation', 'Difficulté ou impossibilité à éjaculer lors des rapports.',   '{homme}'::audience_type[], true, 3),
  ('troubles-du-desir',      'Troubles du désir',              'Baisse ou absence de désir.',                                      '{femme}'::audience_type[], true, 4),
  ('anorgasmie',             'Anorgasmie',                     'Difficulté à atteindre l''orgasme.',                               '{femme}'::audience_type[], true, 5),
  ('vaginisme',              'Vaginisme',                      'Contraction involontaire empêchant la pénétration.',               '{femme}'::audience_type[], true, 6),
  ('dyspareunies',           'Dyspareunies (douleurs)',        'Douleurs pendant les rapports.',                                   '{femme}'::audience_type[], true, 7),
  ('addiction-masturbation', 'Addiction à la masturbation',    'Besoin ressenti comme compulsif, avec perte de contrôle.',         '{tous}'::audience_type[], true, 8),
  ('addiction-pornographie', 'Addiction à la pornographie',    'Consommation vécue comme envahissante.',                           '{tous}'::audience_type[], true, 9),
  ('couple',                 'Accompagnement de couple',       'Difficultés relationnelles et/ou sexuelles dans le couple.',       '{couple}'::audience_type[], true, 10)
on conflict (slug) do update set
  title       = excluded.title,
  description = excluded.description,
  audiences   = excluded.audiences,
  is_active   = excluded.is_active,
  sort_order  = excluded.sort_order,
  updated_at  = now();

-- ========================= 4) Questions d'admission =========================
-- ⚠️ Contenu clinique BROUILLON (doc 06) — à valider / couper / reformuler avec Dimitri.
--    Les questions « travail sur les parts » (🔒 doc 06) sont volontairement EXCLUES du formulaire web.

-- ---- 4.0 Tronc commun (topic_id = null : posé à tous les motifs) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select null, '{tous}'::audience_type[], q.section, q.label, q.type::question_type, q.options, q.required, q.ord
from (values
  -- Votre demande
  ('Votre demande', $Q$Quelle est votre situation actuelle ?$Q$,                                        'long_text',  null::jsonb, true,  10),
  ('Votre demande', $Q$Depuis combien de temps vivez-vous cette situation ?$Q$,                          'short_text', null::jsonb, false, 20),
  ('Votre demande', $Q$Quel est l'impact de cette situation dans votre vie ?$Q$,                         'long_text',  null::jsonb, false, 30),
  ('Votre demande', $Q$Comment vous sentez-vous à cause de cette situation ?$Q$,                         'long_text',  null::jsonb, false, 40),
  ('Votre demande', $Q$Quels sont vos désirs / vos objectifs ?$Q$,                                       'long_text',  null::jsonb, true,  50),
  ('Votre demande', $Q$Pourquoi est-ce important pour vous de prendre cela en main aujourd'hui ?$Q$,     'long_text',  null::jsonb, false, 60),
  ('Votre demande', $Q$Vous êtes-vous déjà fait accompagner pour cela ?$Q$,                              'boolean',    null::jsonb, false, 70),
  ('Votre demande', $Q$Si oui, comment cela s'est-il passé ?$Q$,                                         'long_text',  null::jsonb, false, 80),
  ('Votre demande', $Q$Qu'est-ce qui ferait que cet accompagnement soit une réussite pour vous ?$Q$,     'long_text',  null::jsonb, false, 90),
  -- Vous
  ('Vous', $Q$Âge$Q$,                                                                                     'short_text', null::jsonb, true,  100),
  ('Vous', $Q$Comment avez-vous connu le cabinet ?$Q$,                                                    'short_text', null::jsonb, false, 110),
  ('Vous', $Q$Avez-vous déjà consulté un(e) sexothérapeute / thérapeute ?$Q$,                             'boolean',    null::jsonb, false, 120),
  ('Vous', $Q$Si oui, avec qui, et comment cela s'est passé ?$Q$,                                         'long_text',  null::jsonb, false, 130),
  ('Vous', $Q$Situation affective$Q$,                                                                     'single_choice', '[{"value":"couple","label":"En couple"},{"value":"celibataire","label":"Célibataire"}]'::jsonb, false, 140),
  ('Vous', $Q$Si en couple : depuis combien de temps ? (et prénom du partenaire)$Q$,                      'short_text', null::jsonb, false, 150),
  ('Vous', $Q$Contraception (le cas échéant)$Q$,                                                          'short_text', null::jsonb, false, 160),
  ('Vous', $Q$Avez-vous des enfants ? (si oui, âges)$Q$,                                                  'short_text', null::jsonb, false, 170),
  ('Vous', $Q$Satisfaction de votre vie familiale$Q$,                                                     'scale',      null::jsonb, false, 180),
  ('Vous', $Q$Profession$Q$,                                                                              'short_text', null::jsonb, false, 190),
  ('Vous', $Q$Satisfaction professionnelle$Q$,                                                            'scale',      null::jsonb, false, 200),
  -- Santé
  ('Santé', $Q$Antécédents médicaux$Q$,                                                                   'long_text',  null::jsonb, false, 210),
  ('Santé', $Q$Antécédents chirurgicaux$Q$,                                                               'long_text',  null::jsonb, false, 220),
  ('Santé', $Q$Traitements / médicaments en cours$Q$,                                                     'long_text',  null::jsonb, false, 230),
  ('Santé', $Q$Sommeil (qualité, durée)$Q$,                                                               'short_text', null::jsonb, false, 240),
  ('Santé', $Q$Tabac ? (si oui, combien de cigarettes par jour)$Q$,                                       'short_text', null::jsonb, false, 250),
  ('Santé', $Q$Alcool / drogues ? (si oui, quelle consommation)$Q$,                                       'short_text', null::jsonb, false, 260)
) as q(section, label, type, options, required, ord);

-- Aide affichée sous les échelles de satisfaction du tronc commun
update questions set help_text = '0 = très insatisfait · 4 = très satisfait'
where topic_id is null and type = 'scale';

-- ---- 4.1 Troubles de l'érection (homme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{homme}'::audience_type[], 'Troubles de l''érection', q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ($Q$Depuis quand rencontrez-vous des problèmes d'érection ?$Q$,                                 'short_text',   null::jsonb, false, 10),
  ($Q$Est-ce à chaque rapport ?$Q$,                                                               'boolean',      null::jsonb, false, 20),
  ($Q$Est-ce seulement de temps en temps ?$Q$,                                                    'boolean',      null::jsonb, false, 30),
  ($Q$Avez-vous des érections matinales ?$Q$,                                                     'boolean',      null::jsonb, false, 40),
  ($Q$Arrivez-vous à obtenir / maintenir une érection en vous masturbant ?$Q$,                    'boolean',      null::jsonb, false, 50),
  ($Q$Est-ce compliqué avec votre partenaire ? Avec une en particulier, ou toutes ?$Q$,           'long_text',    null::jsonb, false, 60),
  ($Q$Votre partenaire vous stimule / vous excite-t-elle suffisamment ?$Q$,                       'long_text',    null::jsonb, false, 70),
  ($Q$À quel moment perdez-vous l'érection ?$Q$,                                                   'multi_choice', '[{"value":"preliminaires","label":"Préliminaires"},{"value":"acte","label":"Pendant l''acte"},{"value":"penetration","label":"À la pénétration"}]'::jsonb, false, 80),
  ($Q$Comment décririez-vous la qualité de votre érection ? (molle, demi-molle, dure puis retombe…)$Q$, 'long_text', null::jsonb, false, 90),
  ($Q$Avez-vous vécu un changement de vie récent / un événement marquant ?$Q$,                    'long_text',    null::jsonb, false, 100),
  ($Q$Rencontrez-vous aussi une éjaculation rapide ?$Q$,                                          'boolean',      null::jsonb, false, 110),
  ($Q$La relation est-elle harmonieuse avant l'acte, ou y a-t-il des tensions ?$Q$,               'long_text',    null::jsonb, false, 120),
  ($Q$En ce moment : êtes-vous en forme / fatigué ? Avez-vous mal quelque part ? Êtes-vous stressé ?$Q$, 'long_text', null::jsonb, false, 130)
) as q(label, type, options, required, ord)
where topics.slug = 'troubles-erectiles';

-- ---- 4.2 Éjaculation précoce / rapide (homme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{homme}'::audience_type[], q.section, q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ('Éjaculation précoce', $Q$Depuis quand rencontrez-vous cette difficulté ?$Q$,                          'short_text',   null::jsonb, false, 10),
  ('Éjaculation précoce', $Q$Est-ce à chaque rapport ?$Q$,                                                'boolean',      null::jsonb, false, 20),
  ('Éjaculation précoce', $Q$De temps en temps ou tout le temps ?$Q$,                                     'single_choice','[{"value":"parfois","label":"De temps en temps"},{"value":"toujours","label":"Tout le temps"}]'::jsonb, false, 30),
  ('Éjaculation précoce', $Q$Arrivez-vous à contrôler / faire durer le plaisir en vous masturbant ?$Q$,   'boolean',      null::jsonb, false, 40),
  ('Éjaculation précoce', $Q$Est-ce compliqué avec votre partenaire ? Avec une en particulier, ou toutes ?$Q$, 'long_text', null::jsonb, false, 50),
  ('Éjaculation précoce', $Q$Quand éjaculez-vous ?$Q$,                                                     'single_choice','[{"value":"avant_prelim","label":"Avant les préliminaires"},{"value":"pendant_prelim","label":"Pendant les préliminaires"},{"value":"avant_penet","label":"Avant la pénétration"},{"value":"pendant_penet","label":"Pendant la pénétration"}]'::jsonb, false, 60),
  ('Éjaculation précoce', $Q$Arrivez-vous à faire quelques va-et-vient, ou pas du tout ?$Q$,               'boolean',      null::jsonb, false, 70),
  ('Éjaculation précoce', $Q$Avez-vous vécu un changement de vie récent ?$Q$,                             'long_text',    null::jsonb, false, 80),
  ('Éjaculation précoce', $Q$Rencontrez-vous aussi des problèmes d'érection ?$Q$,                         'boolean',      null::jsonb, false, 90),
  ('Éjaculation précoce', $Q$La relation est-elle harmonieuse avant l'acte, ou y a-t-il des tensions ?$Q$, 'long_text',   null::jsonb, false, 100),
  ('Éjaculation précoce', $Q$En ce moment : en forme / fatigué ? Mal quelque part ? Stressé ? Médicaments ?$Q$, 'long_text', null::jsonb, false, 110),
  ('Conditionnements', $Q$Vous masturbez-vous ?$Q$,                                                        'boolean',      null::jsonb, false, 120),
  ('Conditionnements', $Q$Dans quelles conditions ? (porno, position…) — si vous ne vous masturbez pas, pourquoi ?$Q$, 'long_text', null::jsonb, false, 130),
  ('Conditionnements', $Q$À quelle fréquence ? Comment ? À quoi pensez-vous ?$Q$,                          'long_text',    null::jsonb, false, 140),
  ('Conditionnements', $Q$Qu'est-ce qui déclenche la masturbation ? (film, réseaux, stress, ennui, absence de rapport…)$Q$, 'long_text', null::jsonb, false, 150)
) as q(section, label, type, options, required, ord)
where topics.slug = 'ejaculation-precoce';

-- ---- 4.3 Éjaculation tardive / anéjaculation (homme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{homme}'::audience_type[], 'Éjaculation tardive / anéjaculation', q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ($Q$Depuis quand rencontrez-vous cette difficulté ?$Q$,                                         'short_text',   null::jsonb, false, 10),
  ($Q$Un événement précis l'a-t-il déclenchée ?$Q$,                                               'long_text',    null::jsonb, false, 20),
  ($Q$Est-ce à chaque rapport ?$Q$,                                                               'boolean',      null::jsonb, false, 30),
  ($Q$Dans quelles situations ?$Q$,                                                               'multi_choice', '[{"value":"coit","label":"Coït"},{"value":"fellation","label":"Fellation"},{"value":"sodomie","label":"Sodomie"},{"value":"autre","label":"Autre"}]'::jsonb, false, 40),
  ($Q$Lors d'une masturbation solo, tout fonctionne-t-il normalement ?$Q$,                        'boolean',      null::jsonb, false, 50),
  ($Q$Est-ce le cas avec une partenaire en particulier, ou avec toutes ?$Q$,                      'single_choice','[{"value":"une","label":"Une en particulier"},{"value":"toutes","label":"Avec toutes"}]'::jsonb, false, 60),
  ($Q$Que se passe-t-il pour vous à ce moment ? Quelles sont vos pensées ?$Q$,                    'long_text',    null::jsonb, false, 70),
  ($Q$Avez-vous vécu un changement de vie récent / un événement marquant ?$Q$,                    'long_text',    null::jsonb, false, 80),
  ($Q$Pendant l'acte, êtes-vous stressé, angoissé ? Vous sentez-vous aimé, désiré ? Désirez-vous votre partenaire ?$Q$, 'long_text', null::jsonb, false, 90)
) as q(label, type, options, required, ord)
where topics.slug = 'ejaculation-tardive';

-- ---- 4.4 Troubles du désir (femme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{femme}'::audience_type[], 'Troubles du désir', q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ($Q$Depuis quand ressentez-vous une baisse / absence de désir ?$Q$,                             'short_text', null::jsonb, false, 10),
  ($Q$Avez-vous déjà ressenti du désir ? Si oui, quand ?$Q$,                                       'long_text',  null::jsonb, false, 20),
  ($Q$Un événement particulier a-t-il précédé cette baisse ?$Q$,                                   'long_text',  null::jsonb, false, 30),
  ($Q$Ressentez-vous du désir seule ? Vous masturbez-vous ?$Q$,                                     'long_text',  null::jsonb, false, 40),
  ($Q$Êtes-vous suffisamment excitée ? L'êtes-vous par votre partenaire ?$Q$,                      'long_text',  null::jsonb, false, 50),
  ($Q$Qu'est-ce qui vous manquerait pour être plus excitée ?$Q$,                                    'long_text',  null::jsonb, false, 60),
  ($Q$Ressentez-vous des douleurs ou du plaisir lors de la pénétration ?$Q$,                       'long_text',  null::jsonb, false, 70),
  ($Q$Avez-vous déjà eu des orgasmes ?$Q$,                                                          'boolean',    null::jsonb, false, 80),
  ($Q$Êtes-vous ménopausée ? (si oui, souffrez-vous de sécheresse vaginale ?)$Q$,                  'long_text',  null::jsonb, false, 90),
  ($Q$Avez-vous des pensées érotiques, des fantasmes ? Si vous n'en avez plus, pourquoi selon vous ?$Q$, 'long_text', null::jsonb, false, 100),
  ($Q$Si vous avez un partenaire : comment se passe la relation ? Comment vous y sentez-vous ?$Q$, 'long_text',  null::jsonb, false, 110),
  ($Q$Y a-t-il des disputes / désaccords ? Pour quelles raisons ?$Q$,                              'long_text',  null::jsonb, false, 120),
  ($Q$Avez-vous des moments de qualité avec votre conjoint ? Lesquels ?$Q$,                        'long_text',  null::jsonb, false, 130),
  ($Q$Trouvez-vous votre partenaire (encore) désirable ? Sinon, pourquoi ?$Q$,                     'long_text',  null::jsonb, false, 140),
  ($Q$Avez-vous du temps pour vous, pour prendre soin de vous ?$Q$,                                'long_text',  null::jsonb, false, 150),
  ($Q$Qu'avez-vous vu / entendu sur le sexe et la sexualité (éducation, influences) ?$Q$,          'long_text',  null::jsonb, false, 160)
) as q(label, type, options, required, ord)
where topics.slug = 'troubles-du-desir';

-- ---- 4.5 Anorgasmie (femme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{femme}'::audience_type[], 'Anorgasmie', q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ($Q$Depuis quand rencontrez-vous cette difficulté à atteindre l'orgasme ?$Q$,                   'short_text',   null::jsonb, false, 10),
  ($Q$Est-ce présent depuis toujours, ou apparu à un moment ?$Q$,                                 'single_choice','[{"value":"toujours","label":"Depuis toujours"},{"value":"recent","label":"Apparu récemment"}]'::jsonb, false, 20),
  ($Q$Cela se produit-il seule, avec un partenaire, ou les deux ?$Q$,                             'single_choice','[{"value":"seule","label":"Seule"},{"value":"partenaire","label":"Avec un partenaire"},{"value":"deux","label":"Les deux"}]'::jsonb, false, 30),
  ($Q$Comment décririez-vous votre relation à votre corps ?$Q$,                                    'long_text',    null::jsonb, false, 40),
  ($Q$À quel point vous sentez-vous connectée à votre corps ?$Q$,                                  'scale',        null::jsonb, false, 50),
  ($Q$Quelles sensations ressentez-vous ?$Q$,                                                      'long_text',    null::jsonb, false, 60),
  ($Q$Qu'aimeriez-vous ressentir à la place ?$Q$,                                                  'long_text',    null::jsonb, false, 70),
  ($Q$Comment percevez-vous la sexualité ? Est-elle un plaisir pour vous ?$Q$,                     'long_text',    null::jsonb, false, 80),
  ($Q$Ressentez-vous du désir ?$Q$,                                                                'boolean',      null::jsonb, false, 90),
  ($Q$Comment se passe la relation avec votre partenaire ?$Q$,                                     'long_text',    null::jsonb, false, 100)
) as q(label, type, options, required, ord)
where topics.slug = 'anorgasmie';

-- ---- 4.6 Vaginisme (femme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{femme}'::audience_type[], 'Vaginisme', q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ($Q$Depuis quand cette difficulté est-elle présente ?$Q$,                                       'short_text',   null::jsonb, false, 10),
  ($Q$Est-ce depuis toujours, ou apparu à un moment ?$Q$,                                         'single_choice','[{"value":"toujours","label":"Depuis toujours"},{"value":"recent","label":"Apparu récemment"}]'::jsonb, false, 20),
  ($Q$Arrivez-vous à insérer un tampon (ou autre), ou rien ne peut entrer ?$Q$,                   'single_choice','[{"value":"tampon","label":"J''arrive à insérer un tampon"},{"value":"rien","label":"Rien ne peut entrer"}]'::jsonb, false, 30),
  ($Q$Qu'avez-vous vu / entendu sur le sexe et la sexualité ? Quelles influences ?$Q$,            'long_text',    null::jsonb, false, 40),
  ($Q$Qu'avez-vous vu / entendu au sujet des hommes ?$Q$,                                          'long_text',    null::jsonb, false, 50),
  ($Q$À quel endroit ressentez-vous la douleur ? (ex. entrée du vagin)$Q$,                        'short_text',   null::jsonb, false, 60),
  ($Q$Comment décririez-vous cette douleur ?$Q$,                                                   'long_text',    null::jsonb, false, 70),
  ($Q$Quelles sensations ressentez-vous ?$Q$,                                                      'long_text',    null::jsonb, false, 80),
  ($Q$Que ressentez-vous / imaginez-vous se passer dans votre corps à ce moment ?$Q$,             'long_text',    null::jsonb, false, 90),
  ($Q$Ressentez-vous du désir ? Êtes-vous suffisamment excitée ? Que vous manquerait-il ?$Q$,     'long_text',    null::jsonb, false, 100),
  ($Q$Comment se passe la relation avec votre partenaire ?$Q$,                                     'long_text',    null::jsonb, false, 110)
) as q(label, type, options, required, ord)
where topics.slug = 'vaginisme';

-- ---- 4.7 Dyspareunies / douleurs (femme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{femme}'::audience_type[], 'Dyspareunies (douleurs)', q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ($Q$Depuis quand ressentez-vous ces douleurs ?$Q$,                                              'short_text',   null::jsonb, false, 10),
  ($Q$Est-ce depuis toujours ou apparu à un moment ?$Q$,                                          'single_choice','[{"value":"toujours","label":"Depuis toujours"},{"value":"recent","label":"Apparu récemment"}]'::jsonb, false, 20),
  ($Q$Cela se produit-il seule, avec un partenaire, ou les deux ?$Q$,                             'single_choice','[{"value":"seule","label":"Seule"},{"value":"partenaire","label":"Avec un partenaire"},{"value":"deux","label":"Les deux"}]'::jsonb, false, 30),
  ($Q$Où ressentez-vous la douleur ? À quel moment ?$Q$,                                          'long_text',    null::jsonb, false, 40),
  ($Q$Douleurs à l'intérieur ou à l'extérieur du vagin ?$Q$,                                      'single_choice','[{"value":"interieur","label":"Intérieur"},{"value":"exterieur","label":"Extérieur"},{"value":"deux","label":"Les deux"}]'::jsonb, false, 50),
  ($Q$Comment décririez-vous cette douleur ?$Q$,                                                   'long_text',    null::jsonb, false, 60),
  ($Q$Quelle est son intensité ?$Q$,                                                               'scale',        null::jsonb, false, 70),
  ($Q$Qu'aimeriez-vous ressentir à la place ?$Q$,                                                  'long_text',    null::jsonb, false, 80),
  ($Q$Ressentez-vous du désir ?$Q$,                                                                'boolean',      null::jsonb, false, 90),
  ($Q$Comment se passe la pénétration ? (les préliminaires vous laissent-ils le temps d'être prête ?)$Q$, 'long_text', null::jsonb, false, 100),
  ($Q$Êtes-vous suffisamment excitée ? Que vous manquerait-il ?$Q$,                               'long_text',    null::jsonb, false, 110),
  ($Q$Comment se passe la relation avec votre partenaire ?$Q$,                                     'long_text',    null::jsonb, false, 120)
) as q(label, type, options, required, ord)
where topics.slug = 'dyspareunies';

update questions set help_text = '0 = aucune douleur · 4 = douleur très intense'
where topic_id = (select id from topics where slug = 'dyspareunies') and type = 'scale';
update questions set help_text = '0 = pas du tout connectée · 4 = pleinement connectée'
where topic_id = (select id from topics where slug = 'anorgasmie') and type = 'scale';

-- ---- 4.8 Addiction à la masturbation (tous) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{tous}'::audience_type[], q.section, q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ('Fréquence et durée', $Q$Combien de fois par jour/semaine ressentez-vous le besoin de vous masturber ?$Q$, 'short_text', null::jsonb, false, 10),
  ('Fréquence et durée', $Q$Combien de temps consacrez-vous à chaque fois ?$Q$,                    'short_text', null::jsonb, false, 20),
  ('Contexte et déclencheurs', $Q$Quels sont les déclencheurs qui vous y poussent ? (ennui, stress, solitude…)$Q$, 'long_text', null::jsonb, false, 30),
  ('Contexte et déclencheurs', $Q$Y a-t-il des moments ou situations où ce besoin est plus fort ?$Q$, 'long_text', null::jsonb, false, 40),
  ('Contrôle', $Q$Avez-vous déjà essayé de réduire ? Avec quel succès ?$Q$,                        'long_text', null::jsonb, false, 50),
  ('Contrôle', $Q$Ressentez-vous une perte de contrôle ?$Q$,                                       'boolean',   null::jsonb, false, 60),
  ('Impact', $Q$En quoi cela affecte-t-il votre quotidien, vos relations, votre travail ?$Q$,      'long_text', null::jsonb, false, 70),
  ('Impact', $Q$Avez-vous manqué des engagements à cause de ce besoin ?$Q$,                        'boolean',   null::jsonb, false, 80),
  ('Émotions', $Q$Que ressentez-vous avant, pendant et après ? (culpabilité, soulagement, anxiété…)$Q$, 'long_text', null::jsonb, false, 90),
  ('Émotions', $Q$Ressentez-vous de la honte ou de la culpabilité ?$Q$,                            'boolean',   null::jsonb, false, 100),
  ('Conséquences physiques', $Q$Avez-vous remarqué des conséquences physiques ? (irritation, fatigue…)$Q$, 'long_text', null::jsonb, false, 110),
  ('Conséquences physiques', $Q$Avez-vous consulté un médecin à ce sujet ?$Q$,                     'boolean',   null::jsonb, false, 120),
  ('Motivation / historique', $Q$Pourquoi souhaitez-vous réduire ou arrêter ?$Q$,                  'long_text', null::jsonb, false, 130),
  ('Motivation / historique', $Q$Depuis quand ce comportement a-t-il commencé ?$Q$,                'short_text',null::jsonb, false, 140),
  ('Motivation / historique', $Q$Vos habitudes ont-elles changé au fil du temps ?$Q$,              'long_text', null::jsonb, false, 150)
) as q(section, label, type, options, required, ord)
where topics.slug = 'addiction-masturbation';

-- ---- 4.9 Addiction à la pornographie (tous) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{tous}'::audience_type[], q.section, q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ('Types de contenu', $Q$Quels genres regardez-vous le plus souvent ?$Q$,                         'long_text',  null::jsonb, false, 10),
  ('Types de contenu', $Q$Des thèmes/catégories vous attirent-ils particulièrement ? Lesquels, et pourquoi selon vous ?$Q$, 'long_text', null::jsonb, false, 20),
  ('Types de contenu', $Q$Vos préférences ont-elles changé avec le temps ? Comment ?$Q$,           'long_text',  null::jsonb, false, 30),
  ('Historique', $Q$Depuis combien de temps en regardez-vous ?$Q$,                                 'short_text', null::jsonb, false, 40),
  ('Historique', $Q$Vous souvenez-vous de votre première exposition ? Pouvez-vous la décrire ?$Q$, 'long_text',  null::jsonb, false, 50),
  ('Historique', $Q$Comment votre consommation a-t-elle évolué ? (fréquence, durée, type)$Q$,      'long_text',  null::jsonb, false, 60)
) as q(section, label, type, options, required, ord)
where topics.slug = 'addiction-pornographie';

-- ---- 4.10 Couple : demande + test de satisfaction conjugale (Yvon Dallaire, 25 items 0–4) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{couple}'::audience_type[], q.section, q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ('Votre demande (couple)', $Q$Qu'est-ce qui vous amène à consulter en couple aujourd'hui ?$Q$,   'long_text',  null::jsonb, true,  10),
  ('Votre demande (couple)', $Q$Depuis combien de temps êtes-vous ensemble ?$Q$,                   'short_text', null::jsonb, false, 20),
  ('Votre demande (couple)', $Q$Qu'attendez-vous de cet accompagnement ?$Q$,                       'long_text',  null::jsonb, true,  30),
  -- Test de satisfaction conjugale (Dallaire) — chaque partenaire le remplit séparément
  ('Satisfaction conjugale (0–4)', $Q$Notre confiance et respect réciproques$Q$,                    'scale', null::jsonb, false, 100),
  ('Satisfaction conjugale (0–4)', $Q$Le respect de mon territoire et de mes habitudes$Q$,          'scale', null::jsonb, false, 110),
  ('Satisfaction conjugale (0–4)', $Q$Sentiment d'admiration pour mon partenaire$Q$,                'scale', null::jsonb, false, 120),
  ('Satisfaction conjugale (0–4)', $Q$Sentiment que mon partenaire m'admire$Q$,                     'scale', null::jsonb, false, 130),
  ('Satisfaction conjugale (0–4)', $Q$Sentiment de complicité avec mon partenaire$Q$,               'scale', null::jsonb, false, 140),
  ('Satisfaction conjugale (0–4)', $Q$Notre entente sur nos projets à court, moyen et long terme$Q$,'scale', null::jsonb, false, 150),
  ('Satisfaction conjugale (0–4)', $Q$La communication verbale émotive$Q$,                          'scale', null::jsonb, false, 160),
  ('Satisfaction conjugale (0–4)', $Q$La fréquence de nos rapports sexuels$Q$,                       'scale', null::jsonb, false, 170),
  ('Satisfaction conjugale (0–4)', $Q$La qualité de nos rapports sexuels$Q$,                         'scale', null::jsonb, false, 180),
  ('Satisfaction conjugale (0–4)', $Q$Nos moments de tendresse, hors sexualité$Q$,                   'scale', null::jsonb, false, 190),
  ('Satisfaction conjugale (0–4)', $Q$L'éducation de nos enfants (actuels ou à venir)$Q$,           'scale', null::jsonb, false, 200),
  ('Satisfaction conjugale (0–4)', $Q$Notre entente financière$Q$,                                   'scale', null::jsonb, false, 210),
  ('Satisfaction conjugale (0–4)', $Q$Le partage des tâches ménagères$Q$,                            'scale', null::jsonb, false, 220),
  ('Satisfaction conjugale (0–4)', $Q$Mes liens avec la belle-famille$Q$,                            'scale', null::jsonb, false, 230),
  ('Satisfaction conjugale (0–4)', $Q$Les activités de loisirs$Q$,                                   'scale', null::jsonb, false, 240),
  ('Satisfaction conjugale (0–4)', $Q$La vie au jour le jour$Q$,                                     'scale', null::jsonb, false, 250),
  ('Satisfaction conjugale (0–4)', $Q$La prise de décision$Q$,                                       'scale', null::jsonb, false, 260),
  ('Satisfaction conjugale (0–4)', $Q$La résolution de nos conflits$Q$,                              'scale', null::jsonb, false, 270),
  ('Satisfaction conjugale (0–4)', $Q$La quantité de temps passé ensemble$Q$,                        'scale', null::jsonb, false, 280),
  ('Satisfaction conjugale (0–4)', $Q$La qualité de temps passé ensemble$Q$,                         'scale', null::jsonb, false, 290),
  ('Satisfaction conjugale (0–4)', $Q$Le support obtenu lors de moments difficiles$Q$,              'scale', null::jsonb, false, 300),
  ('Satisfaction conjugale (0–4)', $Q$Les relations avec nos couples amis ou nos amis personnels$Q$,'scale', null::jsonb, false, 310),
  ('Satisfaction conjugale (0–4)', $Q$Nos périodes de vacances en couple ou seul, sans la famille$Q$,'scale', null::jsonb, false, 320),
  ('Satisfaction conjugale (0–4)', $Q$Notre engagement réciproque et notre partage du pouvoir$Q$,   'scale', null::jsonb, false, 330),
  ('Satisfaction conjugale (0–4)', $Q$Mon sentiment de liberté dans mon couple$Q$,                  'scale', null::jsonb, false, 340)
) as q(section, label, type, options, required, ord)
where topics.slug = 'couple';

update questions set help_text = '0 = inexistante · 1 = médiocre · 2 = peu satisfaisante · 3 = satisfaisante · 4 = excellente'
where topic_id = (select id from topics where slug = 'couple') and type = 'scale' and sort_order = 100;

-- ========================= 5) Horaires d'ouverture (availability_rules) =========================
-- ⚠️ Plages PLACEHOLDER (heure locale Réunion) — à ajuster avec Dimitri (disponibilités non fournies au cahier).
--    Les congés se gèrent dans Google Agenda (comptés « occupé »).
insert into availability_rules (weekday, start_time, end_time, is_active) values
  (1, '09:00', '12:00', true), (1, '14:00', '18:00', true),  -- lundi
  (2, '09:00', '12:00', true), (2, '14:00', '18:00', true),  -- mardi
  (3, '09:00', '12:00', true), (3, '14:00', '18:00', true),  -- mercredi
  (4, '09:00', '12:00', true), (4, '14:00', '18:00', true),  -- jeudi
  (5, '09:00', '12:00', true), (5, '14:00', '18:00', true),  -- vendredi
  (6, '09:00', '12:00', true);                               -- samedi matin

-- ========================= 6) Pages de contenu (légal) =========================
-- Éditeur : SAS ANTIDOTE (forme juridique déclarée par Dimitri). Directeur de publication : Dimitri Gauthier.
insert into content_pages (slug, title, body_html)
values
  ('mentions-legales', 'Mentions légales',
   $H$<h2>Éditeur du site</h2>
<p>Le présent site est édité par <strong>SAS ANTIDOTE</strong>, société par actions simplifiée au capital de 1 000 €,
immatriculée au RCS de Saint-Denis sous le numéro 902 472 117, dont le siège social est situé
5 chemin Grand Canal — Immeuble Thalès A, 97490 Sainte-Clotilde (La Réunion).</p>
<p><strong>Directeur de la publication :</strong> Dimitri Gauthier.<br/>
<strong>Contact :</strong> dimitrigauthier974@gmail.com — +262 692 52 72 86.</p>
<h2>Hébergement</h2>
<p>Le site est hébergé par Vercel Inc. (frontend) et Supabase (base de données et fonctions serveur).
Coordonnées complètes de l'hébergeur à compléter avant la mise en ligne.</p>
<h2>Propriété intellectuelle</h2>
<p>L'ensemble des contenus (textes, images, éléments graphiques) est protégé par le droit d'auteur.
Toute reproduction sans autorisation préalable est interdite.</p>$H$),
  ('confidentialite', 'Politique de confidentialité',
   $H$<h2>Responsable du traitement</h2>
<p>Les données collectées sur ce site sont traitées par SAS ANTIDOTE (Dimitri Gauthier), à des fins de prise
de rendez-vous, de suivi de consultation et de facturation.</p>
<h2>Données collectées</h2>
<p>Selon votre parcours : identité et coordonnées, réponses au questionnaire d'admission (données de santé,
traitées avec une vigilance particulière), informations de rendez-vous et de paiement. Le paiement est traité
par Stripe ; aucune donnée bancaire n'est stockée sur nos serveurs.</p>
<h2>Finalités et base légale</h2>
<p>Les données servent exclusivement à l'accompagnement thérapeutique et à la gestion des rendez-vous.
Elles ne sont ni vendues ni cédées à des tiers à des fins commerciales.</p>
<h2>Durée de conservation</h2>
<p>Les données sont conservées le temps nécessaire au suivi, puis archivées ou supprimées conformément
aux obligations légales applicables.</p>
<h2>Vos droits (RGPD)</h2>
<p>Vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition. Pour l'exercer :
dimitrigauthier974@gmail.com.</p>$H$)
on conflict (slug) do update set
  title     = excluded.title,
  body_html = excluded.body_html,
  updated_at = now();

commit;

-- ========================= 7) Administrateur (à faire manuellement) =========================
-- app_admins référence auth.users(id). Il faut donc d'abord créer le compte de Dimitri
-- (Dashboard Supabase > Authentication > Add user, ou via l'API), puis l'enregistrer comme admin :
--
--   insert into app_admins (user_id)
--   select id from auth.users where email = 'dimitrigauthier974@gmail.com'
--   on conflict do nothing;
--
-- (Volontairement laissé en commentaire : le compte auth n'existe pas encore.)
