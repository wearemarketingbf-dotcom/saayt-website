// Feature pages copy lives in src/data/features/{ar,en}/{slug}.json (edited in the CMS: المزايا)
// House style: no full stop at line ends, no commas in headlines and buttons
import { z } from 'astro/zod';
import { text, icon, item, faqItem, seoFields, bySlug, FEATURE_SLUGS } from './schema';

export type FeatureSlug = (typeof FEATURE_SLUGS)[number];

const Feature = z.object({
  nav: item,                       // short name and one line, used in the menu, footer and feature cards
  seo: seoFields,
  eyebrow: text, h1: text, lead: text,
  why: z.object({ h2: text, items: z.array(item).min(1) }),
  caps: z.object({ h2: text, items: z.array(item.extend({ icon })).min(1) }),
  flow: z.object({ h2: text, steps: z.array(item).min(1) }),
  guard: item,
  faq: z.array(faqItem),
});
export type FeatureContent = z.infer<typeof Feature>;
export type FeaturePage = Omit<FeatureContent, 'nav'>;

const files = import.meta.glob('./features/*/*.json', { eager: true });
export const FEATURE_CONTENT = bySlug(files, 'features', FEATURE_SLUGS, Feature);
export const FEATURE_PAGES: Record<'ar' | 'en', Record<FeatureSlug, FeaturePage>> = FEATURE_CONTENT;
