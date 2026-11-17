/**
 * Every picture on the public site that is not a product photo, and that the admin can replace from /admin/images.
 * Until a picture is replaced, the original file from /public/images is used.
 */

export interface SlotDef {
  id: string;
  /** Arabic name shown in the admin */
  label: string;
  /** where it appears, shown in the admin */
  where: string;
  /** shape hint for the admin */
  shape: string;
  def: { src: string; w: number; h: number };
  /** longest side kept when the admin uploads (the browser shrinks the photo to this) */
  max: number;
  /** keep the transparent background (PNG/WebP cut-outs such as Habbouk) */
  transparent?: boolean;
  /** a smaller copy is made for phones (longest side) */
  small?: { max: number; def: string };
}

export const IMAGE_SLOTS: SlotDef[] = [
  { id: 'hero', label: 'صورة الواجهة', where: 'أعلى الصفحة الرئيسية، وهي أيضاً الصورة التي تظهر عند مشاركة رابط الموقع على واتساب وفيسبوك', shape: 'أفقية 3:2', def: { src: '/images/hero-book.webp', w: 1400, h: 933 }, max: 1600, small: { max: 800, def: '/images/hero-book-sm.webp' } },
  { id: 'habbouk', label: 'حبّوك', where: 'قسم «تعرّف إلى حبّوك» في الرئيسية، أعلى صفحة حبّوك، وصفحة الكاميرا', shape: 'طولية بخلفية شفافة (PNG)', def: { src: '/images/habbouk.webp', w: 520, h: 607 }, max: 900, transparent: true },
  { id: 'habbouk-face', label: 'وجه حبّوك الصغير', where: 'بجانب كلام حبّوك في خطوات نموذج الطلب', shape: 'صغيرة بخلفية شفافة (PNG)', def: { src: '/images/habbouk-face.webp', w: 177, h: 200 }, max: 300, transparent: true },
  { id: 'seedling', label: 'منتجات حبّوك منفردة', where: 'الشريط الأخضر «منتجات حبّوك منفردة» في الرئيسية', shape: 'أفقية عريضة', def: { src: '/images/seedling.webp', w: 900, h: 411 }, max: 1000 },
  { id: 'surprise', label: 'الحكاية تبقى مفاجأة', where: 'قسم «الحكاية تبقى مفاجأة» في الرئيسية', shape: 'أفقية 16:10', def: { src: '/images/surprise.webp', w: 1200, h: 675 }, max: 1400 },
  { id: 'gallery-kit', label: 'المعرض: الصندوق مفتوحاً', where: 'قسم «كيف يبدو صندوق حبكة؟»، الصورة الكبيرة', shape: 'مربعة أو طولية قليلاً', def: { src: '/images/kit.webp', w: 1000, h: 1067 }, max: 1200 },
  { id: 'gallery-girl', label: 'المعرض: طفلة تقرأ', where: 'قسم «كيف يبدو صندوق حبكة؟»', shape: 'أفقية 4:3', def: { src: '/images/girl-reading.webp', w: 1000, h: 782 }, max: 1200 },
  { id: 'gallery-doctor', label: 'المعرض: القصة بيد طفل', where: 'قسم «كيف يبدو صندوق حبكة؟»', shape: 'أفقية 4:3', def: { src: '/images/book-doctor.webp', w: 1000, h: 667 }, max: 1200 },
  { id: 'gallery-gift', label: 'المعرض: الصندوق هدية', where: 'قسم «كيف يبدو صندوق حبكة؟»، الصورة العريضة في الأسفل', shape: 'أفقية عريضة جداً (21:9)', def: { src: '/images/gift.webp', w: 900, h: 900 }, max: 1400 },
  { id: 'habbouk-badge', label: 'شارة حبّوك', where: 'صفحة حبّوك، بجانب «رسالة حبّوك السرية» (تظهر فقط إن كان هذا المنتج ظاهراً)', shape: 'مربعة', def: { src: '/images/habbouk-badge.webp', w: 560, h: 560 }, max: 800, transparent: true },
];

export const SLOT_IDS = new Set(IMAGE_SLOTS.map((s) => s.id));

/** A replaced picture, as stored in the settings. */
export interface StoredImage { v: number; w: number; h: number; small?: boolean }

export interface SiteImg { src: string; w: number; h: number; small?: string; custom: boolean }

/** Public URL + size of a site picture: the admin's upload if there is one, else the original file. */
export function siteImg(images: Record<string, StoredImage> | undefined, id: string): SiteImg {
  const slot = IMAGE_SLOTS.find((s) => s.id === id);
  if (!slot) throw new Error(`unknown image slot ${id}`);
  const up = images?.[id];
  if (up) return { src: `/simg/${id}/${up.v}`, w: up.w, h: up.h, small: up.small ? `/simg/${id}/${up.v}-sm` : undefined, custom: true };
  return { ...slot.def, small: slot.small?.def, custom: false };
}

export const kvKey = (id: string, v: number, small = false) => `simg:${id}:${v}${small ? ':sm' : ''}`;

export function sanitizeImages(v: unknown): Record<string, StoredImage> {
  if (!v || typeof v !== 'object') return {};
  const out: Record<string, StoredImage> = {};
  for (const [id, raw] of Object.entries(v as Record<string, unknown>)) {
    const x = (raw ?? {}) as Partial<StoredImage>;
    if (!SLOT_IDS.has(id) || !Number.isInteger(x.v) || !(Number(x.w) > 0) || !(Number(x.h) > 0)) continue;
    out[id] = { v: x.v!, w: Number(x.w), h: Number(x.h), ...(x.small ? { small: true } : {}) };
  }
  return out;
}
