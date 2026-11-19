import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

// One site, not separate pages: links between `/`, `/lab`, `/short`, a note page and the 404 change the
// page in place (history.pushState), and Back / Forward come back to where the visitor was. This part is
// in the entry and only decides; the page change itself (the history entry, the scroll, the mark flying
// from the old page's dock to the new one's) is the lazy chunk src/engine/navMove.js.
//
// - App (src/App.jsx) owns the routes: `resolve(path, state, from, pop)` names the page for a path
//   (null: the browser loads it, e.g. a study under /lab/<study>/ or a file), `load(key)` fetches its
//   chunk. The page shown is `useRoute()`; it changes only here, so the case studies and notes, which
//   push their own /work/<slug> and /notes/<slug> entries over the home page, never swap it.
// - A link is taken over only on a plain left click nothing else took (the case and note rows
//   preventDefault first), same origin, no target or download, not inside `[data-nav="local"]`, and only
//   while one of the site's own pages is shown (the studies at /parcel, /ink… keep full loads).
// - Scroll: every entry gets a key in history.state, and its position is recorded as the visitor
//   scrolls. Entries this layer moves between are `scrollRestoration = 'manual'` (the browser would
//   restore them onto the old page); navMove.js restores them once the new page is there.

export const norm = (p) => p.replace(/\/+$/, '') || '/';
const STORE = 'dg-nav-y';
const subs = new Set();
const subscribe = (fn) => {
  subs.add(fn);
  return () => subs.delete(fn);
};

// shared with navMove.js
export const nav = {
  api: null,
  route: { key: null, path: '/' },
  ys: {},
  rec: true,
  seq: 0,
  set(route) {
    flushSync(() => {
      nav.route = route;
      subs.forEach((fn) => fn());
    });
  },
  // this entry's key (made on first use, keeping whatever state the entry already has)
  entry() {
    const s = window.history.state;
    if (s?.navKey) return s.navKey;
    const navKey = Math.random().toString(36).slice(2, 10);
    window.history.replaceState({ ...s, navKey }, '');
    return navKey;
  },
};
try {
  nav.ys = JSON.parse(sessionStorage.getItem(STORE)) || {};
} catch {
  /* private mode: positions live for this document only */
}

export const useRoute = () => useSyncExternalStore(subscribe, () => nav.route);

const go = (url, key, pop) => {
  nav.rec = false;
  const id = ++nav.seq;
  import('./navMove.js').then((m) => m.go(url, key, pop, id));
};

// true if the link was taken over; `at`: where it was pressed (the mark leaves from there when the old
// page has none on screen)
export function navigate(href, at = null) {
  const { api, route } = nav;
  nav.at = at;
  if (!api?.site.has(route.key)) return false;
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  const path = norm(url.pathname);
  const key = api.resolve(path, null, route.key, false);
  if (!key) return false;
  if (key === route.key) {
    // the same page: a fragment is the browser's; the page's own address scrolls to its top
    if (path !== norm(window.location.pathname) || url.hash || url.search !== window.location.search) return false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }
  go(url, key, false);
  return true;
}

// api: { initial, site: Set of the page keys this layer moves between, resolve, load }
export function startNav(api) {
  nav.api = api;
  nav.route = { key: api.initial, path: norm(window.location.pathname) };
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.('a[href]');
    if (!a || typeof a.href !== 'string' || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const r = a.getBoundingClientRect();
    const at = e.detail ? { x: e.clientX, y: e.clientY } : { x: r.right, y: r.top + r.height / 2 };
    if (!a.closest('[data-nav="local"]') && navigate(a.href, at)) e.preventDefault();
  });
  window.addEventListener('popstate', (e) => {
    if (!e.isTrusted) return; // ours, sent for the case and note stores
    const path = norm(window.location.pathname);
    const key = api.resolve(path, window.history.state, nav.route.key, true);
    if (!key) window.location.reload();
    else if (key !== nav.route.key) {
      nav.at = null;
      go(new URL(window.location.href), key, true);
    }
    // the same page: restore what the browser left to us, unless a case or a note owns this move
    else if (
      window.history.scrollRestoration === 'manual' &&
      key !== 'note' &&
      !/^\/(work|notes)\//.test(path) &&
      !document.querySelector('[aria-modal="true"]')
    )
      import('./navMove.js').then((m) => m.same());
  });
  window.addEventListener('scroll', () => nav.rec && (nav.ys[(nav.here = nav.entry())] = window.scrollY), { passive: true });
  window.addEventListener('pagehide', () => {
    // a reload or a visit to another document: the browser restores this entry itself
    window.history.scrollRestoration = 'auto';
    try {
      sessionStorage.setItem(STORE, JSON.stringify(nav.ys));
    } catch {
      /* ignore */
    }
  });
}
