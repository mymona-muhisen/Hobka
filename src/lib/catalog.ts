import { db, now } from './db';
import { defaultCatalog, type Box, type Catalog, type Item } from '../config/catalog';

interface Row { id: string; kind: 'item' | 'box'; data: string; sort: number; deleted: number }

/** Live catalog from D1. The first call on an empty database copies the defaults from catalog.ts. */
export async function loadCatalog(opts: { includeDeleted?: boolean } = {}): Promise<Catalog & { deleted: Set<string> }> {
  const d = await db();
  let { results } = await d.prepare('SELECT * FROM products ORDER BY kind, sort, id').all<Row>();
  if (results.length === 0) {
    await seed();
    ({ results } = await d.prepare('SELECT * FROM products ORDER BY kind, sort, id').all<Row>());
  }
  const items: Record<string, Item> = {};
  const boxes: Box[] = [];
  const deleted = new Set<string>();
  for (const r of results) {
    if (r.deleted) deleted.add(`${r.kind}:${r.id}`);
    if (r.deleted && !opts.includeDeleted) continue;
    const v = JSON.parse(r.data);
    if (r.kind === 'item') items[r.id] = { ...v, id: r.id, sort: r.sort };
    else boxes.push({ ...v, id: r.id, sort: r.sort });
  }
  for (const b of boxes) b.includes = b.includes.filter((id) => items[id]);
  boxes.sort((a, b) => a.sort - b.sort);
  return { items, boxes, deleted };
}

async function seed() {
  const d = await db();
  const t = now();
  const stmts = [
    ...Object.values(defaultCatalog.items).map((i) => d.prepare('INSERT OR IGNORE INTO products (id, kind, data, sort, deleted, updated_at) VALUES (?, ?, ?, ?, 0, ?)').bind(i.id, 'item', JSON.stringify(i), i.sort, t)),
    ...defaultCatalog.boxes.map((b) => d.prepare('INSERT OR IGNORE INTO products (id, kind, data, sort, deleted, updated_at) VALUES (?, ?, ?, ?, 0, ?)').bind(b.id, 'box', JSON.stringify(b), b.sort, t)),
  ];
  await d.batch(stmts);
}

export async function saveProduct(kind: 'item' | 'box', p: Item | Box) {
  const d = await db();
  await d
    .prepare('INSERT INTO products (id, kind, data, sort, deleted, updated_at) VALUES (?, ?, ?, ?, 0, ?) ON CONFLICT(kind, id) DO UPDATE SET data = excluded.data, sort = excluded.sort, deleted = 0, updated_at = excluded.updated_at')
    .bind(p.id, kind, JSON.stringify(p), p.sort, now())
    .run();
}

export async function deleteProduct(kind: 'item' | 'box', id: string) {
  const d = await db();
  await d.prepare('UPDATE products SET deleted = 1, updated_at = ? WHERE kind = ? AND id = ?').bind(now(), kind, id).run();
}
