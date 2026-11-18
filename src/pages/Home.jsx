import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { langSwitchLabel, useLang } from '../i18n.jsx';
import { path, profile } from '../content.js';
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
const TypistOpening = lazy(() => import('../directions/typist/Opening.jsx'));
const ShadowOpening = lazy(() => import('../directions/shadow/Opening.jsx'));
const ReceiptOpening = lazy(() => import('../directions/receipt/Opening.jsx'));
const CityOpening = lazy(() => import('../directions/city/Opening.jsx'));
const ArenaOpening = lazy(() => import('../directions/arena/Opening.jsx'));

const HERO_LENSES = [
  { id: 'ink', label: { en: '01 · Wet Ink', zh: '01 · 湿墨揭幕' }, short: { en: '01 Ink', zh: '01 湿墨' } },
  { id: 'shadow', label: { en: '10 · 318° Shadow', zh: '10 · 318° 光影' }, short: { en: '10 Shadow', zh: '10 光影' } },
  { id: 'typist', label: { en: '09 · Token Typist', zh: '09 · 策略逐词' }, short: { en: '09 Typist', zh: '09 逐词' } },
];

const WORK_LENSES = [
  { id: 'parcel', label: { en: '02 · Parcel Box', zh: '02 · 快递拆盒' }, short: { en: '02 Parcel', zh: '02 快递' } },
  { id: 'bento', label: { en: '08 · Bento Cards', zh: '08 · Bento 卡片' }, short: { en: '08 Bento', zh: '08 卡片' } },
  { id: 'receipt', label: { en: '11 · Thermal Receipt', zh: '11 · 实证小票' }, short: { en: '11 Receipt', zh: '11 小票' } },
  { id: 'city', label: { en: '12 · Metric City', zh: '12 · 尺度天际线' }, short: { en: '12 City', zh: '12 建筑' } },
];

const EVAL_LENSES = [
  { id: 'd20', label: { en: '05 · D20 Die', zh: '05 · 二十面骰' }, short: { en: '05 D20', zh: '05 骰子' } },
  { id: 'arena', label: { en: '13 · Agent Arena', zh: '13 · 对抗沙盒' }, short: { en: '13 Arena', zh: '13 沙盒' } },
];

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
function Bar() {
  const { lang, setLang, t } = useLang();
  const [past, setPast] = useState(false);
  const [down, setDown] = useState(false);
  const [active, setActive] = useState('');
  const navRef = useRef(null);
  // on the phone strip, keep the section in view centred
  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector('[aria-current]');
    if (!link || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2, behavior: reduced() ? 'auto' : 'smooth' });
  }, [active]);
  useEffect(() => {
    // it steps aside while you read downwards and comes back when you scroll up
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const H = window.innerHeight;
      setPast(y > H * 0.8);
      if (Math.abs(y - lastY) > 6) {
        setDown(y > lastY);
        lastY = y;
      }
      // the chapter being read: the last one whose top has passed the middle of the screen; at the very
      // end of the page, Contact (its stub is the last thing on it, whatever the window's height)
      let on = '';
      for (const c of CHAPTERS) {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top <= H * 0.5) on = c.id;
      }
      if (y + H >= document.documentElement.scrollHeight - 4) on = 'contact';
      setActive(on);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return (
    <header className={`h-bar${past ? ' is-past' : ''}${past && !down ? ' is-on' : ''}`} inert={!past || undefined}>
      <a className="h-bar-name" href="#top">
        Damon Guan
      </a>
      <nav ref={navRef} aria-label={t({ en: 'Sections', zh: '章节' })}>
        {BAR_NAV.map((item) => (
          <a key={item.href} href={item.href} aria-current={active === item.href.slice(1) || undefined}>
            {t(item.label)}
          </a>
        ))}
        <a className="h-bar-short" href="/short">
          {t({ en: 'Short version', zh: '简短版' })}
        </a>
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

function ChapterLensBar({ label, options, value, onChange, href }) {
  const { t } = useLang();
  return (
    <div className="h-chapter-bar">
      <div className="h-lens-tabs" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={value === opt.id ? 'is-active' : undefined}
            aria-pressed={value === opt.id}
            onClick={() => onChange(opt.id)}
          >
            {t(opt.label)}
          </button>
        ))}
      </div>
      {href && (
        <a className="mono" href={href}>
          {t({ en: 'Open standalone', zh: '独立全屏体验' })} →
        </a>
      )}
    </div>
  );
}

export default function Home() {
  const { lang, setLang, t } = useLang();
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

  // the travelling mark (only where the films run: motion allowed and WebGL), and the depth layer
  const homeRef = useRef(null);
  useEffect(() => (staticFilms() ? undefined : startMark()), []);
  useEffect(() => startParallax(homeRef.current), []);

  return (
    <div className="home" ref={homeRef}>
      <a className="skip-link" href="#statement">
        {t({ en: 'Skip to content', zh: '跳到正文' })}
      </a>
      <Bar />
      <main id="content">
        {heroLens === 'ink' ? (
          <InkHero flow arrival nav={NAV} />
        ) : (
          <div id="top" className="h-alt-hero">
            <div className="h-alt-hero-nav">
              <a className="h-alt-hero-brand" href="#top">
                {profile.name}
              </a>
              <nav aria-label={t({ en: 'Sections', zh: '章节' })}>
                {NAV.map((item) => (
                  <a key={item.href} href={item.href}>
                    {t(item.label)}
                  </a>
                ))}
                <a href="/lab">{t({ en: 'Studies', zh: '研究' })}</a>
                <button type="button" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} aria-label={langSwitchLabel(lang)}>
                  {lang === 'en' ? '中文' : 'EN'}
                </button>
              </nav>
            </div>
            <Suspense
              fallback={
                <div className="h-embed-fallback mono">
                  {t({ en: 'Loading opening study…', zh: '正在加载开场方案…' })}
                </div>
              }
            >
              {heroLens === 'shadow' ? <ShadowOpening embedded /> : <TypistOpening embedded />}
            </Suspense>
          </div>
        )}

        <Claim
          head={<SectionHead ch="statement" aside={t({ en: 'Thesis', zh: '主张' })} />}
        />

        <div id="work" className="h-work-host" data-pv="0 0.9">
          {isCustomLens && (
            <ChapterLensBar
              label={t({ en: 'Work chapter mode', zh: '作品章节呈现方式' })}
              options={WORK_LENSES}
              value={workLens}
              onChange={setWorkLens}
              href={`/${workLens}`}
            />
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
            <ChapterLensBar
              label={t({ en: 'Evaluation chapter mode', zh: '评测章节呈现方式' })}
              options={EVAL_LENSES}
              value={evalLens}
              onChange={setEvalLens}
              href={`/${evalLens}`}
            />
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
          type="button"
          className="h-lens-dock-title"
          aria-expanded={dockOpen}
          aria-controls="h-lens-groups"
          aria-label={t({ en: 'Studio Lens: switch how each chapter is shown', zh: '章节透镜：切换各章节的呈现方式' })}
          onClick={() => setDockOpen((v) => !v)}
        >
          {t({ en: 'Studio Lens', zh: '章节透镜' })}
          {isCustomLens && <i className="h-lens-dot" aria-hidden="true" />}
          <span aria-hidden="true">{dockOpen ? '×' : '+'}</span>
        </button>
        <div id="h-lens-groups" className="h-lens-groups" hidden={!dockOpen}>
          <div className="h-lens-group">
            <span>{t({ en: 'Hero', zh: '开场' })}</span>
            {HERO_LENSES.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={heroLens === opt.id ? 'is-active' : undefined}
                onClick={() => {
                  setHeroLens(opt.id);
                  jumpTo('top');
                }}
              >
                {t(opt.short)}
              </button>
            ))}
          </div>
          <div className="h-lens-group">
            <span>{t({ en: 'Work', zh: '作品' })}</span>
            {WORK_LENSES.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={workLens === opt.id ? 'is-active' : undefined}
                onClick={() => {
                  setWorkLens(opt.id);
                  jumpTo('work');
                }}
              >
                {t(opt.short)}
              </button>
            ))}
          </div>
          <div className="h-lens-group">
            <span>{t({ en: 'Eval', zh: '评测' })}</span>
            {EVAL_LENSES.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={evalLens === opt.id ? 'is-active' : undefined}
                onClick={() => {
                  setEvalLens(opt.id);
                  jumpTo('evaluate');
                }}
              >
                {t(opt.short)}
              </button>
            ))}
          </div>
          {isCustomLens && (
            <button type="button" className="h-lens-reset" onClick={resetLenses}>
              {t({ en: 'Reset', zh: '恢复默认' })}
            </button>
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
