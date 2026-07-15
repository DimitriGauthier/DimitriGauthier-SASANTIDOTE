// Appels aux Edge Functions Supabase (get-slots, create-hold, complete-booking).
// verify_jwt=false pour get-slots/create-hold => on envoie la clé anon en apikey.
import { env, functionsBase } from "@/lib/env";
import type {
  GetSlotsResponse,
  CreateHoldPayload,
  CreateHoldResponse,
} from "@/lib/types";

class EdgeError extends Error {}
/** Levée quand l'Edge Function ne répond pas dans le délai imparti (ex: cold start Stripe). */
export class EdgeTimeoutError extends EdgeError {}

// Délai max avant d'abandonner un appel Edge. Un cold start (import Stripe) peut prendre
// plusieurs secondes ; au-delà on préfère rendre la main à l'utilisateur avec un message clair
// plutôt que de le laisser bloqué indéfiniment sur « loading ».
const CALL_TIMEOUT_MS = 25_000;

async function callFunction<T>(
  name: string,
  body: unknown,
  accessToken?: string,
): Promise<T> {
  const base = functionsBase();
  if (!base) throw new EdgeError("Backend non configuré (NEXT_PUBLIC_SUPABASE_URL manquant).");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${base}/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.supabaseAnonKey,
        Authorization: `Bearer ${accessToken ?? env.supabaseAnonKey}`,
      },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new EdgeTimeoutError("La requête a expiré.");
    }
    throw new EdgeError((e as Error)?.message ?? "Réseau indisponible.");
  } finally {
    clearTimeout(timer);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new EdgeError((data as { error?: string })?.error ?? `Erreur ${res.status}`);
  return data as T;
}

export function getSlots(input: {
  service_id: string;
  from?: string;
  days?: number;
}): Promise<GetSlotsResponse> {
  return callFunction<GetSlotsResponse>("get-slots", input);
}

export function createHold(payload: CreateHoldPayload): Promise<CreateHoldResponse> {
  return callFunction<CreateHoldResponse>("create-hold", payload);
}

/** Action admin — nécessite le JWT de la session admin. */
export function completeBooking(
  booking_id: string,
  accessToken: string,
): Promise<{ ok: boolean; review_url?: string }> {
  return callFunction("complete-booking", { booking_id }, accessToken);
}

/** Report d'un RDV par le client — sécurisé par le token secret de la réservation. */
export function rescheduleBooking(
  token: string,
  slot_start: string,
): Promise<{ ok: boolean; slot_start?: string; slot_end?: string; unchanged?: boolean }> {
  return callFunction("reschedule-booking", { token, slot_start });
}

/** Annulation d'un RDV par le client — sécurisé par le token secret de la réservation. */
export function cancelBooking(token: string): Promise<{ ok: boolean; already?: boolean }> {
  return callFunction("cancel-booking", { token });
}
