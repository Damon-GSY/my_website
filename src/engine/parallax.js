// The home page's depth layer. An element with `data-pv="a b"` gets a custom property --pv that runs
// 0 -> 1 while the page scrolls from `a` to `b` viewport heights past the moment the element's top met
// the bottom of the viewport (`b` may be "end": as far as the page can scroll, or "cover": until the
// element has left at the top). Children read --pv in CSS (home.css, "depth") and move with transform
// and opacity only; --pv is inherited, so one timeline drives a whole opener.
//
// Since the assembly pass it does two things only, so it never competes with a chapter's own device:
// the hero's exit (its planes sink at different rates) and the one opener move every chapter shares
// (its ruled head and title rise in at their own rates).
//
// Native: a scroll-driven animation of --pv on a view() timeline (the range is set here, in px).
// Fallback (Safari): one passive scroll listener writes --pv from positions measured on resize.
// Off with reduced motion: nothing is added and every effect is written for `.pv-on` only.
// `data-pointer` elements also get --mx / --my (-1..1) from a fine pointer, for the hero.

const clamp = (v) => Math.min(1, Math.max(0, v));

export function startParallax(root) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const native = typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: view()');
  root.classList.add('pv-on', native ? 'pv-native' : 'pv-js');
  let items = [];
  let raf = 0;

  const measure = () => {
    const H = window.innerHeight;
    const y = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - H;
    items = [...root.querySelectorAll('[data-pv]')].map((el) => {
      const r = el.getBoundingClientRect();
      const top = r.top + y; // document position of the element's top
      const [as, bs] = el.dataset.pv.split(' ');
      const a = Number(as) * H;
      let b;
      if (bs === 'end') b = Math.max(a + 1, maxScroll + H - top - 1);
      else if (bs === 'cover') b = H + r.height;
      else b = Number(bs) * H;
      if (native) el.style.animationRange = `cover ${a.toFixed(0)}px cover ${b.toFixed(0)}px`;
      return { el, top, a, b, v: -1 };
    });
    update();
  };

  const update = () => {
    raf = 0;
    if (native) return;
    const H = window.innerHeight;
    const y = window.scrollY;
    for (const it of items) {
      const v = clamp((y + H - it.top - it.a) / (it.b - it.a));
      if (Math.abs(v - it.v) < 1e-4) continue;
      it.v = v;
      it.el.style.setProperty('--pv', v.toFixed(4));
    }
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  let mraf = 0;
  const onResize = () => {
    cancelAnimationFrame(mraf);
    mraf = requestAnimationFrame(measure);
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(document.body);
  window.addEventListener('resize', onResize);
  if (!native) window.addEventListener('scroll', onScroll, { passive: true });

  // pointer parallax (desktop only)
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const targets = fine ? [...root.querySelectorAll('[data-pointer]')] : [];
  let px = 0;
  let py = 0;
  let praf = 0;
  const onPointer = (e) => {
    px = (e.clientX / window.innerWidth) * 2 - 1;
    py = (e.clientY / window.innerHeight) * 2 - 1;
    if (!praf)
      praf = requestAnimationFrame(() => {
        praf = 0;
        targets.forEach((t) => {
          t.style.setProperty('--mx', px.toFixed(3));
          t.style.setProperty('--my', py.toFixed(3));
        });
      });
  };
  if (targets.length) window.addEventListener('pointermove', onPointer, { passive: true });

  measure();
  return () => {
    ro.disconnect();
    cancelAnimationFrame(raf);
    cancelAnimationFrame(mraf);
    cancelAnimationFrame(praf);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('pointermove', onPointer);
    root.classList.remove('pv-on', 'pv-native', 'pv-js');
  };
}
