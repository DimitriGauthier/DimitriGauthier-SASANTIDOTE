"use client";

// Gestionnaire CRUD générique pour tables plates (services, topics, questions, disponibilités).
// Écrit via le client navigateur authentifié (RLS is_admin()). Design volontairement neutre.

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export type FieldType =
  | "text"
  | "number"
  | "money"
  | "textarea"
  | "checkbox"
  | "select"
  | "multiselect"
  | "tags"
  | "json";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  colSpan?: 1 | 2;
  placeholder?: string;
  help?: string;
  step?: number;
  /** Pour un select dont la valeur est stockée en entier (ex. weekday smallint). */
  numeric?: boolean;
};

type Row = Record<string, unknown>;

type Props = {
  locale: Locale;
  table: string;
  fields: Field[];
  rows: Row[];
  titleKey: string;
  subtitleKey?: string;
  defaults?: Row;
};

function toForm(row: Row, fields: Field[]): Row {
  const f: Row = { ...row };
  for (const field of fields) {
    const v = row[field.key];
    if (field.type === "money") f[field.key] = typeof v === "number" ? v / 100 : "";
    else if (field.type === "tags") f[field.key] = Array.isArray(v) ? (v as string[]).join(", ") : "";
    else if (field.type === "json") f[field.key] = v ? JSON.stringify(v, null, 2) : "";
    else if (field.type === "multiselect") f[field.key] = Array.isArray(v) ? v : [];
    else if (field.type === "checkbox") f[field.key] = Boolean(v);
    else f[field.key] = v ?? "";
  }
  return f;
}

function fromForm(form: Row, fields: Field[]): Row {
  const out: Row = {};
  for (const field of fields) {
    const v = form[field.key];
    if (field.type === "money") out[field.key] = v === "" || v == null ? null : Math.round(Number(v) * 100);
    else if (field.type === "number") out[field.key] = v === "" || v == null ? null : Number(v);
    else if (field.type === "tags")
      out[field.key] = String(v ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    else if (field.type === "json") out[field.key] = v ? JSON.parse(String(v)) : null;
    else if (field.type === "multiselect") out[field.key] = Array.isArray(v) ? v : [];
    else if (field.type === "checkbox") out[field.key] = Boolean(v);
    else if (field.type === "select" && field.numeric) out[field.key] = v === "" || v == null ? null : Number(v);
    else out[field.key] = v === "" ? null : v;
  }
  return out;
}

export default function RecordsManager({ locale, table, fields, rows, titleKey, subtitleKey, defaults = {} }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startCreate() {
    setEditing({});
    setForm(toForm(defaults, fields));
    setError(null);
  }
  function startEdit(row: Row) {
    setEditing(row);
    setForm(toForm(row, fields));
    setError(null);
  }
  function cancel() {
    setEditing(null);
    setError(null);
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
    let payload: Row;
    try {
      payload = fromForm(form, fields);
    } catch {
      setError(pick(locale, "Un champ JSON est invalide.", "A JSON field is invalid."));
      setBusy(false);
      return;
    }
    const id = editing && (editing as { id?: string }).id;
    const res = id
      ? await sb.from(table).update(payload).eq("id", id)
      : await sb.from(table).insert(payload);
    setBusy(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function remove(row: Row) {
    const id = (row as { id?: string }).id;
    if (!id) return;
    if (!confirm(pick(locale, "Supprimer cet élément ?", "Delete this item?"))) return;
    const sb = getSupabaseBrowser();
    await sb?.from(table).delete().eq("id", id);
    router.refresh();
  }

  const inputCls = "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";

  return (
    <div>
      {!editing ? (
        <button
          type="button"
          onClick={startCreate}
          className="mb-4 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + {pick(locale, "Ajouter", "Add")}
        </button>
      ) : null}

      {editing ? (
        <div className="mb-6 rounded-lg border border-neutral-300 bg-neutral-50 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className={field.colSpan === 2 ? "sm:col-span-2" : ""}>
                <label className="mb-1 block text-sm font-medium text-neutral-700">{field.label}</label>
                {field.help ? <p className="mb-1 text-xs text-neutral-400">{field.help}</p> : null}

                {field.type === "textarea" || field.type === "json" ? (
                  <textarea
                    rows={field.type === "json" ? 5 : 3}
                    className={`${inputCls} font-mono`}
                    value={String(form[field.key] ?? "")}
                    placeholder={field.placeholder}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  />
                ) : field.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.key])}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.checked })}
                  />
                ) : field.type === "select" ? (
                  <select
                    className={inputCls}
                    value={String(form[field.key] ?? "")}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  >
                    <option value="">—</option>
                    {field.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "multiselect" ? (
                  <div className="flex flex-wrap gap-2">
                    {field.options?.map((o) => {
                      const arr = Array.isArray(form[field.key]) ? (form[field.key] as string[]) : [];
                      const on = arr.includes(o.value);
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              [field.key]: on ? arr.filter((x) => x !== o.value) : [...arr, o.value],
                            })
                          }
                          className={`rounded-md border px-3 py-1.5 text-sm ${on ? "border-neutral-900 bg-white" : "border-neutral-300"}`}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type={field.type === "number" || field.type === "money" ? "number" : "text"}
                    step={field.step ?? (field.type === "money" ? 0.01 : undefined)}
                    className={inputCls}
                    value={String(form[field.key] ?? "")}
                    placeholder={field.placeholder}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
            >
              {busy ? pick(locale, "Enregistrement…", "Saving…") : pick(locale, "Enregistrer", "Save")}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100"
            >
              {pick(locale, "Annuler", "Cancel")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-neutral-500">{pick(locale, "Aucun élément.", "No items.")}</p>
        ) : (
          rows.map((row) => (
            <div key={String((row as { id?: string }).id)} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-neutral-800">{String(row[titleKey] ?? "—")}</div>
                {subtitleKey && row[subtitleKey] ? (
                  <div className="truncate text-xs text-neutral-500">{String(row[subtitleKey])}</div>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(row)}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100"
                >
                  {pick(locale, "Modifier", "Edit")}
                </button>
                <button
                  type="button"
                  onClick={() => remove(row)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  {pick(locale, "Supprimer", "Delete")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
