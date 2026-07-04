"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

export default function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() || `/${current}`;
  const rest = pathname.replace(/^\/(fr|en)(?=\/|$)/, "") || "";
  return (
    <div className="flex items-center gap-1 text-sm">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}`}
          className={`px-1.5 py-0.5 rounded ${
            l === current ? "font-semibold underline" : "text-neutral-500 hover:text-neutral-900"
          }`}
          aria-current={l === current ? "true" : undefined}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
