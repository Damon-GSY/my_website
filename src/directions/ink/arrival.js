// Arrival (assembly plan, chapter 0): the first visit of a session opens on the mark. A hairline of
// ink runs out of it along the wordmark's baseline, opens into a pill of moving ink around the name,
// and the pill widens until it fills the hero. That full-bleed ink is the hero's own ink layer (the
// same WebGL canvas, the same video frame), so there is no seam: the intro only clips the canvas
// (CSS clip-path) and writes the reveal mask (the trail canvas), and at the end the ink drains back
// into the mark through that mask, the way a cursor trail fades. About 2 s; any key, click, wheel,
// touch or scroll jumps to the final state. Home page only (InkHero `arrival`).

import { hasWebGL } from '../../engine/webgl.js';

const KEY = 'dg-arrival';
// ms to wait for the first video frame and the font before giving up; with END, the opening never
// takes more than 2.5 s from the hero's first paint
const WAIT = 600;
const END = 1900;
const EVENTS = ['keydown', 'pointerdown', 'wheel', 'touchstart', 'scroll'];
const clamp = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const out = (t) => 1 - (1 - t) ** 3;
const phase = (t, a, d) => clamp((t - a) / d);

// Should this load open with the arrival? Only on `/` at the top, once per tab session, with motion.
export function wantArrival() {
  try {
    if (!hasWebGL()) return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (location.pathname !== '/' || location.hash || window.scrollY > 1) return false;
    return sessionStorage.getItem(KEY) !== '1';
  } catch {
    return true;
  }
}

export function arrival(hero, canvas, scale) {
  const born = performance.now();
  let t0 = 0;
  let hold = -1; // verification: a fixed time to show
  const intro = { live: true, wipe: false, warp: 1 };
  hero.classList.add('is-go'); // the mark appears first

  const finish = () => {
    if (!intro.live) return;
    intro.live = false;
    intro.wipe = true; // the next frame clears the mask, so a skip lands on the final state at once
    intro.warp = 1;
    canvas.style.clipPath = '';
    hero.classList.remove('is-arriving', 'is-go', 'is-ui');
    EVENTS.forEach((e) => window.removeEventListener(e, finish, true));
  };
  EVENTS.forEach((e) =>
    window.addEventListener(e, finish, { capture: true, passive: true }),
  );
  hero.arrival = { seek: (ms) => (hold = ms), finish, get t() { return t0 ? performance.now() - t0 : -1; } };

  function measure() {
    const h = hero.getBoundingClientRect();
    const word = hero.querySelector('[data-word] span').getBoundingClientRect();
    const base = hero.querySelector('[data-baseline]').getBoundingClientRect().bottom - h.top;
    const fs = parseFloat(getComputedStyle(hero.querySelector('[data-word] span')).fontSize);
    // where InkHero places the mark (the full stop), computed the same way, so the first frames do
    // not depend on the stop having been placed yet
    const size = h.width < 480 ? 11 : 14;
    const sx = word.right - h.left + (h.width < 480 ? 3 : 6);
    const cap = fs * 0.72;
    const pad = cap * 0.2;
    const ph = cap + pad * 2; // pill height
    const mx = sx + size / 2;
    const my = base - size / 2;
    return {
      W: h.width,
      H: h.height,
      mx,
      my,
      top: base - cap - pad,
      bot: base + pad,
      left: Math.max(6, word.left - h.left - ph * 0.3),
      right: Math.min(h.width - 6, sx + size + ph * 0.3),
      line: h.width < 480 ? 0.75 : 1, // half the hairline
      ly: base + (h.width < 480 ? 2.5 : 3.5), // the hairline: just under the baseline, the mark sits on it
      ph,
      far: Math.max(Math.hypot(mx, my), Math.hypot(h.width - mx, my), Math.hypot(mx, h.height - my), Math.hypot(h.width - mx, h.height - my)),
    };
  }

  // Called by the ink loop once per frame, before the mask is uploaded.
  intro.paint = (tctx, trail, now, ready) => {
    const black = () => {
      tctx.globalCompositeOperation = 'source-over';
      tctx.fillStyle = '#000';
      tctx.fillRect(0, 0, trail.width, trail.height);
      tctx.globalCompositeOperation = 'lighter';
    };
    if (!intro.live) {
      if (intro.wipe) {
        intro.wipe = false;
        black();
      }
      return;
    }
    if (!t0) {
      if (ready && document.fonts.check('900 50px "Archivo Variable"')) {
        t0 = now;
        try {
          sessionStorage.setItem(KEY, '1');
        } catch {
          /* private mode */
        }
      } else {
        if (now - born > WAIT) finish();
        black();
        return;
      }
    }
    const t = hold >= 0 ? hold : now - t0;
    if (t >= END) {
      black();
      finish();
      return;
    }
    const g = measure(); // every frame: a scrollbar appearing or a phone's toolbar settling resizes the hero
    const { W, H, mx, my, ly, line } = g;
    if (t > 1560) hero.classList.add('is-ui');
    else hero.classList.remove('is-ui');
    tctx.globalCompositeOperation = 'source-over';
    if (t < 1350) {
      // the mask is full; the clip draws the shape: hairline -> pill around the name -> full bleed
      tctx.fillStyle = '#fff';
      tctx.fillRect(0, 0, trail.width, trail.height);
      const a = inOut(phase(t, 60, 400)); // the hairline runs left from the mark, along the baseline
      const b = inOut(phase(t, 400, 460)); // it opens into a pill around the name
      const c = inOut(phase(t, 820, 520)); // the pill widens to the edges
      let top = lerp(ly - line, g.top, b);
      let bot = lerp(ly + line, g.bot, b);
      let left = lerp(mx, g.left, a);
      let right = lerp(mx, g.right, b);
      top = lerp(top, 0, c);
      bot = lerp(bot, H, c);
      left = lerp(left, 0, c);
      right = lerp(right, W, c);
      const r = lerp(Math.max(line, (bot - top) / 2), 0, c ** 2);
      canvas.style.clipPath =
        a <= 0
          ? 'inset(50% 50%)'
          : `inset(${top.toFixed(1)}px ${(W - right).toFixed(1)}px ${(H - bot).toFixed(1)}px ${left.toFixed(1)}px round ${r.toFixed(1)}px)`;
    } else {
      // the ink drains back into the mark through the reveal mask (gooey edge from the ink shader)
      canvas.style.clipPath = '';
      const d = phase(t, 1370, END - 1390);
      const R = g.far * 1.08 * (1 - out(d) * 0.35 - d * 0.65) * scale;
      const s = R * 0.3 + 2;
      // the shader's noise warp (up to ~3% of the width) would make a small blob wobble around the mark:
      // it fades out as the ink closes in, so the last of it shrinks exactly onto the mark (polish pass)
      const rc = R / scale;
      intro.warp = clamp((rc - 16) / 300);
      tctx.fillStyle = '#000';
      tctx.fillRect(0, 0, trail.width, trail.height);
      if (R > 0.5) {
        const x = mx * scale;
        const y = my * scale;
        const grad = tctx.createRadialGradient(x, y, 0, x, y, R + s);
        grad.addColorStop(clamp((R - s) / (R + s)), '#fff');
        grad.addColorStop(1, '#000');
        tctx.fillStyle = grad;
        tctx.fillRect(0, 0, trail.width, trail.height);
      }
    }
    tctx.globalCompositeOperation = 'lighter';
  };
  intro.stop = finish;
  return intro;
}
