import type { APIRoute } from 'astro';
import { env } from '../../../../lib/db';
import { imageHeaders } from '../../../../lib/image';

export const prerender = false;

/** Product photos uploaded from the admin. The URL carries a version, so it can be cached for a year. */
export const GET: APIRoute = async ({ params }) => {
  const kind = params.kind === 'box' ? 'box' : params.kind === 'item' ? 'item' : null;
  const id = String(params.id ?? '');
  const v = String(params.v ?? '');
  if (!kind || !/^[a-z0-9-]{1,40}$/.test(id) || !/^\d{1,12}$/.test(v)) return new Response('Not found', { status: 404 });
  const { value, metadata } = await env.PHOTOS.getWithMetadata<{ type: string }>(`pimg:${kind}:${id}:${v}`, 'arrayBuffer');
  if (!value) return new Response('Not found', { status: 404 });
  return new Response(value, { headers: imageHeaders(metadata?.type ?? 'image/jpeg', 'public, max-age=31536000, immutable') });
};
