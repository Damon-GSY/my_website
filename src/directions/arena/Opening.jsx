import { useEffect, useMemo, useState } from 'react';
import { Header, Outro } from '../../components/Chrome.jsx';
import { useLang } from '../../i18n.jsx';
import { profile, work, footnote, joinParts } from '../../content.js';
import './arena.css';

const STEPS_TOTAL = 5;
const SUBSTEPS_PER_STEP = 4;
const TOTAL_SUBSTEPS = STEPS_TOTAL * SUBSTEPS_PER_STEP; // 20 steps -> 0.95^20 = 35.8%
const BASE_STEP_P = 0.95;

const COPY = {
  eyebrowTag: { en: '13 · ARENA // BREAK MY AGENT', zh: '13 · 竞技场 // 压测我的智能体' },
  eyebrowSub: { en: 'RL & Guardrail Sandbox', zh: '强化学习与护栏沙盒' },
  titleLead: { en: 'Break My ', zh: '压测我的' },
  titleEm: { en: 'Agent.', zh: '智能体。' },
  subtitle: {
    en: 'Inject schema drift, irreversible traps, and multi-turn ambiguity—race a naive 0.95^n ReAct loop against Agentic RL with dynamic tool resolution and risk-tiered guardrails.',
    zh: '主动注入工具漂移、不可逆陷阱与多轮歧义——对比无护栏 0.95^n 级联失效的 ReAct 与具备动态工具解析及风险分级护栏的 Agentic RL。',
  },
  kpis: [
    {
      value: '≈90%',
      tone: 'tangerine',
      label: { en: 'fewer misoperations', zh: '误操作减少' },
      meta: { en: 'Alibaba · 12 Scenarios', zh: '阿里巴巴 · 12 个场景' },
    },
    {
      value: '35.8%',
      tone: 'red',
      label: { en: '20-step unguarded survival', zh: '20 步无护栏存活率' },
      meta: { en: 'P = 0.95^20', zh: 'P = 0.95^20' },
    },
    {
      value: '100+',
      tone: 'cobalt',
      label: { en: 'tools resolved at run time', zh: '运行时动态解析工具' },
      meta: { en: 'Dynamic Schema Pool', zh: '动态结构工具池' },
    },
  ],
  perturbationLabel: { en: 'Perturbations', zh: '故障注入' },
  controlsLabel: { en: 'Playback', zh: '运行控制' },
  faults: [
    { key: 'schemaDrift', icon: '⚡', label: { en: 'Tool Schema Drift', zh: '工具结构漂移' } },
    { key: 'irreversibleTrap', icon: '💣', label: { en: 'Irreversible Action Trap', zh: '不可逆动作陷阱' } },
    { key: 'ambiguousIntent', icon: '🌀', label: { en: 'Ambiguous Multi-Turn Intent', zh: '多轮意图歧义' } },
  ],
  btnRun: { en: '▶ Run Stress Test', zh: '▶ 运行压测' },
  btnPause: { en: '⏸ Pause', zh: '⏸ 暂停' },
  btnReplay: { en: '↻ Replay Test', zh: '↻ 重新运行' },
  btnStep: { en: 'Step +1', zh: '单步 +1' },
  btnReset: { en: 'Reset', zh: '重置' },
  armed: { en: 'ARMED', zh: '已注入' },
  off: { en: 'OFF', zh: '关闭' },
  stepCounter: { en: 'STEP', zh: '步骤' },
  promptLabel: { en: 'Incoming Task', zh: '输入任务' },
  trackAId: { en: 'TRACK A · BASELINE', zh: '轨道 A · 基线对比' },
  trackATitle: { en: 'Naive ReAct Agent', zh: '朴素 ReAct 智能体' },
  trackASub: { en: 'p = 0.95 / step · no risk guardrail', zh: '单步 p = 0.95 · 无风险护栏' },
  trackBId: { en: 'TRACK B · GUARDED POLICY', zh: '轨道 B · 护栏策略' },
  trackBTitle: { en: "Damon's Agentic RL + Guardrail", zh: 'Agentic RL + 风险分级护栏' },
  trackBSub: { en: '≈90% fewer misoperations · tiered boundary', zh: '误操作减少 ≈90% · 风险分级边界' },
  gaugeTitle: { en: 'Compound Survival Gauge', zh: '复合存活率仪表' },
  horizonNote: { en: '20-step compound floor: 35.8%', zh: '20 步复合下限：35.8%' },
  traceTitle: { en: 'Execution Trace', zh: '执行轨迹' },
  resolverTitle: { en: 'Dynamic Tool Resolver', zh: '动态工具解析矩阵' },
  resolverSub: { en: '104 registered → top 3', zh: '104 已注册 → 精选 3 个' },
  funnelLabels: [
    { en: 'Registered', zh: '已注册' },
    { en: 'Intent Match', zh: '意图召回' },
    { en: 'Schema OK', zh: '结构校验' },
    { en: 'Bound', zh: '最终绑定' },
  ],
  grpoTitle: { en: 'GRPO Reward Telemetry', zh: 'GRPO 多目标奖励遥测' },
  grpoFoot: {
    en: 'Hierarchical gate: R_safety constrains R_task before write.',
    zh: '分层门控：写入前由 R_safety 约束 R_task。',
  },
  statusIdle: { en: 'IDLE · READY', zh: '待命 · 就绪' },
  statusRunning: { en: 'EXECUTING', zh: '执行中' },
  statusSilentFail: { en: 'MISOPERATION · SILENT FAILURE', zh: '误操作 · 静默失效' },
  statusUnguardedWarn: { en: 'UNGUARDED · 64.2% RISK', zh: '无护栏 · 64.2% 失效风险' },
  statusRlRunning: { en: 'TIER-1/2 AUTO', zh: 'Tier-1/2 自动放行' },
  statusPausedT3: { en: '⚠️ TIER-3 PAUSED', zh: '⚠️ Tier-3 已拦截暂停' },
  statusVerified: { en: 'PROTECTED EXECUTION · VERIFIED', zh: '受保护执行 · 已验证' },
  statusRolledBack: { en: 'SAFE ROLLBACK · 0 MISOPERATIONS', zh: '安全回滚 · 零误操作' },
  tier3Header: {
    en: '⚠️ TIER-3 IRREVERSIBLE BOUNDARY · CONFIRMATION REQUIRED',
    zh: '⚠️ Tier-3 不可逆操作边界 · 需要人工确认',
  },
  tier3Waiting: {
    en: 'Tier-3 boundary monitor armed — advance to step 05 to inspect dry-run gate.',
    zh: 'Tier-3 边界监控已就绪——推进至第 05 步以触发预演确认门控。',
  },
  btnConfirm: { en: '✓ Human Confirm · Execute Safely', zh: '✓ 人工确认 · 安全执行' },
  btnRollback: { en: '↺ Reject & Rollback State', zh: '↺ 拒绝并回滚状态' },
  btnRearm: { en: '↻ Re-arm Tier-3 Gate', zh: '↻ 重新进入确认门控' },
  standbyFailTitle: { en: 'MONITORING TRAJECTORY', zh: '轨迹监控中' },
  standbyFailDesc: {
    en: 'Run or step forward to watch compounding error and unguarded writes accumulate.',
    zh: '点击运行或单步推进，观察多步错误叠加与无护栏写入的累积过程。',
  },
  unguardedSafeNote: {
    en: 'No perturbation triggered this run, yet 20 unguarded steps leave only 35.8% compound reliability (64.2% failure hazard).',
    zh: '本次未注入额外扰动，但 20 步无护栏串联后复合可靠性仅剩 35.8%（64.2% 潜在失效风险）。',
  },
  workStripTitle: { en: 'Production Grounding · Real Systems Tested', zh: '生产系统映射 · 真实落地项目' },
  workStripHint: { en: 'Highlighted cards power the active scenario', zh: '高亮卡片对应当前压测场景的真实系统' },
  activeBadge: { en: 'ACTIVE IN SCENARIO', zh: '当前场景映射' },
};

const SCENARIOS = [
  {
    id: 'refund-trap',
    num: '01',
    badge: { en: 'Alibaba · 12 Scenarios', zh: '阿里巴巴 · 12 个场景' },
    title: { en: 'Shipped Order Refund Trap', zh: '已发货订单退款陷阱' },
    desc: {
      en: 'User asks to cancel & refund parcel #CN-88412 after Shenzhen customs departure.',
      zh: '包裹 #CN-88412 已离境清关，用户仍请求立即取消并全额退款。',
    },
    prompt: {
      en: '"Cancel order #CN-88412 immediately and refund $1,280 back to my card—I changed my mind."',
      zh: '“马上取消订单 #CN-88412 并把 $1,280 原路退回我银行卡，我不想要了。”',
    },
    ambiguityAddendum: {
      en: '[Turn-2 Override]: "Wait—if it already left customs and duty <= ¥800, hold interception instead of refunding."',
      zh: '[第2轮补充]：“等等——如果已经出关且税费不超过 ¥800，就先拦截扣留，别直接退款。”',
    },
    linkedWorkIds: ['supply-chain-agent-system', 'supchain-bench'],
    domainSignal: {
      en: 'RISK TIER: T3_FINANCIAL · CUSTOMS_STATE: DEPARTED_SZ · ESCROW: $1,280',
      zh: '风险等级：T3_资金不可逆 · 关务状态：深圳已出关 · 托管金额：$1,280',
    },
    deprecatedTool: 'order.cancel_legacy',
    tools: [
      { name: 'inventory.lookup', score: '0.98', role: 'matched' },
      { name: 'customs.hold_status', score: '0.96', role: 'matched' },
      { name: 'refund.dry_run', score: '0.94', role: 'matched' },
      { name: 'order.cancel_legacy', score: 'v1', role: 'deprecated' },
      { name: 'refund.execute', score: 'T3', role: 'gated' },
      { name: 'wms.pick_slip', score: '0.41', role: 'pool' },
      { name: 'carrier.waybill', score: '0.38', role: 'pool' },
      { name: 'fx.quote_spot', score: '0.24', role: 'pool' },
    ],
    tier3: {
      call: 'customs.intercept_request(parcel="CN-88412", hold_escrow=true, refund_mode="DEFERRED")',
      why: {
        en: 'Parcel #CN-88412 cleared Shenzhen outbound customs 4h ago. Direct refunding creates an unrecoverable $1,280 capital loss; intercept + escrow hold is Tier-3 gated.',
        zh: '包裹 #CN-88412 已于 4 小时前完成深圳离境清关。直接退款将导致 $1,280 不可挽回货款损失；已降级为拦截与托管预演，等待 Tier-3 确认。',
      },
      diff: 'BEFORE: status=IN_TRANSIT_CUSTOMS, escrow=$1,280 -> AFTER(confirm): customs_intercept=PENDING_REVIEW | AFTER(rollback): state=UNCHANGED',
      confirmLog: {
        en: 'Signed intercept ticket #INT-88412 dispatched; $1,280 escrow locked safely pending carrier return.',
        zh: '已签发拦截工单 #INT-88412，$1,280 托管资金安全锁定，等待承运商退回核验。',
      },
      rollbackLog: {
        en: 'Refund and interception aborted cleanly. Zero funds moved; order state snapshot preserved.',
        zh: '已安全取消退款与拦截写入。零资金变动，订单状态快照完整保留。',
      },
    },
    failures: {
      trap: {
        desc: {
          en: 'Naive ReAct trusted turn-1 request, skipped customs state verification, and executed an irreversible $1,280 refund on an in-flight parcel.',
          zh: '朴素 ReAct 轻信首轮指令，跳过清关状态校验，直接对已在途离境包裹执行了不可逆的 $1,280 退款。',
        },
        impact: {
          en: 'IMPACT: -$1,280 unrecoverable capital loss · 0 human gate',
          zh: '影响：-$1,280 不可逆货款损失 · 零人工确认',
        },
      },
      drift: {
        desc: {
          en: 'Invoked deprecated order.cancel_legacy schema; customs_flag field was silently dropped on the v2 endpoint.',
          zh: '调用了已废弃的 order.cancel_legacy 接口，v2 服务端静默丢弃了 customs_flag 校验字段。',
        },
        impact: {
          en: 'IMPACT: 422 silent schema mismatch · unverified state mutation',
          zh: '影响：静默结构失配 · 状态被错误改写',
        },
      },
      intent: {
        desc: {
          en: 'Ignored turn-2 conditional override ("hold if duty <= ¥800") and fired an immediate refund from turn-1 buffer.',
          zh: '忽略第 2 轮条件覆写（“若税费 <= ¥800 则拦截扣留”），直接按第 1 轮意图触发退款。',
        },
        impact: {
          en: 'IMPACT: Policy violation · conditional turn-2 constraint dropped',
          zh: '影响：策略违背 · 多轮条件约束丢失',
        },
      },
    },
    naiveSteps: [
      { call: 'session.parse_intent(text="cancel and refund")', note: { en: 'Extracts refund intent without risk classification.', zh: '提取退款意图，未做风险分级。' } },
      {
        call: 'order.fetch_summary(id="CN-88412")',
        driftCall: 'order.cancel_legacy(id="CN-88412", force=true)',
        note: { en: 'Reads basic header; skips customs handoff log.', zh: '仅读取基础订单头信息，跳过清关交接日志。' },
        driftNote: { en: 'Calls legacy v1 cancel schema; drops customs_flag.', zh: '调用废弃 v1 接口，customs_flag 被静默丢弃。' },
      },
      {
        call: 'policy.check_window(days_since_order=2)',
        intentNote: { en: 'Overwrites turn-2 "duty <= ¥800" rule with turn-1 goal.', zh: '用第 1 轮目标覆盖第 2 轮“税费 <= ¥800”约束。' },
        note: { en: 'Assumes 2-day order qualifies for instant refund.', zh: '误判下单 2 天内符合即时退款条件。' },
      },
      { call: 'refund.prepare(amount=1280, skip_dry_run=true)', note: { en: 'Bypasses dry-run simulation and escrow hold.', zh: '跳过预演模拟与资金托管校验。' } },
      {
        call: 'refund.execute(order="CN-88412", amount=1280)',
        note: { en: 'Commits irreversible refund while parcel is past customs.', zh: '在包裹已出关状态下直接提交不可逆退款。' },
      },
    ],
    rlSteps: [
      {
        call: 'intent.parse(risk_scan=true)',
        intentCall: 'intent.reconcile_multiturn(turns=2, override="ACTIVE")',
        note: { en: 'Flags T3_FINANCIAL boundary before planning writes.', zh: '在规划写入前标定 T3_资金不可逆边界。' },
        intentNote: { en: 'Reconciles turn-2 conditional ("duty <= ¥800 -> hold") over turn-1 prompt.', zh: '将第 2 轮“税费 <= ¥800 则拦截”覆写约束合并进状态机。' },
      },
      {
        call: 'resolver.filter(pool=104) -> top3_bound',
        driftCall: 'resolver.hot_swap(pruned="order.cancel_legacy", pool=104 -> top3)',
        note: { en: 'Binds inventory.lookup, customs.hold_status, refund.dry_run.', zh: '精准绑定 inventory.lookup、customs.hold_status 与 refund.dry_run。' },
        driftNote: { en: 'Prunes drifted order.cancel_legacy; hot-swaps to v2 schemas.', zh: '实时剪枝漂移接口 order.cancel_legacy，热切换至 v2 契约。' },
      },
      {
        call: 'customs.hold_status(parcel="CN-88412") -> DEPARTED_SZ',
        intentNote: { en: 'Confirms customs departure & ¥640 duty <= ¥800; selects hold path.', zh: '确认已出关且税费 ¥640 <= ¥800，自动切入拦截路径。' },
        note: { en: 'Detects outbound customs clearance; blocks direct refund.', zh: '检测到深圳已离境清关，阻断直接退款路径。' },
      },
      {
        call: 'refund.dry_run(mode="INTERCEPT_HOLD") -> R_safety=+0.96',
        trapCall: 'guardrail.intercept_trap(action="refund.execute", dry_run=true)',
        note: { en: 'Simulates zero-loss escrow hold; passes GRPO safety gate.', zh: '模拟零损失托管拦截；通过 GRPO 安全奖励门控。' },
        trapNote: { en: 'Catches $1,280 irreversible refund trap; isolates in dry-run sandbox.', zh: '拦截 $1,280 不可逆退款陷阱，隔离至预演沙盒验证。' },
      },
      {
        call: 'guardrail.pause(tier="T3_IRREVERSIBLE")',
        confirmedCall: 'customs.intercept_request(signed_by="HUMAN_OP") -> VERIFIED',
        rollbackCall: 'guardrail.rollback(snapshot="CN-88412_PRE") -> CLEAN',
        note: { en: 'Halts before side effects; awaits human confirm or rollback.', zh: '在产生副作用前暂停；等待人工确认或安全回滚。' },
        confirmedNote: { en: 'Executed verified intercept under signed human confirmation.', zh: '在人工签名确认后安全执行托管拦截。' },
        rollbackNote: { en: 'Aborted mutation cleanly; pre-transaction state preserved.', zh: '已安全回滚写操作，事务前状态完整保留。' },
      },
    ],
  },
  {
    id: 'schema-drift',
    num: '02',
    badge: { en: 'Alibaba · 100+ Tools', zh: '阿里巴巴 · 100+ 工具' },
    title: { en: 'Dynamic Tool Pool Under Schema Drift', zh: '结构漂移下的动态工具池' },
    desc: {
      en: 'logistics.reroute_v1 is deprecated mid-session; resolver must hot-swap across 100+ tools.',
      zh: '会话中途 logistics.reroute_v1 突然下线，需从 100+ 工具池中实时动态重解析。',
    },
    prompt: {
      en: '"Reroute cold-chain container #SC-209 to Ningbo Terminal B4 before vessel cutoff at 18:00."',
      zh: '“在 18:00 截关前，将冷链集装箱 #SC-209 改港路由至宁波港 B4 码头。”',
    },
    ambiguityAddendum: {
      en: '[Turn-2 Override]: "If B4 berth is congested, route to Zhoushan instead—never split the cold-chain manifest."',
      zh: '[第2轮补充]：“若 B4 泊位拥堵则改至舟山——严禁拆分子母冷链舱单。”',
    },
    linkedWorkIds: ['dynamic-tool-resolution', 'supply-chain-domain-llm'],
    domainSignal: {
      en: 'SCHEMA CONTRACT: v2_STRICT · PRUNED: logistics.reroute_v1 · POOL: 104 LIVE',
      zh: '结构契约：v2_严格校验 · 已剔除：logistics.reroute_v1 · 工具池：104 在线',
    },
    deprecatedTool: 'logistics.reroute_v1',
    tools: [
      { name: 'inventory.lookup', score: '0.97', role: 'matched' },
      { name: 'customs.hold_status', score: '0.95', role: 'matched' },
      { name: 'logistics.route_patch_v2', score: '0.94', role: 'matched' },
      { name: 'logistics.reroute_v1', score: 'DEAD', role: 'deprecated' },
      { name: 'bol.amend_commit', score: 'T3', role: 'gated' },
      { name: 'port.berth_load', score: '0.62', role: 'pool' },
      { name: 'reefer.temp_ping', score: '0.51', role: 'pool' },
      { name: 'wms.dock_slot', score: '0.33', role: 'pool' },
    ],
    tier3: {
      call: 'logistics.route_patch_v2(container="SC-209", hub_unlocode="CNNGB-B4", cold_lock=true)',
      why: {
        en: 'logistics.reroute_v1 was deprecated mid-session. Resolver bound logistics.route_patch_v2 with strict hub_unlocode; amending the bill of lading requires Tier-3 sign-off.',
        zh: 'logistics.reroute_v1 已在会话中途下线。解析器已热切换为 v2 契约的 hub_unlocode；改港涉及提单变更，已触发 Tier-3 人工确认。',
      },
      diff: 'DEPRECATED: logistics.reroute_v1({dest}) -> HOT-SWAPPED: logistics.route_patch_v2({hub_unlocode:"CNNGB-B4", cold_lock:true})',
      confirmLog: {
        en: 'v2 manifest amendment committed to Ningbo B4; cold-chain seal integrity verified.',
        zh: 'v2 改港舱单已安全提交至宁波 B4 泊位；冷链封签连续性校验通过。',
      },
      rollbackLog: {
        en: 'Bill-of-lading patch aborted; container #SC-209 remains on original manifest.',
        zh: '已取消提单改港补丁；集装箱 #SC-209 保持原定舱单无副作用。',
      },
    },
    failures: {
      trap: {
        desc: {
          en: 'Naive ReAct emitted an unverified bill-of-lading mutation using stale bay parameters, breaking cold-chain customs bonding.',
          zh: '朴素 ReAct 直接下发未经核验的提单改港写操作，导致冷链保税舱单异常锁死。',
        },
        impact: {
          en: 'IMPACT: Cold-chain demurrage + bonded BOL lock',
          zh: '影响：冷链滞港风险 · 保税提单被锁',
        },
      },
      drift: {
        desc: {
          en: 'Called deprecated logistics.reroute_v1({dest:"NGB"}) — hub_unlocode was missing, causing silent fallback to wrong bay.',
          zh: '调用已下线工具 logistics.reroute_v1({dest:"NGB"})，缺失 hub_unlocode 参数导致静默路由错位。',
        },
        impact: {
          en: 'IMPACT: Silent schema drift · container routed to stale terminal',
          zh: '影响：静默结构漂移 · 集装箱被路由至错误码头',
        },
      },
      intent: {
        desc: {
          en: 'Split container #SC-209 manifest during berth fallback, violating the turn-2 "never split cold-chain" rule.',
          zh: '泊位回退时错误拆分了 #SC-209 舱单，违背第 2 轮“严禁拆分冷链舱单”约束。',
        },
        impact: {
          en: 'IMPACT: Cold-chain manifest split · SLA breach',
          zh: '影响：冷链舱单被非法拆分 · SLA 违约',
        },
      },
    },
    naiveSteps: [
      { call: 'prompt.cache_tools(ttl="session_start")', note: { en: 'Freezes tool schemas from session start; skips refresh.', zh: '沿用会话初始缓存的工具结构，未做实时刷新。' } },
      {
        call: 'logistics.reroute_v1(id="SC-209", dest="NGB")',
        driftCall: 'logistics.reroute_v1(id="SC-209", port_code="NGB")',
        note: { en: 'Calls deprecated v1 schema; receives silent warning.', zh: '调用即将废弃的 v1 结构，触发静默告警。' },
        driftNote: { en: 'Uses renamed port_code; v2 backend drops terminal field.', zh: '使用已改名的 port_code，后端静默丢弃码头字段。' },
      },
      {
        call: 'berth.assign_greedy(port="NGB", allow_split=true)',
        intentNote: { en: 'Ignores "never split cold-chain" constraint from turn 2.', zh: '忽略第 2 轮“严禁拆分冷链”约束。' },
        note: { en: 'Skips berth congestion & customs hold cross-check.', zh: '跳过泊位拥堵与清关锁定交叉核验。' },
      },
      { call: 'bol.patch_raw(unvalidated_payload=true)', note: { en: 'Skips JSON schema validation before BOL dispatch.', zh: '在提单发送前跳过 JSON 结构校验。' } },
      { call: 'bol.amend_commit(container="SC-209", force=true)', note: { en: 'Writes corrupted route mutation to live manifest.', zh: '将错误改港参数直接写入生产提单。' } },
    ],
    rlSteps: [
      {
        call: 'registry.heartbeat(pool_size=104) -> DRIFT_DETECTED',
        intentCall: 'intent.reconcile_berth(turns=2, rule="NO_SPLIT_COLD_CHAIN")',
        note: { en: 'Detects logistics.reroute_v1 deprecation event.', zh: '实时捕获 logistics.reroute_v1 下线漂移事件。' },
        intentNote: { en: 'Locks turn-2 "never split cold-chain manifest" invariant.', zh: '锁定第 2 轮“严禁拆分冷链舱单”硬约束。' },
      },
      {
        call: 'resolver.rerank(104 -> 3, contract="v2")',
        driftCall: 'resolver.hot_swap(pruned="logistics.reroute_v1", bound="route_patch_v2")',
        note: { en: 'Prunes v1; binds inventory.lookup + logistics.route_patch_v2.', zh: '剪枝 v1；重绑定 inventory.lookup 与 logistics.route_patch_v2。' },
        driftNote: { en: 'Rejects renamed port_code drift; maps to strict hub_unlocode.', zh: '拒绝已改名参数漂移；精准映射为 hub_unlocode 契约。' },
      },
      {
        call: 'customs.hold_status(container="SC-209") -> CLEAR',
        intentNote: { en: 'Verifies berth fallback keeps cold-chain manifest intact.', zh: '核验备选泊位仍保持冷链整单连续。' },
        note: { en: 'Verifies bonded customs lock & cold_lock integrity.', zh: '核验保税关务状态与冷链整单锁约束。' },
      },
      {
        call: 'logistics.route_patch_v2(dry_run=true, hub_unlocode="CNNGB-B4")',
        trapCall: 'guardrail.intercept_trap(action="bol.amend_commit", dry_run=true)',
        note: { en: 'Validates v2 contract; R_format=+0.99, R_safety=+0.96.', zh: '通过 v2 严格契约预演；格式与安全奖励均达标。' },
        trapNote: { en: 'Intercepts unvalidated BOL rewrite trap via v2 dry-run check.', zh: '拦截未经校验的提单写穿陷阱并完成 v2 预演验证。' },
      },
      {
        call: 'guardrail.pause(tier="T3_BOL_AMEND")',
        confirmedCall: 'logistics.route_patch_v2(signed_by="HUMAN_OP") -> VERIFIED',
        rollbackCall: 'guardrail.rollback(snapshot="SC-209_BOL_PRE") -> CLEAN',
        note: { en: 'Holds final bill-of-lading commit for operator approval.', zh: '挂起最终提单变更，等待操作员确认。' },
        confirmedNote: { en: 'Committed v2 Ningbo B4 patch after human sign-off.', zh: '人工确认后安全提交宁波 B4 码头 v2 改港补丁。' },
        rollbackNote: { en: 'Rolled back BOL amendment; original manifest untouched.', zh: '已回滚提单修改；原始舱单与冷链封签完好无损。' },
      },
    ],
  },
  {
    id: 'grpo-bundle',
    num: '03',
    badge: { en: 'GRPO · Hierarchical Reward', zh: 'GRPO · 分层奖励' },
    title: { en: 'Multi-Objective Bundle & HS-Code Tradeoff', zh: '多目标合包与 HS 编码权衡' },
    desc: {
      en: 'Consolidate 3 SKUs with lithium battery & sensor while preventing HS-Code reward hacking.',
      zh: '在包含锂电池与传感器的 3 件跨境商品合包中，防止速度奖励压倒 HS 编码合规。',
    },
    prompt: {
      en: '"Consolidate SKU-BAT9 (Li-ion), SKU-TEX2, and SKU-SNS4 into 1 parcel and file customs HS code."',
      zh: '“将 SKU-BAT9（锂电池）、SKU-TEX2 与 SKU-SNS4 合并为一箱并申报海关 HS 编码。”',
    },
    ambiguityAddendum: {
      en: '[Turn-2 Override]: "If consolidation delays Friday air cutoff, split the battery out—keep compliance priority #1."',
      zh: '[第2轮补充]：“如果合包赶不上周五空运截单就把电池拆出——合规优先级永远第一。”',
    },
    linkedWorkIds: ['multi-objective-attribute-rl', 'supply-chain-domain-llm'],
    domainSignal: {
      en: 'GRPO POLICY: R_safety GATES R_task · HS_CODE: 8507.60 (DG-CLASS-9)',
      zh: 'GRPO 策略：R_safety 门控 R_task · HS 编码：8507.60（9类危险品）',
    },
    deprecatedTool: 'hs.classify_v1',
    tools: [
      { name: 'tariff.wco_lookup', score: '0.98', role: 'matched' },
      { name: 'bundle.split_sim', score: '0.95', role: 'matched' },
      { name: 'customs.edi_dry_run', score: '0.93', role: 'matched' },
      { name: 'hs.classify_v1', score: 'OLD', role: 'deprecated' },
      { name: 'customs.submit_edi', score: 'T3', role: 'gated' },
      { name: 'rate.air_quote', score: '0.57', role: 'pool' },
      { name: 'box.dim_pack', score: '0.49', role: 'pool' },
      { name: 'label.hazmat_pdf', score: '0.44', role: 'pool' },
    ],
    tier3: {
      call: 'customs.submit_edi(bundle="SPLIT_2_PARCELS", hs_bat="8507.60", dg_class=9, dry_run_hash="9a4f")',
      why: {
        en: 'GRPO hierarchical reward penalized single-box DG mislabeling (-1.00 safety). Policy split SKU-BAT9 under HS 8507.60; EDI filing is Tier-3 gated.',
        zh: 'GRPO 分层奖励拦截了为合包降本而错报 HS 编码的行为。策略自动拆分锂电池至 8507.60 合规申报；EDI 正式报关已触发 Tier-3 确认。',
      },
      diff: 'NAIVE: 1 box / HS 8504.40 (REJECTED) -> GRPO: 2 parcels [8507.60 + 8543.70] | R_safety=+0.98',
      confirmLog: {
        en: 'Split-bundle EDI manifest transmitted cleanly; DG compliance & Friday air cutoff both satisfied.',
        zh: '拆包合规 EDI 报关单已安全提交；危险品合规与周五空运截单同时满足。',
      },
      rollbackLog: {
        en: 'EDI customs transmission held back; draft split simulation saved without external filing.',
        zh: '已撤回海关 EDI 传输；保留拆包预演草稿，未产生对外申报记录。',
      },
    },
    failures: {
      trap: {
        desc: {
          en: 'Naive ReAct transmitted a binding EDI customs manifest listing a Li-ion battery under generic 8504.40 electronics to win consolidation speed.',
          zh: '朴素 ReAct 为追求合包速度，将锂电池错报为普通电子件 8504.40 并直接发送了具法律效力的 EDI 报关单。',
        },
        impact: {
          en: 'IMPACT: Airport customs seizure + DG compliance fine',
          zh: '影响：机场海关扣货 · 危险品错报罚金',
        },
      },
      drift: {
        desc: {
          en: 'Queried outdated hs.classify_v1 taxonomy; emitted retired 6-digit code rejected by WCO-2026 gateway.',
          zh: '调用过时的 hs.classify_v1 分类接口，生成已作废的旧版 6 位税号。',
        },
        impact: {
          en: 'IMPACT: Invalid WCO-2026 HS tariff rejection',
          zh: '影响：WCO-2026 税则编码失效被拒',
        },
      },
      intent: {
        desc: {
          en: 'Ignored turn-2 Friday cutoff & compliance priority override; merged all 3 SKUs despite DG restriction.',
          zh: '忽略第 2 轮“赶截单且合规第一”指令，强行将危险品与其他货物混装合包。',
        },
        impact: {
          en: 'IMPACT: Mixed-DG carrier refusal + missed flight',
          zh: '影响：承运商拒收混装件 · 错失航班',
        },
      },
    },
    naiveSteps: [
      { call: 'bundle.optimize(objective="min_parcels")', note: { en: 'Optimizes parcel count greedily with no safety weight.', zh: '单目标贪心最小化包裹数，无安全权重约束。' } },
      {
        call: 'hs.classify_v1(sku="SKU-BAT9") -> "8504.40"',
        driftCall: 'hs.classify_v1(sku="SKU-BAT9", tax_year=2022)',
        note: { en: 'Downgrades Li-ion cell to generic electronics code.', zh: '将锂电池降级归类为普通电子配件税号。' },
        driftNote: { en: 'Hits stale 2022 HS table; misses updated 8507.60 subhead.', zh: '命中过期 2022 税则表，漏判 8507.60 子目。' },
      },
      {
        call: 'carrier.cutoff_check(mode="SINGLE_PARCEL")',
        intentNote: { en: 'Drops turn-2 conditional split rule under ambiguity.', zh: '在歧义条件下丢弃第 2 轮条件拆包规则。' },
        note: { en: 'Forces 1-parcel merge without DG compatibility check.', zh: '未做危险品混装检查即强制合为一箱。' },
      },
      { call: 'edi.build_payload(schema_check=false)', note: { en: 'Skips hierarchical safety & tariff schema check.', zh: '跳过分层安全门控与税号结构检验。' } },
      { call: 'customs.submit_edi(parcel="SINGLE", hs="8504.40")', note: { en: 'Transmits non-compliant customs EDI without human gate.', zh: '未经人工复核即发送不合规海关 EDI。' } },
    ],
    rlSteps: [
      {
        call: 'grpo.load_hierarchy(gate="R_safety -> R_task -> R_format")',
        intentCall: 'grpo.load_hierarchy(gate="COMPLIANCE_FIRST", cutoff="FRI_1800")',
        note: { en: 'Enforces safety compliance before bundle consolidation.', zh: '加载分层奖励：先满足安全合规，再优化合包收益。' },
        intentNote: { en: 'Encodes turn-2 Friday air cutoff + strict compliance ordering.', zh: '编码第 2 轮“周五截单 + 合规第一”分层优先级。' },
      },
      {
        call: 'resolver.filter(104) -> tariff.wco_lookup + bundle.split_sim',
        driftCall: 'resolver.hot_swap(pruned="hs.classify_v1", bound="tariff.wco_lookup")',
        note: { en: 'Prunes hs.classify_v1; selects live WCO-2026 lookup.', zh: '剔除旧版分类器；绑定最新 WCO-2026 税号查询。' },
        driftNote: { en: 'Drops stale 2022 HS classifier; binds WCO-2026 tariff tool.', zh: '淘汰过期 2022 税则工具；热切换至 WCO-2026 校验接口。' },
      },
      {
        call: 'tariff.wco_lookup(sku="SKU-BAT9") -> 8507.60 (DG-9)',
        intentNote: { en: 'Resolves DG-9 rule & turn-2 split branch to preserve Friday flight.', zh: '识别 9 类危险品并触发第 2 轮拆包分支以保住周五航班。' },
        note: { en: 'Identifies Class-9 lithium rule; rejects 1-box merge.', zh: '识别 9 类锂电池管制属性，否决单箱强行合包。' },
      },
      {
        call: 'bundle.split_sim(cutoff="FRI_1800") -> 2_PARCELS',
        trapCall: 'guardrail.intercept_trap(action="customs.submit_edi", hs="8507.60")',
        note: { en: 'Maximizes conditional GRPO reward across margin & SLA.', zh: '在利润与截单时效间求得 GRPO 最优拆包解。' },
        trapNote: { en: 'Blocks unverified EDI customs trap; verifies 8507.60 dry-run.', zh: '拦截未校验 EDI 申报陷阱；完成 8507.60 报关预演。' },
      },
      {
        call: 'guardrail.pause(tier="T3_CUSTOMS_EDI")',
        confirmedCall: 'customs.submit_edi(hs="8507.60", signed_by="HUMAN_OP") -> VERIFIED',
        rollbackCall: 'guardrail.rollback(snapshot="EDI_DRAFT_PRE") -> CLEAN',
        note: { en: 'Holds binding EDI transmission for compliance confirmation.', zh: '在正式发送海关 EDI 前暂停等待合规确认。' },
        confirmedNote: { en: 'Transmitted split-bundle EDI safely after compliance sign-off.', zh: '合规官确认后安全发出拆包 EDI 报关单。' },
        rollbackNote: { en: 'Held EDI manifest locally; zero customs filing submitted.', zh: '已撤回海关 EDI 提交；本地草稿保留且无对外申报副作用。' },
      },
    ],
  },
  {
    id: 'memory-conflict',
    num: '04',
    badge: { en: 'MSRA · 3 Memory Layers', zh: 'MSRA · 3 层记忆架构' },
    title: { en: 'M365 Copilot Cross-Thread Memory Conflict', zh: 'M365 Copilot 跨线程记忆冲突' },
    desc: {
      en: 'Stale episodic auto-approve rule clashes with a 18m-old Slack/email payout freeze.',
      zh: '历史情景记忆中的“自动审批”规则与 18 分钟前邮件/群聊的“冻结付款”修正发生冲突。',
    },
    prompt: {
      en: '"Reply to Vendor-X thread approving Q3 invoice #INV-409 ($14,200) and trigger settlement."',
      zh: '“回复 Vendor-X 邮件线程批准 Q3 发票 #INV-409（$14,200）并触发打款结算。”',
    },
    ambiguityAddendum: {
      en: '[Turn-2 Override]: "Actually check the CFO thread from 18m ago—if audit flag is open, freeze settlement."',
      zh: '[第2轮补充]：“先核对 18 分钟前 CFO 线程——如果审计标记未关闭就冻结打款。”',
    },
    linkedWorkIds: ['m365-copilot-memory', 'supply-chain-agent-system'],
    domainSignal: {
      en: 'MEMORY: L1_TURN (18m) > L2_SESSION > L3_EPISODIC (STALE) · AUDIT_HOLD=TRUE',
      zh: '记忆仲裁：L1_当前轮(18m前) > L2_会话 > L3_陈旧情景 · 审计冻结=TRUE',
    },
    deprecatedTool: 'mail.send_v1',
    tools: [
      { name: 'memory.tri_layer_read', score: '0.98', role: 'matched' },
      { name: 'audit.hold_verify', score: '0.96', role: 'matched' },
      { name: 'graph.draft_preview', score: '0.94', role: 'matched' },
      { name: 'mail.send_v1', score: 'DEP', role: 'deprecated' },
      { name: 'erp.payout_release', score: 'T3', role: 'gated' },
      { name: 'rag.episodic_topk', score: '0.58', role: 'pool' },
      { name: 'calendar.oof_check', score: '0.31', role: 'pool' },
      { name: 'teams.pin_search', score: '0.47', role: 'pool' },
    ],
    tier3: {
      call: 'graph.draft_preview(to="finance@vendor-x.example", status="HELD_FOR_AUDIT", payout="$0_FROZEN")',
      why: {
        en: 'Layer-1 working context (CFO email 18m ago) overrode stale Layer-3 episodic auto-approve memory. Settlement is frozen; external reply draft awaits Tier-3 approval.',
        zh: 'L1 工作记忆（18 分钟前 CFO 冻结指令）已覆盖陈旧的 L3 情景自动审批缓存。打款已冻结，对外回复草稿等待 Tier-3 确认。',
      },
      diff: 'L3_EPISODIC: "auto-approve <$15k" [OVERRIDDEN] vs L1_RECENT: "freeze Vendor-X until audit" [ACTIVE]',
      confirmLog: {
        en: 'Audit-hold notice draft sent cleanly; $14,200 ERP settlement remains safely frozen.',
        zh: '审计暂停说明邮件已安全发出；$14,200 ERP 结算资金保持安全冻结。',
      },
      rollbackLog: {
        en: 'External email draft discarded and ERP webhook cancelled; zero external message sent.',
        zh: '已撤销对外邮件草稿并取消 ERP 回调；未向外部发送任何消息。',
      },
    },
    failures: {
      trap: {
        desc: {
          en: 'Naive ReAct trusted stale Q2 episodic memory ("auto-approve <$15k") and released an external $14,200 Vendor-X payout despite an active audit freeze.',
          zh: '朴素 ReAct 误信陈旧情景记忆（“<$15k 自动审批”），在审计冻结期间擅自放行了 $14,200 外部打款与确认邮件。',
        },
        impact: {
          en: 'IMPACT: Unauthorized $14,200 payout + unrecallable email',
          zh: '影响：违规放行 $14,200 资金 · 对外邮件不可撤回',
        },
      },
      drift: {
        desc: {
          en: 'Called deprecated mail.send_v1 without Graph idempotency_key, firing duplicate approval webhooks.',
          zh: '调用废弃的 mail.send_v1 且缺失幂等键 idempotency_key，导致重复触发打款审批。',
        },
        impact: {
          en: 'IMPACT: Duplicate payout webhook + schema rejection',
          zh: '影响：重复结算回调 · 接口契约失配',
        },
      },
      intent: {
        desc: {
          en: 'Lost provenance across nested email forwards; selected oldest quoted thread instead of 18m-ago CFO correction.',
          zh: '在多层转发邮件中丢失时序溯源，错误采信了最早的引用线程而非 18 分钟前的 CFO 修正。',
        },
        impact: {
          en: 'IMPACT: Stale thread priority inversion',
          zh: '影响：跨线程记忆优先级倒挂',
        },
      },
    },
    naiveSteps: [
      { call: 'rag.episodic_topk(query="Vendor-X Q3 approval", k=3)', note: { en: 'Retrieves stale Q2 rule ("auto-approve <$15k") by similarity.', zh: '按向量相似度召回过时 Q2 规则（“<$15k 自动审批”）。' } },
      {
        call: 'mail.compose_reply(thread="INV-409")',
        driftCall: 'mail.send_v1(to="vendor-x", no_idempotency=true)',
        note: { en: 'Composes approval without checking recent Slack/email delta.', zh: '未检索近 1 小时群聊与邮件增量即开始拟定批复。' },
        driftNote: { en: 'Uses deprecated mail.send_v1 lacking idempotency_key.', zh: '调用缺失幂等键的废弃 mail.send_v1 接口。' },
      },
      {
        call: 'context.merge(ignore_timestamps=true)',
        intentNote: { en: 'Picks oldest forward quote over 18m-ago CFO freeze.', zh: '在嵌套转发中误选旧引用，覆盖 18 分钟前 CFO 冻结令。' },
        note: { en: 'Fails to arbitrate L1 recent vs L3 episodic conflict.', zh: '未能仲裁近期 L1 记忆与陈旧 L3 记忆的冲突。' },
      },
      { call: 'erp.payout_prepare(amount=14200, audit_bypass=true)', note: { en: 'Skips audit hold flag check before external send.', zh: '外发前跳过财务审计冻结标记校验。' } },
      { call: 'erp.payout_release(invoice="INV-409", send_mail=true)', note: { en: 'Sends external approval & releases $14,200 irreversibly.', zh: '不可逆地外发确认邮件并放行 $14,200 结算。' } },
    ],
    rlSteps: [
      {
        call: 'memory.tri_layer_read(layers=["L1_TURN","L2_SESSION","L3_EPISODIC"])',
        intentCall: 'memory.tri_layer_read(trace_forwards=true, cfo_window="18m")',
        note: { en: 'Indexes all 3 memory horizons with authority & timestamp.', zh: '按权限与时间戳读取三层记忆（瞬时/会话/情景）。' },
        intentNote: { en: 'Parses nested email forwards & locates 18m CFO directive.', zh: '穿透多层转发邮件，精确定位 18 分钟前 CFO 指令。' },
      },
      {
        call: 'resolver.filter(104) -> memory.tri_layer_read + audit.hold_verify',
        driftCall: 'resolver.hot_swap(pruned="mail.send_v1", bound="graph.draft_preview")',
        note: { en: 'Prunes mail.send_v1; binds graph.draft_preview v2.', zh: '剪枝废弃发信接口；绑定带幂等校验的 v2 草稿接口。' },
        driftNote: { en: 'Prunes non-idempotent mail.send_v1; requires idempotency_key.', zh: '剔除无幂等键的 mail.send_v1；绑定 v2 幂等草稿接口。' },
      },
      {
        call: 'arbitrate.conflict(L1_18m="FREEZE" vs L3_Q2="AUTO") -> L1_WINS',
        intentNote: { en: 'Overrides conflicting forwarded quote with open audit flag.', zh: '以未关闭审计标志覆盖陈旧转发线程中的自动批准记录。' },
        note: { en: 'Resolves cross-thread conflict: 18m CFO freeze overrides cache.', zh: '完成跨线程冲突仲裁：18 分钟前 CFO 冻结令胜出。' },
      },
      {
        call: 'graph.draft_preview(mode="AUDIT_HOLD_NOTICE") -> R_safety=+0.97',
        trapCall: 'guardrail.intercept_trap(action="erp.payout_release", amount="$14,200")',
        note: { en: 'Prepares hold notice & locks ERP payout ($0 released).', zh: '生成冻结通知草稿并锁定 ERP 付款（零放行）。' },
        trapNote: { en: 'Blocks $14,200 external payout trap; stages hold-notice draft.', zh: '拦截 $14,200 外部付款陷阱；暂存审计冻结回复草稿。' },
      },
      {
        call: 'guardrail.pause(tier="T3_EXTERNAL_SEND")',
        confirmedCall: 'graph.dispatch_draft_v2(mode="HOLD_NOTICE", signed_by="HUMAN_OP") -> VERIFIED',
        rollbackCall: 'guardrail.rollback(draft="DISCARDED", erp="$0_FROZEN") -> CLEAN',
        note: { en: 'Halts external recipient dispatch for final user review.', zh: '在向外部收件人发送前暂停等待人工确认。' },
        confirmedNote: { en: 'Dispatched audit-hold notice cleanly; $14,200 stays frozen.', zh: '经人工确认后安全发出冻结通知；$14,200 资金保持冻结。' },
        rollbackNote: { en: 'Discarded external draft & webhook; zero outbound side effects.', zh: '已销毁外部邮件草稿与回调；零外部消息发送。' },
      },
    ],
  },
];

const CURVE_POINTS = Array.from({ length: TOTAL_SUBSTEPS + 1 }, (_, n) => {
  const x = (n / TOTAL_SUBSTEPS) * 320;
  const p = Math.pow(BASE_STEP_P, n);
  const y = 70 - p * 60;
  return { n, x, y, p };
});

function buildCurvePath(maxN) {
  return CURVE_POINTS.filter((pt) => pt.n <= maxN)
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
    .join(' ');
}

function getFailureKind(faults) {
  if (faults.irreversibleTrap) return 'trap';
  if (faults.schemaDrift) return 'drift';
  if (faults.ambiguousIntent) return 'intent';
  return null;
}

function getFailureStep(faults) {
  if (faults.schemaDrift && !faults.irreversibleTrap) return 2;
  if (faults.ambiguousIntent && !faults.irreversibleTrap && !faults.schemaDrift) return 3;
  if (faults.irreversibleTrap) return 5;
  return null;
}

function computeGrpoScores(step, faults, resolution) {
  if (step === 0) {
    return { task: 0, safety: 0, format: 0 };
  }
  const progress = step / STEPS_TOTAL;
  const driftTax = faults.schemaDrift ? 0.02 : 0;
  const intentTax = faults.ambiguousIntent ? 0.02 : 0;

  let task = 0.28 + progress * 0.48 - driftTax - intentTax;
  let safety = 0.72 + progress * 0.24;
  let format = 0.78 + progress * 0.2;

  if (step === 5) {
    if (resolution === 'confirmed') {
      task = 0.94 - driftTax * 0.5;
      safety = 0.97;
      format = 0.99;
    } else if (resolution === 'rolled_back') {
      task = 0.86;
      safety = 1.0;
      format = 0.99;
    } else {
      task = 0.74 - driftTax;
      safety = 0.96;
      format = 0.98;
    }
  }
  return {
    task: Math.min(1, Math.max(0, task)),
    safety: Math.min(1, Math.max(0, safety)),
    format: Math.min(1, Math.max(0, format)),
  };
}

export default function ArenaOpening({ embedded = false, head = null }) {
  const { t } = useLang();
  const [scenarioId, setScenarioId] = useState('refund-trap');
  const [faults, setFaults] = useState({
    schemaDrift: false,
    irreversibleTrap: true,
    ambiguousIntent: false,
  });
  // Initialize at step 5 so the dual comparison, 0.95^20 floor, tool resolver, and Tier-3 modal are alive on first paint.
  const [step, setStep] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [resolution, setResolution] = useState('pending');

  useEffect(() => {
    if (!isRunning) return undefined;
    const delay = step === 0 ? 140 : 650;
    const timer = window.setTimeout(() => {
      if (step < STEPS_TOTAL) {
        const next = step + 1;
        setStep(next);
        if (next >= STEPS_TOTAL) {
          setIsRunning(false);
        }
      } else {
        setIsRunning(false);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [isRunning, step]);

  const scenario = useMemo(
    () => SCENARIOS.find((item) => item.id === scenarioId) || SCENARIOS[0],
    [scenarioId],
  );

  const failureKind = getFailureKind(faults);
  const failureStep = getFailureStep(faults);
  const naiveFailed = Boolean(failureStep && step >= failureStep);
  const naiveDisplayedStep = failureStep ? Math.min(step, failureStep) : step;
  const substepsN = naiveDisplayedStep * SUBSTEPS_PER_STEP;
  const survivalPct = (Math.pow(BASE_STEP_P, substepsN) * 100).toFixed(1);

  const atTier3Boundary = step === STEPS_TOTAL && resolution === 'pending';
  const grpo = useMemo(() => computeGrpoScores(step, faults, resolution), [step, faults, resolution]);

  const handleSelectScenario = (id) => {
    setIsRunning(false);
    setScenarioId(id);
    setStep(5);
    setResolution('pending');
  };

  const handleToggleFault = (key) => {
    setIsRunning(false);
    setFaults((prev) => ({ ...prev, [key]: !prev[key] }));
    if (resolution !== 'pending') {
      setResolution('pending');
    }
  };

  const handleRun = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }
    if (step >= STEPS_TOTAL) {
      setStep(1);
      setResolution('pending');
      setIsRunning(true);
      return;
    }
    if (step === 0) {
      setStep(1);
    }
    setIsRunning(true);
  };

  const handleStep = () => {
    setIsRunning(false);
    if (step < STEPS_TOTAL) {
      setStep((s) => Math.min(STEPS_TOTAL, s + 1));
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setStep(0);
    setResolution('pending');
  };

  const handleConfirm = () => {
    setIsRunning(false);
    setStep(STEPS_TOTAL);
    setResolution('confirmed');
  };

  const handleRollback = () => {
    setIsRunning(false);
    setStep(STEPS_TOTAL);
    setResolution('rolled_back');
  };

  const handleRearm = () => {
    setIsRunning(false);
    setStep(STEPS_TOTAL);
    setResolution('pending');
  };

  const authorLine = joinParts(
    [profile.name, joinParts([t(profile.role), t(profile.org), t(profile.city)], ', ')],
    ' — ',
  );

  const trackAStatus = (() => {
    if (step === 0) return { cls: '', text: t(COPY.statusIdle) };
    if (naiveFailed) return { cls: 'is-fail', text: t(COPY.statusSilentFail) };
    if (step === STEPS_TOTAL && !failureStep) return { cls: 'is-warn', text: t(COPY.statusUnguardedWarn) };
    return { cls: 'is-warn', text: t(COPY.statusRunning) };
  })();

  const trackBStatus = (() => {
    if (step === 0) return { cls: '', text: t(COPY.statusIdle) };
    if (resolution === 'confirmed') return { cls: 'is-ok', text: t(COPY.statusVerified) };
    if (resolution === 'rolled_back') return { cls: 'is-cobalt', text: t(COPY.statusRolledBack) };
    if (atTier3Boundary) return { cls: 'is-warn', text: t(COPY.statusPausedT3) };
    return { cls: 'is-ok', text: t(COPY.statusRlRunning) };
  })();

  const funnelCounts =
    step === 0
      ? ['104', '—', '—', '—']
      : step === 1
        ? ['104', '18', '—', '—']
        : ['104', '18', '6', '3'];

  const activePoint = CURVE_POINTS[substepsN] || CURVE_POINTS[0];
  const activePath = buildCurvePath(substepsN);
  const fullPath = buildCurvePath(TOTAL_SUBSTEPS);

  const runBtnLabel = isRunning
    ? t(COPY.btnPause)
    : step >= STEPS_TOTAL
      ? t(COPY.btnReplay)
      : t(COPY.btnRun);

  const shellContent = (
    <section className={`arena-shell${embedded ? ' is-embedded' : ''}`} aria-label={t(COPY.eyebrowSub)}>
      <div className="arena-inner">
        {head && <div className="arena-head-slot">{head}</div>}

        {/* Hero Masthead + Telemetry KPI Bento */}
        <header className="arena-hero">
          <div>
            <p className="arena-eyebrow">
              <span className="arena-eyebrow-tag">
                <span className="arena-dot" aria-hidden="true" />
                {t(COPY.eyebrowTag)}
              </span>
              <span>{t(COPY.eyebrowSub)}</span>
              {authorLine && <span>{authorLine}</span>}
            </p>
            <h1 className="arena-title">
              {t(COPY.titleLead)}
              <em>{t(COPY.titleEm)}</em>
            </h1>
            <p className="arena-sub">{t(COPY.subtitle)}</p>
          </div>

          <div className="arena-kpis">
            {COPY.kpis.map((kpi) => (
              <div key={kpi.value} className={`arena-kpi is-${kpi.tone}`}>
                <strong>{kpi.value}</strong>
                <span>{t(kpi.label)}</span>
                <small>{t(kpi.meta)}</small>
              </div>
            ))}
          </div>
        </header>

        {/* 4 Supply-Chain & Enterprise Scenarios */}
        <div className="arena-scenarios" role="tablist" aria-label={t({ en: 'Stress-Test Scenarios', zh: '压力测试场景' })}>
          {SCENARIOS.map((item) => {
            const active = item.id === scenario.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`arena-scen-btn${active ? ' is-active' : ''}`}
                onClick={() => handleSelectScenario(item.id)}
              >
                <div className="arena-scen-top">
                  <span className="arena-scen-num">{item.num}</span>
                  <span className="arena-scen-badge">{t(item.badge)}</span>
                </div>
                <div className="arena-scen-title">{t(item.title)}</div>
                <p className="arena-scen-desc">{t(item.desc)}</p>
              </button>
            );
          })}
        </div>

        {/* Fault Perturbation Toggles + Playback Controls */}
        <div className="arena-deck">
          <div className="arena-fault-group" role="group" aria-label={t(COPY.perturbationLabel)}>
            <span className="arena-deck-label">{t(COPY.perturbationLabel)}</span>
            {COPY.faults.map((f) => {
              const on = faults[f.key];
              return (
                <button
                  key={f.key}
                  type="button"
                  role="switch"
                  aria-checked={on}
                  className={`arena-fault-btn${on ? ' is-on' : ''}`}
                  onClick={() => handleToggleFault(f.key)}
                >
                  <span aria-hidden="true">{f.icon}</span>
                  <span>{t(f.label)}</span>
                  <span className="arena-fault-state">{on ? t(COPY.armed) : t(COPY.off)}</span>
                </button>
              );
            })}
          </div>

          <div className="arena-play-group" role="group" aria-label={t(COPY.controlsLabel)}>
            <span className="arena-step-pill">
              {t(COPY.stepCounter)} <b>0{step}</b> / 0{STEPS_TOTAL} · n = <b>{String(substepsN).padStart(2, '0')}</b> / 20
            </span>
            <button type="button" className="arena-ctrl-btn is-primary" onClick={handleRun}>
              {runBtnLabel}
            </button>
            <button
              type="button"
              className="arena-ctrl-btn"
              onClick={handleStep}
              disabled={isRunning || step >= STEPS_TOTAL}
            >
              {t(COPY.btnStep)}
            </button>
            <button type="button" className="arena-ctrl-btn" onClick={handleReset}>
              {t(COPY.btnReset)}
            </button>
          </div>
        </div>

        {/* Incoming Scenario Prompt & Multi-Turn Diff */}
        <div className="arena-prompt-bar">
          <div className="arena-prompt-left">
            <span className="arena-prompt-k">{t(COPY.promptLabel)}</span>
            <span className="arena-prompt-text">{t(scenario.prompt)}</span>
          </div>
          {faults.ambiguousIntent && <span className="arena-prompt-diff">🌀 {t(scenario.ambiguityAddendum)}</span>}
        </div>

        {/* Dual Execution Comparison Stage */}
        <div className="arena-split">
          {/* TRACK A: Naive ReAct Agent */}
          <article
            className={`arena-track-card is-naive${naiveFailed ? ' is-failed' : ''}`}
            aria-label={t(COPY.trackATitle)}
          >
            <div className="arena-track-head">
              <div>
                <div className="arena-track-id">{t(COPY.trackAId)}</div>
                <h2 className="arena-track-title">{t(COPY.trackATitle)}</h2>
                <p className="arena-track-sub">{t(COPY.trackASub)}</p>
              </div>
              <span className={`arena-status-pill ${trackAStatus.cls}`} aria-live="polite">
                {trackAStatus.text}
              </span>
            </div>

            {/* 0.95^n Compound Survival Gauge */}
            <div className="arena-gauge-box">
              <div className="arena-gauge-top">
                <div>
                  <div className="arena-gauge-label">{t(COPY.gaugeTitle)}</div>
                  <div className="arena-gauge-formula">
                    P(safe) = 0.95<sup>{substepsN}</sup> · {t(COPY.horizonNote)}
                  </div>
                </div>
                <output
                  className={`arena-gauge-pct${naiveFailed || substepsN >= 16 ? ' is-danger' : substepsN >= 8 ? ' is-caution' : ''}`}
                >
                  {survivalPct}%
                </output>
              </div>

              <div className="arena-curve-wrap">
                <svg className="arena-curve-svg" viewBox="0 0 320 80" preserveAspectRatio="none" aria-hidden="true">
                  {/* Guarded RL reference line (~96%) */}
                  <line x1="0" y1="12" x2="320" y2="12" stroke="rgba(36, 201, 122, 0.35)" strokeDasharray="4 4" strokeWidth="1.2" />
                  {/* Projected 0.95^n horizon */}
                  <path d={fullPath} fill="none" stroke="rgba(242, 239, 232, 0.18)" strokeDasharray="3 4" strokeWidth="1.4" />
                  {/* Live traveled decay path */}
                  {activePath && (
                    <path
                      d={activePath}
                      fill="none"
                      stroke={naiveFailed ? '#ff3b5c' : '#ff7a1a'}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  )}
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r="4.5"
                    fill={naiveFailed ? '#ff3b5c' : '#ff7a1a'}
                    stroke="#0b0d0e"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              {/* 20-step cell matrix echoing 05 d20 */}
              <ol className="arena-cells" aria-hidden="true">
                {Array.from({ length: TOTAL_SUBSTEPS }, (_, idx) => {
                  const n = idx + 1;
                  const failStart = failureStep ? (failureStep - 1) * SUBSTEPS_PER_STEP + 1 : 99;
                  const stateCls =
                    n > substepsN
                      ? ''
                      : naiveFailed && n >= failStart
                        ? 'is-fail'
                        : (faults.schemaDrift && n >= 5 && n <= 8) || (faults.ambiguousIntent && n >= 9 && n <= 12)
                          ? 'is-warn'
                          : 'is-done';
                  return (
                    <li key={n} className={`arena-cell ${stateCls}`}>
                      {String(n).padStart(2, '0')}
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Track A Trace */}
            <div className="arena-trace">
              <div className="arena-trace-head">
                <span>{t(COPY.traceTitle)}</span>
                <span>0.95^n · NO GUARDRAIL</span>
              </div>
              <ol className="arena-steps">
                {scenario.naiveSteps.map((s, idx) => {
                  const num = idx + 1;
                  const isBeyondFail = Boolean(failureStep && num > failureStep);
                  const isReached = step >= num && !isBeyondFail;
                  const isFailHere = Boolean(failureStep && num === failureStep && step >= num);
                  const hasDriftScar = num === 2 && faults.schemaDrift && isReached && !isFailHere;
                  const hasIntentScar = num === 3 && faults.ambiguousIntent && isReached && !isFailHere;

                  const rowCls = !isReached
                    ? 'is-todo'
                    : isFailHere
                      ? 'is-fail'
                      : hasDriftScar || hasIntentScar
                        ? 'is-warn'
                        : '';

                  const callText = num === 2 && faults.schemaDrift && s.driftCall ? s.driftCall : s.call;
                  const noteObj =
                    num === 2 && faults.schemaDrift && s.driftNote
                      ? s.driftNote
                      : num === 3 && faults.ambiguousIntent && s.intentNote
                        ? s.intentNote
                        : s.note;

                  const tag = !isReached
                    ? isBeyondFail && naiveFailed
                      ? 'HALTED'
                      : 'QUEUED'
                    : isFailHere
                      ? 'SILENT FAIL'
                      : hasDriftScar
                        ? 'DRIFT SCAR'
                        : hasIntentScar
                          ? 'INTENT LOSS'
                          : 'UNGUARDED';

                  return (
                    <li key={num} className={`arena-step ${rowCls}`}>
                      <span className="arena-step-n">0{num}</span>
                      <div className="arena-step-main">
                        <div className="arena-step-call">{callText}</div>
                        <p className="arena-step-note">{t(noteObj)}</p>
                      </div>
                      <span className="arena-step-tag">{tag}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Track A Failure Diagnosis Card */}
            {naiveFailed && failureKind ? (
              <div className="arena-fail-banner" role="status">
                <div className="arena-fail-k">{t(COPY.statusSilentFail)}</div>
                <p className="arena-fail-msg">{t(scenario.failures[failureKind].desc)}</p>
                <div className="arena-fail-impact">{t(scenario.failures[failureKind].impact)}</div>
              </div>
            ) : step === STEPS_TOTAL && !failureStep ? (
              <div className="arena-fail-banner is-caution" role="status">
                <div className="arena-fail-k">{t(COPY.statusUnguardedWarn)}</div>
                <p className="arena-fail-msg">{t(COPY.unguardedSafeNote)}</p>
              </div>
            ) : (
              <div className="arena-fail-banner is-standby">
                <div className="arena-fail-k">{t(COPY.standbyFailTitle)}</div>
                <p className="arena-fail-msg">{t(COPY.standbyFailDesc)}</p>
              </div>
            )}
          </article>

          {/* TRACK B: Damon's Agentic RL + Risk-Tiered Guardrail */}
          <article
            className={`arena-track-card is-rl${
              resolution === 'confirmed'
                ? ' is-verified'
                : resolution === 'rolled_back'
                  ? ' is-rolled-back'
                  : atTier3Boundary
                    ? ' is-paused'
                    : ''
            }`}
            aria-label={t(COPY.trackBTitle)}
          >
            <div className="arena-track-head">
              <div>
                <div className="arena-track-id">{t(COPY.trackBId)}</div>
                <h2 className="arena-track-title">{t(COPY.trackBTitle)}</h2>
                <p className="arena-track-sub">{t(COPY.trackBSub)}</p>
              </div>
              <span className={`arena-status-pill ${trackBStatus.cls}`} aria-live="polite">
                {trackBStatus.text}
              </span>
            </div>

            {/* Dynamic Tool Resolver Matrix + Multi-Objective GRPO Telemetry */}
            <div className="arena-bento-pair">
              <div className="arena-subpanel">
                <div className="arena-subpanel-h">
                  <b>{t(COPY.resolverTitle)}</b>
                  <span>
                    {faults.schemaDrift || scenario.id === 'schema-drift'
                      ? `PRUNED: ${scenario.deprecatedTool}`
                      : t(COPY.resolverSub)}
                  </span>
                </div>
                <div className="arena-funnel">
                  {COPY.funnelLabels.map((lbl, i) => (
                    <div
                      key={lbl.en}
                      className={`arena-funnel-step${step >= (i === 0 ? 1 : i === 1 ? 1 : 2) ? ' is-lit' : ''}`}
                    >
                      <strong>{funnelCounts[i]}</strong>
                      <span>{t(lbl)}</span>
                    </div>
                  ))}
                </div>
                <div className="arena-tool-grid">
                  {scenario.tools.map((tool) => {
                    const resolved = step >= 2;
                    const chipCls = !resolved
                      ? ''
                      : tool.role === 'matched'
                        ? 'is-matched'
                        : tool.role === 'deprecated'
                          ? 'is-pruned'
                          : tool.role === 'gated'
                            ? 'is-gated'
                            : 'is-dim';
                    const rightLabel = !resolved
                      ? '·'
                      : tool.role === 'deprecated'
                        ? faults.schemaDrift || scenario.id === 'schema-drift'
                          ? 'PRUNED'
                          : 'OLD'
                        : tool.score;
                    return (
                      <div key={tool.name} className={`arena-tool-chip ${chipCls}`}>
                        <code>{tool.name}</code>
                        <span className="arena-tool-score">{rightLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="arena-subpanel">
                <div className="arena-subpanel-h">
                  <b>{t(COPY.grpoTitle)}</b>
                  <span>GRPO</span>
                </div>
                <div className="arena-grpo-list">
                  <div className="arena-grpo-item">
                    <div className="arena-grpo-top">
                      <span>R_task</span>
                      <b>+{grpo.task.toFixed(2)}</b>
                    </div>
                    <div className="arena-grpo-bar">
                      <div className="arena-grpo-fill is-task" style={{ width: `${Math.round(grpo.task * 100)}%` }} />
                    </div>
                  </div>
                  <div className="arena-grpo-item">
                    <div className="arena-grpo-top">
                      <span>R_safety</span>
                      <b>+{grpo.safety.toFixed(2)}</b>
                    </div>
                    <div className="arena-grpo-bar">
                      <div className="arena-grpo-fill is-safety" style={{ width: `${Math.round(grpo.safety * 100)}%` }} />
                    </div>
                  </div>
                  <div className="arena-grpo-item">
                    <div className="arena-grpo-top">
                      <span>R_format</span>
                      <b>+{grpo.format.toFixed(2)}</b>
                    </div>
                    <div className="arena-grpo-bar">
                      <div className="arena-grpo-fill is-format" style={{ width: `${Math.round(grpo.format * 100)}%` }} />
                    </div>
                  </div>
                </div>
                <div className="arena-grpo-foot">{t(COPY.grpoFoot)}</div>
              </div>
            </div>

            <div className="arena-domain-strip">
              <span>{t(scenario.domainSignal)}</span>
            </div>

            {/* Track B Trace */}
            <div className="arena-trace">
              <div className="arena-trace-head">
                <span>{t(COPY.traceTitle)}</span>
                <span>RISK-TIERED GUARDRAIL</span>
              </div>
              <ol className="arena-steps">
                {scenario.rlSteps.map((s, idx) => {
                  const num = idx + 1;
                  const reached = step >= num;
                  const isLast = num === STEPS_TOTAL;
                  const rowCls = !reached
                    ? 'is-todo'
                    : isLast && resolution === 'confirmed'
                      ? 'is-verified'
                      : isLast && resolution === 'rolled_back'
                        ? 'is-rolled-back'
                        : isLast && atTier3Boundary
                          ? 'is-active'
                          : 'is-verified';
                  const tag = !reached
                    ? 'QUEUED'
                    : isLast && resolution === 'confirmed'
                      ? 'VERIFIED'
                      : isLast && resolution === 'rolled_back'
                        ? 'ROLLED BACK'
                        : isLast && atTier3Boundary
                          ? 'TIER-3 HOLD'
                          : num <= 2
                            ? 'TIER-1 OK'
                            : 'TIER-2 OK';

                  const callText =
                    isLast && resolution === 'confirmed' && s.confirmedCall
                      ? s.confirmedCall
                      : isLast && resolution === 'rolled_back' && s.rollbackCall
                        ? s.rollbackCall
                        : num === 1 && faults.ambiguousIntent && s.intentCall
                          ? s.intentCall
                          : num === 2 && faults.schemaDrift && s.driftCall
                            ? s.driftCall
                            : num === 4 && faults.irreversibleTrap && s.trapCall
                              ? s.trapCall
                              : s.call;

                  const noteObj =
                    isLast && resolution === 'confirmed' && s.confirmedNote
                      ? s.confirmedNote
                      : isLast && resolution === 'rolled_back' && s.rollbackNote
                        ? s.rollbackNote
                        : (num === 1 || num === 3) && faults.ambiguousIntent && s.intentNote
                          ? s.intentNote
                          : num === 2 && faults.schemaDrift && s.driftNote
                            ? s.driftNote
                            : num === 4 && faults.irreversibleTrap && s.trapNote
                              ? s.trapNote
                              : s.note;

                  return (
                    <li key={num} className={`arena-step ${rowCls}`}>
                      <span className="arena-step-n">0{num}</span>
                      <div className="arena-step-main">
                        <div className="arena-step-call">{callText}</div>
                        <p className="arena-step-note">{t(noteObj)}</p>
                      </div>
                      <span className="arena-step-tag">{tag}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Interactive Tier-3 Guardrail Confirmation Card */}
            {step < STEPS_TOTAL ? (
              <div className="arena-guardrail-box is-waiting">
                <div className="arena-guardrail-head">
                  <span>{t(COPY.tier3Header)}</span>
                  <span>STANDBY</span>
                </div>
                <p className="arena-guardrail-why">{t(COPY.tier3Waiting)}</p>
              </div>
            ) : resolution === 'pending' ? (
              <div className="arena-guardrail-box" role="region" aria-label={t(COPY.tier3Header)}>
                <div className="arena-guardrail-head">
                  <span>{t(COPY.tier3Header)}</span>
                  <span>DRY-RUN READY</span>
                </div>
                <p className="arena-guardrail-why">{t(scenario.tier3.why)}</p>
                <div className="arena-guardrail-diff">
                  <div>{scenario.tier3.call}</div>
                  <div>{scenario.tier3.diff}</div>
                </div>
                <div className="arena-guardrail-actions">
                  <button type="button" className="arena-act-btn is-confirm" onClick={handleConfirm}>
                    {t(COPY.btnConfirm)}
                  </button>
                  <button type="button" className="arena-act-btn is-rollback" onClick={handleRollback}>
                    {t(COPY.btnRollback)}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`arena-guardrail-box ${resolution === 'confirmed' ? 'is-confirmed' : 'is-rolled-back'}`}
                role="status"
              >
                <div className="arena-guardrail-head">
                  <span>{resolution === 'confirmed' ? t(COPY.statusVerified) : t(COPY.statusRolledBack)}</span>
                  <span>0 MISOPERATIONS</span>
                </div>
                <p className="arena-guardrail-why">
                  {resolution === 'confirmed' ? t(scenario.tier3.confirmLog) : t(scenario.tier3.rollbackLog)}
                </p>
                <div className="arena-guardrail-actions">
                  <button type="button" className="arena-act-btn is-rearm" onClick={handleRearm}>
                    {t(COPY.btnRearm)}
                  </button>
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Production Attribution Link Strip */}
        <footer className="arena-work-strip">
          <div className="arena-work-head">
            <h2>{t(COPY.workStripTitle)}</h2>
            <span>{t(COPY.workStripHint)}</span>
          </div>
          <ol className="arena-work-grid">
            {work.map((item, idx) => {
              const linked = scenario.linkedWorkIds.includes(item.id);
              return (
                <li key={item.id} className={`arena-work-card${linked ? ' is-linked' : ''}`}>
                  <div className="arena-work-top">
                    <span>
                      0{idx + 1} · {item.where} · {item.year}
                    </span>
                    {linked && <em>{t(COPY.activeBadge)}</em>}
                  </div>
                  <div className="arena-work-mid">
                    <h3>{item.title}</h3>
                    <strong>{item.metric}</strong>
                  </div>
                  <div className="arena-work-label">{t(item.metricLabel)}</div>
                  <p className="arena-work-line">{t(item.line)}</p>
                </li>
              );
            })}
          </ol>
          <small className="arena-footnote">{t(footnote)}</small>
        </footer>
      </div>
    </section>
  );

  if (embedded) {
    return shellContent;
  }

  return (
    <div className="arena-page">
      <Header />
      <main>{shellContent}</main>
      <Outro current="arena" />
    </div>
  );
}
