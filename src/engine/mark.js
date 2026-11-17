import { visit } from './store.js';

// The mark: one magenta dot that travels the home page as the visitor's thread (assembly plan §4).
//
// Every chapter exposes `[data-mark="name"]` targets ("docks"), in document order. Each dock has an
// activation a(scroll) in [0, 1]: 0 before the mark is handed to it, 1 once it holds it. The mark's
// position is the fold   pos = dock0;  pos = curve(pos, dock_k, ease(a_k))  over all docks, so it is a
// pure function of the scroll position (plus the docks' live rects): exactly reversible, never behind
// its dock, and continuous even if two hand-offs overlap.
//
// Activation:
// - default: by where the dock sits in the viewport. The hand-off starts when the dock comes within
//   ~92% of the viewport height, or earlier, when the previous dock is about to leave at the top; it
//   lands as the dock reaches ~60% (a dock that never gets that high lands at the end of the page);
// - `data-mark-in="from to"` inside a `[data-mark-track]`: by viewports scrolled into that track, for
//   docks that live in a pinned film (they do not move while pinned).
//
// Kinds (`data-mark-kind`):
// - "glyph" (default) and "dot": the dock is the chapter's own glyph (a full stop, a "1", a dagger, an
//   "@", a bullet). At rest the travelling dot fades out and the glyph turns magenta (CSS reads --mk).
// - "gl": the chapter draws the mark itself (the WebGL sticker). The dot stays fully visible until it
//   lands, then hides at the same pixel while the dock gets a `markdock` event; `data-mark-vis="1"` on
//   the dock asks for the dot back (the film sets it once the sticker has peeled off).
//
// Not started with reduced motion or without WebGL: each target then simply shows its own magenta glyph.

const BASE = 40; // px; the dot is drawn at this size and scaled
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a, b, t) => a + (b - a) * t;

function activation(el, r, H, maxScroll, prevY) {
  const spec = el.dataset.markIn;
  const track = spec && el.closest('[data-mark-track]');
  if (track) {
    const [from, to] = spec.split(' ').map(Number);
    const u = -track.getBoundingClientRect().top / H;
    return smooth(clamp((u - from) / (to - from)));
  }
  const y = r.top + r.height / 2;
  const atEnd = y + window.scrollY - maxScroll; // where the dock sits once the page is at its end
  const land = Math.max(H * 0.6, atEnd + 1);
  if (y <= land) return 1;
  // scroll travelled since the hand-off began (the target entering, or the previous dock leaving)
  const gone = Math.max(land + H * 0.32 - y, H * 0.15 - prevY);
  if (gone <= 0) return 0;
  return smooth(gone / (gone + y - land));
}

// While a hand-off runs between docks that are off screen, the dot waits in the left margin, at the
// nearest edge of the viewport, instead of leaving with them.
function inView(p, H, lane) {
  const y = clamp(p.y, H * 0.1, H * 0.9);
  const o = clamp(Math.abs(p.y - y) / (H * 0.15));
  return { x: lerp(p.x, lane, o), y, size: lerp(p.size, 12, o), o };
}

// Opacity along one hand-off: leaves the previous dock's look, is a dot in flight, takes the next one's.
function segOpacity(prev, vis, t, kind) {
  if (t <= 0) return prev;
  if (t >= 1) return vis;
  const a = smooth(clamp(t / 0.18));
  const b = kind === 'gl' ? 0 : smooth(clamp((t - 0.82) / 0.18));
  return lerp(lerp(prev, 1, a), vis, b);
}

export function startMark() {
  const html = document.documentElement;
  const dot = document.createElement('div');
  dot.className = 'h-mark';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  html.classList.add('mark-live');

  let raf = 0;
  let idle = 0;
  const glOn = new WeakMap();
  const lastMk = new WeakMap();
  const state = { x: 0, y: 0, size: 0, opacity: 0, docks: [] };
  dot.markState = state; // read by the verification scripts

  function frame() {
    const H = window.innerHeight;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - H);
    const docks = [];
    for (const el of document.querySelectorAll('[data-mark]')) {
      const r = el.getBoundingClientRect();
      if (r.width < 0.5 || r.height < 0.5) continue; // not mounted / not laid out yet
      const kind = el.dataset.markKind || 'glyph';
      const fy = Number(el.dataset.markY || 0.5);
      const ratio = Number(el.dataset.markR || 0.5);
      const size = kind === 'glyph' ? Math.min(30, Math.min(r.width, r.height) * ratio) : r.width;
      const vis = kind === 'gl' ? (el.dataset.markVis === '1' ? 1 : 0) : 0;
      docks.push({ el, kind, x: r.left + r.width / 2, y: r.top + r.height * fy, size, vis, r });
    }
    if (!docks.length) {
      dot.style.opacity = '0';
      return;
    }
    const pad = document.querySelector('.h-section');
    const lane = pad ? Math.max(8, parseFloat(getComputedStyle(pad).paddingLeft) / 2) : 12;
    let { x, y, size, vis: op } = docks[0];
    const acts = docks.map((d, k) => (k === 0 ? 1 : activation(d.el, d.r, H, maxScroll, docks[k - 1].y)));
    for (let k = 1; k < docks.length; k += 1) {
      const d = docks[k];
      const t = acts[k];
      if (t <= 0) continue;
      if (t >= 1) {
        // landed: exactly on the dock, wherever it is (a film may carry it to the edge)
        ({ x, y, size } = d);
        op = d.vis;
        continue;
      }
      const e = ease(t);
      const a = inView({ x, y, size }, H, lane);
      const b = inView(d, H, lane);
      // a gentle bow, alternating sides, so the dot arcs between docks instead of sliding
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const bow = Math.min(160, len * 0.18) * Math.sin(Math.PI * e) * (k % 2 ? 1 : -1) * (1 - Math.max(a.o, b.o));
      x = lerp(a.x, b.x, e) + (-dy / len) * bow;
      y = lerp(a.y, b.y, e) + (dx / len) * bow;
      size = lerp(a.size, b.size, e);
      op = segOpacity(op, d.vis, t, d.kind);
    }
    // how much each dock currently holds the mark
    let rest = 1;
    const names = [];
    for (let k = docks.length - 1; k >= 0; k -= 1) {
      const w = acts[k] * rest;
      rest *= 1 - acts[k];
      const d = docks[k];
      if (w > 0.5) names.push(d.el.dataset.mark);
      if (d.kind === 'gl') {
        const on = w >= 1;
        if (glOn.get(d.el) !== on) {
          glOn.set(d.el, on);
          d.el.dispatchEvent(new CustomEvent('markdock', { detail: on }));
        }
      } else {
        const mk = smooth(clamp((w - 0.75) / 0.25)).toFixed(3);
        if (lastMk.get(d.el) !== mk) {
          lastMk.set(d.el, mk);
          d.el.style.setProperty('--mk', mk);
        }
      }
    }
    names.forEach(visit);
    Object.assign(state, {
      x,
      y,
      size,
      opacity: op,
      docks: docks.map((d, k) => ({ name: d.el.dataset.mark, x: d.x, y: d.y, size: d.size, act: acts[k] })),
    });
    dot.style.transform = `translate3d(${(x - BASE / 2).toFixed(2)}px, ${(y - BASE / 2).toFixed(2)}px, 0) scale(${(size / BASE).toFixed(4)})`;
    dot.style.opacity = op.toFixed(3);
  }

  // Runs while something moves (scroll, resize, a film settling), then rests.
  const loop = () => {
    frame();
    idle -= 1;
    raf = idle > 0 ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => {
    idle = 90;
    if (!raf) raf = requestAnimationFrame(loop);
  };
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  document.addEventListener('markmove', kick);
  const ro = new ResizeObserver(kick);
  ro.observe(document.body);
  kick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', kick);
    window.removeEventListener('resize', kick);
    document.removeEventListener('markmove', kick);
    ro.disconnect();
    dot.remove();
    html.classList.remove('mark-live');
  };
}
