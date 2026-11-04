import type { CollectionEntry } from 'astro:content';
// Newest first; articles published on the same day keep this editorial order (new slugs go first)
const ORDER = ['ramadan-eid-hours-google-maps', 'reply-to-google-reviews', 'remove-google-maps-review', 'add-branch-google-maps'];
export const sortPosts = (posts: CollectionEntry<'blog'>[]) =>
  [...posts].sort((a, b) => (+b.data.date - +a.data.date) || (ORDER.indexOf(a.data.slug) - ORDER.indexOf(b.data.slug)) || a.data.slug.localeCompare(b.data.slug));
