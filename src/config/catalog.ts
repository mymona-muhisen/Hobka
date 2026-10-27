/**
 * القيم الأولى للموقع. كل ما يتغير عادةً يُدار الآن من لوحة الإدارة، بدون تعديل هذا الملف:
 *  - المنتجات والصناديق وصورها وأسعارها وتكاليفها: /admin/products
 *  - الشحن، قيم القصة، الواتساب والروابط، نص الدفع، المدد: /admin/settings
 * القيم هنا تُستخدم فقط إلى أن تحفظي أول تعديل من اللوحة.
 * ما زال يُعدَّل من هنا: site.url (عند شراء نطاق)، الأعمار، مدة حفظ الصور، أساليب الرسم.
 */

export type Text = { ar: string; en: string };
export type Lang = 'ar' | 'en';

// ─────────────────────────────── التواصل
/** عنوان الموقع الأساسي (غيّريه عند شراء دومين) ورمز التحقق من Google Search Console إن وُجد */
export const site = {
  url: 'https://stories.hobka.workers.dev',
  googleVerification: 'mG5Z__ik7wCvkAYFUuAVNSN5AlauIX_cPjeuVoQX_RI',
};

export const contact = {
  /** رقم الواتساب بالصيغة الدولية بدون + أو أصفار في البداية */
  whatsapp: '963968190380',
  whatsappDisplay: '+963 968 190 380',
  instagram: 'https://www.instagram.com/hobka_stories',
  facebook: 'https://www.facebook.com/share/1LoyHFnMCw/',
  /** صفحة الصورة مع حبّوك (AR) */
  arUrl: '/ar/',
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

// ─────────────────────────────── المنتجات والصناديق
// ⚠️ صارت المنتجات والصناديق تُدار من لوحة الإدارة (/admin/products).
// القيم هنا هي البداية فقط: تُنسخ إلى قاعدة البيانات أول مرة يعمل فيها الموقع، وبعدها لا تُقرأ من هنا.
export type ItemId = string;
export type BoxId = string;
export type ItemStatus = 'available' | 'soon' | 'hidden';

export interface Item {
  id: ItemId;
  name: Text;
  desc: Text;
  /** شخصي (يحتاج بيانات الطفل) أم ثابت */
  personalized: boolean;
  /** متاح، قريباً، أو مخفي */
  status: ItemStatus;
  /** سعر الإضافة منفردة (بالدولار). null = لا تُباع منفردة */
  addonPrice: number | null;
  /** تُباع لأي أحد بدون قصة */
  standalone: boolean;
  /** كلفة تصنيعك للقطعة عند بيعها كإضافة (لحساب الربح) */
  cost: number;
  sort: number;
  /** product photo uploaded from the admin (version number), if any */
  image?: number;
}

export interface Box {
  id: BoxId;
  name: Text;
  tagline: Text;
  price: number;
  /** كلفة تجهيز الصندوق كاملاً (لحساب الربح) */
  cost: number;
  includes: ItemId[];
  popular?: boolean;
  status: 'available' | 'hidden';
  sort: number;
  image?: number;
}

export interface Catalog {
  items: Record<ItemId, Item>;
  boxes: Box[];
  /** shipping per governorate (live values from the admin settings) */
  governorates?: Governorate[];
}

export const defaultItems: Record<ItemId, Item> = {
  story: {
    id: 'story',
    cost: 0, // PLACEHOLDER
    sort: 1,
    name: { ar: 'القصة المخصّصة المطبوعة', en: 'Personalized printed story' },
    desc: { ar: 'كتاب مطبوع بطله طفلك، باسمه وملامحه وقيمته المختارة.', en: 'A printed book starring your child: their name, look and chosen value.' },
    personalized: true,
    status: 'available',
    addonPrice: null,
    standalone: false,
  },
  stickers: {
    id: 'stickers',
    cost: 0, // PLACEHOLDER
    sort: 2,
    name: { ar: 'ستيكرات بطل القصة', en: 'Story hero stickers' },
    desc: { ar: 'ورقة ستيكرات لطفلك بشكله الكرتوني من القصة.', en: "A sticker sheet of your child's cartoon self from the story." },
    personalized: true,
    status: 'available',
    addonPrice: 4,
    standalone: false,
  },
  letter: {
    id: 'letter',
    cost: 0, // PLACEHOLDER
    sort: 3,
    name: { ar: 'رسالة حبّوك السرية', en: 'Habbouk’s secret letter' },
    desc: { ar: 'مغلّف مختوم فيه رسالة من حبّوك باسم طفلك، يمنحه فيها درع الشجاعة وتاج البطولة.', en: 'A sealed envelope with a letter from Habbouk to your child by name, awarding the shield of courage and the crown of heroes.' },
    personalized: true,
    status: 'hidden', // removed from the boxes (Oct 2026)
    addonPrice: null,
    standalone: false,
  },
  cards: {
    id: 'cards',
    cost: 0, // PLACEHOLDER
    sort: 4,
    name: { ar: 'بطاقات حبكتك', en: 'Hobka Talk cards' },
    desc: { ar: 'بطاقات «ذاكرة وتراث» يسأل فيها طفلك جدّه وجدّته عن طفولتهما، وبطاقات «مهمة» فيها تحديات صغيرة ممتعة. تقرّب العائلة وتبني ثقة الطفل وحواره، ومستوحاة من العلاج السلوكي المعرفي.', en: '“Memory & heritage” cards where your child asks their grandparents about their childhood, and “Mission” cards with small fun challenges. They bring the family closer and build confidence and conversation, inspired by CBT.' },
    personalized: false,
    status: 'available',
    addonPrice: 7,
    standalone: true,
  },
  planting: {
    id: 'planting',
    cost: 0, // PLACEHOLDER
    sort: 5,
    name: { ar: 'عدّة الزراعة «حديقتي مع حبّوك»', en: '"My garden with Habbouk" planting kit' },
    desc: { ar: 'بروشور وبذور وأصيص صغير، ليزرع طفلك نبتته ويعتني بها.', en: 'A guide, seeds and a small pot so your child can grow and care for a plant.' },
    personalized: false,
    status: 'available',
    addonPrice: 8,
    standalone: true,
  },
  puzzle: {
    id: 'puzzle',
    cost: 0, // PLACEHOLDER
    sort: 6,
    name: { ar: 'بازل بصورة طفلك', en: 'Puzzle with your child’s picture' },
    desc: { ar: 'بازل مطبوع بصورة طفلك.', en: "A jigsaw puzzle printed with your child's picture." },
    personalized: true,
    status: 'available',
    addonPrice: 10,
    standalone: false,
  },
  figure3d: {
    id: 'figure3d',
    cost: 0, // PLACEHOLDER
    sort: 7,
    name: { ar: 'مجسّم حبّوك', en: 'Habbouk figure' },
    desc: { ar: 'حبّوك مطبوعاً بطابعة ثلاثية الأبعاد.', en: 'Habbouk, 3D printed.' },
    personalized: false,
    status: 'soon',
    addonPrice: null,
    standalone: false,
  },
  newspaper: {
    id: 'newspaper',
    cost: 0, // PLACEHOLDER
    sort: 8,
    name: { ar: 'جريدة نشاطات حبّوك', en: "Habbouk's activity paper" },
    desc: { ar: 'متاهات وألغاز ونشاطات ممتعة.', en: 'Mazes, riddles and fun activities.' },
    personalized: false,
    status: 'soon',
    addonPrice: null,
    standalone: false,
  },
};

export const defaultBoxes: Box[] = [
  {
    id: 'story',
    name: { ar: 'صندوق القصة', en: 'Story box' },
    tagline: { ar: 'البداية: قصة طفلك وستيكراته', en: "The start: your child's story and stickers" },
    price: 10, // story + stickers, kept at $10 or less
    cost: 0, // PLACEHOLDER
    includes: ['story', 'stickers'],
    status: 'available',
    sort: 1,
  },
  {
    id: 'hobka',
    name: { ar: 'صندوق حبكة', en: 'Hobka box' },
    tagline: { ar: 'الأكثر اختياراً: قصة ونشاطات تكمل الحكاية', en: 'Most chosen: the story plus activities that continue it' },
    price: 35, // PLACEHOLDER
    cost: 0, // PLACEHOLDER
    includes: ['story', 'stickers', 'cards', 'planting'],
    popular: true,
    status: 'available',
    sort: 2,
  },
  {
    id: 'full',
    name: { ar: 'الصندوق الكامل', en: 'Full box' },
    tagline: { ar: 'كل شيء، مع بازل بصورة طفلك', en: 'Everything, plus a puzzle with your child’s picture' },
    price: 45, // PLACEHOLDER
    cost: 0, // PLACEHOLDER
    includes: ['story', 'stickers', 'cards', 'planting', 'puzzle', 'figure3d', 'newspaper'],
    status: 'available',
    sort: 3,
  },
];

export const defaultCatalog: Catalog = { items: defaultItems, boxes: defaultBoxes };

// ─────────────────────────────── الشحن
/**
 * true: الشحن يُدفع لشركة التوصيل عند الاستلام. لا يدخل في مبلغ الطلب، ولا تظهر أسعار المحافظات للأهل،
 * وقسم «أسعار الشحن» مخفي من إعدادات الأدمن.
 * false: يرجع النظام القديم كما هو (سعر تقريبي لكل محافظة يُضاف إلى المجموع ويُعدّل من الأدمن).
 */
export const shippingOnDelivery = true;

// أسعار الشحن لكل محافظة، بالدولار (تُستخدم فقط عندما shippingOnDelivery = false)
// ⚠️ أسعار تقريبية: السعر النهائي تحدده شركة الشحن، ويمكنك تعديله لكل طلب من لوحة الإدارة.
// الترتيب: ريف دمشق الأرخص، ثم دمشق، ثم باقي المحافظات.
export interface Governorate {
  id: string;
  name: Text;
  shipping: number; // PLACEHOLDER
}

export const governorates: Governorate[] = [
  { id: 'rif-dimashq', name: { ar: 'ريف دمشق', en: 'Rif Dimashq' }, shipping: 2 },
  { id: 'damascus', name: { ar: 'دمشق', en: 'Damascus' }, shipping: 3 },
  { id: 'homs', name: { ar: 'حمص', en: 'Homs' }, shipping: 5 },
  { id: 'hama', name: { ar: 'حماة', en: 'Hama' }, shipping: 5 },
  { id: 'daraa', name: { ar: 'درعا', en: 'Daraa' }, shipping: 5 },
  { id: 'as-suwayda', name: { ar: 'السويداء', en: 'As-Suwayda' }, shipping: 5 },
  { id: 'quneitra', name: { ar: 'القنيطرة', en: 'Quneitra' }, shipping: 5 },
  { id: 'aleppo', name: { ar: 'حلب', en: 'Aleppo' }, shipping: 6 },
  { id: 'latakia', name: { ar: 'اللاذقية', en: 'Latakia' }, shipping: 6 },
  { id: 'tartus', name: { ar: 'طرطوس', en: 'Tartus' }, shipping: 6 },
  { id: 'idlib', name: { ar: 'إدلب', en: 'Idlib' }, shipping: 7 },
  { id: 'deir-ez-zor', name: { ar: 'دير الزور', en: 'Deir ez-Zor' }, shipping: 7 },
  { id: 'raqqa', name: { ar: 'الرقة', en: 'Raqqa' }, shipping: 7 },
  { id: 'hasakah', name: { ar: 'الحسكة', en: 'Al-Hasakah' }, shipping: 7 },
];

// ─────────────────────────────── القيم الجاهزة للقصة
export interface StoryValue {
  id: string;
  name: Text;
  desc: Text;
  icon: string;
  /** removed from the order form; kept so old orders still show its name */
  deleted?: boolean;
}

export const storyValues: StoryValue[] = [
  { id: 'prayer', icon: 'mosque', name: { ar: 'حبّ الصلاة', en: 'Loving prayer' }, desc: { ar: 'يكتشف أن الصلاة نور وقوة، لا واجب ثقيل.', en: 'Discovers prayer as light and strength, not a chore.' } },
  { id: 'courage', icon: 'shield', name: { ar: 'الشجاعة ومواجهة الخوف', en: 'Courage and facing fears' }, desc: { ar: 'من الظلام أو الطبيب أو المدرسة الجديدة.', en: 'Of the dark, the doctor or a new school.' } },
  { id: 'confidence', icon: 'star', name: { ar: 'الثقة بالنفس وتجاوز الخجل', en: 'Confidence and shyness' }, desc: { ar: 'يجد صوته ويؤمن بقدراته.', en: 'Finds their voice and believes in themselves.' } },
  { id: 'focus', icon: 'target', name: { ar: 'التركيز وإنهاء المهمة', en: 'Focus and finishing tasks' }, desc: { ar: 'يتعلم أن يكمل ما بدأه خطوة بخطوة.', en: 'Learns to finish what they start, step by step.' } },
  { id: 'honesty', icon: 'heart', name: { ar: 'الصدق', en: 'Honesty' }, desc: { ar: 'يكتشف أن الصدق يجعل القلب خفيفاً.', en: 'Finds that honesty makes the heart light.' } },
  { id: 'sharing', icon: 'gift', name: { ar: 'المشاركة والكرم', en: 'Sharing and generosity' }, desc: { ar: 'يتعلم فرحة العطاء مع إخوته وأصدقائه.', en: 'Learns the joy of giving with siblings and friends.' } },
  { id: 'parents', icon: 'home', name: { ar: 'برّ الوالدين واحترام الكبار', en: 'Kindness to parents and elders' }, desc: { ar: 'يقدّر تعب أهله ويعبّر عن حبه لهم.', en: 'Appreciates their parents and shows love.' } },
  { id: 'responsibility', icon: 'basket', name: { ar: 'الترتيب والمسؤولية', en: 'Tidiness and responsibility' }, desc: { ar: 'غرفته وأغراضه وواجباته الصغيرة.', en: 'Their room, belongings and small duties.' } },
  { id: 'patience', icon: 'sprout', name: { ar: 'الصبر وتهدئة الغضب', en: 'Patience and calming anger' }, desc: { ar: 'يتعلم أن يتنفس ويهدأ قبل أن يتصرف.', en: 'Learns to breathe and calm down before acting.' } },
  { id: 'sibling', icon: 'baby', name: { ar: 'استقبال أخ أو أخت جديدة', en: 'Welcoming a new sibling' }, desc: { ar: 'يصبح الأخ الكبير البطل.', en: 'Becomes the hero big sibling.' } },
  { id: 'sleep', icon: 'moon', name: { ar: 'النوم وحده بهدوء', en: 'Sleeping alone calmly' }, desc: { ar: 'غرفته مكان آمن ودافئ.', en: 'Their room is a safe, warm place.' } },
  { id: 'screens', icon: 'screen', name: { ar: 'التوازن مع الشاشات', en: 'Balance with screens' }, desc: { ar: 'يكتشف متعة اللعب والعالم خارج الشاشة.', en: 'Discovers the fun beyond the screen.' } },
  { id: 'friendship', icon: 'hands', name: { ar: 'الصداقة والتعاون', en: 'Friendship and teamwork' }, desc: { ar: 'يكوّن أصدقاء ويعرف قيمة العمل معاً.', en: 'Makes friends and values working together.' } },
  { id: 'learning', icon: 'book', name: { ar: 'حبّ القراءة والتعلّم', en: 'Loving reading and learning' }, desc: { ar: 'كل كتاب باب لمغامرة جديدة.', en: 'Every book is a door to adventure.' } },
  { id: 'food', icon: 'apple', name: { ar: 'الطعام الصحي', en: 'Healthy eating' }, desc: { ar: 'يجرب أطعمة جديدة ويحبها.', en: 'Tries new foods and enjoys them.' } },
  { id: 'gratitude', icon: 'sun', name: { ar: 'الامتنان والرضا', en: 'Gratitude' }, desc: { ar: 'يرى النعم الصغيرة من حوله.', en: 'Notices the small blessings around them.' } },
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
