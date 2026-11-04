// FAQ matching for the site assistant · no AI and no network
// Normalises Arabic (hamza forms, ta marbuta, alef maqsura, diacritics), strips light prefixes and suffixes,
// tolerates small typos and weighs rare words more than common ones
export type FaqItem = { q: string; a: string; tags: string[]; link?: string };
export type Match = { item: FaqItem; index: number; score: number };

const STOP = new Set([
  // Arabic (normalised)
  'هل', 'في', 'فيه', 'فيها', 'فيكم', 'من', 'على', 'عن', 'الى', 'او', 'و', 'ما', 'ماذا', 'كيف', 'وش', 'ايش', 'شو', 'هو', 'هي', 'انا', 'انت', 'انتم',
  'احنا', 'نحن', 'لو', 'اذا', 'يا', 'ابي', 'ابغى', 'ابغي', 'ودي', 'ممكن', 'عشان', 'مع', 'هذا', 'هذي', 'ذا', 'اللي', 'الي', 'لي', 'لكم', 'عندكم',
  'عندك', 'فيني', 'بس', 'طيب', 'لا', 'نعم', 'السلام', 'عليكم', 'مرحبا', 'هلا', 'سمحت', 'الله', 'يعطيك', 'العافيه', 'شكرا', 'ان', 'انه', 'كان',
  // English
  'a', 'an', 'the', 'is', 'are', 'am', 'do', 'does', 'did', 'can', 'could', 'i', 'you', 'it', 'its', 'my', 'your', 'to', 'of', 'for', 'in', 'on',
  'with', 'be', 'will', 'would', 'have', 'has', 'and', 'or', 'if', 'me', 'we', 'our', 'us', 'this', 'that', 'there', 'any', 'please', 'hi', 'hello',
  'what', 'whats', 'about', 'get', 'tell', 'how',
].map((w) => normalize(w)));

const PREFIXES = ['وال', 'بال', 'كال', 'فال', 'لل', 'ال'];
const SUFFIXES = ['يه', 'ات', 'ين', 'ون', 'ها', 'هم', 'كم', 'نا', 'ه', 'ي', 'ك'];

/** Lowercase, remove Arabic diacritics and tatweel, unify letter forms and digits, drop punctuation */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ٰٟۖ-ۭـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ء/g, '')
    .replace(/ک/g, 'ك').replace(/ی/g, 'ي')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

const isArabic = (w: string) => /[؀-ۿ]/.test(w);

/** Light stemming so «الأسعار» meets «أسعار» and «تجريبية» meets «التجريبيه» */
export function stem(w: string): string {
  if (isArabic(w)) {
    for (const p of PREFIXES) if (w.startsWith(p) && w.length - p.length >= 2) { w = w.slice(p.length); break; }
    if (w.length >= 5 && w.startsWith('و')) w = w.slice(1);
    for (const s of SUFFIXES) if (w.endsWith(s) && w.length - s.length >= 3) { w = w.slice(0, -s.length); break; }
    return w;
  }
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

/** Meaningful word stems of a text, in order, without stop words */
export function terms(s: string): string[] {
  return normalize(s).split(' ').filter((w) => w && !STOP.has(w)).map(stem).filter((w) => w && !STOP.has(w));
}

/** Edit distance with transpositions, stopping early once it passes max */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev2: number[] = []; let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v; if (v < best) best = v;
    }
    if (best > max) return max + 1;
    prev2.splice(0, prev2.length, ...prev); prev = cur;
  }
  return prev[b.length];
}

/** How well one query word matches one FAQ word (0 to 1) */
function wordScore(q: string, w: string): number {
  if (q === w) return 1;
  const short = Math.min(q.length, w.length);
  if (short >= 3 && (w.startsWith(q) || q.startsWith(w))) return 0.8;
  // Arabic words are short and dense so one wrong letter often makes another real word: allow typos on longer words only
  const ar = isArabic(q);
  const max = short >= (ar ? 9 : 8) ? 2 : short >= (ar ? 6 : 5) ? 1 : 0;
  if (max && distance(q, w, max) <= max) return 0.7;
  return 0;
}

type Indexed = { item: FaqItem; fields: { words: string[]; weight: number }[]; qWords: string[] };

export function buildIndex(items: FaqItem[]) {
  const docs: Indexed[] = items.map((item) => {
    const qWords = terms(item.q);
    return { item, qWords, fields: [
      { words: qWords, weight: 1 },
      { words: (item.tags || []).flatMap(terms), weight: 1 },
      { words: terms(item.a), weight: 0.35 },
    ] };
  });
  // rare words count more: document frequency over questions and tags
  const df = new Map<string, number>();
  docs.forEach((d) => new Set([...d.fields[0].words, ...d.fields[1].words]).forEach((w) => df.set(w, (df.get(w) || 0) + 1)));
  const idf = (w: string) => {
    let n = df.get(w);
    if (n === undefined) { for (const [k, v] of df) if (wordScore(w, k) >= 0.7) { n = Math.max(n ?? 0, v); } }
    return Math.log(1 + docs.length / (n || 1));
  };
  return { docs, idf };
}

/** Best FAQ matches for a visitor's words, highest first. score is 0 to about 1 */
export function match(index: ReturnType<typeof buildIndex>, text: string, limit = 3): Match[] {
  const qs = [...new Set(terms(text))];
  if (!qs.length) return [];
  const weights = qs.map(index.idf);
  const total = weights.reduce((a, b) => a + b, 0);
  const out: Match[] = index.docs.map((d, i) => {
    let got = 0; let strong = false;
    qs.forEach((q, k) => {
      let best = 0;
      for (const f of d.fields) for (const w of f.words) { const s = wordScore(q, w) * f.weight; if (s > best) best = s; }
      if (best >= 0.7) strong = true;
      got += best * weights[k];
    });
    const coverage = got / total;
    // share of the question's own words the visitor used (breaks ties toward the closest question)
    const qCover = d.qWords.length ? d.qWords.filter((w) => qs.some((q) => wordScore(q, w) >= 0.7)).length / d.qWords.length : 0;
    return { item: d.item, index: i, score: strong ? coverage * 0.8 + qCover * 0.2 : 0 };
  });
  return out.filter((m) => m.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Words worth sending to site search (stop words removed, original spelling kept) */
export function searchWords(text: string): string {
  return text.split(/[\s،,.؟?!:;«»"()]+/).filter((w) => { const n = normalize(w); return n && !STOP.has(n); }).join(' ');
}
