import type { APIRoute } from 'astro';
import { env } from '../../../lib/db';
import { imageHeaders } from '../../../lib/image';
import { SLOT_IDS, kvKey } from '../../../lib/siteImages';

export const prerender = false;

/** Site pictures replaced from /admin/images. The URL carries a version, so it can be cached for a year. */
export const GET: APIRoute = async ({ params }) => {
  const slot = String(params.slot ?? '');
  const m = String(params.file ?? '').match(/^(\d{1,12})(-sm)?$/);
  if (!SLOT_IDS.has(slot) || !m) return new Response('Not found', { status: 404 });
  const { value, metadata } = await env.PHOTOS.getWithMetadata<{ type: string }>(kvKey(slot, Number(m[1]), !!m[2]), 'arrayBuffer');
  if (!value) return new Response('Not found', { status: 404 });
  return new Response(value, { headers: imageHeaders(metadata?.type ?? 'image/jpeg', 'public, max-age=31536000, immutable') });
};
