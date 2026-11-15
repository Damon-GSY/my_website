import { useEffect, useMemo, useRef, useState } from 'react';
import { Header, Outro } from '../../components/Chrome.jsx';
import { useLang } from '../../i18n.jsx';
import { footnote, joinParts, path, profile, work } from '../../content.js';
import { notes } from '../../notes.js';
import './bento.css';

const BAR_COUNT = 28;

const PAPERS = [
  {
    kind: { en: 'Survey', zh: '综述' },
    title: {
      en: 'Evaluating LLM-based Agents for Multi-Turn Conversation',
      zh: '面向多轮对话的大语言模型智能体评测综述',
    },
    sub: { en: 'Survey · ~250 papers mapped', zh: '综述 · 梳理约 250 篇文献' },
    noteSlug: 'why-agent-evaluation-is-hard',
  },
  {
    kind: { en: 'Benchmark', zh: '基准测试' },
    title: { en: 'SupChain-Bench', zh: 'SupChain-Bench 供应链智能体基准' },
    sub: {
      en: 'ACL Findings 2026 · 530 annotated real-world samples',
      zh: 'ACL Findings 2026 · 530 条真实场景标注样本',
    },
    noteSlug: 'supchain-bench-notes',
  },
  {
    kind: { en: 'Method', zh: '训练方法' },
    title: { en: 'VisualDeltas', zh: 'VisualDeltas 视觉退化偏好学习' },
    sub: {
      en: 'Preference learning from visual quality · up to +8.2%',
      zh: '从图像质量退化中构造偏好对 · 提升最高 +8.2%',
    },
    noteSlug: 'visual-quality-as-preference-signal',
  },
];

const METRICS = [
  { pre: '', value: 12, suf: '', label: { en: 'supply-chain scenarios', zh: '真实供应链核心场景' } },
  { pre: '', value: 100, suf: '+', label: { en: 'tools resolved at run time', zh: '运行时动态解析工具' } },
  { pre: '', value: 530, suf: '', label: { en: 'benchmark samples', zh: '高质量真实标注样本' } },
  { pre: '~', value: 250, suf: '', label: { en: 'papers reviewed', zh: '篇智能体评测论文梳理' } },
];

const HOW_STEPS = [
  {
    num: '01',
    chip: { en: 'Step 01', zh: '步骤 01' },
    title: { en: 'Evaluate before training', zh: '先建评测，再谈训练' },
    body: {
      en: 'Define the capabilities and failure taxonomy first, then decide what is worth training.',
      zh: '先厘清能力边界与失败模式分类，再决定哪些环节值得投入后训练。',
    },
  },
  {
    num: '02',
    chip: { en: 'Step 02', zh: '步骤 02' },
    title: { en: 'Train for the domain', zh: '面向领域做后训练闭环' },
    body: {
      en: 'Continual pretraining, then SFT and RL, measured against the benchmark built in step one.',
      zh: '持续预训练打底，再接 SFT 与 RL，并用第一步建立的双轴基准持续校准。',
    },
  },
  {
    num: '03',
    chip: { en: 'Step 03', zh: '步骤 03' },
    title: { en: 'Bound the authority', zh: '收束智能体越权边界' },
    body: {
      en: 'Risk tiers and progressive confirmation decide what the agent may execute alone.',
      zh: '以风险分级和渐进式确认机制，明确智能体自主执行的权限红线。',
    },
  },
  {
    num: '04',
    chip: { en: 'Step 04', zh: '步骤 04' },
    title: { en: 'Read the trace', zh: '逐轮审计完整轨迹' },
    body: {
      en: 'Judge tools, memory and recovery step by step, rather than final answers alone.',
      zh: '逐轮检查工具路由、上下文记忆与错误恢复，而不只盯着最终答案得分。',
    },
  },
];

const WORK_INSIGHTS = {
  'supply-chain-agent-system': {
    en: 'Tiered confirmation gate across 12 live fulfillment & customs workflows.',
    zh: '在 12 个在线履约与关务流程中部署风险分级确认护栏。',
  },
  'dynamic-tool-resolution': {
    en: 'Policy routes over a mutating 100+ API pool without prompt bloat.',
    zh: '策略模型在百余动态工具池上实时路由，减少人工介入。',
  },
  'supply-chain-domain-llm': {
    en: 'CPT → SFT → RL pipeline evaluated on domain QA and multi-step tools.',
    zh: 'CPT → SFT → RL 全链路训练，兼顾领域知识问答与复杂工具调用。',
  },
  'multi-objective-attribute-rl': {
    en: 'GRPO with hierarchical rewards balancing fulfillment, bundling & HS Code.',
    zh: '分层与条件 GRPO 奖励，兼顾履约、合包与海关 HS Code 合规。',
  },
  'm365-copilot-memory': {
    en: 'Turn, session and persistent memory layers measured on enterprise email.',
    zh: '面向企业邮件流的三层记忆架构与多轮效用评测。',
  },
  'supchain-bench': {
    en: '530 multi-turn trajectory tasks accepted to ACL Findings 2026.',
    zh: '涵盖物流、履约、财务与关务的 530 条实景多轮评测集（ACL Findings 2026）。',
  },
};

const PIPELINE_NODES = [
  {
    id: 'query',
    tag: '01',
    name: { en: 'Query', zh: '输入' },
    detail: {
      en: 'User request enters with operational context, constraints and risk tier tags.',
      zh: '携带着上下文约束与业务风险等级标签进入系统。',
    },
  },
  {
    id: 'planner',
    tag: '02',
    name: { en: 'Planner', zh: '规划' },
    detail: {
      en: 'Multi-turn policy decomposes intent and selects recoverable sub-goals.',
      zh: '多轮策略模型拆解意图，生成可回退的子目标序列。',
    },
  },
  {
    id: 'tools',
    tag: '03',
    name: { en: 'Tools', zh: '工具' },
    detail: {
      en: 'Dynamic resolver binds schema contracts over a changing 100+ API pool.',
      zh: '在 100+ 动态变化工具池中按契约实时解析参数与权限。',
    },
  },
  {
    id: 'eval',
    tag: '04',
    name: { en: 'Eval', zh: '评测' },
    detail: {
      en: 'Step-level milestones and recovery checks catch drift before side effects.',
      zh: '分步里程碑与自检门控在副作用发生前拦截偏移。',
    },
  },
  {
    id: 'ship',
    tag: '05',
    name: { en: 'Ship', zh: '交付' },
    detail: {
      en: 'Progressive confirmation hands ambiguous mutations back in under 1 second.',
      zh: '高风险状态变更通过 1 秒内人机交接护栏稳健交付。',
    },
  },
];

const RUNTIME_MODES = [
  {
    id: 'eval',
    label: 'EVAL',
    cmd: '$ agent eval --trace multi-turn --bench supchain-530',
    out: {
      en: 'PASS 92% · 42 rubric axes verified · 0 unconfirmed irreversible mutations',
      zh: '通过率 92% · 42 项轨迹指标通过 · 零未授权高危写操作',
    },
    status: 'EVAL GATE READY / 92%',
  },
  {
    id: 'train',
    label: 'TRAIN',
    cmd: '$ grpo train --domain supply-chain --tools 100+ --kl 0.018',
    out: {
      en: 'Reward +0.41 vs SFT · Conditional GRPO stabilised across 4 objectives',
      zh: '相对 SFT 奖励提升 +0.41 · 条件分层 GRPO 四目标稳态收敛',
    },
    status: 'RL CHECKPOINT / +0.41R',
  },
  {
    id: 'deploy',
    label: 'DEPLOY',
    cmd: '$ agent gate --tier 3 --confirm progressive --workers 12',
    out: {
      en: 'Production telemetry: ≈90% fewer misoperations across 12 scenarios',
      zh: '生产遥测：12 个核心供应链场景误操作率降低约 90%',
    },
    status: 'PROD ACTIVE / <1s HANDOFF',
  },
];

const REWARD_BARS = [
  { label: { en: 'Task Completion', zh: '全任务端到端完成度' }, score: '0.94', pct: 94 },
  { label: { en: 'Tool Schema Precision', zh: '百级动态工具参数契合' }, score: '0.91', pct: 91 },
  { label: { en: 'Authority Boundary Gate', zh: 'Tier-3 越权门控准确率' }, score: '0.99', pct: 99 },
  { label: { en: 'Trajectory Step Economy', zh: '多轮规划步数收敛效率' }, score: '0.87', pct: 87 },
];

const STACK_TAGS = ['Python', 'PyTorch', 'vLLM', 'LangGraph', 'React', 'Docker', 'GSAP'];

function makeWaveformHeights() {
  let seed = 20250417;
  const rnd = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const env = 0.55 + 0.45 * Math.sin((i / BAR_COUNT) * Math.PI);
    return Math.round(6 + (rnd() * 0.72 + 0.28) * 22 * env);
  });
}

function ResearchCover({ index }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M50 20v14M50 34H22v14M50 34h28v14M50 34v14" />
        <path d="M22 48v10M22 58h-10v12M22 58h10v12M78 58h-10v12M78 58h10v12M50 58v12" />
        <path d="M78 48v10" />
        <circle cx="50" cy="18" r="6" fill="#EE6A1F" stroke="none" />
        <circle cx="22" cy="48" r="4" fill="currentColor" stroke="none" />
        <circle cx="50" cy="48" r="4" fill="currentColor" stroke="none" />
        <circle cx="78" cy="48" r="4" fill="currentColor" stroke="none" />
        {[12, 32, 50, 68, 88].map((x) => (
          <circle
            key={x}
            cx={x}
            cy="74"
            r="3.2"
            fill={x === 68 ? '#EE6A1F' : 'var(--b-card)'}
            stroke={x === 68 ? '#EE6A1F' : 'currentColor'}
            strokeWidth="1.6"
          />
        ))}
        <path d="M8 88h84" strokeWidth="1" opacity=".25" />
      </svg>
    );
  }
  if (index === 1) {
    const hot = new Set(['0,1', '1,3', '2,0', '2,2']);
    const dots = [];
    for (let c = 0; c < 3; c += 1) {
      for (let r = 0; r < 5; r += 1) {
        const isHot = hot.has(`${c},${r}`);
        dots.push(
          <circle
            key={`${c}-${r}`}
            cx={26 + c * 24}
            cy={18 + r * 16}
            r={isHot ? 5.2 : 4}
            fill={isHot ? '#EE6A1F' : 'currentColor'}
            opacity={isHot ? 1 : 0.35 + ((c * 5 + r) % 3) * 0.25}
          />,
        );
      }
    }
    return (
      <svg viewBox="0 0 100 100">
        {dots}
        <path d="M14 92h72" stroke="currentColor" strokeWidth="1" opacity=".25" />
      </svg>
    );
  }
  const coarse = [];
  for (let x = 0; x < 4; x += 1) {
    for (let y = 0; y < 4; y += 1) {
      coarse.push(
        <rect
          key={`c-${x}-${y}`}
          x={14 + x * 12}
          y={14 + y * 12}
          width="12"
          height="12"
          fill="currentColor"
          opacity={0.18 + ((x * 3 + y * 5) % 4) * 0.16}
        />,
      );
    }
  }
  const fine = [];
  for (let x = 0; x < 12; x += 1) {
    for (let y = 0; y < 12; y += 1) {
      if ((x + y) % 2 === 0) {
        fine.push(
          <rect
            key={`f-${x}-${y}`}
            x={38 + x * 4}
            y={38 + y * 4}
            width="4"
            height="4"
            fill="#EE6A1F"
            opacity={0.35 + ((x * 7 + y * 3) % 5) * 0.13}
          />,
        );
      }
    }
  }
  return (
    <svg viewBox="0 0 100 100">
      {coarse}
      {fine}
      <rect x="38" y="38" width="48" height="48" fill="none" stroke="#EE6A1F" strokeWidth="1.6" />
      <rect x="14" y="14" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function BentoOpening({ standalone = true, embedded = false, head = null }) {
  const isStandalone = embedded ? false : standalone;
  const { t } = useLang();
  const rootRef = useRef(null);
  const avatarRef = useRef(null);
  const waveHeights = useMemo(makeWaveformHeights, []);

  const [bentoMode, setBentoMode] = useState('profile');
  const [voicePlaying, setVoicePlaying] = useState(true);
  const [voicePos, setVoicePos] = useState(0.35);
  const [rlPostTrained, setRlPostTrained] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Mode 01 states
  const timelineStops = useMemo(() => path.filter((item) => !item.now), []);
  const [selectedExp, setSelectedExp] = useState(0);
  const [expPaused, setExpPaused] = useState(false);

  const [paperIdx, setPaperIdx] = useState(0);
  const [paperPlaying, setPaperPlaying] = useState(true);
  const [paperProg, setPaperProg] = useState(0.18);

  const [noteIdx, setNoteIdx] = useState(0);
  const [workIdx, setWorkIdx] = useState(0);
  const [workHoldUntil, setWorkHoldUntil] = useState(0);
  const [numIdx, setNumIdx] = useState(0);
  const [howIdx, setHowIdx] = useState(0);
  const [howHoldUntil, setHowHoldUntil] = useState(0);

  // Mode 02 states
  const [pipeIdx, setPipeIdx] = useState(2);
  const [runtimeId, setRuntimeId] = useState('eval');
  const [activeTraceIdx, setActiveTraceIdx] = useState(0);

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Waveform animation
  useEffect(() => {
    if (!voicePlaying || reduced) return undefined;
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(80, now - last);
      last = now;
      setVoicePos((prev) => {
        const next = prev + dt / 7400;
        return next > 1 ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [voicePlaying, reduced]);

  // Auto-advance Research player, Work highlight, Numbers ticker, How steps, Pipeline
  useEffect(() => {
    if (reduced) return undefined;
    const id = window.setInterval(() => {
      const now = Date.now();
      if (paperPlaying) {
        setPaperProg((prev) => {
          if (prev + 0.05 >= 1) {
            setPaperIdx((idx) => (idx + 1) % PAPERS.length);
            return 0;
          }
          return prev + 0.05;
        });
      }
      if (now > workHoldUntil) {
        setWorkIdx((prev) => (prev + 1) % work.length);
      }
      if (now > howHoldUntil) {
        setHowIdx((prev) => (prev + 1) % HOW_STEPS.length);
      }
    }, 300);
    return () => window.clearInterval(id);
  }, [paperPlaying, workHoldUntil, howHoldUntil, reduced]);

  // Separate crisp 2.6s cadence for Numbers ticker
  useEffect(() => {
    if (reduced) return undefined;
    const id = window.setInterval(() => {
      setNumIdx((prev) => (prev + 1) % METRICS.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [reduced]);

  const stepNum = Math.min(20, Math.round(voicePos * 20));
  const stepRate = rlPostTrained ? 0.992 : 0.95;
  const survivalPct = (Math.pow(stepRate, stepNum) * 100).toFixed(1);

  const activeWork = work[workIdx] || work[0];
  const activePaper = PAPERS[paperIdx] || PAPERS[0];
  const activeNote = notes[noteIdx] || notes[0];
  const activeMetric = METRICS[numIdx] || METRICS[0];
  const activeHow = HOW_STEPS[howIdx] || HOW_STEPS[0];
  const activeExp = timelineStops[selectedExp] || timelineStops[0];
  const activePipe = PIPELINE_NODES[pipeIdx] || PIPELINE_NODES[0];
  const activeRuntime = RUNTIME_MODES.find((r) => r.id === runtimeId) || RUNTIME_MODES[0];

  const handleAvatarMove = (e) => {
    if (!avatarRef.current || reduced) return;
    const rect = avatarRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    avatarRef.current.style.setProperty('--ry', `${(px * 14).toFixed(2)}deg`);
    avatarRef.current.style.setProperty('--rx', `${(-py * 14).toFixed(2)}deg`);
  };

  const resetAvatarTilt = () => {
    if (!avatarRef.current) return;
    avatarRef.current.style.setProperty('--rx', '0deg');
    avatarRef.current.style.setProperty('--ry', '0deg');
  };

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profile.email);
      }
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const handleScrubWaveform = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setVoicePos(frac);
    setVoicePlaying(false);
  };

  const WrapTag = isStandalone ? 'main' : 'section';

  return (
    <div
      ref={rootRef}
      className={`bento-dir${isStandalone ? '' : ' is-embedded'}${bentoMode === 'cockpit' ? ' is-cockpit' : ''}`}
    >
      {isStandalone && <Header />}

      <WrapTag className="bento-shell" aria-label={t({ en: 'Bento profile and agent cards', zh: 'Bento 卡片档案' })}>
        {!isStandalone && head && <div className="bento-embed-head">{head}</div>}

        {/* Shared Top Identity & Interactive Trajectory Controls */}
        <header className="bento-hero">
          <div
            ref={avatarRef}
            className="bento-avatar"
            onMouseMove={handleAvatarMove}
            onMouseLeave={resetAvatarTilt}
            role="img"
            aria-label="Monogram DG"
          >
            <span className="bento-avatar-badge mono">RL · 2026</span>
            <span className="bento-avatar-letters" aria-hidden="true">
              DG
            </span>
          </div>

          <div className="bento-intro">
            <h1 className="bento-headline">
              {t({
                en: 'Hi, I’m Damon Guan — I train language agents and measure whether they work.',
                zh: '你好，我是管栋 — 训练语言智能体，并度量它们在真实工作流中是否可靠。',
              })}{' '}
              <span className="bento-headline-role">
                {t({
                  en: 'LLM algorithm engineer.',
                  zh: '大模型算法工程师。',
                })}
              </span>
            </h1>

            <p className="bento-bio">
              {t({
                en: 'I work on agentic RL, post-training and evaluation: from benchmark design and training loops to agent systems that run real supply-chain decisions.',
                zh: '专注于 Agentic RL、大模型后训练与智能体评测：从基准设计与强化学习闭环，到真正驱动供应链决策的生产级系统。',
              })}
            </p>

            <div className="bento-controls">
              <div className="bento-pill bento-voice">
                <button
                  type="button"
                  className="bento-play"
                  onClick={() => setVoicePlaying((p) => !p)}
                  aria-label={voicePlaying ? t({ en: 'Pause episode', zh: '暂停轨迹' }) : t({ en: 'Play episode', zh: '播放轨迹' })}
                >
                  {voicePlaying ? (
                    <svg viewBox="0 0 12 12">
                      <rect x="2.2" y="1.8" width="2.6" height="8.4" rx=".6" fill="currentColor" />
                      <rect x="7.2" y="1.8" width="2.6" height="8.4" rx=".6" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 12 12">
                      <path d="M3 1.6v8.8L10.4 6z" fill="currentColor" />
                    </svg>
                  )}
                </button>

                <div
                  className="bento-bars"
                  onClick={handleScrubWaveform}
                  role="slider"
                  tabIndex={0}
                  aria-label={t({ en: 'Episode step scrubber', zh: '20步轨迹进度条' })}
                  aria-valuemin={0}
                  aria-valuemax={20}
                  aria-valuenow={stepNum}
                >
                  {waveHeights.map((h, i) => {
                    const ph = voicePos * BAR_COUNT;
                    const isHead = Math.abs(i - ph) < 1.2;
                    const isOn = i + 0.5 < ph;
                    const modH = rlPostTrained ? Math.min(28, h + 3) : h;
                    return (
                      <i
                        key={i}
                        className={`bento-bar${isHead ? ' head' : isOn ? ' on' : ''}`}
                        style={{ height: `${modH}px` }}
                      />
                    );
                  })}
                </div>

                <div className="bento-readout mono">
                  step <b>{String(stepNum).padStart(2, '0')}</b> / 20 · P <b>{survivalPct}%</b>
                </div>

                <button
                  type="button"
                  className={`bento-rate-toggle mono${rlPostTrained ? ' is-rl' : ''}`}
                  onClick={() => setRlPostTrained((prev) => !prev)}
                  title={t({
                    en: 'Compare compounding error baseline (0.95^n) vs post-trained RL policy (0.992^n)',
                    zh: '切换对比基线复利衰减 (0.95^n) 与后训练 RL 策略 (0.992^n)',
                  })}
                >
                  {rlPostTrained ? '0.992ⁿ RL' : '0.95ⁿ Base'}
                </button>
              </div>

              <button
                type="button"
                className="bento-pill bento-talk"
                onClick={handleCopyEmail}
                title={t({ en: 'Click to copy email', zh: '点击复制联系邮箱' })}
              >
                <span className="bento-dot" aria-hidden="true" />
                <span>{t({ en: 'Open to talk', zh: '欢迎联系交流' })}</span>
                <span className={`bento-talk-sub mono${copiedEmail ? ' is-copied' : ''}`}>
                  {copiedEmail ? t({ en: 'Copied!', zh: '已复制' }) : profile.email}
                </span>
              </button>

              <div className="bento-mode-switch" role="tablist" aria-label={t({ en: 'Bento card layouts', zh: 'Bento 布局切换' })}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={bentoMode === 'profile'}
                  className={`bento-mode-btn mono${bentoMode === 'profile' ? ' is-active' : ''}`}
                  onClick={() => setBentoMode('profile')}
                >
                  {t({ en: '01 · 6-Card Profile', zh: '01 · 六卡个人档案' })}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={bentoMode === 'cockpit'}
                  className={`bento-mode-btn mono${bentoMode === 'cockpit' ? ' is-active' : ''}`}
                  onClick={() => setBentoMode('cockpit')}
                >
                  {t({ en: '02 · Agent Cockpit', zh: '02 · 智能体驾驶舱' })}
                </button>
              </div>
            </div>
          </div>
        </header>

        {bentoMode === 'profile' ? (
          <div className="bento-grid">
            {/* 1. Experience Marquee Card */}
            <section className="bento-card bento-exp" aria-label={t({ en: 'Experience', zh: '经历' })}>
              <div className="bento-card-head">
                <span className="bento-chip">
                  <svg viewBox="0 0 14 14">
                    <rect x="2" y="4" width="10" height="7.5" rx="1.5" />
                    <path d="M5 4V2.8h4V4" />
                  </svg>
                  {t({ en: 'Experience', zh: '经历轨道' })}
                </span>
                <button
                  type="button"
                  className="bento-rate-toggle mono"
                  onClick={() => setExpPaused((p) => !p)}
                >
                  {expPaused ? t({ en: 'Resume', zh: '继续滚动' }) : t({ en: 'Pause', zh: '暂停' })}
                </button>
              </div>

              <div className="bento-tl-win">
                <div className={`bento-tl-track${expPaused ? ' is-paused' : ''}`}>
                  {[0, 1].map((dup) => (
                    <ul key={dup} className="bento-tl-list" aria-hidden={dup === 1}>
                      {timelineStops.map((item, i) => (
                        <li
                          key={`${dup}-${item.when}`}
                          className={`bento-tl-item${i === 0 ? ' is-cur' : ''}${selectedExp === i ? ' is-selected' : ''}`}
                          onClick={() => {
                            setSelectedExp(i);
                            setExpPaused(true);
                          }}
                        >
                          <div className="bento-tl-title">
                            {t(item.org)} <span>— {t(item.role)}</span>
                          </div>
                          <div className="bento-tl-when mono">{item.when}</div>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>

              {activeExp && (
                <div className="bento-exp-detail mono">
                  <span>{joinParts([t(activeExp.kind), t(activeExp.org)])}</span>
                  <span>{t(activeExp.place) || activeExp.when}</span>
                </div>
              )}
            </section>

            {/* 2. Research Paper Player Card */}
            <section className="bento-card bento-res" aria-label={t({ en: 'Research', zh: '论文研究' })}>
              <div className="bento-card-head">
                <span className="bento-chip">
                  <svg viewBox="0 0 14 14">
                    <path d="M3 2h6l2 2v8H3z" />
                    <path d="M5 7h4M5 9.5h3" />
                  </svg>
                  {t({ en: 'Research', zh: '论文与综述' })}
                </span>
                <a className="bento-rate-toggle mono" href={`/notes/${activePaper.noteSlug}`}>
                  {t({ en: 'Read note ↗', zh: '相关笔记 ↗' })}
                </a>
              </div>

              <div className="bento-res-body">
                <div className="bento-cover" aria-hidden="true">
                  <ResearchCover index={paperIdx} />
                </div>

                <div className="bento-res-info">
                  <div className="bento-res-k mono">{t(activePaper.kind)}</div>
                  <div className="bento-res-title">{t(activePaper.title)}</div>
                  <div className="bento-res-sub">{t(activePaper.sub)}</div>

                  <div className="bento-prog" aria-hidden="true">
                    <i style={{ transform: `scaleX(${paperProg.toFixed(3)})` }} />
                  </div>

                  <div className="bento-ctrls">
                    <button
                      type="button"
                      aria-label={t({ en: 'Previous paper', zh: '上一篇' })}
                      onClick={() => {
                        setPaperIdx((i) => (i + PAPERS.length - 1) % PAPERS.length);
                        setPaperProg(0);
                      }}
                    >
                      <svg viewBox="0 0 12 12">
                        <path d="M2 2v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M10 2.2v7.6L4 6z" fill="currentColor" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="is-pp"
                      aria-label={paperPlaying ? t({ en: 'Pause', zh: '暂停' }) : t({ en: 'Play', zh: '轮播' })}
                      onClick={() => setPaperPlaying((p) => !p)}
                    >
                      {paperPlaying ? (
                        <svg viewBox="0 0 12 12">
                          <rect x="2.2" y="1.8" width="2.6" height="8.4" rx=".6" fill="currentColor" />
                          <rect x="7.2" y="1.8" width="2.6" height="8.4" rx=".6" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 12 12">
                          <path d="M3 1.6v8.8L10.4 6z" fill="currentColor" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label={t({ en: 'Next paper', zh: '下一篇' })}
                      onClick={() => {
                        setPaperIdx((i) => (i + 1) % PAPERS.length);
                        setPaperProg(0);
                      }}
                    >
                      <svg viewBox="0 0 12 12">
                        <path d="M10 2v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M2 2.2v7.6L8 6z" fill="currentColor" />
                      </svg>
                    </button>
                    <span className="bento-ctrls-idx mono">
                      {paperIdx + 1} / {PAPERS.length}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Field Notes Card with tilted sheet */}
            <section className="bento-card bento-note" aria-label={t({ en: 'Field notes', zh: '田野笔记' })}>
              <div className="bento-card-head">
                <span className="bento-chip">
                  <svg viewBox="0 0 14 14">
                    <path d="M9.5 2.5l2 2L5 11H3V9z" />
                  </svg>
                  {t({ en: 'Field notes', zh: '研究手记' })}
                </span>
                <div className="bento-note-nav">
                  <button
                    type="button"
                    aria-label={t({ en: 'Previous note', zh: '上一篇笔记' })}
                    onClick={() => setNoteIdx((i) => (i + notes.length - 1) % notes.length)}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label={t({ en: 'Next note', zh: '下一篇笔记' })}
                    onClick={() => setNoteIdx((i) => (i + 1) % notes.length)}
                  >
                    ›
                  </button>
                </div>
              </div>

              <h2 className="bento-note-title">{activeNote.title}</h2>

              <div className="bento-note-meta">
                <span>
                  {activeNote.readingTime} · {noteIdx + 1}/{notes.length}
                </span>
                <a href={`/notes/${activeNote.slug}`}>{t({ en: 'Read →', zh: '阅读全文 →' })}</a>
              </div>

              <div className="bento-sheet" aria-hidden="true">
                <div className="bento-sheet-h" />
                <div className="bento-sheet-l" />
                <div className="bento-sheet-l" style={{ width: '92%' }} />
                <div className="bento-sheet-l" style={{ width: '82%' }} />
                <div className="bento-sheet-l is-orange" />
                <div className="bento-sheet-l" style={{ marginTop: 12 }} />
                <div className="bento-sheet-l" style={{ width: '88%' }} />
                <div className="bento-sheet-l" style={{ width: '94%' }} />
                <div className="bento-sheet-l" style={{ width: '62%' }} />
                <div className="bento-sheet-l" style={{ marginTop: 12 }} />
                <div className="bento-sheet-l" style={{ width: '90%' }} />
                <div className="bento-sheet-l" style={{ width: '74%' }} />
              </div>
            </section>

            {/* 4. Selected Work List Card with sliding pill */}
            <section className="bento-card bento-work" aria-label={t({ en: 'Selected work', zh: '精选工作' })}>
              <div className="bento-card-head">
                <span className="bento-chip">
                  <svg viewBox="0 0 14 14">
                    <path d="M2.5 3.5h9M2.5 7h9M2.5 10.5h6" />
                  </svg>
                  {t({ en: 'Selected work', zh: '精选工程' })}
                </span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--b-muted)' }}>
                  {activeWork.where} · {activeWork.year}
                </span>
              </div>

              <div className="bento-rows">
                <div
                  className="bento-row-hl"
                  style={{ transform: `translateY(${workIdx * 29}px)` }}
                  aria-hidden="true"
                />
                {work.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`bento-row${workIdx === idx ? ' is-active' : ''}`}
                    onMouseEnter={() => {
                      setWorkIdx(idx);
                      setWorkHoldUntil(Date.now() + 6000);
                    }}
                    onClick={() => {
                      setWorkIdx(idx);
                      setWorkHoldUntil(Date.now() + 10000);
                    }}
                  >
                    <span className="bento-row-n">{item.title}</span>
                    <span className="bento-row-v mono">{item.metric}</span>
                  </button>
                ))}
              </div>

              <div className="bento-work-trace">
                {WORK_INSIGHTS[activeWork.id] ? t(WORK_INSIGHTS[activeWork.id]) : t(activeWork.line)}
              </div>
            </section>

            {/* 5. Numbers Card */}
            <section
              className="bento-card bento-num"
              aria-label={t({ en: 'Numbers', zh: '核心量化' })}
              onClick={() => setNumIdx((prev) => (prev + 1) % METRICS.length)}
            >
              <div className="bento-card-head">
                <span className="bento-chip">
                  <svg viewBox="0 0 14 14">
                    <path d="M2.5 11.5V7M7 11.5V3M11.5 11.5V5.5" />
                  </svg>
                  {t({ en: 'Numbers', zh: '工程数字' })}
                </span>
                <div className="bento-num-dots" onClick={(e) => e.stopPropagation()}>
                  {METRICS.map((m, idx) => (
                    <button
                      key={m.label.en}
                      type="button"
                      className={idx === numIdx ? 'is-on' : undefined}
                      aria-label={t(m.label)}
                      onClick={() => setNumIdx(idx)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="bento-num-big">
                  {activeMetric.pre}
                  {activeMetric.value}
                  <span>{activeMetric.suf}</span>
                </div>
                <div className="bento-num-label">{t(activeMetric.label)}</div>
              </div>
            </section>

            {/* 6. How I Work Segmented Pill Controller */}
            <section className="bento-card bento-how" aria-label={t({ en: 'How I work', zh: '工作方法论' })}>
              <div className="bento-card-head">
                <span className="bento-chip">
                  <svg viewBox="0 0 14 14">
                    <circle cx="7" cy="7" r="4.5" />
                    <path d="M7 4.5V7l1.8 1.2" />
                  </svg>
                  {t({ en: 'How I work', zh: '工作哲学' })}
                </span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--b-muted)' }}>
                  {activeHow.num} / 04
                </span>
              </div>

              <div className="bento-how-body">
                <div className="bento-how-t">
                  <span className="mono">{activeHow.num}</span>
                  {t(activeHow.title)}
                </div>
                <p className="bento-how-b">{t(activeHow.body)}</p>
              </div>

              <div className="bento-seg" role="group" aria-label={t({ en: 'Workflow steps', zh: '方法步骤' })}>
                <span
                  className="bento-seg-pill"
                  style={{ transform: `translateX(${howIdx * 100}%)` }}
                  aria-hidden="true"
                />
                {HOW_STEPS.map((st, idx) => (
                  <button
                    key={st.num}
                    type="button"
                    className={howIdx === idx ? 'is-on' : undefined}
                    onClick={() => {
                      setHowIdx(idx);
                      setHowHoldUntil(Date.now() + 9000);
                    }}
                  >
                    {t(st.chip)}
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* Mode 02: Agent Cockpit & Capabilities Bento Grid (reproducing Claude .omc/shots/layout_check.png & Capabilities) */
          <div className="bento-grid">
            {/* A. Research Desk / Active Profile Card */}
            <section className="bento-card bento-cockpit-profile" aria-label={t({ en: 'Research Desk', zh: '研究驾驶舱' })}>
              <div className="bento-desk-chrome mono">
                <span>RESEARCH DESK</span>
                <span>AGENTIC RL · 2026</span>
              </div>

              <div className="bento-desk-head">
                <div>
                  <div className="bento-desk-k mono">ACTIVE PROFILE</div>
                  <div className="bento-desk-name">Damon Guan</div>
                  <p className="bento-desk-quote">
                    {t({
                      en: 'I write the eval before I train the model, then turn the trace into a tool surface people can actually operate.',
                      zh: '先写评测再训练模型，再把轨迹变成团队能真正接管运作的工具界面。',
                    })}
                  </p>
                </div>
                <div className="bento-desk-monogram" aria-hidden="true">
                  D
                </div>
              </div>

              <div className="bento-desk-kpis">
                <div className="bento-desk-kpi">
                  <span className="mono">EVAL SUITE</span>
                  <strong>42 axes</strong>
                </div>
                <div className="bento-desk-kpi">
                  <span className="mono">TOOL POOL</span>
                  <strong>100+</strong>
                </div>
                <div className="bento-desk-kpi">
                  <span className="mono">HANDOFF</span>
                  <strong>&lt;1s</strong>
                </div>
              </div>

              <div className="bento-desk-traces mono">
                {[
                  ['01  MULTI-TURN EVAL TAXONOMY', 'ACL / SURVEY'],
                  ['02  DYNAMIC TOOL RESOLVER TRACES', '100+ APIS'],
                  ['03  HIERARCHICAL GRPO REWARD NOTES', 'MULTI-OBJECTIVE'],
                ].map(([left, right], i) => (
                  <div
                    key={left}
                    className="bento-desk-trace"
                    style={{
                      background: activeTraceIdx === i ? 'rgba(238, 106, 31, 0.12)' : 'transparent',
                      cursor: 'pointer',
                    }}
                    onClick={() => setActiveTraceIdx(i)}
                  >
                    <span>{left}</span>
                    <span>{right}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* B. Agent Pipeline 5-Node Bento Card */}
            <section className="bento-card bento-cockpit-pipeline" aria-label={t({ en: 'Agent Pipeline', zh: '智能体执行链路' })}>
              <span className="bento-chip">
                <svg viewBox="0 0 14 14">
                  <path d="M2 7h3l2-4 2 8 2-4h1" />
                </svg>
                {t({ en: 'Agent Pipeline', zh: '闭环执行链路' })}
              </span>

              <div className="bento-pipe-nodes">
                {PIPELINE_NODES.map((node, idx) => (
                  <button
                    key={node.id}
                    type="button"
                    className={`bento-pipe-node${pipeIdx === idx ? ' is-on' : ''}`}
                    onClick={() => setPipeIdx(idx)}
                  >
                    <span className="mono">{node.tag}</span>
                    <strong>{t(node.name)}</strong>
                  </button>
                ))}
              </div>

              <div className="bento-pipe-detail">
                <div className="mono" style={{ fontSize: 11, color: 'var(--b-orange)' }}>
                  STAGE {activePipe.tag} · {t(activePipe.name)}
                </div>
                <p>{t(activePipe.detail)}</p>
              </div>
            </section>

            {/* C. Agent Runtime Trace Selector Card */}
            <section className="bento-card bento-cockpit-runtime" aria-label={t({ en: 'Agent Runtime', zh: '运行时遥测控制台' })}>
              <div className="bento-card-head">
                <span className="bento-chip">
                  <svg viewBox="0 0 14 14">
                    <rect x="2" y="3" width="10" height="8" rx="1.5" />
                    <path d="M4.5 6l1.5 1.5L4.5 9M7.5 9h2" />
                  </svg>
                  {t({ en: 'Agent Runtime', zh: '运行时选择器' })}
                </span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--b-muted)' }}>
                  TRACE / LIVE
                </span>
              </div>

              <div className="bento-runtime-tabs">
                {RUNTIME_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`bento-runtime-tab mono${runtimeId === m.id ? ' is-on' : ''}`}
                    onClick={() => setRuntimeId(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="bento-terminal mono">
                <div className="bento-terminal-bar">
                  <span>ACTIVE TRACE</span>
                  <span className="bento-terminal-status">● {activeRuntime.status}</span>
                </div>
                <div className="bento-terminal-cmd">{activeRuntime.cmd}</div>
                <div className="bento-terminal-out">&gt; {t(activeRuntime.out)}</div>
              </div>
            </section>

            {/* D. Post-Training Rewards & Stack Card */}
            <section className="bento-card bento-cockpit-rewards" aria-label={t({ en: 'Post-Training & Stack', zh: '后训练奖励与技术栈' })}>
              <span className="bento-chip">
                <svg viewBox="0 0 14 14">
                  <path d="M3 11V6M7 11V3M11 11V7" />
                </svg>
                {t({ en: 'Post-Training & Stack', zh: '奖励函数与技术栈' })}
              </span>

              <div className="bento-reward-list">
                {REWARD_BARS.map((r) => (
                  <div key={r.label.en}>
                    <div className="bento-reward-row-head">
                      <span>{t(r.label)}</span>
                      <span className="mono" style={{ color: 'var(--b-orange)' }}>
                        {r.score}
                      </span>
                    </div>
                    <div className="bento-reward-bar">
                      <i style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bento-stack-pills mono">
                {STACK_TAGS.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </section>
          </div>
        )}

        <div className="bento-foot mono">
          <span>{t(footnote)}</span>
          <a href="/lab/bento/">{t({ en: 'Open original static Bento HTML study ↗', zh: '查看原版静态 HTML Bento 研究页 ↗' })}</a>
        </div>
      </WrapTag>

      {isStandalone && <Outro current="bento" />}
    </div>
  );
}
