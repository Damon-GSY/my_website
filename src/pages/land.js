import { quiet } from '../engine/store.js';

// A fresh load of /#statement, /#work, /#evaluate, /#evidence or /#path: the browser's own jump to the
// anchor fired before the lazy home page had rendered, so the page opened at the top. Land on the
// chapter's head now, then again as fonts and the films around it lay out (a Deferred film above
// keeps its height in a placeholder, but late layout can still shift a few pixels), and stop correcting
// as soon as the visitor scrolls. (#notes and #contact land themselves: Notes and Close.)
export default function land(id) {
  const html = document.documentElement;
  const onTarget = () => {
    const el = document.getElementById(id);
    if (!el) return;
    const max = html.scrollHeight - window.innerHeight;
    const top = Math.min(max, Math.round(el.getBoundingClientRect().top + window.scrollY));
    if (Math.abs(top - window.scrollY) > 1) window.scrollTo({ top, behavior: 'instant' });
  };
  quiet(600); // the chapters above were not read on the way
  const raf = requestAnimationFrame(onTarget);
  const timers = [250, 700, 1500].map((ms) => window.setTimeout(onTarget, ms));
  const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  const stop = () => {
    cancelAnimationFrame(raf);
    timers.forEach((t) => window.clearTimeout(t));
    events.forEach((e) => window.removeEventListener(e, stop));
  };
  events.forEach((e) => window.addEventListener(e, stop, { passive: true }));
  return stop;
}
