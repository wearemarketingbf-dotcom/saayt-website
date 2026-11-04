import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
// Both collections are edited in the CMS (/admin/): one file per language in ar/ and en/ with the same file name
// Optional SEO overrides: empty fields fall back to the title, the description and the site's default social image
const seo = z.object({ title: z.string().optional(), description: z.string().optional(), image: z.string().optional(), noindex: z.boolean().optional() }).optional();
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.object({
    title: z.string().min(1), description: z.string().min(1), date: z.coerce.date(), updated: z.coerce.date().optional(),
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'lowercase English letters, digits and hyphens'), lang: z.enum(['ar', 'en']),
    readingTime: z.number(), tags: z.array(z.string()).default([]),
    cover: z.string().regex(/^(\/|https:\/\/)/, 'must start with / or https://'), coverAlt: z.string().min(1, 'describe the cover image'),
    seo,
  }),
});
const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.object({ title: z.string(), description: z.string(), lang: z.enum(['ar', 'en']), updated: z.coerce.date(), seo }),
});
export const collections = { blog, legal };
