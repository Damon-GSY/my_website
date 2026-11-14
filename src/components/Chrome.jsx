import { useLang } from '../i18n.jsx';
import { joinParts, profile } from '../content.js';

export function Header() {
  const { lang, setLang, t } = useLang();
  return (
    <header className="chrome">
      <a className="chrome-brand" href="/">
        {profile.name}
        <span>{joinParts([t(profile.role), t(profile.org), t(profile.city)])}</span>
      </a>
      <nav>
        <a href="/lab">{t({ en: 'Design studies', zh: '设计研究' })}</a>
        <button type="button" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} aria-label="Switch language">
          {lang === 'en' ? '中文' : 'EN'}
        </button>
      </nav>
    </header>
  );
}

export function Outro({ current }) {
  const { t } = useLang();
  const others = ['ink', 'parcel', 'descent', 'rollout'].filter((name) => name !== current);
  return (
    <footer className="outro">
      <p>
        {t({
          en: 'This is an opening study. The full site continues from here.',
          zh: '这是开场方案之一，完整网站将从这里继续。',
        })}
      </p>
      <nav>
        {others.map((name) => (
          <a key={name} href={`/${name}`}>
            {name} ↗
          </a>
        ))}
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </nav>
    </footer>
  );
}
