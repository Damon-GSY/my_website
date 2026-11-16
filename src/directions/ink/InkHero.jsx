import { useEffect, useRef } from 'react';
import { langSwitchLabel, useLang } from '../../i18n.jsx';
import { joinParts, profile } from '../../content.js';
import { initInk } from './ink.js';
import './ink.css';

// The ink video in two encodings; if neither plays, the ink is generated in the shader instead.
const SOURCES = [
  <source key="webm" src="/ink/ink.webm" type="video/webm" />,
  <source key="mp4" src="/ink/ink.mp4" type="video/mp4" />,
];

const STUDIES = ['parcel', 'descent', 'rollout'].map((name) => ({ href: `/${name}`, label: name }));

// One ink hero, two settings. Standalone (/ink): fixed full screen, corner links to the studies.
// Home (`flow`): first 100svh of the page in normal flow, corner links are the page's anchors,
// and vertical swipes scroll the page while still painting.
export default function InkHero({ flow = false, nav = STUDIES }) {
  const hero = useRef(null);
  const { lang, setLang, t } = useLang();
  useEffect(() => initInk(hero.current), []);
  return (
    <>
      <section className={`ink${flow ? ' is-flow' : ''}`} ref={hero} id={flow ? 'top' : undefined}>
        <h1 className="ink-word" data-word>
          <span>DAMON GUAN</span>
          <i className="ink-baseline" data-baseline />
        </h1>
        <canvas aria-hidden="true" />
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
