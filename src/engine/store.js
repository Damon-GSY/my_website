// One small store for the visit (assembly plan §5, "State"): the chapters the mark has been handed to,
// and the d20 run. Language lives in i18n. Kept for the session so the receipt (phase C) can print it.
const KEY = 'dg-visit';
let state = { visited: [], d20: null };
try {
  state = { ...state, ...JSON.parse(sessionStorage.getItem(KEY) || '{}') };
} catch {
  /* private mode: memory only */
}
const subs = new Set();

export const getVisit = () => state;

export function setVisit(patch) {
  state = { ...state, ...patch };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  subs.forEach((fn) => fn(state));
}

export function visit(chapter) {
  if (!state.visited.includes(chapter)) setVisit({ visited: [...state.visited, chapter] });
}

export function subscribeVisit(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
