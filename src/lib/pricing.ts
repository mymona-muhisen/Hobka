import { shippingOnDelivery, governorates as defaultGovernorates, type BoxId, type Catalog, type ItemId } from '../config/catalog';

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
  id: string; // "box:<id>" | "addon:<id>"
  amount: number;
  cost: number;
}

export interface Price {
  lines: PriceLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  /** production cost of everything in the order (not shipping) */
  cost: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

export const activeBoxes = (c: Catalog) => c.boxes.filter((b) => b.status === 'available').sort((a, b) => a.sort - b.sort);
export const activeItems = (c: Catalog) => Object.values(c.items).filter((i) => i.status !== 'hidden').sort((a, b) => a.sort - b.sort);

/** Add-ons a customer may pick for this order kind (never items already inside the box). */
export function allowedAddons(c: Catalog, kind: 'box' | 'addons', box?: BoxId | null): ItemId[] {
  const inBox = new Set(kind === 'box' ? c.boxes.find((b) => b.id === box)?.includes ?? [] : []);
  return activeItems(c)
    .filter((it) => it.status === 'available' && it.addonPrice !== null && !inBox.has(it.id))
    .filter((it) => (kind === 'addons' ? it.standalone : true))
    .map((it) => it.id);
}

/** Single source of truth for prices: used by the order form preview and re-run on the server. */
export function computePrice(c: Catalog, input: PriceInput, discount?: Discount | null): Price {
  const lines: PriceLine[] = [];
  if (input.kind === 'box') {
    const box = activeBoxes(c).find((b) => b.id === input.box);
    if (!box) throw new Error('unknown box');
    lines.push({ id: `box:${box.id}`, amount: box.price, cost: box.cost ?? 0 });
  }
  const allowed = new Set(allowedAddons(c, input.kind, input.box));
  for (const id of new Set(input.addons)) {
    if (!allowed.has(id)) continue;
    lines.push({ id: `addon:${id}`, amount: c.items[id].addonPrice ?? 0, cost: c.items[id].cost ?? 0 });
  }
  const subtotal = round(lines.reduce((s, l) => s + l.amount, 0));
  const cost = round(lines.reduce((s, l) => s + l.cost, 0));
  const gov = (c.governorates ?? defaultGovernorates).find((g) => g.id === input.governorate);
  // Shipping on delivery: paid to the courier, so it is not part of the order total.
  const shipping = gov && !shippingOnDelivery ? gov.shipping : 0;
  let off = 0;
  if (discount) {
    off = discount.kind === 'percent' ? (subtotal * Math.min(100, Math.max(0, discount.value))) / 100 : discount.value;
    off = round(Math.min(Math.max(0, off), subtotal));
  }
  return { lines, subtotal, shipping, discount: off, total: round(subtotal - off + shipping), cost };
}

export function money(n: number, lang: 'ar' | 'en' = 'ar'): string {
  const v = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return lang === 'ar' ? `${v} $` : `$${v}`;
}

/** Catalog without costs, safe to embed in public pages. */
export function publicCatalog(c: Catalog): Catalog {
  const items = Object.fromEntries(activeItems(c).map((i) => [i.id, { ...i, cost: 0 }]));
  const boxes = activeBoxes(c).map((b) => ({ ...b, cost: 0, includes: b.includes.filter((id) => items[id]) }));
  return { items, boxes, governorates: c.governorates?.map(({ id, name, shipping }) => ({ id, name, shipping })) };
}

/** Public URL of a product photo, or null. */
export const productImage = (kind: 'item' | 'box', p: { id: string; image?: number }) => (p.image ? `/pimg/${kind}/${p.id}/${p.image}` : null);
