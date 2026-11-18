// Phones (polish pass, 2026-11-18): the receipt is taller than the screen, so its top has scrolled away
// by the time the stub prints. Once the printer lets go of the paper, the last stretch of scroll eases
// the paper (scaled from its bottom edge, which stays on the printer; close.css) into a view of the whole
// receipt by the page's end. A pure function of scroll; the travelling mark follows the stamp's live
// rect. Desktop and reduced motion keep the full-size receipt. Returns a stop function.
export default function overview(roll, paper) {
  const phone = window.matchMedia('(max-width: 760px)');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const printer = roll.querySelector('.cl-printer');
  let raf = 0;
  let last = '';
  const apply = () => {
    raf = 0;
    let next = '';
    if (phone.matches && !still.matches) {
      const H = window.innerHeight;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - H;
      const r = roll.getBoundingClientRect();
      const below = parseFloat(getComputedStyle(printer).bottom) || 0;
      const letGo = r.bottom + y - (H - below); // the roll's end reaches the printer's sticky place
      const h = paper.offsetHeight;
      const bottomAtEnd = r.top + paper.offsetTop + h - (max - y); // the paper's bottom edge at the end
      const fit = Math.max(0.6, Math.min(1, (bottomAtEnd - 14) / h));
      const u = max > letGo ? Math.min(1, Math.max(0, (y - letGo) / (max - letGo))) : 0;
      const e = u * u * (3 - 2 * u);
      if (fit < 1 && e > 0) next = `${(1 - (1 - fit) * e).toFixed(4)} ${e.toFixed(3)}`;
    }
    if (next !== last) {
      last = next;
      const [scale, ov] = next ? next.split(' ') : ['', '0'];
      paper.style.transform = scale && `scale(${scale})`;
      roll.style.setProperty('--ov', ov); // the slot's developing fade goes as the paper eases off
    }
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };
  const ro = new ResizeObserver(kick);
  ro.observe(document.body);
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  apply();
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener('scroll', kick);
    window.removeEventListener('resize', kick);
    paper.style.transform = '';
  };
}
