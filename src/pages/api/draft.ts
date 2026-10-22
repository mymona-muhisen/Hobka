import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db, now, logEvent, rateLimit, type OrderRow } from '../../lib/db';
import { clientKey } from '../../lib/auth';

export const prerender = false;

const body = z.object({ token: z.string().min(20).max(64), action: z.enum(['approve', 'changes']), note: z.string().trim().max(1500).default('') });

export const POST: APIRoute = async ({ request }) => {
  if (!(await rateLimit('draft:' + (await clientKey(request)), 20, 600))) return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  let parsed;
  try { parsed = body.safeParse(await request.json()); } catch { return Response.json({ ok: false, error: 'bad_json' }, { status: 400 }); }
  if (!parsed.success) return Response.json({ ok: false, error: 'invalid' }, { status: 422 });
  const { token, action, note } = parsed.data;
  if (action === 'changes' && note.length < 3) return Response.json({ ok: false, error: 'note_required' }, { status: 422 });

  const d = await db();
  const order = await d.prepare('SELECT * FROM orders WHERE token = ?').bind(token).first<OrderRow>();
  if (!order) return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
  if (order.status !== 'draft_sent') return Response.json({ ok: false, error: 'not_reviewable', status: order.status }, { status: 409 });

  const t = now();
  if (action === 'approve') {
    await d.prepare("UPDATE orders SET status = 'approved', approved_at = ?, feedback = ?, updated_at = ? WHERE id = ?").bind(t, note || null, t, order.id).run();
  } else {
    await d.prepare("UPDATE orders SET status = 'changes_requested', feedback = ?, updated_at = ? WHERE id = ?").bind(note, t, order.id).run();
  }
  await logEvent(order.id, 'customer', action === 'approve' ? 'approved' : 'changes_requested', note || null);
  return Response.json({ ok: true, status: action === 'approve' ? 'approved' : 'changes_requested' });
};
