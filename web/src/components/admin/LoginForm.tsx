"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const sb = getSupabaseBrowser();
    if (!sb) {
      setError(pick(locale, "Backend non configuré.", "Backend not configured."));
      return;
    }
    setLoading(true);
    const { error } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(pick(locale, "Identifiants invalides.", "Invalid credentials."));
      return;
    }
    router.replace(`/${locale}/admin`);
    router.refresh();
  }

  const inputCls = "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="email">
          {pick(locale, "E-mail", "Email")}
        </label>
        <input id="email" type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="password">
          {pick(locale, "Mot de passe", "Password")}
        </label>
        <input id="password" type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
      >
        {loading ? pick(locale, "Connexion…", "Signing in…") : pick(locale, "Se connecter", "Sign in")}
      </button>
    </form>
  );
}
