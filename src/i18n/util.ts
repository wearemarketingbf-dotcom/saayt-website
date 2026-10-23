export type Lang = 'ar' | 'en';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Build an internal URL for a language. `path` has no language prefix, e.g. 'features/hours/' */
export function url(lang: Lang, path = ''): string {
  const clean = path.replace(/^\//, '');
  const prefix = lang === 'en' ? '/en/' : '/';
  return `${BASE}${prefix}${clean}`;
}

/** Path to a file in /public */
export function asset(path: string): string {
  return `${BASE}/${path.replace(/^\//, '')}`;
}

export const dir = (lang: Lang) => (lang === 'ar' ? 'rtl' : 'ltr');
export const other = (lang: Lang): Lang => (lang === 'ar' ? 'en' : 'ar');

export const SITE_NAME = { ar: 'صيت', en: 'SAAYT' };
export const CONTACT = {
  email: 'hello@saayt.app',
  domain: 'saayt.app',
  city: { ar: 'الرياض، المملكة العربية السعودية', en: 'Riyadh, Saudi Arabia' },
};

/** BreadcrumbList JSON-LD */
export function crumbsLd(lang: Lang, site: string, trail: { name: string; path: string }[]) {
  const home = { name: lang === 'ar' ? 'الرئيسية' : 'Home', path: '' };
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [home, ...trail].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: site.replace(/\/$/, '') + url(lang, c.path) })),
  };
}
export const faqLd = (items: readonly { q: string; a: string }[]) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) });
