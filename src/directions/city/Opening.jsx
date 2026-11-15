import { useEffect, useMemo, useRef, useState } from 'react';
import { Header, Outro } from '../../components/Chrome.jsx';
import { useLang } from '../../i18n.jsx';
import { footnote, joinParts, profile, work } from '../../content.js';
import './city.css';

const SVG_W = 1040;
const SVG_H = 580;
const WORLD_H_MAX = 236;
const LOG_MAX = Math.log10(1000 + 1);
const LINEAR_MAX = 600;
const STEP_X = 122;
const TOWER_W = 70;
const TOWER_D = 70;
const BACK_WALL_Y = 54;
const AXIS_X = -395;
const WALL_RIGHT_X = 376;

const YAW_MAX_DEG = 32;
const PITCH_MAX_DEG = 26;

const LOG_MAJOR_TICKS = [0, 10, 100, 1000];
const LOG_MINOR_TICKS = [2, 5, 20, 50, 200, 500];
const LINEAR_MAJOR_TICKS = [0, 150, 300, 450, 600];
const LINEAR_MINOR_TICKS = [50, 100, 200, 250, 350, 400, 500, 550];
const FACADE_LOG_FLOORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500];
const FACADE_LINEAR_FLOORS = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

// Deterministic low-rise surrounding blocks so the 3D skyline reads as an urban datum without randomness.
const CONTEXT_BLOCKS = [
  { id: 'ctx-b1', x0: -380, x1: -322, y0: 84, y1: 126, h: 14, zone: 'back' },
  { id: 'ctx-b2', x0: -256, x1: -194, y0: 88, y1: 132, h: 10, zone: 'back' },
  { id: 'ctx-b3', x0: -140, x1: -76, y0: 84, y1: 120, h: 16, zone: 'back' },
  { id: 'ctx-b4', x0: 12, x1: 78, y0: 86, y1: 130, h: 12, zone: 'back' },
  { id: 'ctx-b5', x0: 142, x1: 204, y0: 90, y1: 128, h: 15, zone: 'back' },
  { id: 'ctx-b6', x0: 274, x1: 344, y0: 84, y1: 122, h: 9, zone: 'back' },
  { id: 'ctx-f1', x0: -352, x1: -292, y0: -108, y1: -70, h: 8, zone: 'front' },
  { id: 'ctx-f2', x0: -186, x1: -120, y0: -112, y1: -74, h: 11, zone: 'front' },
  { id: 'ctx-f3', x0: -24, x1: 38, y0: -104, y1: -68, h: 7, zone: 'front' },
  { id: 'ctx-f4', x0: 148, x1: 214, y0: -110, y1: -72, h: 10, zone: 'front' },
  { id: 'ctx-f5', x0: 278, x1: 342, y0: -106, y1: -70, h: 12, zone: 'front' },
];

const CAMERA_PRESETS = [
  {
    id: 'iso',
    morph: 0,
    label: { en: '01 · 3D Isometric Skyline (0%)', zh: '01 · 三维等轴天际线 (0%)' },
  },
  {
    id: 'axon',
    morph: 0.45,
    label: { en: '02 · Axonometric Tilt (45%)', zh: '02 · 轴测俯仰过渡 (45%)' },
  },
  {
    id: 'flat',
    morph: 1,
    label: { en: '03 · 2D Bar Chart (100%)', zh: '03 · 二维柱状图 (100%)' },
  },
];

const COPY = {
  eyebrow: { en: '12 · city — Architectural Scale Study', zh: '12 · city — 建筑尺度研究' },
  title: { en: 'Every tower is a real figure.', zh: '每一座高楼，都是真实数据。' },
  subtitle: {
    en: 'Six engineering figures built to log₁₀ elevation. Flatten the skyline into an orthographic bar chart—or toggle linear scale to see why logs matter.',
    zh: '六项工程数据按 log₁₀ 比例建造。拉平镜头化作正交柱状图，或切换至线性比例，直观看见对数坐标的意义。',
  },
  paperVellum: { en: 'Vellum #f2efe8', zh: '牛皮图纸 #f2efe8' },
  paperBlueprint: { en: 'Blueprint Grid', zh: '蓝图网格' },
  morphLabel: { en: 'Dimension Morph · 3D ↔ 2D', zh: '维度形变 · 三维 ↔ 二维' },
  scaleLabel: { en: 'Elevation Scale', zh: '高度比例尺' },
  scaleLog: { en: 'log₁₀(x + 1)', zh: '对数 log₁₀(x + 1)' },
  scaleLinear: { en: 'Linear', zh: '线性比例' },
  formulaLog: {
    en: 'h ∝ log₁₀(value + 1) — spans 3 memory layers to 530 samples without dwarfing core architecture.',
    zh: 'h ∝ log₁₀(value + 1) — 让 3 层记忆架构与 530 条样本同框可读，不至于被压缩消失。',
  },
  formulaLinear: {
    en: 'h ∝ value — true linear ratio compresses 3 layers (0.5%) and 12 scenarios (2.0%) into hairline slivers.',
    zh: 'h ∝ value — 真实线性比例会把 3 层架构（0.5%）和 12 个场景（2.0%）压成地面细丝。',
  },
  inspectorTag: { en: 'Blueprint Inspector', zh: '蓝图检视面板' },
  axisField: { en: 'Evaluation Axis', zh: '评测与工程轴' },
  originField: { en: 'Project Source', zh: '项目出处' },
  rationaleField: { en: 'Architectural Rationale', zh: '尺度工程意义' },
  meterField: { en: 'Scale Proportion · log₁₀ vs Linear', zh: '双比例尺对比 · log₁₀ 与线性' },
  ledgerTitle: { en: 'Elevation Schedule (01–06)', zh: '建筑立面索引表（01–06）' },
  ledgerHint: { en: 'Click or hover any monolith to lock elevation crosshairs', zh: '点击或悬停任意单体，锁定标高准星' },
  companionTitle: { en: 'Companion non-scalar milestones in work:', zh: '关联的非标量里程碑（来自作品集）：' },
  prevLabel: { en: 'Previous monolith', zh: '上一座单体' },
  nextLabel: { en: 'Next monolith', zh: '下一座单体' },
  canvasHint: {
    en: 'CLICK OR HOVER ANY MONOLITH · DRAG SLIDER TO FLATTEN',
    zh: '点击或悬停任意高楼 · 拖动滑块拉平视角',
  },
};

function buildMonoliths() {
  const byId = Object.fromEntries(work.map((item) => [item.id, item]));
  const bench = byId['supchain-bench'];
  const tools = byId['dynamic-tool-resolution'];
  const agent = byId['supply-chain-agent-system'];
  const memory = byId['m365-copilot-memory'];

  const specs = [
    {
      id: 'supchain-bench',
      code: '01',
      value: 530,
      display: bench?.metric ?? '530',
      title: bench?.title ?? 'SupChain-Bench',
      shortTitle: { en: ['SupChain', 'Bench'], zh: ['SupChain', '基准集'] },
      unit: bench?.metricLabel ?? { en: 'annotated real-world samples', zh: '条真实标注样本' },
      shortUnit: { en: 'SAMPLES', zh: '样本' },
      source: joinParts([bench?.where, bench?.year]) || 'ACL Findings · 2026',
      axis: { en: 'Evaluation · Unified Benchmark', zh: '评测轴 · 统一行业基准' },
      summary: bench?.line ?? {
        en: 'A unified benchmark for logistics, fulfillment, finance and customs work.',
        zh: '覆盖物流、履约、财务与关务的统一基准。',
      },
      rationale: {
        en: 'Anchors multi-turn agent evaluation in 530 real operational traces across logistics, warehouse fulfillment, finance, and customs—where implicit procedures break generic QA.',
        zh: '以 530 条真实业务轨迹覆盖物流、履约、财务与关务四个高约束环节，暴露通用问答无法触及的隐式流程难题。',
      },
      workRef: bench,
    },
    {
      id: 'multi-turn-survey',
      code: '02',
      value: 250,
      display: '~250',
      title: 'Multi-Turn Agent Survey',
      shortTitle: { en: ['Multi-Turn', 'Survey'], zh: ['多轮评测', '综述'] },
      unit: { en: 'papers mapped across taxonomy', zh: '篇多轮评测论文梳理' },
      shortUnit: { en: 'PAPERS', zh: '论文' },
      source: 'Research · Taxonomy',
      axis: { en: 'Research · Literature Cartography', zh: '研究轴 · 评测谱系梳理' },
      summary: {
        en: 'Systematic synthesis of ~250 papers charting state-space drift, partial-credit verification, and multi-turn tool-use evaluation.',
        zh: '系统梳理约 250 篇多轮智能体论文，绘制状态空间漂移、过程赋分与工具轨迹评测体系。',
      },
      rationale: {
        en: 'Quantifies why single-turn benchmarks diverge from 20-step reality: compounding per-step error demands intermediate milestone scoring and recovery diagnostics.',
        zh: '解释单轮得分与二十步真实长程任务之间的根本落差：误差随轮次指数累积，必须引入过程里程碑与恢复诊断。',
      },
      workRef: null,
    },
    {
      id: 'dynamic-tool-resolution',
      code: '03',
      value: 100,
      display: tools?.metric ?? '100+',
      title: tools?.title ?? 'Dynamic Tool Resolution',
      shortTitle: { en: ['Dynamic', 'Tools'], zh: ['动态', '工具池'] },
      unit: tools?.metricLabel ?? { en: 'tools, resolved at run time', zh: '个工具，运行时动态解析' },
      shortUnit: { en: 'TOOLS', zh: '工具' },
      source: joinParts([tools?.where, tools?.year]) || 'Alibaba · 2025',
      axis: { en: 'Agentic RL · Live Tool Grounding', zh: 'Agentic RL · 动态工具解析' },
      summary: tools?.line ?? {
        en: 'Agentic RL over a changing tool pool. About 90% less manual ticket handling.',
        zh: '在持续变化的工具池上做 Agentic RL，人工工单处理约减少 90%。',
      },
      rationale: {
        en: 'Instead of hardcoding static prompt schemas, policy optimization trains the model to inspect and bind 100+ evolving runtime tools on demand. Its ≈90% less manual ticket handling is a different figure from the ≈90% fewer misoperations at tower 04.',
        zh: '不靠静态提示词硬编码工具列表，而通过 Agentic RL 让策略在运行时按需检索并绑定 100+ 持续变更的工具接口。其「人工工单处理约减少 90%」与第 04 塔的「误操作约减少 90%」是两项不同的数据。',
      },
      workRef: tools,
    },
    {
      id: 'supply-chain-agent-system',
      code: '04',
      value: 90,
      display: agent?.metric ?? '≈90%',
      title: agent?.title ?? 'Supply Chain Agent System',
      shortTitle: { en: ['Agent', 'System'], zh: ['供应链', '智能体'] },
      unit: { en: '≈90% fewer misoperations (a rate, shown for scale)', zh: '误操作约减少 90%（这是比率，仅为比例示意）' },
      shortUnit: { en: 'RATE · FOR SCALE', zh: '比率·示意' },
      source: joinParts([agent?.where, agent?.year]) || 'Alibaba · 2025',
      axis: { en: 'Production · Reliability & Guardrails', zh: '生产轴 · 稳定性与护栏' },
      summary: agent?.line ?? {
        en: 'Risk-tiered, multi-turn decisions with progressive confirmation across 12 supply-chain scenarios.',
        zh: '在 12 个供应链场景中，按风险分级做多轮决策与渐进式确认。',
      },
      rationale: {
        en: 'This tower is the ≈90% fewer misoperations figure (Supply Chain Agent System, 12 scenarios, internal). It is a rate, not a count: the height of 90 is plotted for scale only. The separate ≈90% less manual ticket handling belongs to Dynamic Tool Resolution.',
        zh: '本塔为「误操作约减少 90%」（供应链智能体系统，12 个场景，内部数据）。这是比率而非计数，90 的高度仅为比例示意。「人工工单处理约减少 90%」是动态工具解析的另一项数据。',
      },
      workRef: agent,
    },
    {
      id: 'production-scenarios',
      code: '05',
      value: 12,
      display: '12',
      title: 'Production Scenarios',
      shortTitle: { en: ['12 Prod', 'Scenarios'], zh: ['12 生产', '场景'] },
      unit: { en: 'risk-tiered supply-chain workflows', zh: '个风险分级供应链场景' },
      shortUnit: { en: 'SCENARIOS', zh: '场景' },
      source: joinParts([agent?.where, agent?.year]) || 'Alibaba · 2025',
      axis: { en: 'Operations · Risk-Tiered Guardrails', zh: '业务轴 · 风险分级确认' },
      summary: {
        en: 'Twelve live supply-chain workflows partitioned by blast radius—progressive confirmation before state-changing actions.',
        zh: '按影响半径划分的 12 个核心供应链工作流，在状态变更动作前触发渐进式人工确认。',
      },
      rationale: {
        en: 'At magnitude 12, this tower sits right on the 10¹ decade band—visible on a log₁₀ axis, yet reduced to 2.0% under linear scaling beside sample counts.',
        zh: '数值 12 恰落在 10¹ 量级刻度附近；在对数坐标下轮廓清晰，而在 0–600 线性坐标中会被压扁至仅占 2.0%。',
      },
      workRef: agent,
    },
    {
      id: 'm365-copilot-memory',
      code: '06',
      value: 3,
      display: memory?.metric ?? '3',
      title: memory?.title ?? 'M365 Copilot Memory',
      shortTitle: { en: ['Copilot', 'Memory'], zh: ['Copilot', '记忆层'] },
      unit: memory?.metricLabel ?? { en: 'memory layers', zh: '层记忆架构' },
      shortUnit: { en: 'LAYERS', zh: '层架构' },
      source: joinParts([memory?.where, memory?.year]) || 'MSRA · 2024',
      axis: { en: 'Architecture · Hierarchical Memory', zh: '架构轴 · 分层长程记忆' },
      summary: memory?.line ?? {
        en: 'Long-context memory and multi-turn evaluation for email workflows.',
        zh: '面向邮件工作流的长上下文记忆与多轮评测。',
      },
      rationale: {
        en: 'Turn, session, and persistent memory layers separate immediate dialogue from cross-thread user state. Under linear scale (0.5%), this foundation nearly vanishes; log₁₀ keeps all 3 structural tiers legible.',
        zh: '轮次、会话与持久三层记忆架构将短期对话与长期状态解耦。在线性坐标中仅占 0.5% 几乎不可见，而在 log₁₀ 坐标下仍保持 20.1% 的可检视高度。',
      },
      workRef: memory,
    },
  ];

  return specs.map((item, index) => {
    const xCenter = (index - 2.5) * STEP_X;
    return {
      ...item,
      index,
      xCenter,
      x0: xCenter - TOWER_W / 2,
      x1: xCenter + TOWER_W / 2,
      y0: -TOWER_D / 2,
      y1: TOWER_D / 2,
    };
  });
}

const logRatio = (val) => Math.log10(val + 1) / LOG_MAX;
const linearRatio = (val) => val / LINEAR_MAX;

function heightForValue(val, scaleBlend) {
  const hLog = WORLD_H_MAX * logRatio(val);
  const hLin = WORLD_H_MAX * linearRatio(val);
  return hLog * (1 - scaleBlend) + hLin * scaleBlend;
}

function createProjector(morph) {
  const yaw = (1 - morph) * YAW_MAX_DEG * (Math.PI / 180);
  const pitch = (1 - morph) * PITCH_MAX_DEG * (Math.PI / 180);
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);

  const cx = 532 + 28 * morph;
  const cy = 404 + 54 * morph;
  const camDir = [sinY * cosP, -cosY * cosP, sinP];
  const right = [cosY, sinY, 0];
  const up = [-sinY * sinP, cosY * sinP, cosP];

  const project = (x, y, z) => {
    const sx = cx + x * right[0] + y * right[1];
    const sy = cy - (x * up[0] + y * up[1] + z * up[2]);
    const depth = x * camDir[0] + y * camDir[1] + z * camDir[2];
    return [sx, sy, depth];
  };

  return {
    project,
    yawDeg: (yaw * 180) / Math.PI,
    pitchDeg: (pitch * 180) / Math.PI,
    camDir,
  };
}

const pts = (arr) => arr.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

function renderWallFloors({
  keyPrefix,
  floors,
  ratioFn,
  maxH,
  opacityScale,
  majorPred,
  p0,
  p1,
  project,
  stroke,
  isSelected,
}) {
  if (opacityScale <= 0.05) return null;
  return floors.map((fv) => {
    const fz = WORLD_H_MAX * ratioFn(fv);
    if (fz <= 2 || fz >= maxH - 2) return null;
    const a = project(p0[0], p0[1], fz);
    const b = project(p1[0], p1[1], fz);
    const isMajor = majorPred(fv);
    return (
      <line
        key={`${keyPrefix}-${fv}`}
        x1={a[0]}
        y1={a[1]}
        x2={b[0]}
        y2={b[1]}
        stroke={stroke}
        strokeOpacity={opacityScale * (isMajor ? (isSelected ? 0.72 : 0.48) : isSelected ? 0.22 : 0.14)}
        strokeWidth={isMajor ? 1.05 : 0.7}
      />
    );
  });
}

function renderAxisGridlines({
  keyPrefix,
  majorTicks,
  minorTicks,
  ratioFn,
  opacity,
  morph,
  project,
  cobalt,
}) {
  if (opacity <= 0.02) return null;
  return (
    <g opacity={opacity}>
      {majorTicks.map((tick) => {
        const z = WORLD_H_MAX * ratioFn(tick);
        const a = project(AXIS_X, BACK_WALL_Y, z);
        const b = project(WALL_RIGHT_X, BACK_WALL_Y, z);
        const tickEnd = project(AXIS_X - 8, BACK_WALL_Y, z);
        return (
          <g key={`${keyPrefix}-maj-${tick}`}>
            <line
              x1={a[0]}
              y1={a[1]}
              x2={b[0]}
              y2={b[1]}
              stroke={cobalt}
              strokeOpacity={tick === 0 ? 0.72 : 0.24 + 0.14 * morph}
              strokeWidth={tick === 0 ? 1.25 : 0.9}
              strokeDasharray={tick === 0 ? undefined : '4 4'}
            />
            <line x1={tickEnd[0]} y1={tickEnd[1]} x2={a[0]} y2={a[1]} stroke={cobalt} strokeWidth="1.2" />
            <text
              x={tickEnd[0] - 8}
              y={tickEnd[1] + 3.5}
              textAnchor="end"
              className="city-svg-mono"
              fontSize="11"
              fill={cobalt}
            >
              {tick.toLocaleString()}
            </text>
          </g>
        );
      })}
      {minorTicks.map((tick) => {
        const z = WORLD_H_MAX * ratioFn(tick);
        const a = project(AXIS_X, BACK_WALL_Y, z);
        const tickEnd = project(AXIS_X - 5, BACK_WALL_Y, z);
        return (
          <line
            key={`${keyPrefix}-min-${tick}`}
            x1={tickEnd[0]}
            y1={tickEnd[1]}
            x2={a[0]}
            y2={a[1]}
            stroke={cobalt}
            strokeOpacity="0.55"
            strokeWidth="0.9"
          />
        );
      })}
    </g>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

export default function CityOpening({ embedded = false, head = null }) {
  const { lang, t } = useLang();
  const reducedMotion = usePrefersReducedMotion();

  const monoliths = useMemo(() => buildMonoliths(), []);
  const companionWork = useMemo(
    () => work.filter((w) => w.id === 'supply-chain-domain-llm' || w.id === 'multi-objective-attribute-rl'),
    [],
  );

  const [paper, setPaper] = useState('vellum');
  const [scaleMode, setScaleMode] = useState('log');
  const [targetMorph, setTargetMorph] = useState(0);
  const [renderedMorph, setRenderedMorph] = useState(0);
  const [renderedBlend, setRenderedBlend] = useState(0);

  const [selectedId, setSelectedId] = useState('supchain-bench');
  const [hoveredId, setHoveredId] = useState(null);

  const morphRef = useRef(0);
  const blendRef = useRef(0);

  const targetBlend = scaleMode === 'log' ? 0 : 1;

  // Animate camera morph smoothly when triggered via preset pills.
  useEffect(() => {
    if (reducedMotion) return undefined;
    const from = morphRef.current;
    const to = targetMorph;
    if (Math.abs(to - from) < 0.0005) return undefined;

    let raf = 0;
    const duration = 560;
    const start = performance.now();

    const step = (now) => {
      const raw = Math.min(1, (now - start) / duration);
      const eased = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      const val = from + (to - from) * eased;
      morphRef.current = val;
      setRenderedMorph(val);
      if (raw < 1) {
        raf = requestAnimationFrame(step);
      } else {
        morphRef.current = to;
        setRenderedMorph(to);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [targetMorph, reducedMotion]);

  // Animate height interpolation smoothly between log10(x + 1) and linear scales.
  useEffect(() => {
    if (reducedMotion) return undefined;
    const from = blendRef.current;
    const to = targetBlend;
    if (Math.abs(to - from) < 0.0005) return undefined;

    let raf = 0;
    const duration = 500;
    const start = performance.now();

    const step = (now) => {
      const raw = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - raw, 3);
      const val = from + (to - from) * eased;
      blendRef.current = val;
      setRenderedBlend(val);
      if (raw < 1) {
        raf = requestAnimationFrame(step);
      } else {
        blendRef.current = to;
        setRenderedBlend(to);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [targetBlend, reducedMotion]);

  const morph = reducedMotion ? targetMorph : renderedMorph;
  const scaleBlend = reducedMotion ? targetBlend : renderedBlend;

  const handleSliderChange = (event) => {
    const next = Number(event.target.value) / 100;
    morphRef.current = next;
    setRenderedMorph(next);
    setTargetMorph(next);
  };

  const handlePresetClick = (presetMorph) => {
    setTargetMorph(presetMorph);
  };

  const activeId = hoveredId || selectedId;
  const inspectedMonolith = useMemo(
    () => monoliths.find((m) => m.id === activeId) || monoliths[0],
    [monoliths, activeId],
  );

  const stepSelection = (delta) => {
    const idx = monoliths.findIndex((m) => m.id === selectedId);
    const nextIdx = (idx + delta + monoliths.length) % monoliths.length;
    setSelectedId(monoliths[nextIdx].id);
    setHoveredId(null);
  };

  const cam = useMemo(() => createProjector(morph), [morph]);
  const P = cam.project;

  const isBlueprint = paper === 'blueprint';
  const palette = isBlueprint
    ? {
        bg: '#0c1842',
        surface: '#112156',
        ink: '#f2efe8',
        muted: 'rgba(242, 239, 232, 0.62)',
        hair: 'rgba(242, 239, 232, 0.18)',
        cobalt: '#739bff',
        cobaltDeep: '#3d6cff',
        orange: '#ff5a1f',
        ground: '#102052',
        groundLine: 'rgba(242, 239, 232, 0.14)',
        towerTop: '#1f398f',
        towerFront: '#15296c',
        towerSide: '#0e1d52',
        selTop: '#3658ff',
        selFront: '#1a3cff',
        selSide: '#1228b5',
        ctxTop: '#162b6e',
        ctxFront: '#112257',
        ctxSide: '#0d1a46',
      }
    : {
        bg: '#f2efe8',
        surface: '#fbf9f4',
        ink: '#111111',
        muted: 'rgba(17, 17, 17, 0.56)',
        hair: 'rgba(17, 17, 17, 0.16)',
        cobalt: '#1a3cff',
        cobaltDeep: '#1029c4',
        orange: '#ff5a1f',
        ground: '#e9e4d9',
        groundLine: 'rgba(17, 17, 17, 0.11)',
        towerTop: '#ffffff',
        towerFront: '#f6f3ec',
        towerSide: '#dfd9cc',
        selTop: '#4c68ff',
        selFront: '#1a3cff',
        selSide: '#1129bd',
        ctxTop: '#ebe6db',
        ctxFront: '#e2dcd0',
        ctxSide: '#d0c9ba',
      };

  const groundOpacity = Math.max(0, 1 - morph * 1.15);
  const contextOpacity = Math.max(0, 1 - morph * 1.65);
  const sideVisible = cam.yawDeg > 0.4;
  const topVisible = cam.pitchDeg > 0.4;
  const axisLabelOpacity = Math.min(1, Math.max(0, (morph - 0.32) / 0.45));
  const lotLabelOpacity = Math.max(0, 1 - morph * 1.4);

  const groundPoly = [
    P(-415, -120, 0),
    P(395, -120, 0),
    P(395, 148, 0),
    P(-415, 148, 0),
  ];

  const streetGridX = [];
  for (let gx = -366; gx <= 366; gx += STEP_X / 2) {
    streetGridX.push([P(gx, -120, 0), P(gx, 148, 0)]);
  }
  const streetGridY = [];
  for (let gy = -120; gy <= 140; gy += 36) {
    streetGridY.push([P(-415, gy, 0), P(395, gy, 0)]);
  }

  const backBlocks = CONTEXT_BLOCKS.filter((b) => b.zone === 'back');
  const frontBlocks = CONTEXT_BLOCKS.filter((b) => b.zone === 'front');

  const monolithFrames = monoliths
    .map((m) => {
      const rawH = heightForValue(m.value, scaleBlend);
      const h = Math.max(2.2, rawH);
      const centerDepth = P(m.xCenter, 0, h / 2)[2];
      return { ...m, h, rawH, centerDepth };
    })
    .sort((a, b) => a.centerDepth - b.centerDepth);

  const inspectedFrame = monolithFrames.find((m) => m.id === inspectedMonolith.id) || monolithFrames[0];
  const guideStart = P(inspectedFrame.x0, 0, inspectedFrame.h);
  const guideBack = P(inspectedFrame.x0, BACK_WALL_Y, inspectedFrame.h);
  const guideAxis = P(AXIS_X, BACK_WALL_Y, inspectedFrame.h);

  const axisBottom = P(AXIS_X, BACK_WALL_Y, 0);
  const axisTop = P(AXIS_X, BACK_WALL_Y, WORLD_H_MAX + 16);
  const baseLineStart = P(AXIS_X, BACK_WALL_Y, 0);
  const baseLineEnd = P(WALL_RIGHT_X, BACK_WALL_Y, 0);

  const renderContextBlock = (b) => {
    const frontFace = [P(b.x0, b.y0, 0), P(b.x1, b.y0, 0), P(b.x1, b.y0, b.h), P(b.x0, b.y0, b.h)];
    const rightFace = [P(b.x1, b.y0, 0), P(b.x1, b.y1, 0), P(b.x1, b.y1, b.h), P(b.x1, b.y0, b.h)];
    const topFace = [P(b.x0, b.y0, b.h), P(b.x1, b.y0, b.h), P(b.x1, b.y1, b.h), P(b.x0, b.y1, b.h)];
    return (
      <g key={b.id} opacity={contextOpacity}>
        <polygon points={pts(frontFace)} fill={palette.ctxFront} stroke={palette.hair} strokeWidth="0.85" strokeLinejoin="round" />
        {sideVisible && (
          <polygon points={pts(rightFace)} fill={palette.ctxSide} stroke={palette.hair} strokeWidth="0.85" strokeLinejoin="round" />
        )}
        {topVisible && (
          <polygon points={pts(topFace)} fill={palette.ctxTop} stroke={palette.hair} strokeWidth="0.85" strokeLinejoin="round" />
        )}
      </g>
    );
  };

  const inspectedLogPct = Math.round(logRatio(inspectedMonolith.value) * 1000) / 10;
  const inspectedLinPct = Math.round(linearRatio(inspectedMonolith.value) * 1000) / 10;
  const morphPct = Math.round(morph * 100);
  const profileMeta = joinParts([profile.name, joinParts([t(profile.role), t(profile.org)], ', ')], ' — ');

  return (
    <div
      className={`city${embedded ? ' is-embedded' : ''}${isBlueprint ? ' is-blueprint' : ''}${
        lang === 'zh' ? ' is-zh' : ''
      }`}
    >
      {!embedded && <Header />}

      <section className="city-sheet" aria-label={t(COPY.eyebrow)}>
        {embedded && head && <div className="city-head-slot">{head}</div>}

        <header className="city-masthead">
          <div className="city-masthead-copy">
            <p className="eyebrow city-eyebrow">
              {t(COPY.eyebrow)}
              {!embedded && profileMeta ? ` · ${profileMeta}` : ''}
            </p>
            <h1 className="city-title">{t(COPY.title)}</h1>
            <p className="city-sub">{t(COPY.subtitle)}</p>
          </div>

          <div className="city-substrate-toggle mono" role="group" aria-label={t({ en: 'Drafting paper theme', zh: '图纸背景模式' })}>
            <button
              type="button"
              className={!isBlueprint ? 'is-active' : undefined}
              onClick={() => setPaper('vellum')}
              aria-pressed={!isBlueprint}
            >
              {t(COPY.paperVellum)}
            </button>
            <button
              type="button"
              className={isBlueprint ? 'is-active' : undefined}
              onClick={() => setPaper('blueprint')}
              aria-pressed={isBlueprint}
            >
              {t(COPY.paperBlueprint)}
            </button>
          </div>
        </header>

        <div className="city-controls">
          <div className="city-control-block city-morph-block">
            <div className="city-control-head mono">
              <span>{t(COPY.morphLabel)}</span>
              <span className="city-telemetry">
                {morphPct}% · YAW {cam.yawDeg.toFixed(1)}° · PITCH {cam.pitchDeg.toFixed(1)}°
              </span>
            </div>

            <div className="city-presets" role="group" aria-label={t(COPY.morphLabel)}>
              {CAMERA_PRESETS.map((preset) => {
                const isActive = Math.abs(targetMorph - preset.morph) < 0.015;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`city-pill mono${isActive ? ' is-active' : ''}`}
                    onClick={() => handlePresetClick(preset.morph)}
                    aria-pressed={isActive}
                  >
                    {t(preset.label)}
                  </button>
                );
              })}
            </div>

            <div className="city-slider-row">
              <span className="mono city-slider-end">3D · 0%</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(targetMorph * 100)}
                onChange={handleSliderChange}
                className="city-slider"
                aria-label={t(COPY.morphLabel)}
                aria-valuetext={`${Math.round(targetMorph * 100)}%`}
              />
              <span className="mono city-slider-end">2D · 100%</span>
            </div>
          </div>

          <div className="city-control-block city-scale-block">
            <div className="city-control-head mono">
              <span>{t(COPY.scaleLabel)}</span>
              <span className="city-formula-tag">
                {scaleMode === 'log' ? 'h ∝ log₁₀(value + 1)' : 'h ∝ value'}
              </span>
            </div>

            <div className="city-scale-switch" role="group" aria-label={t(COPY.scaleLabel)}>
              <button
                type="button"
                className={`mono${scaleMode === 'log' ? ' is-active' : ''}`}
                onClick={() => setScaleMode('log')}
                aria-pressed={scaleMode === 'log'}
              >
                {t(COPY.scaleLog)}
              </button>
              <button
                type="button"
                className={`mono${scaleMode === 'linear' ? ' is-active' : ''}`}
                onClick={() => setScaleMode('linear')}
                aria-pressed={scaleMode === 'linear'}
              >
                {t(COPY.scaleLinear)}
              </button>
            </div>

            <p className="city-formula-note">{t(scaleMode === 'log' ? COPY.formulaLog : COPY.formulaLinear)}</p>
            <p className="city-illus mono">{t({ en: 'Illustrative values — not measurements.', zh: '示意数值，并非实测。' })}</p>
          </div>
        </div>

        <div className="city-workspace">
          <div className="city-viewport-card">
            <svg
              className="city-svg"
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              role="img"
              aria-label={t({
                en: 'Interactive 3D isometric skyline morphing into a 2D bar chart of Damon Guan metrics',
                zh: '可交互的三维等轴天际线与二维柱状图变形视图',
              })}
            >
              <defs>
                <pattern id="city-grid-minor" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path
                    d="M 24 0 L 0 0 0 24"
                    fill="none"
                    stroke={isBlueprint ? 'rgba(242,239,232,0.06)' : 'rgba(17,17,17,0.045)'}
                    strokeWidth="0.7"
                  />
                </pattern>
                <pattern id="city-grid-major" width="96" height="96" patternUnits="userSpaceOnUse">
                  <rect width="96" height="96" fill="url(#city-grid-minor)" />
                  <path
                    d="M 96 0 L 0 0 0 96"
                    fill="none"
                    stroke={isBlueprint ? 'rgba(115,155,255,0.16)' : 'rgba(26,60,255,0.10)'}
                    strokeWidth="0.9"
                  />
                </pattern>
              </defs>

              <rect width={SVG_W} height={SVG_H} fill={palette.surface} />
              <rect x="14" y="14" width={SVG_W - 28} height={SVG_H - 28} fill="url(#city-grid-major)" stroke={palette.hair} strokeWidth="1" />

              {/* Drafting corner registration marks & sheet stamp */}
              <g className="city-svg-mono" fill={palette.muted} fontSize="10">
                <text x="28" y="34">
                  DWG NO. 12-CITY · {scaleMode === 'log' ? 'LOG10(X+1)' : 'LINEAR [0–600]'}
                </text>
                <text x={SVG_W - 28} y="34" textAnchor="end">
                  PROJ: {morphPct === 0 ? 'ISOMETRIC 3D' : morphPct === 100 ? 'ORTHOGRAPHIC 2D' : `MORPH ${morphPct}%`}
                </text>
              </g>

              {/* 3D ground plate & street grid (foreshortens cleanly into baseline) */}
              {groundOpacity > 0.01 && (
                <g opacity={groundOpacity}>
                  <polygon points={pts(groundPoly)} fill={palette.ground} stroke={palette.hair} strokeWidth="0.8" />
                  {streetGridX.map(([a, b], i) => (
                    <line
                      key={`gx-${i}`}
                      x1={a[0]}
                      y1={a[1]}
                      x2={b[0]}
                      y2={b[1]}
                      stroke={palette.groundLine}
                      strokeWidth="0.75"
                    />
                  ))}
                  {streetGridY.map(([a, b], i) => (
                    <line
                      key={`gy-${i}`}
                      x1={a[0]}
                      y1={a[1]}
                      x2={b[0]}
                      y2={b[1]}
                      stroke={palette.groundLine}
                      strokeWidth="0.75"
                    />
                  ))}
                </g>
              )}

              {/* Directional architectural cast shadows on datum z=0 */}
              {groundOpacity > 0.01 && (
                <g opacity={groundOpacity * 0.14} fill={isBlueprint ? '#04091e' : '#111111'}>
                  {monolithFrames.map((m) => {
                    const dx = m.h * 0.42;
                    const dy = m.h * 0.28;
                    const shadowQuad = [
                      P(m.x1, m.y0, 0),
                      P(m.x1 + dx, m.y0 + dy, 0),
                      P(m.x1 + dx, m.y1 + dy, 0),
                      P(m.x0 + dx, m.y1 + dy, 0),
                      P(m.x0, m.y1, 0),
                      P(m.x1, m.y1, 0),
                    ];
                    return <polygon key={`sh-${m.id}`} points={pts(shadowQuad)} />;
                  })}
                </g>
              )}

              {/* Back context blocks */}
              {contextOpacity > 0.01 && backBlocks.map(renderContextBlock)}

              {/* Elevation datum wall & cobalt Y-axis */}
              <g>
                {renderAxisGridlines({
                  keyPrefix: 'log',
                  majorTicks: LOG_MAJOR_TICKS,
                  minorTicks: LOG_MINOR_TICKS,
                  ratioFn: logRatio,
                  opacity: 1 - scaleBlend,
                  morph,
                  project: P,
                  cobalt: palette.cobalt,
                })}
                {renderAxisGridlines({
                  keyPrefix: 'lin',
                  majorTicks: LINEAR_MAJOR_TICKS,
                  minorTicks: LINEAR_MINOR_TICKS,
                  ratioFn: linearRatio,
                  opacity: scaleBlend,
                  morph,
                  project: P,
                  cobalt: palette.cobalt,
                })}

                {/* Vertical cobalt elevation axis pole + datum baseline */}
                <line
                  x1={axisBottom[0]}
                  y1={axisBottom[1]}
                  x2={axisTop[0]}
                  y2={axisTop[1]}
                  stroke={palette.cobalt}
                  strokeWidth="1.6"
                />
                <polygon
                  points={`${axisTop[0]},${axisTop[1] - 6} ${axisTop[0] - 3.5},${axisTop[1] + 2} ${axisTop[0] + 3.5},${axisTop[1] + 2}`}
                  fill={palette.cobalt}
                />
                <text
                  x={axisTop[0] - 8}
                  y={axisTop[1] - 12}
                  textAnchor="end"
                  className="city-svg-mono"
                  fontSize="9.5"
                  fill={palette.cobalt}
                >
                  {scaleMode === 'log' ? 'ELEV · LOG₁₀' : 'ELEV · LINEAR'}
                </text>
                <line
                  x1={baseLineStart[0]}
                  y1={baseLineStart[1]}
                  x2={baseLineEnd[0]}
                  y2={baseLineEnd[1]}
                  stroke={palette.ink}
                  strokeOpacity={0.35 + 0.55 * morph}
                  strokeWidth="1.2"
                />
              </g>

              {/* Six data monoliths (sorted back-to-front by camera depth) */}
              {monolithFrames.map((m) => {
                const isSelected = m.id === selectedId;
                const isHovered = m.id === hoveredId;
                const isActive = m.id === inspectedMonolith.id;

                const frontFace = [P(m.x0, m.y0, 0), P(m.x1, m.y0, 0), P(m.x1, m.y0, m.h), P(m.x0, m.y0, m.h)];
                const rightFace = [P(m.x1, m.y0, 0), P(m.x1, m.y1, 0), P(m.x1, m.y1, m.h), P(m.x1, m.y0, m.h)];
                const topFace = [P(m.x0, m.y0, m.h), P(m.x1, m.y0, m.h), P(m.x1, m.y1, m.h), P(m.x0, m.y1, m.h)];
                const roofInset = 7;
                const innerRoof = [
                  P(m.x0 + roofInset, m.y0 + roofInset, m.h),
                  P(m.x1 - roofInset, m.y0 + roofInset, m.h),
                  P(m.x1 - roofInset, m.y1 - roofInset, m.h),
                  P(m.x0 + roofInset, m.y1 - roofInset, m.h),
                ];

                const fillFront = isSelected ? palette.selFront : palette.towerFront;
                const fillSide = isSelected ? palette.selSide : palette.towerSide;
                const fillTop = isSelected ? palette.selTop : palette.towerTop;
                const wireStroke = isHovered && !isSelected ? palette.orange : isSelected ? palette.cobalt : palette.ink;
                const wireWidth = isActive ? 1.85 : 1.15;
                const mullionStroke = isSelected ? '#ffffff' : palette.ink;

                const roofCenter = P(m.xCenter, 0, m.h);
                const stemLen = 28 - 4 * morph;
                const labelY = roofCenter[1] - stemLen;
                const lotCenter = P(m.xCenter, m.y0 - 20, 0);
                const xAxisAnchor = P(m.xCenter, BACK_WALL_Y, 0);
                const shortName = t(m.shortTitle);

                const mullionXs = [m.x0 + TOWER_W / 3, m.x0 + (2 * TOWER_W) / 3];
                const sideMullionY = m.y0 + TOWER_D / 2;
                const hitHeight = Math.max(m.h + 44, 62);
                const hitPoly = [P(m.x0 - 6, m.y0, 0), P(m.x1 + 6, m.y0, 0), P(m.x1 + 6, m.y0, hitHeight), P(m.x0 - 6, m.y0, hitHeight)];

                return (
                  <g
                    key={m.id}
                    className={`city-monolith${isSelected ? ' is-selected' : ''}${isHovered ? ' is-hovered' : ''}`}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSelected}
                    aria-label={`${m.code} ${m.title}: ${m.display} ${t(m.unit)}`}
                    onClick={() => setSelectedId(m.id)}
                    onMouseEnter={() => setHoveredId(m.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setSelectedId(m.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedId(m.id);
                      }
                    }}
                  >
                    {/* Generous invisible hit area so even sliver-height bars in Linear mode remain easy to select */}
                    <polygon points={pts(hitPoly)} fill="transparent" stroke="none" />

                    {/* Front facade */}
                    <polygon points={pts(frontFace)} fill={fillFront} stroke={wireStroke} strokeWidth={wireWidth} strokeLinejoin="round" />

                    {/* Front vertical curtain-wall mullions */}
                    {m.h > 8 &&
                      mullionXs.map((mx, idx) => {
                        const b = P(mx, m.y0, 0);
                        const tp = P(mx, m.y0, m.h);
                        return (
                          <line
                            key={`fm-${idx}`}
                            x1={b[0]}
                            y1={b[1]}
                            x2={tp[0]}
                            y2={tp[1]}
                            stroke={mullionStroke}
                            strokeOpacity={isSelected ? 0.22 * (1 - 0.5 * morph) : 0.12 * (1 - 0.55 * morph)}
                            strokeWidth="0.8"
                          />
                        );
                      })}

                    {renderWallFloors({
                      keyPrefix: 'fl-log',
                      floors: FACADE_LOG_FLOORS,
                      ratioFn: logRatio,
                      maxH: m.h,
                      opacityScale: 1 - scaleBlend,
                      majorPred: (fv) => fv === 10 || fv === 100,
                      p0: [m.x0, m.y0],
                      p1: [m.x1, m.y0],
                      project: P,
                      stroke: mullionStroke,
                      isSelected,
                    })}

                    {renderWallFloors({
                      keyPrefix: 'fl-lin',
                      floors: FACADE_LINEAR_FLOORS,
                      ratioFn: linearRatio,
                      maxH: m.h,
                      opacityScale: scaleBlend,
                      majorPred: (fv) => fv % 100 === 0,
                      p0: [m.x0, m.y0],
                      p1: [m.x1, m.y0],
                      project: P,
                      stroke: mullionStroke,
                      isSelected,
                    })}

                    {/* Right side facade */}
                    {sideVisible && (
                      <>
                        <polygon points={pts(rightFace)} fill={fillSide} stroke={wireStroke} strokeWidth={wireWidth} strokeLinejoin="round" />
                        {m.h > 8 && (
                          <line
                            x1={P(m.x1, sideMullionY, 0)[0]}
                            y1={P(m.x1, sideMullionY, 0)[1]}
                            x2={P(m.x1, sideMullionY, m.h)[0]}
                            y2={P(m.x1, sideMullionY, m.h)[1]}
                            stroke={mullionStroke}
                            strokeOpacity={isSelected ? 0.22 : 0.12}
                            strokeWidth="0.8"
                          />
                        )}
                        {renderWallFloors({
                          keyPrefix: 'sl-log',
                          floors: FACADE_LOG_FLOORS,
                          ratioFn: logRatio,
                          maxH: m.h,
                          opacityScale: 1 - scaleBlend,
                          majorPred: (fv) => fv === 10 || fv === 100,
                          p0: [m.x1, m.y0],
                          p1: [m.x1, m.y1],
                          project: P,
                          stroke: mullionStroke,
                          isSelected,
                        })}
                        {renderWallFloors({
                          keyPrefix: 'sl-lin',
                          floors: FACADE_LINEAR_FLOORS,
                          ratioFn: linearRatio,
                          maxH: m.h,
                          opacityScale: scaleBlend,
                          majorPred: (fv) => fv % 100 === 0,
                          p0: [m.x1, m.y0],
                          p1: [m.x1, m.y1],
                          project: P,
                          stroke: mullionStroke,
                          isSelected,
                        })}
                      </>
                    )}

                    {/* Top roof slab + inner architectural parapet */}
                    {topVisible && (
                      <>
                        <polygon points={pts(topFace)} fill={fillTop} stroke={wireStroke} strokeWidth={wireWidth} strokeLinejoin="round" />
                        <polygon
                          points={pts(innerRoof)}
                          fill="none"
                          stroke={isSelected ? '#ffffff' : wireStroke}
                          strokeOpacity={isSelected ? 0.42 : 0.25}
                          strokeWidth="0.75"
                        />
                      </>
                    )}

                    {/* Active tangerine wireframe crown highlight */}
                    {isActive && (
                      <polygon
                        points={pts(topVisible ? topFace : frontFace)}
                        fill="none"
                        stroke={palette.orange}
                        strokeWidth="1.9"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Rooftop beacon + metric callout */}
                    <g className="city-callout">
                      <line
                        x1={roofCenter[0]}
                        y1={roofCenter[1]}
                        x2={roofCenter[0]}
                        y2={labelY + 6}
                        stroke={isActive ? palette.orange : palette.ink}
                        strokeWidth={isActive ? 1.4 : 1}
                      />
                      <circle cx={roofCenter[0]} cy={roofCenter[1]} r={isActive ? 3.2 : 2.3} fill={isActive ? palette.orange : palette.ink} />
                      <text
                        x={roofCenter[0]}
                        y={labelY - 11}
                        textAnchor="middle"
                        className="city-svg-display"
                        fontSize="21"
                        fontWeight="850"
                        fill={isActive ? palette.orange : isSelected ? palette.cobalt : palette.ink}
                        stroke={palette.surface}
                        strokeWidth="4.5"
                        paintOrder="stroke"
                        strokeLinejoin="round"
                      >
                        {m.display}
                      </text>
                      <text
                        x={roofCenter[0]}
                        y={labelY + 2}
                        textAnchor="middle"
                        className="city-svg-mono"
                        fontSize="9"
                        fill={isActive ? palette.orange : palette.muted}
                        stroke={palette.surface}
                        strokeWidth="3.5"
                        paintOrder="stroke"
                      >
                        {t(m.shortUnit)}
                      </text>
                    </g>

                    {/* Street lot tag in 3D morphing cleanly into X-axis project label in 2D */}
                    {lotLabelOpacity > 0.03 && (
                      <text
                        x={lotCenter[0]}
                        y={lotCenter[1]}
                        textAnchor="middle"
                        className="city-svg-mono"
                        fontSize="9.5"
                        opacity={lotLabelOpacity}
                        fill={isActive ? palette.orange : palette.muted}
                      >
                        LOT {m.code}
                      </text>
                    )}

                    {axisLabelOpacity > 0.03 && (
                      <g opacity={axisLabelOpacity}>
                        <text
                          x={xAxisAnchor[0]}
                          y={xAxisAnchor[1] + 22}
                          textAnchor="middle"
                          className="city-svg-mono"
                          fontSize="10.5"
                          fontWeight={isActive ? '600' : '400'}
                          fill={isActive ? palette.orange : palette.ink}
                        >
                          {shortName[0]}
                        </text>
                        <text
                          x={xAxisAnchor[0]}
                          y={xAxisAnchor[1] + 35}
                          textAnchor="middle"
                          className="city-svg-mono"
                          fontSize="9.5"
                          fill={palette.muted}
                        >
                          {shortName[1]}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Front context blocks (below towers on front street curb) */}
              {contextOpacity > 0.01 && frontBlocks.map(renderContextBlock)}

              {/* Live horizontal elevation ray from inspected monolith to Y-axis */}
              <g pointerEvents="none">
                <polyline
                  points={pts([guideStart, guideBack, guideAxis])}
                  fill="none"
                  stroke={palette.orange}
                  strokeWidth="1.4"
                  strokeDasharray="4 3"
                />
                <polygon
                  points={`${guideAxis[0]},${guideAxis[1] - 4.5} ${guideAxis[0] + 4.5},${guideAxis[1]} ${guideAxis[0]},${guideAxis[1] + 4.5} ${guideAxis[0] - 4.5},${guideAxis[1]}`}
                  fill={palette.orange}
                />
                <rect
                  x={guideAxis[0] - 84}
                  y={guideAxis[1] - 11}
                  width="74"
                  height="20"
                  rx="2"
                  fill={palette.orange}
                />
                <text
                  x={guideAxis[0] - 47}
                  y={guideAxis[1] + 2.5}
                  textAnchor="middle"
                  className="city-svg-mono"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#ffffff"
                >
                  EL. {inspectedFrame.display}
                </text>
              </g>

              {/* Viewport footer engineering legend */}
              <g className="city-svg-mono" fill={palette.muted} fontSize="9.5">
                <text x="28" y={SVG_H - 26}>
                  {t(COPY.canvasHint)}
                </text>
                <text x={SVG_W - 28} y={SVG_H - 26} textAnchor="end">
                  DATUM Z = 0.00 · UNITS: ILLUSTRATIVE SCALE
                </text>
              </g>
            </svg>
          </div>

          <aside className="city-inspector" aria-live="polite">
            <div className="city-inspector-top mono">
              <span className="city-spec-code">SPEC // {inspectedMonolith.code}</span>
              <div className="city-step-nav">
                <button type="button" onClick={() => stepSelection(-1)} aria-label={t(COPY.prevLabel)}>
                  ←
                </button>
                <span>{inspectedMonolith.code} / 06</span>
                <button type="button" onClick={() => stepSelection(1)} aria-label={t(COPY.nextLabel)}>
                  →
                </button>
              </div>
            </div>

            <div className="city-inspector-hero">
              <strong className="city-inspector-metric">{inspectedMonolith.display}</strong>
              <span className="city-inspector-unit mono">{t(inspectedMonolith.unit)}</span>
            </div>

            <h2 className="city-inspector-title">{inspectedMonolith.title}</h2>
            <p className="city-inspector-source mono">{inspectedMonolith.source}</p>
            <p className="city-inspector-summary">{t(inspectedMonolith.summary)}</p>

            <dl className="city-spec-meta">
              <div>
                <dt className="mono">{t(COPY.axisField)}</dt>
                <dd>{t(inspectedMonolith.axis)}</dd>
              </div>
              <div>
                <dt className="mono">{t(COPY.originField)}</dt>
                <dd>{inspectedMonolith.workRef ? `${inspectedMonolith.workRef.title} (${inspectedMonolith.source})` : inspectedMonolith.source}</dd>
              </div>
              <div>
                <dt className="mono">{t(COPY.rationaleField)}</dt>
                <dd>{t(inspectedMonolith.rationale)}</dd>
              </div>
            </dl>

            <div className="city-meter-box">
              <div className="city-meter-head mono">
                <span>{t(COPY.meterField)}</span>
              </div>
              <div className="city-meter-row">
                <span className="mono">log₁₀(x + 1)</span>
                <div className="city-meter-track">
                  <div className="city-meter-fill is-log" style={{ width: `${Math.max(2, inspectedLogPct)}%` }} />
                </div>
                <span className="mono city-meter-val">{inspectedLogPct.toFixed(1)}%</span>
              </div>
              <div className="city-meter-row">
                <span className="mono">{t(COPY.scaleLinear)}</span>
                <div className="city-meter-track">
                  <div className="city-meter-fill is-lin" style={{ width: `${Math.max(1.5, inspectedLinPct)}%` }} />
                </div>
                <span className="mono city-meter-val">{inspectedLinPct.toFixed(1)}%</span>
              </div>
              <p className="city-illus mono">{t({ en: 'Illustrative values — not measurements.', zh: '示意数值，并非实测。' })}</p>
            </div>
          </aside>
        </div>

        <section className="city-ledger" aria-label={t(COPY.ledgerTitle)}>
          <div className="city-ledger-head mono">
            <h2>{t(COPY.ledgerTitle)}</h2>
            <span>{t(COPY.ledgerHint)}</span>
          </div>

          <ol className="city-ledger-grid">
            {monoliths.map((m) => {
              const isSelected = m.id === selectedId;
              const isHovered = m.id === hoveredId;
              const barPct =
                scaleMode === 'log' ? Math.round(logRatio(m.value) * 1000) / 10 : Math.round(linearRatio(m.value) * 1000) / 10;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    className={`city-ledger-item${isSelected ? ' is-selected' : ''}${isHovered ? ' is-hovered' : ''}`}
                    onClick={() => setSelectedId(m.id)}
                    onMouseEnter={() => setHoveredId(m.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    aria-pressed={isSelected}
                  >
                    <div className="city-ledger-row-top mono">
                      <span>{m.code}</span>
                      <span>{m.source}</span>
                    </div>
                    <div className="city-ledger-row-mid">
                      <strong>{m.display}</strong>
                      <h3>{m.title}</h3>
                    </div>
                    <p className="city-ledger-unit mono">{t(m.unit)}</p>
                    <div className="city-ledger-bar">
                      <span style={{ width: `${Math.max(2, barPct)}%` }} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>

          <footer className="city-ledger-foot">
            <p className="city-companions mono">
              <span>{t(COPY.companionTitle)}</span>
              {companionWork.map((w) => (
                <span key={w.id} className="city-companion-chip">
                  {w.title} · <b>{w.metric}</b> ({joinParts([w.where, w.year])})
                </span>
              ))}
            </p>
            <small className="city-footnote mono">{t(footnote)}</small>
          </footer>
        </section>
      </section>

      {!embedded && <Outro current="city" />}
    </div>
  );
}
