import type { Lang } from './util';
import { FEATURE_CONTENT } from '../data/features';
import { INDUSTRY_CONTENT } from '../data/industries';

// Order and icons stay in code; names, lines and photos come from the CMS files in src/data/features and src/data/industries
const FEATURE_ICONS = { hours: 'clock', reviews: 'reply', alerts: 'bell', 'photos-details': 'pin', 'branch-score': 'chart' } as const;
const INDUSTRY_ORDER = ['clinics', 'salons', 'auto-service', 'optics', 'perfume', 'gold-jewelry'] as const;

export const FEATURES = (Object.keys(FEATURE_ICONS) as (keyof typeof FEATURE_ICONS)[]).map((slug) => ({
  slug, icon: FEATURE_ICONS[slug], ar: FEATURE_CONTENT.ar[slug].nav, en: FEATURE_CONTENT.en[slug].nav,
}));

export const INDUSTRIES = INDUSTRY_ORDER.map((slug) => ({
  slug, ar: INDUSTRY_CONTENT.ar[slug].name, en: INDUSTRY_CONTENT.en[slug].name, img: INDUSTRY_CONTENT.ar[slug].img,
}));

export const NAV = (lang: Lang) => lang === 'ar'
  ? { features: 'المزايا', industries: 'القطاعات', how: 'كيف يعمل', pricing: 'الباقات', blog: 'المدونة', about: 'عن صيت', security: 'الأمان والخصوصية', login: 'تسجيل الدخول', demo: 'احجز عرضًا', scan: 'افحص فروعك مجانًا', allFeatures: 'كل المزايا', allIndustries: 'كل القطاعات', menu: 'القائمة', close: 'إغلاق', switch: 'English', whatsapp: 'واتساب' }
  : { features: 'Features', industries: 'Industries', how: 'How it works', pricing: 'Pricing', blog: 'Blog', about: 'About', security: 'Security and privacy', login: 'Log in', demo: 'Book a demo', scan: 'Free branch scan', allFeatures: 'All features', allIndustries: 'All industries', menu: 'Menu', close: 'Close', switch: 'العربية', whatsapp: 'WhatsApp' };
