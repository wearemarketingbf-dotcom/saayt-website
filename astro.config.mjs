import fs from 'node:fs';
import remarkBase from './src/remark-base.mjs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE and BASE come from the deploy workflow; defaults keep the custom domain build
const SITE = process.env.SITE_URL || 'https://saayt.app';
const BASE = process.env.BASE_PATH || '/';

// Pages built with <meta name="robots" content="noindex"> (thanks page, a page an editor hides in the SAAYT CMS) stay out of the sitemap
const OUT = new URL('./dist/', import.meta.url);
const noindex = (page) => {
  const path = new URL(page).pathname.slice(BASE.replace(/\/$/, '').length).replace(/^\//, '');
  try { return /<meta name="robots" content="noindex/.test(fs.readFileSync(new URL(path + 'index.html', OUT), 'utf8')); } catch { return false; }
};

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  markdown: { remarkPlugins: [remarkBase] },
  integrations: [sitemap({
    filter: (page) => !page.includes('/thanks/') && !noindex(page),
    i18n: { defaultLocale: 'ar', locales: { ar: 'ar-SA', en: 'en' } },
    // x-default points to the Arabic page, like the hreflang links in each page head
    serialize: (item) => {
      const ar = item.links?.find((l) => l.lang === 'ar-SA');
      // the ar and en items share one links array, so build a new one instead of pushing twice
      if (ar) item.links = [...item.links.filter((l) => l.lang !== 'x-default'), { lang: 'x-default', url: ar.url }];
      return item;
    },
  })],
  i18n: { defaultLocale: 'ar', locales: ['ar', 'en'], routing: { prefixDefaultLocale: false } },
});
