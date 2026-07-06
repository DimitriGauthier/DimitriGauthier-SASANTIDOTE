import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CAL_BASE = "https://www.googleapis.com/calendar/v3";

// Récupère un access_token valide (rafraîchi si nécessaire) pour le calendrier de Dimitri.
export async function getAccessToken(admin: SupabaseClient): Promise<{ token: string; calendarId: string }> {
  const { data, error } = await admin.from("google_credentials").select("*").eq("id", 1).single();
  if (error || !data?.refresh_token) throw new Error("Google Calendar non connecté");

  // access_token encore valide (>1 min de marge) ?
  if (data.access_token && data.token_expiry && new Date(data.token_expiry).getTime() > Date.now() + 60_000) {
    return { token: data.access_token, calendarId: data.calendar_id };
  }

  const body = new URLSearchParams({
    client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
    client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
    refresh_token: data.refresh_token,
    grant_type: "refresh_token",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error("refresh_token Google échoué: " + await res.text());
  const j = await res.json();
  const expiry = new Date(Date.now() + j.expires_in * 1000).toISOString();
  await admin.from("google_credentials").update({ access_token: j.access_token, token_expiry: expiry }).eq("id", 1);
  return { token: j.access_token, calendarId: data.calendar_id };
}

export interface Interval { start: Date; end: Date }

// Créneaux occupés (événements du calendrier) sur une plage.
export async function freeBusy(token: string, calendarId: string, timeMin: string, timeMax: string): Promise<Interval[]> {
  const res = await fetch(`${CAL_BASE}/freeBusy`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ timeMin, timeMax, items: [{ id: calendarId }] }),
  });
  if (!res.ok) throw new Error("freeBusy: " + await res.text());
  const j = await res.json();
  return (j.calendars?.[calendarId]?.busy ?? []).map((b: { start: string; end: string }) => ({
    start: new Date(b.start),
    end: new Date(b.end),
  }));
}

// Crée un événement (le client est invité => Google lui envoie l'invitation .ics).
export async function createEvent(token: string, calendarId: string, ev: Record<string, unknown>) {
  const res = await fetch(
    `${CAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(ev),
    },
  );
  if (!res.ok) throw new Error("createEvent: " + await res.text());
  return await res.json();
}

// Met à jour un événement existant (PATCH). Google renvoie une invitation .ics mise à jour au client.
export async function updateEvent(token: string, calendarId: string, eventId: string, patch: Record<string, unknown>) {
  const res = await fetch(
    `${CAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    {
      method: "PATCH",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(patch),
    },
  );
  if (!res.ok) throw new Error("updateEvent: " + await res.text());
  return await res.json();
}

// Supprime un événement (le client reçoit l'annulation .ics). 404/410 = déjà supprimé => on tolère.
export async function deleteEvent(token: string, calendarId: string, eventId: string) {
  const res = await fetch(
    `${CAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    { method: "DELETE", headers: { authorization: `Bearer ${token}` } },
  );
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error("deleteEvent: " + await res.text());
  }
}
