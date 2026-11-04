// Site assistant panel · loaded when the browser is idle or on first click (see Assistant.astro)
// The conversation lives in memory only: nothing is stored, sent or tracked
import { buildIndex, match, searchWords, type FaqItem } from './faq-match';
import { searchSite, withBase, sectionOf, pageLang, type Hit } from './search-core';

const S = {
  ar: {
    name: 'مساعد صيت الآلي', sub: 'يجاوب آليًا من أسئلة الموقع الشائعة وما يحفظ محادثتك', close: 'إغلاق المساعد',
    greet: 'هلا · أنا مساعد صيت الآلي وأجاوب من أسئلة الموقع الشائعة · اختر سؤال أو اكتب سؤالك',
    starters: 'أسئلة شائعة', related: 'أسئلة قريبة', log: 'المحادثة', you: 'أنت', bot: 'المساعد',
    label: 'اكتب سؤالك', ph: 'اكتب سؤالك هنا', send: 'أرسل',
    more: 'التفاصيل في صفحة {page}', moreHome: 'التفاصيل في الصفحة الرئيسية', moreLink: 'افتح الرابط',
    fallback: 'ما عندي جواب جاهز لهذا السؤال · هذي صفحات من الموقع ممكن تفيدك',
    fallbackNone: 'ما عندي جواب جاهز لهذا السؤال ولا لقيت صفحة في الموقع تجاوبه',
    handWa: 'وتقدر تكلم فريق صيت على {wa} أو {demo}', handDemo: 'وتقدر {demo} ويجاوبك فريق صيت',
    waIn: 'واتساب', demoIn: 'تحجز عرضًا',
    wa: 'كلمنا على واتساب', demo: 'احجز عرضًا',
  },
  en: {
    name: 'SAAYT’s automatic assistant', sub: 'Answers from the site’s common questions and keeps no chat history', close: 'Close the assistant',
    greet: 'Hi · I’m SAAYT’s automatic assistant and I answer from the site’s common questions · pick one or type your own',
    starters: 'Common questions', related: 'Related questions', log: 'Conversation', you: 'You', bot: 'Assistant',
    label: 'Type your question', ph: 'Type your question', send: 'Send',
    more: 'More on the {page} page', moreHome: 'More on the home page', moreLink: 'Open the link',
    fallback: 'I don’t have a ready answer for that · these site pages may help',
    fallbackNone: 'I don’t have a ready answer for that and found no page about it',
    handWa: 'You can also reach the SAAYT team on {wa} or {demo}', handDemo: 'You can also {demo} and the SAAYT team will answer you',
    waIn: 'WhatsApp', demoIn: 'book a demo',
    wa: 'Chat on WhatsApp', demo: 'Book a demo',
  },
};
const ANSWER = 0.5;   // best match needed to answer from the FAQ
const RELATED = 0.32; // weaker matches offered as related questions

const svg = (d: string, size = 20) => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('width', String(size)); s.setAttribute('height', String(size)); s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2');
  s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = d; return s;
};
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) => {
  const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e;
};

export async function mount(root: HTMLElement, launcher: HTMLButtonElement) {
  const lang = pageLang();
  const T = S[lang];
  const faq: FaqItem[] = (lang === 'en' ? await import('../data/faq.en.json') : await import('../data/faq.ar.json')).default as FaqItem[];
  const index = buildIndex(faq);
  const wa = root.dataset.wa || '';
  const demo = root.dataset.demo || withBase(lang === 'en' ? '/en/demo/' : '/demo/');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // panel
  const panel = el('div', 'ast__panel'); panel.id = 'ast-panel'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'ast-t'); panel.setAttribute('aria-describedby', 'ast-s');
  const head = el('div', 'ast__head');
  const av = el('span', 'ast__av'); av.setAttribute('aria-hidden', 'true');
  av.appendChild(svg('<path d="M12 3c0 4.5 4.5 9 9 9-4.5 0-9 4.5-9 9 0-4.5-4.5-9-9-9 4.5 0 9-4.5 9-9z" fill="currentColor" stroke="none"/>', 18));
  const titles = el('div'); const h = el('h2', '', T.name); h.id = 'ast-t'; const sub = el('p', '', T.sub); sub.id = 'ast-s'; titles.append(h, sub);
  const x = el('button', 'ast__x'); x.type = 'button'; x.setAttribute('aria-label', T.close); x.appendChild(svg('<path d="M6 6l12 12M18 6 6 18"/>'));
  head.append(av, titles, x);
  const log = el('div', 'ast__log'); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite'); log.setAttribute('aria-label', T.log); log.tabIndex = 0;
  const form = el('form', 'ast__form'); form.noValidate = true;
  const lbl = el('label', 'sr-only', T.label); lbl.htmlFor = 'ast-q';
  const input = el('input'); input.id = 'ast-q'; input.type = 'text'; input.autocomplete = 'off'; input.maxLength = 200; input.placeholder = T.ph; input.enterKeyHint = 'send';
  const send = el('button', 'ast__send'); send.type = 'submit'; send.setAttribute('aria-label', T.send); send.appendChild(svg('<path d="M5 12h14M13 6l6 6-6 6"/>'));
  form.append(lbl, input, send);
  const acts = el('div', 'ast__acts');
  if (wa) { const a = el('a', 'btn btn--light-ghost', T.wa); a.href = wa; a.target = '_blank'; a.rel = 'noopener'; acts.appendChild(a); }
  const d = el('a', 'btn btn--dark', T.demo); d.href = demo; acts.appendChild(d);
  panel.append(head, log, form, acts);
  root.appendChild(panel);

  const scroll = () => log.scrollTo({ top: log.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  const bubble = (who: 'bot' | 'me', text: string) => {
    const m = el('div', `ast__m ast__m--${who}`);
    m.append(el('span', 'sr-only', `${who === 'me' ? T.you : T.bot}: `), el('p', '', text));
    return m;
  };
  const chips = (title: string, items: { item: FaqItem }[]) => {
    const wrap = el('div', 'ast__chips'); wrap.setAttribute('role', 'group'); wrap.setAttribute('aria-label', title);
    wrap.appendChild(el('p', '', title));
    items.forEach(({ item }) => {
      const b = el('button', 'ast__chip', item.q); b.type = 'button';
      b.addEventListener('click', () => ask(item.q, item));
      wrap.appendChild(b);
    });
    return wrap;
  };
  const moreLink = (link: string) => {
    const a = el('a', 'ast__more'); a.href = withBase(link);
    if (/^https?:/.test(link)) { a.textContent = T.moreLink; a.target = '_blank'; a.rel = 'noopener'; return a; }
    const sec = sectionOf(link, lang);
    a.textContent = sec === sectionOf('/', lang) ? T.moreHome : T.more.replace('{page}', sec);
    return a;
  };
  const handoff = () => {
    const p = el('p', 'ast__hand');
    const tpl = wa ? T.handWa : T.handDemo;
    tpl.split(/(\{wa\}|\{demo\})/).forEach((part) => {
      if (part === '{wa}') { const a = el('a', '', T.waIn); a.href = wa; a.target = '_blank'; a.rel = 'noopener'; p.appendChild(a); }
      else if (part === '{demo}') { const a = el('a', '', T.demoIn); a.href = demo; p.appendChild(a); }
      else if (part) p.appendChild(document.createTextNode(part));
    });
    return p;
  };

  const answer = (item: FaqItem, related: { item: FaqItem }[]) => {
    const m = bubble('bot', item.a);
    if (item.link) m.appendChild(moreLink(item.link));
    if (related.length) m.appendChild(chips(T.related, related));
    log.appendChild(m);
  };

  const fallback = async (text: string, related: { item: FaqItem }[]) => {
    const words = searchWords(text) || text;
    let hits: Hit[] = [];
    try {
      hits = (await searchSite(words, 3)) ?? [];
      if (!hits.length && words.includes(' ')) {
        for (const w of words.split(' ').sort((a, b) => b.length - a.length).slice(0, 3)) {
          hits = (await searchSite(w, 3)) ?? [];
          if (hits.length) break;
        }
      }
    } catch { hits = []; }
    const m = bubble('bot', hits.length ? T.fallback : T.fallbackNone);
    if (hits.length) {
      const ul = el('ul', 'ast__hits');
      hits.forEach((hit) => {
        const li = el('li'); const a = el('a'); a.href = hit.url;
        a.append(el('b', '', hit.title), el('small', '', hit.section));
        li.appendChild(a); ul.appendChild(li);
      });
      m.appendChild(ul);
    }
    m.appendChild(handoff());
    if (related.length) m.appendChild(chips(T.related, related));
    log.appendChild(m);
  };

  let busy = false;
  async function ask(text: string, picked?: FaqItem) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    log.appendChild(bubble('me', text)); scroll();
    try {
      if (picked) {
        answer(picked, match(index, picked.q, 3).filter((r) => r.item !== picked && r.score >= RELATED).slice(0, 2));
      } else {
        const found = match(index, text, 3);
        const best = found[0];
        if (best && best.score >= ANSWER) answer(best.item, found.slice(1).filter((r) => r.score >= RELATED).slice(0, 2));
        else await fallback(text, found.filter((r) => r.score >= RELATED).slice(0, 2));
      }
    } finally { busy = false; }
    scroll();
  }

  // first message
  const hello = bubble('bot', T.greet);
  hello.appendChild(chips(T.starters, faq.slice(0, 4).map((item) => ({ item }))));
  log.appendChild(hello);

  form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; ask(v); });

  const open = () => {
    panel.hidden = false; root.classList.add('is-open'); launcher.setAttribute('aria-expanded', 'true');
    input.focus({ preventScroll: true }); scroll();
  };
  const close = (focusBack = true) => {
    panel.hidden = true; root.classList.remove('is-open'); launcher.setAttribute('aria-expanded', 'false');
    if (focusBack) launcher.focus();
  };
  x.addEventListener('click', () => close());
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); close(); } });
  return { toggle: () => (panel.hidden ? open() : close()) };
}
