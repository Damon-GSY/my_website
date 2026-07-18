export const profile = {
  name: 'Damon Guo-Siyi',
  shortName: 'Damon',
  legalName: 'Shengyue Guan',
  alternateNames: ['Damon', 'Damon Guo-Siyi'],
  role: 'LLM Algorithm Engineer',
  company: 'Alibaba',
  location: 'Hangzhou, China',
  email: 'hello@damon.ai',
  siteUrl: 'https://damon.ai',
  thesis:
    'Reliable autonomy starts with explicit boundaries, observable traces, and a fast path back to human judgment.',
  bio:
    'I am an AI researcher and algorithm engineer working where model behavior meets operating reality. At Alibaba, I build post-training, evaluation, and agentic RL systems for workflows where a plausible answer is not enough.',
  creatorLine:
    'Outside the training loop, I turn hard-won engineering lessons into practical AI writing and videos for YouTube and Bilibili.',
  principles: [
    {
      index: 'P/01',
      title: 'Evaluate before training.',
      description: 'Define the capability surface and failure taxonomy before spending the first training run.',
    },
    {
      index: 'P/02',
      title: 'Bound the authority.',
      description: 'Autonomy is a routed system state—not a blanket permission granted to a convincing model.',
    },
    {
      index: 'P/03',
      title: 'Read the trace.',
      description: 'The path through tools, memory, and recovery reveals more than the final answer ever can.',
    },
  ],
  facts: [
    ['Base', 'Hangzhou · UTC+8'],
    ['Focus', 'Agentic RL · post-training'],
    ['Education', 'NUS Top 5% · UNSW Top 3%'],
    ['Publishing', 'YouTube · Bilibili'],
  ],
  heroProofs: [
    ['Current', 'Alibaba · LLM Algorithm Engineer'],
    ['Research', '2× first author · ACL Findings'],
    ['Public work', 'YouTube · Bilibili'],
  ],
}

export const heroChapters = [
  {
    index: '01 / Production engineer',
    title: 'I build the control layer between models and irreversible work.',
    description:
      'At Alibaba, I turn agent capability into bounded decisions, inspectable tool traces, and fast human recovery.',
    evidence: '12 scenarios · 100+ tools · <1s handoff',
  },
  {
    index: '02 / Researcher + creator',
    title: 'I turn production traces into evidence people can use.',
    description:
      'My first-author research maps multi-turn agent evaluation and real supply-chain work; my public notes make the methods legible beyond the paper.',
    evidence: '~250 papers mapped · 530 real-world samples · YouTube / Bilibili',
  },
] as const

export const signals = [
  { value: '12', label: 'production scenarios' },
  { value: '100+', label: 'tools resolved at runtime' },
  { value: '−95%', label: 'manual interventions' },
  { value: '<1s', label: 'exception handoff' },
] as const

export const work = [
  {
    id: 'risk-router',
    index: '01',
    title: 'Supply Chain Agent System',
    kicker: 'Risk router / production AI',
    stage: 'Alibaba',
    year: '2025',
    role: 'System design · agent policy · evaluation',
    context:
      'Twelve supply-chain scenarios shared one agent surface, but the cost of a mistaken action was not uniform. Routine retrieval and irreversible operational changes could not use the same autonomy threshold.',
    principle:
      'Treat authority as a routed system state: observe risk, narrow the action space, confirm when necessary, and preserve a fast path back to a human operator.',
    ownershipTitle: 'I owned the policy between intent and execution.',
    ownership:
      'I designed the end-to-end control surface across twelve scenarios: the risk taxonomy, progressive-confirmation contract, explicit automation boundaries, exception traces, and the sub-second path back to a human operator.',
    flow: ['Intent + state', 'Risk tier', 'Policy gate', 'Tool execution', 'Trace + handoff'],
    statement:
      'A multi-turn decision system that can distinguish a routine action from an irreversible mistake.',
    details: [
      'Defined explicit automation boundaries for high-risk actions.',
      'Built progressive confirmations into multi-turn decisions.',
      'Connected execution traces to sub-second human handoff paths.',
    ],
    result: '−90%',
    resultLabel: 'misoperations',
    secondary: '−95% manual intervention · <1s handoff',
    tags: ['12 scenarios', 'progressive confirmation', 'human handoff'],
    visual: 'risk',
  },
  {
    id: 'tool-resolver',
    index: '02',
    title: 'Dynamic Tool Resolution',
    kicker: 'Agentic RL / tool intelligence',
    stage: 'Alibaba',
    year: '2025',
    role: 'Agentic RL · tool registry · trace evaluation',
    context:
      'A static tool list became brittle as the internal capability pool grew past one hundred tools. Similar descriptions, changing registrations, and missing capabilities all surfaced as apparent reasoning failures.',
    principle:
      'Separate capability discovery from task execution, then evaluate the resolution trace instead of scoring the final answer alone.',
    ownershipTitle: 'I owned the capability layer the agent reasons over.',
    ownership:
      'I designed the dynamic registry and agentic-RL target around a pool of more than one hundred changing tools, then separated wrong-tool, missing-tool, and unnecessary-tool behavior into traces the team could train and debug.',
    flow: ['Task state', 'Meta tool', 'Capability search', 'Selected tool', 'Trace reward'],
    statement:
      'Agents discover the right capability at runtime instead of memorizing a brittle static tool list.',
    details: [
      'Implemented dynamic registration across a changing internal tool pool.',
      'Trained tool-use decisions rather than scoring final answers alone.',
      'Separated wrong-tool, missing-tool, and over-tooling failure traces.',
    ],
    result: '100+',
    resultLabel: 'dynamic tools',
    secondary: '−90% manual ticket handling',
    tags: ['meta tool', 'dynamic registry', 'trace evaluation'],
    visual: 'tools',
  },
  {
    id: 'domain-model',
    index: '03',
    title: 'Supply-Chain Domain LLM',
    kicker: 'Post-training / benchmark first',
    stage: 'Alibaba',
    year: '2025',
    role: 'Benchmark design · continual pretraining · SFT/RL',
    context:
      'Domain knowledge accuracy and reliable tool execution improved at different rates. A single aggregate score could hide a model that knew the right answer but could not complete the operational workflow.',
    principle:
      'Define the capability surface before training: measure knowledge and execution independently, then align each training stage with a business-facing slice.',
    ownershipTitle: 'I owned the measurement contract before the training recipe.',
    ownership:
      'I built the dual-axis benchmark, mapped it to business-facing capability slices, and drove the sequence from continual pretraining through integrated SFT and RL so each gain remained attributable instead of disappearing into one aggregate score.',
    flow: ['Capability map', 'Dual-axis eval', 'Continual pretrain', 'SFT + RL', 'Slice review'],
    statement:
      'A model trained against two operational truths: what it knows and what it can reliably execute.',
    details: [
      'Built a dual-axis benchmark before the training loop began.',
      'Combined continual pretraining with integrated SFT and RL.',
      'Tracked gains against business-facing capability slices.',
    ],
    result: 'SOTA',
    resultLabel: 'internal benchmark',
    secondary: 'continual pretraining → SFT → RL',
    tags: ['knowledge QA', 'tool use', 'capability slices'],
    visual: 'benchmark',
  },
  {
    id: 'reward-system',
    index: '04',
    title: 'Multi-objective GRPO',
    kicker: 'Reward systems / product attributes',
    stage: 'Alibaba',
    year: '2025',
    role: 'Reward architecture · GRPO · multi-task training',
    context:
      'Product-attribute tasks shared one training loop while optimizing different downstream decisions. Unbalanced objectives could dominate gradients and silently erase gains on less frequent tasks.',
    principle:
      'Make reward hierarchy explicit, control variance at the sample level, and remove updates that cannot provide a useful learning signal.',
    ownershipTitle: 'I owned the reward hierarchy behind every gradient.',
    ownership:
      'I designed the conditional, hierarchical reward architecture for conflicting product-attribute objectives and added variance control plus zero-gradient filtering so frequent tasks could not silently erase progress on rarer ones.',
    flow: ['Task condition', 'Sample reward', 'Hierarchy', 'Gradient filter', 'Policy update'],
    statement:
      'A hierarchical reward design that stops one objective from silently dominating every other task.',
    details: [
      'Conditioned rewards across conflicting product-attribute objectives.',
      'Controlled gradient variance and filtered zero-gradient samples.',
      'Aligned the hierarchy with downstream supply-chain decisions.',
    ],
    result: '4×',
    resultLabel: 'reward controls',
    secondary: 'variance control · zero-gradient filtering',
    tags: ['GRPO', 'hierarchical rewards', 'multi-task'],
    visual: 'reward',
  },
] as const

export const research = [
  {
    index: 'R/01',
    title: 'Evaluating LLM Agents for Multi-turn Conversation',
    type: 'Survey / arXiv',
    year: '2025 · revised 2026',
    venue: 'arXiv 2503.22458',
    authorship: 'First author · 6 authors',
    href: 'https://arxiv.org/abs/2503.22458',
    description:
      'A taxonomy for planning, tools, memory, recovery, and Agent-as-Judge evaluation across long-running conversations.',
    metric: '~250 papers',
    topics: ['planning', 'memory horizon', 'tool recovery', 'agent-as-judge'],
  },
  {
    index: 'R/02',
    title: 'SupChain-Bench',
    type: 'Benchmark / ACL',
    year: '2026',
    venue: 'ACL 2026 Findings',
    authorship: 'First author · 3 authors',
    href: 'https://aclanthology.org/2026.findings-acl.371/',
    description:
      'A 530-sample benchmark for supply-chain knowledge and long-horizon tool orchestration. SupChain-ReAct synthesizes procedures without manual SOPs and led tool-calling accuracy across 15+ models.',
    metric: '530 samples · 15+ models',
    topics: ['logistics', 'fulfillment', 'finance', 'tool calling'],
  },
  {
    index: 'R/03',
    title: 'VisualDeltas',
    type: 'Preference learning / arXiv',
    year: '2026',
    venue: 'arXiv 2603.07272',
    authorship: 'Co-author · 5 authors',
    href: 'https://arxiv.org/abs/2603.07272',
    description:
      'Turns visual quality perturbations into preference data without manual annotations, external reward models, or larger teacher models.',
    metric: 'up to +8.2%',
    topics: ['VLM', 'DPO', 'preference pairs', 'generalization'],
  },
] as const

export const notes = [
  {
    slug: 'why-agent-evaluation-is-hard',
    title: 'Why Agent Evaluation Is Hard',
    date: '2026-04-10',
    category: 'Research',
    excerpt: 'Lessons from building multi-turn evaluation benchmarks for real workflows.',
    readingTime: '6 min read',
    tags: ['Agents', 'Evaluation', 'Benchmarks'],
    intro:
      'Agent evaluation is fundamentally different from single-turn model evaluation. In a multi-turn setting, the agent makes a sequence of decisions, each affecting the state in which the next decision is made.',
    sections: [
      {
        title: 'State space explosion',
        body: 'In single-turn evaluation, you compare a model output against a reference. In multi-turn work, the state after each action changes the distribution of possible next states. A small error early can produce a completely different trajectory.',
      },
      {
        title: 'Compounding errors',
        body: 'If an agent makes a small mistake per turn, the probability of a fully correct trajectory drops quickly as the task gets longer. That is why I care about intermediate milestones, recovery behavior, and tool-use traces instead of final-answer scoring only.',
      },
      {
        title: 'What we measured',
        body: 'We designed evaluation around full task completion with partial credit for intermediate progress. This gives a more realistic picture of agent capability than pass/fail metrics on individual turns.',
      },
    ],
  },
  {
    slug: 'building-agents-that-actually-work',
    title: 'Building Agents That Actually Work',
    date: '2026-03-28',
    category: 'Engineering',
    excerpt: 'Practical patterns for designing agent systems that ship to production.',
    readingTime: '5 min read',
    tags: ['Agents', 'Engineering', 'Production'],
    intro:
      'Most agent demos look impressive but fall apart in production. The gap between “works in a notebook” and “works for real users” is where the actual engineering begins.',
    sections: [
      {
        title: 'Start with constraints',
        body: 'The best agent systems I have worked on started not with “what can the agent do?” but with “what must the agent not do?” Defining safety boundaries, operating constraints, and failure modes first leads to more robust systems.',
      },
      {
        title: 'Tool orchestration over fancy planning',
        body: 'Planning architectures get attention, but in production, clean tool interfaces, strong routing contracts, and observable traces usually matter more. Tool-use failures need to be visible, replayable, and easy to classify.',
      },
      {
        title: 'Observability is non-negotiable',
        body: 'If you cannot see what your agent is doing at every step, you cannot debug it. Structured logging, step-by-step traces, and rollback mechanisms are requirements, not polish.',
      },
    ],
  },
  {
    slug: 'post-training-lessons-from-production',
    title: 'Post-Training Lessons From Production',
    date: '2026-03-15',
    category: 'Post-training',
    excerpt: 'What I learned running SFT and RL loops on real business data.',
    readingTime: '5 min read',
    tags: ['Post-training', 'SFT', 'RL'],
    intro:
      'Post-training gets discussed as a recipe, but production data rarely behaves like a recipe. The hard part is not only choosing SFT or RL; it is building the loop around a measurable outcome.',
    sections: [
      {
        title: 'SFT first, RL second',
        body: 'Start with supervised fine-tuning to establish a behavioral baseline. Jumping straight to RL without a reliable checkpoint wastes compute and makes reward problems harder to diagnose.',
      },
      {
        title: 'Reward design is product design',
        body: 'In multi-objective settings, reward shaping is not a pure modeling detail. It encodes what the system values, what tradeoffs are acceptable, and which failures are too costly to tolerate.',
      },
      {
        title: 'Evaluate before training',
        body: 'Design the evaluation pipeline before running expensive loops. If you cannot measure the behavior you want, the training run will mostly teach you how weak your measurement is.',
      },
    ],
  },
  {
    slug: 'tool-use-is-a-product-interface',
    title: 'Tool Use Is a Product Interface',
    date: '2026-02-24',
    category: 'Engineering',
    excerpt: 'Agents negotiate with a product surface made of permissions, latency, and failure states.',
    readingTime: '4 min read',
    tags: ['Tool use', 'Agents', 'UX'],
    intro:
      'A tool schema is not only a technical contract. It is a product interface for the model. The names, arguments, permissions, and failure messages all shape how the agent behaves.',
    sections: [
      {
        title: 'Bad tools create bad reasoning',
        body: 'When tools are ambiguous, overlapping, or under-documented, the agent has to infer product semantics from weak signals. This often looks like reasoning failure, but the root cause is interface design.',
      },
      {
        title: 'Latency changes strategy',
        body: 'Slow tools push agents toward fewer calls and more guessing. Fast tools encourage verification. Evaluation should account for the actual tool environment, not an idealized offline setup.',
      },
      {
        title: 'Design for recoverability',
        body: 'Tool errors should be useful. A recoverable error message can turn a failed step into a replanning opportunity; a vague error message usually turns it into drift.',
      },
    ],
  },
  {
    slug: 'memory-is-not-one-feature',
    title: 'Memory Is Not One Feature',
    date: '2026-02-08',
    category: 'Research',
    excerpt: 'A practical taxonomy for session memory, long-term retrieval, and preferences.',
    readingTime: '5 min read',
    tags: ['Memory', 'RAG', 'Agents'],
    intro:
      'Memory in agent systems is often described as one feature, but it is really a set of different mechanisms with different failure modes.',
    sections: [
      {
        title: 'Three horizons',
        body: 'Turn-level memory helps the model stay coherent inside a local exchange. Session memory preserves task state across multiple turns. Persistent memory stores user or domain information beyond the immediate conversation.',
      },
      {
        title: 'Retrieval is a form factor',
        body: 'External memory is not automatically better than parametric memory. Retrieval gives adaptability and inspectability, but it also introduces ranking errors, context pressure, and stale information risks.',
      },
      {
        title: 'Evaluate memory by use',
        body: 'The right question is not “does the system remember?” The right question is whether memory improves task completion without leaking irrelevant context into decisions.',
      },
    ],
  },
  {
    slug: 'supchain-bench-notes',
    title: 'Notes On Supply-Chain Benchmarks',
    date: '2026-01-20',
    category: 'Research',
    excerpt: 'Why real-world supply-chain tasks expose gaps in generic LLM evaluation.',
    readingTime: '4 min read',
    tags: ['Supply chain', 'Benchmarks', 'Tool calling'],
    intro:
      'Supply-chain work is a good stress test for LLM systems because the tasks are operational, multi-step, and full of constraints. A plausible answer is not enough.',
    sections: [
      {
        title: 'Domain context matters',
        body: 'Logistics collaboration, warehouse fulfillment, finance, and customs workflows each require different assumptions. A benchmark that collapses them into generic QA misses the hard parts.',
      },
      {
        title: 'Tool calling is not a sideshow',
        body: 'Many supply-chain tasks require checking state, calling APIs, comparing constraints, and updating decisions. Evaluating only natural-language answers underestimates the system problem.',
      },
      {
        title: 'Procedures are often implicit',
        body: 'In real teams, procedures live across SOPs, tools, experts, and local habits. Benchmarks need to represent that messiness instead of assuming a clean textbook workflow.',
      },
    ],
  },
  {
    slug: 'visual-quality-as-preference-signal',
    title: 'Visual Quality As A Preference Signal',
    date: '2025-12-12',
    category: 'Research',
    excerpt: 'Controlled visual degradation can create preference pairs without manual labels.',
    readingTime: '4 min read',
    tags: ['VLM', 'DPO', 'Preference learning'],
    intro:
      'Visual reasoning can change when image quality changes. That sounds like a robustness problem, but it can also become a useful training signal.',
    sections: [
      {
        title: 'The core observation',
        body: 'If the same question induces better reasoning on a high-quality image than on a degraded version, the pair can act as a preference signal. The model is compared against its own quality-conditioned reasoning paths.',
      },
      {
        title: 'Why it is useful',
        body: 'This avoids manual preference labels, external reward models, and larger teacher models. The supervision comes from a controlled transformation of the input.',
      },
      {
        title: 'Where it helps',
        body: 'The approach is especially interesting for chart, table, and visual question-answering tasks where resolution affects OCR, object grounding, and multi-step reasoning.',
      },
    ],
  },
] as const

export const experience = [
  {
    time: '2025—Now',
    place: 'Alibaba',
    role: 'LLM Algorithm Engineer',
    location: 'Hangzhou',
    highlights: [
      'Built a benchmark-first supply-chain domain LLM through continual pretraining, SFT, and RL.',
      'Designed risk-routed agent systems and dynamic resolution across a pool of 100+ tools.',
    ],
  },
  {
    time: '2024—2025',
    place: 'Microsoft Research Asia',
    role: 'LLM Research Intern · M365 Copilot',
    location: 'Beijing',
    highlights: [
      'Contributed to an early GPT-4o production rollout for M365 Copilot email workflows.',
      'Designed a three-horizon memory architecture for long-context behavior.',
      'Built tree-structured retrieval and multi-turn evaluation for intent, completion, and consistency.',
    ],
  },
  {
    time: '2024',
    place: 'Meituan',
    role: 'Algorithm Intern',
    location: 'Beijing',
    highlights: [
      'Reproduced research and built reusable forecasting implementations independently.',
      'Combined dominant-frequency extraction with XGBoost and Random Forest for traffic-light countdown prediction.',
      'Improved prediction reliability at 3-, 5-, and 10-second horizons.',
    ],
  },
  {
    time: '2023—2025',
    place: 'National University of Singapore',
    role: 'MSc Statistics · Top 5%',
    location: 'Singapore',
    highlights: [
      'Studied statistics in the Faculty of Science and graduated in the top five percent of the major.',
      'Earned a 4.0 / 5.0 GPA at a university ranked QS global #8.',
    ],
  },
  {
    time: '2023',
    place: 'Singapore AI Visual',
    role: 'Algorithm Intern · Edge vision',
    location: 'Singapore',
    highlights: [
      'Built a lightweight CNN for multi-feature scalp microscopy detection with 85%+ accuracy.',
      'Optimized quantized inference to under 150 ms per image on a 2.4 GHz CPU.',
    ],
  },
  {
    time: '2022',
    place: 'AT&T TrackHack',
    role: 'Weak-supervision classification · Top 10 / 500+',
    location: 'United States',
    highlights: [
      'Combined PU learning, Random Forest, K-means, and recursive feature elimination.',
      'Reached 0.94 F1 while identifying households eligible for a broadband subsidy program.',
    ],
  },
  {
    time: '2022',
    place: 'Kaggle Starfish Detection',
    role: 'Underwater object detection',
    location: 'Remote',
    highlights: [
      'Used targeted image cropping, HOG, and color features to improve accuracy by roughly 30%.',
      'Combined sliding-window detection with non-maximum suppression for more reliable localization.',
    ],
  },
  {
    time: '2019—2022',
    place: 'University of New South Wales',
    role: 'BSc Computer Science · Top 3%',
    location: 'Sydney',
    highlights: [
      'Graduated with an 85/100 GPA in the top three percent of the major.',
      'Studied at a university ranked QS global #19.',
      'Academic Scholarship recipient and Dean’s List student from 2019 through 2022.',
    ],
  },
] as const

export const socials = [
  ['GitHub', 'https://github.com/Damon-GSY'],
  ['LinkedIn', 'https://www.linkedin.com/in/shengyue-guan-1a7b3226b/'],
  ['YouTube', 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA'],
  ['Bilibili', 'https://space.bilibili.com/358541297'],
] as const
