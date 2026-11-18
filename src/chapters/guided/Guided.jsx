import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../../i18n.jsx';
import { createAgent, SPEED } from './agent.js';
import './guided.css';

// Phase H, "Guided": the trace panel and the agent's ink cursor (the magenta mark stays the visitor's).
// - Off by default; opening it moves nothing. The first step waits for "Start".
// - While the agent drives, "Take over" is always on the panel. Any input outside the panel (wheel,
//   touch, a key, a press or drag on the page) pauses it at once: "Paused — Resume / Take over".
//   Esc ends the run and closes the panel. A hidden tab pauses it too.
// - The panel lives outside #root (a portal on body), so it stays usable while a case study or a note
//   holds the page inert. The log is a polite live region; buttons are real buttons.
// - While the agent runs and a pinned chapter (the Work film, the d20, Evidence) fills the screen, the
//   panel folds to one line: the current call, the count and "Take over". It opens again between
//   chapters, on hover, on keyboard focus, and whenever it asks or is paused (finish pass, 2026-11-18).
// The script and controller are in agent.js.

// a pinned chapter fills the screen: a scroll track whose sticky viewport is stuck right now
function pinnedNow() {
  const H = window.innerHeight;
  for (const el of document.querySelectorAll('#root [data-mark-track]')) {
    const r = el.getBoundingClientRect();
    if (r.top > 1 || r.bottom < H - 1) continue;
    for (const c of el.children) if (getComputedStyle(c).position === 'sticky') return true;
  }
  return false;
}

const C = {
  region: { en: 'Guided mode', zh: '导览模式' },
  trace: { en: 'Agent trace', zh: '智能体轨迹' },
  state: {
    ready: { en: 'Guided · ready', zh: '导览 · 就绪' },
    running: { en: 'Agent driving', zh: '智能体驾驶中' },
    asking: { en: 'Waiting for you', zh: '等你决定' },
    paused: { en: 'Paused', zh: '已暂停' },
    done: { en: 'Done', zh: '完成' },
    ended: { en: 'You have the page', zh: '页面交还给你' },
  },
  intro: {
    en: 'The page drives itself through each chapter, as an agent would, and logs every step here as a tool call. It asks before anything that changes your visit’s record. Any scroll, key or tap pauses it; Esc ends it.',
    zh: '页面会像智能体一样自己走完每一章，并把每一步作为一次工具调用记在这里。改变你来访记录的事，它会先问你。任何滚动、按键或点按都会让它暂停；Esc 结束。',
  },
  ask: {
    en: 'Roll the die? Twenty rolls, scrolled for you. Your run is printed on the receipt.',
    zh: '要掷骰子吗？替你滚动掷二十次，你的这一轮会印在小票上。',
  },
  yes: { en: 'Yes, roll', zh: '掷' },
  skip: { en: 'Skip', zh: '跳过' },
  start: { en: 'Start', zh: '开始' },
  notNow: { en: 'Not now', zh: '先不用' },
  take: { en: 'Take over', zh: '接管' },
  resume: { en: 'Resume', zh: '继续' },
  close: { en: 'Close', zh: '关闭' },
  hint: { en: 'Any input pauses · Esc ends', zh: '任何输入即暂停 · Esc 结束' },
  paused: { en: 'Paused', zh: '已暂停' },
  you: { en: 'you', zh: '你' },
  agent: { en: 'agent', zh: '智能体' },
  status: {
    run: { en: 'run', zh: '执行' },
    wait: { en: 'wait', zh: '等待' },
    done: { en: 'ok', zh: '完成' },
    skip: { en: 'skip', zh: '跳过' },
    stop: { en: 'stop', zh: '停止' },
  },
};

const REASON = {
  wheel: { en: 'you scrolled', zh: '你滚动了页面' },
  touch: { en: 'you touched the page', zh: '你触碰了页面' },
  key: { en: 'you pressed a key', zh: '你按了键' },
  pointer: { en: 'you clicked the page', zh: '你点了页面' },
  hidden: { en: 'the tab was hidden', zh: '标签页被切走' },
};

const MODIFIERS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Fn']);
// keys that operate the panel's own buttons
const PANEL_KEYS = new Set(['Tab', 'Enter', ' ']);
const pad = (n) => String(n).padStart(2, '0');

function endNote(s) {
  const n = s.entries.filter((e) => e.kind === 'step' && (e.status === 'done' || e.status === 'skip')).length;
  if (s.end === 'done')
    return { en: `${n} steps. The trace is printed on the receipt.`, zh: `共 ${n} 步。轨迹已印在小票上。` };
  if (!n) return { en: 'Stopped before the first step finished. Nothing was recorded.', zh: '第一步完成前就停了，没有记录。' };
  return {
    en: `You took over after ${n} of ${s.total} steps. Those steps are on the receipt.`,
    zh: `你在第 ${n} / ${s.total} 步之后接管。走过的这些步印在小票上。`,
  };
}

export default function Guided({ opener, onClose }) {
  const { t } = useLang();
  const [s, setS] = useState({ phase: 'ready', at: 0, entries: [], why: null, end: null, total: 0 });
  const root = useRef(null);
  const log = useRef(null);
  const cursor = useRef(null);
  const agent = useRef(null);
  const closeRef = useRef(onClose);
  useLayoutEffect(() => {
    closeRef.current = onClose;
  });

  // the controller, the cursor it points with, and the inputs that pause it
  useEffect(() => {
    let mine = false; // the visitor was last working the panel (not the page)
    const cur = cursor.current;
    let pressT = 0;
    const api = {
      point(el) {
        const r = el.getBoundingClientRect();
        const x = r.left + Math.min(r.width / 2, 140);
        const y = r.top + Math.min(r.height / 2, 56);
        cur.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
        cur.classList.add('is-on');
      },
      press() {
        cur.classList.add('is-press');
        window.clearTimeout(pressT);
        pressT = window.setTimeout(() => cur.classList.remove('is-press'), 260);
      },
      hide() {
        cur.classList.remove('is-on', 'is-press');
      },
    };
    const panel = {
      refocus() {
        if (!mine || !root.current || root.current.contains(document.activeElement)) return;
        root.current.querySelector('[data-act="take"], [data-act="yes"]')?.focus({ preventScroll: true });
      },
      inset: () => (root.current && window.innerWidth <= 760 ? root.current.offsetHeight + 12 : 0),
    };
    const a = createAgent({ emit: setS, cursor: api, panel });
    agent.current = a;
    window.__guided = {
      get phase() {
        return a.phase;
      },
      speed: SPEED,
    };

    const inPanel = (n) => Boolean(n && root.current?.contains(n));
    const onWheel = (e) => !inPanel(e.target) && a.pause(REASON.wheel);
    const onTouch = (e) => {
      mine = inPanel(e.target);
      if (!mine) a.pause(REASON.touch);
    };
    const onDown = (e) => {
      mine = inPanel(e.target);
      if (!mine) a.pause(e.pointerType === 'touch' ? REASON.touch : REASON.pointer);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        a.takeOver('ended');
        closeRef.current();
        return;
      }
      if (MODIFIERS.has(e.key)) return;
      if (inPanel(e.target)) {
        mine = true;
        if (PANEL_KEYS.has(e.key)) return;
      } else mine = false;
      a.pause(REASON.key);
    };
    const onHide = () => document.hidden && a.pause(REASON.hidden);
    const opt = { capture: true, passive: true };
    window.addEventListener('wheel', onWheel, opt);
    window.addEventListener('touchstart', onTouch, opt);
    window.addEventListener('touchmove', onTouch, opt);
    window.addEventListener('pointerdown', onDown, opt);
    window.addEventListener('keydown', onKey, true);
    document.addEventListener('visibilitychange', onHide);
    // a page that is scrolled by the agent should not be re-anchored under it by the browser
    document.documentElement.classList.add('gd-on');
    return () => {
      window.removeEventListener('wheel', onWheel, opt);
      window.removeEventListener('touchstart', onTouch, opt);
      window.removeEventListener('touchmove', onTouch, opt);
      window.removeEventListener('pointerdown', onDown, opt);
      window.removeEventListener('keydown', onKey, true);
      document.removeEventListener('visibilitychange', onHide);
      document.documentElement.classList.remove('gd-on');
      window.clearTimeout(pressT);
      a.dispose();
      delete window.__guided;
    };
  }, []);

  // focus: the panel's main control for each phase, when the visitor is working the panel (or must answer).
  // `held` stays true when the focused button is removed (Start, Resume): no focus event lands elsewhere.
  const was = useRef(null);
  const held = useRef(false);
  useEffect(() => {
    const on = (e) => {
      held.current = Boolean(root.current?.contains(e.target));
    };
    document.addEventListener('focusin', on);
    return () => document.removeEventListener('focusin', on);
  }, []);
  useEffect(() => {
    const p = s.phase;
    if (was.current === p) return;
    const first = was.current === null;
    was.current = p;
    const want = { ready: 'start', running: 'take', asking: 'yes', paused: null, done: 'close', ended: 'close' }[p];
    const here = root.current?.contains(document.activeElement) || (held.current && document.activeElement === document.body);
    if (want && (first || here || p === 'asking')) root.current?.querySelector(`[data-act="${want}"]`)?.focus({ preventScroll: true });
  }, [s.phase]);

  // leaving: focus back to the bar's switch if it can take it
  useEffect(
    () => () => {
      const b = opener?.current;
      if (b && !b.closest('[inert]') && b.checkVisibility?.({ visibilityProperty: true, opacityProperty: true })) b.focus({ preventScroll: true });
    },
    [opener],
  );

  // keep the newest line in view
  useLayoutEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [s.entries.length, s.phase]);

  // fold to a strip while the agent drives through a pinned chapter
  // "peek": the pointer moved over the strip (a pointer merely resting where Start was does not count)
  const [pinned, setPinned] = useState(false);
  const [peek, setPeek] = useState(false);
  if (!pinned && peek) setPeek(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      setPinned(pinnedNow());
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, []);

  const act = (fn, ...args) => () => agent.current?.[fn](...args);
  const { phase } = s;
  const strip = pinned && phase === 'running';
  const peekProps = strip
    ? {
        onPointerMove: (e) => !peek && (e.movementX || e.movementY) && setPeek(true),
        onPointerLeave: () => setPeek(false),
      }
    : null;
  const now = [...s.entries].reverse().find((e) => e.kind === 'step');
  const n = phase === 'ready' ? 0 : Math.min(s.at + 1, s.total);
  const btn = (act, label, onClick, pri) => (
    <button type="button" data-act={act} className={pri ? 'gd-btn is-pri' : 'gd-btn'} onClick={onClick}>
      {t(label)}
    </button>
  );

  return createPortal(
    <>
      <section ref={root} className={`gd is-${phase}${strip && !peek ? ' is-strip' : ''}`} aria-label={t(C.region)} {...peekProps}>
        <header className="gd-head">
          <span className="gd-led" aria-hidden="true" />
          <span className="gd-state">{t(C.state[phase])}</span>
          {strip && !peek && now && (
            <code className="gd-now" aria-hidden="true">
              <b>{now.fn}</b>({now.arg ? `"${t(now.arg)}"` : ''})
            </code>
          )}
          {phase !== 'ready' && (
            <span className="gd-count">
              {pad(n)} / {pad(s.total)}
            </span>
          )}
        </header>
        {phase === 'ready' && <p className="gd-intro">{t(C.intro)}</p>}
        <ol ref={log} className="gd-log" role="log" aria-live="polite" aria-label={t(C.trace)} hidden={!s.entries.length}>
          {s.entries.map((e, k) =>
            e.kind === 'step' ? (
              <li key={k} className={`gd-e is-${e.status}`}>
                <span className="gd-n">{pad(e.n)}</span>
                <code className="gd-call">
                  <b>{e.fn}</b>({e.arg ? `"${t(e.arg)}"` : ''})
                </code>
                <span className="gd-st">{t(C.status[e.status])}</span>
                {e.out && <span className="gd-out">{t(e.out)}</span>}
              </li>
            ) : (
              <li key={k} className="gd-e is-you">
                <span className="gd-n" aria-hidden="true">
                  ›
                </span>
                <span className="gd-you">
                  {t(C.you)} · {t(e.text)}
                </span>
              </li>
            ),
          )}
        </ol>
        {phase === 'asking' && (
          <div className="gd-ask" role="group" aria-labelledby="gd-ask-q">
            <p id="gd-ask-q">{t(C.ask)}</p>
            <div className="gd-row">
              {btn('yes', C.yes, act('answer', 'yes'), true)}
              {btn('skip', C.skip, act('answer', 'skip'))}
            </div>
          </div>
        )}
        {phase === 'paused' && s.why && (
          <p className="gd-note">
            {t(C.paused)} — {t(s.why)}.
          </p>
        )}
        {(phase === 'done' || phase === 'ended') && <p className="gd-note">{t(endNote(s))}</p>}
        <div className="gd-row gd-ctl">
          {phase === 'ready' && (
            <>
              {btn('start', C.start, act('start'), true)}
              {btn('later', C.notNow, () => closeRef.current())}
            </>
          )}
          {(phase === 'running' || phase === 'asking') && btn('take', C.take, act('takeOver'), phase === 'running')}
          {phase === 'paused' && (
            <>
              {btn('resume', C.resume, act('resume'), true)}
              {btn('take', C.take, act('takeOver'))}
            </>
          )}
          {(phase === 'done' || phase === 'ended') && btn('close', C.close, () => closeRef.current(), true)}
          {(phase === 'running' || phase === 'asking' || phase === 'paused') && <span className="gd-hint">{t(C.hint)}</span>}
        </div>
      </section>
      <div ref={cursor} className="gd-cursor" style={{ '--gd-travel': `${Math.round(600 / SPEED)}ms` }} aria-hidden="true">
        <i />
        <span>{t(C.agent)}</span>
      </div>
    </>,
    document.body,
  );
}
