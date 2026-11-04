// Search dialog behaviour · loaded on first open (see SiteSearch.astro)
import { searchSite, type Hit } from './search-core';

/** Keep only text and <mark> from a Pagefind excerpt */
export function safeExcerpt(html: string): DocumentFragment {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const out = document.createDocumentFragment();
  const walk = (node: Node, into: Node) => {
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) into.appendChild(document.createTextNode(n.textContent || ''));
      else if (n.nodeType === 1 && (n as Element).tagName === 'MARK') { const m = document.createElement('mark'); walk(n, m); into.appendChild(m); }
      else if (n.nodeType === 1) walk(n, into);
    });
  };
  walk(tpl.content, out);
  return out;
}

const countText = (n: number, lang: string) => lang === 'en'
  ? `${n} ${n === 1 ? 'result' : 'results'}`
  : n === 1 ? 'نتيجة وحدة' : n === 2 ? 'نتيجتين' : n <= 10 ? `${n} نتائج` : `${n} نتيجة`;

export function mount(dlg: HTMLDialogElement) {
  const T = JSON.parse(dlg.dataset.t || '{}') as { loading: string; noneH: string; errorH: string; lang: string };
  const input = dlg.querySelector('input') as HTMLInputElement;
  const list = dlg.querySelector('[data-list]') as HTMLUListElement;
  const status = dlg.querySelector('[data-status]') as HTMLElement;
  const help = dlg.querySelector('[data-help]') as HTMLElement;
  const states = [...dlg.querySelectorAll<HTMLElement>('[data-state]')];
  const noneH = dlg.querySelector('[data-none-h]') as HTMLElement;

  const show = (state: 'empty' | 'none' | 'error' | 'results' | 'loading') => {
    states.forEach((s) => (s.hidden = s.dataset.state !== state));
    list.hidden = state !== 'results';
    help.hidden = state === 'results' || state === 'loading';
  };

  const render = (hits: Hit[], q: string) => {
    list.replaceChildren(...hits.map((h) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'srch__hit'; a.href = h.url;
      const t = document.createElement('b'); t.className = 'srch__t'; t.textContent = h.title;
      const s = document.createElement('span'); s.className = 'srch__sec'; s.textContent = h.section;
      const ex = document.createElement('p'); ex.className = 'srch__ex'; ex.appendChild(safeExcerpt(h.excerpt));
      a.append(t, s, ex); li.appendChild(a);
      return li;
    }));
    if (hits.length) { show('results'); status.textContent = countText(hits.length, T.lang); }
    else { noneH.textContent = T.noneH.replace('{q}', q); show('none'); status.textContent = noneH.textContent; }
  };

  let seq = 0;
  const run = async () => {
    const q = input.value.trim();
    const my = ++seq;
    if (!q) { list.replaceChildren(); show('empty'); status.textContent = ''; return; }
    status.textContent = T.loading;
    try {
      const hits = await searchSite(q, 8, 150);
      if (hits && my === seq) render(hits, q);
    } catch {
      if (my === seq) { show('error'); status.textContent = T.errorH; }
    }
  };
  input.addEventListener('input', run);
  dlg.querySelectorAll<HTMLButtonElement>('[data-q]').forEach((b) => b.addEventListener('click', () => { input.value = b.dataset.q || ''; input.focus(); run(); }));

  // keyboard: up and down move between the field and the results · Enter opens · typing returns to the field
  dlg.addEventListener('keydown', (e) => {
    const links = [...list.querySelectorAll<HTMLAnchorElement>('a')];
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === 'ArrowDown' && links.length) {
      e.preventDefault(); links[Math.min(i + 1, links.length - 1)].focus();
    } else if (e.key === 'ArrowUp' && i >= 0) {
      e.preventDefault(); if (i === 0) input.focus(); else links[i - 1].focus();
    } else if (e.key === 'Enter' && document.activeElement === input) {
      e.preventDefault(); if (links.length && !list.hidden) links[0].click();
    } else if (i >= 0 && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key.length === 1 || e.key === 'Backspace')) {
      input.focus();
    }
  });
  run();
}
