import type { Catalog } from '../config/catalog';
import type { OrderRow } from './db';

export interface Line { id: string; kind: 'box' | 'item'; name_ar: string; name_en: string; price: number; cost: number }

/** What the order contained: the snapshot saved at order time, or (older orders) rebuilt from the catalog. */
export function orderLines(o: OrderRow, cat: Catalog): Line[] {
  if (o.lines) {
    try { return JSON.parse(o.lines) as Line[]; } catch { /* fall through */ }
  }
  const out: Line[] = [];
  const box = cat.boxes.find((b) => b.id === o.box);
  if (box) out.push({ id: box.id, kind: 'box', name_ar: box.name.ar, name_en: box.name.en, price: box.price, cost: 0 });
  for (const id of JSON.parse(o.addons || '[]') as string[]) {
    const it = cat.items[id];
    out.push({ id, kind: 'item', name_ar: it?.name.ar ?? id, name_en: it?.name.en ?? id, price: it?.addonPrice ?? 0, cost: 0 });
  }
  return out;
}

const r2 = (n: number) => Math.round(n * 100) / 100;
/** Net sales (after discount, without shipping, which is passed to the delivery company). */
export const revenue = (o: Pick<OrderRow, 'subtotal' | 'discount'>) => r2(o.subtotal - o.discount);
export const profit = (o: Pick<OrderRow, 'subtotal' | 'discount' | 'cost_total' | 'extra_cost'>) => r2(o.subtotal - o.discount - (o.cost_total ?? 0) - (o.extra_cost ?? 0));
export const PAID = ['paid', 'printing', 'shipped', 'delivered'];
