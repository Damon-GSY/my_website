// Single source of copy and facts. Everything here comes from Damon's résumé and LinkedIn profile.
// Production figures are internal measurements, not public benchmarks.

export const profile = {
  name: 'Damon Guan',
  role: { en: 'LLM algorithm engineer', zh: '大模型算法工程师' },
  org: { en: 'Alibaba', zh: '阿里巴巴' },
  city: { en: 'Hangzhou', zh: '杭州' },
  email: 'hello@damon.ai', // unconfirmed; change here only
  links: [
    { label: 'GitHub', href: 'https://github.com/Damon-GSY' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shengyue-guan-1a7b3226b/' },
    { label: 'YouTube', href: 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA' },
    { label: 'Bilibili', href: 'https://space.bilibili.com/358541297' },
  ],
};

export const work = [
  {
    id: 'supply-chain-agent-system',
    title: 'Supply Chain Agent System',
    where: 'Alibaba',
    year: '2025',
    metric: '≈90%',
    metricLabel: { en: 'fewer misoperations', zh: '误操作减少' },
    line: {
      en: 'Risk-tiered, multi-turn decisions with progressive confirmation across 12 supply-chain scenarios.',
      zh: '在 12 个供应链场景中，按风险分级做多轮决策与渐进式确认。',
    },
  },
  {
    id: 'dynamic-tool-resolution',
    title: 'Dynamic Tool Resolution',
    where: 'Alibaba',
    year: '2025',
    metric: '100+',
    metricLabel: { en: 'tools, resolved at run time', zh: '个工具，运行时动态解析' },
    line: {
      en: 'Agentic RL over a changing tool pool. About 90% less manual ticket handling.',
      zh: '在持续变化的工具池上做 Agentic RL，人工工单处理约减少 90%。',
    },
  },
  {
    id: 'supply-chain-domain-llm',
    title: 'Supply-Chain Domain LLM',
    where: 'Alibaba',
    year: '2025',
    metric: 'SOTA',
    metricLabel: { en: 'internal, dual-axis benchmark', zh: '内部双维度基准' },
    line: {
      en: 'Continual pretraining, then SFT and RL, measured on knowledge QA and tool use.',
      zh: '持续预训练，再接 SFT 与 RL，以知识问答和工具调用两条轴评测。',
    },
  },
  {
    id: 'multi-objective-attribute-rl',
    title: 'Multi-Objective Attribute RL',
    where: 'Alibaba',
    year: '2025',
    metric: 'GRPO',
    metricLabel: { en: 'stabilised across objectives', zh: '多目标下稳定训练' },
    line: {
      en: 'Conditional and hierarchical rewards for fulfillment, bundle consolidation and HS Code.',
      zh: '为履约、合包与 HS Code 设计条件奖励和分层奖励。',
    },
  },
  {
    id: 'm365-copilot-memory',
    title: 'M365 Copilot Memory',
    where: 'MSRA',
    year: '2024',
    metric: '3',
    metricLabel: { en: 'memory layers', zh: '层记忆架构' },
    line: {
      en: 'Long-context memory and multi-turn evaluation for email workflows.',
      zh: '面向邮件工作流的长上下文记忆与多轮评测。',
    },
  },
  {
    id: 'supchain-bench',
    title: 'SupChain-Bench',
    where: 'ACL Findings',
    year: '2026',
    metric: '530',
    metricLabel: { en: 'annotated real-world samples', zh: '条真实标注样本' },
    line: {
      en: 'A unified benchmark for logistics, fulfillment, finance and customs work.',
      zh: '覆盖物流、履约、财务与关务的统一基准。',
    },
  },
];

export const route = [
  { code: 'SYD', years: '2019–22', what: 'UNSW', city: { en: 'Sydney', zh: '悉尼' } },
  { code: 'SIN', years: '2023–25', what: 'NUS', city: { en: 'Singapore', zh: '新加坡' } },
  { code: 'PEK', years: '2024–25', what: 'Meituan · MSRA', city: { en: 'Beijing', zh: '北京' } },
  { code: 'HGH', years: '2025–', what: 'Alibaba', city: { en: 'Hangzhou', zh: '杭州' } },
];

export const footnote = {
  en: 'Production figures are internal measurements, not public benchmarks.',
  zh: '生产数据为内部测量，非公开基准。',
};
