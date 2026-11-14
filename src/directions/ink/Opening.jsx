import { useEffect, useRef } from 'react';
import { useLang } from '../../i18n.jsx';
import { profile } from '../../content.js';
import { initInk } from './ink.js';
import './ink.css';

const VIDEO = '/ink/ink.mp4'; // optional: when the file is missing the ink is generated in the shader

export default function InkOpening() {
  const hero = useRef(null);
  const { lang, setLang, t } = useLang();
  useEffect(() => initInk(hero.current), []);
  return (
    <>
      <section className="ink" ref={hero}>
        <h1 className="ink-word" data-word>
          <span>DAMON GUAN</span>
          <i className="ink-baseline" data-baseline />
        </h1>
        <canvas aria-hidden="true" />
        <div className="ink-ui ink-tl">
          <div className="ink-eyebrow">
            {t(profile.role)} · {t(profile.org)}
          </div>
          <p>
            {t({
              en: 'I train language agents, then measure whether they hold up on real work.',
              zh: '我训练语言智能体，再检验它们在真实工作中是否站得住。',
            })}
          </p>
          <a className="ink-pill" href={`mailto:${profile.email}`} data-big>
            {t({ en: 'Get in touch', zh: '联系我' })}
            <svg viewBox="0 0 8 8" aria-hidden="true">
              <path d="M2 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </a>
        </div>
        <ul className="ink-ui ink-nav">
          {['parcel', 'descent', 'rollout'].map((name) => (
            <li key={name}>
              <i />
              <a href={`/${name}`} data-big>
                {name}
              </a>
            </li>
          ))}
          <li>
            <i />
            <button type="button" data-big onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}>
              {lang === 'en' ? '中文' : 'EN'}
            </button>
          </li>
        </ul>
        <a className="ink-ui ink-bl" href="/" data-big>
          <span className="ink-dash" />
          {t({ en: 'All openings', zh: '全部方案' })}
        </a>
        <div className="ink-ui ink-br">{t({ en: 'Roam to unveil', zh: '移动光标，揭开画面' })}</div>
        <video className="ink-video" src={VIDEO} muted playsInline autoPlay preload="auto" />
        <video className="ink-video" src={VIDEO} muted playsInline preload="auto" />
      </section>
      <div className="ink-cursor" data-ink-cursor />
    </>
  );
}
