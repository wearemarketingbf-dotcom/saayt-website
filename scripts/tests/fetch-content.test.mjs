// Tests for scripts/fetch-content.mjs against the local HighLevel fake (scripts/lib/ghl-fake.mjs) · npm test
// Each test works on a copy of the site in the system temp folder, so this checkout is never touched
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { exportFake } from '../lib/ghl-fake.mjs';
import { SITE_OBJECT, DOCS_OBJECT } from '../lib/content-files.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FETCH = path.join(REPO, 'scripts/fetch-content.mjs');
const ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(GHL_|GITHUB_)/.test(k)));
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'saayt-content-'));
const files = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
/** relative path → sha256 of every file under dir */
const tree = (dir, skip = () => false) => Object.fromEntries(files(dir).map((f) => path.relative(dir, f)).filter((f) => !skip(f)).sort().map((f) => [f, sha(fs.readFileSync(path.join(dir, f)))]));

/** A copy of the site: src only, or everything a build needs (node_modules linked package by package, so Astro's cache stays in the copy) */
function copySite({ build = false } = {}) {
  const dir = tmp();
  const names = build ? fs.readdirSync(REPO).filter((n) => !['node_modules', 'dist', '.astro', '.git'].includes(n)) : ['src'];
  for (const n of names) fs.cpSync(path.join(REPO, n), path.join(dir, n), { recursive: true });
  fs.mkdirSync(path.join(dir, 'public/media'), { recursive: true });
  if (build) {
    fs.mkdirSync(path.join(dir, 'node_modules'));
    for (const n of fs.readdirSync(path.join(REPO, 'node_modules'))) if (!['.astro', '.vite', '.cache'].includes(n)) fs.symlinkSync(path.join(REPO, 'node_modules', n), path.join(dir, 'node_modules', n));
  }
  return dir;
}
const fetchContent = (dir, env = {}) => spawnSync(process.execPath, [FETCH, '--root', dir], { env: { ...ENV, GHL_RETRY_SCALE: '0.001', ...env }, encoding: 'utf8' });
const build = (dir, env = {}) => spawnSync('npm', ['run', 'build'], { cwd: dir, env: { ...ENV, ...env }, encoding: 'utf8' });
const readFake = (dir, key) => JSON.parse(fs.readFileSync(path.join(dir, `${key}.json`), 'utf8')).records;
const writeFake = (dir, key, records) => fs.writeFileSync(path.join(dir, `${key}.json`), JSON.stringify({ records, total: records.length }));
const find = (records, test) => { const r = records.find((x) => test(x.properties)); assert.ok(r, 'fake record not found'); return r; };
const read = (dir, rel) => fs.readFileSync(path.join(dir, rel), 'utf8');

/** Visible text of every built page */
function pageTexts(dist) {
  const text = (html) => html.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  return Object.fromEntries(files(dist).filter((f) => f.endsWith('.html')).map((f) => [path.relative(dist, f), text(fs.readFileSync(f, 'utf8'))]).sort());
}

test('without GHL_TOKEN and GHL_LOCATION_ID it does nothing and the files in git are used', () => {
  const site = copySite();
  const before = tree(path.join(site, 'src'));
  const r = fetchContent(site);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /not set, so the build uses the content files in git/);
  assert.deepEqual(tree(path.join(site, 'src')), before);
});

test('a token without a location id stops with a clear message', () => {
  const r = fetchContent(copySite(), { GHL_TOKEN: 'pit-test' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /GHL_LOCATION_ID is empty while GHL_TOKEN is set/);
});

test('round trip: records exported from the current files rebuild src byte for byte, and the same site', () => {
  const site = copySite({ build: true });
  let b = build(site);
  assert.equal(b.status, 0, b.stdout + b.stderr);
  const pagesBefore = pageTexts(path.join(site, 'dist'));
  const htmlBefore = tree(path.join(site, 'dist'), (f) => f.startsWith('pagefind'));

  const fake = tmp();
  exportFake(site, fake, { partSize: 1500 }); // small parts, so long files come in several ordered parts
  const docs = readFake(fake, DOCS_OBJECT).reverse(); // the API gives no order: parts arrive out of order
  const draft = (locale) => ({ ...docs[0], id: `draft-${locale}`, properties: { doc_type: 'blog', slug: 'coming-soon', locale, part: 1, frontmatter: '{}', body: 'Not ready', status: 'draft', version: 1 } });
  writeFake(fake, DOCS_OBJECT, [...docs, draft('ar'), draft('en')]);
  writeFake(fake, SITE_OBJECT, readFake(fake, SITE_OBJECT).reverse());

  // every content file goes, and an article that is no longer published is added: the fetch must rebuild the first and remove the second
  for (const f of [...files(path.join(site, 'src/data')), ...files(path.join(site, 'src/content'))]) if (/\.(json|md)$/.test(f)) fs.unlinkSync(f);
  fs.writeFileSync(path.join(site, 'src/content/blog/en/old-post.md'), '---\ntitle: "Old"\n---\n\nOld\n');

  b = build(site, { GHL_FAKE_DIR: fake, GHL_FAKE_PAGE_CAP: '7', GHL_FAKE_FAIL: '429,503', GHL_RETRY_SCALE: '0.001' });
  assert.equal(b.status, 0, b.stdout + b.stderr);
  assert.match(b.stdout, /HTTP 429, trying again/);
  assert.match(b.stdout, /HTTP 503, trying again/);
  assert.match(b.stdout, /site content {2}32 files/);
  assert.match(b.stdout, /blog {10}8 published \(4 ar · 4 en\)/);
  assert.match(b.stdout, /drafts {8}2 skipped/);
  assert.match(b.stdout, /removed src\/content\/blog\/en\/old-post\.md/);
  assert.match(b.stdout, /SEO check · 56 pages/);
  assert.deepEqual(tree(path.join(site, 'src')), tree(path.join(REPO, 'src')), 'src rebuilt from the records is byte for byte the same');
  assert.deepEqual(pageTexts(path.join(site, 'dist')), pagesBefore, 'every page has the same text');
  assert.deepEqual(tree(path.join(site, 'dist'), (f) => f.startsWith('pagefind')), htmlBefore, 'every built file is the same');
});

test('HighLevel media is downloaded to public/media and the content points to the copy', () => {
  const site = copySite();
  const fake = tmp();
  exportFake(site, fake);
  const recs = readFake(fake, SITE_OBJECT);
  const clinics = find(recs, (p) => p.content_key === 'industries/clinics' && p.locale === 'ar');
  const data = JSON.parse(clinics.properties.data);
  data.img = 'https://storage.googleapis.com/msgsndr/fake-location/media/clinic-front.webp';
  clinics.properties.data = JSON.stringify(data); // compact JSON from the CMS is written back in the repo's format
  writeFake(fake, SITE_OBJECT, recs);
  const docs = readFake(fake, DOCS_OBJECT);
  const post = find(docs, (p) => p.doc_type === 'blog' && p.locale === 'en' && p.slug === 'reply-to-google-reviews');
  post.properties.body += '\n![A branch front](https://assets.cdn.filesafe.space/fake-location/media/branch.png "Branch")\n';
  const fm = JSON.parse(post.properties.frontmatter);
  fm.cover = 'https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/fake-location/media/cover.webp';
  post.properties.frontmatter = JSON.stringify(fm);
  writeFake(fake, DOCS_OBJECT, docs);
  const bytes = { 'clinic-front.webp': Buffer.from('RIFF0000WEBPclinic'), 'branch.png': Buffer.from('\x89PNG branch'), 'cover.webp': Buffer.from('RIFF0000WEBPcover') };
  for (const [n, b] of Object.entries(bytes)) fs.writeFileSync(path.join(fake, 'media', n), b);

  const r = fetchContent(site, { GHL_FAKE_DIR: fake });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /media {9}3 downloaded · 0 already in public\/media/);
  const clinicsFile = read(site, 'src/data/industries/ar/clinics.json');
  const img = JSON.parse(clinicsFile).img;
  assert.match(img, /^\/media\/ghl-[0-9a-f]{16}\.webp$/);
  assert.deepEqual(fs.readFileSync(path.join(site, 'public', img)), bytes['clinic-front.webp']);
  assert.equal(clinicsFile, JSON.stringify(JSON.parse(clinicsFile), null, 2) + '\n');
  const md = read(site, 'src/content/blog/en/reply-to-google-reviews.md');
  const png = md.match(/!\[A branch front\]\((\/media\/ghl-[0-9a-f]{16}\.png) "Branch"\)/);
  assert.ok(png, 'body image rewritten');
  assert.deepEqual(fs.readFileSync(path.join(site, 'public', png[1])), bytes['branch.png']);
  const cover = md.match(/^cover: "(\/media\/ghl-[0-9a-f]{16}\.webp)"$/m);
  assert.ok(cover, 'cover rewritten');
  assert.deepEqual(fs.readFileSync(path.join(site, 'public', cover[1])), bytes['cover.webp']);
  assert.doesNotMatch(md + clinicsFile, /leadconnectorhq|filesafe|googleapis/);

  const again = fetchContent(site, { GHL_FAKE_DIR: fake });
  assert.equal(again.status, 0, again.stderr);
  assert.match(again.stdout, /media {9}0 downloaded · 3 already in public\/media/);
  assert.match(again.stdout, /written {7}0 files changed/);
});

test('records that do not fit stop the build with the file and the field named, and nothing is written', () => {
  const site = copySite();
  const fake = tmp();
  exportFake(site, fake, { partSize: 1500 });
  const recs = readFake(fake, SITE_OBJECT);
  find(recs, (p) => p.content_key === 'home' && p.locale === 'en' && p.part === 1).properties.data = '{ "seo": ';
  recs.push({ ...recs[0], id: 'stray', properties: { ...recs[0].properties, content_key: 'pricing' } });
  writeFake(fake, SITE_OBJECT, recs);
  const docs = readFake(fake, DOCS_OBJECT);
  const post = find(docs, (p) => p.doc_type === 'blog' && p.locale === 'en' && p.slug === 'add-branch-google-maps' && p.part === 1);
  const fm = JSON.parse(post.properties.frontmatter);
  fm.coverAlt = '';
  fm.summary = 'x';
  post.properties.frontmatter = JSON.stringify(fm);
  find(docs, (p) => p.doc_type === 'blog' && p.locale === 'ar' && p.slug === 'remove-google-maps-review' && p.part === 1).properties.status = 'draft';
  find(docs, (p) => p.doc_type === 'legal' && p.locale === 'en' && p.slug === 'terms' && p.part === 2).properties.version = 2;
  writeFake(fake, DOCS_OBJECT, docs);
  const before = tree(path.join(site, 'src'));

  const r = fetchContent(site, { GHL_FAKE_DIR: fake });
  assert.equal(r.status, 1, r.stdout);
  for (const s of [
    'src/data/home/en.json', 'data: is not valid JSON',
    'content_key: "pricing" is not a content file of the website',
    'src/content/blog/en/add-branch-google-maps.md', 'frontmatter.coverAlt: is empty', 'frontmatter.summary: is not a front matter field of blog',
    'src/content/blog/ar/remove-google-maps-review.md', 'published in en but not in ar',
    'src/content/legal/en/terms.md', 'version: the parts have different versions (1, 2)',
    'nothing was written',
  ]) assert.ok(r.stderr.includes(s), `report names: ${s}\n${r.stderr}`);
  assert.deepEqual(tree(path.join(site, 'src')), before);
});

test('a missing site content record keeps the file in git and warns; an empty object stops the build', () => {
  const site = copySite();
  const fake = tmp();
  exportFake(site, fake);
  writeFake(fake, SITE_OBJECT, readFake(fake, SITE_OBJECT).filter((r) => r.properties.content_key !== 'settings'));
  const settings = read(site, 'src/data/settings.json');
  let r = fetchContent(site, { GHL_FAKE_DIR: fake });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /! src\/data\/settings\.json: no record for settings \(all\) in HighLevel, the file in git is used/);
  assert.equal(read(site, 'src/data/settings.json'), settings);

  writeFake(fake, DOCS_OBJECT, []);
  r = fetchContent(site, { GHL_FAKE_DIR: fake });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /custom_objects\.saayt_documents\n {4}· has no records/);
  assert.ok(fs.existsSync(path.join(site, 'src/content/legal/ar/privacy.md')));
});

test('keeps trying on 429 and 5xx, then stops after 6 tries without touching the files', () => {
  const site = copySite();
  const fake = tmp();
  exportFake(site, fake);
  const before = tree(path.join(site, 'src'));
  const r = fetchContent(site, { GHL_FAKE_DIR: fake, GHL_FAKE_FAIL: '429,500,502,503,504,500' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /HTTP 500 · Internal Server Error after 6 tries/);
  assert.equal((r.stdout.match(/trying again/g) || []).length, 5);
  assert.deepEqual(tree(path.join(site, 'src')), before);
});
