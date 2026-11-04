// Site settings and SEO settings edited in the CMS
//   src/data/settings.json         · إعدادات الموقع (contact email, WhatsApp, login link, CRM inbox link, socials)
//   src/data/seo/site.json         · إعدادات SEO العامة (site name, default social image, X handle, Organization)
//   src/data/seo/pages/{ar,en}.json · SEO for the pages that have no content file of their own
import { z } from 'astro/zod';
import settings from './settings.json';
import seoSite from './seo/site.json';
import pagesAr from './seo/pages/ar.json';
import pagesEn from './seo/pages/en.json';
import { text, mediaPath, optionalMedia, parse } from './schema';

// The CMS leaves empty optional fields out of the file, so every optional value defaults to ''
const url = z.union([z.string().url().startsWith('https://'), z.literal('')]).default('');
const Settings = z.object({
  email: z.string().email(),
  whatsapp: z.string().regex(/^\d*$/, 'digits only, e.g. 9665XXXXXXXX').default(''),
  loginUrl: url,
  crmInboxUrl: url,
  city: z.object({ ar: text, en: text }),
  social: z.object({ x: url, facebook: url, instagram: url, linkedin: url, tiktok: url, snapchat: url, youtube: url }).partial().default({}),
});
export const SETTINGS = parse(Settings, settings, 'src/data/settings.json');

const SeoSite = z.object({
  siteName: z.object({ ar: text, en: text }),
  defaultImage: mediaPath,
  xHandle: z.string().regex(/^[A-Za-z0-9_]{0,15}$/, 'the X username without @').default(''),
  organization: z.object({
    name: text, alternateName: z.string().default(''), logo: mediaPath,
    locality: text, country: z.string().length(2), areaServed: z.string().default(''), languages: z.array(z.string()).default([]),
  }),
});
export const SEO_SITE = parse(SeoSite, seoSite, 'src/data/seo/site.json');

/** Routes whose SEO lives in src/data/seo/pages/*.json, keyed by the field name the CMS uses */
export const SEO_PAGE_ROUTES = {
  about: 'about/', features: 'features/', industries: 'industries/', howItWorks: 'how-it-works/', pricing: 'pricing/',
  security: 'security/', freeScan: 'free-scan/', demo: 'demo/', demoThanks: 'demo/thanks/', blog: 'blog/',
} as const;
const PageSeo = z.object({ title: text, description: text, image: optionalMedia, noindex: z.boolean().optional() });
const Pages = z.object(Object.fromEntries(Object.keys(SEO_PAGE_ROUTES).map((k) => [k, PageSeo])) as Record<keyof typeof SEO_PAGE_ROUTES, typeof PageSeo>);
const PAGES = {
  ar: parse(Pages, pagesAr, 'src/data/seo/pages/ar.json'),
  en: parse(Pages, pagesEn, 'src/data/seo/pages/en.json'),
};
const byPath = Object.fromEntries(Object.entries(SEO_PAGE_ROUTES).map(([k, p]) => [p, k as keyof typeof SEO_PAGE_ROUTES]));

/** SEO fields saved for a route (path without language prefix, e.g. 'pricing/'), or undefined */
export function pageSeo(lang: 'ar' | 'en', path: string): z.infer<typeof PageSeo> | undefined {
  const key = byPath[path];
  return key ? PAGES[lang][key] : undefined;
}
