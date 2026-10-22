import { env } from './db';

const COOKIE = 'hb_admin';
const MAX_AGE = 7 * 24 * 3600;
const enc = new TextEncoder();

async function key() {
  const pw = env.ADMIN_PASSWORD;
  if (!pw || pw.length < 10) throw new Error('ADMIN_PASSWORD secret is missing or too short');
  // Session key is derived from the password: changing the password logs out every session.
  return crypto.subtle.importKey('raw', await crypto.subtle.digest('SHA-256', enc.encode('hobka-admin:' + pw)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export function adminConfigured() {
  return !!env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length >= 10;
}

/** Constant-time comparison through HMAC of both values. */
export async function checkPassword(input: string) {
  if (!adminConfigured()) return false;
  const k = await key();
  const [a, b] = await Promise.all([crypto.subtle.sign('HMAC', k, enc.encode(input)), crypto.subtle.sign('HMAC', k, enc.encode(env.ADMIN_PASSWORD!))]);
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function sessionCookie() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const sig = b64(await crypto.subtle.sign('HMAC', await key(), enc.encode(String(exp))));
  return `${COOKIE}=${exp}.${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`;
}

export const logoutCookie = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export async function isAdmin(request: Request) {
  if (!adminConfigured()) return false;
  const m = (request.headers.get('cookie') ?? '').match(/(?:^|;\s*)hb_admin=(\d+)\.([\w-]+)/);
  if (!m) return false;
  const exp = Number(m[1]);
  if (exp < Date.now() / 1000) return false;
  const sig = Uint8Array.from(atob(m[2].replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((m[2].length + 3) % 4)), (c) => c.charCodeAt(0));
  return crypto.subtle.verify('HMAC', await key(), sig, enc.encode(String(exp)));
}

/** Reject cross-site form posts (defence in depth on top of SameSite=Strict). */
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export async function clientKey(request: Request) {
  const ip = request.headers.get('cf-connecting-ip') ?? 'local';
  const h = await crypto.subtle.digest('SHA-256', enc.encode('ip:' + ip));
  return b64(h).slice(0, 22);
}
