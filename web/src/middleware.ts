// Middleware —
//  1) Sous-domaine « intime. » → application « expérience » plein écran (sans menu).
//  2) Sinon : force le préfixe de langue (/fr par défaut, /en).
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

const PUBLIC_FILE = /\.[^/]+$/;

function localeFromPath(pathname: string): (typeof locales)[number] {
  return locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ?? defaultLocale;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") ?? "").toLowerCase();

  // Fichiers, assets et API : on laisse passer.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ── 1) Sous-domaine dédié « intime. » : tout mène à l'expérience ──
  // (l'URL visible reste celle du sous-domaine ; on réécrit vers /<loc>/experience)
  if (host.startsWith("intime.")) {
    const loc = localeFromPath(pathname);
    const target = `/${loc}/experience`;
    if (pathname !== target) {
      const url = req.nextUrl.clone();
      url.pathname = target;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // ── 2) Domaine principal : préfixe de langue obligatoire ──
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!hasLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
