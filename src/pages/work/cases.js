// The six case studies, as the Parcels study (public/lab/parcels/) prints them inside each carton.
// English is that page's copy word for word; the Chinese is a translation of it. Nothing new is
// claimed here: title, figure, label, place, year and summary come from `work` in src/content.js.
// `prod` marks production figures, which carry the internal-measurement footnote.

const EVAL = { en: 'Evaluate before training', zh: '先评测，再训练' };
const BOUND = { en: 'Bound the authority', zh: '限定权限' };

export const cases = {
  'supply-chain-agent-system': {
    prod: true,
    sub: { en: '12 scenarios', zh: '12 个场景' },
    what: [
      { en: 'An agent system', zh: '一套智能体系统' },
      {
        en: 'Language agents that carry out supply-chain operations, measured across 12 scenarios before anyone relies on them.',
        zh: '执行供应链操作的语言智能体，在有人依赖它们之前，先在 12 个场景中测量。',
      },
    ],
    held: [
      BOUND,
      {
        en: 'Each agent acts inside a fixed scope. When something goes wrong, read the trace before changing the model.',
        zh: '每个智能体只在固定范围内行动。出了问题，先读执行轨迹，再改模型。',
      },
    ],
  },
  'dynamic-tool-resolution': {
    prod: true,
    sub: { en: 'one agent, many tools', zh: '一个智能体，众多工具' },
    what: [
      { en: 'A tool resolver', zh: '一个工具解析器' },
      {
        en: 'Working out which tool an agent should reach for when the set it can draw on runs past 100.',
        zh: '当可用的工具超过 100 个时，判断智能体该调用哪一个。',
      },
    ],
    held: [
      BOUND,
      {
        en: 'The fewer tools an agent can reach at any moment, the easier each of its actions is to check.',
        zh: '智能体在任一时刻能触及的工具越少，它的每个动作就越容易核查。',
      },
    ],
  },
  'supply-chain-domain-llm': {
    prod: true,
    sub: { en: 'domain model', zh: '领域模型' },
    what: [
      { en: 'A domain model', zh: '一个领域模型' },
      {
        en: 'A language model for supply-chain work. On internal evaluation it is state of the art.',
        zh: '面向供应链工作的语言模型。在内部评测中达到 SOTA。',
      },
    ],
    held: [
      EVAL,
      {
        en: 'Decide how a model will be judged before changing it, so every gain is measured against the same yardstick.',
        zh: '改动模型之前，先定好怎样评判它，让每一次提升都用同一把尺子衡量。',
      },
    ],
  },
  'multi-objective-attribute-rl': {
    prod: false,
    sub: { en: 'multi-objective RL', zh: '多目标强化学习' },
    what: [
      { en: 'A training method', zh: '一种训练方法' },
      {
        en: 'Reinforcement learning that balances several attribute objectives at once, trained with GRPO.',
        zh: '同时平衡多个属性目标的强化学习，用 GRPO 训练。',
      },
    ],
    held: [
      EVAL,
      {
        en: 'Each objective needs its own measure before it can be traded against the others.',
        zh: '每个目标都要先有自己的度量，才能与其他目标相互权衡。',
      },
    ],
  },
  'm365-copilot-memory': {
    prod: false,
    sub: { en: 'Microsoft 365 Copilot', zh: 'Microsoft 365 Copilot' },
    what: [
      { en: 'A memory system', zh: '一套记忆系统' },
      {
        en: 'Memory for Microsoft 365 Copilot, organised in three layers.',
        zh: '为 Microsoft 365 Copilot 设计的记忆，分为三层。',
      },
    ],
    held: [
      { en: 'Read the trace', zh: '读执行轨迹' },
      {
        en: 'What an assistant remembers should be inspectable: each layer can be read back and checked.',
        zh: '助手记住了什么，应当可以检查：每一层都能读回并核对。',
      },
    ],
  },
  'supchain-bench': {
    prod: false,
    sub: { en: 'ACL Findings 2026', zh: 'ACL Findings 2026' },
    what: [
      { en: 'A benchmark', zh: '一个基准' },
      {
        en: 'A benchmark for supply-chain agents with 530 samples, published in ACL Findings 2026.',
        zh: '面向供应链智能体的基准，含 530 条样本，发表于 ACL Findings 2026。',
      },
    ],
    held: [
      EVAL,
      {
        en: 'The benchmark is the measure: build it first, then train against it.',
        zh: '基准就是那把尺子：先把它建好，再对着它训练。',
      },
    ],
  },
};
