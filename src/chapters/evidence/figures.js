import { work } from '../../content.js';

// The eight Evidence figures, in board order (E1–E8). Every figure string is the résumé's own, verbatim;
// the number used to draw it is parsed from that string, never typed in here, and the scale it is drawn
// on is read from its form:
// - a plain count ("3", "530", "100+", "~250") rises on the count axis, log scale, 1 to 1,000;
// - a percentage ("≈90%", "+8.2%") is a rate, drawn on its own linear 0–100% axis (never as a count);
// - a word ("SOTA", "GRPO") is not a quantity and is not drawn at all.
// "100+" is a lower bound, drawn at 100 with an open top; "~" and "≈" values are drawn at the value stated.

export const KIND = {
  prod: { en: 'Production', zh: '生产' },
  method: { en: 'Method', zh: '方法' },
  arch: { en: 'Architecture', zh: '架构' },
  paper: { en: 'ACL Findings 2026', zh: 'ACL Findings 2026' },
  survey: { en: 'Survey', zh: '综述' },
  research: { en: 'Research', zh: '研究' },
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

const LIST = [
  fromWork('supply-chain-agent-system', 'prod', true),
  fromWork('dynamic-tool-resolution', 'prod', true),
  fromWork('supply-chain-domain-llm', 'prod', true),
  fromWork('multi-objective-attribute-rl', 'method', false),
  fromWork('m365-copilot-memory', 'arch', false),
  fromWork('supchain-bench', 'paper', false),
  {
    id: 'survey',
    figure: '~250',
    measures: { en: 'papers surveyed', zh: '篇文献梳理' },
    source: { en: 'Multi-turn agent evaluation', zh: '多轮智能体评测综述' },
    kind: 'survey',
  },
  {
    id: 'visualdeltas',
    figure: '+8.2%',
    measures: { en: 'gain, at best', zh: '最高提升' },
    source: { en: 'VisualDeltas', zh: 'VisualDeltas' },
    kind: 'research',
  },
];

// the count axis runs over three decades, 1 to 1,000; the rate axis over 0–100%
export const DECADES = 3;
export const COUNT_TICKS = [1, 10, 100, 1000];
export const RATE_TICKS = [0, 25, 50, 75, 100];

function read(figure) {
  const value = parseFloat(figure.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(value)) return { scale: 'none', value: null, frac: 0 };
  if (figure.endsWith('%')) return { scale: 'rate', value, frac: Math.min(1, value / 100) };
  return { scale: 'count', value, frac: Math.min(1, Math.log10(Math.max(1, value)) / DECADES) };
}

export const FIGURES = LIST.map((f, i) => ({
  ...f,
  n: i + 1,
  dagger: Boolean(f.dagger),
  ...read(f.figure),
  lower: /\d\+$/.test(f.figure), // "100+": at least
}));

export const COUNTS = FIGURES.filter((f) => f.scale === 'count');
export const RATES = FIGURES.filter((f) => f.scale === 'rate');
export const WORDS = FIGURES.filter((f) => f.scale === 'none');
