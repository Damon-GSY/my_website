import { useEffect } from 'react';
import { langSwitchLabel, useLang } from '../../i18n.jsx';

// Once the page is idle, get the run ready to open in place (src/engine/nav.js): its chunk, the page
// change's chunk, and the run's WebGL probe (making a context can take a while; it should not be paid in
// the middle of the transition, where the run would probe on mount).
let warmed = false;
function warm() {
  if (warmed) return;
  warmed = true;
  const go = () => {
    import('../Home.jsx');
    import('../../engine/navMove.js');
    import('../../engine/webgl.js').then((m) => m.hasWebGL2()); // the run's own probe, cached
  };
  if (window.requestIdleCallback) window.requestIdleCallback(go, { timeout: 4000 });
  else window.setTimeout(go, 1500);
}

// The run's top bar (src/pages/Home.jsx, `Bar`), for the pages around it: the name, where else to go,
// the language switch. Always shown; `current` underlines the page you are on.
export default function AroundBar({ current, children }) {
  const { lang, setLang, t } = useLang();
  useEffect(() => {
    const id = window.setTimeout(warm, 1200);
    return () => window.clearTimeout(id);
  }, []);
  const links = [
    { id: 'run', href: '/', label: { en: 'The run', zh: '主站' } },
    { id: 'lab', href: '/lab', label: { en: 'Studies', zh: '研究' } },
    { id: 'short', href: '/short', label: { en: 'Short version', zh: '简短版' }, wide: true },
  ];
  return (
    <header className="ar-bar">
      <a className="ar-bar-name" href="/">
        Damon Guan
      </a>
      <nav aria-label={t({ en: 'Site', zh: '站点' })}>
        {children}
        {links.map((l) => (
          <a
            key={l.id}
            href={l.href}
            className={l.wide ? 'ar-wide' : undefined}
            aria-current={current === l.id ? 'page' : undefined}
          >
            {t(l.label)}
          </a>
        ))}
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
  );
}
