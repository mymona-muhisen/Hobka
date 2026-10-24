import { env as cfEnv } from 'cloudflare:workers';

/* Minimal binding types (avoids pulling in the full workers-types package). */
export interface D1Result<T = Record<string, unknown>> { results: T[]; meta?: { changes?: number; last_row_id?: number } }
export interface D1Stmt {
  bind(...v: unknown[]): D1Stmt;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
export interface D1 { prepare(q: string): D1Stmt; batch(s: D1Stmt[]): Promise<D1Result[]>; exec(q: string): Promise<unknown> }
export interface KV {
  get(k: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>;
  list(o: { prefix: string; cursor?: string }): Promise<{ keys: { name: string }[]; list_complete: boolean; cursor?: string }>;
  getWithMetadata<M>(k: string, type: 'arrayBuffer'): Promise<{ value: ArrayBuffer | null; metadata: M | null }>;
  put(k: string, v: ArrayBuffer | string, o?: { expirationTtl?: number; metadata?: unknown }): Promise<void>;
  delete(k: string): Promise<void>;
}
export interface Env { DB: D1; PHOTOS: KV; ADMIN_PASSWORD?: string }
export const env = cfEnv as unknown as Env;

/* Schema is created on first use, so there is no migration step to run when deploying. */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    token TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    site_lang TEXT NOT NULL DEFAULT 'ar',
    kind TEXT NOT NULL,
    box TEXT,
    addons TEXT NOT NULL DEFAULT '[]',
    child TEXT,
    photo_mode TEXT NOT NULL DEFAULT 'none',
    photo_count INTEGER NOT NULL DEFAULT 0,
    photo_consent INTEGER NOT NULL DEFAULT 0,
    parent_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    governorate TEXT NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    discount_code TEXT,
    subtotal REAL NOT NULL,
    shipping REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    draft_url TEXT,
    draft_message TEXT,
    draft_version INTEGER NOT NULL DEFAULT 0,
    feedback TEXT,
    approved_at TEXT,
    admin_notes TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS orders_status ON orders(status, created_at)`,
  `CREATE TABLE IF NOT EXISTS order_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    at TEXT NOT NULL,
    actor TEXT NOT NULL,
    type TEXT NOT NULL,
    note TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS order_events_order ON order_events(order_id, id)`,
  `CREATE TABLE IF NOT EXISTS discounts (
    code TEXT PRIMARY KEY,
    kind TEXT NOT NULL CHECK (kind IN ('percent','fixed')),
    value REAL NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    max_uses INTEGER,
    used INTEGER NOT NULL DEFAULT 0,
    expires_at TEXT,
    note TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('item','box')),
    data TEXT NOT NULL,
    sort INTEGER NOT NULL DEFAULT 0,
    deleted INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (kind, id)
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    reset_at INTEGER NOT NULL
  )`,
];

/* Columns added after the first release; added in place on existing databases. */
const ORDER_COLUMNS: [string, string][] = [
  ['lines', 'TEXT'],
  ['cost_total', 'REAL NOT NULL DEFAULT 0'],
  ['extra_cost', 'REAL NOT NULL DEFAULT 0'],
  ['source', 'TEXT'],
];

async function migrate() {
  await env.DB.batch(SCHEMA.map((q) => env.DB.prepare(q)));
  const { results } = await env.DB.prepare('PRAGMA table_info(orders)').all<{ name: string }>();
  const have = new Set(results.map((r) => r.name));
  for (const [col, type] of ORDER_COLUMNS) {
    if (!have.has(col)) await env.DB.prepare(`ALTER TABLE orders ADD COLUMN ${col} ${type}`).run();
  }
}

let ready: Promise<void> | null = null;
export function db(): Promise<D1> {
  if (!ready) {
    ready = migrate();
    ready.catch(() => (ready = null));
  }
  return ready.then(() => env.DB);
}

export const now = () => new Date().toISOString();

export async function logEvent(orderId: number, actor: 'customer' | 'admin' | 'system', type: string, note?: string | null) {
  const d = await db();
  await d.prepare('INSERT INTO order_events (order_id, at, actor, type, note) VALUES (?, ?, ?, ?, ?)').bind(orderId, now(), actor, type, note ?? null).run();
}

/** Fixed-window rate limit stored in D1. Returns true when the call is allowed. */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const d = await db();
  const t = Math.floor(Date.now() / 1000);
  const row = await d.prepare('SELECT count, reset_at FROM rate_limits WHERE key = ?').bind(key).first<{ count: number; reset_at: number }>();
  if (!row || row.reset_at <= t) {
    await d.prepare('INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at').bind(key, t + windowSec).run();
    return true;
  }
  if (row.count >= limit) return false;
  await d.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').bind(key).run();
  return true;
}

export interface OrderRow {
  id: number; code: string; token: string; created_at: string; updated_at: string; status: string; site_lang: 'ar' | 'en';
  kind: 'box' | 'addons'; box: string | null; addons: string; child: string | null;
  photo_mode: string; photo_count: number; photo_consent: number;
  parent_name: string; phone: string; governorate: string; address: string; notes: string | null;
  discount_code: string | null; subtotal: number; shipping: number; discount: number; total: number;
  draft_url: string | null; draft_message: string | null; draft_version: number; feedback: string | null; approved_at: string | null; admin_notes: string | null;
  lines: string | null; cost_total: number; extra_cost: number; source: string | null;
}
