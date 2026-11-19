// Phones (polish pass, 2026-11-18; edges pass, 2026-11-19): the receipt is taller than the screen, so
// its top has scrolled away by the time the stub prints. Once the printer lets go of the paper, the last
// stretch of scroll tears the stub off: the record above the tear line eases (scaled from its bottom
// edge) into a view of the whole of it, while the stub, the part you keep, stays at 1:1 so its links
// and Copy stay full-size tap targets. The stub's blank tail tucks into the slot. A pure function of
// scroll; the travelling mark follows the stamp's live rect. Desktop and reduced motion keep the
// full-size receipt. Returns a stop function.
const GAP = 14; // px between the record and the torn-off stub
const TOP = 12; // px kept clear above the record at the end

export default function overview(roll, paper) {
  const phone = window.matchMedia('(max-width: 760px)');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const printer = roll.querySelector('.cl-printer');
  const body = paper.querySelector('.cl-body');
  const stub = paper.querySelector('.cl-stub');
  const kept = [paper.querySelector('.cl-perf'), stub];
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
      const bh = body.offsetHeight;
      const tuck = Math.max(0, (parseFloat(getComputedStyle(stub).paddingBottom) || 0) - 12);
      const bottomAtEnd = r.top + paper.offsetTop + h - (max - y); // the paper's bottom edge at the end
      // the record's bottom edge at the end: above the kept part (1:1, lowered by the tuck) and the gap
      const room = bottomAtEnd + tuck - (h - bh) - GAP - TOP;
      const fit = Math.max(0.5, Math.min(1, room / bh));
      const u = max > letGo ? Math.min(1, Math.max(0, (y - letGo) / (max - letGo))) : 0;
      const e = u * u * (3 - 2 * u);
      if (fit < 1 && e > 0)
        next = `${(1 - (1 - fit) * e).toFixed(4)} ${e.toFixed(3)} ${((tuck - GAP) * e).toFixed(2)} ${(tuck * e).toFixed(2)}`;
    }
    if (next !== last) {
      last = next;
      const [scale, ov, lift, down] = next ? next.split(' ') : ['', '0', '0', '0'];
      body.style.transform = scale && `translateY(${lift}px) scale(${scale})`;
      for (const el of kept) el.style.transform = scale && `translateY(${down}px)`;
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
    body.style.transform = '';
    for (const el of kept) el.style.transform = '';
    roll.style.removeProperty('--ov');
  };
}
