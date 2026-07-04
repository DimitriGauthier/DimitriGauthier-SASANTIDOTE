# Site Dimitri Gauthier — sexothérapie · TRAME® · numérologie

Site de prise de rendez-vous (Next.js App Router + Supabase + Stripe + Google Agenda).
Bilingue FR/EN (`[locale]`, FR par défaut, fallback FR si contenu EN vide).

> **État actuel : « codé, pas encore câblé ».** L'app démarre et se build **sans aucune
> variable d'environnement** — toutes les lectures de données renvoient des états vides propres,
> et les écritures répondent `202` (accepté, non persisté). Le branchement des services réels
> (Supabase, Stripe, Google, e-mails) se fait au moment voulu (voir la checklist plus bas).

## Démarrage local (mode placeholder)

```bash
npm install
npm run dev          # http://localhost:3000  → redirige vers /fr
```

`npm run build` et `npx tsc --noEmit` passent sans configuration.

## Architecture

```
web/                         Frontend Next.js (ce dossier)
  src/app/[locale]/(public)/  Pages publiques (accueil, à-propos, tarifs, blog, contact, réservation…)
  src/app/[locale]/admin/     Espace admin : login (hors garde) + (dash) protégé par requireAdmin()
  src/app/api/contact         Route handler service-role → insère un message de contact
  src/app/api/review          Route handler service-role → enregistre un avis via invite_token
  src/lib/                    env, i18n (pick), site config, clients Supabase (browser/server/admin), data readers
  src/components/booking/     Tunnel de réservation (profil → motif → questionnaire → créneau → paiement)

../supabase/                 Backend (déployé séparément, hors Vercel)
  migrations/0001_init.sql    Schéma complet (14 tables, RLS, is_admin())
  seed.sql                    Contenus initiaux (settings, services, topics, questions, dispos, pages légales)
  functions/                  Edge Functions Deno : get-slots, create-hold, complete-booking,
                              stripe-webhook, expire-holds
```

**Flux réservation :** `get-slots` calcule les créneaux libres (dispos − Google FreeBusy − holds actifs)
→ `create-hold` pose un hold de 10 min + crée la session Stripe Checkout → paiement → `stripe-webhook`
confirme le RDV et crée l'événement Google → `expire-holds` (cron) libère les holds non payés.

## Variables d'environnement

### Frontend (Next.js — `web/.env.local`, cf. `.env.local.example`)
| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon (lecture publique + auth admin) |
| `NEXT_PUBLIC_FUNCTIONS_URL` | Base des Edge Functions (vide → déduit de l'URL Supabase) |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (liens de retour Stripe) |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `fr` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Serveur only.** Utilisé par `/api/contact` et `/api/review` |

### Backend (Edge Functions — secrets Supabase, jamais dans le repo)
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_URL`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`,
`RESEND_API_KEY` (e-mails), `EXPIRE_HOLDS_SECRET` (protège le cron).

## Checklist de câblage (à faire quand Habib donne le feu vert)

1. **Projet Supabase** — créer le projet, récupérer URL + clés (anon / service-role).
2. **Schéma** — appliquer `supabase/migrations/0001_init.sql`.
3. **Contenus** — appliquer `supabase/seed.sql`
   (⚠️ à exécuter **une seule fois** ; vérifier au préalable les **prix** des services et les **plages
   de disponibilité**, qui sont des placeholders).
4. **Compte admin de Dimitri** — créer l'utilisateur (Auth Supabase), puis l'enregistrer :
   ```sql
   insert into app_admins (user_id)
   select id from auth.users where email = 'dimitrigauthier974@gmail.com'
   on conflict do nothing;
   ```
5. **Edge Functions** — `supabase functions deploy get-slots create-hold complete-booking stripe-webhook expire-holds`
   et renseigner les secrets (`supabase secrets set …`).
6. **Stripe** — clé secrète + endpoint webhook (`…/functions/v1/stripe-webhook`) → `STRIPE_WEBHOOK_SECRET`.
7. **Google Agenda** — OAuth (client ID/secret + redirect), connexion depuis Admin › Paramètres.
   Le `refresh_token` est stocké côté serveur (**Supabase Vault** en prod), jamais exposé au navigateur.
8. **Cron `expire-holds`** — planifier ~chaque minute (Supabase Scheduled Functions / `pg_cron`),
   en passant le header `x-cron-secret: $EXPIRE_HOLDS_SECRET`.
9. **Frontend** — remplir `web/.env.local` puis déployer (Vercel).

## Notes

- **Sécurité :** le public (clé anon) ne fait **aucune écriture directe**. `bookings`, `booking_answers`,
  `payments` passent par les Edge Functions (service-role) ; `contact_messages` et `reviews` par les
  route handlers Next.js en service-role. L'admin écrit via le client navigateur (RLS `is_admin()`).
- **Design :** volontairement neutre pour l'instant — la refonte visuelle est la dernière étape.
- **Questionnaires :** le contenu clinique du seed est un **brouillon** (doc 06) à valider avec Dimitri.
