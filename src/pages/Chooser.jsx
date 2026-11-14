import { useLang } from '../i18n.jsx';
import { profile } from '../content.js';

const directions = [
  {
    id: 'parcel',
    line: { en: 'The page folds itself into a box and ships you to the work.', zh: '页面把自己折成一只箱子，把你送到作品面前。' },
    glyph: 'M26 2h20v20H26zM26 22h20v20H26zM6 22h20v20H6zM46 22h20v20H46zM26 42h20v20H26z',
  },
  {
    id: 'descent',
    line: { en: 'The flat page was lying on a loss landscape all along.', zh: '你读的平面，原来一直躺在一片损失地形上。' },
    glyph: 'M36 32m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M36 32m-15 0a15 11 0 1 0 30 0a15 11 0 1 0-30 0M36 32m-26 0a26 19 0 1 0 52 0a26 19 0 1 0-52 0M4 32a32 26 0 0 1 64 0',
  },
  {
    id: 'rollout',
    line: { en: 'You are the agent. Twenty steps, one trace.', zh: '你就是智能体：二十步，一条轨迹。' },
    glyph: 'M4 32h64M16 32l8-14M28 32l8 14M40 32l8-14M52 32l8 14M24 18l8-6M36 46l8 6',
  },
];

export default function Chooser() {
  const { lang, setLang, t } = useLang();
  return (
    <main className="chooser">
      <header>
        <p className="mono">
          {profile.name} — {t(profile.role)}, {t(profile.org)} · {t(profile.city)}
        </p>
        <button type="button" className="mono" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}>
          {lang === 'en' ? '中文' : 'EN'}
        </button>
      </header>
      <h1>{t({ en: 'Three ways in.', zh: '三种进入方式。' })}</h1>
      <ol>
        {directions.map((d, i) => (
          <li key={d.id}>
            <a href={`/${d.id}`} data-dir={d.id}>
              <span className="mono">0{i + 1}</span>
              <strong>{d.id}</strong>
              <em>{t(d.line)}</em>
              <svg viewBox="0 0 72 64" aria-hidden="true">
                <path d={d.glyph} />
              </svg>
            </a>
          </li>
        ))}
      </ol>
      <p className="mono chooser-note">
        {t({
          en: 'Each opening turns a 3D object into the 2D page. Scroll slowly; scrolling back reverses it.',
          zh: '每个开场都把一个三维物体变成二维页面。慢慢滚动，向上滚动即可倒放。',
        })}
      </p>
    </main>
  );
}
