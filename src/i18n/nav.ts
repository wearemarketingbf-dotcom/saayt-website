import type { Lang } from './util';

export const FEATURES = [
  { slug: 'hours', icon: 'clock', ar: { t: 'المواعيد والمواسم', d: 'رمضان والعيد والإجازات لكل الفروع بتعديل واحد' }, en: { t: 'Hours and seasons', d: 'Ramadan, Eid and holidays for every branch in one edit' } },
  { slug: 'reviews', icon: 'reply', ar: { t: 'الردود على التقييمات', d: 'رد مقترح بلهجة عميلك وأنت اللي تعتمد' }, en: { t: 'Review replies', d: 'A suggested reply in your customer’s dialect that you approve' } },
  { slug: 'alerts', icon: 'bell', ar: { t: 'تنبيهات الفروع', d: 'تعرف الفرع اللي يحتاجك قبل ما تكبر المشكلة' }, en: { t: 'Branch alerts', d: 'Know which branch needs you before it grows' } },
  { slug: 'photos-details', icon: 'pin', ar: { t: 'بيانات الفروع والصور', d: 'الرقم والعنوان والصور صحيحة في كل فرع' }, en: { t: 'Branch details and photos', d: 'Phone, address and photos right in every branch' } },
  { slug: 'branch-score', icon: 'chart', ar: { t: 'مؤشر الفرع', d: 'درجة واضحة لكل فرع تعرف منها مين يحتاج دعم' }, en: { t: 'Branch score', d: 'One clear score per branch so you know who needs support' } },
] as const;

export const INDUSTRIES = [
  { slug: 'clinics', ar: 'العيادات والمجمعات الطبية', en: 'Clinics and medical groups', img: 'img/ind-clinics.webp' },
  { slug: 'salons', ar: 'الصالونات والسبا', en: 'Salons and spas', img: 'img/ind-salons.webp' },
  { slug: 'auto-service', ar: 'مراكز خدمة السيارات', en: 'Auto service centres', img: 'img/ind-auto.webp' },
  { slug: 'optics', ar: 'محلات البصريات', en: 'Optical stores', img: 'img/ind-optics.webp' },
  { slug: 'perfume', ar: 'العطور والعود', en: 'Perfume and oud', img: 'img/ind-perfume.webp' },
  { slug: 'gold-jewelry', ar: 'الذهب والمجوهرات', en: 'Gold and jewellery', img: 'img/ind-gold.webp' },
] as const;

export const NAV = (lang: Lang) => lang === 'ar'
  ? { features: 'المزايا', industries: 'القطاعات', how: 'كيف يعمل', pricing: 'الباقات', blog: 'المدونة', about: 'عن صيت', security: 'الأمان والخصوصية', login: 'تسجيل الدخول', demo: 'احجز عرضًا', scan: 'افحص فروعك مجانًا', allFeatures: 'كل المزايا', allIndustries: 'كل القطاعات', menu: 'القائمة', close: 'إغلاق', switch: 'English', whatsapp: 'واتساب' }
  : { features: 'Features', industries: 'Industries', how: 'How it works', pricing: 'Pricing', blog: 'Blog', about: 'About', security: 'Security and privacy', login: 'Log in', demo: 'Book a demo', scan: 'Free branch scan', allFeatures: 'All features', allIndustries: 'All industries', menu: 'Menu', close: 'Close', switch: 'العربية', whatsapp: 'WhatsApp' };
