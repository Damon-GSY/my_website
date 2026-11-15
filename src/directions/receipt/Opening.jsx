import { useCallback, useEffect, useRef, useState } from 'react';
import { Header, Outro } from '../../components/Chrome.jsx';
import { useLang } from '../../i18n.jsx';
import { footnote, joinParts, profile, route, work } from '../../content.js';
import './receipt.css';

const STAMP_ANGLES = [-7, 4, -4, 5, -6, 2, -3, 5];

const STAMP_PRESETS = [
  { xPct: 70, yPct: 73 },
  { xPct: 30, yPct: 30 },
  { xPct: 71, yPct: 45 },
  { xPct: 31, yPct: 62 },
  { xPct: 52, yPct: 20 },
  { xPct: 66, yPct: 82 },
];

const DEFAULT_STAMPS = [{ id: 'stamp-0', xPct: 70, yPct: 73, angle: STAMP_ANGLES[0] }];

const WORK_AUDIT_NOTES = {
  'supply-chain-agent-system': [
    {
      k: { en: 'SCOPE', zh: '范围' },
      v: { en: '12 supply-chain workflows · multi-turn execution', zh: '12 个供应链场景 · 多轮决策执行' },
    },
    {
      k: { en: 'CONTROL', zh: '门控' },
      v: { en: 'Risk-tiered gating + progressive confirmation', zh: '按风险分级门控 + 渐进式人工确认' },
    },
    {
      k: { en: 'VERIFIED', zh: '验证' },
      v: { en: '≈90% fewer production misoperations (internal)', zh: '内部生产环境误操作率降低约 90%' },
    },
  ],
  'dynamic-tool-resolution': [
    {
      k: { en: 'TOOL POOL', zh: '工具池' },
      v: { en: '100+ live tools resolved dynamically at runtime', zh: '100+ 动态工具池，运行时实时解析路由' },
    },
    {
      k: { en: 'TRAINING', zh: '训练' },
      v: { en: 'Agentic RL over changing schemas & recovery', zh: '面向变化工具集的 Agentic RL 与错误恢复' },
    },
    {
      k: { en: 'VERIFIED', zh: '验证' },
      v: { en: '≈90% reduction in manual ticket handling', zh: '人工工单处理量约减少 90%' },
    },
  ],
  'supply-chain-domain-llm': [
    {
      k: { en: 'PIPELINE', zh: '链路' },
      v: { en: 'Continual pretraining → SFT baseline → RL tuning', zh: '持续预训练 (CPT) → SFT 基线 → RL 微调' },
    },
    {
      k: { en: 'EVAL AXES', zh: '评测轴' },
      v: { en: 'Domain knowledge QA × multi-step tool use', zh: '双维度评测：领域知识问答 × 工具调用' },
    },
    {
      k: { en: 'VERIFIED', zh: '验证' },
      v: { en: 'Internal dual-axis benchmark SOTA', zh: '内部双维度基准达到 SOTA' },
    },
  ],
  'multi-objective-attribute-rl': [
    {
      k: { en: 'OPTIMIZER', zh: '优化器' },
      v: { en: 'GRPO with conditional & hierarchical rewards', zh: 'GRPO 分层与条件奖励设计' },
    },
    {
      k: { en: 'OBJECTIVES', zh: '目标域' },
      v: { en: 'Fulfillment, bundle consolidation & HS Code', zh: '履约决策、合包优化与海关 HS Code' },
    },
    {
      k: { en: 'VERIFIED', zh: '验证' },
      v: { en: 'Stabilised convergence across competing metrics', zh: '多目标冲突下保持稳定收敛' },
    },
  ],
  'm365-copilot-memory': [
    {
      k: { en: 'LAYERS', zh: '架构' },
      v: { en: '3-layer memory: turn · session · persistent user', zh: '三层记忆：轮次级 · 会话状态 · 持久化偏好' },
    },
    {
      k: { en: 'WORKFLOW', zh: '场景' },
      v: { en: 'Long-context email retrieval & multi-turn eval', zh: '邮件工作流长上下文检索与多轮一致性评测' },
    },
    {
      k: { en: 'VERIFIED', zh: '验证' },
      v: { en: 'Utility evaluated without irrelevant leakage', zh: '验证记忆增益并抑制无关上下文泄漏' },
    },
  ],
  'supchain-bench': [
    {
      k: { en: 'CORPUS', zh: '样本' },
      v: { en: '530 annotated real-world operational samples', zh: '530 条真实业务场景标注样本' },
    },
    {
      k: { en: 'DOMAINS', zh: '领域' },
      v: { en: 'Logistics, fulfillment, finance & customs', zh: '物流协作、仓储履约、财务与关务流程' },
    },
    {
      k: { en: 'VENUE', zh: '发表' },
      v: { en: 'ACL Findings 2026 unified agent benchmark', zh: 'ACL Findings 2026 统一智能体基准' },
    },
  ],
};

const COPY = {
  printerTitle: {
    en: 'EVIDENCE PRINTER · MODEL RL-2026 · 80MM THERMAL AUDIT',
    zh: '证据热敏打印机 · MODEL RL-2026 · 80MM 审计纸卷',
  },
  statusPrinting: { en: 'FEEDING', zh: '走纸中' },
  statusReady: { en: 'ONLINE', zh: '就绪' },
  printedUnit: { en: 'PRINTED', zh: '已打印' },
  btnNext: { en: 'Print Next Line', zh: '打印下一行' },
  btnFull: { en: 'Print Full Receipt', zh: '打印完整凭条' },
  btnStamp: { en: 'Stamp "PAID IN EVIDENCE"', zh: '加盖 "PAID IN EVIDENCE"' },
  btnReset: { en: 'Reset Tear & Paper', zh: '重置纸卷与存根' },
  receiptTag: { en: 'THERMAL AUDIT LEDGER · NO. RL-2026-06', zh: '热敏审计总账 · 编号 RL-2026-06' },
  routeLabel: { en: 'TRAJECTORY', zh: '履历路径' },
  colItem: { en: 'ITEM / PROJECT', zh: '项目明细' },
  colMetric: { en: 'EVIDENCE', zh: '验证指标' },
  expandHint: { en: '+ TRACE', zh: '+ 详情' },
  collapseHint: { en: '− HIDE', zh: '− 收起' },
  feedEmpty: {
    en: 'PAPER REWOUND · PRESS [PRINT NEXT LINE] OR [PRINT FULL RECEIPT]',
    zh: '纸卷已复位 · 点击 [打印下一行] 或 [打印完整凭条] 开始出纸',
  },
  mathTitle: { en: '20-STEP COMPOUND RELIABILITY SUBTOTAL', zh: '20 步复合可靠性审计小计' },
  mathNaive: { en: 'Naive 0.95^20', zh: '单步朴素 0.95^20' },
  mathRl: { en: 'Agentic RL 0.992^20', zh: 'Agentic RL 0.992^20' },
  mathMisops: { en: 'Misoperations', zh: '生产误操作变化' },
  stampTip: {
    en: 'Click anywhere on receipt paper to stamp · Click any item row for RL notes',
    zh: '点击凭条任意空白处可加盖印章 · 点击任意项目可展开评测细节',
  },
  tearPrompt: {
    en: '- - - ✂ CLICK TO TEAR CONTACT STUB - - -',
    zh: '- - - ✂ 点击沿虚线撕下联系存根 - - -',
  },
  tornPrompt: {
    en: '- - - ✂ STUB DETACHED BELOW - - -',
    zh: '- - - ✂ 存根已沿虚线撕下 - - -',
  },
  stubHead: { en: 'CONTACT STUB', zh: '联系存根' },
  stubReady: { en: 'CLICK SEAM OR STUB TO TEAR & COPY', zh: '点击虚线或存根即可撕下并复制邮箱' },
  stubCopied: { en: 'COPIED', zh: '已复制' },
  stubFallback: { en: 'EMAIL', zh: '邮箱' },
  stubReattach: { en: 'Re-attach', zh: '复原存根' },
  stubFloatingTag: { en: 'DETACHED STUB · CONTACT', zh: '已撕下存根 · 联系方式' },
  copyAction: { en: 'Copy', zh: '复制' },
};

const pad2 = (n) => String(n).padStart(2, '0');

const TEETH_COUNT = 36;
const TEETH_W = 360;
const TEETH_H = 10;

function buildTeethPaths() {
  const step = TEETH_W / TEETH_COUNT;
  let topLine = `M 0 ${TEETH_H}`;
  let bottomLine = 'M 0 0';
  for (let i = 0; i < TEETH_COUNT; i += 1) {
    const mid = (i + 0.5) * step;
    const end = (i + 1) * step;
    topLine += ` L ${mid.toFixed(2)} 0 L ${end.toFixed(2)} ${TEETH_H}`;
    bottomLine += ` L ${mid.toFixed(2)} ${TEETH_H} L ${end.toFixed(2)} 0`;
  }
  return {
    topFill: `${topLine} Z`,
    topStroke: topLine,
    bottomFill: `${bottomLine} Z`,
    bottomStroke: bottomLine,
  };
}

const TEETH_PATHS = buildTeethPaths();

function buildBarcodeBars() {
  const bars = [];
  const startGuard = [
    { w: 2, dark: true },
    { w: 1.5, dark: false },
    { w: 1.5, dark: true },
    { w: 2.5, dark: false },
    { w: 1, dark: true },
    { w: 3, dark: false },
  ];
  let x = 0;
  for (const seg of startGuard) {
    if (seg.dark) bars.push({ x, w: seg.w });
    x += seg.w;
  }

  let seed = 20260410;
  const payloadEnd = 286;
  while (x < payloadEnd) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const barW = 1.2 + ((seed >>> 24) % 4) * 0.9;
    const gapW = 1.1 + ((seed >>> 16) % 4) * 0.75;
    if (x + barW <= payloadEnd) {
      bars.push({ x: Number(x.toFixed(2)), w: Number(barW.toFixed(2)) });
    }
    x += barW + gapW;
  }

  const stopGuard = [
    { w: 2, dark: true },
    { w: 2.5, dark: false },
    { w: 1.5, dark: true },
    { w: 1.5, dark: false },
    { w: 2.5, dark: true },
  ];
  x = 289;
  for (const seg of stopGuard) {
    if (seg.dark) bars.push({ x, w: seg.w });
    x += seg.w;
  }

  return bars;
}

const BARCODE_BARS = buildBarcodeBars();

function SawtoothEdge({ side }) {
  const fillPath = side === 'top' ? TEETH_PATHS.topFill : TEETH_PATHS.bottomFill;
  const strokePath = side === 'top' ? TEETH_PATHS.topStroke : TEETH_PATHS.bottomStroke;
  return (
    <svg
      className={`receipt-teeth is-${side}`}
      viewBox={`0 0 ${TEETH_W} ${TEETH_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={fillPath} className="receipt-teeth-fill" />
      <path d={strokePath} className="receipt-teeth-stroke" />
    </svg>
  );
}

function StampSeal({ stamp }) {
  return (
    <div
      className="receipt-stamp"
      style={{
        left: `${stamp.xPct}%`,
        top: `${stamp.yPct}%`,
        '--stamp-rot': `${stamp.angle}deg`,
      }}
      aria-hidden="true"
    >
      <div className="receipt-stamp-inner">
        <strong>PAID IN EVIDENCE</strong>
        <span>{'// VERIFIED PRODUCTION METRIC'}</span>
      </div>
    </div>
  );
}

export default function ReceiptOpening({ embedded = false, head = null }) {
  const { t } = useLang();
  const [printedCount, setPrintedCount] = useState(work.length);
  const [isPrintingAll, setIsPrintingAll] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set([work[0].id]));
  const [stamps, setStamps] = useState(DEFAULT_STAMPS);
  const [isTorn, setIsTorn] = useState(false);
  const [copyStatus, setCopyStatus] = useState('idle');
  const [pulseAction, setPulseAction] = useState(false);

  const paperRef = useRef(null);
  const stampSeqRef = useRef(1);
  const pulseTimerRef = useRef(0);

  const triggerLedPulse = useCallback(() => {
    setPulseAction(true);
    window.clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = window.setTimeout(() => {
      setPulseAction(false);
    }, 320);
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(pulseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isPrintingAll) return undefined;
    if (printedCount >= work.length) {
      const finishTimer = window.setTimeout(() => setIsPrintingAll(false), 0);
      return () => window.clearTimeout(finishTimer);
    }
    const tick = window.setTimeout(() => {
      setPrintedCount((prev) => Math.min(work.length, prev + 1));
    }, 115);
    return () => window.clearTimeout(tick);
  }, [isPrintingAll, printedCount]);

  const handlePrintNext = () => {
    setIsPrintingAll(false);
    triggerLedPulse();
    setPrintedCount((prev) => (prev >= work.length ? 1 : prev + 1));
  };

  const handlePrintFull = () => {
    triggerLedPulse();
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsPrintingAll(false);
      setPrintedCount(work.length);
      return;
    }
    if (printedCount >= work.length) {
      setPrintedCount(0);
    }
    setIsPrintingAll(true);
  };

  const addStampAt = useCallback(
    (xPct, yPct) => {
      triggerLedPulse();
      setStamps((prev) => {
        const idx = prev.length;
        const angle = STAMP_ANGLES[idx % STAMP_ANGLES.length];
        const seq = stampSeqRef.current;
        stampSeqRef.current += 1;
        return [
          ...prev,
          {
            id: `stamp-${seq}`,
            xPct: Math.max(24, Math.min(76, Number(xPct.toFixed(1)))),
            yPct: Math.max(10, Math.min(90, Number(yPct.toFixed(1)))),
            angle,
          },
        ];
      });
    },
    [triggerLedPulse],
  );

  const handleStampButton = () => {
    const preset = STAMP_PRESETS[stamps.length % STAMP_PRESETS.length];
    const jitterX = ((stamps.length * 7) % 11) - 5;
    const jitterY = ((stamps.length * 5) % 9) - 4;
    addStampAt(preset.xPct + jitterX, preset.yPct + jitterY);
  };

  const handlePaperClick = (e) => {
    if (e.target.closest('button, a')) return;
    const paper = paperRef.current;
    if (!paper) return;
    const rect = paper.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    addStampAt(xPct, yPct);
  };

  const handleToggleItem = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyEmailToClipboard = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profile.email);
        setCopyStatus('copied');
      } else {
        setCopyStatus('fallback');
      }
    } catch {
      setCopyStatus('fallback');
    }
  }, []);

  const handleTearStub = () => {
    triggerLedPulse();
    if (!isTorn) {
      setIsTorn(true);
    }
    void copyEmailToClipboard();
  };

  const handleReattachStub = () => {
    setIsTorn(false);
    setCopyStatus('idle');
  };

  const handleReset = () => {
    setIsPrintingAll(false);
    triggerLedPulse();
    setPrintedCount(0);
    setExpandedIds(new Set());
    setStamps(DEFAULT_STAMPS);
    setIsTorn(false);
    setCopyStatus('idle');
  };

  const roleLine = joinParts([t(profile.role), t(profile.org), t(profile.city)]).toUpperCase();
  const routeSummary = route.map((stop) => (stop.code || stop.what).toUpperCase()).join(' → ');
  const visibleWork = work.slice(0, printedCount);
  const RootTag = embedded ? 'section' : 'div';
  const StageTag = embedded ? 'div' : 'main';

  const copiedBadgeText =
    copyStatus === 'copied'
      ? `${t(COPY.stubCopied)}: ${profile.email}`
      : copyStatus === 'fallback'
        ? `${t(COPY.stubFallback)}: ${profile.email}`
        : null;

  return (
    <RootTag className={`receipt${embedded ? ' is-embedded' : ''}`}>
      {!embedded && <Header />}

      {embedded && head && <div className="receipt-embed-head">{head}</div>}

      <StageTag className="receipt-stage">
        <div className="receipt-rig">
          {/* Anodized brushed-slate thermal printhead */}
          <section className="receipt-printer" aria-label={t(COPY.printerTitle)}>
            <div className="receipt-printer-bezel">
              <div className="receipt-printer-top">
                <div className="receipt-model">
                  <span
                    className={`receipt-led${isPrintingAll || pulseAction ? ' is-active' : ''}`}
                    aria-hidden="true"
                  />
                  <span className="mono">{t(COPY.printerTitle)}</span>
                </div>
                <div className="receipt-readout mono" aria-live="polite">
                  <span className="receipt-status-pill">
                    {isPrintingAll ? t(COPY.statusPrinting) : t(COPY.statusReady)}
                  </span>
                  <strong>
                    {pad2(printedCount)} / {pad2(work.length)} {t(COPY.printedUnit)}
                  </strong>
                </div>
              </div>

              <div className="receipt-controls" role="toolbar" aria-label={t(COPY.printerTitle)}>
                <button type="button" className="receipt-key" onClick={handlePrintNext}>
                  <span className="receipt-key-glyph" aria-hidden="true">
                    ↓
                  </span>
                  <span>{t(COPY.btnNext)}</span>
                </button>
                <button type="button" className="receipt-key" onClick={handlePrintFull}>
                  <span className="receipt-key-glyph" aria-hidden="true">
                    ⇊
                  </span>
                  <span>{t(COPY.btnFull)}</span>
                </button>
                <button type="button" className="receipt-key is-stamp" onClick={handleStampButton}>
                  <span className="receipt-key-dot" aria-hidden="true" />
                  <span>{t(COPY.btnStamp)}</span>
                </button>
                <button type="button" className="receipt-key" onClick={handleReset}>
                  <span className="receipt-key-glyph" aria-hidden="true">
                    ↺
                  </span>
                  <span>{t(COPY.btnReset)}</span>
                </button>
              </div>
            </div>

            <div className="receipt-slot-lip" aria-hidden="true">
              <div className="receipt-slot-throat" />
              <div className="receipt-tear-bar" />
            </div>
          </section>

          {/* 80mm thermal paper strip exiting the printhead */}
          <div className="receipt-paper-wrap">
            <div
              ref={paperRef}
              className="receipt-paper"
              onClick={handlePaperClick}
            >
              <SawtoothEdge side="top" />
              <div className="receipt-curl-shade" aria-hidden="true" />

              <div className="receipt-sheet-body">
                <header className="receipt-head">
                  <div className="receipt-brand-row">
                    <h1>{profile.name.toUpperCase()}</h1>
                    <p className="receipt-role mono">{`// ${roleLine}`}</p>
                  </div>

                  <div className="receipt-route-box mono">
                    <div className="receipt-route-summary">
                      <span>{t(COPY.routeLabel)}</span>
                      <strong>{routeSummary}</strong>
                    </div>
                    <ol className="receipt-route-stops">
                      {route.map((stop) => (
                        <li key={stop.years}>
                          <span>{stop.code || '—'}</span>
                          <span>{joinParts([stop.years, stop.what, t(stop.city)])}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="receipt-meta mono">
                    <span>{t(COPY.receiptTag)}</span>
                    <span>{`#0${printedCount}/0${work.length}`}</span>
                  </div>
                </header>

                <div className="receipt-rule" aria-hidden="true" />

                <section className="receipt-ledger" aria-label={t(COPY.colItem)}>
                  <div className="receipt-ledger-cols mono" aria-hidden="true">
                    <span>{t(COPY.colItem)}</span>
                    <span>{t(COPY.colMetric)}</span>
                  </div>

                  {visibleWork.length === 0 ? (
                    <p className="receipt-empty mono">{t(COPY.feedEmpty)}</p>
                  ) : (
                    <ol className="receipt-items">
                      {visibleWork.map((item, idx) => {
                        const isOpen = expandedIds.has(item.id);
                        const notes = WORK_AUDIT_NOTES[item.id] || [];
                        return (
                          <li key={item.id} className={`receipt-item${isOpen ? ' is-open' : ''}`}>
                            <button
                              type="button"
                              className="receipt-item-btn"
                              aria-expanded={isOpen}
                              onClick={() => handleToggleItem(item.id)}
                            >
                              <div className="receipt-item-top">
                                <span className="receipt-item-num mono">{pad2(idx + 1)}</span>
                                <span className="receipt-item-title">{item.title.toUpperCase()}</span>
                                <strong className="receipt-item-metric">{item.metric}</strong>
                              </div>
                              <div className="receipt-item-sub mono">
                                <span>{`${item.where.toUpperCase()} · ${item.year}`}</span>
                                <span>{t(item.metricLabel)}</span>
                              </div>
                              <p className="receipt-item-detail">{t(item.line)}</p>
                              <span className="receipt-item-toggle mono">
                                {isOpen ? t(COPY.collapseHint) : t(COPY.expandHint)}
                              </span>
                            </button>

                            {isOpen && notes.length > 0 && (
                              <dl className="receipt-subnotes mono">
                                {notes.map((entry) => (
                                  <div key={entry.k.en} className="receipt-subnote-row">
                                    <dt>{t(entry.k)}</dt>
                                    <dd>{t(entry.v)}</dd>
                                  </div>
                                ))}
                              </dl>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </section>

                <div className="receipt-rule is-double" aria-hidden="true" />

                {/* 20-Step Compound Math Subtotal Box */}
                <section className="receipt-subtotal mono" aria-label={t(COPY.mathTitle)}>
                  <div className="receipt-subtotal-head">
                    <span>{t(COPY.mathTitle)}</span>
                    <span>20 STEPS</span>
                  </div>

                  <div className="receipt-math-row">
                    <div className="receipt-math-line">
                      <span>{t(COPY.mathNaive)}</span>
                      <strong>35.8%</strong>
                    </div>
                    <div className="receipt-meter" aria-hidden="true">
                      <span className="receipt-meter-fill is-naive" style={{ width: '35.8%' }} />
                    </div>
                  </div>

                  <div className="receipt-math-row">
                    <div className="receipt-math-line is-accent">
                      <span>{t(COPY.mathRl)}</span>
                      <strong>85.2%</strong>
                    </div>
                    <div className="receipt-meter" aria-hidden="true">
                      <span className="receipt-meter-fill is-rl" style={{ width: '85.2%' }} />
                    </div>
                  </div>

                  <div className="receipt-delta-row">
                    <span>{t(COPY.mathMisops)}</span>
                    <strong>-90%</strong>
                  </div>
                </section>

                <div className="receipt-rule" aria-hidden="true" />

                {/* Deterministic Code-128 Barcode + Footnote */}
                <footer className="receipt-barcode-block">
                  <svg
                    className="receipt-barcode"
                    viewBox="0 0 300 42"
                    role="img"
                    aria-label="Code 128 audit barcode RL-2026-DAMON-GUAN"
                  >
                    {BARCODE_BARS.map((bar, idx) => (
                      <rect key={idx} x={bar.x} y="0" width={bar.w} height="42" />
                    ))}
                  </svg>
                  <p className="receipt-barcode-text mono">* RL-2026-DAMON-GUAN-530-90PCT *</p>
                  <p className="receipt-footnote mono">{t(footnote)}</p>
                  <p className="receipt-hint mono">{t(COPY.stampTip)}</p>
                </footer>
              </div>

              {isTorn && <SawtoothEdge side="bottom" />}

              {/* Magenta Rubber Stamps Layer */}
              <div className="receipt-stamps-layer" aria-hidden="true">
                {stamps.map((stamp) => (
                  <StampSeal key={stamp.id} stamp={stamp} />
                ))}
              </div>
            </div>

            {/* Perforated Tear-Off Contact Stub */}
            <div className={`receipt-stub-wrap${isTorn ? ' is-torn' : ''}`}>
              <button
                type="button"
                className="receipt-perf mono"
                onClick={handleTearStub}
                aria-expanded={isTorn}
              >
                <span className="receipt-perf-line">{isTorn ? t(COPY.tornPrompt) : t(COPY.tearPrompt)}</span>
              </button>

              <div
                className={`receipt-stub${isTorn ? ' is-torn' : ''}`}
                onClick={!isTorn ? handleTearStub : undefined}
              >
                {isTorn && <SawtoothEdge side="top" />}
                <div className="receipt-stub-inner">
                  <div className="receipt-stub-top mono">
                    <span>{t(COPY.stubHead)}</span>
                    {copiedBadgeText ? (
                      <span className="receipt-copied-badge">{copiedBadgeText}</span>
                    ) : (
                      <span>{t(COPY.stubReady)}</span>
                    )}
                  </div>

                  {isTorn ? (
                    <a className="receipt-stub-email" href={`mailto:${profile.email}`}>
                      {profile.email}
                    </a>
                  ) : (
                    <button type="button" className="receipt-stub-email-btn" onClick={handleTearStub}>
                      {profile.email}
                    </button>
                  )}

                  {isTorn && (
                    <div className="receipt-stub-links-wrap">
                      <ul className="receipt-stub-links mono">
                        {profile.links.map((link) => (
                          <li key={link.href}>
                            <a href={link.href} target="_blank" rel="noreferrer">
                              {link.label} ↗
                            </a>
                          </li>
                        ))}
                      </ul>
                      <button type="button" className="receipt-reattach mono" onClick={handleReattachStub}>
                        {t(COPY.stubReattach)} ↺
                      </button>
                    </div>
                  )}
                </div>
                <SawtoothEdge side="bottom" />
              </div>
            </div>
          </div>
        </div>
      </StageTag>

      {/* Pinned Floating Stub Card (outside transformed/filtered ancestors so fixed works reliably) */}
      {isTorn && (
        <aside className="receipt-floating-stub" aria-label={t(COPY.stubFloatingTag)}>
          <SawtoothEdge side="top" />
          <div className="receipt-floating-in">
            <div className="receipt-floating-head mono">
              <span>{t(COPY.stubFloatingTag)}</span>
              <button
                type="button"
                className="receipt-floating-close"
                onClick={handleReattachStub}
                aria-label={t(COPY.stubReattach)}
              >
                {t(COPY.stubReattach)} ×
              </button>
            </div>

            <div className="receipt-floating-email-row">
              <a className="receipt-floating-email" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
              <button type="button" className="receipt-floating-copy mono" onClick={() => void copyEmailToClipboard()}>
                {t(COPY.copyAction)}
              </button>
            </div>

            {copiedBadgeText && <div className="receipt-copied-badge mono">{copiedBadgeText}</div>}

            <ul className="receipt-floating-links mono">
              {profile.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noreferrer">
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <SawtoothEdge side="bottom" />
        </aside>
      )}

      {!embedded && <Outro current="receipt" />}
    </RootTag>
  );
}
