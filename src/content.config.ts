import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.object({ title: z.string(), description: z.string(), date: z.coerce.date(), slug: z.string(), lang: z.enum(['ar', 'en']), readingTime: z.number(), tags: z.array(z.string()).default([]), updated: z.coerce.date().optional() }),
});
const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.object({ title: z.string(), description: z.string(), lang: z.enum(['ar', 'en']), updated: z.coerce.date() }),
});
export const collections = { blog, legal };
