// Shared shapes for the JSON content files the SAAYT CMS edits (src/data/**/*.json)
// The CMS stores them in GoHighLevel and scripts/fetch-content.mjs writes them here before each build
// Every loader parses its files with these schemas so a broken edit stops the build with a clear message
import { z } from 'astro/zod';

export const LANGS = ['ar', 'en'] as const;
export const FEATURE_SLUGS = ['hours', 'reviews', 'alerts', 'photos-details', 'branch-score'] as const;
export const INDUSTRY_SLUGS = ['clinics', 'salons', 'auto-service', 'optics', 'perfume', 'gold-jewelry'] as const;
/** Icons drawn by src/components/Icon.astro */
export const ICONS = ['clock', 'reply', 'bell', 'pin', 'chart', 'check', 'arrow', 'chev', 'plus', 'menu', 'x', 'shield', 'user', 'globe', 'moon', 'photo', 'phone', 'whatsapp', 'mail', 'spark', 'layers', 'team', 'lock', 'calendar', 'store', 'search', 'star'] as const;

export const text = z.string().min(1, 'is empty');
export const icon = z.enum(ICONS);
/** A file in /public (e.g. /media/photo.webp or /img/og/clinics.jpg) or a full https URL */
export const mediaPath = z.string().regex(/^(\/[^\s]+|https:\/\/[^\s]+)$/, 'must start with / (a file in public) or https://');
export const optionalMedia = z.union([mediaPath, z.literal('')]).optional();
export const item = z.object({ t: text, d: text });
export const faqItem = z.object({ q: text, a: text });

/** Per-page SEO fields. Empty optional fields fall back to the site defaults */
export const seoFields = z.object({
  title: text,
  description: text,
  image: optionalMedia,
  noindex: z.boolean().optional(),
});
export type SeoFields = z.infer<typeof seoFields>;

/** Parse one content file and throw a short readable error that names the file and the field */
export function parse<T extends z.ZodTypeAny>(schema: T, data: unknown, file: string): z.infer<T> {
  const r = schema.safeParse(data);
  if (r.success) return r.data;
  const lines = r.error.issues.map((i) => `  · ${i.path.join('.') || '(file)'}: ${i.message}`);
  throw new Error(`Content file ${file} is not valid:\n${lines.join('\n')}`);
}

/** Load one JSON file per language and per slug from an import.meta.glob result, e.g. ./features/ar/hours.json */
export function bySlug<T extends z.ZodTypeAny, S extends string>(
  files: Record<string, unknown>, dir: string, slugs: readonly S[], schema: T,
): Record<(typeof LANGS)[number], Record<S, z.infer<T>>> {
  const out = { ar: {}, en: {} } as Record<(typeof LANGS)[number], Record<S, z.infer<T>>>;
  for (const lang of LANGS) {
    for (const slug of slugs) {
      const key = `./${dir}/${lang}/${slug}.json`;
      if (!(key in files)) throw new Error(`Content file src/data/${dir}/${lang}/${slug}.json is missing`);
      const mod = files[key] as { default?: unknown };
      out[lang][slug] = parse(schema, mod.default ?? mod, `src/data/${dir}/${lang}/${slug}.json`);
    }
  }
  return out;
}
