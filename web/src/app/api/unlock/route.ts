// Déverrouillage de la prévisualisation privée.
// Reçoit le mot de passe depuis la page « bientôt disponible » (servie par le middleware),
// le compare à SITE_PREVIEW_PASSWORD, et pose un cookie httpOnly si c'est bon.
// Tant que ce cookie est présent (et valide), le middleware laisse voir le vrai site.
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "dg_preview";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const nextRaw = String(form.get("next") ?? "/");
  const expected = process.env.SITE_PREVIEW_PASSWORD ?? "";

  // Anti open-redirect : uniquement un chemin interne (commence par « / » mais pas « // »).
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";

  // Mauvais mot de passe (ou gate désactivée) → retour à l'écran avec drapeau d'erreur.
  if (!expected || password !== expected) {
    return NextResponse.redirect(new URL("/?e=1", req.url), { status: 303 });
  }

  const res = NextResponse.redirect(new URL(next, req.url), { status: 303 });
  res.cookies.set(COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });
  return res;
}
