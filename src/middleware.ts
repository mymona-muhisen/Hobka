import { defineMiddleware } from 'astro:middleware';
import { isAdmin } from './lib/auth';

const PRIVATE = /^\/(admin|d|api)(\/|$)/;

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;
  if (ctx.isPrerendered) return next();

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!(await isAdmin(ctx.request))) return ctx.redirect('/admin/login', 303);
  }
  const res = await next();
  const headers = new Headers(res.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'same-origin');
  headers.set('X-Frame-Options', 'DENY');
  if (PRIVATE.test(pathname)) {
    if (!headers.has('cache-control')) headers.set('Cache-Control', 'no-store');
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    // Admin and draft pages: only our own scripts, styles and images; nothing can be loaded from or sent to other sites.
    if (!headers.has('content-security-policy') && (headers.get('content-type') ?? '').includes('text/html')) {
      headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; form-action 'self' https://wa.me; frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
      );
    }
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
});
