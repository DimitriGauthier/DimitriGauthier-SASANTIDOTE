-- 0008 — Planification des tâches récurrentes (pg_cron).
-- Deux jobs manquaient de déclencheur : sans eux, les holds abandonnés bloquent
-- définitivement leur créneau, et les rappels 14h ne partent jamais.
--
--  • expire-holds   : PUR SQL, chaque minute. Aucune dépendance réseau, aucun secret.
--  • send-reminders : appelle l'Edge Function (envoi d'emails via Resend), toutes les 15 min.
--
-- Idempotent : réexécutable sans effet de bord (on retire les jobs homonymes avant de recréer).

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Nettoyage préalable (permet de rejouer la migration proprement).
select cron.unschedule(jobid) from cron.job where jobname in ('expire-holds', 'send-reminders');

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) EXPIRE-HOLDS — pur SQL, robuste. Libère les holds expirés + solde les paiements jamais réglés.
--    Reproduit exactement la logique de l'Edge Function expire-holds, sans HTTP.
-- ─────────────────────────────────────────────────────────────────────────────
select cron.schedule('expire-holds', '* * * * *', $job$
  with released as (
    update bookings
       set status = 'cancelled',
           cancelled_at = now(),
           cancel_reason = 'hold_expired'
     where status = 'hold'
       and hold_expires_at < now()
    returning id
  )
  update payments
     set status = 'failed'
   where booking_id in (select id from released)
     and status = 'created';
$job$);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) SEND-REMINDERS — appel HTTP à l'Edge Function (elle seule peut envoyer via Resend).
--    L'URL des functions est publique (embarquée) ; la clé anon et le secret de cron
--    sont lus depuis Supabase Vault → AUCUN secret n'est stocké dans le dépôt Git.
--
--    ⚙️  PRÉ-REQUIS (une seule fois, dans le SQL editor Supabase, avec les vraies valeurs) :
--        select vault.create_secret('<ANON_KEY publique>',           'edge_anon_key');
--        select vault.create_secret('<SEND_REMINDERS_SECRET ou "">', 'send_reminders_secret');
--    (Si aucun SEND_REMINDERS_SECRET n'est défini côté Edge Function, le header est simplement ignoré.)
-- ─────────────────────────────────────────────────────────────────────────────
select cron.schedule('send-reminders', '*/15 * * * *', $job$
  select net.http_post(
    url := 'https://gobhqjsuaweexrowtwto.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'apikey',        (select decrypted_secret from vault.decrypted_secrets where name = 'edge_anon_key'),
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'edge_anon_key'),
      'x-cron-secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'send_reminders_secret'), '')
    ),
    body := '{}'::jsonb
  );
$job$);
