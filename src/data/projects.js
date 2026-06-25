export const projects = [
  {
    id: 'supply-chain-agent-system',
    title: 'Supply Chain Agent System',
    kicker: 'Production AI',
    year: '2025',
    stage: 'Alibaba',
    description:
      'A risk-tiered multi-turn decision framework for 12 supply-chain scenarios, with progressive confirmations, explicit automation boundaries, and sub-second exception handoff.',
    outcome:
      'Reduced misoperations by 90%, cut manual interventions by 95%, and brought exception handoff latency below 1 second.',
    details: [
      'Designed automation boundaries for high-risk actions.',
      'Built progressive confirmation flows for multi-turn decision making.',
      'Connected agent execution traces with exception handoff paths.',
    ],
    tags: ['Agents', 'Supply Chain', 'Production'],
    category: 'production',
    href: '/about',
    featured: true,
  },
  {
    id: 'dynamic-tool-resolution-agents',
    title: 'Dynamic Tool Resolution Agents',
    kicker: 'Agentic RL',
    year: '2025',
    stage: 'Alibaba',
    description:
      'Agentic RL training for ticket-resolution assistants using dynamic tool registration and Meta Tool access to a changing pool of 100+ tools.',
    outcome: 'Reduced manual ticket handling by 90% in supported workflows.',
    details: [
      'Implemented dynamic tool registration for a large internal tool pool.',
      'Trained agents around tool-use decisions rather than final answers only.',
      'Designed traces that expose wrong-tool, missing-tool, and over-tooling failures.',
    ],
    tags: ['Agentic RL', 'Tool Use', 'Evaluation'],
    category: 'production',
    href: '/about',
    featured: true,
  },
  {
    id: 'supply-chain-domain-llm',
    title: 'Supply-Chain Domain LLM',
    kicker: 'Post-Training',
    year: '2025',
    stage: 'Alibaba',
    description:
      'End-to-end domain LLM training for supply-chain knowledge QA and tool use, combining benchmark design, continual pretraining, SFT, and RL.',
    outcome: 'Achieved internal SOTA on a dual-axis benchmark for knowledge QA and tool-use capability.',
    details: [
      'Built a dual-axis benchmark before training loops began.',
      'Combined continual pretraining with integrated SFT/RL alignment.',
      'Tracked model improvements against business-facing capability slices.',
    ],
    tags: ['LLM', 'SFT', 'RL'],
    category: 'production',
    href: '/about',
    featured: true,
  },
  {
    id: 'multi-turn-agent-evaluation',
    title: 'Multi-Turn Agent Evaluation Taxonomy',
    kicker: 'Research',
    year: '2025',
    stage: 'Paper',
    description:
      'A survey and evaluation taxonomy for LLM-based agents in multi-turn conversation, covering planning, tool use, memory, and Agent-as-Judge scoring.',
    outcome:
      'Reviewed around 250 papers and proposed evaluation axes for cross-turn replanning, memory horizon, and intermediate-step judgment.',
    details: [
      'Separated what to evaluate from how to evaluate.',
      'Defined planning, memory, and tool-use evaluation layers.',
      'Identified benchmark gaps around failure recovery and intent shifts.',
    ],
    tags: ['Agents', 'Evaluation', 'Survey'],
    category: 'research',
    href: '/about',
    featured: true,
  },
  {
    id: 'supchain-bench',
    title: 'SupChain-Bench',
    kicker: 'Research',
    year: '2025',
    stage: 'Paper',
    description:
      'A unified supply-chain benchmark spanning logistics collaboration, warehouse fulfillment, and finance/customs workflows with 530 annotated real-world samples.',
    outcome:
      'Introduced SupChain-ReAct for synthesizing execution procedures without manual SOPs through multi-path reasoning and voting.',
    details: [
      'Covered logistics, fulfillment, finance, and customs tasks.',
      'Used heterogeneous multi-model generation plus expert review.',
      'Evaluated tool-calling accuracy across mainstream LLMs.',
    ],
    tags: ['Benchmark', 'Supply Chain', 'Tool Calling'],
    category: 'research',
    href: '/about',
    featured: false,
  },
  {
    id: 'visualdeltas',
    title: 'VisualDeltas',
    kicker: 'Research',
    year: '2025',
    stage: 'Paper',
    description:
      'Preference learning from visual quality-induced reasoning, using controlled image-resolution degradation to create positive/negative preference pairs.',
    outcome:
      'Improved over baselines by up to +8.2% across HiTab, WikiTQ, VQA, GQA, and MathVision settings.',
    details: [
      'Removed the need for manual labels or external reward models.',
      'Converted visual-quality sensitivity into DPO preference data.',
      'Reduced overfitting risk compared with reinforcement fine-tuning.',
    ],
    tags: ['VLM', 'DPO', 'Preference Learning'],
    category: 'research',
    href: '/about',
    featured: false,
  },
  {
    id: 'm365-copilot-memory-eval',
    title: 'M365 Copilot Memory Evaluation',
    kicker: 'Internship',
    year: '2024',
    stage: 'MSRA',
    description:
      'Long-context memory architecture and multi-turn evaluation work for M365 Copilot email workflows during an early GPT-4o production rollout.',
    outcome:
      'Designed evaluation coverage for intent understanding, task completion, and contextual consistency.',
    details: [
      'Proposed external long-term memory, progressive in-conversation memory, and personalized preferences.',
      'Explored tree-structured retrieval for document section and paragraph localization.',
      'Built automated end-to-end quality checks for multi-turn email tasks.',
    ],
    tags: ['Memory', 'RAG', 'Copilot'],
    category: 'research',
    href: '/about',
    featured: false,
  },
  {
    id: 'product-attribute-rl',
    title: 'Product Attribute Multi-Objective RL',
    kicker: 'Post-Training',
    year: '2025',
    stage: 'Alibaba',
    description:
      'A multi-task product-attribute model covering fulfillment, bundle consolidation, HS Code, and related supply-chain decisions.',
    outcome:
      'Stabilized GRPO training with conditional rewards, variance control, zero-gradient filtering, and hierarchical reward design.',
    details: [
      'Handled conflicting reward objectives across product attributes.',
      'Reduced gradient imbalance in multi-objective RL loops.',
      'Aligned model behavior with downstream supply-chain decisions.',
    ],
    tags: ['GRPO', 'Rewards', 'Post-Training'],
    category: 'production',
    href: '/about',
    featured: false,
  },
  {
    id: 'ai-content-engine',
    title: 'AI Content Engine',
    kicker: 'Creator System',
    year: '2026',
    stage: 'Side Project',
    description:
      'A lightweight content workflow for turning papers and production lessons into structured scripts, bilingual notes, and short-form AI explainers.',
    outcome:
      'Supports consistent publishing across YouTube, Bilibili, and LinkedIn without losing the technical thread.',
    details: [
      'Extracts paper claims, assumptions, and evaluation settings.',
      'Turns research notes into script outlines and social snippets.',
      'Keeps source links and caveats attached to each draft.',
    ],
    tags: ['Content', 'Automation', 'Research Notes'],
    category: 'side-project',
    href: 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA',
    featured: false,
  },
];
