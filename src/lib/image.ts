/**
 * Structural check and clean-up for uploaded images, without decoding pixels
 * (decoding would not fit the Workers free-plan CPU budget).
 *
 * - Walks the file format marker by marker and rejects anything malformed or truncated.
 * - Drops metadata blocks (EXIF incl. GPS, XMP, comments, text chunks).
 * - Cuts every byte after the format's end marker, where payloads are usually appended.
 * Returns a fresh buffer, or null when the file is not a valid JPEG / PNG / WebP.
 */

export type CleanImage = { buf: ArrayBuffer; type: 'image/jpeg' | 'image/png' | 'image/webp'; width: number; height: number };

const MAX_SIDE = 10000;

export function sanitizeImage(input: ArrayBuffer): CleanImage | null {
  const b = new Uint8Array(input);
  if (b.length < 32) return null;
  try {
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return jpeg(b);
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return png(b);
    if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP') return webp(b);
  } catch {
    return null;
  }
  return null;
}

function ascii(b: Uint8Array, at: number, n: number) {
  let s = '';
  for (let i = 0; i < n; i++) s += String.fromCharCode(b[at + i]);
  return s;
}

function concat(parts: Uint8Array[]): ArrayBuffer {
  const len = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out.buffer;
}

const okSize = (w: number, h: number) => w > 0 && h > 0 && w <= MAX_SIDE && h <= MAX_SIDE;

/* ───────────────────────── JPEG */
// Keep APP0 (JFIF), APP2 (ICC colour profile) and APP14 (Adobe colour transform); drop the other APPn and comments.
const KEEP_APP = new Set([0xe0, 0xe2, 0xee]);

function jpeg(b: Uint8Array): CleanImage | null {
  const parts: Uint8Array[] = [b.subarray(0, 2)];
  let p = 2;
  let w = 0, h = 0, sawFrame = false;
  while (p < b.length) {
    if (b[p] !== 0xff) return null;
    while (b[p] === 0xff) p++; // fill bytes
    const m = b[p++];
    if (m === undefined) return null;
    if (m === 0xd9) return null; // end before any image data
    if (m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { parts.push(new Uint8Array([0xff, m])); continue; }
    if (p + 2 > b.length) return null;
    const len = (b[p] << 8) | b[p + 1];
    if (len < 2 || p + len > b.length) return null;
    const seg = b.subarray(p - 2, p + len); // includes FF marker
    if ((m >= 0xc0 && m <= 0xcf) && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      if (len < 8) return null;
      h = (b[p + 3] << 8) | b[p + 4];
      w = (b[p + 5] << 8) | b[p + 6];
      if (!okSize(w, h)) return null;
      sawFrame = true;
    }
    const isApp = m >= 0xe0 && m <= 0xef;
    if (!(isApp && !KEEP_APP.has(m)) && m !== 0xfe) parts.push(seg);
    p += len;
    if (m === 0xda) {
      if (!sawFrame) return null;
      // Entropy-coded data runs until a marker that is not a stuffed 00 or a restart (D0–D7).
      // Further scans (progressive JPEG) begin with another marker and are handled by the outer loop.
      const start = p;
      for (;;) {
        const f = b.indexOf(0xff, p);
        if (f < 0 || f + 1 >= b.length) return null; // truncated: no end marker
        const n = b[f + 1];
        if (n === 0x00 || (n >= 0xd0 && n <= 0xd7) || n === 0xff) { p = f + (n === 0xff ? 1 : 2); continue; }
        parts.push(b.subarray(start, f));
        p = f;
        break;
      }
      if (b[p + 1] === 0xd9) {
        parts.push(new Uint8Array([0xff, 0xd9])); // everything after this is discarded
        return { buf: concat(parts), type: 'image/jpeg', width: w, height: h };
      }
    }
  }
  return null;
}

/* ───────────────────────── PNG */
// Critical chunks plus the ancillary ones that affect how the picture looks. Text / EXIF / time chunks are dropped.
const KEEP_PNG = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'gAMA', 'cHRM', 'sRGB', 'iCCP', 'sBIT', 'pHYs', 'bKGD']);

function png(b: Uint8Array): CleanImage | null {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!sig.every((v, i) => b[i] === v)) return null;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const parts: Uint8Array[] = [b.subarray(0, 8)];
  let p = 8, first = true, w = 0, h = 0, sawData = false;
  while (p + 12 <= b.length) {
    const len = dv.getUint32(p);
    const type = ascii(b, p + 4, 4);
    if (!/^[A-Za-z]{4}$/.test(type) || len > b.length || p + 12 + len > b.length) return null;
    if (first) {
      if (type !== 'IHDR' || len !== 13) return null;
      w = dv.getUint32(p + 8); h = dv.getUint32(p + 12);
      if (!okSize(w, h)) return null;
      first = false;
    }
    if (type === 'IDAT') sawData = true;
    const isCritical = type[0] === type[0].toUpperCase();
    if (isCritical && !KEEP_PNG.has(type)) return null; // unknown critical chunk: not a normal image
    if (KEEP_PNG.has(type)) parts.push(b.subarray(p, p + 12 + len));
    p += 12 + len;
    if (type === 'IEND') return sawData ? { buf: concat(parts), type: 'image/png', width: w, height: h } : null;
  }
  return null; // no IEND: truncated
}

/* ───────────────────────── WebP */
function webp(b: Uint8Array): CleanImage | null {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const riff = dv.getUint32(4, true);
  const end = 8 + riff;
  if (riff < 12 || end > b.length || riff % 2 !== 0) return null;
  let p = 12, w = 0, h = 0, sawImage = false;
  const first = ascii(b, 12, 4);
  if (!['VP8 ', 'VP8L', 'VP8X'].includes(first)) return null;
  while (p + 8 <= end) {
    const type = ascii(b, p, 4);
    const len = dv.getUint32(p + 4, true);
    const next = p + 8 + len + (len % 2);
    if (next > end) return null;
    if (type === 'VP8X' && len >= 10) {
      w = 1 + (b[p + 12] | (b[p + 13] << 8) | (b[p + 14] << 16));
      h = 1 + (b[p + 15] | (b[p + 16] << 8) | (b[p + 17] << 16));
    } else if (type === 'VP8 ' && len >= 10) {
      w = dv.getUint16(p + 14, true) & 0x3fff; h = dv.getUint16(p + 16, true) & 0x3fff; sawImage = true;
    } else if (type === 'VP8L' && len >= 5) {
      const bits = dv.getUint32(p + 9, true);
      w = (bits & 0x3fff) + 1; h = ((bits >> 14) & 0x3fff) + 1; sawImage = true;
    } else if (type === 'ANMF' || type === 'ALPH') {
      sawImage = true;
    }
    p = next;
  }
  if (p !== end || !sawImage || !okSize(w, h)) return null;
  // EXIF/XMP chunks are left in place (removing them would require rewriting the VP8X flags);
  // our order form never sends WebP, it re-encodes every photo to JPEG in the browser.
  return { buf: b.slice(0, end).buffer, type: 'image/webp', width: w, height: h };
}

/** Headers for serving stored images: shown as a picture only, never as a page that can run anything. */
export const imageHeaders = (type: string, cache: string) => ({
  'content-type': type,
  'cache-control': cache,
  'content-disposition': 'inline; filename="image"',
  'content-security-policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
  'cross-origin-resource-policy': 'same-origin',
  'x-content-type-options': 'nosniff',
});
