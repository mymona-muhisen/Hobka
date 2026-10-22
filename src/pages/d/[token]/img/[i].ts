import type { APIRoute } from 'astro';
import { db, env, type OrderRow } from '../../../../lib/db';
import { imageHeaders } from '../../../../lib/image';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const token = params.token ?? '';
  const m = /^(\d{1,3})-(\d{1,2})$/.exec(String(params.i ?? ''));
  if (token.length < 20 || !m) return new Response('Not found', { status: 404 });
  const [v, i] = [Number(m[1]), Number(m[2])];
  const d = await db();
  const order = await d.prepare('SELECT code FROM orders WHERE token = ?').bind(token).first<Pick<OrderRow, 'code'>>();
  if (!order) return new Response('Not found', { status: 404 });
  const { value, metadata } = await env.PHOTOS.getWithMetadata<{ type: string }>(`draft:${order.code}:v${v}:${i}`, 'arrayBuffer');
  if (!value) return new Response('Not found', { status: 404 });
  return new Response(value, { headers: imageHeaders(metadata?.type ?? 'image/jpeg', 'private, max-age=86400') });
};
