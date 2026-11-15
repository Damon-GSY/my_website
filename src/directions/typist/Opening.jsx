import { useEffect, useMemo, useState } from 'react';
import { Header, Outro } from '../../components/Chrome.jsx';
import { useLang } from '../../i18n.jsx';
import { footnote, joinParts, profile, route, work } from '../../content.js';
import './typist.css';

const cand = (text, logit, advantage, reasonEn, reasonZh) => ({
  text,
  logit,
  advantage,
  reason: { en: reasonEn, zh: reasonZh },
});

const tok = (text, logit, advantage, reasonEn, reasonZh, rejected, opts = {}) => ({
  text,
  logit,
  advantage,
  reason: { en: reasonEn, zh: reasonZh },
  hallucination: Boolean(opts.hallucination),
  workIds: opts.workIds || [],
  rejected,
});

const WORK_TAGS = {
  'supply-chain-agent-system': '≈90%',
  'dynamic-tool-resolution': '100+',
  'supply-chain-domain-llm': 'SOTA',
  'multi-objective-attribute-rl': 'GRPO',
  'm365-copilot-memory': '3',
  'supchain-bench': '530',
};

const CLOUD_SLOTS = [
  { x: -242, y: -14 },
  { x: 242, y: -18 },
  { x: -126, y: -96 },
  { x: 126, y: -100 },
];

const POLICIES = {
  pi_0: {
    id: 'pi_0',
    badge: 'π₀ Base',
    label: { en: 'Pretrained Base', zh: '预训练基座' },
    rewardCode: 'R = -1.84 · KL SPIKE',
    rewardTone: 'alert',
    summary: {
      en: 'Unaligned base weights chase viral wrapper phrasing and hallucinated demo claims, spiking KL divergence.',
      zh: '未对齐的基座权重倾向于套壳营销词与幻觉式演示话术，导致 KL 散度尖峰。',
    },
    ledgerStatus: {
      en: 'KL SPIKE DETECTED · UNVERIFIED DEMO WRAPPER HALLUCINATIONS',
      zh: '检测到 KL 尖峰 · 未验证的演示套壳幻觉',
    },
    ledgerChips: {
      en: ['0 production tool traces', 'KL = 0.84 > threshold', 'Reward penalty -1.84'],
      zh: ['0 条生产工具轨迹', 'KL = 0.84 超出阈值', '奖励惩罚 -1.84'],
    },
    tokens: {
      en: [
        tok('I', 4.6, 0.04, 'Neutral first-person prompt anchor.', '中性的第一人称起始词元。', [
          cand('We', 3.1, -0.08, 'Shifts ownership away from individual builder.', '弱化个人工程归属感。'),
          cand('Our', 2.4, -0.15, 'Generic agency framing.', '泛化团队前缀。'),
          cand('AI', 2.0, -0.32, 'Buzzword subject opener.', '空泛热词开头。'),
          cand('Models', 1.4, -0.19, 'Drops human accountability.', '弱化研究者主体。'),
        ]),
        tok(
          'wrap',
          3.95,
          -0.94,
          'Base prior favors wrapper hype over training; verifier assigns strongly negative GAE advantage.',
          '基座先验偏爱“封装套壳”高频词，但验证器给出强负向 GAE 优势。',
          [
            cand('train', 2.55, 0.86, 'High RL reward potential, suppressed by unaligned base logits.', '高奖励动作词，但被未对齐基座概率压低。'),
            cand('build', 3.15, -0.22, 'Vague verb without training signal.', '缺少训练闭环语义的泛化动词。'),
            cand('chain', 2.9, -0.58, 'Surface orchestration cliché.', '浅层编排套话。'),
            cand('ship', 2.1, -0.41, 'Skips verification and eval discipline.', '跳过验证与评测环节。'),
          ],
          { hallucination: true },
        ),
        tok('prompt', 4.1, -0.68, 'Assumes static prompt engineering replaces policy optimization.', '假设静态提示词可以替代策略优化。', [
          cand('language', 2.75, 0.72, 'Grounded domain noun underweighted in π₀.', '在 π₀ 中权重不足的真实领域名词。'),
          cand('magic', 3.1, -1.04, 'Pure hype adjective.', '纯粹夸大形容词。'),
          cand('system', 2.45, 0.14, 'Closer to engineering, still misses RL.', '偏工程表述，但未触及训练。'),
          cand('agent', 2.15, 0.44, 'High reward concept buried in tail.', '高价值概念被埋在长尾中。'),
        ]),
        tok(
          'templates',
          4.05,
          -0.88,
          'Hallucinates brittle template packaging as real agent capability.',
          '将脆弱模板拼装幻觉为真实智能体能力。',
          [
            cand('agents', 2.4, 0.92, 'Multi-turn tool-using policies favored by GRPO.', 'GRPO 偏好的多轮工具智能体目标。'),
            cand('wrappers', 3.45, -0.96, 'Explicitly penalized buzzword.', '被奖励模型明确惩罚的热词。'),
            cand('hacks', 2.9, -1.14, 'Unreliable prototype framing.', '不可靠原型表述。'),
            cand('pipelines', 2.15, 0.18, 'Neutral infra term.', '中性基础设施词。'),
          ],
          { hallucination: true },
        ),
        tok('that', 4.5, 0.02, 'Standard relative clause connector.', '常规关系从句连接词。', [
          cand('which', 3.0, -0.03, 'More formal connector.', '偏书面连接词。'),
          cand('and', 2.6, -0.05, 'Serializes claim rather than qualifying it.', '并列连接，未作限定。'),
          cand('to', 2.1, -0.09, 'Shifts into purpose clause.', '转向目的状语。'),
          cand('always', 1.6, -0.78, 'Overclaiming quantifier.', '过度承诺修饰词。'),
        ]),
        tok(
          'look',
          3.85,
          -0.82,
          'Optimizes for surface appearance instead of verifiable execution outcomes.',
          '优化表面观感而非可验证的执行结果。',
          [
            cand('hold', 2.2, 0.84, 'Grounded robustness verb ignored by π₀.', '被 π₀ 忽略的稳健性动词。'),
            cand('seem', 3.3, -0.74, 'Equally evasive perceptual verb.', '同样回避实证的感官动词。'),
            cand('sound', 2.85, -0.66, 'Rhetorical polish over empirical checks.', '侧重修辞而非实测。'),
            cand('feel', 2.4, -0.59, 'Subjective impression metric.', '主观体验指标。'),
          ],
          { hallucination: true },
        ),
        tok(
          'flashy',
          4.15,
          -1.18,
          'KL spike token: strong positive base logit paired with severe negative outcome reward.',
          'KL 尖峰词元：基座给出高 logit，却触发严重负向结果奖励。',
          [
            cand('reliable', 2.35, 0.88, 'Production reliability target.', '面向生产可靠性的高奖励词。'),
            cand('viral', 3.5, -1.09, 'Social engagement bait.', '流量导向热词。'),
            cand('smart', 2.95, -0.54, 'Unquantifiable generic praise.', '不可量化的泛化褒义词。'),
            cand('autonomous', 2.5, -0.47, 'Unbounded claim without safety tiers.', '缺少风险分级的过度宣称。'),
          ],
          { hallucination: true },
        ),
        tok('in', 4.55, 0.01, 'Prepositional link into evaluation setting.', '引出测试场景的介词。', [
          cand('on', 3.1, 0.08, 'Leads toward concrete workloads.', '导向具体工作负载。'),
          cand('during', 2.4, -0.04, 'Temporal framing.', '时间限定词。'),
          cand('across', 1.9, 0.12, 'Multi-scenario framing.', '跨场景介词。'),
          cand('for', 1.5, -0.14, 'Audience framing.', '受众导向词。'),
        ]),
        tok(
          'cherry-picked',
          4.0,
          -1.26,
          'Direct benchmark-gaming hallucination penalized by trace-level reward.',
          '典型的挑选样本作弊表述，在轨迹级奖励中被重罚。',
          [
            cand('real', 2.25, 0.96, 'Real-world distribution rejected by base prior.', '被基座先验压低的真实分布词。'),
            cand('live', 2.7, 0.42, 'Live telemetry context.', '在线遥测场景词。'),
            cand('curated', 3.35, -0.82, 'Euphemism for cherry-picking.', '“精挑样本”的委婉同义词。'),
            cand('staged', 2.95, -1.05, 'Synthetic showcase environment.', '摆拍演示环境。'),
          ],
          { hallucination: true },
        ),
        tok(
          'demos',
          4.25,
          -1.31,
          'Final token collapses onto demo theater instead of real production work.',
          '句尾坍缩到演示剧场，偏离真实生产任务。',
          [
            cand('work', 2.1, 1.08, 'Verified production objective in π_GRPO.', 'π_GRPO 锁定的真实生产目标。'),
            cand('videos', 3.4, -1.15, 'Screen-recording theater.', '录屏演示词。'),
            cand('threads', 2.9, -1.08, 'Social media hype artifact.', '社交媒体宣传词。'),
            cand('decks', 2.3, -0.94, 'Slideware over deployed tools.', 'PPT 幻灯片话术。'),
          ],
          { hallucination: true },
        ),
      ],
      zh: [
        tok('我', 4.6, 0.04, '第一人称主语起点。', '第一人称主语起点。', [
          cand('我们', 3.0, -0.08, '淡化个人工程职责。', '淡化个人工程职责。'),
          cand('团队', 2.4, -0.16, '泛化机构主体。', '泛化机构主体。'),
          cand('模型', 1.9, -0.24, '丢失开发者视角。', '丢失开发者视角。'),
          cand('智能体', 1.5, -0.2, '忽略训练主体。', '忽略训练主体。'),
        ]),
        tok(
          '封装',
          4.0,
          -0.96,
          'Base prior prefers shallow prompt wrapping.',
          '基座权重偏爱浅层“封装”，遭到奖励模型负向惩罚。',
          [
            cand('训练', 2.45, 0.88, 'Core RL action suppressed by π₀.', '高奖励核心动作词，被 π₀ 先验压低。'),
            cand('搭建', 3.1, -0.28, 'Generic assembly verb.', '泛化搭建动词。'),
            cand('拼接', 2.85, -0.64, 'Fragile glue-code framing.', '脆弱胶水代码表述。'),
            cand('编排', 2.2, -0.35, 'Workflow-only phrasing.', '仅涉及工作流编排。'),
          ],
          { hallucination: true },
        ),
        tok('提示词', 4.1, -0.66, 'Substitutes prompt engineering for policy optimization.', '用提示词工程替代策略优化。', [
          cand('语言', 2.6, 0.72, 'Grounded domain concept.', '真实领域概念词。'),
          cand('万能', 3.15, -1.04, 'Overclaiming modifier.', '夸大修饰词。'),
          cand('对话', 2.4, -0.22, 'Narrow chat scope.', '窄对话场景词。'),
          cand('指令', 2.1, -0.14, 'Static instruction framing.', '静态指令表述。'),
        ]),
        tok(
          '模板，',
          4.05,
          -0.88,
          'Static templates lack multi-turn tool verification.',
          '静态模板缺少多轮工具调用与状态验证。',
          [
            cand('智能体，', 2.3, 0.94, 'Target policy abstraction.', '真实智能体抽象目标。'),
            cand('套壳，', 3.35, -1.08, 'Penalized buzzword.', '被直接惩罚的热词。'),
            cand('脚本，', 2.8, -0.58, 'Rigid automation.', '刚性脚本表述。'),
            cand('插件，', 2.1, -0.34, 'Shallow tool wrapper.', '浅层工具挂件。'),
          ],
          { hallucination: true },
        ),
        tok('在', 4.5, 0.02, 'Locative preposition.', '场景定位介词。', [
          cand('用', 2.9, -0.05, 'Instrumental framing.', '工具介词。'),
          cand('再', 2.5, 0.34, 'Leads to sequential verification.', '引导后续检验步骤。'),
          cand('对', 2.0, -0.06, 'Target object preposition.', '对象介词。'),
          cand('靠', 1.6, -0.38, 'Passive reliance.', '被动依赖表述。'),
        ]),
        tok(
          '精心挑选的',
          3.95,
          -1.22,
          'KL spike: cherry-picked evaluation bias.',
          'KL 散度尖峰：样本挑选偏差触发强惩罚。',
          [
            cand('真实', 2.2, 0.95, 'Real production distribution.', '真实生产分布。'),
            cand('公开', 2.8, -0.25, 'Public static set only.', '仅限公开静态集。'),
            cand('完美', 3.3, -1.12, 'Unrealistic claim.', '失真宣称。'),
            cand('理想', 2.95, -0.84, 'Non-adversarial assumption.', '非对抗理想假设。'),
          ],
          { hallucination: true },
        ),
        tok(
          '演示里',
          4.15,
          -1.18,
          'Optimizes for staged demos rather than live traces.',
          '面向舞台演示而非线上真实轨迹。',
          [
            cand('工作中', 2.15, 1.04, 'Grounded production environment.', '真实工作环境目标。'),
            cand('视频里', 3.3, -1.06, 'Pre-recorded showcase.', '预录制展示。'),
            cand('榜单上', 2.9, -0.62, 'Leaderboard overfitting.', '刷榜导向。'),
            cand('截图中', 2.45, -1.14, 'Static screenshot cherry-pick.', '静态截图挑选。'),
          ],
          { hallucination: true },
        ),
        tok('显得', 3.9, -0.78, 'Focuses on appearance over robustness.', '强调“看起来如何”而非系统稳定性。', [
          cand('是否', 2.3, 0.78, 'Boolean verification question.', '可证伪布尔检验。'),
          cand('表现得', 3.15, -0.52, 'Subjective impression.', '主观表现措辞。'),
          cand('看起来', 2.95, -0.86, 'Cosmetic phrasing.', '表面修饰词。'),
          cand('运行得', 2.2, 0.16, 'Operational verb.', '运行状态动词。'),
        ]),
        tok('很', 4.35, -0.42, 'Uncalibrated intensifier.', '无量化依据的程度副词。', [
          cand('能', 2.6, 0.38, 'Capability predicate.', '能力谓词。'),
          cand('非常', 3.4, -0.48, 'Empty hype booster.', '空洞夸大副词。'),
          cand('足够', 2.4, 0.08, 'Threshold qualifier.', '阈值限定词。'),
          cand('极其', 2.0, -0.72, 'Extreme overclaim.', '极端夸大词。'),
        ]),
        tok(
          '花哨。',
          4.2,
          -1.3,
          'Terminal hallucination token with maximum reward penalty.',
          '句末幻觉词元，触发最大负向奖励惩罚。',
          [
            cand('站得住。', 2.05, 1.12, 'Verified resilience anchor in π_GRPO.', 'π_GRPO 锁定的真实稳健终点。'),
            cand('炫酷。', 3.55, -1.24, 'Purely cosmetic demo hype.', '纯粹浮夸演示话术。'),
            cand('惊艳。', 3.1, -1.15, 'Marketing superlative.', '营销最高级形容词。'),
            cand('智能。', 2.55, -0.58, 'Vague unmeasured claim.', '未经评测的空泛宣称。'),
          ],
          { hallucination: true },
        ),
      ],
    },
  },

  pi_sft: {
    id: 'pi_sft',
    badge: 'π_SFT',
    label: { en: 'Instruction Tuned', zh: '指令微调' },
    rewardCode: 'R = +0.42 · SAFE / PASSIVE',
    rewardTone: 'neutral',
    summary: {
      en: 'Supervised fine-tuning eliminates base hallucinations, but stays passive on static corpora and scripted checks.',
      zh: '监督微调消除了基座幻觉，但仍停留在静态语料与脚本化评测的保守表述中。',
    },
    ledgerStatus: {
      en: 'SAFE BUT PASSIVE · NO CLOSED-LOOP RL VERIFICATION',
      zh: '安全但保守 · 缺少闭环强化学习实证',
    },
    ledgerChips: {
      en: ['Static corpus priors', '0 multi-turn rollouts', 'Advantage plateaus at +0.42'],
      zh: ['静态语料先验', '0 次多轮轨迹交互', '奖励优势停滞在 +0.42'],
    },
    tokens: {
      en: [
        tok('I', 4.7, 0.05, 'Consistent autobiographical subject.', '一致的第一人称主语。', [
          cand('We', 3.0, -0.05, 'Dilutes individual ownership.', '稀释个人责任归属。'),
          cand('My', 2.3, -0.11, 'Possessive framing.', '物主代词开头。'),
          cand('Team', 1.7, -0.18, 'Generic org prefix.', '泛化团队前缀。'),
          cand('One', 1.2, -0.24, 'Overly detached.', '过度疏离措辞。'),
        ]),
        tok('fine-tune', 4.15, 0.16, 'Safe SFT textbook verb; avoids RL trajectory exploration.', '标准教科书微调动词，回避强化学习轨迹探索。', [
          cand('train', 3.45, 0.62, 'Broader RL + CPT framing.', '涵盖 CPT 与 RL 的更强训练动作。'),
          cand('adapt', 2.65, 0.08, 'Narrow domain adaptation.', '窄域适配词。'),
          cand('align', 2.2, 0.24, 'Preference alignment framing.', '偏好对齐表述。'),
          cand('prompt', 1.5, -0.45, 'Insufficient for complex tool use.', '不足以支撑复杂工具调用。'),
        ]),
        tok('language', 4.5, 0.18, 'Domain-accurate noun learned during SFT.', '微调阶段稳定习得的领域名词。', [
          cand('large', 3.1, 0.04, 'Generic scale modifier.', '泛化规模修饰词。'),
          cand('foundation', 2.5, 0.09, 'Broad upstream term.', '宽泛基础模型词。'),
          cand('chat', 1.9, -0.28, 'Limits scope to dialogue.', '局限于闲聊场景。'),
          cand('reasoning', 1.6, 0.21, 'Partial capability slice.', '单一推理切面。'),
        ]),
        tok('models', 4.2, -0.06, 'Treats output as passive text predictor rather than acting agent.', '仍停留在被动语言模型视角，而非多轮行动智能体。', [
          cand('agents', 3.35, 0.74, 'Active multi-turn tool callers.', '具备多轮工具调用能力的智能体。'),
          cand('systems', 2.8, 0.22, 'Broader system view.', '较宽泛的系统视角。'),
          cand('weights', 2.1, -0.12, 'Pure parameter focus.', '仅关注权重本身。'),
          cand('assistants', 1.7, -0.09, 'Generic helper label.', '通用助手标签。'),
        ]),
        tok('on', 4.6, 0.02, 'Standard preposition before dataset clause.', '引出训练/评测对象。', [
          cand('with', 3.0, 0.04, 'Instrumental connector.', '工具连接词。'),
          cand('for', 2.5, -0.03, 'Purpose connector.', '目的连接词。'),
          cand('using', 2.1, 0.01, 'Methodological phrasing.', '方法论介词。'),
          cand('across', 1.6, 0.14, 'Multi-domain preposition.', '跨场景介词。'),
        ]),
        tok('static', 4.05, -0.24, 'SFT preference for clean offline corpora limits dynamic tool handling.', '偏爱干净的离线静态语料，限制了对动态工具池的适应。', [
          cand('real', 3.1, 0.78, 'Live production noise and edge cases.', '真实生产噪声与长尾边界。'),
          cand('curated', 3.4, -0.12, 'Still offline and pre-cleaned.', '仍属于离线预清洗语料。'),
          cand('clean', 2.6, -0.21, 'Avoids production ambiguity.', '回避生产环境歧义。'),
          cand('public', 2.0, -0.35, 'Benchmarks already leaked in pretraining.', '易与预训练数据重叠。'),
        ]),
        tok('datasets', 4.25, -0.18, 'Static QA pairs instead of multi-turn operational traces.', '静态问答对，而非多轮真实操作轨迹。', [
          cand('workloads', 3.05, 0.66, 'Live business execution tasks.', '真实业务执行负载。'),
          cand('corpora', 3.25, -0.14, 'Academic synonym.', '学术语料同义词。'),
          cand('examples', 2.5, -0.22, 'Few-shot framing.', '少样本示例表述。'),
          cand('splits', 1.9, -0.19, 'Train/test split focus.', '数据集切分视角。'),
        ]),
        tok('and', 4.65, 0.01, 'Conjunction bridging training to evaluation.', '连接训练与评测的并列连词。', [
          cand('then', 2.9, 0.28, 'Causal verification sequence.', '强调“先训练后检验”的因果序。'),
          cand('with', 2.4, -0.02, 'Bundled modifier.', '伴随连接词。'),
          cand('plus', 1.7, -0.14, 'Informal additive.', '非正式并列词。'),
          cand('before', 1.4, 0.15, 'Ordering constraint.', '先后约束词。'),
        ]),
        tok('scripted', 4.0, -0.29, 'Scripted assertions miss emergent multi-turn misoperations.', '脚本化断言难以捕捉多轮交互中的隐性误操作。', [
          cand('production', 3.0, 0.76, 'Real operational risk surfaces.', '真实生产风险面。'),
          cand('offline', 3.35, -0.22, 'Decoupled from live state.', '与线上状态脱耦。'),
          cand('unit', 2.55, -0.16, 'Tests isolated components only.', '仅覆盖孤立单元测试。'),
          cand('automated', 2.2, 0.06, 'Generic automation label.', '泛自动化标签。'),
        ]),
        tok('evals', 4.3, 0.08, 'Respectable baseline discipline, yet stops short of real work.', '具备基础评测意识，但尚未触及真实业务考验。', [
          cand('work', 3.1, 0.89, 'Full end-to-end real work target.', '端到端真实工作检验目标。'),
          cand('benchmarks', 3.55, 0.12, 'Useful proxy, not sufficient alone.', '有价值的代理指标，但仍非终局。'),
          cand('metrics', 2.65, 0.04, 'Abstract metric layer.', '抽象指标层。'),
          cand('tests', 2.1, -0.06, 'Generic software test framing.', '通用测试表述。'),
        ]),
      ],
      zh: [
        tok('我', 4.7, 0.05, 'Consistent subject.', '一致的第一人称主语。', [
          cand('我们', 3.0, -0.05, 'Shared subject.', '团队主体。'),
          cand('团队', 2.3, -0.14, 'Org subject.', '机构主体。'),
          cand('模型', 1.8, -0.22, 'Passive subject.', '被动主体。'),
          cand('作者', 1.2, -0.26, 'Third-person tone.', '第三人称口吻。'),
        ]),
        tok('在', 4.6, 0.02, 'Prepositional opener.', '场景前置介词。', [
          cand('用', 2.9, -0.04, 'Instrumental prefix.', '工具前置词。'),
          cand('对', 2.4, -0.02, 'Target prefix.', '对象前置词。'),
          cand('围绕', 1.9, 0.04, 'Topic framing.', '主题限定词。'),
          cand('通过', 1.5, 0.08, 'Method prefix.', '方法介词。'),
        ]),
        tok('静态', 4.05, -0.24, 'Over-relies on fixed offline datasets.', '过度依赖固定离线数据分布。', [
          cand('真实', 3.15, 0.82, 'Dynamic production workloads.', '动态真实工作负载。'),
          cand('标准', 3.3, -0.12, 'Generic benchmark label.', '常规标准集标签。'),
          cand('公开', 2.6, -0.28, 'Risk of pretraining contamination.', '存在预训练污染风险。'),
          cand('精选', 2.1, -0.34, 'Lacks noisy long tail.', '缺少真实长尾噪声。'),
        ]),
        tok('数据集', 4.2, -0.16, 'Text pairs lack interactive tool state.', '静态文本对缺少交互式工具状态。', [
          cand('环境中', 2.95, 0.72, 'Interactive tool environment.', '交互式工具环境。'),
          cand('语料库', 3.35, -0.14, 'Corpus-only framing.', '纯语料库视角。'),
          cand('样本集', 2.5, -0.18, 'Static sample set.', '静态样本集合。'),
          cand('问答对', 2.0, -0.32, 'Single-turn QA limit.', '局限于单轮问答。'),
        ]),
        tok('与', 4.55, 0.01, 'Balanced conjunction.', '中性并列连词。', [
          cand('和', 3.4, 0.0, 'Colloquial conjunction.', '口语化并列词。'),
          cand('再', 2.7, 0.34, 'Sequential verification.', '引导后续实证。'),
          cand('或', 1.8, -0.12, 'Disjunctive ambiguity.', '弱化确定性。'),
          cand('以及', 2.3, 0.01, 'Formal conjunction.', '书面并列词。'),
        ]),
        tok('脚本化', 4.0, -0.28, 'Fixed assertions miss multi-turn drift.', '固定断言难以捕捉多轮漂移。', [
          cand('线上', 3.05, 0.74, 'Real production verification.', '真实线上验证。'),
          cand('自动化', 3.35, 0.04, 'Useful engineering baseline.', '常规自动化基线。'),
          cand('离线', 2.65, -0.22, 'Decoupled from live tools.', '与实时工具脱节。'),
          cand('规则', 2.1, -0.31, 'Rigid regex checks.', '刚性规则匹配。'),
        ]),
        tok('评测上', 4.15, 0.06, 'Tests compliance, not real operational edge cases.', '验证基础合规性，尚未检验真实业务长尾。', [
          cand('工作中', 3.0, 0.86, 'End-to-end production test.', '端到端真实工作验证。'),
          cand('基准上', 3.4, 0.1, 'Internal dual-axis benchmark.', '内部双轴基准。'),
          cand('指标上', 2.5, -0.04, 'Single scalar focus.', '单一标量指标。'),
          cand('任务上', 2.1, 0.22, 'Task-level evaluation.', '任务级评测。'),
        ]),
        tok('微调', 4.2, 0.14, 'Conservative SFT update without RL reward shaping.', '保守的监督微调，缺少 RL 奖励塑形。', [
          cand('训练', 3.35, 0.64, 'Full CPT + SFT + GRPO stack.', '覆盖 CPT + SFT + GRPO 全栈。'),
          cand('对齐', 2.7, 0.32, 'Preference alignment step.', '偏好对齐步骤。'),
          cand('优化', 2.2, 0.18, 'General optimization.', '通用优化动作。'),
          cand('调优', 1.7, -0.08, 'Hyperparameter connotation.', '偏调参语义。'),
        ]),
        tok('语言', 4.5, 0.16, 'Core modality noun.', '核心模态名词。', [
          cand('大', 3.2, 0.04, 'Scale modifier.', '规模前缀。'),
          cand('通用', 2.5, -0.06, 'Unfocused domain scope.', '领域聚焦不足。'),
          cand('对话', 1.9, -0.26, 'Chat-only scope.', '仅限对话范围。'),
          cand('推理', 1.6, 0.22, 'Reasoning sub-slice.', '推理能力切面。'),
        ]),
        tok('模型。', 4.3, -0.04, 'Stops at static model weights instead of tool-using agent.', '止步于静态模型权重，而非动态工具智能体。', [
          cand('智能体。', 3.25, 0.88, 'Agentic system executing tools.', '执行真实工具的智能体。'),
          cand('系统。', 2.75, 0.28, 'System-level abstraction.', '系统级抽象。'),
          cand('基座。', 2.1, -0.1, 'Upstream base layer.', '上游基座层。'),
          cand('助手。', 1.7, -0.12, 'Passive assistant role.', '被动助手定位。'),
        ]),
      ],
    },
  },

  pi_grpo: {
    id: 'pi_grpo',
    badge: 'π_GRPO',
    label: { en: 'RL Policy · Ours', zh: 'RL 策略 · 当前策略' },
    rewardCode: 'R = +2.65 · ILLUSTRATIVE',
    rewardTone: 'verified',
    summary: {
      en: 'GRPO group-relative advantage locks onto verifiable engineering claims and production telemetry.',
      zh: 'GRPO 组相对优势锁定可验证的工程主张与真实生产数据。',
    },
    ledgerStatus: {
      en: 'ILLUSTRATIVE POLICY REWARD · RÉSUMÉ FIGURES SHOWN AS CHIPS',
      zh: '示意策略奖励 · 芯片为简历事实',
    },
    ledgerChips: {
      en: ['≈90% fewer misoperations', '100+ tools', '530 samples', 'R = +2.65 · ILLUSTRATIVE'],
      zh: ['误操作约减少 90%', '100+ 工具', '530 条样本', 'R = +2.65 · 示意'],
    },
    tokens: {
      en: [
        tok('I', 4.9, 0.12, 'Direct builder accountability without corporate hedging.', '直接承担工程责任的第一人称主语。', [
          cand('We', 3.0, -0.14, 'Diffuses ownership across unnamed teams.', '模糊具体负责人。'),
          cand('Our', 2.2, -0.22, 'Agency marketing cadence.', '偏商业机构宣传口吻。'),
          cand('AI', 1.6, -0.68, 'Removes the engineer from the loop.', '将算法工程师移出闭环。'),
          cand('Agents', 1.1, -0.36, 'Skips who trains and verifies them.', '略去训练与评测责任人。'),
        ]),
        tok(
          'train',
          4.45,
          0.92,
          'Captures the full post-training stack: continual pretraining, SFT, and GRPO.',
          '囊括完整后训练栈：持续预训练、SFT 与 GRPO 强化学习。',
          [
            cand('fine-tune', 3.4, 0.24, 'Too narrow; omits CPT and RL policy optimization.', '过于狭隘，遗漏 CPT 与 RL 策略优化。'),
            cand('prompt', 2.55, -0.78, 'Penalized: brittle without weight updates.', '负向优势：缺少参数更新，难以稳定长链条。'),
            cand('wrap', 1.75, -1.04, 'Rejected hallucination: zero modeling depth.', '高惩罚拒绝词：无模型能力构建。'),
            cand('deploy', 2.9, 0.31, 'Deployment alone omits optimization loop.', '仅部署而未体现优化闭环。'),
          ],
          { workIds: ['supply-chain-domain-llm', 'multi-objective-attribute-rl'] },
        ),
        tok(
          'language',
          4.7,
          0.44,
          'Anchors domain specialization (supply-chain CPT & dual-axis QA + tool eval).',
          '锚定领域专精底座（供应链持续预训练与双轴评测）。',
          [
            cand('large', 3.15, 0.06, 'Scale adjective without functional specificity.', '泛规模词，缺少能力指向。'),
            cand('chat', 2.2, -0.52, 'Too narrow for tool-augmented workflows.', '无法覆盖多工具工作流。'),
            cand('coding', 2.5, 0.11, 'Misaligns with supply-chain & memory scope.', '与供应链与长程记忆主线偏离。'),
            cand('autonomous', 1.9, -0.64, 'Overclaims safety without risk tiers.', '缺少风险分级约束的过度宣称。'),
          ],
          { workIds: ['supply-chain-domain-llm', 'm365-copilot-memory'] },
        ),
        tok(
          'agents,',
          4.35,
          0.98,
          'Commits to multi-turn tool-using policies across 100+ dynamic tools and 12 scenarios.',
          '明确指向在 100+ 动态工具与 12 个场景中执行多轮决策的智能体。',
          [
            cand('models,', 3.35, 0.18, 'Static text predictor; misses multi-turn action loop.', '静态文本模型，缺失多轮行动闭环。'),
            cand('wrappers,', 1.65, -1.16, 'Strongly rejected by outcome verifier.', '被结果验证器强力拒绝的套壳词。'),
            cand('copilots,', 2.8, 0.29, 'Narrower product framing.', '偏向特定产品形态。'),
            cand('systems,', 2.45, 0.36, 'Less specific than RL-trained agents.', '不如“智能体”精准体现策略交互。'),
          ],
          { workIds: ['supply-chain-agent-system', 'dynamic-tool-resolution', 'multi-objective-attribute-rl'] },
        ),
        tok('then', 4.65, 0.56, 'Enforces strict sequence: training is incomplete until empirical verification.', '强调严格因果序：未经实证检验的训练不算完成。', [
          cand('and', 3.6, 0.14, 'Weakens causal priority into mere conjunction.', '将因果顺序弱化为普通并列。'),
          cand('to', 2.75, 0.08, 'Conflates training and evaluation phases.', '混淆训练与评测阶段。'),
          cand('before', 2.15, -0.31, 'Inverts workflow order.', '倒置动作时序。'),
          cand('while', 1.85, -0.19, 'Loses clean post-hoc audit separation.', '弱化独立离线/线上审计边界。'),
        ]),
        tok(
          'measure',
          4.2,
          0.94,
          'High-entropy pivot token: GRPO pushes measurable verification over vague testing.',
          '高熵关键转折词：GRPO 将可量化实证推至首位，压低泛化测试词。',
          [
            cand('evaluate', 3.55, 0.41, 'Strong runner-up; slightly more passive than measure.', '强竞争候选词，但“measure”更具实证量化感。'),
            cand('test', 3.05, 0.18, 'Narrow software check framing.', '偏向传统软件单测语境。'),
            cand('ship', 2.25, -0.34, 'Ships unverified capabilities.', '跳过测量直接上线，存在风险惩罚。'),
            cand('hype', 1.15, -1.12, 'Rejected marketing hallucination.', '高惩罚拒绝的夸大宣传词。'),
          ],
          { workIds: ['supply-chain-domain-llm', 'm365-copilot-memory', 'supchain-bench'] },
        ),
        tok(
          'whether',
          4.55,
          0.48,
          'Frames evaluation as falsifiable empirical test rather than guaranteed success.',
          '将评测设为可证伪的客观检验，而非预设成功。',
          [
            cand('how', 3.45, 0.19, 'Presupposes success rather than testing failure modes.', '默认已经成功，忽视失败率检验。'),
            cand('that', 2.5, -0.44, 'Biased presupposition.', '预设结论偏差。'),
            cand('if', 3.05, 0.28, 'Valid alternative; slightly less formal.', '语义相近的口语替代词。'),
            cand('why', 1.9, -0.12, 'Post-hoc diagnostic without pass/fail gate.', '偏归因分析，缺少通过/失败门槛。'),
          ],
          { workIds: ['m365-copilot-memory'] },
        ),
        tok('they', 4.85, 0.11, 'Clean anaphora referring back to trained language agents.', '清晰回指前文的语言智能体集群。', [
          cand('those', 2.75, -0.09, 'Distancing demonstrative.', '疏离指代词。'),
          cand('agents', 2.35, -0.14, 'Redundant repetition.', '重复名词降低紧凑度。'),
          cand('models', 1.85, -0.21, 'Drifts back to passive model framing.', '回退到静态模型称谓。'),
          cand('it', 1.25, -0.48, 'Number agreement error.', '单复数一致错误。'),
        ]),
        tok(
          'hold',
          4.4,
          0.79,
          'Captures failure resistance under multi-turn compounding risk (≈90% fewer misoperations).',
          '准确表达多轮累积风险下的系统承压与抗失效能力。',
          [
            cand('stand', 3.3, 0.32, 'Closest semantic neighbor.', '语义最接近的候选词。'),
            cand('scale', 2.85, 0.08, 'Overused infra buzzword.', '泛基础设施热词。'),
            cand('last', 2.2, 0.14, 'Temporal only, misses operational stress.', '偏时间持久，缺少高风险稳健感。'),
            cand('shine', 1.35, -0.96, 'Demo theater vocabulary penalized.', '演示浮夸词汇，遭负向惩罚。'),
          ],
          { workIds: ['supply-chain-agent-system'] },
        ),
        tok(
          'up',
          4.8,
          0.31,
          'Completes idiomatic phrasal verb "hold up" under real-world pressure.',
          '与“hold”构成完整习惯搭配，突出真实承压状态。',
          [
            cand('out', 2.85, -0.22, 'Implies bare survival rather than correctness.', '偏“勉强撑住”，弱化准确性。'),
            cand('on', 2.3, -0.34, 'Shifts phrasal meaning.', '改变短语语义。'),
            cand('back', 1.65, -0.62, 'Opposite operational sense.', '反向语义。'),
            cand('steady', 2.55, 0.18, 'Workable alternative.', '可行替代词。'),
          ],
          { workIds: ['supply-chain-agent-system'] },
        ),
        tok('on', 4.75, 0.14, 'Preposition grounding claims directly onto operational workloads.', '将主张直接锚定到真实工作负载。', [
          cand('in', 3.55, 0.11, 'Viable locative alternative.', '合理的场所介词替代。'),
          cand('under', 2.8, 0.19, 'Stresses load pressure.', '强调负载压力。'),
          cand('during', 2.1, -0.08, 'Limits to temporal window.', '局限于时间维度。'),
          cand('for', 1.7, -0.18, 'Weakens empirical rigor.', '弱化实证严密性。'),
        ]),
        tok(
          'real',
          4.3,
          1.02,
          'Grounds evaluation in SupChain-Bench (530 samples) and live 12-scenario rollouts.',
          '锚定真实样本集（SupChain-Bench 530 样本）与 12 个生产场景。',
          [
            cand('actual', 3.4, 0.54, 'Strong synonym, slightly heavier rhythm.', '相近同义词，节奏略重。'),
            cand('synthetic', 2.2, -0.78, 'Penalized: synthetic benchmarks hide real failure modes.', '负向惩罚：纯合成数据掩盖真实失效模式。'),
            cand('static', 1.95, -0.84, 'Rejected SFT comfort zone.', '被拒绝的静态舒适区表述。'),
            cand('toy', 1.3, -1.18, 'Trivialized evaluation domain.', '玩具级评测场景。'),
          ],
          { workIds: ['supply-chain-agent-system', 'dynamic-tool-resolution', 'supchain-bench'] },
        ),
        tok(
          'work',
          4.45,
          1.14,
          'Maximum GAE advantage anchor: closes the thesis on measurable real-world utility.',
          '全局最高 GAE 优势收束词元：将主张落在真实可衡量的工作价值上。',
          [
            cand('tasks', 3.5, 0.48, 'Good operational unit, narrower than full work.', '偏离散任务，涵盖面窄于“work”。'),
            cand('data', 2.75, 0.12, 'Passive data view.', '静态数据视角。'),
            cand('benchmarks', 2.4, 0.06, 'Proxy metric rather than production impact.', '代理指标，非真实业务影响。'),
            cand('demos', 1.2, -1.28, 'Maximum RL penalty for demo-only optimization.', '面向纯演示优化的最高惩罚拒绝词。'),
          ],
          { workIds: ['supply-chain-agent-system', 'dynamic-tool-resolution', 'supchain-bench'] },
        ),
      ],
      zh: [
        tok('我', 4.9, 0.12, 'Direct builder ownership.', '直接承担算法与系统职责的第一人称。', [
          cand('我们', 3.0, -0.14, 'Dilutes personal ownership.', '模糊个人工程责任。'),
          cand('团队', 2.2, -0.22, 'Org-level framing.', '泛化团队前缀。'),
          cand('AI', 1.6, -0.66, 'Drops human accountability.', '抽离工程师主体。'),
          cand('系统', 1.2, -0.34, 'Skips training ownership.', '跳过训练者角色。'),
        ]),
        tok(
          '训练',
          4.45,
          0.94,
          'Encompasses CPT, SFT, and GRPO optimization.',
          '覆盖持续预训练、SFT 与 GRPO 多目标强化学习。',
          [
            cand('微调', 3.4, 0.24, 'Omits CPT and RL stages.', '遗漏 CPT 与 RL 训练阶段。'),
            cand('提示', 2.4, -0.78, 'Brittle without weight updates.', '缺少参数更新，难以稳定工具调用。'),
            cand('封装', 1.65, -1.06, 'Penalized shallow wrapping.', '高惩罚拒绝的浅层套壳词。'),
            cand('部署', 2.85, 0.28, 'Deployment without training loop.', '仅体现上线，缺少算法闭环。'),
          ],
          { workIds: ['supply-chain-domain-llm', 'multi-objective-attribute-rl'] },
        ),
        tok(
          '语言',
          4.65,
          0.44,
          'Domain language foundation.',
          '锚定领域语言模型底座与长程上下文能力。',
          [
            cand('大', 3.2, 0.06, 'Generic scale prefix.', '泛化规模修饰词。'),
            cand('对话', 2.1, -0.54, 'Too narrow for multi-tool actions.', '局限于聊天交互。'),
            cand('代码', 2.45, 0.1, 'Shifts away from logistics domain.', '偏离供应链领域主线。'),
            cand('通用', 1.85, -0.32, 'Lacks domain specialization.', '缺少领域专精深度。'),
          ],
          { workIds: ['supply-chain-domain-llm', 'm365-copilot-memory'] },
        ),
        tok(
          '智能体，',
          4.35,
          0.98,
          'Multi-turn tool-using policies across 100+ tools.',
          '面向 100+ 动态工具与多轮风险分级决策的智能体。',
          [
            cand('模型，', 3.35, 0.18, 'Static predictor only.', '静态预测模型，缺少工具闭环。'),
            cand('套壳，', 1.55, -1.16, 'Rejected wrapper buzzword.', '被奖励模型拦截的套壳表述。'),
            cand('助手，', 2.7, 0.22, 'Narrower passive framing.', '偏被动助手角色。'),
            cand('系统，', 2.4, 0.34, 'Less explicit on policy learning.', '未突出策略交互性。'),
          ],
          { workIds: ['supply-chain-agent-system', 'dynamic-tool-resolution', 'multi-objective-attribute-rl'] },
        ),
        tok('再', 4.65, 0.56, 'Strict verification sequence after training.', '强化“先训练，再实证检验”的严格工程次序。', [
          cand('并', 3.5, 0.14, 'Weaker causal link.', '因果约束弱于“再”。'),
          cand('同时', 2.7, 0.08, 'Blurs train/eval separation.', '模糊训练与独立评测边界。'),
          cand('直接', 2.0, -0.46, 'Skips intermediate validation.', '跳过中间验证门槛。'),
          cand('偶尔', 1.2, -0.82, 'Non-systematic check.', '缺少系统性验证。'),
        ]),
        tok(
          '检验',
          4.2,
          0.96,
          'High-entropy pivot favoring falsifiable verification.',
          '高熵关键转折词：偏好可证伪的实证检验而非形式评测。',
          [
            cand('评测', 3.55, 0.44, 'Close runner-up; benchmark-oriented.', '强竞争候选词，偏基准测试语境。'),
            cand('测试', 3.0, 0.18, 'Software unit-test scope.', '偏工程单测语境。'),
            cand('发布', 2.15, -0.42, 'Ships without empirical gate.', '未设验证门槛直接发布。'),
            cand('展示', 1.25, -1.14, 'Penalized demo theater.', '遭惩罚的演示作秀动词。'),
          ],
          { workIds: ['supply-chain-domain-llm', 'm365-copilot-memory', 'supchain-bench'] },
        ),
        tok('它们', 4.8, 0.11, 'Refers directly to trained agents.', '清晰回指前文训练出的语言智能体。', [
          cand('模型', 2.8, -0.18, 'Drifts back to passive model.', '回退到静态模型指代。'),
          cand('系统', 2.35, 0.04, 'Broader system pronoun.', '较宽泛系统代词。'),
          cand('结果', 1.9, -0.26, 'Evaluates final string, not trace.', '只看最后输出而忽视轨迹。'),
          cand('它', 1.35, -0.44, 'Singular pronoun mismatch.', '单复数指代不匹配。'),
        ]),
        tok('在', 4.75, 0.14, 'Locative anchor onto real work.', '锚定到真实运行环境。', [
          cand('对', 3.1, 0.06, 'Target framing.', '对象导向介词。'),
          cand('于', 2.4, -0.04, 'Literary preposition.', '书面介词。'),
          cand('面对', 2.75, 0.22, 'Confrontation framing.', '突出应对复杂度。'),
          cand('离开', 1.1, -0.92, 'Opposite framing.', '反向语义。'),
        ]),
        tok(
          '真实',
          4.3,
          1.02,
          'Grounded in 530 SupChain-Bench samples & 12 live scenarios.',
          '锚定 SupChain-Bench 530 条真实样本与 12 个生产场景。',
          [
            cand('实际', 3.45, 0.56, 'Strong practical synonym.', '相近实用同义词。'),
            cand('合成', 2.15, -0.78, 'Synthetic data hides edge failure.', '纯合成数据掩盖长尾失效。'),
            cand('静态', 1.9, -0.86, 'Rejected offline comfort zone.', '被拒绝的静态评测舒适区。'),
            cand('理想', 1.35, -1.16, 'Idealized distribution penalty.', '理想化分布惩罚词。'),
          ],
          { workIds: ['supply-chain-agent-system', 'dynamic-tool-resolution', 'supchain-bench'] },
        ),
        tok(
          '工作中',
          4.4,
          1.08,
          'Connects directly to production supply-chain & memory workflows.',
          '直连供应链多轮履约、工具调度与邮件记忆真实工作流。',
          [
            cand('任务中', 3.45, 0.48, 'Narrower unit-task scope.', '窄于完整生产工作流。'),
            cand('榜单上', 2.55, -0.18, 'Proxy leaderboard focus.', '代理榜单视角。'),
            cand('数据集上', 2.1, -0.34, 'Offline dataset scope.', '离线数据集视角。'),
            cand('演示里', 1.2, -1.24, 'Maximum demo penalty.', '演示作秀最高惩罚。'),
          ],
          { workIds: ['supply-chain-agent-system', 'dynamic-tool-resolution', 'supchain-bench'] },
        ),
        tok(
          '是否',
          4.55,
          0.48,
          'Keeps an explicit pass/fail falsifiability gate.',
          '保留可证伪的通过/失败检验门槛。',
          [
            cand('如何', 3.35, 0.16, 'Assumes baseline success.', '隐含默认成功的前提。'),
            cand('能否', 3.05, 0.31, 'Viable capability phrasing.', '相近能力判断词。'),
            cand('一定', 1.75, -0.74, 'Unfalsifiable certainty.', '不可证伪的绝对断言。'),
            cand('足够', 2.25, 0.12, 'Threshold qualifier.', '阈值限定词。'),
          ],
          { workIds: ['m365-copilot-memory'] },
        ),
        tok(
          '站得住。',
          4.45,
          1.14,
          'RL-verified resilience anchor (≈90% fewer misoperations).',
          'RL 实证稳健收束词：对应误操作约减少 90% 的真实可靠性。',
          [
            cand('有效。', 3.45, 0.44, 'Correct but lacks stress-test weight.', '语义正确，但缺少抗压稳健感。'),
            cand('达标。', 2.9, 0.26, 'Minimum compliance bar.', '仅体现最低及格线。'),
            cand('跑通。', 2.35, -0.18, 'Prototype-level bar only.', '仅代表原型能跑通，非生产级稳健。'),
            cand('惊艳。', 1.15, -1.28, 'Rejected hype superlative.', '遭最高负向惩罚的营销夸大词。'),
          ],
          { workIds: ['supply-chain-agent-system'] },
        ),
      ],
    },
  },
};

function computeStepDistribution(token, temperature) {
  const safeT = Math.max(0.1, Math.min(1.4, temperature));
  const raw = [
    {
      ...token,
      isChosen: true,
      candIdx: 0,
    },
    ...token.rejected.map((item, idx) => ({
      ...item,
      isChosen: false,
      candIdx: idx + 1,
      hallucination: false,
    })),
  ];

  const scaled = raw.map((item) => item.logit / safeT);
  const maxScaled = Math.max(...scaled);
  const exps = scaled.map((v) => Math.exp(v - maxScaled));
  const sumExp = exps.reduce((acc, v) => acc + v, 0);
  const probs = exps.map((v) => v / sumExp);

  let entropy = 0;
  for (const p of probs) {
    if (p > 1e-12) entropy -= p * Math.log2(p);
  }

  const enriched = raw.map((item, idx) => ({
    ...item,
    prob: probs[idx],
  }));

  const chosen = enriched[0];
  const rejectedSorted = enriched.slice(1).sort((a, b) => b.prob - a.prob);
  const top5 = [...enriched].sort((a, b) => b.prob - a.prob);

  return { chosen, rejectedSorted, top5, entropy };
}

function fmtSigned(num, digits = 2) {
  const rounded = Number(num.toFixed(digits));
  if (rounded > 0) return `+${rounded.toFixed(digits)}`;
  return rounded.toFixed(digits);
}

const pad2 = (n) => String(n).padStart(2, '0');

function PolicyBar({ policyId, onSelectPolicy, t }) {
  const policyOrder = ['pi_0', 'pi_sft', 'pi_grpo'];
  return (
    <section className="ty-policy-bar" aria-label={t({ en: 'Policy checkpoint switcher', zh: '策略检查点切换' })}>
      <div className="ty-policy-pills" role="tablist">
        {policyOrder.map((id) => {
          const item = POLICIES[id];
          const active = id === policyId;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              data-tone={item.rewardTone}
              className={`ty-policy-pill${active ? ' is-active' : ''}`}
              onClick={() => onSelectPolicy(id)}
            >
              <span className="ty-policy-top">
                <span className="ty-policy-name">{item.badge}</span>
                <span className="ty-policy-reward" data-tone={item.rewardTone}>
                  {item.rewardCode}
                </span>
              </span>
              <span className="ty-policy-sub">{t(item.label)}</span>
            </button>
          );
        })}
      </div>
      <p className="ty-illus mono">{t({ en: 'Illustrative values — not measurements.', zh: '示意数值，并非实测。' })}</p>
    </section>
  );
}

function TypistStage({
  policy,
  tokens,
  activeStep,
  inspectedIdx,
  selectedCandidateIdx,
  temperature,
  distribution,
  activeWorkId,
  lang,
  t,
  onSelectToken,
  onSelectCandidate,
}) {
  const inspectedToken = tokens[inspectedIdx];
  const activeWorkMetric = activeWorkId ? WORK_TAGS[activeWorkId] : null;

  return (
    <section
      className="ty-stage"
      data-tone={policy.rewardTone}
      aria-label={t({ en: 'Autoregressive decoding stage', zh: '自回归解码舞台' })}
    >
      <div className="ty-stage-bar mono">
        <span>
          {policy.badge} · {t(policy.label)} — {t(policy.summary)}
        </span>
        <div className="ty-stage-metrics">
          <span>
            {t({ en: 'token', zh: '词元' })} <strong>{pad2(activeStep)}</strong> / {pad2(tokens.length)}
          </span>
          <span>
            T = <strong className="is-cobalt">{temperature.toFixed(1)}</strong>
          </span>
          <span>
            H(p) = <strong>{distribution.entropy.toFixed(2)} bits</strong>
          </span>
        </div>
        <p className="ty-illus mono">{t({ en: 'Illustrative values — not measurements.', zh: '示意数值，并非实测。' })}</p>
      </div>

      {/* Upper 3D Perspective Rejected-Token Cloud */}
      <div className="ty-cloud-zone">
        <svg className="ty-horizon-svg" viewBox="0 0 1000 240" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="typist-horizon-fog" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f2efe8" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#f2efe8" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[-6, -4, -2, -1, 0, 1, 2, 4, 6].map((k) => (
            <line
              key={k}
              x1="500"
              y1="26"
              x2={500 + k * 140}
              y2="240"
              stroke="#111111"
              strokeOpacity={Math.max(0.03, 0.11 - Math.abs(k) * 0.012)}
              strokeWidth="1"
            />
          ))}
          {[0.25, 0.45, 0.68, 0.9].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={26 + ratio * 214}
              x2="1000"
              y2={26 + ratio * 214}
              stroke="#111111"
              strokeOpacity={(0.03 + ratio * 0.08).toFixed(3)}
              strokeWidth="1"
            />
          ))}
          <rect x="0" y="0" width="1000" height="120" fill="url(#typist-horizon-fog)" />
          <line
            x1="500"
            y1="142"
            x2="500"
            y2="232"
            stroke={policy.rewardTone === 'alert' ? '#c41e3a' : '#1a3cff'}
            strokeWidth="1.5"
            strokeDasharray="3 4"
            strokeOpacity="0.7"
          />
        </svg>

        <div className="ty-cloud-caption mono">
          <span>
            {t({ en: '3D rejected candidate cloud · depth ∝ (1 − p)', zh: '三维落选候选云 · 深度 ∝ (1 − p)' })}
          </span>
          <span>
            {t({ en: 'Inspecting slot', zh: '当前检视槽位' })}{' '}
            <strong>
              #{pad2(inspectedIdx + 1)} “{inspectedToken.text}”
            </strong>
          </span>
        </div>

        <div className="ty-cloud-origin" role="list" aria-label={t({ en: 'Rejected candidate tokens', zh: '落选候选词元' })}>
          {distribution.rejectedSorted.map((candItem, rank) => {
            const slot = CLOUD_SLOTS[rank];
            const zDepth = Math.round(72 + (1 - candItem.prob) * 240 + rank * 34);
            const opacity = Math.max(0.4, Math.min(0.95, 0.44 + candItem.prob * 1.45 - rank * 0.05));
            const blurPx = Math.max(0, (zDepth - 165) * 0.0045).toFixed(2);
            const isSelected = selectedCandidateIdx === candItem.candIdx;
            const advClass = candItem.advantage >= 0 ? 'is-pos' : 'is-neg';

            return (
              <button
                key={`${inspectedIdx}-${candItem.text}`}
                type="button"
                role="listitem"
                onClick={() => onSelectCandidate(candItem.candIdx)}
                className={`ty-ghost${isSelected ? ' is-selected' : ''}`}
                style={{
                  '--tx': `${slot.x}px`,
                  '--ty': `${slot.y}px`,
                  '--tz': `${-zDepth}px`,
                  transform: `perspective(900px) translate3d(calc(var(--tx) * var(--cloud-scale, 1)), calc(var(--ty) * var(--cloud-scale, 1)), var(--tz))`,
                  opacity: isSelected ? 1 : opacity,
                  filter: isSelected ? 'blur(0px)' : `blur(${blurPx}px)`,
                }}
              >
                <span className="ty-ghost-meta">
                  <span>p = {candItem.prob.toFixed(2)}</span>
                  <span className={`ty-ghost-adv ${advClass}`}>A = {fmtSigned(candItem.advantage)}</span>
                </span>
                <span className="ty-ghost-word">{candItem.text}</span>
                <span className="ty-ghost-bar" aria-hidden="true">
                  <span style={{ width: `${Math.max(5, Math.round(candItem.prob * 100))}%` }} />
                </span>
              </button>
            );
          })}
        </div>

        <div className="ty-anchor-badge">
          {t({ en: 'lifted to z = 0', zh: '采样落位 z = 0' })} · {inspectedToken.text} ({distribution.chosen.prob.toFixed(2)})
        </div>
      </div>

      {/* 2D Accepted Paper Plane (z = 0) */}
      <div className="ty-plane">
        <div className="ty-plane-meta mono">
          <span>{t({ en: 'z = 0 · accepted paper plane', zh: 'z = 0 · 已采纳纸面' })}</span>
          <span>
            {t({
              en: 'Click any token or 3D ghost to inspect logits & advantage',
              zh: '点击任意词元或上方三维落选词检视对数概率与优势值',
            })}
          </span>
        </div>

        <div className="ty-stream" data-lang={lang} aria-live="polite">
          {tokens.map((item, idx) => {
            if (idx >= activeStep) {
              return (
                <span key={`${policy.id}-${lang}-unwritten-${idx}`} className="ty-slot-unwritten" aria-hidden="true">
                  _{pad2(idx + 1)}
                </span>
              );
            }
            const isInspected = idx === inspectedIdx;
            const isWorkHit = Boolean(activeWorkId && item.workIds.includes(activeWorkId));
            const stepDist = computeStepDistribution(item, temperature);
            const isHighEntropy = stepDist.entropy >= 1.35;
            const classes = [
              'ty-tok',
              isInspected ? 'is-inspected' : '',
              item.hallucination ? 'is-hallucination' : '',
              isWorkHit ? 'is-work-hit' : '',
              isHighEntropy ? 'is-high-ent' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <span key={`${policy.id}-${lang}-${idx}`} style={{ display: 'inline-flex', alignItems: 'baseline' }}>
                <button
                  type="button"
                  className={classes}
                  onClick={() => onSelectToken(idx)}
                  aria-pressed={isInspected}
                  title={`${item.text} · p=${stepDist.chosen.prob.toFixed(2)} · A=${fmtSigned(item.advantage)}`}
                >
                  {isWorkHit && activeWorkMetric && <span className="ty-tok-tag">{activeWorkMetric}</span>}
                  {item.text}
                  <span className="ty-tok-pip" aria-hidden="true" />
                </button>
                {idx === activeStep - 1 && <span className="ty-cursor" aria-hidden="true" />}
              </span>
            );
          })}
        </div>
      </div>

      {/* Verification & Grounding Ledger */}
      <div className="ty-ledger" data-tone={policy.rewardTone}>
        <span className="ty-ledger-status" data-tone={policy.rewardTone}>
          {t(policy.ledgerStatus)}
        </span>
        <div className="ty-ledger-chips">
          {t(policy.ledgerChips).map((chip) => (
            <span key={chip} className="ty-ledger-chip">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ControlsBar({
  playing,
  activeStep,
  totalSteps,
  temperature,
  onTogglePlay,
  onReset,
  onScrub,
  onTemperatureChange,
  t,
}) {
  return (
    <section className="ty-controls" aria-label={t({ en: 'Decoding controls', zh: '解码控制面板' })}>
      <div className="ty-btn-group">
        <button type="button" className="ty-btn is-primary" onClick={onTogglePlay}>
          {playing
            ? t({ en: '❚❚ Pause Auto-Type', zh: '❚❚ 暂停生成' })
            : t({ en: '▶ Play Auto-Type', zh: '▶ 自动逐词生成' })}
        </button>
        <button type="button" className="ty-btn" onClick={onReset}>
          {t({ en: 'Reset', zh: '重置' })}
        </button>
      </div>

      <label className="ty-slider-box">
        <span className="ty-slider-head">
          <span>{t({ en: 'Step Scrubber', zh: '解码步进条' })}</span>
          <strong>
            {t({ en: 'step', zh: '第' })} {pad2(activeStep)} / {pad2(totalSteps)}
          </strong>
        </span>
        <input
          type="range"
          className="ty-range"
          min={1}
          max={totalSteps}
          step={1}
          value={activeStep}
          onChange={(e) => onScrub(Number(e.target.value))}
          aria-label={t({ en: 'Decoding step scrubber', zh: '解码步数滑块' })}
        />
        <span className="ty-slider-ticks">
          <button type="button" className="ty-tick-btn" onClick={() => onScrub(1)}>
            01
          </button>
          <button type="button" className="ty-tick-btn" onClick={() => onScrub(Math.ceil(totalSteps / 2))}>
            {pad2(Math.ceil(totalSteps / 2))}
          </button>
          <button type="button" className="ty-tick-btn" onClick={() => onScrub(totalSteps)}>
            {pad2(totalSteps)}
          </button>
        </span>
      </label>

      <label className="ty-slider-box">
        <span className="ty-slider-head">
          <span>{t({ en: 'Temperature', zh: '采样温度' })}</span>
          <strong>T = {temperature.toFixed(1)}</strong>
        </span>
        <input
          type="range"
          className="ty-range"
          min={0.1}
          max={1.4}
          step={0.1}
          value={temperature}
          onChange={(e) => onTemperatureChange(Math.round(Number(e.target.value) * 10) / 10)}
          aria-label={t({ en: 'Sampling temperature', zh: '采样温度滑块' })}
        />
        <span className="ty-slider-ticks">
          <button type="button" className="ty-tick-btn" onClick={() => onTemperatureChange(0.1)}>
            0.1 {t({ en: 'greedy', zh: '贪婪' })}
          </button>
          <button type="button" className="ty-tick-btn" onClick={() => onTemperatureChange(0.7)}>
            0.7 {t({ en: 'default', zh: '默认' })}
          </button>
          <button type="button" className="ty-tick-btn" onClick={() => onTemperatureChange(1.4)}>
            1.4 {t({ en: 'flat', zh: '发散' })}
          </button>
        </span>
      </label>
    </section>
  );
}

function LogitInspector({
  policy,
  tokens,
  inspectedIdx,
  selectedCandidateIdx,
  temperature,
  distribution,
  onSelectCandidate,
  onJumpWork,
  lang,
  t,
}) {
  const contextTokens = tokens
    .slice(Math.max(0, inspectedIdx - 3), inspectedIdx)
    .map((item) => item.text)
    .join(lang === 'zh' ? '' : ' ');

  const inspectedItem =
    selectedCandidateIdx === 0
      ? distribution.chosen
      : distribution.rejectedSorted.find((item) => item.candIdx === selectedCandidateIdx) || distribution.chosen;

  const isGhost = !inspectedItem.isChosen;
  const deltaLogit = inspectedItem.logit - distribution.chosen.logit;
  const deltaProb = inspectedItem.prob - distribution.chosen.prob;
  const deltaAdv = inspectedItem.advantage - distribution.chosen.advantage;

  const linkedWorks = work.filter((w) => tokens[inspectedIdx].workIds.includes(w.id));

  return (
    <section className="ty-inspector" aria-label={t({ en: 'Logit and advantage inspector', zh: '对数概率与优势值检视器' })}>
      {/* Left: Top-5 Softmax Probabilities */}
      <div className="ty-panel">
        <div className="ty-panel-head">
          <span className="ty-panel-title">
            p( next | “{contextTokens ? `… ${contextTokens}` : '<bos>'}” )
          </span>
          <div className="ty-panel-kpis">
            <span>
              T = <b>{temperature.toFixed(1)}</b>
            </span>
            <span>
              H(p) = <b>{distribution.entropy.toFixed(2)} bits</b>
            </span>
            <span>
              A* = <b>{fmtSigned(distribution.chosen.advantage)}</b>
            </span>
          </div>
        </div>

        <div className="ty-dist-list" role="list">
          {distribution.top5.map((row, idx) => {
            const isChosenAlert = row.isChosen && row.hallucination;
            const isSelectedGhost = !row.isChosen && row.candIdx === selectedCandidateIdx;
            const rowClasses = [
              'ty-dist-row',
              row.isChosen ? (isChosenAlert ? 'is-chosen-alert' : 'is-chosen') : '',
              isSelectedGhost ? 'is-inspected-ghost' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={`${inspectedIdx}-${row.text}`}
                type="button"
                role="listitem"
                className={rowClasses}
                onClick={() => onSelectCandidate(row.candIdx)}
              >
                <span className="ty-dist-rank">0{idx + 1}</span>
                <span className="ty-dist-word">
                  <span>{row.text}</span>
                  <span className={`ty-dist-badge ${row.isChosen ? (isChosenAlert ? 'is-alert' : 'is-chosen') : 'is-ghost'}`}>
                    {row.isChosen
                      ? isChosenAlert
                        ? t({ en: 'KL SPIKE', zh: 'KL 尖峰' })
                        : t({ en: 'CHOSEN', zh: '已采样' })
                      : t({ en: 'REJECTED', zh: '落选' })}
                  </span>
                </span>
                <span className="ty-dist-bar" aria-hidden="true">
                  <span style={{ width: `${Math.max(3, Math.round(row.prob * 100))}%` }} />
                </span>
                <span className="ty-dist-num">z {row.logit.toFixed(2)}</span>
                <span className="ty-dist-num">p {row.prob.toFixed(2)}</span>
                <span className={`ty-dist-adv ${row.advantage >= 0 ? 'is-pos' : 'is-neg'}`}>
                  A {fmtSigned(row.advantage)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: RL Rationale & Ghost Delta */}
      <div className="ty-panel">
        <div className="ty-panel-head">
          <span className="ty-panel-title">
            {isGhost
              ? t({ en: 'Rejected Ghost Delta vs Chosen', zh: '落选词与采样词差值对比' })
              : t({ en: 'RL Policy & Advantage Rationale', zh: '策略与 GAE 优势解析' })}
          </span>
          <span className="mono" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
            {policy.badge} · #{pad2(inspectedIdx + 1)}
          </span>
        </div>

        <div
          className={`ty-compare-head${isGhost ? ' is-ghost' : inspectedItem.hallucination ? ' is-alert' : ''}`}
        >
          <span>
            {isGhost ? (
              <>
                {t({ en: 'Ghost', zh: '候选词' })} <strong>“{inspectedItem.text}”</strong> vs{' '}
                {t({ en: 'Chosen', zh: '当前采样' })} <strong>“{distribution.chosen.text}”</strong>
              </>
            ) : (
              <>
                {t({ en: 'Active Token', zh: '当前词元' })}: <strong>“{inspectedItem.text}”</strong>
              </>
            )}
          </span>
          <span>p = {inspectedItem.prob.toFixed(2)}</span>
        </div>

        <div className="ty-delta-grid">
          <div className="ty-delta-cell">
            <span>{isGhost ? 'Δ logit' : 'logit z'}</span>
            <strong className={isGhost ? (deltaLogit >= 0 ? 'is-pos' : 'is-neg') : ''}>
              {isGhost ? fmtSigned(deltaLogit) : inspectedItem.logit.toFixed(2)}
            </strong>
          </div>
          <div className="ty-delta-cell">
            <span>{isGhost ? 'Δ p(T)' : 'p(T)'}</span>
            <strong className={isGhost ? (deltaProb >= 0 ? 'is-pos' : 'is-neg') : ''}>
              {isGhost ? fmtSigned(deltaProb) : inspectedItem.prob.toFixed(2)}
            </strong>
          </div>
          <div className="ty-delta-cell">
            <span>{isGhost ? 'Δ A (GAE)' : 'GAE A'}</span>
            <strong
              className={
                (isGhost ? deltaAdv : inspectedItem.advantage) >= 0 ? 'is-pos' : 'is-neg'
              }
            >
              {isGhost ? fmtSigned(deltaAdv) : fmtSigned(inspectedItem.advantage)}
            </strong>
          </div>
        </div>

        <p className="ty-rationale">{t(inspectedItem.reason)}</p>

        {linkedWorks.length > 0 && policy.id === 'pi_grpo' && (
          <div className="ty-links-row">
            <span className="mono">{t({ en: 'Grounds projects:', zh: '关联项目实证：' })}</span>
            {linkedWorks.map((w) => (
              <button key={w.id} type="button" className="ty-work-jump" onClick={() => onJumpWork(w.id)}>
                {WORK_TAGS[w.id]} · {w.title}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="ty-illus ty-illus-wide mono">{t({ en: 'Illustrative values — not measurements.', zh: '示意数值，并非实测。' })}</p>
    </section>
  );
}

function WorkTokenGrid({
  policyId,
  grpoTokens,
  activeWorkId,
  selectedWorkId,
  onHoverWork,
  onToggleWork,
  t,
}) {
  return (
    <section className="ty-work" aria-label={t({ en: 'Token-decoded projects', zh: '词元解码项目' })}>
      <div className="ty-work-head">
        <h2>{t({ en: 'Token-Decoded Work', zh: '词元解码项目' })}</h2>
        <span>
          {policyId === 'pi_grpo'
            ? t({
                en: 'Hover or select a card to highlight its thesis tokens above',
                zh: '悬停或选中项目卡片，高亮上方主张句中对应的实证词元',
              })
            : t({
                en: 'Click any card to switch to π_GRPO and inspect its thesis tokens',
                zh: '点击任意卡片切换至 π_GRPO 并高亮其对应主张词元',
              })}
        </span>
      </div>

      <div className="ty-work-grid">
        {work.map((item, idx) => {
          const isSelected = selectedWorkId === item.id;
          const isHovered = activeWorkId === item.id;
          const tag = WORK_TAGS[item.id];
          const linkedTokens = grpoTokens.filter((tk) => tk.workIds.includes(item.id));

          return (
            <button
              key={item.id}
              type="button"
              className={`ty-card${isSelected || isHovered ? ' is-active' : ''}`}
              onMouseEnter={() => onHoverWork(item.id)}
              onMouseLeave={() => onHoverWork(null)}
              onFocus={() => onHoverWork(item.id)}
              onBlur={() => onHoverWork(null)}
              onClick={() => onToggleWork(item.id)}
              aria-pressed={isSelected}
            >
              <span className="ty-card-top">
                <span>0{idx + 1}</span>
                <span>
                  {item.where} · {item.year}
                </span>
              </span>

              <span className="ty-card-metric-row">
                <strong className="ty-card-metric">{item.metric}</strong>
                <span className="ty-card-mlabel">{t(item.metricLabel)}</span>
              </span>

              <span className="ty-card-title">{item.title}</span>
              <span className="ty-card-line">{t(item.line)}</span>

              <span className="ty-card-tokens">
                <span className="ty-card-tok-label">{tag}</span>
                {linkedTokens.map((tk) => (
                  <span key={`${item.id}-${tk.text}`} className="ty-card-tok">
                    {tk.text}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <p className="ty-footnote">{t(footnote)}</p>
    </section>
  );
}

export default function TypistOpening({ embedded = false, head = null }) {
  const { lang, t } = useLang();
  const [policyId, setPolicyId] = useState('pi_grpo');
  const [temperature, setTemperature] = useState(0.7);
  const [hoveredWorkId, setHoveredWorkId] = useState(null);
  const [selectedWorkId, setSelectedWorkId] = useState(null);

  const [playback, setPlayback] = useState(() => {
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return {
      step: reduced ? 999 : 1,
      inspected: reduced ? 5 : 0,
      candidateIdx: 0,
      playing: !reduced,
    };
  });

  const policy = POLICIES[policyId];
  const tokens = policy.tokens[lang] ?? policy.tokens.en;
  const totalSteps = tokens.length;

  useEffect(() => {
    if (!playback.playing) return undefined;
    const id = window.setInterval(() => {
      setPlayback((prev) => {
        if (!prev.playing) return prev;
        const next = Math.min(prev.step + 1, totalSteps);
        return {
          ...prev,
          step: next,
          inspected: next - 1,
          candidateIdx: 0,
          playing: next < totalSteps,
        };
      });
    }, 270);
    return () => window.clearInterval(id);
  }, [playback.playing, totalSteps]);

  const activeStep = Math.min(Math.max(1, playback.step), totalSteps);
  const inspectedIdx = Math.min(Math.max(0, playback.inspected), activeStep - 1);

  const distribution = useMemo(
    () => computeStepDistribution(tokens[inspectedIdx], temperature),
    [tokens, inspectedIdx, temperature],
  );

  const grpoTokens = POLICIES.pi_grpo.tokens[lang] ?? POLICIES.pi_grpo.tokens.en;
  const activeWorkId = hoveredWorkId ?? selectedWorkId;

  const handleSelectPolicy = (nextId) => {
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPolicyId(nextId);
    setSelectedWorkId(null);
    setPlayback({
      step: reduced ? 999 : 1,
      inspected: reduced ? 5 : 0,
      candidateIdx: 0,
      playing: !reduced,
    });
  };

  const handleTogglePlay = () => {
    setPlayback((prev) => {
      const clampedStep = Math.min(prev.step, totalSteps);
      if (!prev.playing && clampedStep >= totalSteps) {
        return { step: 1, inspected: 0, candidateIdx: 0, playing: true };
      }
      return { ...prev, playing: !prev.playing };
    });
  };

  const handleReset = () => {
    setPlayback({ step: 1, inspected: 0, candidateIdx: 0, playing: false });
  };

  const handleScrub = (nextStep) => {
    const clamped = Math.min(Math.max(1, nextStep), totalSteps);
    setPlayback({
      step: clamped,
      inspected: clamped - 1,
      candidateIdx: 0,
      playing: false,
    });
  };

  const handleSelectToken = (idx) => {
    setPlayback((prev) => ({
      ...prev,
      inspected: idx,
      candidateIdx: 0,
      playing: false,
    }));
  };

  const handleSelectCandidate = (candIdx) => {
    setPlayback((prev) => ({
      ...prev,
      candidateIdx: candIdx,
      playing: false,
    }));
  };

  const handleToggleWork = (workId) => {
    const nextSelected = selectedWorkId === workId ? null : workId;
    setSelectedWorkId(nextSelected);
    if (!nextSelected) return;

    const targetTokens = POLICIES.pi_grpo.tokens[lang] ?? POLICIES.pi_grpo.tokens.en;
    const matchIdx = targetTokens.findIndex((tk) => tk.workIds.includes(workId));
    if (policyId !== 'pi_grpo') {
      setPolicyId('pi_grpo');
    }
    setPlayback({
      step: targetTokens.length,
      inspected: matchIdx >= 0 ? matchIdx : targetTokens.length - 1,
      candidateIdx: 0,
      playing: false,
    });
  };

  const subtitleParts = joinParts([t(profile.role), t(profile.org), t(profile.city)]);
  const WrapTag = embedded ? 'section' : 'main';

  return (
    <div className={`typist${embedded ? ' is-embedded' : ' is-standalone'}`}>
      {!embedded && <Header />}

      <WrapTag className="typist-wrap">
        {embedded && head && <div className="typist-head">{head}</div>}

        <header className="ty-mast">
          <div>
            <p className="ty-kicker mono">
              <span className="ty-kicker-dot" aria-hidden="true" />
              <span>
                09 · TYPIST — {joinParts([profile.name, subtitleParts], ' · ')}
              </span>
            </p>
            <h1 className="ty-title">
              {t({
                en: 'Every word is a sampled policy.',
                zh: '每个词元，都是一次策略采样。',
              })}
            </h1>
            <p className="ty-sub">
              {t({
                en: 'Switch checkpoints, adjust temperature T, and inspect the 3D cloud of rejected tokens and GAE advantages behind the thesis.',
                zh: '切换模型检查点、调节温度系数 T，并检视语句背后悬浮在三维深处的落选词云与 GAE 优势分数。',
              })}
            </p>
          </div>

          <div className="ty-ctx" aria-label={t({ en: 'Context prefix trajectory', zh: '上下文轨迹前缀' })}>
            <div className="ty-ctx-head mono">
              <span>{t({ en: 'ctx[trajectory]', zh: '上下文[履历轨迹]' })}</span>
              <span>{route.length} stops</span>
            </div>
            <div className="ty-ctx-stops">
              {route.map((stop, idx) => (
                <span key={`${stop.years}-${idx}`} className="ty-ctx-stop">
                  <strong>{stop.code || <span className="ty-blank" aria-hidden="true" />}</strong>
                  <span>{joinParts([stop.years, stop.what, t(stop.city)])}</span>
                </span>
              ))}
            </div>
          </div>
        </header>

        <PolicyBar policyId={policyId} onSelectPolicy={handleSelectPolicy} t={t} />

        <TypistStage
          policy={policy}
          tokens={tokens}
          activeStep={activeStep}
          inspectedIdx={inspectedIdx}
          selectedCandidateIdx={playback.candidateIdx}
          temperature={temperature}
          distribution={distribution}
          activeWorkId={policyId === 'pi_grpo' ? activeWorkId : null}
          lang={lang}
          t={t}
          onSelectToken={handleSelectToken}
          onSelectCandidate={handleSelectCandidate}
        />

        <ControlsBar
          playing={playback.playing}
          activeStep={activeStep}
          totalSteps={totalSteps}
          temperature={temperature}
          onTogglePlay={handleTogglePlay}
          onReset={handleReset}
          onScrub={handleScrub}
          onTemperatureChange={setTemperature}
          t={t}
        />

        <LogitInspector
          policy={policy}
          tokens={tokens}
          inspectedIdx={inspectedIdx}
          selectedCandidateIdx={playback.candidateIdx}
          temperature={temperature}
          distribution={distribution}
          onSelectCandidate={handleSelectCandidate}
          onJumpWork={handleToggleWork}
          lang={lang}
          t={t}
        />

        <WorkTokenGrid
          policyId={policyId}
          grpoTokens={grpoTokens}
          activeWorkId={activeWorkId}
          selectedWorkId={selectedWorkId}
          onHoverWork={setHoveredWorkId}
          onToggleWork={handleToggleWork}
          t={t}
        />
      </WrapTag>

      {!embedded && <Outro current="typist" />}
    </div>
  );
}
