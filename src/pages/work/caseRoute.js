import { useSyncExternalStore } from 'react';
import { hasWebGL2 } from '../../engine/webgl.js';

// Which case study is open on the home page (phase B, "Work in place"). The URL is the state:
// `/work/<slug>` means that parcel is open over the Work chapter, `/` means none is. Opening pushes a
// history entry, so Back closes it; switching to the next parcel replaces the entry; closing goes back.
// Kept tiny because the home page imports it before first paint; the dialog itself is a lazy chunk.

const PREFIX = '/work/';
const read = () => {
  const m = window.location.pathname.replace(/\/+$/, '').match(/^\/work\/([^/]+)$/);
  return m ? decodeURIComponent(m[1]) : null;
};

let slug = read();
let origin = null; // the card the case was opened from (the box unfolds out of it)
const subs = new Set();
const emit = () => subs.forEach((fn) => fn());

// the page's own title, restored when a case closes
export const HOME_TITLE = document.querySelector('meta[property="og:title"]')?.content || document.title;

window.addEventListener('popstate', () => {
  const next = read();
  if (next === slug) return;
  slug = next;
  origin = null;
  emit();
});

// While a case is involved the page keeps its own scroll: Back to `/` must not restore an older scroll
// position under the closing sheet. Set before the entries are made, so both carry it; released once
// the case has closed (the dialog brings the card into view itself).
let restore = null;
const holdScroll = () => {
  if (window.history.scrollRestoration === 'manual') return;
  restore = window.history.scrollRestoration;
  window.history.scrollRestoration = 'manual';
};
export function releaseScroll() {
  if (restore) window.history.scrollRestoration = restore;
  restore = null;
}

export const getCase = () => slug;
export const caseOrigin = () => origin;
const subscribe = (fn) => {
  subs.add(fn);
  return () => subs.delete(fn);
};
export const useCase = () => useSyncExternalStore(subscribe, getCase);

export function openCase(next, from) {
  origin = from || null;
  if (slug === next) return;
  holdScroll();
  window.history.pushState({ case: next }, '', PREFIX + next);
  slug = next;
  emit();
}

// A deep link (/work/<slug> typed or shared) becomes "home, then this parcel opened": the entry below
// it is `/`, so Back and Close both land on the home page instead of leaving the site. Called once the
// page has been scrolled to Work, so that `/` keeps that scroll position when Back restores it.
export function adoptDeepLink() {
  if (!slug || window.history.state?.case) return;
  holdScroll();
  window.history.replaceState(null, '', '/');
  window.history.pushState({ case: slug }, '', PREFIX + slug);
}

export function switchCase(next) {
  window.history.replaceState({ case: next }, '', PREFIX + next);
  slug = next;
  origin = null;
  emit();
}

export function closeCase() {
  if (!slug) return;
  if (window.history.state?.case) {
    window.history.back(); // popstate clears it
    return;
  }
  window.history.replaceState(null, '', '/');
  slug = null;
  emit();
}

// Scrolls the page so the Work chapter rests on its grid of six cards: the end of the pinned film,
// or the card itself in the static version. Instant: it runs under a dialog or before first paint.
export function scrollToWork(id) {
  const host = document.getElementById('work');
  if (!host) return;
  const card = id && document.querySelector(`[data-case="${id}"]`);
  // pinned film unless it falls back to static (the same test as the home page's `staticFilms`)
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !hasWebGL2();
  const film = !still && host.querySelector('.h-workfilm, .h-defer');
  let y;
  if (film) y = window.scrollY + host.getBoundingClientRect().bottom - window.innerHeight;
  else if (card) {
    const r = card.getBoundingClientRect();
    y = window.scrollY + r.top + r.height / 2 - window.innerHeight / 2;
  } else y = window.scrollY + host.getBoundingClientRect().top;
  window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: 'instant' });
}
