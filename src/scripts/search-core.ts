// Site search core shared by the header search dialog and the site assistant
// Pagefind is loaded only on first use (never on page load) and picks the index that matches <html lang>
export const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

type PFData = { url: string; excerpt: string; meta?: Record<string, string> };
type PFResult = { id: string; score: number; data(): Promise<PFData> };
type PFResponse = { results: PFResult[] } | null;
type Pagefind = {
  options(o: Record<string, unknown>): Promise<void>;
  init(): Promise<void>;
  search(q: string): Promise<PFResponse>;
  debouncedSearch(q: string, o?: Record<string, unknown>, ms?: number): Promise<PFResponse>;
};
export type Hit = { url: string; title: string; excerpt: string; section: string };

let pf: Promise<Pagefind> | null = null;
export function loadPagefind(): Promise<Pagefind> {
  if (!pf) {
    pf = (async () => {
      const mod: Pagefind = await import(/* @vite-ignore */ `${BASE}pagefind/pagefind.js`);
      await mod.options({ baseUrl: BASE, excerptLength: 22 });
      await mod.init();
      return mod;
    })();
    pf.catch(() => { pf = null; }); // allow a retry after a failed load
  }
  return pf;
}

// Section names follow the site navigation labels
const SECTIONS: Record<'ar' | 'en', Record<string, string>> = {
  ar: { '': 'الرئيسية', features: 'المزايا', industries: 'القطاعات', 'how-it-works': 'كيف يعمل', pricing: 'الباقات', blog: 'المدونة', about: 'عن صيت', security: 'الأمان والخصوصية', 'free-scan': 'الفحص المجاني', demo: 'احجز عرضًا', privacy: 'سياسة الخصوصية', terms: 'الشروط والأحكام' },
  en: { '': 'Home', features: 'Features', industries: 'Industries', 'how-it-works': 'How it works', pricing: 'Pricing', blog: 'Blog', about: 'About', security: 'Security and privacy', 'free-scan': 'Free branch scan', demo: 'Book a demo', privacy: 'Privacy Policy', terms: 'Terms of Service' },
};
export const pageLang = (): 'ar' | 'en' => (document.documentElement.lang === 'en' ? 'en' : 'ar');

/** Section label for a site path such as '/en/features/hours/' */
export function sectionOf(path: string, lang = pageLang()): string {
  let p = path.replace(/^https?:\/\/[^/]+/, '');
  if (p.startsWith(BASE)) p = p.slice(BASE.length);
  p = p.replace(/^\/+/, '').replace(/^en(\/|$)/, '');
  const seg = p.split(/[/?#]/)[0] || '';
  return SECTIONS[lang][seg] ?? SECTIONS[lang][''];
}

/** Absolute site URL for a path written without the base, e.g. '/pricing/' */
export const withBase = (path: string) => (/^(https?:|mailto:)/.test(path) ? path : BASE + path.replace(/^\/+/, ''));

/** Search the site in the page language. Returns null when a newer debounced search replaced this one */
export async function searchSite(q: string, limit = 8, debounce = 0): Promise<Hit[] | null> {
  const p = await loadPagefind();
  const res = debounce ? await p.debouncedSearch(q, {}, debounce) : await p.search(q);
  if (!res) return null;
  const data = await Promise.all(res.results.slice(0, limit).map((r) => r.data()));
  return data.map((d) => ({ url: d.url, title: (d.meta?.title || '').trim() || sectionOf(d.url), excerpt: d.excerpt, section: sectionOf(d.url) }));
}
