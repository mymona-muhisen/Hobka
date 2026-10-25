import type { Lang } from '../config/catalog';

export const ui = {
  ar: {
    dir: 'rtl',
    langName: 'العربية',
    otherLang: 'English',
    nav: { home: 'الرئيسية', boxes: 'الصناديق', how: 'كيف تعمل؟', habbouk: 'حبّوك', faq: 'الأسئلة', order: 'اطلب قصة لطفلك', menu: 'القائمة', close: 'إغلاق' },
    meta: {
      homeTitle: 'حبكة | قصص أطفال مخصّصة بطلها طفلك، هدية مطبوعة في سوريا',
      homeDesc: 'اطلب قصة أطفال مطبوعة بطلها طفلك، باسمه وشكله وقيمة تختارها، مع ستيكرات بشكله الكرتوني وصورة مع حبّوك بالكاميرا. هدية مميزة للأطفال من 2 إلى 12 سنة، توصيل في دمشق وريفها وشحن لكل المحافظات السورية.',
    },
    hero: {
      eyebrow: 'حكاية تُصنع لطفلك',
      title: 'قصة بطلها طفلك… وحبكتها حبّك',
      text: 'نحوّل اسم طفلك وملامحه وقيمة تهمّك إلى كتاب مطبوع يعيش مغامرته صفحةً بعد صفحة.',
      cta: 'اطلب قصته الآن',
      cta2: 'شاهد الصناديق',
      note: 'ترى شكل طفلك في الرسم أولاً، ولا تدفع إلا بعد موافقتك.',
      imgAlt: 'طفل يقرأ قصة حبكة التي يظهر هو على غلافها',
    },
    values3: [
      { t: 'طفلك هو البطل', d: 'اسمه وشكله وعمره داخل كل صفحة.' },
      { t: 'قيمة تختارها أنت', d: 'الصدق، الشجاعة، الصلاة… أو فكرتك الخاصة.' },
      { t: 'شكله قبل الدفع', d: 'نرسل لك رسمة طفلك لتوافق على الشبه، والقصة تبقى مفاجأة.' },
    ],
    boxes: { title: 'اختر صندوق حكايتك', sub: 'كل صندوق يبدأ بقصة مطبوعة بطلها طفلك.', popular: 'الأكثر اختياراً', choose: 'اختر هذا الصندوق', valuesLead: 'حكايات عن:', valuesMore: 'و{n} قيمة غيرها، أو فكرتك الخاصة', timeline: 'من الطلب إلى الاستلام حوالي أسبوعين. للمناسبات، اطلب قبلها بأسبوعين على الأقل.', soon: 'قريباً', priceNote: 'أسعار مبدئية، وقد تتغير قبل الإطلاق.', shipping: '+ الشحن (تقريبي) حسب المحافظة' },
    standalone: { title: 'منتجات حبّوك منفردة', sub: 'لأي طفل، حتى بدون قصة.', cta: 'اطلبها وحدها' },
    how: {
      title: 'كيف تعمل حبكة؟',
      steps: [
        { t: 'اختر الصندوق والقيمة', d: 'اختر قيمة جاهزة، أو اكتب فكرتك الخاصة للقصة.' },
        { t: 'أخبرنا عن طفلك', d: 'اسمه وعمره وما يحبه، وصورته إن رغبت ليشبهه البطل.' },
        { t: 'شكل طفلك خلال {draft}', d: 'نرسل لك رابطاً خاصاً فيه رسمة طفلك، فتوافق على الشبه أو تطلب تعديلاً. القصة نفسها تبقى مفاجأة.' },
        { t: 'الدفع ثم الطباعة', d: 'بعد موافقتك تدفع بالتحويل (شام كاش أو حوالة)، ونطبع خلال {print}، ثم يصل الصندوق إليك.' },
      ],
    },
    surprise: { title: 'الحكاية تبقى مفاجأة', text: 'لا نعرض عليك القصة قبل الطباعة، حتى يعيش طفلك، وأنت معه، فرحة فتح الصندوق لأول مرة. نعرض عليك فقط شكل طفلك في الرسم، لتطمئن أنه يشبهه قبل أن ندفع به إلى المطبعة.', imgAlt: 'يد طفل تزيح ستارة وردية عن ضوء دافئ' },
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
        { q: 'متى أدفع؟', a: 'لا تدفع شيئاً عند الطلب. نرسل لك رسمة طفلك خلال {draft}، وبعد موافقتك على الشبه تدفع المبلغ كاملاً بالتحويل (شام كاش أو حوالة)، ثم نبدأ الطباعة.' },
        { q: 'ما الأعمار المناسبة؟', a: 'من سنتين إلى 12 سنة. نكيّف طول النص وأسلوبه حسب عمر الطفل.' },
        { q: 'هل يمكن أن تكون القصة بالإنجليزية؟', a: 'نعم، تختار لغة القصة عند الطلب: العربية أو الإنجليزية.' },
        { q: 'لماذا تحتاجون صورة طفلي؟', a: 'الصورة اختيارية، وتساعدنا ليشبه بطلُ القصة طفلَك. يمكنك رفعها في الموقع أو إرسالها على واتساب. لا ننشرها أبداً، ونحذفها تلقائياً بعد {days} يوماً.' },
        { q: 'أين توصلون، وكم الشحن؟', a: 'نوصل إلى دمشق وريفها، ونشحن إلى كل المحافظات السورية. تكلفة الشحن التي تظهر عند الطلب تقريبية، والسعر النهائي تحدده شركة الشحن، ونخبرك به قبل الدفع.' },
        { q: 'هل أرى القصة قبل الطباعة؟', a: 'لا، القصة مفاجأة لك ولطفلك. نرسل لك فقط شكل طفلك في الرسم، وإن لم يعجبك الشبه تكتب ملاحظاتك فنعدّله قبل الدفع.' },
        { q: 'كم يستغرق الطلب حتى يصل؟', a: 'حوالي أسبوعين من الطلب إلى الاستلام: نرسل رسمة طفلك خلال {draft}، وبعد موافقتك والدفع تأخذ الطباعة {print}، ثم التوصيل. إن كانت هدية لمناسبة، اطلب قبلها بأسبوعين على الأقل.' },
        { q: 'أريدها هدية ولا أملك صورة للطفل، هل يمكن؟', a: 'نعم. الصورة اختيارية، ويكفي أن تصف شكله: لون الشعر والبشرة والعينين، وطول الشعر، والنظارات إن وُجدت. يمكنك أيضاً كتابة إهداء يُطبع في أول القصة، وتوصيل الصندوق إلى أي عنوان تكتبه في الطلب.' },
      ],
    },
    finalCta: { title: 'ابدأ حكاية بطلها طفلك', text: 'ترى شكل طفلك أولاً، ولا تدفع إلا بعد موافقتك.', cta: 'ابدأ طلب القصة' },
    footer: { about: 'قصص أطفال مخصّصة ومطبوعة، بطلها طفلك.', links: 'روابط', contact: 'تواصل معنا', privacy: 'سياسة الخصوصية', terms: 'شروط الطلب', rights: 'جميع الحقوق محفوظة.' },
    common: { whatsapp: 'واتساب', instagram: 'إنستغرام', facebook: 'فيسبوك', skip: 'تخطَّ إلى المحتوى', backHome: 'العودة للرئيسية' },
  },
  en: {
    dir: 'ltr',
    langName: 'English',
    otherLang: 'العربية',
    nav: { home: 'Home', boxes: 'Boxes', how: 'How it works', habbouk: 'Habbouk', faq: 'FAQ', order: 'Order a story', menu: 'Menu', close: 'Close' },
    meta: {
      homeTitle: 'Hobka | Personalized children’s books starring your child, Syria',
      homeDesc: 'Order a printed personalized storybook starring your child, with their name, look and a value you choose, plus stickers of their cartoon self and a photo with Habbouk through the camera. A unique gift for ages 2–12, delivered across Syria.',
    },
    hero: {
      eyebrow: 'A story made for your child',
      title: 'A story starring your child, woven with your love',
      text: 'We turn your child’s name, look and a value you care about into a printed book where they live the adventure page by page.',
      cta: 'Order their story',
      cta2: 'See the boxes',
      note: 'You see your child’s drawn look first, and only pay after you approve it.',
      imgAlt: 'A child reading the Hobka story with himself on the cover',
    },
    values3: [
      { t: 'Your child is the hero', d: 'Their name, look and age on every page.' },
      { t: 'A value you choose', d: 'Honesty, courage, prayer… or your own idea.' },
      { t: 'Their look before payment', d: 'We send your child’s drawing to approve the likeness; the story stays a surprise.' },
    ],
    boxes: { title: 'Choose your story box', sub: 'Every box starts with a printed story starring your child.', popular: 'Most chosen', choose: 'Choose this box', valuesLead: 'Stories about:', valuesMore: 'and {n} more values, or your own idea', timeline: 'About two weeks from order to delivery. For occasions, order at least two weeks ahead.', soon: 'Soon', priceNote: 'Introductory prices, may change before launch.', shipping: '+ approximate shipping by governorate' },
    standalone: { title: 'Habbouk products on their own', sub: 'For any child, even without a story.', cta: 'Order them alone' },
    how: {
      title: 'How Hobka works',
      steps: [
        { t: 'Pick a box and a value', d: 'Choose a ready value, or write your own story idea.' },
        { t: 'Tell us about your child', d: 'Name, age and what they love, plus a photo if you like, so the hero looks like them.' },
        { t: 'Their look within {draft}', d: 'We send a private link with your child’s drawing to approve the likeness or ask for changes. The story itself stays a surprise.' },
        { t: 'Payment, then printing', d: 'After your approval you pay by transfer (Sham Cash or remittance). We print in {print} and deliver the box.' },
      ],
    },
    surprise: { title: 'The story stays a surprise', text: 'We don’t show you the story before printing, so your child, and you with them, get the joy of opening the box for the first time. We only show you your child’s drawn look, so you know it resembles them before it goes to print.', imgAlt: 'A child’s hand drawing back a pink curtain into warm light' },
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
        { q: 'When do I pay?', a: 'Nothing at ordering. We send your child’s drawing within {draft}. Once you approve the likeness, you pay the full amount by transfer (Sham Cash or remittance) and we start printing.' },
        { q: 'Which ages?', a: 'From 2 to 12 years. We adapt the text length and style to the child’s age.' },
        { q: 'Can the story be in English?', a: 'Yes. You choose the story language when ordering: Arabic or English.' },
        { q: 'Why a photo of my child?', a: 'It’s optional and helps the hero look like your child. Upload it here or send it on WhatsApp. We never publish it and delete it automatically after {days} days.' },
        { q: 'Where do you deliver, and how much is shipping?', a: 'We deliver in Damascus and Rif Dimashq and ship to every Syrian governorate. The shipping cost shown when ordering is approximate; the final price is set by the delivery company and we confirm it before payment.' },
        { q: 'Do I see the story before printing?', a: 'No, the story is a surprise for you and your child. We only send your child’s drawn look; if the likeness isn’t right, write your notes and we adjust it before payment.' },
        { q: 'How long until it arrives?', a: 'About two weeks from order to delivery: we send your child’s drawing within {draft}, printing takes {print} after you approve and pay, then delivery. If it’s a gift for an occasion, order at least two weeks ahead.' },
        { q: 'It’s a gift and I don’t have a photo of the child. Is that OK?', a: 'Yes. The photo is optional; a description is enough: hair, skin and eye colour, hair length, and glasses if any. You can also write a dedication printed at the start of the story, and have the box delivered to any address you enter.' },
      ],
    },
    finalCta: { title: 'Start a story starring your child', text: 'See your child’s look first, and only pay after you approve it.', cta: 'Start your order' },
    footer: { about: 'Personalized printed stories where your child is the hero.', links: 'Links', contact: 'Contact', privacy: 'Privacy policy', terms: 'Order terms', rights: 'All rights reserved.' },
    common: { whatsapp: 'WhatsApp', instagram: 'Instagram', facebook: 'Facebook', skip: 'Skip to content', backHome: 'Back to home' },
  },
} as const;

export type UI = (typeof ui)[Lang];

export const path = (lang: Lang, p = '/') => (lang === 'ar' ? p : p === '/' ? '/en' : `/en${p}`);

export function fill(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
