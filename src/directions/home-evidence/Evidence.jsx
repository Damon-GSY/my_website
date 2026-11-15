import { useEffect, useRef } from "react";
import { useLang } from "../../i18n.jsx";
import { footnote, work } from "../../content.js";
import "./evidence.css";

// The Evidence chapter: every honest figure from the résumé, each with what it measures and where it
// comes from. Production figures carry a dagger that points at the footnote. On entering view the
// tiles flip down like a departure board and each figure settles character by character; with
// reduced motion everything is simply there.

const KIND = {
  prod: { en: "Production", zh: "生产" },
  method: { en: "Method", zh: "方法" },
  arch: { en: "Architecture", zh: "架构" },
  paper: { en: "ACL Findings 2026", zh: "ACL Findings 2026" },
  survey: { en: "Survey", zh: "综述" },
  research: { en: "Research", zh: "研究" },
};

const byId = Object.fromEntries(work.map((w) => [w.id, w]));
const fromWork = (id, kind, dagger) => ({
  id,
  figure: byId[id].metric,
  measures: byId[id].metricLabel,
  source: byId[id].title,
  kind,
  dagger,
});

const FIGURES = [
  fromWork("supply-chain-agent-system", "prod", true),
  fromWork("dynamic-tool-resolution", "prod", true),
  fromWork("supply-chain-domain-llm", "prod", true),
  fromWork("multi-objective-attribute-rl", "method", false),
  fromWork("m365-copilot-memory", "arch", false),
  fromWork("supchain-bench", "paper", false),
  {
    id: "survey",
    figure: "~250",
    measures: { en: "papers surveyed", zh: "篇文献梳理" },
    source: { en: "Multi-turn agent evaluation", zh: "多轮智能体评测综述" },
    kind: "survey",
  },
  {
    id: "visualdeltas",
    figure: "+8.2%",
    measures: { en: "gain, at best", zh: "最高提升" },
    source: { en: "VisualDeltas", zh: "VisualDeltas" },
    kind: "research",
  },
];

const GLYPHS = "0123456789%+~≈";
const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Settles each figure left to right, cycling digits before each character lands.
function settle(tiles) {
  const start = performance.now();
  const jobs = tiles.map((tile, i) => {
    const el = tile.querySelector("[data-fig]");
    const target = el.dataset.fig;
    return { el, target, delay: 120 + i * 90 };
  });
  let raf = 0;
  const step = (now) => {
    let busy = false;
    jobs.forEach(({ el, target, delay }) => {
      const tt = now - start - delay;
      if (tt < 0) {
        busy = true;
        return;
      }
      const landed = Math.floor(tt / 70);
      if (landed >= target.length) {
        if (el.textContent !== target) el.textContent = target;
        return;
      }
      busy = true;
      let s = target.slice(0, landed);
      for (let k = landed; k < target.length; k += 1) {
        const c = target[k];
        s += /[A-Z.]/.test(c)
          ? c
          : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = s;
    });
    if (busy) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

export default function Evidence({ head }) {
  const { t } = useLang();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (reduced() || !("IntersectionObserver" in window)) {
      el.classList.add("is-in", "is-still");
      return undefined;
    }
    let stop = () => {};
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        el.classList.add("is-in");
        stop = settle([...el.querySelectorAll(".ev-tile")]);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  return (
    <section id="evidence" className="h-section ev">
      {head}
      <div className="ev-lead">
        <h2 className="ev-title">{t({ en: "Evidence", zh: "证据" })}</h2>
        <p className="ev-intro">
          {t({
            en: "Eight figures from the work, each with what it measures. Nothing rounded up.",
            zh: "八个来自工作的数字，每个都注明它衡量的是什么，不加修饰。",
          })}
        </p>
      </div>
      <ol className="ev-board" ref={ref}>
        {FIGURES.map((f, i) => (
          <li key={f.id} className="ev-tile" style={{ "--i": i }}>
            <div className="ev-flap">
              <span className="ev-meta mono">
                <span>E{i + 1}</span>
                <span>{t(KIND[f.kind])}</span>
              </span>
              <strong className="ev-fig" aria-label={f.figure}>
                <span data-fig={f.figure} aria-hidden="true">
                  {f.figure}
                </span>
                {f.dagger && (
                  <sup
                    className="ev-dagger"
                    aria-label={t({ en: "see footnote", zh: "见脚注" })}
                  >
                    †
                  </sup>
                )}
              </strong>
              <span className="ev-measures mono">{t(f.measures)}</span>
              <span className="ev-source">{t(f.source)}</span>
            </div>
          </li>
        ))}
      </ol>
      <p className="ev-foot mono">
        <span className="ev-dagger" aria-hidden="true">
          †
        </span>{" "}
        {t(footnote)}
      </p>
    </section>
  );
}
