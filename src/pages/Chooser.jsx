import { useEffect } from 'react';
import { useLang } from '../i18n.jsx';
import AroundBar from './around/Bar.jsx';
import { ASSEMBLY, BOARDS, CREDIT, KEPT, STUDIES } from './around/run.js';
import './around/around.css';

// /lab: the archive of studies. The site is one run; this page shows what it was assembled from — each
// chapter of the run beside the studies it came out of, then the studies that stayed studies, then the
// eight concept boards. Screenshots only (public/lab/thumbs/, lazy), no iframes, no WebGL.

const thumb = (id) => `/lab/thumbs/${id}.webp`;
const rowOf = Object.fromEntries(ASSEMBLY.flatMap((row) => row.from.map((id) => [id, row])));
const rowId = (row) => `in-${row.label.en.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

function Shot({ id, href, label }) {
  return (
    <a className="lab-shot" href={href} tabIndex={-1} aria-hidden="true">
      <img src={thumb(id)} alt="" width="720" height="450" loading="lazy" decoding="async" />
      {label && <span className="lab-shot-tag mono">{label}</span>}
    </a>
  );
}

function Card({ id, children }) {
  const { t } = useLang();
  const s = STUDIES[id];
  return (
    <article className="lab-card" id={`s-${id}`}>
      <Shot id={id} href={s.href} />
      <p className="lab-meta mono">
        <span>{s.href}</span>
        {s.credit && <span className="lab-credit">{t(CREDIT[s.credit])}</span>}
      </p>
      <h3>
        <a href={s.href}>{t(s.title)}</a>
      </h3>
      <p className="lab-line">{t(s.line)}</p>
      {s.alt && (
        <p className="lab-alt mono">
          <a href={s.alt.href}>
            {t(s.alt.label)} <span aria-hidden="true">↗</span>
          </a>
        </p>
      )}
      {children}
    </article>
  );
}

function Head({ n, label, aside, id }) {
  return (
    <h2 className="ar-head mono" id={id}>
      <span className="ar-num">({n})</span>
      <span className="ar-label">{label}</span>
      {aside && <span className="ar-aside">{aside}</span>}
    </h2>
  );
}

export default function Chooser() {
  const { t } = useLang();
  useEffect(() => {
    document.title = `${t({ en: 'The studies', zh: '研究' })} — Damon Guan`;
  }, [t]);
  const nStudies = Object.keys(STUDIES).length;
  const chapterName = (row) => (/^\d+$/.test(row.n) ? `(${row.n}) ${t(row.label)}` : t(row.label));

  return (
    <div className="ar ar-lab">
      <a className="skip-link" href="#content">
        {t({ en: 'Skip to content', zh: '跳到正文' })}
      </a>
      <AroundBar current="lab" />
      <main id="content" className="lab">
        <header className="lab-intro">
          <p className="ar-head mono">
            <span className="ar-num">(Lab)</span>
            <span className="ar-label">{t({ en: 'Studies', zh: '研究' })}</span>
            <span className="ar-aside">
              {t({
                en: `${nStudies} studies · ${BOARDS.length} concept boards`,
                zh: `${nStudies} 个研究 · ${BOARDS.length} 张概念板`,
              })}
            </span>
          </p>
          <h1 className="lab-title">
            {t({ en: 'The studies', zh: '研究' })}
            {/* the mark, as the full stop */}
            <span className="lab-stop" aria-hidden="true" />
          </h1>
          <div className="lab-lede">
            <p>
              {t({
                en: 'The site is one run; these are the studies it was assembled from.',
                zh: '网站是一次完整的运行；这些是拼出它的研究。',
              })}
            </p>
            <p className="lab-lede-sub">
              {t({
                en: 'Each study tried one device. Where a device meant something about a chapter, it went into the run; the rest stay here, as they were built.',
                zh: '每个研究只试一种手法。手法能说明某一章内容的，就进了主站；其余的留在这里，保持原样。',
              })}
            </p>
            <nav className="lab-jump mono" aria-label={t({ en: 'On this page', zh: '本页' })}>
              <a href="#into-the-run">(A) {t({ en: 'Into the run', zh: '进入主站' })}</a>
              <a href="#kept">(B) {t({ en: 'Kept as studies', zh: '保留为研究' })}</a>
              <a href="#boards">(C) {t({ en: 'Concept boards', zh: '概念板' })}</a>
            </nav>
          </div>
        </header>

        <section className="lab-sec" aria-labelledby="into-the-run">
          <Head
            id="into-the-run"
            n="A"
            label={t({ en: 'Into the run', zh: '进入主站' })}
            aside={t({ en: 'Chapter ← the studies it came from', zh: '章节 ← 它来自的研究' })}
          />
          <ol className="lab-rows">
            {ASSEMBLY.map((row) => (
              <li className="lab-row" key={row.label.en} id={rowId(row)}>
                <div className="lab-chapter">
                  <p className="lab-ch-n mono">{/^\d+$/.test(row.n) ? `(${row.n})` : row.n === '404' ? '(404)' : t({ en: 'Mode', zh: '模式' })}</p>
                  <h3 className="lab-ch-name">
                    <a href={row.href}>{t(row.label)}</a>
                  </h3>
                  <p className="lab-ch-does">{t(row.does)}</p>
                  {row.frame && (
                    <Shot id={row.frame} href={row.href} label={t({ en: 'In the run', zh: '主站中' })} />
                  )}
                  <p className="lab-ch-go mono">
                    <a href={row.href}>
                      {row.n === '404'
                        ? t({ en: 'See the 404', zh: '看看 404' })
                        : row.href === '/short'
                          ? t({ en: 'Open the short version', zh: '打开简短版' })
                          : row.href === '/'
                            ? t({ en: 'Open the run', zh: '打开主站' })
                            : t({ en: 'Open this chapter', zh: '打开这一章' })}{' '}
                      <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </div>
                <div className="lab-from">
                  <p className="lab-from-label mono">
                    {t({ en: 'Assembled from', zh: '来自' })}
                  </p>
                  <div className={`lab-grid ${row.from.length > 1 ? 'lab-grid-2' : 'lab-grid-1'}`}>
                    {row.from.map((id) => (
                      <Card key={id} id={id}>
                        <p className="lab-became mono">
                          <span aria-hidden="true">→ </span>
                          {t({ en: 'became', zh: '成为' })} <a href={row.href}>{chapterName(row)}</a>
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="lab-sec" aria-labelledby="kept">
          <Head
            id="kept"
            n="B"
            label={t({ en: 'Kept as studies', zh: '保留为研究' })}
            aside={t({ en: 'Not in the run', zh: '不在主站中' })}
          />
          <div className="lab-grid lab-grid-4">
            {KEPT.map((k) => (
              <Card key={k.id} id={k.id}>
                <p className="lab-became mono">
                  <span aria-hidden="true">→ </span>
                  {t({ en: 'kept as a study', zh: '保留为研究' })}
                </p>
                <p className="lab-why">{t(k.why)}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="lab-sec" aria-labelledby="boards">
          <Head
            id="boards"
            n="C"
            label={t({ en: 'Concept boards', zh: '概念板' })}
            aside={t({ en: 'Three frames each, drawn before anything was built', zh: '每张三帧，画在动手之前' })}
          />
          <div className="lab-grid lab-grid-4">
            {BOARDS.map((b) => {
              const href = `/lab/concepts/${b.id}.html`;
              const built = b.built && STUDIES[b.built];
              const row = b.built && rowOf[b.built];
              return (
                <article className="lab-card" key={b.id}>
                  <Shot id={`board-${b.id}`} href={href} />
                  <p className="lab-meta mono">
                    <span>
                      {t({ en: 'Board', zh: '概念板' })} {b.n}
                    </span>
                  </p>
                  <h3>
                    <a href={href}>{t(b.title)}</a>
                  </h3>
                  <p className="lab-line">{t(b.line)}</p>
                  <p className="lab-became mono">
                    <span aria-hidden="true">→ </span>
                    {built ? (
                      <>
                        {t({ en: 'built as', zh: '做成' })} <a href={`#s-${b.built}`}>{t(built.title)}</a>
                        {built.credit === 'damon' && <> {t({ en: '(by Damon)', zh: '（Damon 制作）' })}</>}
                        {row && (
                          <>
                            {', '}
                            {t({ en: 'now', zh: '如今是' })} <a href={row.href}>{chapterName(row)}</a>
                          </>
                        )}
                      </>
                    ) : (
                      t({ en: 'kept as a board', zh: '保留为概念板' })
                    )}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="lab-foot mono">
          <span>© 2026 Damon Guan</span>
          <a href="/">
            {t({ en: 'Back to the run', zh: '回到主站' })} <span aria-hidden="true">→</span>
          </a>
        </footer>
      </main>
    </div>
  );
}
