import { nav, norm } from './nav.js';
import './nav.css';

// The page change (src/engine/nav.js decides when; this is how it looks). The mark is the thread: the
// magenta dot leaves the old page from wherever it is docked (the hero's full stop, the /lab title's
// full stop, the 404's lamp, the /short bar's dot, a note's pin, or the travelling mark mid-run) and
// flies to its dock on the new page, while the old page lifts away and the new one opens with the
// site's opener move: the head's rule draws, the label and the title rise.
//
// - View Transitions where the browser has them: a stand-in dot (`.nav-mark`) is named `mark` and the
//   bars `chrome`, so the bar holds still between the pages around the run while the rest cross-fades.
//   The stand-in is moved every frame towards the new page's mark as it is *now* (a page that lands
//   on a chapter, or settles its layout, moves its mark while the dot is in the air).
// - Elsewhere the same stand-in flies over a quick fade of the old page out and the new one in.
// - Reduced motion: the page changes at once. Input is never held: the transition's layer lets
//   pointer events through, and the next click simply starts the next page change.
// Under 600 ms either way. Focus moves to the new page's heading, and the new title is announced.

const FLY = 520; // ms, the dot in the air
const OUT = 150; // ms, fallback: the old page fading out before the swap
const BASE = 40; // px, the stand-in is drawn at this size and scaled
const html = document.documentElement;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The pages' own marks (src/pages/around/around.css, src/chapters/notes/notes.css), then the run's docks.
const DOCKS = '.lab-stop, .nf-light, .sh-mark, .nt-page .nt-pin, [data-mark]';

// Where the mark is now, in viewport pixels: { x, y, size }, or null if no mark is on screen.
export function markNow() {
  const H = window.innerHeight;
  const W = window.innerWidth;
  const on = (x, y) => x > -20 && x < W + 20 && y > -20 && y < H + 20;
  const docks = [...document.querySelectorAll(DOCKS)].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width >= 1 && r.height >= 1; // laid out (a page that is leaving is display: none)
  });
  // the run's travelling mark (src/engine/mark.js): its computed state, wherever it is (dock or flight)
  const s = document.querySelector('.h-mark')?.markState;
  if (s?.docks?.length && s.size > 0 && on(s.x, s.y) && docks.some((el) => el.matches('[data-mark]')))
    return { x: s.x, y: s.y, size: s.size };
  for (const el of docks) {
    const r = el.getBoundingClientRect();
    const kind = el.dataset.markKind;
    const glyph = el.matches('[data-mark]') && (!kind || kind === 'glyph');
    const x = r.left + r.width / 2;
    const y = r.top + r.height * Number(el.dataset.markY || 0.5);
    if (!on(x, y)) continue;
    const size = glyph ? Math.min(30, Math.min(r.width, r.height) * Number(el.dataset.markR || 0.5)) : Math.min(r.width, r.height);
    return { x, y, size: Math.max(6, size) };
  }
  return null;
}

let say = null;
function announce(hash) {
  if (!say) {
    say = document.createElement('p');
    say.className = 'nav-say';
    say.setAttribute('role', 'status');
    say.setAttribute('aria-live', 'polite');
    document.body.appendChild(say);
  }
  say.textContent = '';
  // after the new page has set its title; a link into a chapter adds its name ("(02) Work"), waiting a
  // moment for a chapter whose head lives in a film that mounts just after
  let tries = 0;
  const speak = () => {
    const head = hash && document.getElementById(hash)?.querySelector('.h-head');
    if (hash && !head && (tries += 1) < 6) return window.setTimeout(speak, 150);
    const title = document.title.replace(/\s+—\s+Damon Guan$/, '');
    const chapter = head && [...head.querySelectorAll('.h-num, .h-label')].map((el) => el.textContent).join(' ');
    say.textContent = chapter ? `${title}, ${chapter}` : title;
  };
  window.setTimeout(speak, 80);
}

function focusHeading(hash) {
  const scope = (hash && document.getElementById(hash)) || null;
  const el = scope
    ? scope.querySelector('h1, h2, .h-display') || scope
    : document.querySelector('#root main h1, #root h1');
  if (!el) return;
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.setAttribute('data-nav-focus', '');
  el.focus({ preventScroll: true });
}

// The site's opener move on the new page's first screen: the head's rule draws left to right, its
// label and the title rise. Individual `translate`, so it composes with the pages' own transforms.
function opener(hash) {
  const scope = (hash && document.getElementById(hash)) || document.querySelector('#root main') || document.getElementById('root');
  if (!scope) return;
  const H = window.innerHeight;
  const seen = (el) => {
    const r = el.getBoundingClientRect();
    return r.height > 0 && r.bottom > 0 && r.top < H;
  };
  const rise = (el, delay, dy = '0.5em', dur = 460) =>
    el.animate([{ translate: `0 ${dy}`, opacity: 0 }, { translate: '0 0', opacity: 1 }], {
      duration: dur,
      delay,
      easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
      fill: 'backwards',
    });
  const head = [...scope.querySelectorAll('.ar-head, .h-head, .nt-sheet .h-head')].find(seen);
  if (head) {
    head.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], {
      duration: 420,
      easing: 'cubic-bezier(0.6, 0, 0.2, 1)',
      fill: 'backwards',
    });
    [...head.children].forEach((c, i) => rise(c, 60 + i * 40, '0.9em', 380));
  }
  // (not the hero's wordmark: the ink canvas draws it from the DOM word's position)
  const title = [...scope.querySelectorAll('h1:not(.ink-word), h2.h-display, .lab-lede, .nf-ways')].filter(seen).slice(0, 2);
  title.forEach((el, i) => rise(el, 90 + i * 70, '22px', 480));
  // the home page's first screen has no head: its corners come in instead
  if (!head && !title.length) [...scope.querySelectorAll('.ink-ui')].forEach((el, i) => rise(el, 60 + i * 50, '12px', 420));
}

function standIn(at) {
  const dot = document.createElement('i');
  dot.className = 'nav-mark';
  dot.setAttribute('aria-hidden', 'true');
  const put = (p, o = 1) => {
    dot.style.transform = `translate3d(${(p.x - BASE / 2).toFixed(2)}px, ${(p.y - BASE / 2).toFixed(2)}px, 0) scale(${(p.size / BASE).toFixed(4)})`;
    dot.style.opacity = String(o);
  };
  put(at || { x: -99, y: -99, size: 1 }, at ? 1 : 0);
  document.body.appendChild(dot);
  return { dot, put };
}

// Fly the stand-in from `a` to the new page's mark (read every frame). Without an old mark it grows in
// at the new one; without a new mark it shrinks away where it was.
function fly(put, a, ms, alive) {
  return new Promise((done) => {
    const t0 = performance.now();
    const k = window.__navSlow || 1; // verification: slow motion (with the CSS animations' playback rate)
    let b = null;
    const step = () => {
      const now = performance.now();
      if (!alive()) return done();
      const t = clamp((now - t0) / (ms * k), 0, 1);
      b = markNow() || b;
      if (!a && !b) {
        if (t >= 1) return done();
        return requestAnimationFrame(step);
      }
      const e = ease(t);
      if (!a) put({ ...b, size: b.size * ease(clamp(t * 1.6 - 0.3, 0, 1)) }, 1);
      else if (!b) put({ ...a, size: a.size * (1 - e) }, 1 - e);
      else {
        // an arc, bowed upward, the dot a little larger while it is in the air (lifted off the page)
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        let nx = -dy / len;
        let ny = dx / len;
        if (ny > 0) {
          nx = -nx;
          ny = -ny;
        }
        const bow = Math.min(150, len * 0.22) * Math.sin(Math.PI * e);
        const lift = 1 + 0.45 * Math.sin(Math.PI * e) * Math.min(1, len / 300);
        put({ x: lerp(a.x, b.x, e) + nx * bow, y: lerp(a.y, b.y, e) + ny * bow, size: lerp(a.size, b.size, e) * lift });
      }
      if (t >= 1) return done();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

let live = null; // the running page change: { skip() }

// A chapter that draws the mark itself (the Work film's sticker, `data-mark-kind="gl"`) hears from
// mark.js when the mark lands on it (`markdock`). While the dot is in the air the sticker stays off, or
// there would be two marks; mark.js's last word is passed on when the dot lands.
const said = new Map();
const mine = new WeakSet();
function hush(e) {
  if (mine.has(e)) return;
  said.set(e.target, e.detail);
  e.stopImmediatePropagation();
}
function holdDocks(on) {
  if (on) {
    document.addEventListener('markdock', hush, true);
    for (const el of document.querySelectorAll('[data-mark-kind="gl"]')) {
      const e = new CustomEvent('markdock', { detail: false });
      mine.add(e);
      el.dispatchEvent(e);
    }
    return;
  }
  document.removeEventListener('markdock', hush, true);
  for (const [el, detail] of said) if (el.isConnected) el.dispatchEvent(new CustomEvent('markdock', { detail }));
  said.clear();
}

// A position to come back to: the element with an id at the top of the window and how far past it the
// page was, besides the raw offset. Films above it mount later than placeholders of not quite their
// height, so the element keeps the visitor on what they were reading, not on a pixel count.
function anchorOf() {
  const y = window.scrollY;
  let best = null;
  for (const el of document.querySelectorAll('#root main > [id], #root main > * > [id]')) {
    const top = el.getBoundingClientRect().top;
    if (el.offsetParent && top <= 1 && (!best || top > best.top)) best = { id: el.id, top };
  }
  return best ? { y, a: best.id, o: Math.round(-best.top) } : y;
}
function posOf(v) {
  const el = v?.a && document.getElementById(v.a);
  return el ? el.getBoundingClientRect().top + window.scrollY + v.o : v?.y ?? v;
}

// Back / Forward within one page, to an entry the browser left to us (src/engine/nav.js)
export function same() {
  const y = posOf(nav.ys[window.history.state?.navKey]);
  const el = y == null && document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  if (el) el.scrollIntoView();
  else window.scrollTo({ top: y || 0, behavior: 'instant' });
}

// The new page in the DOM, scrolled where it belongs: a restored position (Back / Forward), the
// chapter a link names (/#work), or the top.
function commitTo(url, key, pop) {
  const h = window.history;
  const { route } = nav;
  const leaving = pop ? nav.here : nav.entry();
  if (leaving) nav.ys[leaving] = anchorOf();
  const saved = pop ? nav.ys[h.state?.navKey] : null;
  h.scrollRestoration = 'manual';
  if (!pop) {
    h.pushState({ navKey: Math.random().toString(36).slice(2, 10) }, '', url.href);
    // the case and note stores read the URL on popstate: let them see this one before the page mounts
    window.dispatchEvent(new PopStateEvent('popstate', { state: h.state }));
  }
  // a restored position wins over the page's own landing on its #chapter (it reads the hash on mount)
  const strip = saved != null && url.hash;
  if (strip) h.replaceState(h.state, '', url.pathname + url.search);
  // the old page stays mounted, hidden, until the change is over (release): its canvas is still in the
  // transition's picture of it, and losing a GPU context is slow enough to stall the first frame
  nav.set({ key, path: norm(url.pathname), keep: route.key ? { key: route.key, path: route.path } : null });
  if (strip) h.replaceState(h.state, '', url.href);
  let y = posOf(saved);
  if (y == null) {
    const el = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
    y = el ? el.getBoundingClientRect().top + window.scrollY : 0;
  }
  window.scrollTo({ top: Math.round(y), behavior: 'instant' });
}

// the old page lets go (its GL context, its mark, its listeners)
function release(id) {
  if (id !== nav.seq || !nav.route.keep) return;
  nav.set({ ...nav.route, keep: null });
  window.history.scrollRestoration = 'manual'; // a page may put back its own setting on unmount
}

export async function go(url, key, pop, id) {
  // Back / Forward: after the other popstate listeners (the case and note stores) have read the URL
  if (pop) await new Promise((r) => window.setTimeout(r, 0));
  await nav.api.load(key);
  if (id !== nav.seq) return;
  await move({ commit: () => commitTo(url, key, pop), hash: decodeURIComponent(url.hash.slice(1)), key, id });
  release(id);
  if (id !== nav.seq) return;
  nav.rec = true;
  nav.ys[(nav.here = nav.entry())] = window.scrollY; // where this entry was, even if never scrolled
}

async function move({ commit, hash, key, id }) {
  live?.skip();
  const alive = () => nav.seq === id;
  // the old page's mark; with none on screen, the dot leaves from the link that was pressed
  const at = nav.at && { x: clamp(nav.at.x, 12, window.innerWidth - 12), y: clamp(nav.at.y, 12, window.innerHeight - 12), size: 10 };
  const from = markNow() || at;
  if (key === 'home') {
    try {
      window.sessionStorage.setItem('dg-arrival', '1'); // the run's arrival intro is for a first load
    } catch {
      /* ignore */
    }
  }
  const after = () => {
    focusHeading(hash);
    announce(hash);
  };

  if (reduced()) {
    commit();
    after();
    return;
  }

  html.classList.add('nav-run');
  holdDocks(true);
  const { dot, put } = standIn(from);
  const end = () => {
    dot.remove();
    if (!alive()) return;
    html.classList.remove('nav-run');
    holdDocks(false);
  };

  if (document.startViewTransition && window.__navVT !== false) {
    const vt = document.startViewTransition(() => {
      commit();
      opener(hash);
    });
    live = {
      skip: () => {
        vt.skipTransition();
        dot.remove(); // one `mark` at a time: the next page change names its own
      },
    };
    vt.updateCallbackDone.then(after, after);
    try {
      await vt.ready;
      await fly(put, from, FLY, alive);
    } catch {
      /* skipped */
    }
    await vt.finished.catch(() => {});
    end();
    return;
  }

  // no View Transitions: fade the old page out under the dot, swap, fade the new one in
  const root = document.getElementById('root');
  let stop = false;
  live = {
    skip: () => {
      stop = true;
      dot.remove();
    },
  };
  await root
    .animate([{ opacity: 1 }, { opacity: 0, translate: '0 -10px' }], { duration: OUT, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' })
    .finished.catch(() => {});
  if (!stop) {
    commit();
    root.getAnimations().forEach((an) => an.cancel());
    root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
    opener(hash);
    after();
    await fly(put, from, FLY - OUT + 80, () => alive() && !stop);
  } else root.getAnimations().forEach((an) => an.cancel());
  end();
}
