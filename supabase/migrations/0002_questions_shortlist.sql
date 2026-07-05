-- 0002_questions_shortlist.sql
-- =============================================================================
-- Réduit le questionnaire du tunnel à la version COURTE « prospect » validée
-- (doc 07 « Questionnaires — questions retenues », sélection ● de Dimitri).
--
-- Pourquoi : le brouillon initial (doc 06) posait ~39 à 54 questions selon le
-- motif — trop long pour un premier contact. La version courte en pose ~19 à 22.
-- La version longue reste un usage cabinet / séance (hors formulaire web).
--
-- Sécurité (⚠️ prod) : on ne SUPPRIME que les questions qu'aucune réponse ne
-- référence (booking_answers). Les questions déjà répondues sont seulement
-- DÉSACTIVÉES (conservées pour l'historique). Idempotent tant qu'aucune réponse
-- ne pointe vers la nouvelle version.
-- =============================================================================

begin;

-- 1) Purge des questions sans réponse liée, puis désactivation des survivantes.
delete from questions q
where not exists (select 1 from booking_answers ba where ba.question_id = q.id);
update questions set is_active = false where is_active;

-- 2) Réinsertion de la version courte validée (miroir de supabase/seed.sql §4).

-- ---- Tronc commun (topic_id = null : posé à tous les motifs) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select null, '{tous}'::audience_type[], q.section, q.label, q.type::question_type, q.options, q.required, q.ord
from (values
  -- Votre demande (Bloc A — tronc commun)
  ('Votre demande', $Q$Quelle est votre situation actuelle ?$Q$,                                        'long_text',  null::jsonb, true,  10),
  ('Votre demande', $Q$Depuis combien de temps vivez-vous cette situation ?$Q$,                          'single_choice', '[{"value":"lt6m","label":"Moins de 6 mois"},{"value":"6m1a","label":"6 mois à 1 an"},{"value":"1a3a","label":"1 à 3 ans"},{"value":"3a5a","label":"3 à 5 ans"},{"value":"gt5a","label":"Plus de 5 ans"}]'::jsonb, false, 20),
  ('Votre demande', $Q$Quels sont vos désirs / vos objectifs ?$Q$,                                       'long_text',  null::jsonb, true,  30),
  ('Votre demande', $Q$Vous êtes-vous déjà fait accompagner pour cela ?$Q$,                              'boolean',    null::jsonb, false, 40),
  ('Votre demande', $Q$Si oui, comment cela s'est-il passé ?$Q$,                                         'long_text',  null::jsonb, false, 50),
  -- Vous (Bloc C — suivi consultant)
  ('Vous', $Q$Âge$Q$,                                                                                     'single_choice', '[{"value":"18_24","label":"18 à 24 ans"},{"value":"25_34","label":"25 à 34 ans"},{"value":"35_44","label":"35 à 44 ans"},{"value":"45_54","label":"45 à 54 ans"},{"value":"55_64","label":"55 à 64 ans"},{"value":"65p","label":"65 ans et plus"}]'::jsonb, true,  100),
  ('Vous', $Q$Avez-vous déjà consulté un(e) sexothérapeute / thérapeute ?$Q$,                             'boolean',    null::jsonb, false, 110),
  ('Vous', $Q$Si oui, avec qui, et comment cela s'est passé ?$Q$,                                         'long_text',  null::jsonb, false, 120),
  ('Vous', $Q$Situation affective$Q$,                                                                     'single_choice', '[{"value":"couple","label":"En couple"},{"value":"celibataire","label":"Célibataire"}]'::jsonb, false, 130),
  ('Vous', $Q$Si en couple : depuis combien de temps ? (et prénom du partenaire)$Q$,                      'short_text', null::jsonb, false, 140),
  ('Vous', $Q$Avez-vous des enfants ?$Q$,                                                                 'single_choice', '[{"value":"non","label":"Non"},{"value":"1","label":"Oui, 1 enfant"},{"value":"2","label":"Oui, 2 enfants"},{"value":"3p","label":"Oui, 3 enfants ou plus"}]'::jsonb, false, 150),
  ('Vous', $Q$Profession$Q$,                                                                              'short_text', null::jsonb, false, 160),
  -- Santé (Bloc C — suivi consultant)
  ('Santé', $Q$Antécédents médicaux$Q$,                                                                   'long_text',  null::jsonb, false, 200),
  ('Santé', $Q$Traitements / médicaments en cours$Q$,                                                     'long_text',  null::jsonb, false, 210),
  ('Santé', $Q$Tabac ?$Q$,                                                                                'single_choice', '[{"value":"non","label":"Non"},{"value":"occasionnel","label":"Occasionnellement"},{"value":"lt10","label":"Moins de 10 par jour"},{"value":"10_20","label":"10 à 20 par jour"},{"value":"gt20","label":"Plus de 20 par jour"}]'::jsonb, false, 220),
  ('Santé', $Q$Alcool / drogues ?$Q$,                                                                     'single_choice', '[{"value":"non","label":"Non"},{"value":"occasionnel","label":"Occasionnelle"},{"value":"reguliere","label":"Régulière"},{"value":"quotidienne","label":"Quotidienne"}]'::jsonb, false, 230)
) as q(section, label, type, options, required, ord);

-- ---- Troubles de l'érection (homme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{homme}'::audience_type[], 'Troubles de l''érection', q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ($Q$Depuis quand rencontrez-vous des problèmes d'érection ?$Q$,                                 'single_choice', '[{"value":"lt6m","label":"Moins de 6 mois"},{"value":"6m1a","label":"6 mois à 1 an"},{"value":"1a3a","label":"1 à 3 ans"},{"value":"3a5a","label":"3 à 5 ans"},{"value":"gt5a","label":"Plus de 5 ans"}]'::jsonb, false, 10),
  ($Q$Est-ce à chaque rapport ?$Q$,                                                               'boolean',      null::jsonb, false, 20),
  ($Q$Avez-vous des érections matinales ?$Q$,                                                     'boolean',      null::jsonb, false, 30),
  ($Q$Arrivez-vous à obtenir / maintenir une érection en vous masturbant ?$Q$,                    'boolean',      null::jsonb, false, 40),
  ($Q$À quel moment perdez-vous l'érection ?$Q$,                                                   'multi_choice', '[{"value":"preliminaires","label":"Préliminaires"},{"value":"acte","label":"Pendant l''acte"},{"value":"penetration","label":"À la pénétration"}]'::jsonb, false, 50),
  ($Q$La relation est-elle harmonieuse avant l'acte, ou y a-t-il des tensions ?$Q$,               'long_text',    null::jsonb, false, 60)
) as q(label, type, options, required, ord)
where topics.slug = 'troubles-erectiles';

-- ---- Éjaculation précoce / rapide (homme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{homme}'::audience_type[], q.section, q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ('Éjaculation précoce', $Q$Depuis quand rencontrez-vous cette difficulté ?$Q$,                          'single_choice', '[{"value":"lt6m","label":"Moins de 6 mois"},{"value":"6m1a","label":"6 mois à 1 an"},{"value":"1a3a","label":"1 à 3 ans"},{"value":"3a5a","label":"3 à 5 ans"},{"value":"gt5a","label":"Plus de 5 ans"}]'::jsonb, false, 10),
  ('Éjaculation précoce', $Q$Est-ce à chaque rapport ?$Q$,                                                'boolean',      null::jsonb, false, 20),
  ('Éjaculation précoce', $Q$De temps en temps ou tout le temps ?$Q$,                                     'single_choice','[{"value":"parfois","label":"De temps en temps"},{"value":"toujours","label":"Tout le temps"}]'::jsonb, false, 30),
  ('Éjaculation précoce', $Q$Arrivez-vous à contrôler / faire durer le plaisir en vous masturbant ?$Q$,   'boolean',      null::jsonb, false, 40),
  ('Éjaculation précoce', $Q$Quand éjaculez-vous ?$Q$,                                                     'single_choice','[{"value":"avant_prelim","label":"Avant les préliminaires"},{"value":"pendant_prelim","label":"Pendant les préliminaires"},{"value":"avant_penet","label":"Avant la pénétration"},{"value":"pendant_penet","label":"Pendant la pénétration"}]'::jsonb, false, 50)
) as q(section, label, type, options, required, ord)
where topics.slug = 'ejaculation-precoce';

-- ---- Éjaculation tardive / anéjaculation (homme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{homme}'::audience_type[], 'Éjaculation tardive / anéjaculation', q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ($Q$Depuis quand rencontrez-vous cette difficulté ?$Q$,                                         'single_choice', '[{"value":"lt6m","label":"Moins de 6 mois"},{"value":"6m1a","label":"6 mois à 1 an"},{"value":"1a3a","label":"1 à 3 ans"},{"value":"3a5a","label":"3 à 5 ans"},{"value":"gt5a","label":"Plus de 5 ans"}]'::jsonb, false, 10),
  ($Q$Est-ce à chaque rapport ?$Q$,                                                               'boolean',      null::jsonb, false, 20),
  ($Q$Lors d'une masturbation solo, tout fonctionne-t-il normalement ?$Q$,                        'boolean',      null::jsonb, false, 30),
  ($Q$Que se passe-t-il pour vous à ce moment ? Quelles sont vos pensées ?$Q$,                    'long_text',    null::jsonb, false, 40),
  ($Q$Avez-vous vécu un changement de vie récent / un événement marquant ?$Q$,                    'long_text',    null::jsonb, false, 50)
) as q(label, type, options, required, ord)
where topics.slug = 'ejaculation-tardive';

-- ---- Troubles du désir (femme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{femme}'::audience_type[], 'Troubles du désir', q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ($Q$Depuis quand ressentez-vous une baisse / absence de désir ?$Q$,                             'single_choice', '[{"value":"lt6m","label":"Moins de 6 mois"},{"value":"6m1a","label":"6 mois à 1 an"},{"value":"1a3a","label":"1 à 3 ans"},{"value":"3a5a","label":"3 à 5 ans"},{"value":"gt5a","label":"Plus de 5 ans"}]'::jsonb, false, 10),
  ($Q$Avez-vous déjà ressenti du désir ? Si oui, quand ?$Q$,                                       'long_text',  null::jsonb, false, 20),
  ($Q$Un événement particulier a-t-il précédé cette baisse ?$Q$,                                   'long_text',  null::jsonb, false, 30),
  ($Q$Êtes-vous suffisamment excitée ? L'êtes-vous par votre partenaire ?$Q$,                      'long_text',  null::jsonb, false, 40),
  ($Q$Avez-vous déjà eu des orgasmes ?$Q$,                                                          'boolean',    null::jsonb, false, 50)
) as q(label, type, options, required, ord)
where topics.slug = 'troubles-du-desir';

-- ---- Anorgasmie (femme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{femme}'::audience_type[], 'Anorgasmie', q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ($Q$Depuis quand rencontrez-vous cette difficulté à atteindre l'orgasme ?$Q$,                   'single_choice', '[{"value":"lt6m","label":"Moins de 6 mois"},{"value":"6m1a","label":"6 mois à 1 an"},{"value":"1a3a","label":"1 à 3 ans"},{"value":"3a5a","label":"3 à 5 ans"},{"value":"gt5a","label":"Plus de 5 ans"}]'::jsonb, false, 10),
  ($Q$Est-ce présent depuis toujours, ou apparu à un moment ?$Q$,                                 'single_choice','[{"value":"toujours","label":"Depuis toujours"},{"value":"recent","label":"Apparu récemment"}]'::jsonb, false, 20),
  ($Q$Cela se produit-il seule, avec un partenaire, ou les deux ?$Q$,                             'single_choice','[{"value":"seule","label":"Seule"},{"value":"partenaire","label":"Avec un partenaire"},{"value":"deux","label":"Les deux"}]'::jsonb, false, 30),
  ($Q$Ressentez-vous du désir ?$Q$,                                                                'boolean',      null::jsonb, false, 40),
  ($Q$Comment se passe la relation avec votre partenaire ?$Q$,                                     'long_text',    null::jsonb, false, 50)
) as q(label, type, options, required, ord)
where topics.slug = 'anorgasmie';

-- ---- Vaginisme (femme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{femme}'::audience_type[], 'Vaginisme', q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ($Q$Depuis quand cette difficulté est-elle présente ?$Q$,                                       'single_choice', '[{"value":"lt6m","label":"Moins de 6 mois"},{"value":"6m1a","label":"6 mois à 1 an"},{"value":"1a3a","label":"1 à 3 ans"},{"value":"3a5a","label":"3 à 5 ans"},{"value":"gt5a","label":"Plus de 5 ans"}]'::jsonb, false, 10),
  ($Q$Est-ce depuis toujours, ou apparu à un moment ?$Q$,                                         'single_choice','[{"value":"toujours","label":"Depuis toujours"},{"value":"recent","label":"Apparu récemment"}]'::jsonb, false, 20),
  ($Q$Arrivez-vous à insérer un tampon (ou autre), ou rien ne peut entrer ?$Q$,                   'single_choice','[{"value":"tampon","label":"J''arrive à insérer un tampon"},{"value":"rien","label":"Rien ne peut entrer"}]'::jsonb, false, 30),
  ($Q$À quel endroit ressentez-vous la douleur ? (ex. entrée du vagin)$Q$,                        'short_text',   null::jsonb, false, 40),
  ($Q$Comment se passe la relation avec votre partenaire ?$Q$,                                     'long_text',    null::jsonb, false, 50)
) as q(label, type, options, required, ord)
where topics.slug = 'vaginisme';

-- ---- Dyspareunies / douleurs (femme) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{femme}'::audience_type[], 'Dyspareunies (douleurs)', q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ($Q$Depuis quand ressentez-vous ces douleurs ?$Q$,                                              'single_choice', '[{"value":"lt6m","label":"Moins de 6 mois"},{"value":"6m1a","label":"6 mois à 1 an"},{"value":"1a3a","label":"1 à 3 ans"},{"value":"3a5a","label":"3 à 5 ans"},{"value":"gt5a","label":"Plus de 5 ans"}]'::jsonb, false, 10),
  ($Q$Cela se produit-il seule, avec un partenaire, ou les deux ?$Q$,                             'single_choice','[{"value":"seule","label":"Seule"},{"value":"partenaire","label":"Avec un partenaire"},{"value":"deux","label":"Les deux"}]'::jsonb, false, 20),
  ($Q$Douleurs à l'intérieur ou à l'extérieur du vagin ?$Q$,                                      'single_choice','[{"value":"interieur","label":"Intérieur"},{"value":"exterieur","label":"Extérieur"},{"value":"deux","label":"Les deux"}]'::jsonb, false, 30),
  ($Q$Quelle est son intensité ?$Q$,                                                               'scale',        null::jsonb, false, 40),
  ($Q$Comment se passe la pénétration ? (les préliminaires vous laissent-ils le temps d'être prête ?)$Q$, 'long_text', null::jsonb, false, 50)
) as q(label, type, options, required, ord)
where topics.slug = 'dyspareunies';

update questions set help_text = '0 = aucune douleur · 4 = douleur très intense'
where topic_id = (select id from topics where slug = 'dyspareunies') and type = 'scale' and is_active;

-- ---- Addiction à la masturbation (tous) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{tous}'::audience_type[], q.section, q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ('Fréquence et durée', $Q$Combien de fois par jour/semaine ressentez-vous le besoin de vous masturber ?$Q$, 'single_choice', '[{"value":"sem","label":"Quelques fois par semaine"},{"value":"1j","label":"Environ 1 fois par jour"},{"value":"plusj","label":"Plusieurs fois par jour"},{"value":"permanent","label":"De façon quasi permanente"}]'::jsonb, false, 10),
  ('Contexte et déclencheurs', $Q$Quels sont les déclencheurs qui vous y poussent ?$Q$, 'multi_choice', '[{"value":"ennui","label":"Ennui"},{"value":"stress","label":"Stress"},{"value":"solitude","label":"Solitude"},{"value":"anxiete","label":"Anxiété"},{"value":"fatigue","label":"Fatigue"},{"value":"habitude","label":"Habitude"},{"value":"autre","label":"Autre"}]'::jsonb, false, 20),
  ('Contrôle', $Q$Ressentez-vous une perte de contrôle ?$Q$,                                       'boolean',   null::jsonb, false, 30),
  ('Impact', $Q$En quoi cela affecte-t-il votre quotidien, vos relations, votre travail ?$Q$,      'long_text', null::jsonb, false, 40),
  ('Motivation / historique', $Q$Depuis quand ce comportement a-t-il commencé ?$Q$,                'single_choice', '[{"value":"lt6m","label":"Moins de 6 mois"},{"value":"6m1a","label":"6 mois à 1 an"},{"value":"1a3a","label":"1 à 3 ans"},{"value":"3a5a","label":"3 à 5 ans"},{"value":"gt5a","label":"Plus de 5 ans"}]'::jsonb, false, 50)
) as q(section, label, type, options, required, ord)
where topics.slug = 'addiction-masturbation';

-- ---- Addiction à la pornographie (tous) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{tous}'::audience_type[], q.section, q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ('Types de contenu', $Q$Quels genres regardez-vous le plus souvent ?$Q$,                         'long_text',  null::jsonb, false, 10),
  ('Historique', $Q$Depuis combien de temps en regardez-vous ?$Q$,                                 'single_choice', '[{"value":"lt6m","label":"Moins de 6 mois"},{"value":"6m1a","label":"6 mois à 1 an"},{"value":"1a3a","label":"1 à 3 ans"},{"value":"3a5a","label":"3 à 5 ans"},{"value":"gt5a","label":"Plus de 5 ans"}]'::jsonb, false, 20),
  ('Historique', $Q$Comment votre consommation a-t-elle évolué ?$Q$,                                'single_choice', '[{"value":"hausse","label":"En augmentation"},{"value":"stable","label":"Stable"},{"value":"baisse","label":"En diminution"},{"value":"variable","label":"En dents de scie"}]'::jsonb, false, 30)
) as q(section, label, type, options, required, ord)
where topics.slug = 'addiction-pornographie';

-- ---- Couple : demande (version courte prospect ; le test Dallaire se fait en séance) ----
insert into questions (topic_id, audiences, section, label, type, options, required, sort_order)
select id, '{couple}'::audience_type[], q.section, q.label, q.type::question_type, q.options, q.required, q.ord
from topics, (values
  ('Votre demande (couple)', $Q$Qu'est-ce qui vous amène à consulter en couple aujourd'hui ?$Q$,   'long_text',  null::jsonb, true,  10),
  ('Votre demande (couple)', $Q$Depuis combien de temps êtes-vous ensemble ?$Q$,                   'single_choice', '[{"value":"lt1a","label":"Moins d''1 an"},{"value":"1a3a","label":"1 à 3 ans"},{"value":"3a5a","label":"3 à 5 ans"},{"value":"5a10a","label":"5 à 10 ans"},{"value":"gt10a","label":"Plus de 10 ans"}]'::jsonb, false, 20),
  ('Votre demande (couple)', $Q$Y a-t-il un décalage de désir entre vous ?$Q$,                     'long_text',  null::jsonb, false, 30),
  ('Votre demande (couple)', $Q$Comment communiquez-vous autour de la sexualité ?$Q$,              'long_text',  null::jsonb, false, 40),
  ('Votre demande (couple)', $Q$Qu'attendez-vous de cet accompagnement ?$Q$,                       'long_text',  null::jsonb, true,  50)
) as q(section, label, type, options, required, ord)
where topics.slug = 'couple';

commit;
