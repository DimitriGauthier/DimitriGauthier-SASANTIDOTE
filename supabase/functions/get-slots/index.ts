// get-slots — Moteur de créneaux.
// Créneaux libres = horaires d'ouverture (availability_rules)
//   − occupé Google Calendar (FreeBusy) − holds/RDV actifs en base.
// Public (verify_jwt=false). Aucune écriture. Tout est calculé en UTC, généré depuis l'heure locale Réunion.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { cors, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/supabase.ts";
import { getAccessToken, freeBusy, Interval } from "../_shared/google.ts";

const TZ_OFFSET = "+04:00"; // Indian/Reunion, sans changement d'heure

// yyyy-mm-dd du jour "local Réunion" pour un instant donné
function reunionDay(d: Date): string {
  return new Date(d.getTime() + 4 * 3600_000).toISOString().slice(0, 10);
}
// Ajoute n jours à une date yyyy-mm-dd
function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
// Jour de la semaine (0=dimanche) d'une date calendaire
function weekdayOf(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}
// "HH:MM:SS" -> minutes
function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function pad(n: number): string {
  return String(n).padStart(2, "0");
}
// Instant UTC d'une heure locale (minutes) un jour donné
function localToUtc(dateStr: string, minutes: number): Date {
  return new Date(`${dateStr}T${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}:00${TZ_OFFSET}`);
}
// Chevauchement de deux intervalles [aS,aE) et [bS,bE)
function overlaps(aS: Date, aE: Date, bS: Date, bE: Date): boolean {
  return aS.getTime() < bE.getTime() && bS.getTime() < aE.getTime();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { service_id, from, days } = await req.json().catch(() => ({}));
    if (!service_id) return json({ error: "service_id requis" }, 400);

    const admin = adminClient();

    const { data: service, error: sErr } = await admin
      .from("services").select("*").eq("id", service_id).eq("is_active", true).single();
    if (sErr || !service) return json({ error: "service introuvable" }, 404);

    const { data: settings } = await admin.from("settings").select("*").eq("id", 1).single();
    const minNoticeH = settings?.min_notice_hours ?? 24;
    const maxAdvanceD = settings?.max_advance_days ?? 60;
    const buffer = settings?.buffer_min ?? 0;
    const duration = service.duration_min as number;
    const step = duration + buffer;

    const now = new Date();
    const notBefore = new Date(now.getTime() + minNoticeH * 3600_000);
    const startDay = from ?? reunionDay(now);
    const nDays = Math.min(days ?? 14, maxAdvanceD);
    const endDay = addDays(startDay, nDays);

    // Fenêtre de calcul (UTC)
    const windowMin = localToUtc(startDay, 0).toISOString();
    const windowMax = localToUtc(endDay, 0).toISOString();

    // 1) Occupé Google Calendar
    let busy: Interval[] = [];
    try {
      const { token, calendarId } = await getAccessToken(admin);
      busy = await freeBusy(token, calendarId, windowMin, windowMax);
    } catch (_e) {
      // Google non connecté / erreur : on continue avec seulement les holds internes.
    }

    // 2) Holds + RDV actifs en base (Google peut ne pas encore les refléter)
    const { data: activeBookings } = await admin
      .from("bookings")
      .select("slot_start, slot_end, status, hold_expires_at")
      .in("status", ["hold", "scheduled"])
      .lt("slot_start", windowMax)
      .gt("slot_end", windowMin);
    for (const b of activeBookings ?? []) {
      if (b.status === "hold" && b.hold_expires_at && new Date(b.hold_expires_at) < now) continue; // hold expiré
      busy.push({ start: new Date(b.slot_start), end: new Date(b.slot_end) });
    }

    // 3) Génération jour par jour
    const { data: rules } = await admin
      .from("availability_rules").select("*").eq("is_active", true);
    const byWeekday = new Map<number, { start_time: string; end_time: string }[]>();
    for (const r of rules ?? []) {
      const arr = byWeekday.get(r.weekday) ?? [];
      arr.push(r);
      byWeekday.set(r.weekday, arr);
    }

    const slots: { start: string; end: string }[] = [];
    for (let day = startDay; day < endDay; day = addDays(day, 1)) {
      const wd = weekdayOf(day);
      for (const rule of byWeekday.get(wd) ?? []) {
        const openMin = toMin(rule.start_time);
        const closeMin = toMin(rule.end_time);
        for (let t = openMin; t + duration <= closeMin; t += step) {
          const s = localToUtc(day, t);
          const e = new Date(s.getTime() + duration * 60_000);
          if (s < notBefore) continue;                         // trop proche / passé
          if (busy.some((b) => overlaps(s, e, b.start, b.end))) continue; // occupé
          slots.push({ start: s.toISOString(), end: e.toISOString() });
        }
      }
    }

    return json({
      service: { id: service.id, title: service.title, title_en: service.title_en, duration_min: duration, price_cents: service.price_cents, currency: service.currency },
      timezone: settings?.timezone ?? "Indian/Reunion",
      slots,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
