"use client";
// Client Supabase côté navigateur. Renvoie null si non configuré (les composants gèrent le fallback).
import { createBrowserClient } from "@supabase/ssr";
import { env, supabaseConfigured } from "@/lib/env";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  if (cached) return cached;
  cached = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  return cached;
}
