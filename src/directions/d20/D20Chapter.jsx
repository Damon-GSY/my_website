import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '../../i18n.jsx';
import { createStage } from '../../engine/stage.js';
import { hasWebGL2 } from '../../engine/webgl.js';
import { createTimeline } from '../../engine/timeline.js';
import { failSteps, initialSeed, newSeed, pct, rollsFromSeed, seedLabel, STEPS } from './dice.js';
import { buildD20 } from './Scene.js';
import { stripLayout } from './strip.js';
import Strip from './Strip.jsx';
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
// the host already carries the anchor.
export default function D20Chapter({ id = 'evaluate', head = null }) {
  const { t, lang } = useLang();
  const [mode, setMode] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches || !hasWebGL2() ? 'static' : 'film',
  );
  const [seed, setSeed] = useState(initialSeed);
  const rolls = useMemo(() => rollsFromSeed(seed), [seed]);
  const rows = useRows();
  const layout = useMemo(() => stripLayout(rows), [rows]);
  const [hud, setHud] = useState({ step: 0, revealed: 0 });

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
      stage = createStage(canvas.current);
    } catch {
      setMode('static');
      return undefined;
    }
    let dead = false;
    let stop;
    let scene;
    const size = () => {
      const s = stage.size();
      s.w = view.current.clientWidth;
      s.h = view.current.clientHeight;
      stage.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      stage.renderer.setSize(s.w, s.h, false);
      stage.camera.aspect = s.w / s.h;
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
        stop = () => {
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
      stage.renderer.dispose();
    };
    // refs are stable; the stage is built once per mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    live.current = { rolls, layout };
    film.current?.relayout();
  }, [rolls, layout, lang]);

  const fails = failSteps(rolls, hud.revealed);
  const first = failSteps(rolls)[0];
  const rolling = hud.step > hud.revealed;
  const value = hud.step ? rolls[hud.step - 1] : null;
  const k = hud.revealed;
  const heading = t(copy.heading);
  const said = t(verdict(first));

  return (
    <section id={id ?? undefined} className={`d20 ${mode}${head ? ' has-head' : ''}`}>
      <div ref={track} className="d20-track">
        <div ref={view} className="d20-view">
          <canvas ref={canvas} className="d20-canvas" aria-hidden="true" />
          {head && <div className="d20-head">{head}</div>}
          <div ref={intro} className="d20-intro">
            {!head && <p className="d20-label">{t(copy.label)}</p>}
            <h2 className="d20-heading">
              {heading[0]}
              <em>{heading[1]}</em>
              {heading[2]}
            </h2>
            <p className="d20-sub">{t(copy.sub)}</p>
          </div>
          <div ref={slot} className="d20-slot" aria-hidden="true" />
          <div ref={hudRef} className="d20-hud" aria-live="polite">
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
            <ol className="d20-cells">
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
            <Seed seed={seed} onRoll={() => setSeed(newSeed())} t={t} />
          </div>
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
            <h2 className="d20-gap" data-end>
              {t(copy.gap)}
            </h2>
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

function Seed({ seed, onRoll, t }) {
  return (
    <span className="d20-seed">
      {t(copy.seed)} {seedLabel(seed)}
      <button type="button" onClick={onRoll}>
        {t(copy.reroll)} ↻
      </button>
    </span>
  );
}
