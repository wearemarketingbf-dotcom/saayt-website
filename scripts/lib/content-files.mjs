// Where each content record lives in this repo and how its file is written
// Shared by scripts/fetch-content.mjs (records → files) and scripts/lib/ghl-fake.mjs (files → fake records)
import fs from 'node:fs';
import path from 'node:path';

export const SITE_OBJECT = 'custom_objects.saayt_site_content';
export const DOCS_OBJECT = 'custom_objects.saayt_documents';
export const DOC_TYPES = ['blog', 'legal'];
export const LOCALES = ['ar', 'en'];
export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Files that hold both languages inside (locale `all`) */
const BOTH = ['settings', 'seo/site'];
/** One file per language: src/data/{key}/{locale}.json */
const PER_LANG_DIR = ['home', 'scan', 'seo/pages'];

/** Feature and industry slugs, read from src/data/schema.ts so the list has one home */
export function readSlugs(root) {
  const src = fs.readFileSync(path.join(root, 'src/data/schema.ts'), 'utf8');
  const list = (name) => {
    const m = src.match(new RegExp(`export const ${name} = \\[([^\\]]*)\\]`));
    if (!m) throw new Error(`src/data/schema.ts: ${name} not found`);
    return [...m[1].matchAll(/'([^']+)'|"([^"]+)"/g)].map((x) => x[1] ?? x[2]);
  };
  return { features: list('FEATURE_SLUGS'), industries: list('INDUSTRY_SLUGS') };
}

/**
 * The repo file for a site content record, e.g. ('features/hours', 'ar') → 'src/data/features/ar/hours.json'
 * Returns { file } or { error } when the key or the locale does not fit a file the website reads
 */
export function siteContentFile(key, locale, slugs) {
  if (BOTH.includes(key)) return locale === 'all' ? { file: `src/data/${key}.json` } : { error: `must be "all" for ${key} (one file holds both languages)`, field: 'locale' };
  const known = key === 'faq' || PER_LANG_DIR.includes(key) || /^(features|industries)\/[a-z0-9-]+$/.test(key);
  if (!known) return { error: `"${key}" is not a content file of the website`, field: 'content_key' };
  const [dir, slug] = key.split('/');
  if ((dir === 'features' || dir === 'industries') && !slugs[dir].includes(slug)) return { error: `"${key}": ${slug} is not one of the ${dir} in src/data/schema.ts (${slugs[dir].join(', ')})`, field: 'content_key' };
  if (!LOCALES.includes(locale)) return { error: `must be ar or en for ${key}, not "${locale}"`, field: 'locale' };
  if (key === 'faq') return { file: `src/data/faq.${locale}.json` };
  if (PER_LANG_DIR.includes(key)) return { file: `src/data/${key}/${locale}.json` };
  return { file: `src/data/${dir}/${locale}/${slug}.json` };
}

/** Every site content file the website expects, as { key, locale, file } */
export function expectedSiteContent(slugs) {
  const out = BOTH.map((key) => ({ key, locale: 'all' }));
  for (const locale of LOCALES) {
    for (const key of ['faq', ...PER_LANG_DIR, ...slugs.features.map((s) => `features/${s}`), ...slugs.industries.map((s) => `industries/${s}`)]) out.push({ key, locale });
  }
  return out.map((e) => ({ ...e, file: siteContentFile(e.key, e.locale, slugs).file }));
}

export const docFile = (type, locale, slug) => `src/content/${type}/${locale}/${slug}.md`;

/** JSON content files are written the same way every time: 2-space indent and a final newline */
export const formatJson = (value) => JSON.stringify(value, null, 2) + '\n';

// ───────────── Markdown with front matter ─────────────
// Front matter is stored in HighLevel as JSON and written here as YAML in one fixed style:
// strings in double quotes (JSON string syntax is valid YAML), dates (date, updated) bare, numbers and
// true/false bare, lists of words inline, the seo group indented by 2 spaces
const DATE_KEYS = new Set(['date', 'updated']);
const LS = String.fromCharCode(0x2028), PS = String.fromCharCode(0x2029); // line and paragraph separators break YAML lines
const quote = (s) => JSON.stringify(s).split(LS).join('\\u2028').split(PS).join('\\u2029');
const scalar = (v, key) => {
  if (typeof v === 'string') return DATE_KEYS.has(key) && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : quote(v);
  return String(v);
};
function yaml(obj, indent = '') {
  let out = '';
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) out += `${indent}${k}: [${v.map((x) => scalar(x)).join(', ')}]\n`;
    else if (typeof v === 'object') { const inner = yaml(v, indent + '  '); out += inner ? `${indent}${k}:\n${inner}` : `${indent}${k}: {}\n`; }
    else out += `${indent}${k}: ${scalar(v, k)}\n`;
  }
  return out;
}

/** A Markdown file from front matter (object) and body (text): a blank line after the front matter, one final newline */
export function toMarkdown(frontmatter, body) {
  const text = body.replace(/\r\n?/g, '\n').replace(/\n*$/, '\n');
  return `---\n${yaml(frontmatter)}---\n\n${text}`;
}

/**
 * Front matter and body of a Markdown file in this repo (the subset of YAML the content files use)
 * Used to export the committed files as fake HighLevel records; throws on anything it does not understand
 */
export function fromMarkdown(text, file = 'file') {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error(`${file}: no front matter`);
  let body = text.slice(m[0].length);
  if (body.startsWith('\n')) body = body.slice(1);
  const value = (s) => {
    if (s.startsWith('"') || s.startsWith('[')) return JSON.parse(s);
    if (s.startsWith("'")) return s.slice(1, -1).replace(/''/g, "'");
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    if (s === 'true' || s === 'false') return s === 'true';
    return s; // a bare word or a date such as 2026-10-23 stays text
  };
  const fm = {};
  let group = null;
  for (const line of m[1].split('\n')) {
    if (!line.trim()) continue;
    const nested = line.match(/^ {2}([A-Za-z][\w-]*):\s*(.*)$/);
    const top = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (nested && group) group[nested[1]] = value(nested[2]);
    else if (top && top[2] === '') group = fm[top[1]] = {};
    else if (top) { fm[top[1]] = value(top[2]); group = null; }
    else throw new Error(`${file}: front matter line not understood: ${line}`);
  }
  return { frontmatter: fm, body };
}

// ───────────── HighLevel media URLs ─────────────
// Files uploaded to the HighLevel media library come back as a Google Cloud Storage URL
// (POST /medias/upload-file → `url`, https://marketplace.gohighlevel.com/docs/ghl/medias/upload-media-content),
// served from storage.googleapis.com/msgsndr/… and the filesafe.space CDN, and resized through images.leadconnectorhq.com
const MEDIA_URL = String.raw`https://(?:storage\.googleapis\.com/msgsndr/|(?:[a-z0-9-]+\.)*filesafe\.space/|images\.leadconnectorhq\.com/|assets\.leadconnectorhq\.com/)[^\s"'<>()[\]{}\\]+`;
/** Every HighLevel media URL in a text, without trailing punctuation */
export const mediaUrls = (text) => [...String(text).matchAll(new RegExp(MEDIA_URL, 'gi'))].map((m) => m[0].replace(/[.,;:!?]+$/, ''));
export const isMediaUrl = (url) => new RegExp(`^${MEDIA_URL}$`, 'i').test(url);
