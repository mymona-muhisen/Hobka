import { z } from 'zod';
import { ages, artStyles, type Lang } from '../config/catalog';

const productId = z.string().trim().regex(/^[a-z0-9-]{1,40}$/);
const trim = (max: number) => z.string().trim().max(max);

export const childSchema = z.object({
  name: trim(40).min(1),
  gender: z.enum(['boy', 'girl']),
  age: z.coerce.number().int().min(ages.min).max(ages.max),
  storyLang: z.enum(['ar', 'en']),
  // Checked against the live list (admin settings) in the order API.
  values: z.array(productId).max(10).default([]),
  valueNote: trim(400).default(''),
  ownIdea: trim(800).default(''),
  appearance: trim(400).default(''),
  interests: trim(300).default(''),
  style: z.enum(artStyles.map((s) => s.id) as [string, ...string[]]).optional(),
});

export const orderSchema = z
  .object({
    siteLang: z.enum(['ar', 'en']),
    kind: z.enum(['box', 'addons']),
    box: productId.nullable().optional(),
    addons: z.array(productId).max(20).default([]),
    child: childSchema.nullable().optional(),
    photoMode: z.enum(['upload', 'whatsapp', 'none']).default('none'),
    photoConsent: z.boolean().default(false),
    parent: z.object({
      name: trim(60).min(2),
      phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/),
      governorate: productId,
      address: trim(300).min(4),
      notes: trim(600).default(''),
    }),
    discountCode: trim(30).default(''),
    privacyAccepted: z.literal(true),
    /** honeypot: real people leave it empty */
    website: z.string().max(0).optional(),
  })
  .superRefine((o, ctx) => {
    if (o.kind === 'box') {
      if (!o.box) ctx.addIssue({ code: 'custom', path: ['box'], message: 'box required' });
      if (!o.child) ctx.addIssue({ code: 'custom', path: ['child'], message: 'child required' });
      else if (o.child.values.length === 0 && !o.child.ownIdea) ctx.addIssue({ code: 'custom', path: ['child', 'values'], message: 'value or idea required' });
      if (o.photoMode === 'upload' && !o.photoConsent) ctx.addIssue({ code: 'custom', path: ['photoConsent'], message: 'consent required' });
      if (o.photoMode === 'none' && (o.child?.appearance ?? '').length < 15) ctx.addIssue({ code: 'custom', path: ['child', 'appearance'], message: 'appearance required without photo' });
    } else if (o.addons.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['addons'], message: 'pick at least one product' });
    }
  });

export type OrderInput = z.infer<typeof orderSchema>;
export type ChildInput = z.infer<typeof childSchema>;

const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function newCode() {
  const b = crypto.getRandomValues(new Uint8Array(5));
  return 'HB-' + Array.from(b, (x) => ALPHA[x % ALPHA.length]).join('');
}
export function newToken() {
  const b = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export const statuses = {
  new: { ar: 'طلب جديد', en: 'New order' },
  drafting: { ar: 'نرسم شخصية الطفل', en: 'Drawing the character' },
  draft_sent: { ar: 'شكل الطفل جاهز للموافقة', en: 'Character ready for approval' },
  changes_requested: { ar: 'طُلب تعديل على الشكل', en: 'Look changes requested' },
  approved: { ar: 'تمت الموافقة، بانتظار الدفع', en: 'Approved, awaiting payment' },
  paid: { ar: 'تم الدفع', en: 'Paid' },
  printing: { ar: 'قيد الطباعة', en: 'Printing' },
  shipped: { ar: 'تم الشحن', en: 'Shipped' },
  delivered: { ar: 'تم التسليم', en: 'Delivered' },
  cancelled: { ar: 'ملغى', en: 'Cancelled' },
} as const;
export type Status = keyof typeof statuses;

export function waLink(phoneIntl: string, text: string) {
  return `https://wa.me/${phoneIntl.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
}

/** Customer → Hobka. Kept short on purpose: no child details in the URL. */
export function customerWhatsappText(lang: Lang, code: string, parentName: string, photoViaWhatsapp: boolean) {
  if (lang === 'en') {
    return [`Hello Hobka 🌸`, `I just placed an order on the website.`, `Order number: ${code}`, `Name: ${parentName}`, photoViaWhatsapp ? `I'll send my child's photo here.` : '']
      .filter(Boolean)
      .join('\n');
  }
  return [`مرحباً حبكة 🌸`, `أرسلت طلباً جديداً من الموقع.`, `رقم الطلب: ${code}`, `الاسم: ${parentName}`, photoViaWhatsapp ? `سأرسل صورة طفلي هنا.` : '']
    .filter(Boolean)
    .join('\n');
}

/** Turn a Syrian number typed by a parent into international digits for wa.me. */
export function toIntl(phone: string) {
  let d = phone.replace(/[^0-9]/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0') && d.length === 10) d = '963' + d.slice(1);
  if (d.length === 9 && d.startsWith('9')) d = '963' + d;
  return d;
}
