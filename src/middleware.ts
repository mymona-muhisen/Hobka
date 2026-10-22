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
    headers.set('Cache-Control', 'no-store');
    headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
});
