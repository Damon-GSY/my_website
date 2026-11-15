import { useEffect, useRef, useState } from 'react';
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
    reactHref: '/bento',
    previewHeight: 960,
    badge: { en: 'Static + React', zh: '原版 + 升级版' },
    line: { en: 'A calm profile: six live cards on one stage + Agent Cockpit Bento.', zh: '六张会动的档案卡片舞台 + 智能体驾驶舱双模式 Bento 布局。' },
    glyph: 'M6 8h26v22H6zM38 8h28v22H38zM6 36h18v20H6zM30 36h16v20H30zM52 36h14v20H52z',
  },
  {
    id: 'parcels',
    href: '/lab/parcels/',
    badge: { en: 'New · Live', zh: '全新 · 可交互' },
    line: { en: 'Six cartons on a shelf; each unfolds into its case study.', zh: '架上六只纸箱，每只展开就是一个案例。' },
    glyph: 'M8 24l14-8 14 8v16l-14 8-14-8zM36 24l14-8 14 8v16l-14 8-14-8zM22 16v32M50 16v32',
  },
  {
    id: 'agent',
    href: '/lab/agent/',
    badge: { en: 'New · Live', zh: '全新 · 可交互' },
    line: { en: 'The page drives itself and asks before anything risky.', zh: '页面自己操作，遇到有风险的动作先问你。' },
    glyph: 'M10 10l18 44 6-18 18-6zM44 44h18v12H44z',
  },
  {
    id: 'typist',
    badge: { en: 'New · Live', zh: '全新 · 可交互' },
    line: {
      en: 'Switch π₀ / π_SFT / π_GRPO checkpoints, temperature T, and the 3D rejected-token cloud.',
      zh: '实时切换 π₀ / π_SFT / π_GRPO 检查点、温度系数与三维落选词云。',
    },
    glyph: 'M8 22h24v10H8zM36 22h6v10h-6zM14 40h18v7H14zM38 40h14v7H38zM24 52h22v5H24z',
  },
  {
    id: 'shadow',
    badge: { en: 'New · Live', zh: '全新 · 可交互' },
    line: {
      en: 'Rotate the 180°–360° light goniometer; at 318.0°, cast wire shadows lock into DAMON GUAN.',
      zh: '拖动 180°–360° 光源测角仪，在 318.0° 精确锁相聚合成 DAMON GUAN 投影。',
    },
    glyph: 'M16 14a4 4 0 1 0 0 .1M20 16L58 46M20 18L36 52M14 34c10-12 22 8 34-6M10 52h52',
  },
  {
    id: 'receipt',
    badge: { en: 'New · Live', zh: '全新 · 可交互' },
    line: {
      en: 'Feed thermal production ledgers, stamp PAID IN EVIDENCE, and tear off the contact stub.',
      zh: '热敏打印实绩小票，随处加盖洋红实证印章，撕下可一键复制邮箱的联系存根。',
    },
    glyph: 'M20 6h32v52l-4-4-4 4-4-4-4 4-4-4-4 4-4-4-4 4zM26 18h20M26 26h20M26 34h12M20 44h32',
  },
  {
    id: 'city',
    badge: { en: 'New · Live', zh: '全新 · 可交互' },
    line: {
      en: 'Morph 3D log₁₀ metric skyscrapers smoothly into an orthographic 2D comparison chart.',
      zh: '将基于真实工程尺度的 log₁₀ 三维建筑群平滑压平为二维对比柱状图。',
    },
    glyph: 'M6 54h60M10 54V16h8v38M22 54V22h8v32M34 54V28h8v26M46 54V38h8v16M58 54V44h6v10',
  },
  {
    id: 'arena',
    badge: { en: 'Flagship', zh: '王炸旗舰' },
    line: {
      en: 'Break My Agent: inject schema drift & traps, test dynamic tool resolution & Tier-3 guardrails.',
      zh: '对抗压测沙盒：注入工具漂移与不可逆陷阱，实测动态工具解析与 Tier-3 确认护栏。',
    },
    glyph: 'M12 12h48v40H12zM22 24h28M22 34h18M44 38l6 6 10-12',
  },
];

const concepts = [
  {
    id: 'mountain',
    href: '/lab/concepts/mountain.html',
    line: { en: 'Your name is the mountain range.', zh: '名字本身就是等高线山脉。' },
    glyph: 'M4 50L18 22L30 38L44 14L58 40L68 50M4 56h64M46 14a3 3 0 1 0 0 .1',
  },
  {
    id: 'parcels',
    href: '/lab/concepts/parcels.html',
    line: { en: 'Every project is a sealed parcel; tear the tape to unpack.', zh: '每个项目都是一只封箱快递，撕开胶带即可拆箱。' },
    glyph: 'M12 18h48v34H12zM12 18l10-8h28l10 8M31 10v42M41 10v42',
  },
  {
    id: 'agent',
    href: '/lab/concepts/agent.html',
    line: { en: 'The site operates itself like your risk-tiered agent.', zh: '网页像你的风险分级智能体一样自主运行与请求确认。' },
    glyph: 'M8 10h56v44H8zM44 10v44M16 20l8 16l4-6l6 6l2-2l-6-6l6-4z',
  },
  {
    id: 'paper',
    href: '/lab/concepts/paper.html',
    line: { en: 'One printed sheet that crumples into a ball between sections.', zh: '整站是一张印好的纸，章节切换时揉成纸团再展平。' },
    glyph: 'M14 8h44v48H14zM14 26l22-10l22 14M14 42l20 8l24-18M28 10l8 46',
  },
  {
    id: 'typist',
    href: '/lab/concepts/typist.html',
    line: { en: 'A language model types the site; rejected tokens float in 3D depth.', zh: '语言模型逐词打出网页，落选候选词按概率悬浮在三维深处。' },
    glyph: 'M8 22h24v10H8zM36 22h6v10h-6zM14 40h18v7H14zM38 40h14v7H38zM24 52h22v5H24z',
  },
  {
    id: 'shadow',
    href: '/lab/concepts/shadow.html',
    line: { en: 'A 3D wire tangle whose shadow snaps into your name at 318°.', zh: '悬空三维铁丝，当光源转到 318° 时影子精准拼出你的名字。' },
    glyph: 'M16 14a4 4 0 1 0 0 .1M20 16L58 46M20 18L36 52M14 34c10-12 22 8 34-6M10 52h52',
  },
  {
    id: 'receipt',
    href: '/lab/concepts/receipt.html',
    line: { en: 'A 3D thermal printer feeds out the whole site as one long receipt.', zh: '三维热敏打印机随滚动吐出整张网页，项目是明细、底部可撕存根。' },
    glyph: 'M20 6h32v52l-4-4-4 4-4-4-4 4-4-4-4 4-4-4-4 4zM26 18h20M26 26h20M26 34h12M20 44h32',
  },
  {
    id: 'city',
    href: '/lab/concepts/city.html',
    line: { en: 'Towers scaled to your real numbers level into a log₁₀ bar chart.', zh: '按真实数据建造的对数比例高楼，随镜头拉平变成二维柱状图。' },
    glyph: 'M6 54h60M10 54V16h8v38M22 54V22h8v32M34 54V28h8v26M46 54V38h8v16M58 54V44h6v10',
  },
];

function ScaledPreview({ src, title, width = 1440, height = 900 }) {
  const hostRef = useRef(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return undefined;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / width);
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [width]);

  return (
    <div className="chooser-frame" ref={hostRef} style={{ aspectRatio: `${width} / ${height}` }}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
}

export default function Chooser() {
  const { lang, setLang, t } = useLang();
  const [view, setView] = useState('gallery');

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <main className="chooser">
      <header>
        <a className="mono" href="/">
          ← {t({ en: 'Home', zh: '首页' })}
        </a>
        <p className="mono chooser-who">
          {joinParts([profile.name, joinParts([t(profile.role), t(profile.org)], ', ')], ' — ')}
        </p>
        <div className="chooser-actions mono">
          <div className="chooser-switch" role="group" aria-label={t({ en: 'View mode', zh: '浏览模式' })}>
            <button
              type="button"
              className={view === 'gallery' ? 'is-active' : undefined}
              onClick={() => setView('gallery')}
            >
              {t({ en: 'Gallery', zh: '画廊预览' })}
            </button>
            <button
              type="button"
              className={view === 'list' ? 'is-active' : undefined}
              onClick={() => setView('list')}
            >
              {t({ en: 'List', zh: '列表' })}
            </button>
          </div>
          <button type="button" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}>
            {lang === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </header>

      <div className="chooser-hero">
        <h1>{t({ en: 'Design studies.', zh: '设计研究。' })}</h1>
        <p className="chooser-sub">
          {t({
            en: 'Thirteen live interactive prototypes (including 09–12 realized from the 3-frame concepts + 13 Flagship Agent Arena), the switchable Home page, and all 8 original concept boards.',
            zh: '包含 13 个可交互实时原型（含将 05–08 概念板全面落地的 09–12 与全新旗舰 Agent Arena 对抗沙盒）、可实时换肤的主站首页，以及 8 张原版三帧概念板。',
          })}
        </p>
        <div className="chooser-quick mono" aria-label={t({ en: 'Quick launch new builds', zh: '快速直达新作' })}>
          <span>{t({ en: 'New builds:', zh: '全新直达：' })}</span>
          <a href="/arena" className="is-flagship">
            13 · Arena ({t({ en: 'Flagship', zh: '旗舰' })})
          </a>
          <a href="/bento">08 · Bento (React + Cockpit)</a>
          <a href="/shadow">10 · Shadow 318°</a>
          <a href="/typist">09 · Typist</a>
          <a href="/receipt">11 · Receipt</a>
          <a href="/city">12 · City log₁₀</a>
          <a href="/">00 · Home Lens</a>
        </div>
      </div>

      {view === 'gallery' ? (
        <>
          <section className="chooser-group" aria-labelledby="g-live">
            <div className="chooser-group-head mono">
              <h2 id="g-live">{t({ en: '01 · Live interactive studies (01–13) & Home', zh: '01 · 可交互实时原型（01–13）与主站首页' })}</h2>
              <span>{t({ en: 'Click any card to open full-screen', zh: '点击任意卡片全屏体验' })}</span>
            </div>
            <div className="chooser-grid">
              <a className="chooser-card" href="/" data-dir="home">
                <ScaledPreview src="/" title="Home — stitched site" width={1440} height={900} />
                <div className="chooser-card-meta">
                  <div className="chooser-card-top">
                    <span className="mono">00 · /</span>
                    <strong>Home (Stitched + Lens)</strong>
                  </div>
                  <em>
                    {t({
                      en: 'Switch Hero (Ink/Shadow/Typist), Work (Parcel/Bento/Receipt/City) & Eval (D20/Arena) live.',
                      zh: '支持页内实时切换 Hero（Ink/Shadow/Typist）、Work（Parcel/Bento/Receipt/City）与 Eval（D20/Arena）。',
                    })}
                  </em>
                </div>
              </a>
              {directions.map((d, i) => {
                const href = d.href || `/${d.id}`;
                const previewH = d.previewHeight || 900;
                if (d.reactHref) {
                  return (
                    <div key={d.id} className="chooser-card" data-dir={d.id}>
                      <a href={d.reactHref} aria-label={`${pad(i + 1)} ${d.id}`}>
                        <ScaledPreview src={href} title={`${pad(i + 1)} ${d.id}`} width={1440} height={previewH} />
                      </a>
                      <div className="chooser-card-meta">
                        <div className="chooser-card-top">
                          <span className="mono">
                            {pad(i + 1)} · {d.reactHref}
                          </span>
                          {d.badge && <span className="chooser-badge">{t(d.badge)}</span>}
                          <strong>{d.id}</strong>
                        </div>
                        <em>{t(d.line)}</em>
                        <div className="chooser-card-actions mono">
                          <a href={d.reactHref} className="is-primary">
                            {t({ en: 'React + Cockpit ↗', zh: '交互升级版 ↗' })}
                          </a>
                          <a href={href}>{t({ en: 'Static HTML ↗', zh: '原版静态页 ↗' })}</a>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <a key={d.id} className="chooser-card" href={href} data-dir={d.id}>
                    <ScaledPreview src={href} title={`${pad(i + 1)} ${d.id}`} width={1440} height={previewH} />
                    <div className="chooser-card-meta">
                      <div className="chooser-card-top">
                        <span className="mono">
                          {pad(i + 1)} · {href}
                        </span>
                        {d.badge && <span className="chooser-badge">{t(d.badge)}</span>}
                        <strong>{d.id}</strong>
                      </div>
                      <em>{t(d.line)}</em>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>

          <section className="chooser-group" aria-labelledby="g-concepts">
            <div className="chooser-group-head mono">
              <h2 id="g-concepts">{t({ en: '02 · Original concept boards (01–08)', zh: '02 · 原版三帧分镜概念板（01–08）' })}</h2>
              <span>{t({ en: '1600×1000 3-frame storyboards', zh: '1600×1000 三帧分镜板，点击放大' })}</span>
            </div>
            <div className="chooser-grid">
              {concepts.map((c, i) => (
                <a key={c.id} className="chooser-card" href={c.href} data-dir={c.id}>
                  <ScaledPreview src={c.href} title={`${pad(i + 1)} ${c.id}`} width={1600} height={1000} />
                  <div className="chooser-card-meta">
                    <div className="chooser-card-top">
                      <span className="mono">
                        {pad(i + 1)} · {c.href}
                      </span>
                      <strong>{c.id}</strong>
                    </div>
                    <em>{t(c.line)}</em>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="chooser-list-label mono">
            {t({ en: 'Live interactive studies (01–13)', zh: '可交互实时原型（01–13）' })}
          </div>
          <ol className="chooser-list">
            {directions.map((d, i) => (
              <li key={d.id}>
                <a href={d.href || `/${d.id}`} data-dir={d.id}>
                  <span className="mono">{pad(i + 1)}</span>
                  <strong>{d.id}</strong>
                  <em>{t(d.line)}</em>
                  <svg viewBox="0 0 72 64" aria-hidden="true">
                    <path d={d.glyph} />
                  </svg>
                </a>
              </li>
            ))}
          </ol>

          <div className="chooser-list-label mono" style={{ marginTop: '48px' }}>
            {t({ en: 'Concept boards (01–08)', zh: '三帧分镜概念板（01–08）' })}
          </div>
          <ol className="chooser-list">
            {concepts.map((c, i) => (
              <li key={c.id}>
                <a href={c.href} data-dir={c.id}>
                  <span className="mono">{pad(i + 1)}</span>
                  <strong>{c.id}</strong>
                  <em>{t(c.line)}</em>
                  <svg viewBox="0 0 72 64" aria-hidden="true">
                    <path d={c.glyph} />
                  </svg>
                </a>
              </li>
            ))}
          </ol>
        </>
      )}

      <p className="mono chooser-note">
        {t({
          en: 'Each opening turns a 3D object into the 2D page. Scroll slowly; scrolling back reverses it.',
          zh: '每个开场都把一个三维物体变成二维页面。慢慢滚动，向上滚动即可倒放。',
        })}
      </p>
    </main>
  );
}
