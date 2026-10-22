import type { Lang } from '../config/catalog';

export const ui = {
  ar: {
    dir: 'rtl',
    langName: 'العربية',
    otherLang: 'English',
    nav: { home: 'الرئيسية', boxes: 'الصناديق', how: 'كيف تعمل؟', habbouk: 'حبّوك', faq: 'الأسئلة', order: 'اطلب قصة لطفلك', menu: 'القائمة', close: 'إغلاق' },
    meta: {
      homeTitle: 'حبكة | قصة بطلها طفلك',
      homeDesc: 'قصص أطفال مطبوعة ومخصّصة: طفلك بطل الحكاية باسمه وملامحه، مع ستيكرات ونشاطات من حبّوك. توصيل داخل دمشق وشحن لكل المحافظات.',
    },
    hero: {
      eyebrow: 'حكاية تُصنع لطفلك',
      title: 'قصة بطلها طفلك… وحبكتها حبّك',
      text: 'نحوّل اسم طفلك وملامحه وقيمة تهمّك إلى كتاب مطبوع يعيش مغامرته صفحةً بعد صفحة.',
      cta: 'اطلب قصته الآن',
      cta2: 'شاهد الصناديق',
      note: 'مسودة مجانية أولاً، ولا تدفع إلا بعد أن تعجبك.',
      imgAlt: 'طفل يقرأ قصة حبكة التي يظهر هو على غلافها',
    },
    values3: [
      { t: 'طفلك هو البطل', d: 'اسمه وشكله وعمره داخل كل صفحة.' },
      { t: 'قيمة تختارها أنت', d: 'الصدق، الشجاعة، الصلاة… أو فكرتك الخاصة.' },
      { t: 'مسودة قبل الدفع', d: 'تراها وتعدّل عليها، ثم تعتمدها.' },
    ],
    boxes: { title: 'اختر صندوق حكايتك', sub: 'كل صندوق يبدأ بقصة مطبوعة بطلها طفلك.', popular: 'الأكثر اختياراً', choose: 'اختر هذا الصندوق', soon: 'قريباً', priceNote: 'أسعار مبدئية، وقد تتغير قبل الإطلاق.', shipping: '+ الشحن حسب المحافظة' },
    standalone: { title: 'منتجات حبّوك منفردة', sub: 'لأي طفل، حتى بدون قصة.', cta: 'اطلبها وحدها' },
    how: {
      title: 'كيف تعمل حبكة؟',
      steps: [
        { t: 'اختر الصندوق والقيمة', d: 'اختر قيمة جاهزة، أو اكتب فكرتك الخاصة للقصة.' },
        { t: 'أخبرنا عن طفلك', d: 'اسمه وعمره وما يحبه، وصورته إن رغبت ليشبهه البطل.' },
        { t: 'مسودة مجانية خلال {draft}', d: 'نرسل لك رابطاً خاصاً تراجع فيه القصة، فتعتمدها أو تطلب تعديلاً.' },
        { t: 'الدفع ثم الطباعة', d: 'بعد اعتمادك تدفع بالتحويل (شام كاش أو حوالة)، ونطبع خلال {print}، ثم يصل الصندوق إليك.' },
      ],
    },
    valuesSection: { title: 'قيمة تزرعها الحكاية', sub: 'اختر حتى قيمتين، أو اكتب فكرتك الخاصة عند الطلب.', more: 'وغيرها…' },
    habbouk: {
      title: 'تعرّف إلى حبّوك',
      text: 'حبّوك صديق طفلك الذي خرج من صفحات حبكة. يرافقه في الستيكرات وبطاقات حبكتك وعدّة الزراعة، ويمكن لطفلك أن يلتقط صورة معه بالكاميرا.',
      cta: 'التقط صورة مع حبّوك',
      more: 'اعرف المزيد عن حبّوك',
      imgAlt: 'حبّوك يلوّح بيده',
    },
    gallery: { title: 'كيف يبدو صندوق حبكة؟', sub: 'صور توضيحية للتصميم، وقد يختلف المنتج النهائي قليلاً.', kitAlt: 'صندوق حبكة مفتوحاً ومحتوياته', giftAlt: 'صندوق حبكة مغلّف كهدية', girlAlt: 'طفلة تقرأ قصتها من حبكة', doctorAlt: 'طفل يحمل قصته وهو طبيب على الغلاف' },
    faq: {
      title: 'أسئلة شائعة',
      items: [
        { q: 'كيف أطلب قصة لطفلي؟', a: 'اضغط «اطلب قصة لطفلك»، واملأ الخطوات القصيرة، ثم أرسل الطلب. يصلك رقم الطلب وزر لمتابعته معنا على واتساب.' },
        { q: 'متى أدفع؟', a: 'لا تدفع شيئاً عند الطلب. نرسل لك مسودة مجانية خلال {draft}، وبعد أن تعتمدها تدفع المبلغ كاملاً بالتحويل (شام كاش أو حوالة)، ثم نبدأ الطباعة.' },
        { q: 'ما الأعمار المناسبة؟', a: 'من سنتين إلى 12 سنة. نكيّف طول النص وأسلوبه حسب عمر الطفل.' },
        { q: 'هل يمكن أن تكون القصة بالإنجليزية؟', a: 'نعم، تختار لغة القصة عند الطلب: العربية أو الإنجليزية.' },
        { q: 'لماذا تحتاجون صورة طفلي؟', a: 'الصورة اختيارية، وتساعدنا ليشبه بطلُ القصة طفلَك. يمكنك رفعها في الموقع أو إرسالها على واتساب. لا ننشرها أبداً، ونحذفها تلقائياً بعد {days} يوماً.' },
        { q: 'أين توصلون؟', a: 'نوصل داخل دمشق، ونشحن إلى كل المحافظات السورية. تكلفة الشحن تظهر عند اختيار المحافظة.' },
        { q: 'هل يمكنني تعديل المسودة؟', a: 'نعم. في صفحة المسودة تكتب ملاحظاتك، فنعدّل ونرسل لك نسخة جديدة قبل الدفع.' },
      ],
    },
    finalCta: { title: 'ابدأ حكاية بطلها طفلك', text: 'المسودة مجانية، ولا تدفع إلا بعد أن تعجبك.', cta: 'ابدأ طلب القصة' },
    footer: { about: 'قصص أطفال مخصّصة ومطبوعة، بطلها طفلك.', links: 'روابط', contact: 'تواصل معنا', privacy: 'سياسة الخصوصية', terms: 'شروط الطلب', rights: 'جميع الحقوق محفوظة.' },
    common: { whatsapp: 'واتساب', instagram: 'إنستغرام', facebook: 'فيسبوك', skip: 'تخطَّ إلى المحتوى', backHome: 'العودة للرئيسية' },
  },
  en: {
    dir: 'ltr',
    langName: 'English',
    otherLang: 'العربية',
    nav: { home: 'Home', boxes: 'Boxes', how: 'How it works', habbouk: 'Habbouk', faq: 'FAQ', order: 'Order a story', menu: 'Menu', close: 'Close' },
    meta: {
      homeTitle: 'Hobka | A story starring your child',
      homeDesc: 'Personalized printed children’s stories: your child is the hero, with their name and look, plus stickers and activities from Habbouk. Delivery in Damascus and shipping across Syria.',
    },
    hero: {
      eyebrow: 'A story made for your child',
      title: 'A story starring your child, woven with your love',
      text: 'We turn your child’s name, look and a value you care about into a printed book where they live the adventure page by page.',
      cta: 'Order their story',
      cta2: 'See the boxes',
      note: 'A free draft first. You only pay once you love it.',
      imgAlt: 'A child reading the Hobka story with himself on the cover',
    },
    values3: [
      { t: 'Your child is the hero', d: 'Their name, look and age on every page.' },
      { t: 'A value you choose', d: 'Honesty, courage, prayer… or your own idea.' },
      { t: 'Draft before payment', d: 'Review it, request changes, then approve.' },
    ],
    boxes: { title: 'Choose your story box', sub: 'Every box starts with a printed story starring your child.', popular: 'Most chosen', choose: 'Choose this box', soon: 'Soon', priceNote: 'Introductory prices, may change before launch.', shipping: '+ shipping by governorate' },
    standalone: { title: 'Habbouk products on their own', sub: 'For any child, even without a story.', cta: 'Order them alone' },
    how: {
      title: 'How Hobka works',
      steps: [
        { t: 'Pick a box and a value', d: 'Choose a ready value, or write your own story idea.' },
        { t: 'Tell us about your child', d: 'Name, age and what they love, plus a photo if you like, so the hero looks like them.' },
        { t: 'Free draft within {draft}', d: 'We send you a private link to review the story, approve it or ask for changes.' },
        { t: 'Payment, then printing', d: 'After approval you pay by transfer (Sham Cash or remittance). We print in {print} and deliver the box.' },
      ],
    },
    valuesSection: { title: 'A value the story plants', sub: 'Pick up to two values, or write your own idea when ordering.', more: 'and more…' },
    habbouk: {
      title: 'Meet Habbouk',
      text: 'Habbouk is your child’s friend who stepped out of Hobka’s pages. He appears on the stickers, the Hobka Talk cards and the planting kit, and your child can take a photo with him using the camera.',
      cta: 'Take a photo with Habbouk',
      more: 'More about Habbouk',
      imgAlt: 'Habbouk waving',
    },
    gallery: { title: 'What does a Hobka box look like?', sub: 'Illustrative design images; the final product may differ slightly.', kitAlt: 'An open Hobka box and its contents', giftAlt: 'A Hobka box wrapped as a gift', girlAlt: 'A girl reading her Hobka story', doctorAlt: 'A boy holding his story with himself as a doctor on the cover' },
    faq: {
      title: 'Questions',
      items: [
        { q: 'How do I order?', a: 'Tap “Order a story”, complete the short steps and send. You get an order number and a button to follow up with us on WhatsApp.' },
        { q: 'When do I pay?', a: 'Nothing at ordering. We send a free draft within {draft}. Once you approve it, you pay the full amount by transfer (Sham Cash or remittance) and we start printing.' },
        { q: 'Which ages?', a: 'From 2 to 12 years. We adapt the text length and style to the child’s age.' },
        { q: 'Can the story be in English?', a: 'Yes. You choose the story language when ordering: Arabic or English.' },
        { q: 'Why a photo of my child?', a: 'It’s optional and helps the hero look like your child. Upload it here or send it on WhatsApp. We never publish it and delete it automatically after {days} days.' },
        { q: 'Where do you deliver?', a: 'Delivery inside Damascus and shipping to every Syrian governorate. Shipping cost appears when you choose your governorate.' },
        { q: 'Can I change the draft?', a: 'Yes. Write your notes on the draft page and we’ll send an updated version before payment.' },
      ],
    },
    finalCta: { title: 'Start a story starring your child', text: 'The draft is free. You only pay once you love it.', cta: 'Start your order' },
    footer: { about: 'Personalized printed stories where your child is the hero.', links: 'Links', contact: 'Contact', privacy: 'Privacy policy', terms: 'Order terms', rights: 'All rights reserved.' },
    common: { whatsapp: 'WhatsApp', instagram: 'Instagram', facebook: 'Facebook', skip: 'Skip to content', backHome: 'Back to home' },
  },
} as const;

export type UI = (typeof ui)[Lang];

export const path = (lang: Lang, p = '/') => (lang === 'ar' ? p : p === '/' ? '/en' : `/en${p}`);

export function fill(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
