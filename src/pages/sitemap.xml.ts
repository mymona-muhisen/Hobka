import type { APIRoute } from 'astro';
import { site } from '../config/catalog';

export const prerender = true;

// [arabic path, english path]
const PAGES: [string, string | null][] = [
  ['/', '/en'],
  ['/order', '/en/order'],
  ['/habbouk', '/en/habbouk'],
  ['/privacy', '/en/privacy'],
  ['/terms', '/en/terms'],
];

export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);
  const url = (loc: string, alts: [string, string][]) =>
    `  <url>\n    <loc>${site.url}${loc}</loc>\n    <lastmod>${today}</lastmod>\n` +
    alts.map(([l, h]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${site.url}${h}"/>\n`).join('') +
    `  </url>`;
  const body = PAGES.flatMap(([ar, en]) => {
    const alts: [string, string][] = en ? [['ar', ar], ['en', en], ['x-default', ar]] : [];
    return en ? [url(ar, alts), url(en, alts)] : [url(ar, alts)];
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
