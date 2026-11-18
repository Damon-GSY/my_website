// One live WebGL context for the whole home page (assembly plan §5, "Budgets").
//
// Phones lose contexts when a page holds several, and the home page has three WebGL chapters (the ink
// hero, the Work film, the d20) plus the notes paper during a transition. Each claims the GPU here with
// the range of scroll positions over which its canvas can show anything; exactly one of them (or none)
// is awake at a time:
//
// - the owner is the claimant whose range is nearest the current scroll position, if it is within
//   WAKE viewports; an owner further than SLEEP viewports away is released. Ranges are chosen so that a
//   film's canvas is blank or off screen at both ends (a film rests on its DOM twin), which is where
//   the hand-over happens, so the swap is never seen;
// - hysteresis: the owner is replaced when another claimant's range has been reached while the owner
//   is outside its own, or when another is nearer by more than MARGIN viewports. Between two films
//   that meet (Work's last DOM frames, then the d20) the swap happens at the far edge of the gap in
//   either direction, so scrolling back and forth over a boundary never rebuilds a renderer in a loop;
// - the previous owner always sleeps (renderer disposed, context lost, canvas dropped) before the next
//   wakes, so the page never holds two contexts, even for a frame;
// - `lockGL()` takes the GPU for an overlay (the notes paper): the owner sleeps until `unlockGL()`.
//
// Everything a film shows is a function of scroll, and films keep their scene graph and DOM while
// asleep (only the renderer goes), so a woken film draws the same frame it would have drawn.

const WAKE = 1.5;
const SLEEP = 2;
const MARGIN = 0.15;

const claims = new Set();
let owner = null;
let locks = 0;
let raf = 0;
let listening = false;

const distance = (c, y, H) => {
  const [a, b] = c.range();
  if (!(b >= a)) return Infinity; // not laid out
  return (y < a ? a - y : y > b ? y - b : 0) / H;
};

function give(next) {
  if (owner === next) return;
  if (owner) owner.sleep();
  owner = next;
  if (owner && !owner.wake()) {
    // could not make a context (lost GPU, blocklist): that claimant stays as it is, asleep
    claims.delete(owner);
    owner = null;
  }
}

export function decideGL() {
  raf = 0;
  if (locks > 0) {
    give(null);
    return;
  }
  const H = window.innerHeight || 1;
  const y = window.scrollY;
  let best = null;
  let bestD = Infinity;
  for (const c of claims) {
    const d = distance(c, y, H);
    if (d < bestD) {
      best = c;
      bestD = d;
    }
  }
  const ownD = owner ? distance(owner, y, H) : Infinity;
  if (owner && ownD > SLEEP) give(null);
  if (!owner) {
    if (best && bestD <= WAKE) give(best);
  } else if (best !== owner && ((bestD === 0 && ownD > 0) || bestD < ownD - MARGIN)) give(best);
}

const later = () => {
  if (!raf) raf = requestAnimationFrame(decideGL);
};

function listen(on) {
  if (on === listening) return;
  listening = on;
  // decided in the scroll event itself, before the films' frames in the next animation frame
  const m = on ? 'addEventListener' : 'removeEventListener';
  window[m]('scroll', decideGL, { passive: true });
  window[m]('resize', later);
}

// claim: { range(): [fromScrollY, toScrollY], wake(): boolean, sleep() }. Returns the release function.
export function claimGL(claim) {
  claims.add(claim);
  listen(true);
  later();
  return () => {
    claims.delete(claim);
    if (owner === claim) {
      owner.sleep();
      owner = null;
    }
    if (!claims.size) listen(false);
    later();
  };
}

export function lockGL() {
  locks += 1;
  give(null);
}

export function unlockGL() {
  locks = Math.max(0, locks - 1);
  if (!locks) later();
}

// The range over which an element's box is on screen, in scrollY: from its top meeting the bottom of
// the viewport to its bottom meeting the top. `to` (0..1) ends it earlier, at that fraction of a
// pinned track's travel (a film whose last frames are DOM only); `from` (viewports) starts it later,
// when the top of the box holds nothing drawn (the d20's die sits below its pinned head).
export function onScreen(el, to = 1, from = 1) {
  const r = el.getBoundingClientRect();
  const top = r.top + window.scrollY;
  const H = window.innerHeight;
  const travel = Math.max(0, r.height - H);
  return [top - H * from, to < 1 ? top + travel * to : top + r.height];
}
