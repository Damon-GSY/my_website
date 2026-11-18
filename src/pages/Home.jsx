import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { langSwitchLabel, useLang } from '../i18n.jsx';
import { path } from '../content.js';
import { noteCategory, noteMinutes, notes } from '../notes.js';
import InkHero from '../directions/ink/InkHero.jsx';
import Claim from '../chapters/claim/Claim.jsx';
import Close from '../chapters/close/Close.jsx';
import Evidence from '../chapters/evidence/Evidence.jsx';
import { hasWebGL2 } from '../engine/webgl.js';
import { startMark } from '../engine/mark.js';
import { startParallax } from '../engine/parallax.js';
import { adoptDeepLink, getCase, scrollToWork, useCase } from './work/caseRoute.js';
import { RETURN_KEY, openNote, plainClick, useNote } from '../chapters/notes/noteRoute.js';
import GuidedButton from '../chapters/guided/GuidedButton.jsx';
import './home.css';

const WorkFilm = lazy(() => import('./WorkFilm.jsx'));
const CaseStudy = lazy(() => import('./work/CaseStudy.jsx'));

// Phase B, "Work in place": a Work card opens its case study over the page (a lazy chunk), and a deep
// link /work/<slug> lands here with the Work chapter scrolled to its cards and that parcel open.
function WorkCase() {
  const slug = useCase();
  const [ever, setEver] = useState(Boolean(slug));
  if (slug && !ever) setEver(true);
  useEffect(() => {
    const id = getCase();
    if (!id) return undefined;
    // scroll now (that brings the deferred film in), again once the cards exist, then fix the history
    scrollToWork(id);
    let raf = 0;
    const t0 = performance.now();
    const settle = () => {
      if (document.querySelector('[data-case]') || performance.now() - t0 > 4000) {
        scrollToWork(id);
        adoptDeepLink();
      } else raf = requestAnimationFrame(settle);
    };
    raf = requestAnimationFrame(settle);
    return () => cancelAnimationFrame(raf);
  }, []);
  return ever ? (
    <Suspense fallback={null}>
      <CaseStudy />
    </Suspense>
  ) : null;
}
const D20Chapter = lazy(() => import('../directions/d20/D20Chapter.jsx'));
const BentoOpening = lazy(() => import('../directions/bento/Opening.jsx'));
const ReceiptOpening = lazy(() => import('../directions/receipt/Opening.jsx'));
const CityOpening = lazy(() => import('../directions/city/Opening.jsx'));
const ArenaOpening = lazy(() => import('../directions/arena/Opening.jsx'));

// Studio Lens (the dock's choices and the per-chapter lens bars) is its own lazy chunk
const loadLens = () => import('./lens/Lens.jsx');
const LensGroups = lazy(loadLens);
const ChapterLensBar = lazy(() => loadLens().then((m) => ({ default: m.ChapterLensBar })));
const AltHero = lazy(() => loadLens().then((m) => ({ default: m.AltHero })));

// The run's chapters, in page order (the hero, (00), opens it). The section heads, the hero's corner
// list and the fixed bar all take their numbers and names from here, so they always agree.
const CHAPTERS = [
  { id: 'statement', n: '01', label: { en: 'Statement', zh: '自述' } },
  { id: 'work', n: '02', label: { en: 'Work', zh: '作品' } },
  { id: 'evaluate', n: '03', label: { en: 'Evaluate', zh: '评测' } },
  { id: 'evidence', n: '04', label: { en: 'Evidence', zh: '证据' } },
  { id: 'path', n: '05', label: { en: 'Path', zh: '经历' } },
  { id: 'notes', n: '06', label: { en: 'Notes', zh: '笔记' } },
  { id: 'contact', n: '07', label: { en: 'Contact', zh: '联系' } },
];
const byId = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));
const link = (c) => ({ href: `#${c.id}`, label: c.label });
// the hero's corner list starts after the statement, which is the next screen anyway
const NAV = CHAPTERS.slice(1).map(link);
const BAR_NAV = CHAPTERS.map(link);

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The films only pin and animate with motion allowed and WebGL available; otherwise they render
// their short static fallback, so there is nothing heavy to defer and no tall track to stand in for.
let staticCache;
const staticFilms = () => {
  if (staticCache === undefined) staticCache = reduced() || !hasWebGL2() || typeof IntersectionObserver === 'undefined';
  return staticCache;
};

// Below-the-fold WebGL chapters (three.js) mount about one viewport before they scroll in. Until then a
// blank block of the film's own scroll length (home.css, "film lengths") holds their place, so the page does not jump and the
// #work / #evaluate anchors land where they will once the film is there.
function Deferred({ size, children }) {
  const ref = useRef(null);
  const [near, setNear] = useState(staticFilms);
  useEffect(() => {
    if (near) return undefined;
    // 90%, not 100%: on phones the Work film starts exactly two screens down, and three.js should
    // not load before the visitor has scrolled at all
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setNear(true), {
      rootMargin: '90% 0px',
    });
    io.observe(ref.current);
    // a keyboard visitor tabs past chapters without scrolling to them: the first Tab mounts them all, so
    // the Work cards and the d20's controls are in the tab order (finish pass QA, 2026-11-18)
    const onKey = (e) => e.key === 'Tab' && setNear(true);
    window.addEventListener('keydown', onKey);
    return () => {
      io.disconnect();
      window.removeEventListener('keydown', onKey);
    };
  }, [near]);
  const hold = <div ref={ref} className={`h-defer h-defer-${size}`} aria-hidden="true" />;
  return near ? <Suspense fallback={hold}>{children}</Suspense> : hold;
}

// A blank that the owner fills in later: a long rule, read out as "to be filled in".
function Blank({ wide }) {
  const { t } = useLang();
  return <span className={`h-blank${wide ? ' is-wide' : ''}`} role="img" aria-label={t({ en: 'to be filled in', zh: '待填写' })} />;
}

// Every chapter opens the same way: a ruled mono head, "(NN)  Name ... aside", which rises in at its own
// rate as the chapter enters (home.css, "depth"), then the chapter's own title or device.
function SectionHead({ ch, aside }) {
  const { t } = useLang();
  const c = byId[ch];
  return (
    <header className="h-head mono">
      <span className="h-num">({c.n})</span>
      <span className="h-label">{t(c.label)}</span>
      {aside && <span className="h-aside">{aside}</span>}
    </header>
  );
}

function Path() {
  const { t } = useLang();
  return (
    <section id="path" className="h-section h-path" data-pv="0 0.9">
      <SectionHead ch="path" aside={t({ en: 'Newest first', zh: '由近及远' })} />
      <h2 className="h-display">{t({ en: 'Path', zh: '经历' })}</h2>
      <ol className="h-table">
        <li className="h-row h-row-head mono" aria-hidden="true">
          <span>{t({ en: 'When', zh: '时间' })}</span>
          <span>{t({ en: 'Where', zh: '机构' })}</span>
          <span>{t({ en: 'What', zh: '职位 / 专业' })}</span>
          <span>{t({ en: 'City', zh: '城市' })}</span>
        </li>
        {path.map((row) => {
          const org = t(row.org);
          const place = row.place ? t(row.place) : '';
          return (
            <li
              key={typeof row.when === 'string' ? row.when : 'now'}
              className={`h-row${row.now ? ' is-now' : ''}`}
            >
              <span className="h-when mono">
                {row.now && <span className="h-now-dot" data-mark="path" data-mark-kind="dot" aria-hidden="true" />}
                {t(row.when)}
                <i>{t(row.kind)}</i>
              </span>
              <span className="h-org">
                {org || (row.now ? <Blank wide /> : null)}
                {row.short && <small className="mono">{row.short}</small>}
              </span>
              <span className="h-role">{t(row.role)}</span>
              <span className="h-place mono">{place || (row.now ? <Blank /> : '')}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// the newest note carries the mark as its bullet: a pin (opened, the note is a sheet it holds)
const latest = notes.reduce((a, b) => (b.date > a.date ? b : a), notes[0])?.slug;

// Phase G: a row opens its note over the page (src/chapters/notes/, a lazy chunk fetched when the
// list is near or pointed at); the URL becomes /notes/<slug>, and Back, Esc or "All notes" return here.
const NoteView = lazy(() => import('../chapters/notes/NoteView.jsx'));
const loadNotes = () => import('../chapters/notes/NoteView.jsx');

function Notes() {
  const { lang, t } = useLang();
  const slug = useNote();
  const [ever, setEver] = useState(Boolean(slug));
  if (slug && !ever) setEver(true);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && loadNotes(), {
      rootMargin: '100% 0px',
    });
    io.observe(ref.current);
    // back from a note page loaded on its own: land on the list with that note's row focused
    let from = null;
    try {
      from = sessionStorage.getItem(RETURN_KEY);
      sessionStorage.removeItem(RETURN_KEY);
    } catch {
      /* ignore */
    }
    const timers = [];
    if (window.location.hash === '#notes') {
      const land = () => {
        const row = from && ref.current.querySelector(`[data-note="${CSS.escape(from)}"]`);
        const el = row || ref.current;
        const r = el.getBoundingClientRect();
        const y = row ? r.top + r.height / 2 - window.innerHeight / 2 : r.top;
        window.scrollTo({ top: Math.max(0, Math.round(window.scrollY + y)), behavior: 'instant' });
        row?.focus({ preventScroll: true });
      };
      // now, and again once fonts and the films above have laid out
      timers.push(requestAnimationFrame(land), window.setTimeout(land, 450));
    }
    return () => {
      io.disconnect();
      cancelAnimationFrame(timers[0]);
      window.clearTimeout(timers[1]);
    };
  }, []);
  const onRow = (e) => {
    if (!plainClick(e)) return;
    e.preventDefault();
    openNote(e.currentTarget.dataset.note, e.currentTarget);
  };
  return (
    <section id="notes" className="h-section h-notes" data-pv="0 0.9" ref={ref} onPointerOver={loadNotes} onFocus={loadNotes}>
      <SectionHead
        ch="notes"
        aside={t({ en: `Field notes · ${String(notes.length).padStart(2, '0')} entries`, zh: `${String(notes.length).padStart(2, '0')} 篇` })}
      />
      <h2 className="h-display">{t({ en: 'Notes', zh: '笔记' })}</h2>
      <ol className="h-list">
        {notes.map((note) => (
          <li key={note.slug}>
            <a href={`/notes/${note.slug}`} data-note={note.slug} onClick={onRow}>
              <span className="h-date mono">
                {note.slug === latest && (
                  <span className="h-note-dot" data-mark="notes" data-mark-kind="dot" data-raster="skip" aria-hidden="true" />
                )}
                {note.date.replaceAll('-', '.')}
              </span>
              <span className="h-title">{note.title}</span>
              <span className="h-cat mono">{noteCategory(note, lang)}</span>
              <span className="h-time mono">{noteMinutes(note, lang)}</span>
              <svg className="h-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 18L18 6M8 6h10v10" />
              </svg>
            </a>
          </li>
        ))}
      </ol>
      {/* "More ways in", cut to one quiet line (assembly plan §7): the best studies are in the page now */}
      <p className="h-studies mono">
        <a href="/lab">
          {t({ en: 'The design studies behind this page', zh: '这一页背后的设计研究' })}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 18L18 6M8 6h10v10" />
          </svg>
        </a>
        <span>{t({ en: 'Each one another way through the same facts', zh: '每一个都是走进同一组事实的另一条路' })}</span>
      </p>
      {ever && (
        <Suspense fallback={null}>
          <NoteView mode="layer" />
        </Suspense>
      )}
    </section>
  );
}

// Slim fixed bar once the hero has scrolled away: the name, the seven chapters (the one being read is
// underlined), "Short version", then the slot for the Guided mode button (phase H, src/chapters/guided/:
// it sits between the chapter list and the language switch), then the language switch.
// Phones (polish pass, 2026-11-18): the chapter list folds behind one button that names the chapter being
// read and opens the list (plus "Short version" and Studio Lens) under the bar. The bar stays away while
// you read down and while a pinned chapter fills the screen, and comes back on a deliberate scroll up.
const PHONE = '(max-width: 760px)';

// a pinned chapter fills the screen: a scroll track whose sticky viewport is stuck right now
function pinnedNow(H) {
  for (const el of document.querySelectorAll('#root [data-mark-track]')) {
    const r = el.getBoundingClientRect();
    if (r.top > 1 || r.bottom < H - 1) continue;
    for (const c of el.children) if (getComputedStyle(c).position === 'sticky') return true;
  }
  return false;
}

function Bar({ onLens }) {
  const { lang, setLang, t } = useLang();
  const [past, setPast] = useState(false);
  const [show, setShow] = useState(false);
  const [active, setActive] = useState('');
  const [menu, setMenu] = useState(false);
  const barRef = useRef(null);
  const menuRef = useRef(false);
  menuRef.current = menu;
  useEffect(() => {
    // desktop: it steps aside while you read downwards and comes back when you scroll up. Phones: it
    // comes back only after ~60 px of scrolling up between chapters, or half a screen inside a pinned one
    const phone = window.matchMedia(PHONE);
    let lastY = window.scrollY;
    let up = 0;
    let on = false;
    const onScroll = () => {
      const y = window.scrollY;
      const H = window.innerHeight;
      setPast(y > H * 0.8);
      const dy = y - lastY;
      if (Math.abs(dy) > 6) {
        up = dy < 0 ? up - dy : 0;
        lastY = y;
        if (!phone.matches) on = dy < 0;
        else if (dy > 0) on = false;
        else if (up > (pinnedNow(H) ? H * 0.5 : 60)) on = true;
        if (dy > 0 && menuRef.current) setMenu(false);
        setShow(on);
      }
      // the chapter being read: the last one whose top has passed the middle of the screen; at the very
      // end of the page, Contact (its stub is the last thing on it, whatever the window's height)
      let cur = '';
      for (const c of CHAPTERS) {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top <= H * 0.5) cur = c.id;
      }
      if (y + H >= document.documentElement.scrollHeight - 4) cur = 'contact';
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  // the phone menu closes on Esc (focus back on its button) and on a press outside the bar
  useEffect(() => {
    if (!menu) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setMenu(false);
      barRef.current?.querySelector('.h-bar-menu')?.focus();
    };
    const onDown = (e) => !barRef.current?.contains(e.target) && setMenu(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [menu]);
  const cur = byId[active];
  return (
    <header
      ref={barRef}
      className={`h-bar${past ? ' is-past' : ''}${past && (show || menu) ? ' is-on' : ''}${menu ? ' is-menu' : ''}`}
      inert={!past || undefined}
    >
      <a className="h-bar-name" href="#top">
        Damon Guan
      </a>
      <button
        type="button"
        className="h-bar-menu mono"
        aria-expanded={menu}
        aria-controls="h-bar-nav"
        onClick={() => setMenu((v) => !v)}
      >
        {cur ? (
          <>
            <span className="h-bar-menu-n">({cur.n})</span> {t(cur.label)}
          </>
        ) : (
          t({ en: 'Sections', zh: '章节' })
        )}
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d={menu ? 'M3 7.5L6 4.5L9 7.5' : 'M3 4.5L6 7.5L9 4.5'} />
        </svg>
      </button>
      <nav id="h-bar-nav" aria-label={t({ en: 'Sections', zh: '章节' })} onClick={(e) => e.target.closest('a') && setMenu(false)}>
        {BAR_NAV.map((item) => (
          <a key={item.href} href={item.href} aria-current={active === item.href.slice(1) || undefined}>
            <span className="h-bar-menu-n" aria-hidden="true">
              ({byId[item.href.slice(1)].n})
            </span>
            {t(item.label)}
          </a>
        ))}
        <a className="h-bar-short" href="/short">
          {t({ en: 'Short version', zh: '简短版' })}
        </a>
        <button
          type="button"
          className="h-bar-lens"
          onClick={() => {
            setMenu(false);
            onLens();
          }}
        >
          {t({ en: 'Studio Lens', zh: '章节透镜' })}
        </button>
      </nav>
      <GuidedButton />
      <button
        type="button"
        className="h-bar-lang"
        onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
        aria-label={langSwitchLabel(lang)}
      >
        {lang === 'en' ? '中文' : 'EN'}
      </button>
    </header>
  );
}

export default function Home() {
  const { t } = useLang();
  const [heroLens, setHeroLens] = useState('ink');
  const [workLens, setWorkLens] = useState('parcel');
  const [evalLens, setEvalLens] = useState('d20');

  const workAside =
    workLens === 'bento'
      ? { en: 'Six live Bento cards & Agent Cockpit', zh: '六张动态档案卡与智能体驾驶舱' }
      : workLens === 'receipt'
        ? { en: 'Thermal evidence ledger', zh: '热敏实证小票' }
        : workLens === 'city'
          ? { en: 'Logarithmic metric skyline', zh: '对数尺度建筑天际线' }
          : { en: 'Six parcels · open any', zh: '六只箱子 · 任选拆开' };

  const evalAside =
    evalLens === 'arena'
      ? { en: 'Live RL & Tier-3 sandbox', zh: '实时 RL 与三级确认护栏沙盒' }
      : { en: 'One die, twenty rolls', zh: '一枚骰子，二十次' };

  const workHead = <SectionHead ch="work" aside={t(workAside)} />;
  const evalHead = <SectionHead ch="evaluate" aside={t(evalAside)} />;

  const jumpTo = (targetId) => {
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const resetLenses = () => {
    setHeroLens('ink');
    setWorkLens('parcel');
    setEvalLens('d20');
  };

  const isCustomLens = heroLens !== 'ink' || workLens !== 'parcel' || evalLens !== 'd20';
  // The default view reads as one site: the lens controls stay folded into a small dock button and
  // the per-chapter lens bars only appear once a lens other than the default is chosen.
  const [dockOpen, setDockOpen] = useState(false);
  // phones: the dock button lives in the bar's menu, so the open dock takes focus from it
  const dockRef = useRef(null);
  const openLens = () => {
    setDockOpen(true);
    window.requestAnimationFrame(() => dockRef.current?.focus());
  };

  // the travelling mark (only where the films run: motion allowed and WebGL), and the depth layer
  const homeRef = useRef(null);
  useEffect(() => (staticFilms() ? undefined : startMark()), []);
  useEffect(() => startParallax(homeRef.current), []);
  // a fresh load of /#<chapter> (Notes and Close land their own anchors): src/pages/land.js, fetched
  // only when the page is opened at one of these
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!['statement', 'work', 'evaluate', 'evidence', 'path'].includes(id)) return undefined;
    let stop;
    let gone = false;
    import('./land.js').then((m) => !gone && (stop = m.default(id)));
    return () => {
      gone = true;
      stop?.();
    };
  }, []);

  return (
    <div className="home" ref={homeRef}>
      <a className="skip-link" href="#statement">
        {t({ en: 'Skip to content', zh: '跳到正文' })}
      </a>
      <Bar onLens={openLens} />
      <main id="content">
        {heroLens === 'ink' ? (
          <InkHero flow arrival nav={NAV} />
        ) : (
          <Suspense fallback={<div id="top" className="h-alt-hero" />}>
            <AltHero lens={heroLens} nav={NAV} />
          </Suspense>
        )}

        <Claim
          head={<SectionHead ch="statement" aside={t({ en: 'Thesis', zh: '主张' })} />}
        />

        <div id="work" className="h-work-host" data-pv="0 0.9">
          {isCustomLens && (
            <Suspense fallback={null}>
              <ChapterLensBar
                kind="work"
                label={t({ en: 'Work chapter mode', zh: '作品章节呈现方式' })}
                value={workLens}
                onChange={setWorkLens}
              />
            </Suspense>
          )}
          {workLens === 'parcel' ? (
            <Deferred size="work">
              <WorkFilm label={<div className="h-film-label">{workHead}</div>} />
            </Deferred>
          ) : (
            <Suspense
              fallback={
                <div className="h-embed-fallback mono">
                  {t({ en: 'Loading work chapter…', zh: '正在加载作品章节…' })}
                </div>
              }
            >
              {workLens === 'bento' ? (
                <BentoOpening standalone={false} head={workHead} />
              ) : workLens === 'receipt' ? (
                <ReceiptOpening embedded head={workHead} />
              ) : (
                <CityOpening embedded head={workHead} />
              )}
            </Suspense>
          )}
          <WorkCase />
        </div>

        <div id="evaluate" className="h-evaluate" data-pv="0 0.9">
          {isCustomLens && (
            <Suspense fallback={null}>
              <ChapterLensBar
                kind="eval"
                label={t({ en: 'Evaluation chapter mode', zh: '评测章节呈现方式' })}
                value={evalLens}
                onChange={setEvalLens}
              />
            </Suspense>
          )}
          <Suspense
            fallback={
              <div className="h-embed-fallback mono">
                {t({ en: 'Loading evaluation chapter…', zh: '正在加载评测章节…' })}
              </div>
            }
          >
            {evalLens === 'arena' ? (
              <ArenaOpening embedded head={evalHead} />
            ) : (
              <Deferred size="d20">
                <D20Chapter id={null} head={evalHead} shared />
              </Deferred>
            )}
          </Suspense>
        </div>

        <Evidence
          head={<SectionHead ch="evidence" aside={t({ en: 'Eight figures, each labelled', zh: '八个数字，各有注明' })} />}
        />
        <Path />
        <Notes />
        <Close
          head={<SectionHead ch="contact" aside={t({ en: 'A record of this visit', zh: '本次来访的记录' })} />}
        />
      </main>

      <aside
        className={`h-lens-dock${dockOpen ? ' is-open' : ''}`}
        aria-label={t({ en: 'Chapter lens switcher', zh: '整站多视角章节切换坞' })}
      >
        <button
          ref={dockRef}
          type="button"
          className="h-lens-dock-title"
          aria-expanded={dockOpen}
          aria-controls="h-lens-groups"
          aria-label={t({ en: 'Studio Lens: switch how each chapter is shown', zh: '章节透镜：切换各章节的呈现方式' })}
          onClick={() => setDockOpen((v) => !v)}
          onPointerEnter={loadLens}
          onFocus={loadLens}
        >
          {t({ en: 'Studio Lens', zh: '章节透镜' })}
          {isCustomLens && <i className="h-lens-dot" aria-hidden="true" />}
          <span aria-hidden="true">{dockOpen ? '×' : '+'}</span>
        </button>
        <div id="h-lens-groups" className="h-lens-groups" hidden={!dockOpen}>
          {dockOpen && (
            <Suspense fallback={null}>
              <LensGroups
                value={{ hero: heroLens, work: workLens, eval: evalLens }}
                onPick={(kind, id) => {
                  ({ hero: setHeroLens, work: setWorkLens, eval: setEvalLens })[kind](id);
                  jumpTo({ hero: 'top', work: 'work', eval: 'evaluate' }[kind]);
                }}
                onReset={resetLenses}
              />
            </Suspense>
          )}
        </div>
      </aside>

      <footer className="h-foot mono">
        <span>© 2026 Damon Guan</span>
        <a href="/lab">{t({ en: 'Design studies', zh: '设计研究' })} →</a>
        <a href="#top">{t({ en: 'Back to top', zh: '回到顶部' })} ↑</a>
      </footer>
    </div>
  );
}
