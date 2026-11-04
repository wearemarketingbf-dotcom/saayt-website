// Free self-check questions live in src/data/scan/ar.json and en.json (edited in the CMS: الفحص المجاني)
// Weights are shown on the page. Answers stay in the browser
import { z } from 'astro/zod';
import ar from './scan/ar.json';
import en from './scan/en.json';
import { text, parse, FEATURE_SLUGS } from './schema';

const AREAS = ['hours', 'details', 'photos', 'reviews'] as const;
const Q = z.object({ id: text, area: z.enum(AREAS), w: z.number().positive(), q: text, fix: text, feat: z.enum(FEATURE_SLUGS) });
const Pack = z.object({ areas: z.object({ hours: text, details: text, photos: text, reviews: text }), qs: z.array(Q).min(1) });
export type ScanQ = z.infer<typeof Q>;

export const SCAN: Record<'ar' | 'en', z.infer<typeof Pack>> = {
  ar: parse(Pack, ar, 'src/data/scan/ar.json'),
  en: parse(Pack, en, 'src/data/scan/en.json'),
};
// Both languages must ask the same questions in the same order with the same weights
if (SCAN.ar.qs.map((q) => `${q.id}:${q.w}`).join() !== SCAN.en.qs.map((q) => `${q.id}:${q.w}`).join()) {
  throw new Error('Content files src/data/scan/ar.json and en.json must list the same question ids and weights in the same order');
}
