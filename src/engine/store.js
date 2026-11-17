// One small store for the visit (assembly plan §5, "State"): the chapters reached, when each was first
// reached, and the d20 run. Language lives in i18n. Kept for the session (sessionStorage, this tab only;
// nothing is sent anywhere) so the receipt at the end of the page (src/chapters/close/) can print it.
//
// visited: chapter / dock names in the order they were first reached ("hero", "statement", "work",
//          "evaluate", "tally", "evidence", "path", "notes", "close")
// times:   { name: ms after `arrived` }
// arrived: ms timestamp of the first page load in this tab
// d20:     { seed, firstFail } from the d20 chapter; parcels: [...] if the Work chapter records them
const KEY = 'dg-visit';
let state = { visited: [], times: {}, d20: null };
try {
  state = { ...state, ...JSON.parse(sessionStorage.getItem(KEY) || '{}') };
} catch {
  /* private mode: memory only */
}
const subs = new Set();

export const getVisit = () => state;

function save() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function setVisit(patch) {
  state = { ...state, ...patch };
  save();
  subs.forEach((fn) => fn(state));
}

if (!state.arrived) setVisit({ arrived: Date.now() });

// While the page jumps on its own (a "Contact" link scrolling to the end), chapters flown past are
// not counted as reached.
let quietUntil = 0;
export const quiet = (ms) => {
  quietUntil = Date.now() + ms;
};

export function visit(chapter) {
  if (state.visited.includes(chapter) || Date.now() < quietUntil) return;
  setVisit({
    visited: [...state.visited, chapter],
    times: { ...state.times, [chapter]: Date.now() - state.arrived },
  });
}

export function subscribeVisit(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

// Records a chapter as reached once any part of it is above the lower 40% of the viewport. Works with
// or without the travelling mark (which only runs with motion and WebGL). `items`: [[name, element]].
// Also counts the distance scrolled by the reader, in viewport heights (`screens`).
export function watchChapters(items) {
  const names = new Map(items.filter(([, el]) => el).map(([name, el]) => [el, name]));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && visit(names.get(e.target))),
    { rootMargin: '0px 0px -40% 0px' },
  );
  names.forEach((_, el) => io.observe(el));
  let lastY = window.scrollY;
  let moved = 0;
  const onScroll = () => {
    const d = Math.abs(window.scrollY - lastY);
    if (d < window.innerHeight * 1.5) moved += d; // a jump (a link, a reload) is not scrolling
    lastY = window.scrollY;
  };
  const flush = () => {
    if (moved > 0) setVisit({ screens: (state.screens || 0) + moved / window.innerHeight });
    moved = 0;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('pagehide', flush);
  return {
    flush,
    stop() {
      flush();
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', flush);
    },
  };
}
