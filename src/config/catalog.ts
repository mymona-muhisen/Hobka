/**
 * ملف الإعدادات الوحيد الذي تحتاجين تعديله:
 * الأسعار، الصناديق، الإضافات، القيم، تكاليف الشحن، رقم الواتساب والروابط.
 *
 * ⚠️ كل الأسعار هنا مؤقتة (PLACEHOLDER) إلى أن تصل الأرقام الحقيقية.
 * بعد أي تعديل: احفظي الملف وارفعيه إلى GitHub، فيُعاد نشر الموقع تلقائياً.
 */

export type Text = { ar: string; en: string };
export type Lang = 'ar' | 'en';

// ─────────────────────────────── التواصل
export const contact = {
  /** رقم الواتساب بالصيغة الدولية بدون + أو أصفار في البداية */
  whatsapp: '963968190380',
  whatsappDisplay: '+963 968 190 380',
  instagram: 'https://www.instagram.com/hobka_stories',
  facebook: 'https://www.facebook.com/share/1LoyHFnMCw/',
  /** صفحة الصورة مع حبّوك (AR) */
  arUrl: 'https://hobka.pages.dev',
};

// ─────────────────────────────── الدفع (يُرسل للعميل على واتساب بعد اعتماد المسودة)
export const payment = {
  /** ⚠️ عدّلي هذا النص بتفاصيل شام كاش / الحوالة الحقيقية */
  instructions: {
    ar: 'طرق الدفع: شام كاش أو حوالة.\n(ضعي هنا رقم شام كاش أو اسم مستلم الحوالة)',
    en: 'Payment: Sham Cash or remittance.\n(put the Sham Cash number or remittance recipient here)',
  } as Text,
};

// ─────────────────────────────── العملة والمدد
export const currency = { code: 'USD', symbol: '$' };
export const timing = {
  draftDays: { ar: 'يومين أو ثلاثة', en: '2–3 days' } as Text,
  printDays: { ar: 'حوالي أسبوع', en: 'about a week' } as Text,
};
/** هل الأسعار نهائية؟ اجعليها true عندما تضعين الأسعار الحقيقية (تختفي ملاحظة "أسعار مبدئية"). */
export const pricesAreFinal = false;

// ─────────────────────────────── المنتجات
export type ItemId =
  | 'story'
  | 'stickers'
  | 'cards'
  | 'planting'
  | 'puzzle'
  | 'figure3d'
  | 'newspaper';

export interface Item {
  id: ItemId;
  name: Text;
  desc: Text;
  /** شخصي (يحتاج بيانات الطفل) أم ثابت */
  personalized: boolean;
  /** متاح الآن، أو "قريباً" */
  status: 'available' | 'soon';
  /** سعر الإضافة منفردة (بالدولار). null = لا تُباع منفردة */
  addonPrice: number | null;
  /** تُباع لأي أحد بدون قصة */
  standalone: boolean;
}

export const items: Record<ItemId, Item> = {
  story: {
    id: 'story',
    name: { ar: 'القصة المخصّصة المطبوعة', en: 'Personalized printed story' },
    desc: { ar: 'كتاب مطبوع بطله طفلك، باسمه وملامحه وقيمته المختارة.', en: 'A printed book starring your child: their name, look and chosen value.' },
    personalized: true,
    status: 'available',
    addonPrice: null,
    standalone: false,
  },
  stickers: {
    id: 'stickers',
    name: { ar: 'ستيكرات بطل القصة', en: 'Story hero stickers' },
    desc: { ar: 'ورقة ستيكرات لطفلك بشكله الكرتوني من القصة.', en: "A sticker sheet of your child's cartoon self from the story." },
    personalized: true,
    status: 'available',
    addonPrice: 4,
    standalone: false,
  },
  cards: {
    id: 'cards',
    name: { ar: 'بطاقات حبكتك', en: 'Hobka Talk cards' },
    desc: { ar: 'أسئلة وتحديات من حبّوك، مستوحاة من العلاج السلوكي المعرفي، تفتح الحوار مع طفلك.', en: 'Questions and challenges from Habbouk, inspired by CBT, to open conversations with your child.' },
    personalized: false,
    status: 'available',
    addonPrice: 7,
    standalone: true,
  },
  planting: {
    id: 'planting',
    name: { ar: 'عدّة الزراعة «حديقتي مع حبّوك»', en: '"My garden with Habbouk" planting kit' },
    desc: { ar: 'بروشور وبذور وأصيص صغير، ليزرع طفلك نبتته ويعتني بها.', en: 'A guide, seeds and a small pot so your child can grow and care for a plant.' },
    personalized: false,
    status: 'available',
    addonPrice: 8,
    standalone: true,
  },
  puzzle: {
    id: 'puzzle',
    name: { ar: 'بازل غلاف القصة', en: 'Story cover puzzle' },
    desc: { ar: 'بازل مطبوع من غلاف قصة طفلك.', en: "A jigsaw puzzle printed from your child's story cover." },
    personalized: true,
    status: 'available',
    addonPrice: 10,
    standalone: false,
  },
  figure3d: {
    id: 'figure3d',
    name: { ar: 'مجسّم حبّوك', en: 'Habbouk figure' },
    desc: { ar: 'حبّوك مطبوعاً بطابعة ثلاثية الأبعاد.', en: 'Habbouk, 3D printed.' },
    personalized: false,
    status: 'soon',
    addonPrice: null,
    standalone: false,
  },
  newspaper: {
    id: 'newspaper',
    name: { ar: 'جريدة نشاطات حبّوك', en: "Habbouk's activity paper" },
    desc: { ar: 'متاهات وألغاز ونشاطات ممتعة.', en: 'Mazes, riddles and fun activities.' },
    personalized: false,
    status: 'soon',
    addonPrice: null,
    standalone: false,
  },
};

// ─────────────────────────────── الصناديق
export type BoxId = 'story' | 'hobka' | 'full';

export interface Box {
  id: BoxId;
  name: Text;
  tagline: Text;
  price: number;
  includes: ItemId[];
  popular?: boolean;
}

export const boxes: Box[] = [
  {
    id: 'story',
    name: { ar: 'صندوق القصة', en: 'Story box' },
    tagline: { ar: 'البداية: قصة طفلك وستيكراته', en: "The start: your child's story and stickers" },
    price: 25, // PLACEHOLDER
    includes: ['story', 'stickers'],
  },
  {
    id: 'hobka',
    name: { ar: 'صندوق حبكة', en: 'Hobka box' },
    tagline: { ar: 'الأكثر اختياراً: قصة ونشاطات تكمل الحكاية', en: 'Most chosen: the story plus activities that continue it' },
    price: 35, // PLACEHOLDER
    includes: ['story', 'stickers', 'cards', 'planting'],
    popular: true,
  },
  {
    id: 'full',
    name: { ar: 'الصندوق الكامل', en: 'Full box' },
    tagline: { ar: 'كل شيء، مع بازل غلاف القصة', en: 'Everything, plus the story cover puzzle' },
    price: 45, // PLACEHOLDER
    includes: ['story', 'stickers', 'cards', 'planting', 'puzzle', 'figure3d', 'newspaper'],
  },
];

// ─────────────────────────────── الشحن (لكل محافظة، بالدولار)
export interface Governorate {
  id: string;
  name: Text;
  shipping: number; // PLACEHOLDER
}

export const governorates: Governorate[] = [
  { id: 'damascus', name: { ar: 'دمشق', en: 'Damascus' }, shipping: 2 },
  { id: 'rif-dimashq', name: { ar: 'ريف دمشق', en: 'Rif Dimashq' }, shipping: 3 },
  { id: 'aleppo', name: { ar: 'حلب', en: 'Aleppo' }, shipping: 5 },
  { id: 'homs', name: { ar: 'حمص', en: 'Homs' }, shipping: 4 },
  { id: 'hama', name: { ar: 'حماة', en: 'Hama' }, shipping: 4 },
  { id: 'latakia', name: { ar: 'اللاذقية', en: 'Latakia' }, shipping: 5 },
  { id: 'tartus', name: { ar: 'طرطوس', en: 'Tartus' }, shipping: 5 },
  { id: 'idlib', name: { ar: 'إدلب', en: 'Idlib' }, shipping: 6 },
  { id: 'daraa', name: { ar: 'درعا', en: 'Daraa' }, shipping: 4 },
  { id: 'as-suwayda', name: { ar: 'السويداء', en: 'As-Suwayda' }, shipping: 4 },
  { id: 'quneitra', name: { ar: 'القنيطرة', en: 'Quneitra' }, shipping: 4 },
  { id: 'deir-ez-zor', name: { ar: 'دير الزور', en: 'Deir ez-Zor' }, shipping: 7 },
  { id: 'raqqa', name: { ar: 'الرقة', en: 'Raqqa' }, shipping: 7 },
  { id: 'hasakah', name: { ar: 'الحسكة', en: 'Al-Hasakah' }, shipping: 7 },
];

// ─────────────────────────────── القيم الجاهزة للقصة
export interface StoryValue {
  id: string;
  name: Text;
  desc: Text;
  emoji: string;
}

export const storyValues: StoryValue[] = [
  { id: 'prayer', emoji: '🕌', name: { ar: 'حبّ الصلاة', en: 'Loving prayer' }, desc: { ar: 'يكتشف أن الصلاة نور وقوة، لا واجب ثقيل.', en: 'Discovers prayer as light and strength, not a chore.' } },
  { id: 'courage', emoji: '🦁', name: { ar: 'الشجاعة ومواجهة الخوف', en: 'Courage and facing fears' }, desc: { ar: 'من الظلام أو الطبيب أو المدرسة الجديدة.', en: 'Of the dark, the doctor or a new school.' } },
  { id: 'confidence', emoji: '🌟', name: { ar: 'الثقة بالنفس وتجاوز الخجل', en: 'Confidence and shyness' }, desc: { ar: 'يجد صوته ويؤمن بقدراته.', en: 'Finds their voice and believes in themselves.' } },
  { id: 'focus', emoji: '🎯', name: { ar: 'التركيز وإنهاء المهمة', en: 'Focus and finishing tasks' }, desc: { ar: 'يتعلم أن يكمل ما بدأه خطوة بخطوة.', en: 'Learns to finish what they start, step by step.' } },
  { id: 'honesty', emoji: '🤍', name: { ar: 'الصدق', en: 'Honesty' }, desc: { ar: 'يكتشف أن الصدق يجعل القلب خفيفاً.', en: 'Finds that honesty makes the heart light.' } },
  { id: 'sharing', emoji: '🎁', name: { ar: 'المشاركة والكرم', en: 'Sharing and generosity' }, desc: { ar: 'يتعلم فرحة العطاء مع إخوته وأصدقائه.', en: 'Learns the joy of giving with siblings and friends.' } },
  { id: 'parents', emoji: '🏡', name: { ar: 'برّ الوالدين واحترام الكبار', en: 'Kindness to parents and elders' }, desc: { ar: 'يقدّر تعب أهله ويعبّر عن حبه لهم.', en: 'Appreciates their parents and shows love.' } },
  { id: 'responsibility', emoji: '🧺', name: { ar: 'الترتيب والمسؤولية', en: 'Tidiness and responsibility' }, desc: { ar: 'غرفته وأغراضه وواجباته الصغيرة.', en: 'Their room, belongings and small duties.' } },
  { id: 'patience', emoji: '🌱', name: { ar: 'الصبر وتهدئة الغضب', en: 'Patience and calming anger' }, desc: { ar: 'يتعلم أن يتنفس ويهدأ قبل أن يتصرف.', en: 'Learns to breathe and calm down before acting.' } },
  { id: 'sibling', emoji: '👶', name: { ar: 'استقبال أخ أو أخت جديدة', en: 'Welcoming a new sibling' }, desc: { ar: 'يصبح الأخ الكبير البطل.', en: 'Becomes the hero big sibling.' } },
  { id: 'sleep', emoji: '🌙', name: { ar: 'النوم وحده بهدوء', en: 'Sleeping alone calmly' }, desc: { ar: 'غرفته مكان آمن ودافئ.', en: 'Their room is a safe, warm place.' } },
  { id: 'screens', emoji: '📱', name: { ar: 'التوازن مع الشاشات', en: 'Balance with screens' }, desc: { ar: 'يكتشف متعة اللعب والعالم خارج الشاشة.', en: 'Discovers the fun beyond the screen.' } },
  { id: 'friendship', emoji: '🤝', name: { ar: 'الصداقة والتعاون', en: 'Friendship and teamwork' }, desc: { ar: 'يكوّن أصدقاء ويعرف قيمة العمل معاً.', en: 'Makes friends and values working together.' } },
  { id: 'learning', emoji: '📚', name: { ar: 'حبّ القراءة والتعلّم', en: 'Loving reading and learning' }, desc: { ar: 'كل كتاب باب لمغامرة جديدة.', en: 'Every book is a door to adventure.' } },
  { id: 'food', emoji: '🥕', name: { ar: 'الطعام الصحي', en: 'Healthy eating' }, desc: { ar: 'يجرب أطعمة جديدة ويحبها.', en: 'Tries new foods and enjoys them.' } },
  { id: 'gratitude', emoji: '☀️', name: { ar: 'الامتنان والرضا', en: 'Gratitude' }, desc: { ar: 'يرى النعم الصغيرة من حوله.', en: 'Notices the small blessings around them.' } },
];

/** أقصى عدد قيم يختارها الأهل في قصة واحدة */
export const maxValues = 2;

// ─────────────────────────────── أساليب الرسم (تظهر عند تفعيلها بعد تجهيز صور الأمثلة)
export const stylesEnabled = false;
export const artStyles = [
  { id: 'calm', name: { ar: 'حكاية هادئة', en: 'Calm tale' }, desc: { ar: 'قلم ملون وألوان مائية ناعمة', en: 'Colored pencil and soft watercolor' } },
  { id: 'cartoon', name: { ar: 'فيلم كرتون', en: 'Cartoon movie' }, desc: { ar: 'رسوم ثلاثية الأبعاد ناعمة', en: 'Soft 3D look' } },
  { id: 'storybook', name: { ar: 'كتاب الحكايات', en: 'Storybook' }, desc: { ar: 'ألوان غواش دافئة', en: 'Warm gouache' } },
  { id: 'crayon', name: { ar: 'رسمة طفل', en: "Child's drawing" }, desc: { ar: 'ألوان شمعية مرحة', en: 'Playful crayons' } },
];

// ─────────────────────────────── حدود أخرى
export const ages = { min: 2, max: 12 };
export const storyLanguages: { id: Lang; name: Text }[] = [
  { id: 'ar', name: { ar: 'العربية', en: 'Arabic' } },
  { id: 'en', name: { ar: 'الإنجليزية', en: 'English' } },
];
/** عدد الأيام التي تبقى فيها صور الأطفال قبل الحذف التلقائي */
export const photoRetentionDays = 60;
export const maxPhotos = 3;
