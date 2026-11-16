import { useEffect } from 'react';
import { langSwitchLabel, useLang } from '../i18n.jsx';
import { noteCategory, noteMinutes, notes } from '../notes.js';
import './home.css';

export default function Note() {
  const { lang, setLang, t } = useLang();
  const slug = window.location.pathname.replace(/\/+$/, '').split('/').pop();
  const index = notes.findIndex((n) => n.slug === slug);
  const note = notes[index];
  const next = notes[(index + 1) % notes.length];

  useEffect(() => {
    document.title = note ? `${note.title} — Damon Guan` : 'Note not found — Damon Guan';
    window.scrollTo(0, 0);
  }, [note]);

  return (
    <div className="note">
      <a className="skip-link" href="#content">
        {t({ en: 'Skip to content', zh: '跳到正文' })}
      </a>
      <header className="n-top mono">
        <a className="n-brand" href="/">
          Damon Guan
        </a>
        <nav aria-label={t({ en: 'Site', zh: '站点' })}>
          <a href="/#notes">← {t({ en: 'All notes', zh: '全部笔记' })}</a>
          <button type="button" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} aria-label={langSwitchLabel(lang)}>
            {lang === 'en' ? '中文' : 'EN'}
          </button>
        </nav>
      </header>
      {note ? (
        <main id="content">
          <article>
            <header className="n-head">
              <p className="h-head mono">
                <span className="h-num">
                  {t({ en: 'Field note', zh: '笔记' })} {String(index + 1).padStart(2, '0')}/
                  {String(notes.length).padStart(2, '0')}
                </span>
                <span className="h-label">{noteCategory(note, lang)}</span>
                <span className="h-aside">{note.date.replaceAll('-', '.')}</span>
              </p>
              <h1>{note.title}</h1>
              <p className="n-excerpt">{note.excerpt}</p>
            </header>
            <div className="n-body">
              <aside className="n-side mono">
                <span>{noteMinutes(note, lang, true)}</span>
                <b>{note.tags.join(' · ')}</b>
                {lang === 'zh' && <span>{t({ en: '', zh: '本文仅有英文版。' })}</span>}
              </aside>
              {/* trusted, author-written HTML from src/notes.js */}
              <div className="n-prose" dangerouslySetInnerHTML={{ __html: note.content }} />
            </div>
          </article>
          {next && next !== note && (
            <a className="n-next" href={`/notes/${next.slug}`}>
              <span className="mono">{t({ en: 'Next note', zh: '下一篇' })} →</span>
              <strong>{next.title}</strong>
            </a>
          )}
        </main>
      ) : (
        <main id="content" className="n-head">
          <p className="h-head mono">
            <span className="h-num">404</span>
            <span className="h-label">{t({ en: 'Not found', zh: '未找到' })}</span>
          </p>
          <h1>{t({ en: 'No note here.', zh: '这里没有笔记。' })}</h1>
          <p className="n-excerpt">
            <a href="/#notes">← {t({ en: 'All notes', zh: '全部笔记' })}</a>
          </p>
        </main>
      )}
      <footer className="n-foot mono">
        <span>© 2026 Damon Guan</span>
        <a href="/lab">{t({ en: 'Design studies', zh: '设计研究' })} →</a>
      </footer>
    </div>
  );
}
