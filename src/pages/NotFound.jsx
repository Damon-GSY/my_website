import { langSwitchLabel, useLang } from '../i18n.jsx';
import './home.css';

// Unknown paths: the note page's frame with the home page's display type.
export default function NotFound() {
  const { lang, setLang, t } = useLang();
  return (
    <div className="note nf">
      <a className="skip-link" href="#content">
        {t({ en: 'Skip to content', zh: '跳到正文' })}
      </a>
      <header className="n-top mono">
        <a className="n-brand" href="/">
          Damon Guan
        </a>
        <nav aria-label={t({ en: 'Site', zh: '站点' })}>
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            aria-label={langSwitchLabel(lang)}
          >
            {lang === 'en' ? '中文' : 'EN'}
          </button>
        </nav>
      </header>
      <main id="content" className="nf-main">
        <p className="h-head mono">
          <span className="h-num">404</span>
          <span className="h-label">{t({ en: 'Not found', zh: '未找到' })}</span>
        </p>
        <h1 className="h-display">404</h1>
        <p className="n-excerpt">{t({ en: 'Nothing lives at this address.', zh: '这个地址下什么也没有。' })}</p>
        <p className="nf-links mono">
          <a href="/">← {t({ en: 'Home', zh: '首页' })}</a>
          <a href="/lab">{t({ en: 'Design studies', zh: '设计研究' })} →</a>
        </p>
      </main>
      <footer className="n-foot mono">
        <span>© 2026 Damon Guan</span>
      </footer>
    </div>
  );
}
