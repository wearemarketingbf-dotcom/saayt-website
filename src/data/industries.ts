// Industry pages copy lives in src/data/industries/{ar,en}/{slug}.json (edited in the CMS: القطاعات)
// Review examples are illustrative and clearly labelled as examples on the page
import { z } from 'astro/zod';
import { text, item, faqItem, seoFields, mediaPath, bySlug, FEATURE_SLUGS, INDUSTRY_SLUGS } from './schema';

export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

const Industry = z.object({
  name: text,                      // used in the menu, footer, cards and breadcrumbs
  img: mediaPath,                  // card and hero photo (decorative: the name is written beside it)
  seo: seoFields,
  h1: text, lead: text,
  pains: z.array(item).min(1),
  helps: z.array(z.object({ slug: z.enum(FEATURE_SLUGS), d: text })).min(1),
  example: z.object({ branch: text, stars: z.number().int().min(1).max(5), review: text, reply: text, note: text }),
  seasons: z.array(text),
  faq: z.array(faqItem),
});
export type IndustryContent = z.infer<typeof Industry>;
export type IndustryPage = Omit<IndustryContent, 'name' | 'img'>;

const files = import.meta.glob('./industries/*/*.json', { eager: true });
export const INDUSTRY_CONTENT = bySlug(files, 'industries', INDUSTRY_SLUGS, Industry);
export const INDUSTRY_PAGES: Record<'ar' | 'en', Record<IndustrySlug, IndustryPage>> = INDUSTRY_CONTENT;
