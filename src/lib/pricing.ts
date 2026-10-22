import { boxes, governorates, items, type BoxId, type ItemId } from '../config/catalog';

export interface Discount {
  code: string;
  kind: 'percent' | 'fixed';
  value: number;
}

export interface PriceInput {
  kind: 'box' | 'addons';
  box?: BoxId | null;
  addons: ItemId[];
  governorate: string;
}

export interface PriceLine {
  id: string;
  amount: number;
}

export interface Price {
  lines: PriceLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Add-ons a customer may pick for this order kind (never items already inside the box). */
export function allowedAddons(kind: 'box' | 'addons', box?: BoxId | null): ItemId[] {
  const inBox = new Set(kind === 'box' ? boxes.find((b) => b.id === box)?.includes ?? [] : []);
  return (Object.values(items) as (typeof items)[ItemId][])
    .filter((it) => it.status === 'available' && it.addonPrice !== null && !inBox.has(it.id))
    .filter((it) => (kind === 'addons' ? it.standalone : true))
    .map((it) => it.id);
}

/** Single source of truth for prices: used by the order form preview and re-run on the server. */
export function computePrice(input: PriceInput, discount?: Discount | null): Price {
  const lines: PriceLine[] = [];
  if (input.kind === 'box') {
    const box = boxes.find((b) => b.id === input.box);
    if (!box) throw new Error('unknown box');
    lines.push({ id: `box:${box.id}`, amount: box.price });
  }
  const allowed = new Set(allowedAddons(input.kind, input.box));
  for (const id of new Set(input.addons)) {
    if (!allowed.has(id)) continue;
    lines.push({ id: `addon:${id}`, amount: items[id].addonPrice ?? 0 });
  }
  const subtotal = round(lines.reduce((s, l) => s + l.amount, 0));
  const gov = governorates.find((g) => g.id === input.governorate);
  const shipping = gov ? gov.shipping : 0;
  let off = 0;
  if (discount) {
    off = discount.kind === 'percent' ? (subtotal * Math.min(100, Math.max(0, discount.value))) / 100 : discount.value;
    off = round(Math.min(Math.max(0, off), subtotal));
  }
  return { lines, subtotal, shipping, discount: off, total: round(subtotal - off + shipping) };
}

export function money(n: number, lang: 'ar' | 'en' = 'ar'): string {
  const v = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return lang === 'ar' ? `${v} $` : `$${v}`;
}
