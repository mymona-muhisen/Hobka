import type { Box, Catalog, Item, Lang, Text } from '../config/catalog';

/**
 * An occasion (Liberation Day, New Year…) with a discount, managed from /admin/occasions.
 * Between `startsAt` and `endsAt` the site shows a banner with a countdown to `endsAt`,
 * and the chosen products are sold at the reduced price (old price struck through).
 */
export interface Occasion {
  id: string;
  name: Text;
  /** optional short line under the name, e.g. "order two weeks ahead so it arrives in time" */
  note: Text;
  /** ISO time (UTC) when the banner and the discount start */
  startsAt: string;
  /** ISO time (UTC) of the occasion itself: the countdown target, and the discount ends here */
  endsAt: string;
  kind: 'percent' | 'fixed';
  value: number;
  /** boxes sold at the reduced price */
  boxes: string[];
  /** products whose add-on / standalone price is reduced */
  items: string[];
  /** discount codes may be used on top of the occasion price */
  allowCodes: boolean;
  enabled: boolean;
}

/** What the browser needs (no costs, nothing private). */
export type PublicOccasion = Pick<Occasion, 'id' | 'name' | 'note' | 'endsAt' | 'kind' | 'value' | 'allowCodes'>;

/** An order form opened during the occasion keeps its price for this long after the countdown ends. */
export const ORDER_GRACE_MS = 2 * 3600 * 1000;

const r2 = (n: number) => Math.round(n * 100) / 100;

export function salePrice(price: number, o: Pick<Occasion, 'kind' | 'value'>): number {
  const p = o.kind === 'percent' ? price * (1 - Math.min(100, Math.max(0, o.value)) / 100) : price - o.value;
  return r2(Math.max(0, p));
}

const isLive = (o: Occasion, t: number, grace = 0) => o.enabled && Date.parse(o.startsAt) <= t && t < Date.parse(o.endsAt) + grace;

/** The occasion shown on the site right now: the one that ends first if two overlap. */
export function currentOccasion(list: Occasion[], t = Date.now()): Occasion | null {
  return list.filter((o) => isLive(o, t)).sort((a, b) => Date.parse(a.endsAt) - Date.parse(b.endsAt))[0] ?? null;
}

/**
 * The occasion to price an order with. The order form sends the id of the occasion it showed;
 * we honour it until a little after the countdown ends, so a parent who was filling the form keeps the price they saw.
 * No id sent = the form was opened without an occasion, so the order is priced without one.
 */
export function occasionForOrder(list: Occasion[], id: string, t = Date.now()): Occasion | null {
  if (!id) return null;
  const o = list.find((x) => x.id === id);
  return o && isLive(o, t, ORDER_GRACE_MS) ? o : null;
}

export type SaleBox = Box & { was?: number };
export type SaleItem = Item & { wasAddon?: number };
export type SaleCatalog = Omit<Catalog, 'boxes' | 'items'> & { boxes: SaleBox[]; items: Record<string, SaleItem>; occasion?: PublicOccasion };

/** Catalog with the occasion's prices in place. The old price is kept in `was` / `wasAddon` to show it struck through. */
export function applyOccasion<C extends Catalog>(c: C, o: Occasion | null): C & SaleCatalog {
  if (!o) return c as C & SaleCatalog;
  const onBox = new Set(o.boxes);
  const onItem = new Set(o.items);
  const boxes = c.boxes.map((b) => {
    if (!onBox.has(b.id)) return b;
    const p = salePrice(b.price, o);
    return p < b.price ? { ...b, price: p, was: b.price } : b;
  });
  const items = Object.fromEntries(
    Object.entries(c.items).map(([id, it]) => {
      if (!onItem.has(id) || it.addonPrice === null) return [id, it];
      const p = salePrice(it.addonPrice, o);
      return [id, p < it.addonPrice ? { ...it, addonPrice: p, wasAddon: it.addonPrice } : it];
    }),
  );
  const occasion: PublicOccasion = { id: o.id, name: o.name, note: o.note, endsAt: o.endsAt, kind: o.kind, value: o.value, allowCodes: o.allowCodes };
  return { ...c, boxes, items, occasion };
}

/** "20%" or "5 $" */
export function offAmount(o: Pick<Occasion, 'kind' | 'value'>, lang: Lang): string {
  const v = Number.isInteger(o.value) ? String(o.value) : o.value.toFixed(2);
  if (o.kind === 'percent') return `${v}%`;
  return lang === 'ar' ? `${v} $` : `$${v}`;
}

/** "خصم 20%" / "20% off" */
export const offLabel = (o: Pick<Occasion, 'kind' | 'value'>, lang: Lang) => (lang === 'ar' ? `خصم ${offAmount(o, lang)}` : `${offAmount(o, lang)} off`);

/** Syria uses UTC+3 all year. The admin types local Damascus time; we store UTC. */
export const DAMASCUS_OFFSET = '+03:00';
export function fromLocalInput(v: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const t = Date.parse(`${v}:00${DAMASCUS_OFFSET}`);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}
export function toLocalInput(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  return new Date(t + 3 * 3600 * 1000).toISOString().slice(0, 16);
}

/** Clean stored occasions (anything malformed is dropped rather than breaking the site). */
export function sanitizeOccasions(v: unknown): Occasion[] {
  if (!Array.isArray(v)) return [];
  const txt = (x: unknown): Text => {
    const o = (x ?? {}) as Partial<Text>;
    return { ar: typeof o.ar === 'string' ? o.ar : '', en: typeof o.en === 'string' ? o.en : '' };
  };
  const ids = (x: unknown) => (Array.isArray(x) ? x.filter((s): s is string => typeof s === 'string') : []);
  return v.flatMap((raw) => {
    const o = (raw ?? {}) as Partial<Occasion>;
    if (typeof o.id !== 'string' || !o.id) return [];
    if (!Number.isFinite(Date.parse(String(o.startsAt))) || !Number.isFinite(Date.parse(String(o.endsAt)))) return [];
    const value = Number(o.value);
    if (!(value > 0)) return [];
    return [{
      id: o.id, name: txt(o.name), note: txt(o.note), startsAt: String(o.startsAt), endsAt: String(o.endsAt),
      kind: o.kind === 'fixed' ? 'fixed' : 'percent', value, boxes: ids(o.boxes), items: ids(o.items),
      allowCodes: o.allowCodes === true, enabled: o.enabled !== false,
    } satisfies Occasion];
  });
}
