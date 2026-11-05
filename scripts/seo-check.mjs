#!/usr/bin/env node
// SEO check for the built site (dist/). Runs at the end of `npm run build` and fails the build on:
//   · a missing title or description, a title over 60 or a description over 160 characters (Arabic included)
//   · two pages with the same title
//   · an <img> without alt (images inside article and legal text need a real description)
//   · an internal link, image or video that points to a file that does not exist
//   · a page without its language pair (canonical, ar-SA, en and x-default links that exist and point back)
//   · broken or missing structured data (Organization and WebSite everywhere, BreadcrumbList on inner pages,
//     BlogPosting on articles, no ratings or reviews)
//   · an assistant FAQ link (src/data/faq.*.json) to a page that does not exist or is in the other language
// Characters are counted as Unicode code points, the same way the SAAYT CMS counter counts them
// Usage: node scripts/seo-check.mjs [distDir]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.argv[2] || path.join(ROOT, 'dist'));
const BASE = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');   // '/' on saayt.app, '/repo/' on the github.io preview
const MAX_TITLE = 60, MAX_DESC = 160;
const SKIP_DIRS = new Set(['_astro', 'pagefind']);                  // assets and the search index
const SKIP_PAGES = new Set(['404.html']);                           // bilingual noindex error page

const problems = [];
const add = (page, msg) => problems.push({ page, msg });
const len = (s) => [...s].length;
const dec = (s = '') => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const attrs = (tag) => { const a = {}; for (const m of tag.matchAll(/([^\s=<>"'/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) a[m[1].toLowerCase()] = dec(m[2] ?? m[3] ?? m[4] ?? ''); return a; };
const short = (s, n = 70) => (len(s) > n ? [...s].slice(0, n).join('') + '…' : s);

if (!fs.existsSync(DIST)) { console.error(`SEO check: ${DIST} not found, run astro build first`); process.exit(1); }
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) return d === DIST && SKIP_DIRS.has(e.name) ? [] : walk(p);
  return e.name.endsWith('.html') ? [p] : [];
});
const files = walk(DIST).filter((f) => !SKIP_PAGES.has(path.relative(DIST, f)));
// URL path of a built file, without the base: 'pricing/index.html' → '/pricing/'
const urlOf = (f) => '/' + path.relative(DIST, f).replace(/\\/g, '/').replace(/index\.html$/, '');

// Does an internal URL path (base included) point to something in dist?
const exists = (href) => {
  let p = href.split('#')[0].split('?')[0];
  if (!p.startsWith(BASE)) return false;
  p = decodeURIComponent(p.slice(BASE.length));
  const full = path.join(DIST, p);
  if (p === '' || p.endsWith('/')) return fs.existsSync(path.join(full, 'index.html'));
  return fs.existsSync(full) && fs.statSync(full).isFile() || fs.existsSync(path.join(full, 'index.html'));
};

let site = '';
const pages = new Map(); // url → info
for (const f of files) {
  const url = urlOf(f);
  const html = fs.readFileSync(f, 'utf8');
  const head = (html.match(/<head[^>]*>([\s\S]*?)<\/head>/i) || [, ''])[1];
  const lds = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  // scan tags with scripts and styles removed, so markup inside JS strings is not mistaken for links
  const body = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const title = dec((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ''])[1]).trim();
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const description = (metas.find((m) => m.name === 'description')?.content || '').trim();
  const noindex = metas.some((m) => m.name === 'robots' && /noindex/.test(m.content || ''));
  const canonical = links.find((l) => l.rel === 'canonical')?.href || '';
  const alt = Object.fromEntries(links.filter((l) => l.rel === 'alternate' && l.hreflang).map((l) => [l.hreflang, l.href]));
  const lang = (html.match(/<html[^>]*\blang="([^"]+)"/i) || [, ''])[1];
  if (!site && canonical) site = new URL(canonical).origin;
  pages.set(url, { f, url, html, body, title, description, noindex, canonical, alt, lang, lds, metas });
}

const toPath = (abs) => { try { const u = new URL(abs, site || 'https://example.invalid'); return u.origin === site ? u.pathname : null; } catch { return null; } };
const titles = new Map();
let imgCount = 0, linkCount = 0;

for (const p of pages.values()) {
  const { url } = p;
  // titles and descriptions
  if (!p.title) add(url, 'missing <title>');
  else if (len(p.title) > MAX_TITLE) add(url, `title is ${len(p.title)} characters (max ${MAX_TITLE}): "${p.title}"`);
  if (!p.description) add(url, 'missing meta description');
  else if (len(p.description) > MAX_DESC) add(url, `description is ${len(p.description)} characters (max ${MAX_DESC}): "${short(p.description)}"`);
  if (p.title) titles.set(p.title, [...(titles.get(p.title) || []), url]);

  // images: every <img> needs alt, images inside article or legal text need a real description
  const proseRanges = [...p.body.matchAll(/<(article|div)\b[^>]*class="[^"]*\bprose\b[^"]*"[^>]*>/gi)].map((m) => m.index);
  for (const m of p.body.matchAll(/<img\b[^>]*>/gi)) {
    imgCount++;
    const a = attrs(m[0]);
    if (!('alt' in a)) add(url, `image without alt: ${a.src || m[0].slice(0, 80)}`);
    else if (!a.alt.trim() && proseRanges.some((i) => i < m.index && p.body.lastIndexOf('</article>', m.index) < i)) add(url, `image in the article text has an empty alt: ${a.src}`);
  }

  // internal links and media
  const check = (href, what) => {
    if (!href || /^(mailto:|tel:|javascript:|data:|#)/i.test(href)) return;
    const pth = href.startsWith('/') && !href.startsWith('//') ? href : toPath(href);
    if (pth === null || pth === undefined) return; // another site
    linkCount++;
    if (pth.startsWith(BASE + 'pagefind/')) return; // the search index is written after this check reads links
    if (!exists(pth)) add(url, `${what} points to a page or file that does not exist: ${href}`);
  };
  for (const m of p.body.matchAll(/<a\b[^>]*>/gi)) check(attrs(m[0]).href, 'link');
  for (const m of p.body.matchAll(/<(img|source|video)\b[^>]*>/gi)) { const a = attrs(m[0]); check(a.src, m[1].toLowerCase()); check(a.poster, 'video poster'); for (const x of (a['data-sm'] ? [a['data-sm'], a['data-lg']] : [])) check(x, 'video'); }
  for (const m of p.metas.filter((m) => /^(og:image|twitter:image)$/.test(m.property || m.name || ''))) check(m.content, m.property || m.name);

  // language pair
  const self = BASE.replace(/\/$/, '') + url;
  if (!p.canonical) add(url, 'missing canonical link');
  else if (toPath(p.canonical) !== self) add(url, `canonical points elsewhere: ${p.canonical}`);
  for (const hl of ['ar-SA', 'en', 'x-default']) if (!p.alt[hl]) add(url, `missing hreflang="${hl}" link`);
  if (p.alt['ar-SA'] && p.alt['x-default'] && p.alt['ar-SA'] !== p.alt['x-default']) add(url, 'x-default should point to the Arabic page');
  const mine = p.lang === 'en' ? 'en' : 'ar-SA', theirs = p.lang === 'en' ? 'ar-SA' : 'en';
  if (p.alt[mine] && toPath(p.alt[mine]) !== self) add(url, `hreflang="${mine}" should point to the page itself, not ${p.alt[mine]}`);
  if (p.alt[theirs]) {
    const other = pages.get('/' + (toPath(p.alt[theirs]) || '').slice(BASE.length));
    if (!other) add(url, `language pair missing: ${p.alt[theirs]} was not built`);
    else if (toPath(other.alt[mine] || '') !== self) add(url, `language pair does not point back: ${other.url} lists ${other.alt[mine] || 'nothing'} for ${mine}`);
  }

  // structured data
  const types = [];
  for (const raw of p.lds) {
    let data; try { data = JSON.parse(raw); } catch { add(url, 'structured data (JSON-LD) is not valid JSON'); continue; }
    const visit = (o) => { if (Array.isArray(o)) return o.forEach(visit); if (o && typeof o === 'object') { if (o['@type']) types.push(o['@type']); for (const [k, v] of Object.entries(o)) { if (k === 'aggregateRating' || k === 'review') add(url, `structured data has "${k}" (no ratings or reviews unless they are real and shown on the page)`); visit(v); } } };
    visit(data);
  }
  const home = url === '/' || url === '/en/';
  for (const t of ['Organization', 'WebSite']) if (!types.includes(t)) add(url, `structured data is missing ${t}`);
  if (!home && !p.noindex && !types.includes('BreadcrumbList')) add(url, 'structured data is missing BreadcrumbList');
  if (/^\/(en\/)?blog\/[^/]+\/$/.test(url) && !types.includes('BlogPosting')) add(url, 'article is missing BlogPosting structured data');
}

for (const [t, urls] of titles) if (urls.length > 1) add(urls.join(' and '), `same title on ${urls.length} pages: "${t}"`);

// assistant FAQ links (used by the site assistant in the browser, so no page links to them in HTML)
const faqDir = path.join(ROOT, 'src/data');
for (const lang of ['ar', 'en']) {
  const f = path.join(faqDir, `faq.${lang}.json`);
  if (!fs.existsSync(f)) continue;
  let items; try { items = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { add(`src/data/faq.${lang}.json`, 'is not valid JSON'); continue; }
  items.forEach((it, i) => {
    if (!it.link) return;
    const where = `src/data/faq.${lang}.json #${i + 1}`;
    if (!it.link.startsWith('/')) return add(where, `link should start with /: ${it.link}`);
    const enLink = it.link.startsWith('/en/');
    if (lang === 'en' && !enLink) add(where, `English answer links to an Arabic page: ${it.link}`);
    if (lang === 'ar' && enLink) add(where, `Arabic answer links to an English page: ${it.link}`);
    if (!exists(BASE.replace(/\/$/, '') + it.link)) add(where, `link points to a page that does not exist: ${it.link}`);
  });
}

// report
const n = pages.size;
console.log(`\nSEO check · ${n} pages · ${imgCount} images · ${linkCount} internal links and files`);
if (!problems.length) {
  console.log('  ✓ every page has a title (60 or less) and a description (160 or less), no duplicate titles');
  console.log('  ✓ every image has alt text, every internal link and file exists');
  console.log('  ✓ every page has its canonical and its ar ↔ en pair with x-default to Arabic');
  console.log('  ✓ structured data: Organization and WebSite everywhere, breadcrumbs on inner pages, BlogPosting on articles\n');
  process.exit(0);
}
console.log(`  ✗ ${problems.length} problem${problems.length > 1 ? 's' : ''} to fix before this can deploy:\n`);
// the same problem on many pages (a link in the footer, say) is listed once with a page count
const byMsg = new Map();
for (const { page, msg } of problems) byMsg.set(msg, [...new Set([...(byMsg.get(msg) || []), page])]);
const byPage = new Map();
for (const [msg, ps] of byMsg) {
  if (ps.length > 3) { console.log(`  ${msg}\n    · on ${ps.length} pages, e.g. ${ps.slice(0, 3).join(', ')}`); continue; }
  for (const page of ps) byPage.set(page, [...(byPage.get(page) || []), msg]);
}
for (const [page, msgs] of byPage) { console.log(`  ${page}`); for (const m of msgs) console.log(`    · ${m}`); }
console.log('\n  Titles and descriptions are edited in the SAAYT CMS: SEO الصفحات, or the SEO group of the page or article\n');
// in GitHub Actions each problem is also an annotation, which the SAAYT CMS can read from the run (check run annotations)
if (process.env.GITHUB_ACTIONS === 'true') {
  const esc = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  for (const [msg, ps] of byMsg) console.log(`::error title=SEO check::${esc(`${ps.length > 3 ? `${ps.length} pages, e.g. ${ps.slice(0, 3).join(', ')}` : ps.join(', ')}: ${msg}`)}`);
}
process.exit(1);
