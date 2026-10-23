import remarkBase from './src/remark-base.mjs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE and BASE come from the deploy workflow; defaults keep the custom domain build
const SITE = process.env.SITE_URL || 'https://saayt.app';
const BASE = process.env.BASE_PATH || '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  markdown: { remarkPlugins: [remarkBase] },
  integrations: [sitemap({
    filter: (page) => !page.includes('/thanks/'),
    i18n: { defaultLocale: 'ar', locales: { ar: 'ar-SA', en: 'en' } },
  })],
  i18n: { defaultLocale: 'ar', locales: ['ar', 'en'], routing: { prefixDefaultLocale: false } },
});
