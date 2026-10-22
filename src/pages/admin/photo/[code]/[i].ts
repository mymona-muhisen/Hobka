import type { APIRoute } from 'astro';
import { env } from '../../../../lib/db';
import { imageHeaders } from '../../../../lib/image';
export const prerender = false;
// Middleware already requires an admin session for every /admin path.
export const GET: APIRoute = async ({ params }) => {
  const code = String(params.code ?? '');
  const i = Number(params.i);
  if (!/^HB-[A-Z0-9]{5}$/.test(code) || !Number.isInteger(i) || i < 0 || i > 9) return new Response('Not found', { status: 404 });
  const { value, metadata } = await env.PHOTOS.getWithMetadata<{ type: string }>(`photo:${code}:${i}`, 'arrayBuffer');
  if (!value) return new Response('Not found', { status: 404 });
  return new Response(value, { headers: imageHeaders(metadata?.type ?? 'image/jpeg', 'private, no-store') });
};
