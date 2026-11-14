import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { path, profile } from '../content.js';
import { notes } from '../notes.js';
import InkHero from '../directions/ink/InkHero.jsx';
import ParcelFilm from '../directions/parcel/ParcelFilm.jsx';
import './home.css';

const D20Chapter = lazy(() => import('../directions/d20/D20Chapter.jsx'));

const NAV = [
  { href: '#work', label: { en: 'Work', zh: '作品' } },
  { href: '#evaluate', label: { en: 'Evaluate', zh: '评测' } },
  { href: '#path', label: { en: 'Path', zh: '经历' } },
  { href: '#notes', label: { en: 'Notes', zh: '笔记' } },
  { href: '#contact', label: { en: 'Contact', zh: '联系' } },
];

const STATEMENT = {
  en: 'I train language agents, then measure whether they hold up on real work.',
  zh: '我训练语言智能体，再检验它们在真实工作中是否站得住。',
};

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// A blank that the owner fills in later: a long rule, read out as "to be filled in".
function Blank({ wide }) {
  const { t } = useLang();
  return <span className={`h-blank${wide ? ' is-wide' : ''}`} role="img" aria-label={t({ en: 'to be filled in', zh: '待填写' })} />;
}

function SectionHead({ n, children, aside }) {
  return (
    <header className="h-head mono">
      <span className="h-num">({n})</span>
      <span className="h-label">{children}</span>
      {aside && <span className="h-aside">{aside}</span>}
    </header>
  );
}

// Splits the sentence into words (Chinese by word segmentation), keeping punctuation on the word before.
function words(text, lang) {
  if (lang !== 'zh') return text.split(' ');
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('zh', { granularity: 'word' }) : null;
  const parts = seg ? [...seg.segment(text)].map((s) => s.segment) : [...text];
  return parts.reduce((out, part) => {
    if (/^[，。、；：！？,.]$/.test(part) && out.length) out[out.length - 1] += part;
    else out.push(part);
    return out;
  }, []);
}

function Statement() {
  const { lang, t } = useLang();
  const ref = useRef(null);
  const list = useMemo(() => words(STATEMENT[lang] ?? STATEMENT.en, lang), [lang]);

  // words go from muted to ink as they pass the middle of the viewport
  useEffect(() => {
    const el = ref.current;
    const spans = [...el.querySelectorAll('[data-w]')];
    if (reduced()) {
      spans.forEach((s) => s.classList.add('is-lit'));
      return undefined;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.6;
      spans.forEach((s) => s.classList.toggle('is-lit', s.getBoundingClientRect().top < line));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [list]);

  const last = list.length - 1;
  return (
    <section id="statement" className="h-section h-statement">
      <SectionHead n="01" aside={t({ en: 'Thesis', zh: '主张' })}>
        {t({ en: 'Statement', zh: '自述' })}
      </SectionHead>
      <h2 className="h-sentence" ref={ref} aria-label={t(STATEMENT)}>
        {list.map((w, i) => {
          const stop = i === last && /[.。]$/.test(w);
          return (
            <span key={`${lang}-${i}`} data-w aria-hidden="true">
              {stop ? w.slice(0, -1) : w}
              {stop && <span className="h-stop">{w.slice(-1)}</span>}
              {lang !== 'zh' && i < last ? ' ' : ''}
            </span>
          );
        })}
      </h2>
      <ul className="h-facets mono">
        {['Agentic RL', 'Post-training', 'Evaluation'].map((f, i) => (
          <li key={f}>
            <span>0{i + 1}</span>
            {f}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Path() {
  const { t } = useLang();
  return (
    <section id="path" className="h-section h-path">
      <SectionHead n="04" aside={t({ en: 'Newest first', zh: '由近及远' })}>
        {t({ en: 'Path', zh: '经历' })}
      </SectionHead>
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
            <li key={typeof row.when === 'string' ? row.when : 'now'} className={`h-row${row.now ? ' is-now' : ''}`}>
              <span className="h-when mono">
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

function Notes() {
  const { t } = useLang();
  return (
    <section id="notes" className="h-section h-notes">
      <SectionHead n="05" aside={`${String(notes.length).padStart(2, '0')} ${t({ en: 'entries', zh: '篇' })}`}>
        {t({ en: 'Field notes', zh: '笔记' })}
      </SectionHead>
      <h2 className="h-display">{t({ en: 'Notes', zh: '笔记' })}</h2>
      <ol className="h-list">
        {notes.map((note) => (
          <li key={note.slug}>
            <a href={`/notes/${note.slug}`}>
              <span className="h-date mono">{note.date.replaceAll('-', '.')}</span>
              <span className="h-title">{note.title}</span>
              <span className="h-cat mono">{note.category}</span>
              <span className="h-time mono">{note.readingTime.replace(' read', '')}</span>
              <svg className="h-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 18L18 6M8 6h10v10" />
              </svg>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Contact() {
  const { t } = useLang();
  const [user, domain] = profile.email.split('@');
  return (
    <section id="contact" className="h-section h-contact">
      <SectionHead n="06" aside={t({ en: 'Email is best', zh: '邮件最快' })}>
        {t({ en: 'Contact', zh: '联系' })}
      </SectionHead>
      <a className="h-email" href={`mailto:${profile.email}`}>
        {user}
        <span className="h-at">@</span>
        {domain}
      </a>
      <ul className="h-links">
        {profile.links.map((link) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noreferrer">
              {link.label}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 18L18 6M8 6h10v10" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Slim fixed bar once the hero has scrolled away; it marks the section in view.
function Bar() {
  const { lang, setLang, t } = useLang();
  const [past, setPast] = useState(false);
  const [down, setDown] = useState(false);
  const [active, setActive] = useState('');
  useEffect(() => {
    // it steps aside while you read downwards and comes back when you scroll up
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setPast(y > window.innerHeight * 0.8);
      if (Math.abs(y - lastY) > 6) {
        setDown(y > lastY);
        lastY = y;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-50% 0px -50% 0px' },
    );
    ['statement', 'work', 'evaluate', 'path', 'notes', 'contact'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);
  return (
    <header className={`h-bar${past ? ' is-past' : ''}${past && !down ? ' is-on' : ''}`} inert={!past || undefined}>
      <a className="h-bar-name" href="#top">
        Damon Guan
      </a>
      <nav aria-label={t({ en: 'Sections', zh: '章节' })}>
        {NAV.map((item) => (
          <a key={item.href} href={item.href} aria-current={active === item.href.slice(1) || undefined}>
            {t(item.label)}
          </a>
        ))}
        <button type="button" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} aria-label="Switch language">
          {lang === 'en' ? '中文' : 'EN'}
        </button>
      </nav>
    </header>
  );
}

export default function Home() {
  const { t } = useLang();
  return (
    <div className="home">
      <Bar />
      <main>
        <InkHero flow nav={NAV} />
        <Statement />
        <ParcelFilm
          paper
          id="work"
          label={
            <div className="h-film-label">
              <SectionHead n="02" aside={t({ en: 'Six projects, packed', zh: '六个项目，装箱' })}>
                {t({ en: 'Work', zh: '作品' })}
              </SectionHead>
            </div>
          }
        />
        <div id="evaluate" className="h-evaluate">
          <Suspense fallback={null}>
            <D20Chapter
              id={null}
              head={
                <SectionHead n="03" aside={t({ en: 'One die, twenty rolls', zh: '一枚骰子，二十次' })}>
                  {t({ en: 'Evaluate', zh: '评测' })}
                </SectionHead>
              }
            />
          </Suspense>
        </div>
        <Path />
        <Notes />
        <Contact />
      </main>
      <footer className="h-foot mono">
        <span>© 2026 Damon Guan</span>
        <a href="/lab">{t({ en: 'Design studies', zh: '设计研究' })} →</a>
        <a href="#top">{t({ en: 'Back to top', zh: '回到顶部' })} ↑</a>
      </footer>
    </div>
  );
}
