-- 0004_questions_i18n_en.sql
-- =============================================================================
-- Traduction anglaise du questionnaire (version courte prospect).
--   • label_en / help_text_en des questions  (appariées par leur libellé FR)
--   • label_en de CHAQUE option              (dictionnaire FR → EN, un seul UPDATE)
-- Le front lit déjà pick(locale, label, label_en) → l'anglais s'active tout seul.
-- Idempotent : ré-exécutable sans effet de bord (réécrit les mêmes valeurs).
-- =============================================================================

begin;

-- ── A) Libellés des questions ────────────────────────────────────────────────
update questions q set label_en = m.en
from (values
  -- Tronc commun
  ($Q$Quelle est votre situation actuelle ?$Q$,                          $E$What is your current situation?$E$),
  ($Q$Depuis combien de temps vivez-vous cette situation ?$Q$,           $E$How long have you been experiencing this?$E$),
  ($Q$Quels sont vos désirs / vos objectifs ?$Q$,                        $E$What are your desires / goals?$E$),
  ($Q$Vous êtes-vous déjà fait accompagner pour cela ?$Q$,               $E$Have you ever received support for this?$E$),
  ($Q$Si oui, comment cela s'est-il passé ?$Q$,                          $E$If so, how did it go?$E$),
  ($Q$Âge$Q$,                                                            $E$Age$E$),
  ($Q$Avez-vous déjà consulté un(e) sexothérapeute / thérapeute ?$Q$,    $E$Have you ever seen a sex therapist / therapist?$E$),
  ($Q$Si oui, avec qui, et comment cela s'est passé ?$Q$,                $E$If so, with whom, and how did it go?$E$),
  ($Q$Situation affective$Q$,                                            $E$Relationship status$E$),
  ($Q$Si en couple : depuis combien de temps ? (et prénom du partenaire)$Q$, $E$If in a relationship: for how long? (and partner's first name)$E$),
  ($Q$Avez-vous des enfants ?$Q$,                                        $E$Do you have children?$E$),
  ($Q$Profession$Q$,                                                     $E$Occupation$E$),
  ($Q$Antécédents médicaux$Q$,                                           $E$Medical history$E$),
  ($Q$Traitements / médicaments en cours$Q$,                             $E$Current treatments / medication$E$),
  ($Q$Tabac ?$Q$,                                                        $E$Tobacco?$E$),
  ($Q$Alcool / drogues ?$Q$,                                             $E$Alcohol / drugs?$E$),
  -- Troubles de l'érection
  ($Q$Depuis quand rencontrez-vous des problèmes d'érection ?$Q$,        $E$How long have you been having erection problems?$E$),
  ($Q$Est-ce à chaque rapport ?$Q$,                                      $E$Is it every time?$E$),
  ($Q$Avez-vous des érections matinales ?$Q$,                            $E$Do you have morning erections?$E$),
  ($Q$Arrivez-vous à obtenir / maintenir une érection en vous masturbant ?$Q$, $E$Can you get / maintain an erection while masturbating?$E$),
  ($Q$À quel moment perdez-vous l'érection ?$Q$,                         $E$When do you lose the erection?$E$),
  ($Q$La relation est-elle harmonieuse avant l'acte, ou y a-t-il des tensions ?$Q$, $E$Is the relationship harmonious before intercourse, or are there tensions?$E$),
  -- Éjaculation précoce
  ($Q$Depuis quand rencontrez-vous cette difficulté ?$Q$,                $E$How long have you been experiencing this difficulty?$E$),
  ($Q$De temps en temps ou tout le temps ?$Q$,                          $E$Occasionally or all the time?$E$),
  ($Q$Arrivez-vous à contrôler / faire durer le plaisir en vous masturbant ?$Q$, $E$Can you control / prolong pleasure while masturbating?$E$),
  ($Q$Quand éjaculez-vous ?$Q$,                                          $E$When do you ejaculate?$E$),
  -- Éjaculation tardive
  ($Q$Lors d'une masturbation solo, tout fonctionne-t-il normalement ?$Q$, $E$During solo masturbation, does everything work normally?$E$),
  ($Q$Que se passe-t-il pour vous à ce moment ? Quelles sont vos pensées ?$Q$, $E$What happens for you at that moment? What are your thoughts?$E$),
  ($Q$Avez-vous vécu un changement de vie récent / un événement marquant ?$Q$, $E$Have you experienced a recent life change / a significant event?$E$),
  -- Troubles du désir
  ($Q$Depuis quand ressentez-vous une baisse / absence de désir ?$Q$,    $E$How long have you felt a decrease / absence of desire?$E$),
  ($Q$Avez-vous déjà ressenti du désir ? Si oui, quand ?$Q$,             $E$Have you ever felt desire? If so, when?$E$),
  ($Q$Un événement particulier a-t-il précédé cette baisse ?$Q$,         $E$Did a particular event precede this decline?$E$),
  ($Q$Êtes-vous suffisamment excitée ? L'êtes-vous par votre partenaire ?$Q$, $E$Are you sufficiently aroused? Are you aroused by your partner?$E$),
  ($Q$Avez-vous déjà eu des orgasmes ?$Q$,                               $E$Have you ever had orgasms?$E$),
  -- Anorgasmie
  ($Q$Depuis quand rencontrez-vous cette difficulté à atteindre l'orgasme ?$Q$, $E$How long have you had this difficulty reaching orgasm?$E$),
  ($Q$Est-ce présent depuis toujours, ou apparu à un moment ?$Q$,        $E$Has it always been present, or did it appear at some point?$E$),
  ($Q$Cela se produit-il seule, avec un partenaire, ou les deux ?$Q$,    $E$Does it happen alone, with a partner, or both?$E$),
  ($Q$Ressentez-vous du désir ?$Q$,                                      $E$Do you feel desire?$E$),
  ($Q$Comment se passe la relation avec votre partenaire ?$Q$,           $E$How is the relationship with your partner?$E$),
  -- Vaginisme
  ($Q$Depuis quand cette difficulté est-elle présente ?$Q$,             $E$How long has this difficulty been present?$E$),
  ($Q$Est-ce depuis toujours, ou apparu à un moment ?$Q$,               $E$Has it always been so, or did it appear at some point?$E$),
  ($Q$Arrivez-vous à insérer un tampon (ou autre), ou rien ne peut entrer ?$Q$, $E$Can you insert a tampon (or other), or can nothing go in?$E$),
  ($Q$À quel endroit ressentez-vous la douleur ? (ex. entrée du vagin)$Q$, $E$Where do you feel the pain? (e.g. entrance of the vagina)$E$),
  -- Dyspareunies
  ($Q$Depuis quand ressentez-vous ces douleurs ?$Q$,                    $E$How long have you been feeling this pain?$E$),
  ($Q$Douleurs à l'intérieur ou à l'extérieur du vagin ?$Q$,            $E$Pain inside or outside the vagina?$E$),
  ($Q$Quelle est son intensité ?$Q$,                                    $E$How intense is it?$E$),
  ($Q$Comment se passe la pénétration ? (les préliminaires vous laissent-ils le temps d'être prête ?)$Q$, $E$How does penetration go? (do the preliminaries give you time to be ready?)$E$),
  -- Addiction à la masturbation
  ($Q$Combien de fois par jour/semaine ressentez-vous le besoin de vous masturber ?$Q$, $E$How many times per day/week do you feel the need to masturbate?$E$),
  ($Q$Quels sont les déclencheurs qui vous y poussent ?$Q$,             $E$What are the triggers that drive you to it?$E$),
  ($Q$Ressentez-vous une perte de contrôle ?$Q$,                        $E$Do you feel a loss of control?$E$),
  ($Q$En quoi cela affecte-t-il votre quotidien, vos relations, votre travail ?$Q$, $E$How does it affect your daily life, your relationships, your work?$E$),
  ($Q$Depuis quand ce comportement a-t-il commencé ?$Q$,                $E$When did this behavior start?$E$),
  -- Addiction à la pornographie
  ($Q$Quels genres regardez-vous le plus souvent ?$Q$,                  $E$What genres do you watch most often?$E$),
  ($Q$Depuis combien de temps en regardez-vous ?$Q$,                    $E$How long have you been watching it?$E$),
  ($Q$Comment votre consommation a-t-elle évolué ?$Q$,                  $E$How has your consumption evolved?$E$),
  -- Couple
  ($Q$Qu'est-ce qui vous amène à consulter en couple aujourd'hui ?$Q$,  $E$What brings you to seek couples therapy today?$E$),
  ($Q$Depuis combien de temps êtes-vous ensemble ?$Q$,                  $E$How long have you been together?$E$),
  ($Q$Y a-t-il un décalage de désir entre vous ?$Q$,                    $E$Is there a desire gap between you?$E$),
  ($Q$Comment communiquez-vous autour de la sexualité ?$Q$,             $E$How do you communicate about sexuality?$E$),
  ($Q$Qu'attendez-vous de cet accompagnement ?$Q$,                      $E$What do you expect from this support?$E$)
) as m(fr, en)
where q.label = m.fr;

-- Aide de l'échelle (dyspareunies)
update questions set help_text_en = $E$0 = no pain · 4 = very intense pain$E$
where help_text = $Q$0 = aucune douleur · 4 = douleur très intense$Q$;

-- ── B) label_en de chaque option (dictionnaire FR → EN) ──────────────────────
with dict(fr, en) as (values
  -- Ancienneté / durée
  ($Q$Moins de 6 mois$Q$, $E$Less than 6 months$E$),
  ($Q$6 mois à 1 an$Q$,   $E$6 months to 1 year$E$),
  ($Q$1 à 3 ans$Q$,       $E$1 to 3 years$E$),
  ($Q$3 à 5 ans$Q$,       $E$3 to 5 years$E$),
  ($Q$Plus de 5 ans$Q$,   $E$More than 5 years$E$),
  -- Âge
  ($Q$18 à 24 ans$Q$,     $E$18 to 24$E$),
  ($Q$25 à 34 ans$Q$,     $E$25 to 34$E$),
  ($Q$35 à 44 ans$Q$,     $E$35 to 44$E$),
  ($Q$45 à 54 ans$Q$,     $E$45 to 54$E$),
  ($Q$55 à 64 ans$Q$,     $E$55 to 64$E$),
  ($Q$65 ans et plus$Q$,  $E$65 and over$E$),
  -- Situation affective
  ($Q$En couple$Q$,       $E$In a relationship$E$),
  ($Q$Célibataire$Q$,     $E$Single$E$),
  -- Enfants
  ($Q$Non$Q$,                     $E$No$E$),
  ($Q$Oui, 1 enfant$Q$,           $E$Yes, 1 child$E$),
  ($Q$Oui, 2 enfants$Q$,          $E$Yes, 2 children$E$),
  ($Q$Oui, 3 enfants ou plus$Q$,  $E$Yes, 3 or more children$E$),
  -- Tabac
  ($Q$Occasionnellement$Q$,   $E$Occasionally$E$),
  ($Q$Moins de 10 par jour$Q$, $E$Fewer than 10 a day$E$),
  ($Q$10 à 20 par jour$Q$,     $E$10 to 20 a day$E$),
  ($Q$Plus de 20 par jour$Q$,  $E$More than 20 a day$E$),
  -- Alcool / drogues
  ($Q$Occasionnelle$Q$,   $E$Occasional$E$),
  ($Q$Régulière$Q$,       $E$Regular$E$),
  ($Q$Quotidienne$Q$,     $E$Daily$E$),
  -- Perte d'érection (moment)
  ($Q$Préliminaires$Q$,       $E$Foreplay$E$),
  ($Q$Pendant l'acte$Q$,      $E$During intercourse$E$),
  ($Q$À la pénétration$Q$,    $E$At penetration$E$),
  -- Fréquence éjaculation
  ($Q$De temps en temps$Q$,   $E$From time to time$E$),
  ($Q$Tout le temps$Q$,       $E$All the time$E$),
  ($Q$Avant les préliminaires$Q$,   $E$Before foreplay$E$),
  ($Q$Pendant les préliminaires$Q$, $E$During foreplay$E$),
  ($Q$Avant la pénétration$Q$,      $E$Before penetration$E$),
  ($Q$Pendant la pénétration$Q$,    $E$During penetration$E$),
  -- Depuis toujours / récent
  ($Q$Depuis toujours$Q$,     $E$Always$E$),
  ($Q$Apparu récemment$Q$,    $E$Appeared recently$E$),
  -- Seule / partenaire / deux
  ($Q$Seule$Q$,               $E$Alone$E$),
  ($Q$Avec un partenaire$Q$,  $E$With a partner$E$),
  ($Q$Les deux$Q$,            $E$Both$E$),
  -- Vaginisme
  ($Q$J'arrive à insérer un tampon$Q$, $E$I can insert a tampon$E$),
  ($Q$Rien ne peut entrer$Q$,          $E$Nothing can go in$E$),
  -- Dyspareunies (localisation)
  ($Q$Intérieur$Q$,           $E$Inside$E$),
  ($Q$Extérieur$Q$,           $E$Outside$E$),
  -- Addiction masturbation (fréquence)
  ($Q$Quelques fois par semaine$Q$,  $E$A few times a week$E$),
  ($Q$Environ 1 fois par jour$Q$,     $E$About once a day$E$),
  ($Q$Plusieurs fois par jour$Q$,     $E$Several times a day$E$),
  ($Q$De façon quasi permanente$Q$,   $E$Almost constantly$E$),
  -- Déclencheurs
  ($Q$Ennui$Q$,      $E$Boredom$E$),
  ($Q$Stress$Q$,     $E$Stress$E$),
  ($Q$Solitude$Q$,   $E$Loneliness$E$),
  ($Q$Anxiété$Q$,    $E$Anxiety$E$),
  ($Q$Fatigue$Q$,    $E$Fatigue$E$),
  ($Q$Habitude$Q$,   $E$Habit$E$),
  ($Q$Autre$Q$,      $E$Other$E$),
  -- Évolution consommation
  ($Q$En augmentation$Q$,  $E$Increasing$E$),
  ($Q$Stable$Q$,           $E$Stable$E$),
  ($Q$En diminution$Q$,    $E$Decreasing$E$),
  ($Q$En dents de scie$Q$, $E$Up and down$E$),
  -- Durée du couple
  ($Q$Moins d'1 an$Q$,     $E$Less than 1 year$E$),
  ($Q$5 à 10 ans$Q$,       $E$5 to 10 years$E$),
  ($Q$Plus de 10 ans$Q$,   $E$More than 10 years$E$)
)
update questions q
set options = (
  select jsonb_agg(
    case when d.en is not null
      then e.opt || jsonb_build_object('label_en', d.en)
      else e.opt
    end
    order by e.ord
  )
  from jsonb_array_elements(q.options) with ordinality as e(opt, ord)
  left join dict d on d.fr = (e.opt->>'label')
)
where q.options is not null and jsonb_typeof(q.options) = 'array';

commit;
