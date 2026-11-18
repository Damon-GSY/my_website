import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { langSwitchLabel, useLang } from '../../i18n.jsx';
import { noteCategory, noteMinutes, notes } from '../../notes.js';
import { hasWebGL2 } from '../../engine/webgl.js';
import { lockGL, unlockGL } from '../../engine/gl.js';
import { createClock, createFold, ease, sstep } from './fold.js';
import { blank, raster } from './raster.js';
import { RETURN_KEY, closeNote, getNote, noteOrigin, plainClick, releaseScroll, subscribeNote, switchNote } from './noteRoute.js';
import './notes.css';

// Notes, chapter 6 (phase G): a note is a printed sheet pinned to the table, and the pin is the
// travelling mark (assembly plan §4: "the pin holding the sheet").
//
// mode "layer": over the home page. A list row balls up, rises, flies to the middle and opens flat as
// the note; the pin (the mark) flies from wherever the mark is to the top of the sheet. Leaving (the
// "All notes" link, Esc, Back) plays the same timeline backwards: the sheet balls up and drops back
// into its row, and the pin returns to the mark's dock. The home page underneath never scrolls, so it
// is exactly where it was. "Next note" balls the sheet up, rolls it off and rolls the next one in.
// mode "page": a note loaded on its own (`/notes/<slug>` typed or shared). It is flat at once (only the
// pin presses in); "next note" works the same; leaving balls it up, drops it and goes to the list.
//
// The WebGL context exists only while paper moves (fold.js); at rest the note is plain DOM. Without
// WebGL2, or with reduced motion, every change is a short crossfade.

const DUR = { open: 1350, close: 1100, next: 1500, away: 950 };
const PAPER = '#f9f8f4';
const TABLE = '#f4f4f2';
const HOME_TITLE = document.querySelector('meta[property="og:title"]')?.content || document.title;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || !hasWebGL2();
const pad = (n) => String(n).padStart(2, '0');

// Fonts the sheet is printed in; never wait long for them (reading comes first).
const fontsReady = () =>
  Promise.race([
    Promise.all(
      ["880 100px 'Archivo Variable'", "400 18px 'Archivo Variable'", "800 30px 'Archivo Variable'", "400 11px 'Cartograph CF'"].map((f) =>
        document.fonts.load(f),
      ),
    ).then(() => document.fonts.ready),
    new Promise((r) => setTimeout(r, 500)),
  ]).catch(() => {});

// a rectangle of the viewport in whole pixels
function snap(left, top, right, bottom) {
  const x = Math.round(left);
  const y = Math.round(top);
  return { x, y, w: Math.max(1, Math.round(right) - x), h: Math.max(1, Math.round(bottom) - y) };
}

// The list row on the home page, if it is on screen.
function rowFor(slug, from) {
  const el = from?.isConnected && from.dataset.note === slug ? from : document.querySelector(`[data-note="${CSS.escape(slug)}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 8 || r.bottom < 0 || r.top > window.innerHeight) return null;
  return el;
}

// Where the mark is now (the home page's travelling dot, or its Notes dock), as {x, y, size}.
function markSpot(row) {
  const st = document.querySelector('.h-mark')?.markState;
  if (st && st.size > 0) return { x: st.x, y: st.y, size: Math.max(6, st.size) };
  const dock = document.querySelector('[data-mark="notes"]');
  const d = dock?.getBoundingClientRect();
  if (d && d.width > 0 && d.bottom > 0 && d.top < window.innerHeight) return { x: d.left + d.width / 2, y: d.top + d.height / 2, size: d.width };
  if (row) {
    const r = row.getBoundingClientRect();
    return { x: r.left + 4, y: r.top + r.height / 2, size: 8 };
  }
  return null;
}

export default function NoteView({ mode }) {
  const layer = mode === 'layer';
  const { lang, setLang, t } = useLang();
  const [shown, setShown] = useState(() => (layer ? null : getNote()));
  const ref = useRef({});
  const el = ref.current; // elements
  const ctl = useRef({ state: layer ? 'closed' : 'open', cur: layer ? null : getNote(), fold: null, clock: null, row: null });

  // ---- what is on screen at time t -----------------------------------------------------------
  function frame(tt) {
    const s = ctl.current;
    s.fold?.draw(tt);
    if (s.kind === 'open') {
      if (el.back) el.back.style.opacity = sstep(0.1, 0.48, tt).toFixed(3);
      if (el.bar) el.bar.style.opacity = sstep(0.84, 1, tt).toFixed(3);
    }
    if (s.pin) placePin(s.pin(tt));
  }

  function placePin(p) {
    const f = el.fly;
    if (!f) return;
    if (!p) {
      f.style.display = 'none';
      return;
    }
    f.style.display = 'block';
    const k = p.size / 16;
    f.style.transform = `translate3d(${(p.x - 8).toFixed(2)}px, ${(p.y - 8).toFixed(2)}px, 0) scale(${k.toFixed(4)})`;
    f.style.opacity = (p.o ?? 1).toFixed(3);
    // a pin standing off the paper casts a longer, softer shadow
    const l = p.lift || 0;
    f.style.boxShadow = `${(1.5 + 7 * l) / k}px ${(2.5 + 10 * l) / k}px ${(2.5 + 9 * l) / k}px rgba(13,13,13,${(0.22 - 0.08 * l).toFixed(3)})`;
  }

  // the sheet's pin, as {x, y, size}
  function pinSpot() {
    const r = el.pin?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, size: r.width } : null;
  }

  // the part of the sheet in the window, below the bar
  function sheetRect() {
    const r = el.sheet.getBoundingClientRect();
    const top = Math.max(r.top, el.bar ? el.bar.getBoundingClientRect().bottom : 0, 0);
    return snap(Math.max(0, r.left), top, Math.min(document.documentElement.clientWidth, r.right), Math.min(window.innerHeight, r.bottom));
  }
  const sheetEnd = () => {
    const rect = sheetRect();
    return { rect, img: raster(el.sheet, rect, PAPER) };
  };
  const rowEnd = (row) => {
    const r = row.getBoundingClientRect();
    const rect = snap(r.left, r.top, r.right, r.bottom);
    return { rect, img: raster(row, rect, TABLE) };
  };

  const gl = (on) => el.root?.classList.toggle('is-gl', on);
  const scroller = () => (layer ? el.scroll : document.scrollingElement);

  function startFold() {
    const s = ctl.current;
    s.fold?.dispose();
    // the page holds one WebGL context (src/engine/gl.js): the film that has it sleeps first
    lockGL();
    const fold = createFold();
    if (!fold) {
      unlockGL();
      s.fold = null;
      return null;
    }
    const dispose = fold.dispose;
    let held = true;
    fold.dispose = () => {
      dispose.call(fold);
      if (held) unlockGL();
      held = false;
    };
    s.fold = fold;
    (layer ? el.root : document.body).appendChild(s.fold.canvas);
    if (!s.clock) s.clock = createClock(frame);
    return s.fold;
  }

  // back to rest: the DOM shows, the context is gone
  function rest() {
    const s = ctl.current;
    s.fold?.dispose();
    s.fold = null;
    s.pin = null;
    s.kind = null;
    placePin(null);
    gl(false);
    if (el.back) el.back.style.opacity = '';
    if (el.bar) el.bar.style.opacity = '';
  }

  function lock(on) {
    const html = document.documentElement;
    const app = document.getElementById('root');
    html.style.scrollbarGutter = on && window.innerWidth > html.clientWidth ? 'stable' : '';
    html.style.overflow = on ? 'hidden' : '';
    html.classList.toggle('note-open', on);
    if (app) app.inert = on;
  }

  function fade(target, from, to, dur = 200) {
    if (!target) return Promise.resolve();
    const a = target.animate([{ opacity: from }, { opacity: to }], { duration: dur, easing: 'ease-out' });
    return a.finished.catch(() => {});
  }

  // ---- layer: open from a row / close into it ------------------------------------------------
  async function open(slug) {
    const s = ctl.current;
    s.state = 'opening';
    s.cur = slug;
    lock(true);
    flushSync(() => setShown(slug));
    gl(true);
    s.kind = 'open';
    el.back.style.opacity = '0';
    el.bar.style.opacity = '0';
    el.scroll.scrollTop = 0;
    el.title?.focus({ preventScroll: true });
    const row = rowFor(slug, noteOrigin());
    s.row = row;
    if (row) row.classList.add('is-out');
    if (still()) {
      rest();
      await fade(el.root, 0, 1);
      if (s.state === 'opening') s.state = 'open';
      sync();
      return;
    }
    await fontsReady();
    if (s.state !== 'opening' || s.cur !== slug) return;
    const fold = startFold();
    if (!fold) {
      rest();
      await fade(el.root, 0, 1);
      s.state = 'open';
      sync();
      return;
    }
    const b = sheetEnd();
    let a;
    if (row) a = rowEnd(row);
    else {
      // no row on screen: the ball comes up from below the window
      const w = Math.min(b.rect.w, 360);
      const rect = { x: Math.round(b.rect.x + b.rect.w / 2 - w / 2), y: window.innerHeight + 140, w, h: 90 };
      a = { rect, img: blank(rect.w, rect.h, TABLE) };
    }
    fold.setEnds(a, b, 'open');
    const from = markSpot(row);
    const to = pinSpot();
    s.pin = from && to ? flight(from, to) : null;
    s.clock.set(0);
    await run(1, DUR.open, 'open');
  }

  // the pin's way from the mark to the top of the sheet (and back, played backwards)
  function flight(from, to) {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    return (tt) => {
      const u = ease(clamp((tt - 0.1) / 0.72));
      const arc = Math.sin(Math.PI * u) * Math.min(180, dist * 0.3);
      const press = sstep(0.8, 0.9, tt) - sstep(0.9, 1, tt);
      return {
        x: lerp(from.x, to.x, u),
        y: lerp(from.y, to.y, u) - arc,
        size: lerp(from.size, to.size, u) * (1 + 0.4 * Math.sin(Math.PI * u) + 0.18 * press),
        lift: Math.sin(Math.PI * u) + 0.3 * press,
      };
    };
  }

  // run the clock to `target`; at the end the state settles (unless something reversed it)
  async function run(target, dur) {
    const s = ctl.current;
    const ok = await s.clock.to(target, dur);
    if (!ok) return;
    if (s.state === 'opening') {
      rest();
      s.state = 'open';
      sync();
    } else if (s.state === 'closing') finishClose();
  }

  async function close() {
    const s = ctl.current;
    if (s.state === 'opening' && s.fold) {
      // still opening: fold back from where it is
      s.state = 'closing';
      run(0, DUR.close);
      return;
    }
    s.state = 'closing';
    if (s.row && !s.row.isConnected) s.row = null;
    let row = s.row || rowFor(s.cur, null);
    if (!row) {
      // the page under the sheet may have moved (a resize, another language): bring the row back first
      const any = document.querySelector(`[data-note="${CSS.escape(s.cur)}"]`);
      if (any) {
        const r = any.getBoundingClientRect();
        window.scrollTo({ top: Math.max(0, Math.round(window.scrollY + r.top + r.height / 2 - window.innerHeight / 2)), behavior: 'instant' });
        row = rowFor(s.cur, null);
      }
    }
    s.row = row;
    if (row) row.classList.add('is-out');
    const fold = still() ? null : startFold();
    if (!fold || !row) {
      fold?.dispose();
      s.fold = null;
      await fade(el.root, 1, 0, 180);
      if (s.state === 'closing') finishClose();
      return;
    }
    s.kind = 'open';
    const b = sheetEnd();
    fold.setEnds(rowEnd(row), b, 'open');
    const to = pinSpot();
    const from = markSpot(row);
    s.pin = from && to ? flight(from, to) : null;
    s.clock.set(1);
    gl(true);
    run(0, DUR.close);
  }

  function finishClose() {
    const s = ctl.current;
    const row = s.row;
    rest();
    lock(false);
    releaseScroll();
    row?.classList.remove('is-out');
    s.state = 'closed';
    s.cur = null;
    s.row = null;
    flushSync(() => setShown(null));
    document.title = HOME_TITLE;
    document.dispatchEvent(new Event('markmove')); // the travelling mark takes over at its dock again
    row?.focus({ preventScroll: true });
    sync();
  }

  // ---- both: one sheet rolls off, the next rolls in -------------------------------------------
  async function next(slug) {
    const s = ctl.current;
    const from = notes.findIndex((n) => n.slug === s.cur);
    const to = notes.findIndex((n) => n.slug === slug);
    const side = to === (from + 1) % notes.length ? 1 : -1;
    s.state = 'next';
    const swap = () => {
      flushSync(() => setShown(slug));
      s.cur = slug;
      scroller().scrollTo({ top: 0, behavior: 'instant' });
      el.title?.focus({ preventScroll: true });
      if (layer) {
        s.row?.classList.remove('is-out');
        s.row = document.querySelector(`[data-note="${CSS.escape(slug)}"]`);
        s.row?.classList.add('is-out');
      }
    };
    const fold = still() ? null : startFold();
    if (!fold) {
      swap();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        el.sheet?.animate([{ opacity: 0.15, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], 260);
      s.state = 'open';
      sync();
      return;
    }
    const a = sheetEnd();
    fold.setEnds(a, a, 'next', side);
    s.kind = 'next';
    const spot = pinSpot();
    s.pin = null;
    s.clock.set(0);
    gl(true);
    swap();
    await fontsReady();
    const b = sheetEnd();
    fold.setEnds(a, b, 'next', side);
    // the pin comes out of the old sheet (wherever it was scrolled to) and pins the new one
    const at = pinSpot();
    s.pin = spot && at ? flight(spot, at) : null;
    s.clock.set(0);
    const ok = await s.clock.to(1, DUR.next);
    if (!ok) return;
    rest();
    s.state = 'open';
    sync();
  }

  // ---- page: ball it up, drop it, go to the list ----------------------------------------------
  async function away() {
    const s = ctl.current;
    if (s.state !== 'open') return;
    s.state = 'away';
    const go = () => {
      try {
        sessionStorage.setItem(RETURN_KEY, s.cur);
      } catch {
        /* ignore */
      }
      window.location.assign('/#notes');
    };
    const fold = still() ? null : startFold();
    if (!fold) {
      go();
      return;
    }
    const a = sheetEnd();
    fold.setEnds(a, null, 'away');
    s.kind = 'away';
    const at = pinSpot();
    s.pin = at ? (tt) => ({ ...at, y: at.y - 30 * sstep(0, 0.3, tt), size: at.size * (1 + 0.4 * sstep(0, 0.2, tt)), lift: sstep(0, 0.2, tt), o: 1 - sstep(0.12, 0.34, tt) }) : null;
    s.clock.set(0);
    gl(true);
    if (await s.clock.to(1, DUR.away)) go();
  }

  // ---- URL → sheet ----------------------------------------------------------------------------
  function sync() {
    const s = ctl.current;
    const want = getNote();
    const known = want && notes.some((n) => n.slug === want);
    if (layer) {
      if (want && !known) {
        if (s.state === 'closed') closeNote();
        return;
      }
      if (s.state === 'closed') {
        if (want) open(want);
      } else if (s.state === 'opening') {
        if (!want) close();
      } else if (s.state === 'closing') {
        if (want && want === s.cur) {
          // reopened while folding back (Forward, a quick second click): open again from here
          s.state = 'opening';
          lock(true);
          run(1, DUR.open);
        }
      } else if (s.state === 'open') {
        if (!want) close();
        else if (want !== s.cur) next(want);
      }
    } else if (s.state === 'open' && known && want !== s.cur) next(want);
  }

  useEffect(() => {
    const live = ctl.current;
    const off = subscribeNote(sync);
    // on a page of its own, Back and Forward move between notes: each one opens at its top, by the
    // transition, not at a scroll position the browser restores under it
    const restore = window.history.scrollRestoration;
    if (!layer) window.history.scrollRestoration = 'manual';
    const first = setTimeout(sync, 0); // a note asked for before this chunk had loaded
    const onKey = (e) => {
      const s = ctl.current;
      if (e.key !== 'Escape' || !s.cur || e.defaultPrevented) return;
      e.preventDefault();
      if (layer) closeNote();
      else away();
    };
    // a page restored from the back/forward cache after leaving: show the sheet again
    const onShow = (e) => {
      const s = ctl.current;
      if (e.persisted && s.state === 'away') {
        s.clock?.stop();
        rest();
        s.state = 'open';
      }
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('pageshow', onShow);
    // verification hook: __notes.hold(t) freezes the running transition at t, release() lets it go
    window.__notes = {
      hold: (v) => ctl.current.clock?.hold(v),
      release: () => ctl.current.clock?.release(),
      state: () => ctl.current.state,
      kind: () => ctl.current.kind,
    };
    return () => {
      off();
      clearTimeout(first);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('pageshow', onShow);
      delete window.__notes;
      if (!layer) window.history.scrollRestoration = restore;
      const s = live;
      s.clock?.stop();
      s.fold?.dispose();
      if (layer && s.state !== 'closed') {
        lock(false);
        s.row?.classList.remove('is-out');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const note = notes.find((n) => n.slug === shown);
  useLayoutEffect(() => {
    if (note) document.title = `${note.title} — Damon Guan`;
    else if (!layer) document.title = 'Note not found — Damon Guan';
  }, [note, layer]);

  if (layer && !shown) return null;

  const set = (key) => (node) => {
    el[key] = node;
  };
  const toList = (e) => {
    if (!plainClick(e)) return;
    e.preventDefault();
    if (layer) closeNote();
    else away();
  };
  const toNext = (slug) => (e) => {
    if (!plainClick(e) || ctl.current.state !== 'open') {
      if (plainClick(e)) e.preventDefault();
      return;
    }
    e.preventDefault();
    switchNote(slug, !layer);
  };

  const index = notes.indexOf(note);
  const nx = note ? notes[(index + 1) % notes.length] : null;
  const allNotes = t({ en: 'All notes', zh: '全部笔记' });

  const doc = (
    <>
      <header className="nt-bar" ref={set('bar')}>
        <a className="nt-brand" href="/">
          Damon Guan
        </a>
        <nav aria-label={t({ en: 'Site', zh: '站点' })}>
          <a href="/#notes" onClick={toList}>
            <span aria-hidden="true">{'←\u00a0'}</span>
            {allNotes}
          </a>
          {note && (
            <span className="nt-count" aria-hidden="true">
              {pad(index + 1)} / {pad(notes.length)}
            </span>
          )}
          <button type="button" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} aria-label={langSwitchLabel(lang)}>
            {lang === 'en' ? '中文' : 'EN'}
          </button>
        </nav>
      </header>
      {note ? (
        <main id="content" className="nt-desk">
          <article className="nt-sheet" ref={set('sheet')} aria-labelledby="nt-title">
            <span className="nt-pin" ref={set('pin')} data-raster="skip" aria-hidden="true" />
            <header className="nt-head">
              <p className="h-head mono">
                <span className="h-num">
                  {t({ en: 'Field note', zh: '笔记' })} {pad(index + 1)}/{pad(notes.length)}
                </span>
                <span className="h-label">{noteCategory(note, lang)}</span>
                <span className="h-aside">{note.date.replaceAll('-', '.')}</span>
              </p>
              <h1 id="nt-title" ref={set('title')} tabIndex={-1}>
                {note.title}
              </h1>
              <p className="nt-excerpt">{note.excerpt}</p>
            </header>
            <div className="nt-body">
              <aside className="nt-side mono">
                <span>{noteMinutes(note, lang, true)}</span>
                <b>{note.tags.join(' · ')}</b>
                {lang === 'zh' && <span>{t({ en: 'This note is in English only.', zh: '本文仅有英文版。' })}</span>}
              </aside>
              {/* trusted, author-written HTML from src/notes.js */}
              <div className="nt-prose" dangerouslySetInnerHTML={{ __html: note.content }} />
            </div>
            <footer className="nt-end mono">
              <span>
                {t({ en: 'End of note', zh: '本篇完' })} {pad(index + 1)}/{pad(notes.length)}
              </span>
              <a href="/#notes" onClick={toList}>
                <span aria-hidden="true">{'←\u00a0'}</span>
            {allNotes}
              </a>
            </footer>
          </article>
          {nx && nx !== note && (
            <div className="nt-after">
              <a className="nt-next" href={`/notes/${nx.slug}`} onClick={toNext(nx.slug)}>
                <span className="mono">
                  {t({ en: 'Next note', zh: '下一篇' })} · {pad(notes.indexOf(nx) + 1)}/{pad(notes.length)} <span aria-hidden="true">→</span>
                </span>
                <strong>{nx.title}</strong>
                <span className="nt-next-ex">{nx.excerpt}</span>
              </a>
              <p className="nt-hint mono" aria-hidden="true">
                {t({ en: 'Esc returns to the list', zh: '按 Esc 返回列表' })}
              </p>
            </div>
          )}
        </main>
      ) : (
        <main id="content" className="nt-desk">
          <div className="nt-sheet nt-missing" ref={set('sheet')}>
            <p className="h-head mono">
              <span className="h-num">404</span>
              <span className="h-label">{t({ en: 'Not found', zh: '未找到' })}</span>
            </p>
            <h1 ref={set('title')} tabIndex={-1}>
              {t({ en: 'No note here.', zh: '这里没有笔记。' })}
            </h1>
            <p className="nt-excerpt">
              <a href="/#notes">
                <span aria-hidden="true">{'←\u00a0'}</span>
            {allNotes}
              </a>
            </p>
          </div>
        </main>
      )}
      <footer className="nt-foot mono">
        <span>© 2026 Damon Guan</span>
        <a href="/lab">{t({ en: 'Design studies', zh: '设计研究' })} →</a>
      </footer>
    </>
  );

  if (!layer)
    return (
      <div className="note nt-page" ref={set('root')}>
        <a className="skip-link" href="#content">
          {t({ en: 'Skip to content', zh: '跳到正文' })}
        </a>
        {doc}
        <span className="nt-fly" ref={set('fly')} aria-hidden="true" />
      </div>
    );

  return createPortal(
    <div className="note nt-layer" ref={set('root')} role="dialog" aria-modal="true" aria-labelledby="nt-title">
      <div className="nt-back" ref={set('back')} />
      <div className="nt-scroll" ref={set('scroll')}>
        {doc}
      </div>
      <span className="nt-fly" ref={set('fly')} aria-hidden="true" />
    </div>,
    document.body,
  );
}
