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

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="email">
          {pick(locale, "E-mail", "Email")}
        </label>
        <input id="email" type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="password">
          {pick(locale, "Mot de passe", "Password")}
        </label>
        <input id="password" type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60"
      >
        {loading ? pick(locale, "Connexion…", "Signing in…") : pick(locale, "Se connecter", "Sign in")}
      </button>
    </form>
  );
}
