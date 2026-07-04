"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type SettingsRow = {
  id?: number;
  practitioner_name?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  timezone?: string | null;
  currency?: string | null;
  default_locale?: string | null;
  supported_locales?: string[] | null;
};

export default function SettingsForm({ locale, initial }: { locale: Locale; initial: SettingsRow | null }) {
  const router = useRouter();
  const [form, setForm] = useState<SettingsRow>(initial ?? {});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof SettingsRow>(key: K, value: SettingsRow[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    setError(null);
    const sb = getSupabaseBrowser();
    if (!sb) {
      setError(pick(locale, "Backend non configuré.", "Backend not configured."));
      setBusy(false);
      return;
    }
    const payload = {
      id: 1,
      practitioner_name: form.practitioner_name ?? null,
      email: form.email ?? null,
      phone: form.phone ?? null,
      whatsapp: form.whatsapp ?? null,
      address: form.address ?? null,
      timezone: form.timezone || "Indian/Reunion",
      currency: form.currency || "EUR",
      default_locale: form.default_locale || "fr",
      supported_locales: form.supported_locales?.length ? form.supported_locales : ["fr", "en"],
    };
    const { error } = await sb.from("settings").upsert(payload);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  const inputCls = "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";
  const labelCls = "mb-1 block text-sm font-medium text-neutral-700";

  return (
    <div className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{pick(locale, "Nom du praticien", "Practitioner name")}</label>
          <input className={inputCls} value={form.practitioner_name ?? ""} onChange={(e) => set("practitioner_name", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{pick(locale, "E-mail", "Email")}</label>
          <input className={inputCls} value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{pick(locale, "Téléphone", "Phone")}</label>
          <input className={inputCls} value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>WhatsApp</label>
          <input className={inputCls} value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>{pick(locale, "Adresse", "Address")}</label>
          <input className={inputCls} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{pick(locale, "Fuseau horaire", "Timezone")}</label>
          <input className={inputCls} value={form.timezone ?? "Indian/Reunion"} onChange={(e) => set("timezone", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{pick(locale, "Devise", "Currency")}</label>
          <input className={inputCls} value={form.currency ?? "EUR"} onChange={(e) => set("currency", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{pick(locale, "Langue par défaut", "Default locale")}</label>
          <input className={inputCls} value={form.default_locale ?? "fr"} onChange={(e) => set("default_locale", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{pick(locale, "Langues (séparées par une virgule)", "Locales (comma-separated)")}</label>
          <input
            className={inputCls}
            value={(form.supported_locales ?? ["fr", "en"]).join(", ")}
            onChange={(e) => set("supported_locales", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm text-green-600">{pick(locale, "Enregistré.", "Saved.")}</p> : null}

      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
      >
        {busy ? pick(locale, "Enregistrement…", "Saving…") : pick(locale, "Enregistrer", "Save")}
      </button>
    </div>
  );
}
