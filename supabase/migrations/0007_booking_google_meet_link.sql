-- 0007 — Lien Google Meet des rendez-vous en visioconférence.
-- Rempli par stripe-webhook à la confirmation du paiement (conferenceData.createRequest),
-- puis affiché à l'admin et communiqué au client. Additif et nullable : sans impact sur l'existant.

alter table bookings add column if not exists google_meet_link text;
