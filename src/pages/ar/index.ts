import type { APIRoute } from 'astro';
import arPage from '../../ar/index.html?raw';
import { getSettings } from '../../lib/settings';
import { isAdmin } from '../../lib/auth';

/*
 * Habbouk camera experience. Open to everyone when the admin turns it on (/admin/settings#ar).
 * Otherwise only box owners: the QR on the box links to /ar/?k=<key>; a valid key sets a cookie
 * (so the page keeps opening from the same phone) and redirects to the clean /ar/ address.
 * The admin can always open it to preview.
 */
export const prerender = false;

const COOKIE = 'hb_ar';
const YEAR = 365 * 24 * 3600;

function same(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

const cookieOf = (req: Request) => (req.headers.get('cookie') ?? '').match(/(?:^|;\s*)hb_ar=([A-Za-z0-9]+)/)?.[1] ?? '';

const LOCKED = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#771427">
<title>حبّوك ينتظرك في صندوق حبكة</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
@font-face{font-family:'Tajawal';src:url('/fonts/Tajawal-Regular.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'Tajawal';src:url('/fonts/Tajawal-Bold.woff2') format('woff2');font-weight:700;font-display:swap}
@font-face{font-family:'Baloo Bhaijaan 2';src:url('/fonts/BalooBhaijaan2-ExtraBold.woff2') format('woff2');font-weight:800;font-display:swap}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px 16px;background:#771427;color:#2D2024;font-family:'Tajawal',system-ui,sans-serif}
.card{width:min(440px,100%);background:#FFF8F2;border-radius:28px;padding:28px 24px 32px;text-align:center;box-shadow:0 18px 40px rgb(0 0 0 / 25%)}
.logo{display:inline-block;margin-bottom:8px}
img.hb{width:150px;height:auto;margin:4px auto 8px;display:block;filter:drop-shadow(0 10px 14px rgb(78 13 28 / 22%))}
h1{font-family:'Baloo Bhaijaan 2','Tajawal',sans-serif;font-weight:800;color:#771427;font-size:1.7rem;line-height:1.3;margin:0 0 10px}
p{margin:0 0 12px;line-height:1.7;font-size:1.05rem}
.muted{color:#6F5D63;font-size:.95rem}
.actions{display:grid;gap:10px;margin-top:18px}
a.btn{display:flex;align-items:center;justify-content:center;min-height:48px;border-radius:99px;font-weight:700;text-decoration:none;font-size:1rem}
a.primary{background:#771427;color:#fff}
a.secondary{border:1.5px solid #771427;color:#4E0D1C}
</style>
</head>
<body>
<main class="card">
  <a class="logo" href="/" aria-label="حبكة، الرئيسية"><img src="/brand/logo-brand.svg" alt="hobka" width="120" height="40"></a>
  <img class="hb" src="/images/habbouk.webp" alt="حبّوك يلوّح بيده" width="520" height="607">
  <h1>حبّوك ينتظرك في صندوق حبكة</h1>
  <p>الصورة مع حبّوك هديّة لأصحاب صندوق حبكة. امسح رمز QR الموجود على جانب العلبة، وسيظهر حبّوك أمامك بكاميرا الجوال.</p>
  <p class="muted">مسحت الرمز ولم تفتح الصفحة؟ امسحه مرة أخرى من نفس الجوال، أو راسلنا.</p>
  <div class="actions">
    <a class="btn primary" href="/order">اطلب قصة لطفلك</a>
    <a class="btn secondary" href="/">العودة إلى حبكة</a>
  </div>
</main>
</body>
</html>`;

export const GET: APIRoute = async ({ request, url, locals }) => {
  // The page loads its files relatively (style.css, app.js, lib/…), so it must live at /ar/ with the slash.
  if (!url.pathname.endsWith('/')) return Response.redirect(new URL('/ar/' + url.search, url), 301);

  const { ar } = await getSettings(locals);
  const k = url.searchParams.get('k') ?? '';

  if (k) {
    const headers = new Headers({ Location: '/ar/', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
    if (same(k, ar.key)) headers.append('Set-Cookie', `${COOKIE}=${ar.key}; Path=/ar; Max-Age=${YEAR}; HttpOnly; Secure; SameSite=Lax`);
    return new Response(null, { status: 303, headers });
  }

  const open = ar.public || same(cookieOf(request), ar.key) || (await isAdmin(request));
  const headers: Record<string, string> = { 'content-type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' };
  if (!ar.public) headers['X-Robots-Tag'] = 'noindex';
  return new Response(open ? arPage : LOCKED, { status: 200, headers });
};
