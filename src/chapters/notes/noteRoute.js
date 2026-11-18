import { useSyncExternalStore } from 'react';

// Which note is open over the home page (phase G). The URL is the state, as for the case studies
// (src/pages/work/caseRoute.js): `/notes/<slug>` means that note's sheet is open over the Notes list,
// `/` means none is. Opening pushes a history entry, so Back closes it; "next note" replaces it; the
// way back goes back. A direct load of `/notes/<slug>` is not handled here: App renders the note page
// on its own (src/pages/Note.jsx), so reading never waits for the home page.
// Kept tiny: the home page imports it before first paint; the sheet itself is a lazy chunk.

const PREFIX = '/notes/';
const read = () => {
  const m = window.location.pathname.replace(/\/+$/, '').match(/^\/notes\/([^/]+)$/);
  return m ? decodeURIComponent(m[1]) : null;
};

let slug = read();
let origin = null; // the list row the note was opened from
const subs = new Set();
const emit = () => subs.forEach((fn) => fn());

window.addEventListener('popstate', () => {
  const next = read();
  if (next === slug) return;
  slug = next;
  origin = null;
  emit();
});

// The home page keeps its own scroll while a note is involved: Back to `/` must not restore an older
// position under the closing sheet. Released once the note has closed.
let restore = null;
function holdScroll() {
  if (window.history.scrollRestoration === 'manual') return;
  restore = window.history.scrollRestoration;
  window.history.scrollRestoration = 'manual';
}
export function releaseScroll() {
  if (restore) window.history.scrollRestoration = restore;
  restore = null;
}

export const getNote = () => slug;
export const noteOrigin = () => origin;
export const subscribeNote = (fn) => {
  subs.add(fn);
  return () => subs.delete(fn);
};
export const useNote = () => useSyncExternalStore(subscribeNote, getNote);

export function openNote(next, from) {
  origin = from || null;
  if (slug === next) return;
  holdScroll();
  window.history.pushState({ note: next }, '', PREFIX + next);
  slug = next;
  emit();
}

// "next note": over the home page the entry is replaced (Back still returns to the list); on a note
// page loaded on its own it is pushed, so Back returns to the note before.
export function switchNote(next, push = false) {
  window.history[push ? 'pushState' : 'replaceState']({ note: next }, '', PREFIX + next);
  slug = next;
  origin = null;
  emit();
}

export function closeNote() {
  if (!slug) return;
  if (window.history.state?.note) {
    window.history.back(); // popstate clears it
    return;
  }
  window.history.replaceState(null, '', '/');
  slug = null;
  emit();
}

// A plain left click, which the page may take over; anything else (a new tab, a download) is the browser's.
export const plainClick = (e) => !(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);

// After leaving a note page loaded on its own, the home page lands on its Notes list with that row
// focused (src/pages/Home.jsx reads this once).
export const RETURN_KEY = 'dg-note-from';
