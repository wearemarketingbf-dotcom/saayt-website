// Homepage copy lives in src/data/home/ar.json and en.json (edited in the CMS: الرئيسية)
// House style: no full stop at line ends, no commas in headlines and buttons,
// question marks only on real questions, Western digits, light Saudi dialect in headlines and CTAs
import { z } from 'astro/zod';
import ar from './home/ar.json';
import en from './home/en.json';
import { text, icon, item, faqItem, seoFields, mediaPath, parse } from './schema';

const featureRow = z.object({ t: text, h: text, d: text, bullets: z.array(text).min(1) });
const section = { eyebrow: text, h2: text };

const Home = z.object({
  seo: seoFields,
  hero: z.object({
    eyebrow: text, h1a: text, h1b: text, sub: text, cta1: text, cta2: text, note: text,
    media: z.object({ poster: mediaPath, videoSm: mediaPath, video: mediaPath }),
  }),
  heroCard: z.object({
    label: text, today: text, branch: text, time: text, review: text, suggested: text, reply: text,
    approve: text, edit: text, waiting: text, approved: text,
    rows: z.array(z.object({ b: text, s: text, tone: z.enum(['accent', 'ok']) })),
  }),
  trust: z.array(text).min(1),
  problem: z.object({ ...section, lead: text, before: text, beforeCap: text, after: text, afterCap: text, pains: z.array(item).min(1) }),
  concept: z.object({ ...section, lead: text, points: z.array(item).min(1) }),
  how: z.object({ ...section, steps: z.array(item).min(1), more: text }),
  features: z.object({ ...section, hours: featureRow, reviews: featureRow, alerts: featureRow, details: featureRow, cta: text }),
  film: z.object({ ...section, play: text, caption: text, media: z.object({ poster: mediaPath, video: mediaPath }) }),
  industries: z.object({ ...section, lead: text, all: text }),
  scan: z.object({ ...section, lead: text, cta: text }),
  principles: z.object({ ...section, items: z.array(item.extend({ icon })).min(1) }),
  faq: z.object({ ...section, items: z.array(faqItem).min(1) }),
  final: z.object({ h2: text, lead: text, cta1: text, cta2: text }),
});
export type HomeContent = z.infer<typeof Home>;

export const HOME: Record<'ar' | 'en', HomeContent> = {
  ar: parse(Home, ar, 'src/data/home/ar.json'),
  en: parse(Home, en, 'src/data/home/en.json'),
};
