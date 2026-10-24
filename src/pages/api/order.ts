import type { APIRoute } from 'astro';
import { orderSchema, newCode, newToken, customerWhatsappText, waLink } from '../../lib/order';
import { computePrice } from '../../lib/pricing';
import { loadCatalog } from '../../lib/catalog';
import { findDiscount } from '../../lib/discount';
import { db, env, now, logEvent, rateLimit } from '../../lib/db';
import { clientKey } from '../../lib/auth';
import { maxPhotos, photoRetentionDays } from '../../config/catalog';
import { getSettings, activeGovernorates, activeValues } from '../../lib/settings';
import { sanitizeImage } from '../../lib/image';

export const prerender = false;

const MAX_PHOTO = 4 * 1024 * 1024;
const fail = (status: number, error: string, details?: unknown) => Response.json({ ok: false, error, details }, { status });

export const POST: APIRoute = async ({ request }) => {
  if (!(await rateLimit('order:' + (await clientKey(request)), 8, 3600))) return fail(429, 'rate_limited');

  let form: FormData;
  try { form = await request.formData(); } catch { return fail(400, 'bad_form'); }
  let raw: unknown;
  try { raw = JSON.parse(String(form.get('data') ?? '')); } catch { return fail(400, 'bad_json'); }

  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) return fail(422, 'invalid', parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })));
  const o = parsed.data;
  const isBox = o.kind === 'box';
  const settings = await getSettings();
  const govs = activeGovernorates(settings);
  const valueIds = new Set(activeValues(settings).map((v) => v.id));
  if (!govs.some((g) => g.id === o.parent.governorate)) return fail(422, 'invalid', [{ path: 'parent.governorate', message: 'unknown governorate' }]);
  if (o.child && (o.child.values.length > settings.maxValues || o.child.values.some((v) => !valueIds.has(v))))
    return fail(422, 'invalid', [{ path: 'child.values', message: 'unknown value' }]);

  // Photos (only for story boxes, only with consent)
  const files = form.getAll('photo').filter((f): f is File => typeof f === 'object' && f !== null && 'arrayBuffer' in f);
  const photos: { buf: ArrayBuffer; type: string }[] = [];
  if (isBox && o.photoMode === 'upload') {
    if (!files.length) return fail(422, 'photo_missing');
    for (const f of files.slice(0, maxPhotos)) {
      if (f.size > MAX_PHOTO) return fail(413, 'photo_too_large');
      // Structural check + metadata strip + cut anything appended after the image's end marker.
      const clean = sanitizeImage(await f.arrayBuffer());
      if (!clean) return fail(415, 'photo_type');
      photos.push({ buf: clean.buf, type: clean.type });
    }
  }

  const discount = o.discountCode ? await findDiscount(o.discountCode) : null;
  if (o.discountCode && !discount) return fail(422, 'discount_invalid');

  const cat = { ...(await loadCatalog()), governorates: govs };
  let price;
  try {
    price = computePrice(cat, { kind: o.kind, box: o.box ?? null, addons: o.addons, governorate: o.parent.governorate }, discount);
  } catch {
    return fail(422, 'invalid', [{ path: 'box', message: 'unknown box' }]);
  }
  // Snapshot of what was sold, at today's prices and costs (later catalog edits don't change old orders).
  const lines = price.lines.map((l) => {
    const [kind, id] = l.id.split(':');
    const p = kind === 'box' ? cat.boxes.find((b) => b.id === id)! : cat.items[id];
    return { id, kind, name_ar: p.name.ar, name_en: p.name.en, price: l.amount, cost: l.cost };
  });
  const code = newCode();
  const token = newToken();
  const t = now();
  const d = await db();
  const child = isBox && o.child ? o.child : null;

  const res = await d
    .prepare(
      `INSERT INTO orders (code, token, created_at, updated_at, status, site_lang, kind, box, addons, child, photo_mode, photo_count, photo_consent,
        parent_name, phone, governorate, address, notes, discount_code, subtotal, shipping, discount, total, lines, cost_total, source)
       VALUES (?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      code, token, t, t, o.siteLang, o.kind, isBox ? o.box : null, JSON.stringify(price.lines.filter((l) => l.id.startsWith('addon:')).map((l) => l.id.slice(6))),
      child ? JSON.stringify(child) : null, isBox ? o.photoMode : 'none', photos.length, o.photoConsent ? 1 : 0,
      o.parent.name, o.parent.phone, o.parent.governorate, o.parent.address, o.parent.notes || null, discount?.code ?? null,
      price.subtotal, price.shipping, price.discount, price.total, JSON.stringify(lines), price.cost, o.source || null,
    )
    .run();
  const orderId = Number(res.meta?.last_row_id ?? 0);

  const ttl = photoRetentionDays * 24 * 3600;
  await Promise.all(photos.map((p, i) => env.PHOTOS.put(`photo:${code}:${i}`, p.buf, { expirationTtl: ttl, metadata: { type: p.type } })));
  if (discount) await d.prepare('UPDATE discounts SET used = used + 1 WHERE code = ?').bind(discount.code).run();
  if (orderId) await logEvent(orderId, 'customer', 'created', null);

  const whatsapp = waLink(settings.contact.whatsapp, customerWhatsappText(o.siteLang, code, o.parent.name, isBox && o.photoMode === 'whatsapp'));
  return Response.json({ ok: true, code, total: price.total, whatsapp });
};
