import type { APIRoute } from 'astro';
import { findDiscount } from '../../lib/discount';
import { rateLimit } from '../../lib/db';
import { clientKey } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!(await rateLimit('disc:' + (await clientKey(request)), 20, 600))) return Response.json({ valid: false, error: 'rate' }, { status: 429 });
  let code = '';
  try { code = String(((await request.json()) as { code?: string }).code ?? ''); } catch { /* empty */ }
  const d = await findDiscount(code);
  return Response.json(d ? { valid: true, code: d.code, kind: d.kind, value: d.value } : { valid: false });
};
