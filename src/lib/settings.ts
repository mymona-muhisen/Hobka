import { db, now } from './db';
import {
  contact as defContact, payment as defPayment, timing as defTiming, pricesAreFinal as defFinal, maxValues as defMax,
  governorates as defGovs, storyValues as defValues, type Governorate, type StoryValue, type Text,
} from '../config/catalog';

/** Everything the admin can change from /admin/settings. Defaults come from config/catalog.ts. */
export interface Settings {
  contact: { whatsapp: string; whatsappDisplay: string; instagram: string; facebook: string };
  payment: Text;
  timing: { draftDays: Text; printDays: Text };
  pricesAreFinal: boolean;
  maxValues: number;
  governorates: (Governorate & { hidden?: boolean })[];
  values: StoryValue[];
  /** Habbouk camera experience (/ar/): open to everyone, or only to box owners who scan the box QR (link with ?k=key). */
  ar: { public: boolean; key: string };
}

export const defaultSettings: Settings = {
  contact: { whatsapp: defContact.whatsapp, whatsappDisplay: defContact.whatsappDisplay, instagram: defContact.instagram, facebook: defContact.facebook },
  payment: defPayment.instructions,
  timing: { draftDays: defTiming.draftDays, printDays: defTiming.printDays },
  pricesAreFinal: defFinal,
  maxValues: defMax,
  governorates: defGovs.map((g) => ({ ...g })),
  values: defValues.map((v) => ({ ...v })),
  ar: { public: false, key: '' },
};

/** Box key: letters and digits only, so it fits in a short QR link. */
export const AR_KEY_RE = /^[A-Za-z0-9]{6,32}$/;

const KEY = 'site';

function merge(stored: Partial<Settings> | null): Settings {
  const s = stored ?? {};
  const govs = Array.isArray(s.governorates) ? s.governorates : defaultSettings.governorates;
  // New default governorates (if any are added to the code later) still appear.
  const missing = defaultSettings.governorates.filter((g) => !govs.some((x) => x.id === g.id));
  return {
    contact: { ...defaultSettings.contact, ...(s.contact ?? {}) },
    payment: { ...defaultSettings.payment, ...(s.payment ?? {}) },
    timing: {
      draftDays: { ...defaultSettings.timing.draftDays, ...(s.timing?.draftDays ?? {}) },
      printDays: { ...defaultSettings.timing.printDays, ...(s.timing?.printDays ?? {}) },
    },
    pricesAreFinal: typeof s.pricesAreFinal === 'boolean' ? s.pricesAreFinal : defaultSettings.pricesAreFinal,
    maxValues: Number.isInteger(s.maxValues) && s.maxValues! >= 1 ? s.maxValues! : defaultSettings.maxValues,
    governorates: [...govs, ...missing],
    values: Array.isArray(s.values) ? s.values : defaultSettings.values,
    ar: {
      public: typeof s.ar?.public === 'boolean' ? s.ar.public : defaultSettings.ar.public,
      key: typeof s.ar?.key === 'string' && AR_KEY_RE.test(s.ar.key) ? s.ar.key : '',
    },
  };
}

const cache = new WeakMap<object, Promise<Settings>>();

/** Live settings. Pass Astro.locals so one request reads the database only once. */
export function getSettings(locals?: object): Promise<Settings> {
  if (locals && cache.has(locals)) return cache.get(locals)!;
  const p = (async () => {
    const d = await db();
    const row = await d.prepare('SELECT data FROM settings WHERE key = ?').bind(KEY).first<{ data: string }>();
    let stored: Partial<Settings> | null = null;
    try { stored = row ? JSON.parse(row.data) : null; } catch { stored = null; }
    return merge(stored);
  })();
  if (locals) cache.set(locals, p);
  return p;
}

export async function saveSettings(s: Settings) {
  const d = await db();
  await d
    .prepare('INSERT INTO settings (key, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at')
    .bind(KEY, JSON.stringify(s), now())
    .run();
}

export const activeGovernorates = (s: Settings) => s.governorates.filter((g) => !g.hidden);
export const activeValues = (s: Settings) => s.values.filter((v) => !v.deleted);
