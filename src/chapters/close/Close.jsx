import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../i18n.jsx';
import { profile } from '../../content.js';
import { getVisit, quiet, watchChapters } from '../../engine/store.js';
import './close.css';

// Phase C, "Close" (assembly plan §3 row 7): the last chapter prints this visit as a thermal receipt.
// Adapted from Damon's receipt study (/receipt), which stays as it is.
//
// - Every value on the paper comes from this tab's visit store (src/engine/store.js): the chapters
//   reached and when, the d20 seed and first failing step, the time, the language. Nothing invented.
// - Printing is the page's own scroll: the printer sits sticky at the bottom of the viewport and the
//   paper, in normal flow, emerges from its slot (pure CSS, so it is exactly reversible and costs no
//   frames). With reduced motion the receipt is simply there, the printer under it.
// - The stamp is the travelling mark's final dock (`data-mark="close"`): the dot lands in its centre
//   and the ring is pressed in by --mk. Without the mark, the stamp is just there.
// - The tear-off stub is the contact block: a real mailto link, selectable text, a copy button and
//   the profile links. In-page links to #contact land on it, fully printed.

const CHAPTERS = [
  { id: 'hero', sel: '#top', n: '00', name: { en: 'Opening', zh: '开场' } },
  { id: 'statement', sel: '#statement', n: '01', name: { en: 'Statement', zh: '自述' } },
  { id: 'work', sel: '#work', n: '02', name: { en: 'Work', zh: '作品' } },
  { id: 'evaluate', sel: '#evaluate', n: '03', name: { en: 'Evaluate', zh: '评测' } },
  { id: 'evidence', sel: '#evidence', n: '04', name: { en: 'Evidence', zh: '证据' } },
  { id: 'path', sel: '#path', n: '05', name: { en: 'Path', zh: '经历' } },
  { id: 'notes', sel: '#notes', n: '06', name: { en: 'Notes', zh: '笔记' } },
];

const C = {
  head: { en: 'Contact', zh: '联系' },
  title: { en: ['On the', 'record.'], zh: ['记录', '在案。'] },
  lede: {
    en: 'The receipt is printed from your visit as this browser saw it: the chapters you reached, your d20 run, the time. Nothing on it is invented, and none of it leaves this tab.',
    zh: '这张小票按你这次来访打印，内容只来自这个浏览器看到的：你到过的章节、你的那一轮骰子、时间。上面没有编造的数字，也不会离开这个标签页。',
  },
  keep: { en: 'To reply, keep the stub.', zh: '想回信，留下存根。' },
  printer: { en: 'One copy · this visit', zh: '仅此一份 · 本次来访' },
  record: { en: 'A record of this visit', zh: '本次来访记录' },
  no: { en: 'No.', zh: '编号' },
  date: { en: 'Date', zh: '日期' },
  arrived: { en: 'Arrived', zh: '到达' },
  language: { en: 'Language', zh: '语言' },
  langName: { en: 'English', zh: '中文' },
  chapters: { en: 'Chapters reached', zh: '到过的章节' },
  at: { en: 'at', zh: '时刻' },
  none: { en: 'None yet', zh: '暂无' },
  d20: { en: 'd20 run', zh: '二十面骰' },
  seed: { en: 'Seed', zh: '种子' },
  result: { en: 'Result', zh: '结果' },
  notRolled: { en: 'Not rolled', zh: '未掷' },
  cases: { en: 'Cases opened', zh: '打开的案例' },
  screens: { en: 'Screens scrolled', zh: '滚动屏数' },
  total: { en: 'Total', zh: '合计' },
  onPage: { en: 'Time on page', zh: '停留时长' },
  verdict: { en: 'Verdict', zh: '结论' },
  stampSr: { en: 'Stamped: held up on real work.', zh: '盖章：在真实工作中站得住。' },
  local: {
    en: 'Kept in this tab only. Nothing was sent.',
    zh: '只保存在这个标签页里，没有发送任何数据。',
  },
  tear: { en: 'Tear here · keep this part', zh: '沿此撕下 · 留下这一联' },
  stub: { en: 'Stub · reply to', zh: '存根 · 回信' },
  best: { en: 'Email is best', zh: '邮件最快' },
  copy: { en: 'Copy', zh: '复制' },
  copied: { en: 'Copied', zh: '已复制' },
  elsewhere: { en: 'Elsewhere', zh: '其他地方' },
};

// en spaces: the arc is set with textLength, and plain spaces read as too narrow on it
const RING = { en: 'HELD\u2002UP\u2002ON\u2002REAL\u2002WORK', zh: '在真实工作中站得住' };

const pad = (n) => String(n).padStart(2, '0');
const clock = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
};
const duration = (ms, lang) => {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  if (lang === 'zh') return m ? `${m} 分 ${s % 60} 秒` : `${s} 秒`;
  return m ? `${m} min ${s % 60} s` : `${s} s`;
};

const hasMark = () => document.documentElement.classList.contains('mark-live');

// What the receipt prints: read once each time the paper starts to come out (a receipt is a snapshot).
function snapshot(flush) {
  flush?.();
  const v = getVisit();
  const times = v.times || {};
  const reached = CHAPTERS.filter((c) => v.visited.includes(c.id)).map((c) => ({ ...c, ms: times[c.id] ?? 0 }));
  // the run counts as rolled once its tally was shown: the mark reaches it in the film; the static
  // chapter (no mark) shows the whole run as soon as the chapter is reached
  const rolled = Boolean(v.d20) && (v.visited.includes('tally') || (!hasMark() && v.visited.includes('evaluate')));
  return {
    arrived: v.arrived || Date.now(),
    now: Date.now(),
    reached,
    d20: rolled ? v.d20 : null,
    cases: Array.isArray(v.parcels) ? v.parcels.length : null,
    screens: v.screens || 0,
  };
}

// Decorative bars derived from the visit number (aria-hidden; the number is printed under it).
function bars(id) {
  const out = [];
  let x = 0;
  for (const ch of `*${id}*`) {
    let c = ch.charCodeAt(0) * 2654435761;
    for (let k = 0; k < 5; k += 1) {
      const w = 1 + ((c >>> (k * 3)) & 3);
      if (k % 2 === 0) out.push({ x, w });
      x += w + 0.6;
      c ^= c >>> 7;
    }
    x += 1.4;
  }
  return { out, width: x };
}

function Row({ k, v, strong }) {
  return (
    <div className={`cl-row${strong ? ' is-strong' : ''}`}>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function Seal({ date }) {
  const { t, lang } = useLang();
  return (
    <div className="cl-seal" data-mark="close" data-mark-r="0.1333" role="img" aria-label={t(C.stampSr)}>
      <svg className="cl-seal-ring" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <filter id="cl-worn" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="11" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.45" />
            <feComposite in="SourceGraphic" operator="in" />
          </filter>
          <path id="cl-arc-top" d="M 21.06 75.73 A 42 42 0 1 1 98.94 75.73" />
          <path id="cl-arc-bot" d="M 14 60 A 46 46 0 0 0 106 60" />
        </defs>
        <g filter="url(#cl-worn)">
          <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="2.6" />
          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="0.9" />
          <text className={`cl-seal-top${lang === 'zh' ? ' is-zh' : ''}`}>
            <textPath href="#cl-arc-top" startOffset="50%" textAnchor="middle" textLength="150" lengthAdjust="spacing">
              {t(RING)}
            </textPath>
          </text>
          <text className="cl-seal-bot">
            <textPath href="#cl-arc-bot" startOffset="50%" textAnchor="middle">
              {date}
            </textPath>
          </text>
        </g>
      </svg>
      <i className="cl-seal-dot" aria-hidden="true" />
    </div>
  );
}

export default function Close({ head }) {
  const { t, lang } = useLang();
  const rollRef = useRef(null);
  const paperRef = useRef(null);
  const stubRef = useRef(null);
  const flushRef = useRef(null);
  const [snap, setSnap] = useState(() => snapshot());
  const [copied, setCopied] = useState(false);

  // record chapters as they are reached (with or without the travelling mark)
  useEffect(() => {
    const w = watchChapters(CHAPTERS.map((c) => [c.id, document.querySelector(c.sel)]));
    flushRef.current = w.flush;
    return w.stop;
  }, []);

  // re-read the visit each time the paper starts to come out of the printer
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setSnap(snapshot(flushRef.current));
    });
    io.observe(paperRef.current);
    return () => io.disconnect();
  }, []);

  // The mark lands on the stamp by scroll into the roll (mark.js, data-mark-in), not by viewport
  // position: it should arrive only once the stamp is fully out of the slot, and always before the page
  // ends. The range is measured here, in viewports, from the paper's layout.
  useEffect(() => {
    const roll = rollRef.current;
    const seal = roll.querySelector('.cl-seal');
    const printer = roll.querySelector('.cl-printer');
    const place = () => {
      const H = window.innerHeight;
      const r = roll.getBoundingClientRect();
      const below = parseFloat(getComputedStyle(printer).bottom) || 0;
      const slot = H - below - printer.offsetHeight; // where the paper leaves the printer, in the viewport
      const out = (seal.getBoundingClientRect().bottom - r.top + H - slot + 6) / H - 1;
      const end = (document.documentElement.scrollHeight - H - (r.top + window.scrollY)) / H;
      const to = Math.min(out + 0.3, end - 0.02);
      const from = Math.min(out - 0.5, to - 0.1);
      seal.dataset.markIn = `${from.toFixed(3)} ${to.toFixed(3)}`;
    };
    const ro = new ResizeObserver(place);
    ro.observe(roll);
    ro.observe(document.body);
    window.addEventListener('resize', place);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', place);
    };
  }, []);

  // "Contact" links land on the stub, fully printed, not on the top of an unprinted receipt
  useEffect(() => {
    // the end of the roll just above the viewport's bottom edge: the printer has let go of the paper
    const toStub = (smooth) => {
      const r = rollRef.current.getBoundingClientRect();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const top = Math.min(max, r.bottom + window.scrollY - window.innerHeight + 24);
      window.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' });
    };
    const onClick = (e) => {
      const a = e.target.closest?.('a[href="#contact"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      history.pushState(null, '', '#contact');
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      quiet(smooth ? 6000 : 300);
      toStub(smooth);
      // films mounting on the way can shift the target a little: settle exactly once there
      if (smooth)
        window.addEventListener(
          'scrollend',
          () => {
            toStub(false);
            quiet(200);
          },
          { once: true },
        );
    };
    document.addEventListener('click', onClick);
    let raf = 0;
    let late = 0;
    if (window.location.hash === '#contact') {
      quiet(800);
      raf = requestAnimationFrame(() => toStub(false));
      late = window.setTimeout(() => toStub(false), 500); // again, once fonts and films have laid out
    }
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(late);
      document.removeEventListener('click', onClick);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // no clipboard: select the address so it can be copied by hand
      const range = document.createRange();
      range.selectNodeContents(stubRef.current.querySelector('.cl-email'));
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }
  };

  const locale = lang === 'zh' ? 'zh-CN' : 'en-GB';
  const arrived = new Date(snap.arrived);
  const dateText = arrived.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const timeText = arrived.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const sealDate = `${pad(arrived.getDate())} · ${pad(arrived.getMonth() + 1)} · ${arrived.getFullYear()}`;
  const id = snap.arrived.toString(36).toUpperCase().slice(-8);
  const code = bars(id);
  const d20 = snap.d20;
  const result = d20
    ? d20.firstFail
      ? t({ en: `Failed at step ${d20.firstFail} of 20`, zh: `第 ${d20.firstFail} / 20 步失败` })
      : t({ en: 'No failure in 20', zh: '20 步零失败' })
    : null;
  const [user, domain] = profile.email.split('@');

  return (
    <section id="contact" className="h-section cl" aria-labelledby="cl-title">
      {head ?? null}
      <div className="cl-grid">
        <div className="cl-side">
          <h2 id="cl-title" className="cl-title">
            {t(C.title).map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
          <p className="cl-lede">{t(C.lede)}</p>
          <p className="cl-keep mono">{t(C.keep)} ↓</p>
        </div>

        <div ref={rollRef} className="cl-roll" data-mark-track>
          <article ref={paperRef} className="cl-paper" aria-label={t(C.record)}>
            <div className="cl-body">
              <header className="cl-top">
                <p className="cl-name">{profile.name.toUpperCase()}</p>
                <p className="cl-meta mono">
                  <span>{t(C.record)}</span>
                  <span>
                    {t(C.no)} {id}
                  </span>
                </p>
              </header>
              <dl className="cl-block mono">
                <Row k={t(C.date)} v={dateText} />
                <Row k={t(C.arrived)} v={timeText} />
                <Row k={t(C.language)} v={t(C.langName)} />
              </dl>
              <div className="cl-block mono">
                <p className="cl-cols">
                  <span>{t(C.chapters)}</span>
                  <span>{t(C.at)}</span>
                </p>
                {snap.reached.length ? (
                  <ol className="cl-items">
                    {snap.reached.map((c) => (
                      <li key={c.id}>
                        <span className="cl-n">{c.n}</span>
                        <span className="cl-item">{t(c.name)}</span>
                        <span className="cl-time">{clock(c.ms)}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="cl-none">{t(C.none)}</p>
                )}
              </div>
              <div className="cl-block mono">
                <p className="cl-cols">
                  <span>{t(C.d20)}</span>
                </p>
                <dl>
                {d20 ? (
                  <>
                    <Row k={t(C.seed)} v={d20.seed} />
                    <Row k={t(C.result)} v={result} />
                  </>
                ) : (
                  <Row k={t(C.result)} v={t(C.notRolled)} />
                )}
                {snap.cases !== null && <Row k={t(C.cases)} v={String(snap.cases)} />}
                <Row k={t(C.screens)} v={snap.screens.toFixed(1)} />
                </dl>
              </div>
              <div className="cl-block cl-totals">
                <dl>
                <Row
                  strong
                  k={t(C.total)}
                  v={t({
                    en: `${snap.reached.length} / ${CHAPTERS.length} chapters`,
                    zh: `${snap.reached.length} / ${CHAPTERS.length} 章`,
                  })}
                />
                <Row k={t(C.onPage)} v={duration(snap.now - snap.arrived, lang)} />
                </dl>
              </div>
              <div className="cl-stampzone">
                <span className="cl-zone-k mono" aria-hidden="true">
                  {t(C.verdict)}
                </span>
                <Seal date={sealDate} />
              </div>
              <footer className="cl-foot mono">
                <svg className="cl-bars" viewBox={`0 0 ${code.width.toFixed(1)} 30`} preserveAspectRatio="none" aria-hidden="true">
                  {code.out.map((b, i) => (
                    <rect key={i} x={b.x} y="0" width={b.w} height="30" />
                  ))}
                </svg>
                <p>* {id} *</p>
                <p className="cl-local">{t(C.local)}</p>
              </footer>
            </div>

            <p className="cl-perf mono" aria-hidden="true">
              <span>✂ {t(C.tear)}</span>
            </p>

            <div ref={stubRef} className="cl-stub">
              <p className="cl-stub-top mono">
                <span>{t(C.stub)}</span>
                <span>{t(C.best)}</span>
              </p>
              <div className="cl-email-row">
                <a className="cl-email" href={`mailto:${profile.email}`}>
                  {user}
                  <span className="cl-at">@</span>
                  {domain}
                </a>
                <button type="button" className="cl-copy mono" onClick={copy}>
                  {copied ? t(C.copied) : t(C.copy)}
                </button>
                <span className="sr-only" aria-live="polite">
                  {copied ? `${t(C.copied)}: ${profile.email}` : ''}
                </span>
              </div>
              <ul className="cl-links" aria-label={t(C.elsewhere)}>
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
            </div>
          </article>
          <div className="cl-printer" aria-hidden="true">
            <div className="cl-printer-bar">
              <span>{t(C.printer)}</span>
              <i />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
