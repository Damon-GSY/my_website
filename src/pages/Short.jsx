import { useEffect } from 'react';
import { langSwitchLabel, useLang } from '../i18n.jsx';
import { navigate } from '../engine/nav.js';
import './around/around.css';

// /short: the sixty-second version (assembly plan §3, "Short" mode). The bento study (built from Damon's
// brief, public/lab/bento/) runs as it is, in its own palette, inside the run's bar: the bar names it
// and holds the way back to the full site, with the mark as its one accent.

export default function Short() {
  const { lang, setLang, t } = useLang();
  useEffect(() => {
    document.title = `${t({ en: 'The short version', zh: '简短版' })} — Damon Guan`;
  }, [t]);
  // the bento's own links (home, /lab, a note) open in the page, not inside the frame; the site's pages
  // change in place, with the mark (src/engine/nav.js), like any other link between them
  const onLoad = (e) => {
    try {
      const d = e.currentTarget.contentDocument;
      if (d && !d.querySelector('base')) {
        const base = d.createElement('base');
        base.target = '_top';
        d.head.appendChild(base);
        d.addEventListener('click', (ev) => {
          const a = ev.target.closest?.('a[href]');
          if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
          if (navigate(a.href)) ev.preventDefault();
        });
      }
    } catch {
      /* not same-origin: leave it */
    }
  };
  return (
    <div className="ar ar-short">
      <header className="ar-bar">
        <a className="ar-bar-name ar-wide" href="/">
          Damon Guan
        </a>
        <h1 className="sh-what mono">
          <span className="sh-mark" aria-hidden="true" />
          {t({ en: 'The 60-second version', zh: '60 秒版本' })}
        </h1>
        <nav aria-label={t({ en: 'Site', zh: '站点' })}>
          <a className="sh-full" href="/">
            {t({ en: 'Full site', zh: '完整网站' })}
            <span className="sh-arrow" aria-hidden="true">
              →
            </span>
          </a>
          <a className="ar-wide" href="/lab">
            {t({ en: 'Studies', zh: '研究' })}
          </a>
        </nav>
        <button
          type="button"
          className="ar-bar-lang"
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          aria-label={langSwitchLabel(lang)}
        >
          {lang === 'en' ? '中文' : 'EN'}
        </button>
      </header>
      <main id="content" className="sh-stage">
        <iframe src="/lab/bento/" title={t({ en: 'Damon Guan, the short version', zh: 'Damon Guan 简短版' })} onLoad={onLoad} />
      </main>
    </div>
  );
}
