import { useEffect, useLayoutEffect, useRef } from 'react';
import { langSwitchLabel, useLang } from '../../i18n.jsx';
import { joinParts, profile } from '../../content.js';
import { initInk } from './ink.js';
import { wantArrival } from './arrival.js';
import './ink.css';

// The ink video in two encodings; if neither plays, the ink is generated in the shader instead.
const SOURCES = [
  <source key="webm" src="/ink/ink.webm" type="video/webm" />,
  <source key="mp4" src="/ink/ink.mp4" type="video/mp4" />,
];

const STUDIES = ['parcel', 'descent', 'rollout'].map((name) => ({ href: `/${name}`, label: name }));

// One ink hero, two settings. Standalone (/ink): fixed full screen, corner links to the studies.
// Home (`flow`): first 100svh of the page in normal flow, corner links are the page's anchors,
// and vertical swipes scroll the page while still painting. `arrival` (home only): the first load of a
// session opens with the hairline-to-pill intro (arrival.js); decided before first paint.
export default function InkHero({ flow = false, nav = STUDIES, arrival = false }) {
  const hero = useRef(null);
  const { lang, setLang, t } = useLang();
  const stop = useRef(null);
  const arrive = useRef(false);
  useLayoutEffect(() => {
    arrive.current = arrival && wantArrival();
    if (arrive.current) hero.current.classList.add('is-arriving');
  }, [arrival]);
  useEffect(() => initInk(hero.current, { arrive: arrive.current }), []);
  // Home: the travelling mark starts as the full stop after the wordmark. The wordmark itself is drawn
  // in the ink canvas from the DOM word's position, so the stop is placed from the same measurements.
  useEffect(() => {
    if (!flow) return undefined;
    const el = hero.current;
    const place = () => {
      const word = el.querySelector('[data-word] span');
      const base = el.querySelector('[data-baseline]');
      if (!word || !base || !stop.current) return;
      const h = el.getBoundingClientRect();
      const size = h.width < 480 ? 11 : 14;
      const x = word.getBoundingClientRect().right - h.left + (h.width < 480 ? 3 : 6);
      const y = base.getBoundingClientRect().bottom - h.top - size;
      Object.assign(stop.current.style, { left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size}px` });
      // offset from the hero's centre, so the stop follows the canvas when it scales on scroll
      stop.current.style.setProperty('--dx', (x + size / 2 - h.width / 2).toFixed(1));
      stop.current.style.setProperty('--dy', (y + size / 2 - h.height / 2).toFixed(1));
    };
    let raf = requestAnimationFrame(place);
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(place);
    };
    window.addEventListener('resize', onResize);
    document.fonts?.load('900 100px "Archivo Variable"').then(onResize); // the wordmark's font: place the stop early
    document.fonts?.ready.then(onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [flow]);
  return (
    <>
      <section
        className={`ink${flow ? ' is-flow' : ''}`}
        ref={hero}
        id={flow ? 'top' : undefined}
        data-pv={flow ? '1 2' : undefined}
        data-pointer={flow ? '' : undefined}
      >
        <h1 className="ink-word" data-word>
          <span>DAMON GUAN</span>
          <i className="ink-baseline" data-baseline />
        </h1>
        <canvas aria-hidden="true" />
        {flow && <i ref={stop} className="ink-stop" data-mark="hero" data-mark-kind="dot" aria-hidden="true" />}
        <div className="ink-ui ink-tl">
          <div className="ink-eyebrow">{joinParts([t(profile.role), t(profile.org)])}</div>
          <p>
            {flow
              ? t({ en: 'Agentic RL, post-training and evaluation.', zh: 'Agentic RL、后训练与评测。' })
              : t({
                  en: 'I train language agents, then measure whether they hold up on real work.',
                  zh: '我训练语言智能体，再检验它们在真实工作中是否站得住。',
                })}
          </p>
          <a className="ink-pill" href={flow ? '#contact' : `mailto:${profile.email}`} data-big>
            {t({ en: 'Get in touch', zh: '联系我' })}
            <svg viewBox="0 0 8 8" aria-hidden="true">
              <path d="M2 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </a>
          {flow && (
            <a className="ink-short" href="/short" data-big>
              {t({ en: 'Short version', zh: '简短版' })} →
            </a>
          )}
        </div>
        <nav className="ink-ui ink-nav" aria-label={flow ? t({ en: 'Sections', zh: '章节' }) : undefined}>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <i />
                <a href={item.href} data-big>
                  {t(item.label)}
                </a>
              </li>
            ))}
            <li>
              <i />
              <button
                type="button"
                data-big
                onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
                aria-label={langSwitchLabel(lang)}
              >
                {lang === 'en' ? '中文' : 'EN'}
              </button>
            </li>
          </ul>
        </nav>
        {flow ? (
          <a className="ink-ui ink-bl" href="#statement" data-big>
            <span className="ink-dash" />
            {t({ en: 'Scroll', zh: '向下滚动' })}
          </a>
        ) : (
          <a className="ink-ui ink-bl" href="/lab" data-big>
            <span className="ink-dash" />
            {t({ en: 'Design studies', zh: '设计研究' })}
          </a>
        )}
        <div className="ink-ui ink-br" aria-hidden="true">
          {t({ en: 'Roam to unveil', zh: '移动光标，揭开画面' })}
        </div>
        <video className="ink-video" muted playsInline autoPlay preload="auto" aria-hidden="true">
          {SOURCES}
        </video>
        {/* the loop's twin waits until the first copy can play through (see ink.js), so first paint fetches one */}
        <video className="ink-video" muted playsInline preload="none" aria-hidden="true">
          {SOURCES}
        </video>
      </section>
      <div className="ink-cursor" data-ink-cursor />
    </>
  );
}
