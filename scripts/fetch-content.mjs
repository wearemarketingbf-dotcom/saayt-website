#!/usr/bin/env node
// Content from GoHighLevel · runs before `astro build` (npm run build, and its own step in the deploy workflow)
//
// The SAAYT CMS stores the website content in two HighLevel custom objects. This script reads every record,
// writes the files the website already reads, and leaves the rest of the build unchanged:
//   custom_objects.saayt_site_content  → src/data/**.json            (content_key + locale, long JSON split in parts)
//   custom_objects.saayt_documents     → src/content/{blog,legal}/{ar,en}/{slug}.md   (front matter JSON + Markdown body)
// · drafts are skipped, and a blog or legal file without a published record is removed
// · every HighLevel media URL the content uses is downloaded to public/media/ghl-<hash>.<ext> and the URL rewritten,
//   so the live site never loads anything from HighLevel
// · a record that does not fit stops the build with the file and the field named, and nothing is written
// · with no GHL_TOKEN and GHL_LOCATION_ID it does nothing: the content files committed in git are used
//
// Environment
//   GHL_TOKEN          Private Integration Token of the SAAYT sub-account, scope objects/record.readonly
//   GHL_LOCATION_ID    the SAAYT sub-account (location) id
//   GHL_API_VERSION    optional, the Version header (default 2021-07-28; v3 is documented too)
//   GHL_FAKE_DIR       optional, read records from local JSON files instead of the API (scripts/lib/ghl-fake.mjs)
//   GHL_RETRY_SCALE    optional, multiplies every retry wait (tests use a tiny value)
// Usage: node scripts/fetch-content.mjs [--root <site dir>]
//
// HighLevel documentation used
//   Search Object Records · POST /objects/{schemaKey}/records/search with { locationId, page, pageLimit, query, searchAfter },
//     answers { records: [{ id, properties, searchAfter, … }], total }, needs scope objects/record.readonly
//     https://marketplace.gohighlevel.com/docs/2021-07-28/ghl/objects/search-object-records
//     https://marketplace.gohighlevel.com/docs/ghl/objects/search-object-records (Version v3, same body and answer)
//   Rate limits · 100 requests per 10 s and 200,000 a day; a 429 has no Retry-After: wait X-RateLimit-Daily-Reset ms when
//     X-RateLimit-Daily-Remaining is 0, otherwise 10,000 ms when X-RateLimit-Remaining is 0
//     https://marketplace.gohighlevel.com/docs/other/rate-limits
//   Upload File into Media Storage · the answer's `url` is a public Google Cloud Storage URL
//     https://marketplace.gohighlevel.com/docs/ghl/medias/upload-media-content
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  SITE_OBJECT, DOCS_OBJECT, DOC_TYPES, LOCALES, SLUG, readSlugs, siteContentFile, expectedSiteContent, docFile,
  formatJson, toMarkdown, mediaUrls,
} from './lib/content-files.mjs';
import { fakeFetch } from './lib/ghl-fake.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argRoot = process.argv.indexOf('--root');
const ROOT = path.resolve(argRoot > 0 ? process.argv[argRoot + 1] : path.join(HERE, '..'));
const env = process.env;
const FAKE = env.GHL_FAKE_DIR ? path.resolve(env.GHL_FAKE_DIR) : '';
const TOKEN = (env.GHL_TOKEN || '').trim();
const LOCATION = (env.GHL_LOCATION_ID || '').trim() || (FAKE ? 'fake-location' : '');
const API = 'https://services.leadconnectorhq.com';
const API_VERSION = (env.GHL_API_VERSION || '').trim() || '2021-07-28';
const SITE_KEY = env.GHL_SITE_CONTENT_OBJECT || SITE_OBJECT;
const DOCS_KEY = env.GHL_DOCUMENTS_OBJECT || DOCS_OBJECT;
const PAGE_LIMIT = 100;
const ATTEMPTS = 6;                                   // 1 try + 5 retries (1, 2, 4, 8, 16 s on 5xx)
const SCALE = env.GHL_RETRY_SCALE !== undefined ? Number(env.GHL_RETRY_SCALE) : 1;
const IN_ACTIONS = env.GITHUB_ACTIONS === 'true';
const http = FAKE ? fakeFetch(FAKE) : globalThis.fetch;

const log = (s = '') => console.log(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rel = (...p) => p.join('/');
const abs = (r) => path.join(ROOT, ...r.split('/'));

class Stop extends Error {}
/** Problems found in the records: { file, record, field, msg } */
const problems = [];
const warnings = [];
const problem = (file, record, field, msg) => problems.push({ file, record, field, msg });

// ───────────── HTTP with retries ─────────────
async function request(url, init, what, timeout = 30_000) {
  for (let attempt = 1; ; attempt++) {
    let res, err;
    try { res = await http(url, { ...init, signal: AbortSignal.timeout(timeout) }); } catch (e) { err = e; }
    if (res && res.status !== 429 && res.status < 500) {
      if (res.ok) return res;
      throw new Stop(`${what}: HTTP ${res.status}${await reason(res)}`);
    }
    if (attempt === ATTEMPTS) throw new Stop(`${what}: ${err ? err.message : `HTTP ${res.status}${await reason(res)}`} after ${ATTEMPTS} tries`);
    const wait = retryWait(res, attempt, what);
    log(`  … ${what}: ${err ? err.cause?.code || err.message : `HTTP ${res.status}`}, trying again in ${Math.round(wait / 1000)} s (${attempt}/${ATTEMPTS - 1})`);
    await sleep(wait * SCALE);
  }
}
function retryWait(res, attempt, what) {
  const backoff = Math.min(30_000, 1000 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 250);
  if (!res || res.status !== 429) return backoff;
  // https://marketplace.gohighlevel.com/docs/other/rate-limits: no Retry-After, use the rate limit headers
  const h = (n) => res.headers.get(n);
  if (h('x-ratelimit-daily-remaining') === '0') {
    const ms = Number(h('x-ratelimit-daily-reset')) || 60_000;
    if (ms > 5 * 60_000) throw new Stop(`${what}: the HighLevel daily API limit is used up; it resets in about ${Math.ceil(ms / 60_000)} minutes`);
    return ms;
  }
  if (h('x-ratelimit-remaining') === '0') return 10_000;
  return Math.max(backoff, 2000);
}
async function reason(res) {
  let msg = '';
  try { const t = await res.text(); try { const j = JSON.parse(t); msg = [j.message].flat().join(' · ') || t; } catch { msg = t; } } catch { /* no body */ }
  msg = msg.replace(/\s+/g, ' ').trim().slice(0, 300);
  const hint = res.status === 401 ? 'check GHL_TOKEN (a Private Integration Token of the SAAYT sub-account)'
    : res.status === 403 ? 'the token needs the scope objects/record.readonly for this sub-account (GHL_LOCATION_ID)'
    : res.status === 404 ? 'is the custom object created in this sub-account? (php artisan cms:install in the SAAYT CMS)' : '';
  return [msg && ` · ${msg}`, hint && ` · ${hint}`].join('');
}

/** Every record of a custom object, page by page (POST /objects/{schemaKey}/records/search) */
async function searchAll(schemaKey) {
  const seen = new Map();
  let page = 1, after = [], total = Infinity, byCursor = false;
  for (let i = 0; i < 1000 && seen.size < total; i++) {
    const res = await request(`${API}/objects/${encodeURIComponent(schemaKey)}/records/search`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN || 'fake'}`, Version: API_VERSION, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ locationId: LOCATION, page, pageLimit: PAGE_LIMIT, query: '', searchAfter: after }),
    }, `HighLevel ${schemaKey} search`);
    const data = await res.json();
    if (Number.isFinite(Number(data.total))) total = Number(data.total);
    const records = Array.isArray(data.records) ? data.records : [];
    if (!records.length) break;
    const before = seen.size;
    for (const r of records) if (r && r.id && !seen.has(r.id)) seen.set(r.id, r);
    // the docs list both page numbers and a searchAfter cursor; if a page number brings nothing new, follow the cursor
    if (seen.size === before) { if (byCursor || !records.at(-1).searchAfter?.length) break; byCursor = true; }
    if (byCursor) { after = records.at(-1).searchAfter; page = 1; } else page++;
  }
  if (Number.isFinite(total) && seen.size < total) throw new Stop(`HighLevel ${schemaKey}: got ${seen.size} of ${total} records, paging stopped early`);
  return [...seen.values()];
}

// ───────────── records → files ─────────────
const props = (r) => { let p = r.properties || {}; if (typeof p === 'string') { try { p = JSON.parse(p); } catch { p = {}; } } return p; };
/** A field of a record, by its short key (content_key) or its full key (custom_objects.saayt_site_content.content_key) */
const field = (r, k) => { const p = props(r); return p[k] ?? p[`${r.objectKey}.${k}`]; };
const text = (v) => (v === null || v === undefined ? '' : String(v)).replace(/\r\n?/g, '\n');
const word = (v) => text(v).trim();
const where = (r, schemaKey) => `record ${r.id} in ${schemaKey}`;
const badJson = (e) => `is not valid JSON (${e.message.replace(/\s+/g, ' ').slice(0, 160)})`;

/** Group records by the file they make, check the parts and join them in order */
function joinParts(records, schemaKey, fileOf, fields) {
  const groups = new Map();
  for (const r of records) {
    const f = fileOf(r);
    if (!f) continue;
    const raw = field(r, 'part');
    const part = raw === undefined || raw === null || raw === '' ? 1 : Number(raw);
    if (!Number.isInteger(part) || part < 1) { problem(f, where(r, schemaKey), 'part', `must be 1, 2, 3 …, not "${raw}"`); continue; }
    if (!groups.has(f)) groups.set(f, []);
    groups.get(f).push({ part, r });
  }
  const out = new Map();
  for (const [f, list] of groups) {
    list.sort((a, b) => a.part - b.part);
    const dupe = list.find((x, i) => i && x.part === list[i - 1].part);
    if (dupe) { problem(f, list.filter((x) => x.part === dupe.part).map((x) => where(x.r, schemaKey)).join(' and '), 'part', `part ${dupe.part} is saved twice`); continue; }
    if (list.some((x, i) => x.part !== i + 1)) { problem(f, where(list[0].r, schemaKey), 'part', `parts ${list.map((x) => x.part).join(', ')} have a gap (expected 1 to ${list.length})`); continue; }
    const versions = [...new Set(list.map((x) => field(x.r, 'version')).filter((v) => v !== undefined && v !== null && v !== '').map(Number))];
    if (versions.length > 1) { problem(f, where(list[0].r, schemaKey), 'version', `the parts have different versions (${versions.join(', ')}): a save did not finish, save it again in the CMS`); continue; }
    const joined = { records: list.map((x) => x.r), first: list[0].r };
    for (const k of fields) joined[k] = list.map((x) => text(field(x.r, k))).join('');
    out.set(f, joined);
  }
  return out;
}

const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v) && !Number.isNaN(Date.parse(v));
/** Front matter checks, the same rules as src/content.config.ts, so a bad record stops here with its file and field */
function checkFrontmatter(type, fm, file, rec, slug, locale) {
  const bad = (k, msg) => problem(file, rec, `frontmatter.${k}`, msg);
  const str = (k, required = true) => { const v = fm[k]; if (v === undefined || v === null) { if (required) bad(k, 'is missing'); return; } if (typeof v !== 'string') bad(k, 'must be text'); else if (required && !v.trim()) bad(k, 'is empty'); };
  const allowed = type === 'blog'
    ? ['title', 'description', 'date', 'updated', 'slug', 'lang', 'readingTime', 'tags', 'cover', 'coverAlt', 'seo']
    : ['title', 'description', 'lang', 'updated', 'seo'];
  for (const k of Object.keys(fm)) if (!allowed.includes(k)) bad(k, `is not a front matter field of ${type} (allowed: ${allowed.join(', ')})`);
  str('title'); str('description');
  if (fm.lang !== locale) bad('lang', `must be "${locale}" like the record's locale, not ${JSON.stringify(fm.lang)}`);
  if (type === 'blog') {
    if (!isDate(fm.date)) bad('date', `must be a date such as 2026-10-23, not ${JSON.stringify(fm.date)}`);
    if (fm.updated != null && !isDate(fm.updated)) bad('updated', `must be a date such as 2026-10-23, not ${JSON.stringify(fm.updated)}`);
    if (fm.slug !== slug) bad('slug', `must be "${slug}" like the record's slug, not ${JSON.stringify(fm.slug)}`);
    if (typeof fm.readingTime !== 'number' || !Number.isFinite(fm.readingTime)) bad('readingTime', 'must be a number of minutes');
    if (fm.tags != null && (!Array.isArray(fm.tags) || fm.tags.some((t) => typeof t !== 'string'))) bad('tags', 'must be a list of words');
    str('cover'); if (typeof fm.cover === 'string' && fm.cover && !/^(\/|https:\/\/)/.test(fm.cover)) bad('cover', 'must start with / or https://');
    str('coverAlt');
  } else if (!isDate(fm.updated)) bad('updated', `must be a date such as 2026-10-23, not ${JSON.stringify(fm.updated)}`);
  if (fm.seo != null) {
    if (typeof fm.seo !== 'object' || Array.isArray(fm.seo)) bad('seo', 'must be a group of title, description, image and noindex');
    else for (const [k, v] of Object.entries(fm.seo)) {
      if (!['title', 'description', 'image', 'noindex'].includes(k)) bad(`seo.${k}`, 'is not an SEO field (title, description, image, noindex)');
      else if (k === 'noindex' ? typeof v !== 'boolean' && v !== null : typeof v !== 'string' && v !== null) bad(`seo.${k}`, k === 'noindex' ? 'must be true or false' : 'must be text');
    }
  }
}

/** Download each HighLevel media URL once into public/media and give back url → /media/<file> */
async function downloadMedia(urls) {
  const dir = abs('public/media');
  fs.mkdirSync(dir, { recursive: true });
  const map = new Map(), stats = { downloaded: 0, kept: 0 };
  const EXT = /\.(webp|png|jpe?g|gif|svg|avif|mp4|webm|mov|pdf)$/i;
  const BY_TYPE = { 'image/webp': '.webp', 'image/png': '.png', 'image/jpeg': '.jpg', 'image/gif': '.gif', 'image/svg+xml': '.svg', 'image/avif': '.avif', 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov', 'application/pdf': '.pdf' };
  const queue = [...urls];
  const worker = async () => {
    for (let url; (url = queue.shift());) {
      const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 16);
      const pathExt = (decodeURIComponent(new URL(url).pathname).match(EXT) || [''])[0].toLowerCase().replace('.jpeg', '.jpg');
      const existing = fs.readdirSync(dir).find((f) => f.startsWith(`ghl-${hash}.`));
      if (existing && fs.statSync(path.join(dir, existing)).size > 0) { map.set(url, `/media/${existing}`); stats.kept++; continue; }
      const res = await request(url, { method: 'GET' }, `media ${url}`, 120_000);
      const type = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (!/^(image|video|audio)\/|^application\/(pdf|octet-stream)$/.test(type)) throw new Stop(`media ${url}: the answer is ${type || 'of no type'}, not an image, video or PDF`);
      const ext = pathExt || BY_TYPE[type] || '';
      if (!ext) throw new Stop(`media ${url}: unknown file type ${type}`);
      const name = `ghl-${hash}${ext}`;
      fs.writeFileSync(path.join(dir, name), Buffer.from(await res.arrayBuffer()));
      map.set(url, `/media/${name}`); stats.downloaded++;
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  return { map, stats };
}
/** Replace every HighLevel media URL in a text (longest first, so a resized-image URL that wraps another stays whole) */
const rewrite = (s, map) => { let out = s; for (const u of [...map.keys()].sort((a, b) => b.length - a.length)) out = out.split(u).join(map.get(u)); return out; };
const rewriteDeep = (v, map) => (typeof v === 'string' ? rewrite(v, map) : Array.isArray(v) ? v.map((x) => rewriteDeep(x, map)) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, rewriteDeep(x, map)])) : v);
const collectDeep = (v, set) => { if (typeof v === 'string') mediaUrls(v).forEach((u) => set.add(u)); else if (v && typeof v === 'object') Object.values(v).forEach((x) => collectDeep(x, set)); };

// ───────────── report ─────────────
const esc = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const escProp = (s) => esc(s).replace(/:/g, '%3A').replace(/,/g, '%2C');
function summary(lines) {
  if (!env.GITHUB_STEP_SUMMARY) return;
  try { fs.appendFileSync(env.GITHUB_STEP_SUMMARY, `### Content from GoHighLevel\n\n${lines.map((l) => (l.startsWith('  ') ? `- ${l.trim()}` : l)).join('\n')}\n\n`); } catch { /* summary is optional */ }
}
function fail(title, lines) {
  console.error(`\n${title}\n${lines.join('\n')}\n`);
  summary([`**${title}**`, '', ...lines]);
  process.exit(1);
}

// ───────────── main ─────────────
async function main() {
  if (!FAKE) {
    if (!TOKEN && !(env.GHL_LOCATION_ID || '').trim()) { log('Content: GHL_TOKEN and GHL_LOCATION_ID are not set, so the build uses the content files in git'); return; }
    if (!TOKEN || !LOCATION) fail('Content from GoHighLevel: not configured', [`  ${!TOKEN ? 'GHL_TOKEN' : 'GHL_LOCATION_ID'} is empty while ${TOKEN ? 'GHL_TOKEN' : 'GHL_LOCATION_ID'} is set · set both (repository secrets) or neither`]);
  }
  const shown = path.relative(process.cwd(), FAKE);
  log(`Content from GoHighLevel${FAKE ? ` (fake records in ${shown && !shown.startsWith('..') ? shown : FAKE})` : ''} · location ${LOCATION} · API version ${API_VERSION}`);
  const slugs = readSlugs(ROOT);
  const [siteRecords, docRecords] = [await searchAll(SITE_KEY), await searchAll(DOCS_KEY)];
  if (!siteRecords.length) problem(SITE_KEY, '', '', 'has no records: import the website content first (php artisan cms:import in the SAAYT CMS) or check GHL_LOCATION_ID');
  if (!docRecords.length) problem(DOCS_KEY, '', '', 'has no records: import the website content first (php artisan cms:import in the SAAYT CMS) or check GHL_LOCATION_ID');

  // site content: one JSON file per content_key and locale
  const site = joinParts(siteRecords, SITE_KEY, (r) => {
    const key = word(field(r, 'content_key')), locale = word(field(r, 'locale'));
    if (!key) { problem(where(r, SITE_KEY), '', 'content_key', 'is empty'); return null; }
    const res = siteContentFile(key, locale, slugs);
    if (res.error) { problem(where(r, SITE_KEY), '', res.field, res.error); return null; }
    return res.file;
  }, ['data']);
  const files = new Map(); // repo path → text to write
  const parsed = new Map();
  for (const [file, g] of site) {
    let value;
    try { value = JSON.parse(g.data); } catch (e) { problem(file, where(g.first, SITE_KEY), 'data', badJson(e)); continue; }
    const isFaq = /\/faq\.(ar|en)\.json$/.test(file);
    if (isFaq ? !Array.isArray(value) : !value || typeof value !== 'object' || Array.isArray(value)) { problem(file, where(g.first, SITE_KEY), 'data', isFaq ? 'must be a list of questions' : 'must be a JSON object'); continue; }
    parsed.set(file, value);
  }
  for (const e of expectedSiteContent(slugs)) if (!site.has(e.file) && !problems.some((p) => p.file === e.file)) warnings.push(`${e.file}: no record for ${e.key} (${e.locale}) in HighLevel, the file in git is used`);

  // documents: one Markdown file per type, locale and slug
  const docs = joinParts(docRecords, DOCS_KEY, (r) => {
    const type = word(field(r, 'doc_type')), slug = word(field(r, 'slug')), locale = word(field(r, 'locale'));
    const bad = (f, msg) => { problem(where(r, DOCS_KEY), '', f, msg); return null; };
    if (!DOC_TYPES.includes(type)) return bad('doc_type', `must be blog or legal, not "${type}"`);
    if (!SLUG.test(slug)) return bad('slug', `must be lowercase English letters, digits and dashes, not "${slug}"`);
    if (!LOCALES.includes(locale)) return bad('locale', `must be ar or en, not "${locale}"`);
    return docFile(type, locale, slug);
  }, ['frontmatter', 'body']);
  const published = new Map(); // repo path → { type, locale, slug, fm, body }
  let drafts = 0;
  for (const [file, g] of docs) {
    const [, type, locale, slug] = file.match(/^src\/content\/([^/]+)\/([^/]+)\/([^/]+)\.md$/);
    const status = word(field(g.first, 'status')).toLowerCase();
    if (status === 'draft') { drafts++; continue; }
    if (status !== 'published') { problem(file, where(g.first, DOCS_KEY), 'status', `must be published or draft, not "${status}"`); continue; }
    let fm;
    try { fm = JSON.parse(g.frontmatter); } catch (e) { problem(file, where(g.first, DOCS_KEY), 'frontmatter', badJson(e)); continue; }
    if (!fm || typeof fm !== 'object' || Array.isArray(fm)) { problem(file, where(g.first, DOCS_KEY), 'frontmatter', 'must be a JSON object'); continue; }
    if (!g.body.trim()) problem(file, where(g.first, DOCS_KEY), 'body', 'is empty');
    checkFrontmatter(type, fm, file, where(g.first, DOCS_KEY), slug, locale);
    published.set(file, { type, locale, slug, fm, body: g.body });
  }
  // every published article and legal page needs both languages (the pages link to each other)
  const pubKeys = new Set([...published.values()].map((d) => `${d.type}/${d.locale}/${d.slug}`));
  for (const d of published.values()) {
    const other = d.locale === 'ar' ? 'en' : 'ar';
    if (!pubKeys.has(`${d.type}/${other}/${d.slug}`)) problem(docFile(d.type, other, d.slug), '', 'status', `${d.type} "${d.slug}" is published in ${d.locale} but not in ${other}: publish both languages or neither`);
  }
  // a legal page the site has a route for must stay
  for (const locale of LOCALES) for (const f of listMd('legal', locale)) {
    const slug = path.basename(f, '.md');
    const route = locale === 'ar' ? `src/pages/${slug}/index.astro` : `src/pages/en/${slug}/index.astro`;
    if (!pubKeys.has(`legal/${locale}/${slug}`) && fs.existsSync(abs(route)) && !problems.some((p) => p.file === docFile('legal', locale, slug))) {
      problem(docFile('legal', locale, slug), '', 'status', `the site has a page for it (${route}) but HighLevel has no published record: publish it in the CMS`);
    }
  }
  if (problems.length) {
    const byFile = new Map();
    for (const p of problems) byFile.set(p.file, [...(byFile.get(p.file) || []), p]);
    const lines = [];
    for (const [file, ps] of byFile) {
      lines.push(`  ${file}${ps[0].record ? ` (${ps[0].record})` : ''}`);
      for (const p of ps) lines.push(`    · ${p.field ? `${p.field}: ` : ''}${p.msg}`);
      if (IN_ACTIONS) for (const p of ps) console.log(`::error title=${escProp(`Content ${file}`)}::${esc(`${p.field ? `${p.field}: ` : ''}${p.msg}`)}`);
    }
    fail(`Content from GoHighLevel: ${problems.length} problem${problems.length > 1 ? 's' : ''} to fix in the SAAYT CMS, nothing was written`, lines);
  }

  // media: download what the content uses, then point the content at the local copies
  const used = new Set();
  for (const v of parsed.values()) collectDeep(v, used);
  for (const d of published.values()) { collectDeep(d.fm, used); mediaUrls(d.body).forEach((u) => used.add(u)); }
  const { map, stats } = await downloadMedia([...used]);

  for (const [file, value] of parsed) files.set(file, formatJson(rewriteDeep(value, map)));
  for (const [file, d] of published) files.set(file, toMarkdown(rewriteDeep(d.fm, map), rewrite(d.body, map)));

  // write what changed, remove blog and legal files that are no longer published, prune unused downloads
  let changed = 0;
  for (const [file, t] of files) {
    const p = abs(file);
    if (fs.existsSync(p) && fs.readFileSync(p, 'utf8') === t) continue;
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, t);
    changed++;
  }
  const removed = [];
  for (const type of DOC_TYPES) for (const locale of LOCALES) for (const f of listMd(type, locale)) {
    const file = docFile(type, locale, path.basename(f, '.md'));
    if (!published.has(file)) { fs.unlinkSync(abs(file)); removed.push(file); }
  }
  const keep = new Set([...map.values()].map((u) => u.replace('/media/', '')));
  const pruned = fs.readdirSync(abs('public/media')).filter((f) => f.startsWith('ghl-') && !keep.has(f));
  for (const f of pruned) fs.unlinkSync(path.join(abs('public/media'), f));

  const count = (type, locale) => [...published.values()].filter((d) => d.type === type && (!locale || d.locale === locale)).length;
  const lines = [
    `  site content  ${parsed.size} files`,
    `  blog          ${count('blog')} published (${count('blog', 'ar')} ar · ${count('blog', 'en')} en)`,
    `  legal         ${count('legal')} published`,
    `  drafts        ${drafts} skipped`,
    `  written       ${changed} file${changed === 1 ? '' : 's'} changed${removed.length ? ` · removed ${removed.join(', ')}` : ''}`,
    `  media         ${stats.downloaded} downloaded · ${stats.kept} already in public/media${pruned.length ? ` · ${pruned.length} unused removed` : ''}`,
    ...warnings.map((w) => `  ! ${w}`),
  ];
  log(lines.join('\n'));
  if (IN_ACTIONS) for (const w of warnings) console.log(`::warning title=Content::${esc(w)}`);
  summary(lines);
}

function listMd(type, locale) {
  const dir = abs(rel('src/content', type, locale));
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort() : [];
}

main().catch((e) => {
  if (e instanceof Stop) fail('Content from GoHighLevel: stopped, no content file was changed', [`  ${e.message}`]);
  console.error(e);
  process.exit(1);
});
