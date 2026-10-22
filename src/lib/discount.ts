import { db } from './db';
import type { Discount } from './pricing';

export interface DiscountRow { code: string; kind: 'percent' | 'fixed'; value: number; active: number; max_uses: number | null; used: number; expires_at: string | null; note: string | null; created_at: string }

export const normCode = (c: string) => c.trim().toUpperCase().replace(/\s+/g, '');

export async function findDiscount(code: string): Promise<Discount | null> {
  const c = normCode(code);
  if (!c) return null;
  const d = await db();
  const row = await d.prepare('SELECT * FROM discounts WHERE code = ?').bind(c).first<DiscountRow>();
  if (!row || !row.active) return null;
  if (row.expires_at && row.expires_at < new Date().toISOString().slice(0, 10)) return null;
  if (row.max_uses !== null && row.used >= row.max_uses) return null;
  return { code: row.code, kind: row.kind, value: row.value };
}
