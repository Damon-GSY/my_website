import { useEffect, useRef, useState } from "react";
import { useLang } from "../../i18n.jsx";
import { footnote } from "../../content.js";
import { hasWebGL2 } from "../../engine/webgl.js";
import {
  COUNT_TICKS,
  COUNTS,
  FIGURES,
  KIND,
  RATE_TICKS,
  RATES,
  WORDS,
} from "./figures.js";
import "./evidence.css";

// Phase F, "Evidence" (assembly plan §3 row 4): the type board's figures rise into towers, then the
// camera levels them into a labelled chart. After Damon's City study (/city, which stays as it is), with
// résumé figures only.
//
// - One device, a pure function of scroll: the section pins and the camera tilts the board into depth,
//   each figure's cell rising as a paper tower whose height is its value; the towers gather into two
//   rows and the camera swings level, until their fronts are the bars of a flat chart.
// - Honest scales: counts stand on a log axis (1 to 1,000), rates on their own linear 0–100% axis, and
//   SOTA / GRPO, which are not quantities, are never drawn: they stay flat and end as notes. The axis
//   titles and tick labels are on screen in every state: on the board they are printed scale keys, which
//   stand up as the axes when the towers rise.
// - CSS 3D, not WebGL: every word and number is DOM text, positioned in 2D at its tower's projected
//   corner, so it stays crisp through the whole move; no second WebGL context; the film is a ~4 kB chunk.
//   The rest states are plain DOM (the board, then the chart), so nothing 3D renders at rest.
// - The mark docks on E1's dagger, which travels with its figure into the chart (data-mark="evidence").
// - Static (reduced motion, no WebGL): the chart, unpinned. Screen readers get one table of all eight.

const still = () =>
  typeof window === "undefined" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  !hasWebGL2() ||
  typeof IntersectionObserver === "undefined";

const C = {
  title: { en: "Evidence", zh: "证据" },
  intro: {
    en: "Eight figures from the work, each with what it measures. Nothing rounded up.",
    zh: "八个来自工作的数字，每个都注明它衡量的是什么，不加修饰。",
  },
  count: { en: "Count · log scale", zh: "数量 · 对数刻度" },
  rate: { en: "Percent · linear scale", zh: "百分比 · 线性刻度" },
  words: { en: "Not quantities · not plotted", zh: "不是数量 · 不作图" },
  states: [
    { en: "Board", zh: "数字板" },
    { en: "Towers", zh: "楼群" },
    { en: "Chart", zh: "图表" },
  ],
  notes: {
    en: "100+ is drawn at 100, its lower bound. The two rates are changes in different measures.",
    zh: "100+ 按下限 100 绘制。两个比率是不同指标的变化。",
  },
  table: { en: "The eight figures", zh: "八个数字" },
  cols: [
    { en: "No.", zh: "编号" },
    { en: "Figure", zh: "数字" },
    { en: "What it measures", zh: "衡量什么" },
    { en: "Source", zh: "来源" },
    { en: "Drawn on", zh: "图中" },
  ],
  internal: { en: "internal measurement", zh: "内部测量" },
};

const fmtCount = (v) => v.toLocaleString("en-US");
const fmtRate = (v) => `${v}%`;

function Val({ f }) {
  return (
    <span className="ev-val" data-mv={`val:${f.n}`}>
      <b>{f.figure}</b>
      {f.dagger && (
        <sup
          className="ev-dagger"
          data-mark={f.n === 1 ? "evidence" : undefined}
          data-mark-r="0.8"
        >
          †
        </sup>
      )}
    </span>
  );
}

function Label({ f, t }) {
  return (
    <>
      <span className="ev-meta mono" data-mv={`meta:${f.n}`}>
        E{f.n} · {t(KIND[f.kind])}
      </span>
      <span className="ev-cat" data-mv={`cat:${f.n}`}>
        <span className="ev-measures mono">{t(f.measures)}</span>
        <span className="ev-source">{t(f.source)}</span>
      </span>
    </>
  );
}

function Plot({ kind, figs, ticks, title, fmt, t }) {
  const frac = (v) => (kind === "count" ? Math.log10(v) / 3 : v / 100);
  return (
    <div className={`ev-plot is-${kind}`} style={{ "--n": figs.length }}>
      <p className="ev-atitle mono" data-mv={`title:${kind}`}>
        {title}
      </p>
      <div className="ev-area" data-plot={kind}>
        {ticks.map((v, k) => (
          <span key={v} className="ev-tick" style={{ "--f": frac(v) }}>
            <span className="ev-tl mono" data-mv={`tick:${kind}:${k}`}>
              {fmt(v)}
            </span>
          </span>
        ))}
        <ol className="ev-cols">
          {figs.map((f) => (
            <li key={f.id} className="ev-col" style={{ "--f": f.frac }}>
              <i
                className={`ev-bar${f.lower ? " is-lower" : ""}`}
                data-bar={f.n}
              />
              <Val f={f} />
            </li>
          ))}
        </ol>
      </div>
      <ol className="ev-cats">
        {figs.map((f) => (
          <li key={f.id}>
            <Label f={f} t={t} />
          </li>
        ))}
      </ol>
    </div>
  );
}

// The type board, for the film only: its rules are what the reader sees at the first rest, and its
// (invisible) text marks where each label starts before it travels into the chart.
function Board({ t }) {
  const key = (kind, ticks, fmt, title) => (
    <div className="ev-key">
      <span className="ev-keyline" data-keyline={kind}>
        {ticks.map((v, k) => (
          <span
            key={v}
            className="ev-keytick"
            style={{
              "--f": kind === "count" ? k / (ticks.length - 1) : v / 100,
            }}
          >
            <span className="mono" data-ph={`tick:${kind}:${k}`}>
              {fmt(v)}
            </span>
          </span>
        ))}
      </span>
      <span className="ev-atitle mono" data-ph={`title:${kind}`}>
        {title}
      </span>
    </div>
  );
  return (
    <div className="ev-board">
      <ol className="ev-cells">
        {FIGURES.map((f) => (
          <li key={f.id} className="ev-cell" data-cell={f.n}>
            <span className="ev-fig" data-ph={`val:${f.n}`}>
              <b>{f.figure}</b>
              {f.dagger && <sup className="ev-dagger">†</sup>}
            </span>
            <span className="ev-meta mono" data-ph={`meta:${f.n}`}>
              E{f.n} · {t(KIND[f.kind])}
            </span>
            <span className="ev-cat" data-ph={`cat:${f.n}`}>
              <span className="ev-measures mono">{t(f.measures)}</span>
              <span className="ev-source">{t(f.source)}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="ev-keys">
        {key("count", COUNT_TICKS, fmtCount, t(C.count))}
        {key("rate", RATE_TICKS, fmtRate, t(C.rate))}
        <div className="ev-key">
          <span className="ev-atitle mono" data-ph="title:words">
            {t(C.words)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Evidence({ head }) {
  const { lang, t } = useLang();
  const [live] = useState(() => !still());
  const root = useRef(null);

  // the film is a small chunk, fetched when the chapter is about a screen and a half away
  useEffect(() => {
    if (!live) return undefined;
    let stop;
    let gone = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        import("./film.js").then(({ startEvidence }) => {
          if (!gone) stop = startEvidence(root.current);
        });
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(root.current);
    return () => {
      gone = true;
      io.disconnect();
      stop?.();
    };
  }, [live, lang]);

  return (
    <section
      id="evidence"
      ref={root}
      className={`h-section ev${live ? " is-live" : ""}`}
      data-pv="0 0.9"
    >
      {head}
      <div className="ev-lead">
        <h2 className="ev-title">{t(C.title)}</h2>
        <p className="ev-intro">{t(C.intro)}</p>
      </div>

      <div className="sr-only">
        <table>
          <caption>{t(C.table)}</caption>
          <thead>
            <tr>
              {C.cols.map((c) => (
                <th key={c.en} scope="col">
                  {t(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FIGURES.map((f) => (
              <tr key={f.id}>
                <th scope="row">E{f.n}</th>
                <td>
                  {f.figure}
                  {f.dagger ? ` † ${t(C.internal)}` : ""}
                </td>
                <td>{t(f.measures)}</td>
                <td>
                  {t(f.source)} · {t(KIND[f.kind])}
                </td>
                <td>
                  {t(
                    f.scale === "count"
                      ? C.count
                      : f.scale === "rate"
                        ? C.rate
                        : C.words,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ev-track" data-mark-track={live ? "" : undefined}>
        <div className="ev-stage" aria-hidden="true">
          {live && (
            <p className="ev-cap mono">
              {C.states.map((s, i) => (
                <span key={s.en} data-state={i}>
                  {t(s)}
                </span>
              ))}
            </p>
          )}
          <div className="ev-field">
            {live && <Board t={t} />}
            <div className="ev-chart">
              <Plot
                kind="count"
                figs={COUNTS}
                ticks={COUNT_TICKS}
                title={t(C.count)}
                fmt={fmtCount}
                t={t}
              />
              <Plot
                kind="rate"
                figs={RATES}
                ticks={RATE_TICKS}
                title={t(C.rate)}
                fmt={fmtRate}
                t={t}
              />
              <div className="ev-words">
                <p className="ev-atitle mono" data-mv="title:words">
                  {t(C.words)}
                </p>
                <ol>
                  {WORDS.map((f) => (
                    <li key={f.id} data-word={f.n}>
                      <Val f={f} />
                      <Label f={f} t={t} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
          <p className="ev-foot mono">
            <span>
              <span className="ev-dagger">†</span> {t(footnote)}
            </span>
            <span>{t(C.notes)}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
