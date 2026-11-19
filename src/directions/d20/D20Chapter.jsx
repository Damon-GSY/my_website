import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '../../i18n.jsx';
import { createStage } from '../../engine/stage.js';
import { hasWebGL2 } from '../../engine/webgl.js';
import { createTimeline } from '../../engine/timeline.js';
import { claimGL, onScreen } from '../../engine/gl.js';
import { failSteps, initialSeed, newSeed, pct, rollsFromSeed, seedLabel, STEPS } from './dice.js';
import { buildD20, T } from './Scene.js';
import { stripLayout } from './strip.js';
import Strip from './Strip.jsx';
import { setVisit } from '../../engine/store.js';
import './d20.css';

const PHONE = '(max-width: 640px)';

const copy = {
  label: { en: 'Evaluate', zh: '评估' },
  heading: {
    en: ['Every step, an agent rolls a d20. On a ', '1', ', the task fails.'],
    zh: ['每走一步，智能体都掷一次二十面骰。掷出 ', '1', '，任务失败。'],
  },
  sub: { en: '95% per step sounds safe. Roll twenty times.', zh: '单步 95% 听起来很安全。那就掷二十次。' },
  reroll: { en: 'Re-roll', zh: '重掷' },
  roll: (k) => ({ en: `Roll · step ${pad(k)}`, zh: `掷骰 · 第 ${k} 步` }),
  said: (k, v) => ({
    en: `Step ${k} of ${STEPS}: rolled ${v}${v === 1 ? ', a failure' : ''}. ${pct(k)} chance of no failure yet.`,
    zh: `第 ${k} / ${STEPS} 步：掷出 ${v}${v === 1 ? '，失败' : ''}。尚未失败的概率 ${pct(k)}。`,
  }),
  seed: { en: 'seed', zh: '种子' },
  rolling: { en: 'rolling', zh: '掷骰中' },
  rolled: { en: 'rolled', zh: '掷出' },
  step: { en: 'step', zh: '步' },
  pNone: { en: 'P(no failure yet)', zh: 'P(尚未失败)' },
  run: { en: 'Your run · 20 rolls · tally per face', zh: '你的一轮 · 20 次 · 每面计数' },
  gap: { en: 'That gap is my job.', zh: '这个落差，就是我的工作。' },
  principles: [
    { en: 'Evaluate before training.', zh: '先评估，再训练。' },
    { en: 'Bound the authority.', zh: '给权限划定边界。' },
    { en: 'Read the trace.', zh: '读完整条轨迹。' },
  ],
};

const failLine = (steps) => ({
  en: `Failed at step${steps.length > 1 ? 's' : ''} ${steps.join(', ')}. Recover, continue.`,
  zh: `第 ${steps.join('、')} 步失败。恢复，继续。`,
});

// [before, emphasised (a failure: magenta), after]
const verdict = (first) =>
  first
    ? {
        en: ['Your run ', `failed at step ${first}`, '. So do 64% of runs.'],
        zh: ['你的这一轮', `在第 ${first} 步失败`, '。64% 的轮次都会这样。'],
      }
    : { en: ['No failures. You are in the lucky 36%.', '', ''], zh: ['零失败。你属于幸运的那 36%。', '', ''] };

const pad = (k) => String(k).padStart(2, '0');

function useRows() {
  const [rows, setRows] = useState(() => (window.matchMedia(PHONE).matches ? 2 : 1));
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const on = () => setRows(mq.matches ? 2 : 1);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return rows;
}

// `head` replaces the small label with the host page's own section head; `id` can be dropped when
// the host already carries the anchor. `shared` (the home page): the die holds a WebGL context only
// while the page's one-context arbiter (src/engine/gl.js) gives it one, from the die coming on screen
// to the hand-off to the tally (T.handoff); the film's DOM and scene graph follow scroll while asleep.
export default function D20Chapter({ id = 'evaluate', head = null, shared = false }) {
  const { t, lang } = useLang();
  const [mode, setMode] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches || !hasWebGL2() ? 'static' : 'film',
  );
  const [seed, setSeed] = useState(initialSeed);
  const rolls = useMemo(() => rollsFromSeed(seed), [seed]);
  const rows = useRows();
  const layout = useMemo(() => stripLayout(rows), [rows]);
  const [hud, setHud] = useState({ step: 0, revealed: 0 });
  const [say, setSay] = useState('');
  // the visit store (for the receipt, phase C): this visitor's seed and where their run first failed
  useEffect(() => setVisit({ d20: { seed: seedLabel(seed), firstFail: failSteps(rolls)[0] ?? null } }), [seed, rolls]);

  const refs = {
    track: useRef(null),
    view: useRef(null),
    canvas: useRef(null),
    slot: useRef(null),
    intro: useRef(null),
    hud: useRef(null),
    end: useRef(null),
    strip: useRef(null),
  };
  const film = useRef(null);
  const live = useRef({ rolls, layout });
  const { track, view, canvas, slot, intro, end, strip } = refs;
  const hudRef = refs.hud;

  // Build the stage once; the scene is told about new rolls and layouts by the effect below.
  useEffect(() => {
    if (mode !== 'film') return undefined;
    let stage;
    try {
      stage = createStage(canvas.current, { asleep: shared });
    } catch {
      setMode('static');
      return undefined;
    }
    let dead = false;
    let stop;
    let scene;
    const size = () => {
      stage.resize(view.current.clientWidth, view.current.clientHeight);
    };
    const el = {
      view: view.current,
      slot: slot.current,
      intro: intro.current,
      hud: hudRef.current,
      end: end.current,
      strip: strip.current,
      endItems: [...end.current.querySelectorAll('[data-end]')],
    };
    buildD20(stage, el, (step, revealed) => setHud({ step, revealed }))
      .then((built) => {
        if (dead) {
          built.dispose();
          return;
        }
        scene = built;
        let last = -1;
        const draw = (p, force) => {
          if (!force && p === last) return; // nothing changed: no render
          last = p;
          scene.frame(p);
          stage.render();
        };
        const relayout = () => {
          size();
          el.endItems.forEach((item) => (item.style.transform = 'none'));
          scene.layout(live.current.layout);
          scene.setRolls(live.current.rolls);
          if (last >= 0) draw(last, true);
        };
        film.current = { relayout };
        relayout();
        window.addEventListener('resize', relayout);
        const stopTimeline = createTimeline(track.current, draw);
        const release = shared
          ? claimGL({
              // the die is below the pinned head: it comes on screen ~0.2 screens after the track does
              range: () => onScreen(track.current, T.handoff, 0.8),
              wake: () => {
                try {
                  stage.wake();
                } catch {
                  setMode('static');
                  return false;
                }
                if (last >= 0) draw(last, true);
                return true;
              },
              sleep: () => {
                stopTimeline.settle();
                stage.sleep();
              },
            })
          : null;
        stop = () => {
          release?.();
          stopTimeline();
          window.removeEventListener('resize', relayout);
        };
        view.current.dataset.ready = 'true';
      })
      .catch((error) => {
        console.error(error);
        setMode('static');
      });
    return () => {
      dead = true;
      film.current = null;
      stop?.();
      scene?.dispose();
      stage.sleep();
    };
    // refs are stable; the stage is built once per mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    live.current = { rolls, layout };
    film.current?.relayout();
  }, [rolls, layout, lang]);

  // Keyboard (polish pass, 2026-11-18): "Roll" is a real control from the start. It does not roll by
  // itself; it scrolls the film to where the next die has landed (the film stays a function of scroll).
  // After the twentieth, it re-rolls the seed. Results are announced briefly, the verdict at the end.
  const want = useRef({ k: 0, at: 0 });
  const progress = () => {
    const r = track.current.getBoundingClientRect();
    return { top: r.top + window.scrollY, len: Math.max(1, r.height - window.innerHeight), p: -r.top / Math.max(1, r.height - window.innerHeight) };
  };
  const goTo = (p, smooth) => {
    const { top, len } = progress();
    window.scrollTo({ top: Math.round(top + p * len), behavior: smooth ? 'smooth' : 'instant' });
  };
  // the die at rest on face k (steps = k - 0.2 sits past the landing, before the next roll)
  const restAt = (k) => T.stepsFrom + ((k - 0.2) / STEPS) * (T.stepsTo - T.stepsFrom);
  const onRoll = () => {
    const now = performance.now();
    const from = now - want.current.at < 1200 ? Math.max(want.current.k, hud.revealed) : hud.revealed;
    if (from >= STEPS) {
      want.current = { k: 0, at: 0 };
      setSeed(newSeed());
      return;
    }
    want.current = { k: from + 1, at: now };
    goTo(restAt(from + 1), true);
  };
  // focused from far away (Tab from the Work cards, or back up from below): bring the run's readout in
  const onRollFocus = () => {
    const { p } = progress();
    if (p < T.stepsFrom) goTo(T.stepsFrom, false);
    else if (p > T.foldFrom) goTo(restAt(Math.max(1, hud.revealed)), false);
  };
  useEffect(() => {
    if (mode !== 'film') return undefined;
    const k = hud.revealed;
    let gone = 0;
    const id = window.setTimeout(() => {
      if (!k) setSay('');
      else if (k < STEPS) setSay(t(copy.said(k, rolls[k - 1])));
      else {
        setSay(t(verdict(failSteps(rolls)[0])).join(''));
        // once said, the verdict is the paragraph under the strip: the status line empties so it is not read twice
        gone = window.setTimeout(() => setSay(''), 6000);
      }
    }, 450);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(gone);
    };
  }, [hud.revealed, rolls, mode, t]);

  const fails = failSteps(rolls, hud.revealed);
  const first = failSteps(rolls)[0];
  const rolling = hud.step > hud.revealed;
  const value = hud.step ? rolls[hud.step - 1] : null;
  const k = hud.revealed;
  const heading = t(copy.heading);
  const said = t(verdict(first));

  return (
    <section id={id ?? undefined} className={`d20 ${mode}${head ? ' has-head' : ''}`}>
      <div ref={track} className="d20-track" data-mark-track>
        <div ref={view} className="d20-view">
          <canvas ref={canvas} className="d20-canvas" aria-hidden="true" />
          {head && <div className="d20-head">{head}</div>}
          <div ref={intro} className="d20-intro">
            {!head && <p className="d20-label">{t(copy.label)}</p>}
            <h2 className="d20-heading">
              {heading[0]}
              <em data-mark="evaluate" data-mark-in="-0.6 0" data-mark-r="0.42">{heading[1]}</em>
              {heading[2]}
            </h2>
            <p className="d20-sub">{t(copy.sub)}</p>
          </div>
          <div ref={slot} className="d20-slot" aria-hidden="true" />
          <div ref={hudRef} className="d20-hud">
            <p className="d20-read">
              <span>
                {t(copy.step)} <b>{pad(hud.step)}</b> / {STEPS}
              </span>
              <span className={value === 1 && !rolling ? 'is-fail' : ''}>
                {rolling || !value ? (
                  <>{t(copy.rolling)} …</>
                ) : (
                  <>
                    {t(copy.rolled)} <b>{value}</b>
                  </>
                )}
              </span>
            </p>
            <p className="d20-read d20-p">
              {t(copy.pNone)} = 0.95<sup>{k}</sup> = <b>{pct(k)}</b>
            </p>
            <ol className="d20-cells" aria-label={t({ en: 'Rolls so far', zh: '已掷点数' })}>
              {rolls.map((v, i) => {
                const state = i < k ? (v === 1 ? 'fail' : 'done') : i === hud.step - 1 ? 'now' : 'todo';
                return (
                  <li key={i} data-state={state}>
                    {i < k ? v : ''}
                  </li>
                );
              })}
            </ol>
            <p className="d20-fail">{fails.length ? t(failLine(fails)) : ''}</p>
            <Seed seed={seed} onRoll={() => setSeed(newSeed())} t={t}>
              {mode === 'film' && (
                <button type="button" className="d20-roll" onClick={onRoll} onFocus={onRollFocus}>
                  {k < STEPS ? t(copy.roll(k + 1)) : t(copy.reroll)} <span aria-hidden="true">{k < STEPS ? '↓' : '↻'}</span>
                </button>
              )}
            </Seed>
          </div>
          <p className="sr-only" role="status">
            {say}
          </p>
          <div ref={end} className="d20-end">
            <div className="d20-end-head" data-end>
              <span>{t(copy.run)}</span>
              <Seed seed={seed} onRoll={() => setSeed(newSeed())} t={t} />
            </div>
            <p className="d20-verdict" data-end>
              {said[0]}
              {said[1] && <em>{said[1]}</em>}
              {said[2]}
            </p>
            <Strip ref={strip} layout={layout} rolls={rolls} />
            <h3 className="d20-gap" data-end>
              {t(copy.gap)}
            </h3>
            <ul className="d20-principles" data-end>
              {copy.principles.map((line, i) => (
                <li key={i}>
                  <span>0{i + 1}</span> {t(line)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Seed({ seed, onRoll, t, children }) {
  return (
    <span className="d20-seed">
      {t(copy.seed)} {seedLabel(seed)}
      {children || (
        <button type="button" onClick={onRoll} aria-label={t({ en: 'Re-roll the dice', zh: '重新掷骰' })}>
          {t(copy.reroll)} <span aria-hidden="true">↻</span>
        </button>
      )}
    </span>
  );
}
