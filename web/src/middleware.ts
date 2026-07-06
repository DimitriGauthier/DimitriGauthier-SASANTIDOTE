// Middleware —
//  0) Prévisualisation privée : tant que SITE_PREVIEW_PASSWORD est défini, tout le site
//     est masqué derrière une page « bientôt disponible » + mot de passe (cookie dg_preview).
//     Pour ouvrir le site à tous : supprimer la variable d'env et redéployer.
//  1) Sous-domaine « intimy. » (marque INTIMY) → application « expérience » plein écran (sans menu).
//     L'ancien « intime. » reste accepté le temps de la bascule DNS (aucune rupture de lien).
//  2) Sinon : force le préfixe de langue (/fr par défaut, /en).
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

const PUBLIC_FILE = /\.[^/]+$/;
const PREVIEW_COOKIE = "dg_preview";

function localeFromPath(pathname: string): (typeof locales)[number] {
  return locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ?? defaultLocale;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") ?? "").toLowerCase();

  // Fichiers, assets et API : on laisse passer (nécessaire pour /api/unlock et le logo).
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ── 0) Verrou de prévisualisation privée ──
  // Actif uniquement si un mot de passe est configuré (sinon le site est public).
  const previewPassword = process.env.SITE_PREVIEW_PASSWORD;
  if (previewPassword) {
    const unlocked = req.cookies.get(PREVIEW_COOKIE)?.value === previewPassword;
    if (!unlocked) {
      const error = req.nextUrl.searchParams.get("e") === "1";
      return new NextResponse(lockScreen(escAttr(pathname || "/"), error), {
        status: 503,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store, no-cache, must-revalidate",
          "x-robots-tag": "noindex, nofollow",
        },
      });
    }
  }

  // ── 1) Sous-domaine dédié « intimy. » (+ ancien « intime. ») : tout mène à l'expérience ──
  // (l'URL visible reste celle du sous-domaine ; on réécrit vers /<loc>/experience)
  if (host.startsWith("intimy.") || host.startsWith("intime.")) {
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

// Échappe une valeur destinée à un attribut HTML (contexte guillemets doubles).
function escAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Écran « bientôt disponible » (aux couleurs de la marque) + champ mot de passe.
// Auto-contenu (aucune dépendance à Next) car servi directement depuis le middleware.
function lockScreen(next: string, error: boolean): string {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Bientôt disponible</title>
<style>
:root{--primary:hsl(14 42% 48%);--deep:hsl(18 30% 22%);--gold:hsl(35 45% 55%);--muted:hsl(18 12% 42%);--border:hsl(24 25% 82%)}
*{box-sizing:border-box;margin:0;padding:0}
body{min-height:100svh;display:flex;align-items:center;justify-content:center;padding:1.5rem;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  color:var(--deep);background:linear-gradient(135deg,hsl(36 45% 95%),hsl(25 45% 88%));
  position:relative;overflow:hidden}
.blob{position:absolute;border-radius:9999px;filter:blur(60px);pointer-events:none}
.b1{width:42vmax;height:42vmax;background:hsl(14 42% 48% / .16);top:-12vmax;left:-9vmax}
.b2{width:36vmax;height:36vmax;background:hsl(35 45% 55% / .20);bottom:-12vmax;right:-9vmax}
.card{position:relative;z-index:1;max-width:31rem;width:100%;text-align:center;
  background:hsl(40 40% 99% / .72);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  border:1px solid var(--border);border-radius:28px;padding:3rem 2.25rem;
  box-shadow:0 32px 80px -32px hsl(18 30% 22% / .32)}
.logo{height:56px;width:auto;margin:0 auto 1.6rem;display:block}
.kicker{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:var(--primary);font-weight:600;margin-bottom:.9rem}
h1{font-size:1.65rem;line-height:1.18;margin-bottom:.85rem;font-weight:600}
.lead{color:var(--muted);font-size:.97rem;line-height:1.55;margin:0 auto 1.9rem;max-width:24rem}
form{display:flex;flex-direction:column;gap:.55rem;margin-top:1.2rem}
.field{display:flex;gap:.5rem}
input[type=password]{flex:1;min-width:0;padding:.72rem .95rem;border:1px solid var(--border);border-radius:12px;
  background:#fff;font-size:.95rem;color:var(--deep);outline:none;transition:border-color .15s,box-shadow .15s}
input[type=password]:focus{border-color:var(--primary);box-shadow:0 0 0 3px hsl(14 42% 48% / .16)}
button{padding:.72rem 1.35rem;border:none;border-radius:12px;background:var(--primary);color:#fff;
  font-size:.95rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:filter .15s}
button:hover{filter:brightness(1.06)}
.err{color:hsl(0 62% 46%);font-size:.82rem;text-align:left}
.hint{margin-top:1.5rem;font-size:.71rem;color:var(--muted);opacity:.7;letter-spacing:.02em}
.heart{color:var(--primary)}
</style>
</head>
<body>
<span class="blob b1"></span><span class="blob b2"></span>
<main class="card">
  <img class="logo" src="/img/logo.png" alt="Dimitri Gauthier">
  <div class="kicker">Bient&ocirc;t disponible</div>
  <h1>Le nouveau site arrive <span class="heart">&#10084;</span></h1>
  <p class="lead">Nous mettons la derni&egrave;re main &agrave; cet espace d&eacute;di&eacute; &agrave; l'accompagnement intime et th&eacute;rapeutique. Merci de votre patience&nbsp;&mdash; &agrave; tr&egrave;s vite.</p>
  <form method="POST" action="/api/unlock">
    <input type="hidden" name="next" value="${next}">
    <div class="field">
      <input type="password" name="password" placeholder="Mot de passe d'acc&egrave;s" autofocus aria-label="Mot de passe d'acc&egrave;s">
      <button type="submit">Entrer</button>
    </div>
    ${error ? '<div class="err">Mot de passe incorrect.</div>' : ""}
  </form>
  <p class="hint">Acc&egrave;s r&eacute;serv&eacute; &middot; pr&eacute;visualisation priv&eacute;e</p>
</main>
</body>
</html>`;
}
