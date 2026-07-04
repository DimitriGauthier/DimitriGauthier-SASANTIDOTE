// Appels aux Edge Functions Supabase (get-slots, create-hold, complete-booking).
// verify_jwt=false pour get-slots/create-hold => on envoie la clé anon en apikey.
import { env, functionsBase } from "@/lib/env";
import type {
  GetSlotsResponse,
  CreateHoldPayload,
  CreateHoldResponse,
} from "@/lib/types";

class EdgeError extends Error {}

async function callFunction<T>(
  name: string,
  body: unknown,
  accessToken?: string,
): Promise<T> {
  const base = functionsBase();
  if (!base) throw new EdgeError("Backend non configuré (NEXT_PUBLIC_SUPABASE_URL manquant).");
  const res = await fetch(`${base}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.supabaseAnonKey,
      Authorization: `Bearer ${accessToken ?? env.supabaseAnonKey}`,
    },
    body: JSON.stringify(body ?? {}),
  });
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
