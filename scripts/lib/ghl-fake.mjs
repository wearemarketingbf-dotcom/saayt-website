#!/usr/bin/env node
// A local stand-in for the HighLevel API, so the content fetch can be tested end to end without a token
//
// GHL_FAKE_DIR holds one file per custom object, in the shape the search endpoint answers
// (https://marketplace.gohighlevel.com/docs/ghl/objects/search-object-records):
//   custom_objects.saayt_site_content.json   { "records": [ { id, properties: { content_key, locale, part, data, … }, … } ], "total": n }
//   custom_objects.saayt_documents.json      { "records": [ { id, properties: { doc_type, slug, locale, part, frontmatter, body, status, … } } ], "total": n }
//   media/<file name>                        served for any HighLevel media URL that ends in that file name
// The fake answers POST /objects/{key}/records/search page by page, like the API
// Test switches: GHL_FAKE_PAGE_CAP (most records per page, default 100), GHL_FAKE_FAIL (e.g. "429,503": the
// statuses the first API calls answer with, to exercise the retries)
//
// Run directly to export this repo's current content files as fake records:
//   node scripts/lib/ghl-fake.mjs <out-dir> [--part-size 20000]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SITE_OBJECT, DOCS_OBJECT, DOC_TYPES, LOCALES, fromMarkdown, isMediaUrl } from './content-files.mjs';

const TYPES = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf' };
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

/** A fetch() that answers from the files in dir */
export function fakeFetch(dir) {
  const fails = (process.env.GHL_FAKE_FAIL || '').split(',').map((s) => s.trim()).filter(Boolean).map(Number);
  const cap = Number(process.env.GHL_FAKE_PAGE_CAP) || 100;
  return async (url, init = {}) => {
    const u = new URL(url);
    if (u.hostname === 'services.leadconnectorhq.com') {
      const headers = Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
      if (fails.length) {
        const status = fails.shift();
        // a 429 carries the rate limit headers the real API sends (https://marketplace.gohighlevel.com/docs/other/rate-limits)
        return json(status, { statusCode: status, message: status === 429 ? 'Too Many Requests' : 'Internal Server Error' },
          status === 429 ? { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Max': '100', 'X-RateLimit-Interval-Milliseconds': '10000', 'X-RateLimit-Daily-Remaining': '199000' } : {});
      }
      if (!/^Bearer \S+/.test(headers.authorization || '')) return json(401, { statusCode: 401, message: 'Invalid token: access token is invalid', error: 'Unauthorized' });
      if (!headers.version) return json(400, { statusCode: 400, message: 'Version header is required' });
      const m = u.pathname.match(/^\/objects\/([^/]+)\/records\/search$/);
      if (!m || init.method !== 'POST') return json(404, { statusCode: 404, message: `Cannot ${init.method || 'GET'} ${u.pathname}` });
      const body = JSON.parse(init.body || '{}');
      if (!body.locationId || !(body.page >= 1) || !(body.pageLimit >= 1)) return json(422, { statusCode: 422, message: 'locationId, page and pageLimit are required' });
      const file = path.join(dir, `${decodeURIComponent(m[1])}.json`);
      if (!fs.existsSync(file)) return json(404, { statusCode: 404, message: 'Object schema not found' });
      const all = JSON.parse(fs.readFileSync(file, 'utf8')).records || [];
      const limit = Math.min(body.pageLimit, cap);
      return json(200, { records: all.slice((body.page - 1) * limit, body.page * limit), total: all.length });
    }
    if (isMediaUrl(url)) {
      const name = decodeURIComponent(u.pathname.split('/').pop());
      const file = path.join(dir, 'media', name);
      if (!fs.existsSync(file)) return new Response('Not found', { status: 404 });
      return new Response(fs.readFileSync(file), { status: 200, headers: { 'Content-Type': TYPES[path.extname(name).toLowerCase()] || 'application/octet-stream' } });
    }
    return new Response('Not found', { status: 404 });
  };
}

// ───────────── export the committed files as fake records ─────────────
const STAMP = '2026-11-05T00:00:00.000Z';
const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
/** Split text into parts of at most n characters (code points, so no character is cut in half) */
const parts = (text, n) => { const cps = Array.from(text); const out = []; for (let i = 0; i < cps.length || !out.length; i += n) out.push(cps.slice(i, i + n).join('')); return out; };

/** content_key and locale from a file path, worked out from the path alone (the fetch maps them back on its own) */
function keyOf(rel) {
  const p = rel.replace(/^src\/data\//, '').replace(/\.json$/, '');
  let m;
  if ((m = p.match(/^(.+)\.(ar|en)$/))) return { key: m[1], locale: m[2] };
  if ((m = p.match(/^(.+)\/(ar|en)$/))) return { key: m[1], locale: m[2] };
  if ((m = p.match(/^(.+)\/(ar|en)\/([^/]+)$/))) return { key: `${m[1]}/${m[3]}`, locale: m[2] };
  return { key: p, locale: 'all' };
}

function record(objectKey, locationId, properties, i) {
  const id = crypto.createHash('sha1').update(objectKey + JSON.stringify([properties.content_key, properties.doc_type, properties.slug, properties.locale, properties.part])).digest('hex').slice(0, 24);
  const by = { channel: 'API', createdAt: STAMP, source: 'PUBLIC_API', sourceId: 'saayt-cms' };
  return { id, owner: [], followers: [], properties, createdAt: STAMP, updatedAt: STAMP, locationId, objectId: crypto.createHash('md5').update(objectKey).digest('hex').slice(0, 24), objectKey, createdBy: by, lastUpdatedBy: by, searchAfter: [Date.parse(STAMP) + i, id] };
}

/** Write fake records for every content file in root into outDir; returns the record counts */
export function exportFake(root, outDir, { partSize = 20000, locationId = 'fake-location' } = {}) {
  const meta = { version: 1, updated_by: 'export@saayt.app', updated_at: STAMP };
  const site = [];
  for (const abs of walk(path.join(root, 'src/data')).filter((f) => f.endsWith('.json')).sort()) {
    const rel = path.relative(root, abs).split(path.sep).join('/');
    const { key, locale } = keyOf(rel);
    parts(fs.readFileSync(abs, 'utf8'), partSize).forEach((data, i) => site.push({ content_key: key, locale, part: i + 1, data, ...meta }));
  }
  const docs = [];
  for (const doc_type of DOC_TYPES) for (const locale of LOCALES) {
    for (const abs of walk(path.join(root, 'src/content', doc_type, locale)).filter((f) => f.endsWith('.md')).sort()) {
      const slug = path.basename(abs, '.md');
      const { frontmatter, body } = fromMarkdown(fs.readFileSync(abs, 'utf8'), path.relative(root, abs));
      const fm = JSON.stringify(frontmatter, null, 2);
      parts(body, partSize).forEach((b, i) => docs.push({ doc_type, slug, locale, part: i + 1, frontmatter: i === 0 ? fm : '', body: b, status: 'published', ...meta }));
    }
  }
  fs.mkdirSync(path.join(outDir, 'media'), { recursive: true });
  for (const [key, list] of [[SITE_OBJECT, site], [DOCS_OBJECT, docs]]) {
    const records = list.map((p, i) => record(key, locationId, p, i));
    fs.writeFileSync(path.join(outDir, `${key}.json`), JSON.stringify({ records, total: records.length }, null, 2) + '\n');
  }
  return { site: site.length, docs: docs.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const out = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--part-size');
  if (!out) { console.error('Usage: node scripts/lib/ghl-fake.mjs <out-dir> [--part-size 20000]'); process.exit(2); }
  const ps = args.includes('--part-size') ? Number(args[args.indexOf('--part-size') + 1]) : undefined;
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const n = exportFake(root, path.resolve(out), { partSize: ps });
  console.log(`Fake HighLevel records in ${out}: ${n.site} site content, ${n.docs} documents · run GHL_FAKE_DIR=${out} npm run build`);
}
