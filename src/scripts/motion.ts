// Site-wide motion: reveal on scroll, kashida underline, counters for UI mocks.
// Respects prefers-reduced-motion; content is visible without JS.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target as HTMLElement;
    const d = Number(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('in'), reduce ? 0 : d);
    el.dispatchEvent(new CustomEvent('reveal'));
    io.unobserve(el);
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
  if (reduce) { el.classList.add('in'); return; }
  io.observe(el);
});

// stagger children
document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((wrap) => {
  const step = Number(wrap.dataset.stagger || 90);
  [...wrap.children].forEach((c, i) => {
    const el = c as HTMLElement;
    el.setAttribute('data-reveal', '');
    el.dataset.delay = String(i * step);
    if (reduce) el.classList.add('in'); else io.observe(el);
  });
});

// magnetic arrow on buttons (the t-flag signpost nudges forward)
if (!reduce && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll<HTMLElement>('.btn').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width;
      const y = (e.clientY - r.top - r.height / 2) / r.height;
      b.style.transform = `translate(${x * 6}px, ${y * 4}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}
export {};
