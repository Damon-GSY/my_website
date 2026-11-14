import { useLang } from '../i18n.jsx';
import { joinParts, profile } from '../content.js';

const directions = [
  {
    id: 'ink',
    line: { en: 'Your cursor is wet. The page hides moving ink.', zh: '光标是湿的，页面之下藏着流动的墨。' },
    glyph: 'M14 34c-6-12 6-24 18-20 8-10 26-4 24 10 10 6 4 24-10 22-8 10-24 6-24-4-8 0-12-4-8-8z',
  },
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
  {
    id: 'd20',
    line: { en: 'Evaluation, as a twenty-sided die.', zh: '把评测做成一枚二十面骰。' },
    glyph: 'M36 3l28 16v26L36 61 8 45V19zM36 3L21 31h30zM21 31L8 45M51 31l13 14M21 31l15 30M51 31L36 61M8 19l13 12M64 19L51 31',
  },
  {
    id: 'night',
    href: '/lab/night/',
    line: { en: 'A particle night, a ring of text, and a warp into amber.', zh: '粒子夜景、文字圆环，以及一次冲入琥珀色的跃迁。' },
    glyph: 'M36 32m-22 0a22 9 0 1 0 44 0a22 9 0 1 0-44 0M36 10v44M14 32h44M20 16l32 32M52 16L20 48',
  },
  {
    id: 'pill',
    href: '/lab/pill/',
    line: { en: 'A hairline opens into a pill and pushes the name apart.', zh: '一条细线张开成胶囊，把名字向两边推开。' },
    glyph: 'M22 20h28a12 12 0 0 1 0 24H22a12 12 0 0 1 0-24zM6 32h6M60 32h6',
  },
  {
    id: 'bento',
    href: '/lab/bento/',
    line: { en: 'A calm profile: six live cards on one stage.', zh: '一页安静的个人简介：一个舞台，六张会动的卡片。' },
    glyph: 'M6 8h26v22H6zM38 8h28v22H38zM6 36h18v20H6zM30 36h16v20H30zM52 36h14v20H52z',
  },
];

export default function Chooser() {
  const { lang, setLang, t } = useLang();
  return (
    <main className="chooser">
      <header>
        <a className="mono" href="/">
          ← {t({ en: 'Home', zh: '首页' })}
        </a>
        <p className="mono">
          {joinParts([profile.name, joinParts([t(profile.role), t(profile.org)], ', ')], ' — ')}
        </p>
        <button type="button" className="mono" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}>
          {lang === 'en' ? '中文' : 'EN'}
        </button>
      </header>
      <h1>{t({ en: 'Design studies.', zh: '设计研究。' })}</h1>
      <ol>
        {directions.map((d, i) => (
          <li key={d.id}>
            <a href={d.href || `/${d.id}`} data-dir={d.id}>
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
