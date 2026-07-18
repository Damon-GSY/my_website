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
    index: '02 / Researcher',
    title: 'I study the failures that final-answer scores erase.',
    description:
      'Two first-author projects connect multi-turn agent evaluation with 530 real-world samples, annotated for supply-chain decisions and long-horizon tool traces.',
    evidence: '2× first author · ~250 papers mapped · ACL 2026 Findings',
  },
  {
    index: '03 / Creator',
    title: 'I publish the operating lessons, not just the outcomes.',
    description:
      'Field notes and videos turn agent evaluation, tool interfaces, memory, and post-training into methods other builders can inspect and reuse.',
    evidence: '7 field notes · YouTube / Bilibili · practical AI systems',
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
    outcome: {
      value: '−90%',
      label: 'misoperations',
      evidence: '−95% manual intervention · <1s handoff',
    },
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
    outcome: {
      value: '−90%',
      label: 'manual ticket handling',
      evidence: '100+ dynamic tools · runtime capability registry',
    },
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
    outcome: {
      value: 'SOTA',
      label: 'internal benchmark',
      evidence: 'continual pretraining → SFT → RL',
    },
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
    outcome: {
      value: 'Stable',
      label: 'multi-objective training',
      evidence: 'conditional reward · variance control · zero-gradient filtering · hierarchy',
    },
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
    title: 'Why agent evaluation is hard',
    date: '2026-04-10',
    category: 'Research',
    excerpt: 'What a survey of roughly 250 papers—and production traces—changed about how I score an agent.',
    tags: ['Agents', 'Evaluation', 'Benchmarks'],
    related: [
      { label: 'Multi-turn agent evaluation survey', href: 'https://arxiv.org/abs/2503.22458' },
    ],
    intro:
      'While mapping roughly 250 papers for our multi-turn agent evaluation survey, I kept finding the same mismatch: benchmarks reward the final answer, while production failures live inside the trajectory. The useful question is not only whether an agent finished, but whether it noticed drift, preserved state, and knew when to recover.',
    sections: [
      {
        title: 'Every action changes the test',
        body: 'A tool call, clarification, or premature commitment changes the state presented to the next turn. Two agents can produce the same final sentence after taking very different paths; one preserved the user’s constraints, while the other arrived there by luck. That branching state is why replayable traces matter more than a larger answer-key spreadsheet.',
      },
      {
        title: 'Score the dependency chain',
        body: 'I prefer to score intermediate milestones and the dependencies between them: was the task modeled correctly, did the plan respect available tools, and did later actions use earlier evidence? Agent-as-Judge becomes useful when it evaluates this chain instead of simply grading the last message with another model.',
      },
      {
        title: 'Recovery is a capability',
        body: 'A strong agent should re-plan after a tool fails, a result contradicts its assumption, or the user changes intent. Current test sets still under-measure these cross-turn corrections. I treat recovery latency, repeated failure, and the decision to ask for help as first-class outcomes—not cleanup around the “real” benchmark.',
      },
      {
        title: 'The minimum useful report',
        body: 'A useful evaluation report should separate planning, tool execution, memory horizon, and recovery, then connect each failure to a trace that can be replayed. One aggregate score is easy to compare and almost impossible to improve. A capability surface tells the team what to train, what to redesign, and what should remain under human authority.',
      },
    ],
  },
  {
    slug: 'building-agents-that-actually-work',
    title: 'Building agents that actually work',
    date: '2026-03-28',
    category: 'Engineering',
    excerpt: 'Lessons from routing authority across 12 supply-chain scenarios and more than 100 tools.',
    tags: ['Agents', 'Engineering', 'Production'],
    related: [
      { label: 'Supply Chain Agent System', href: '/work/risk-router' },
      { label: 'Dynamic Tool Resolution', href: '/work/tool-resolver' },
    ],
    intro:
      'The agent system I trust most is rarely the one with the longest plan. Across 12 supply-chain scenarios, the decisive work was defining authority, tool contracts, traces, and a path back to a person before the model made an irreversible decision.',
    sections: [
      {
        title: 'Route authority before intent',
        body: 'A routine lookup and an operational change should not share one autonomy threshold. We made risk a routed system state: observe the requested action, narrow the available tools, request progressive confirmation when consequences rise, and keep high-risk execution outside the model’s blanket permission.',
      },
      {
        title: 'A tool pool is an interface',
        body: 'Once the internal pool passed 100 tools, a static prompt stopped being a reasonable capability layer. Dynamic resolution separated discovery from execution and exposed whether the system chose the wrong tool, found no valid tool, or called one it did not need. Those are different product failures and different training signals.',
      },
      {
        title: 'Design the handoff as a fast path',
        body: 'Human review is not a failure state if the transition preserves context. The useful target was a sub-second exception handoff with the intent, risk tier, attempted actions, and current state already attached. A person should inherit the decision—not reconstruct the conversation.',
      },
      {
        title: 'Let traces close the loop',
        body: 'Structured traces turned production incidents into a failure taxonomy the team could evaluate and train against. That loop matters more than a polished demo: observe a failure, classify the decision that caused it, change the policy or reward, and replay the same trajectory before shipping again.',
      },
    ],
  },
  {
    slug: 'post-training-lessons-from-production',
    title: 'Post-training lessons from production',
    date: '2026-03-15',
    category: 'Post-training',
    excerpt: 'Why I define the capability surface before choosing a continual pretraining, SFT, or RL recipe.',
    tags: ['Post-training', 'SFT', 'RL'],
    related: [
      { label: 'Supply-Chain Domain LLM', href: '/work/domain-model' },
      { label: 'Multi-objective GRPO', href: '/work/reward-system' },
    ],
    intro:
      'On a supply-chain domain model, knowledge accuracy and reliable tool execution improved at different rates. That made the main lesson uncomfortable but useful: the training recipe is downstream of the measurement contract, not the other way around.',
    sections: [
      {
        title: 'Write the benchmark first',
        body: 'We built a dual-axis benchmark for knowledge QA and tool use before the expensive loop began. This prevented an aggregate score from hiding a model that knew the domain answer but could not execute the workflow—or one that called tools fluently without enough domain knowledge to judge the result.',
      },
      {
        title: 'Keep each gain attributable',
        body: 'Continual pretraining, SFT, and RL can all move the same headline metric. I track business-facing capability slices after every stage so a gain has an owner and a regression has a location. Otherwise the final checkpoint becomes an opaque average of several unrelated changes.',
      },
      {
        title: 'Use SFT to establish behavior',
        body: 'SFT gave us a stable behavioral baseline before RL introduced another source of variance. Starting from a checkpoint that already followed the task format made it easier to distinguish a reward problem from a basic instruction-following problem.',
      },
      {
        title: 'Reward design is product design',
        body: 'In multi-objective GRPO, frequent product-attribute tasks can dominate gradients and erase progress on rarer decisions. Conditional rewards, sample-level variance control, zero-gradient filtering, and an explicit hierarchy were not mathematical decoration; they encoded which downstream mistakes the product could tolerate.',
      },
    ],
  },
  {
    slug: 'tool-use-is-a-product-interface',
    title: 'Tool use is a product interface',
    date: '2026-02-24',
    category: 'Engineering',
    excerpt: 'What a dynamic registry of 100+ capabilities taught me about names, permissions, latency, and failure states.',
    tags: ['Tool use', 'Agents', 'UX'],
    related: [
      { label: 'Dynamic Tool Resolution', href: '/work/tool-resolver' },
    ],
    intro:
      'A model never sees the product directly. It sees tool names, argument schemas, permissions, response latency, and error messages. When that surface is ambiguous, the resulting behavior is usually called a reasoning failure even though the interface failed first.',
    sections: [
      {
        title: 'Separate discovery from execution',
        body: 'A prompt containing 100+ changing tools is both expensive and stale. We let a meta tool search a dynamic capability registry, then passed only the selected contract into execution. This made capability discovery observable and allowed registration to change without retraining the agent’s static memory of the pool.',
      },
      {
        title: 'Latency changes strategy',
        body: 'Slow tools encourage the model to guess instead of verify; cheap tools can trigger unnecessary exploration. I evaluate agents in the actual tool environment because latency, retries, and permission checks change the policy. An offline answer score cannot reveal that shift.',
      },
      {
        title: 'Name the failure precisely',
        body: 'Wrong-tool, missing-tool, invalid-argument, and over-tooling traces should not collapse into one “tool error.” Each points to a different repair: improve discovery, add a capability, clarify a contract, or teach the policy to stop. Precise failure semantics turn an error message into a replanning interface.',
      },
    ],
  },
  {
    slug: 'memory-is-not-one-feature',
    title: 'Memory is not one feature',
    date: '2026-02-08',
    category: 'Research',
    excerpt: 'The three-horizon model I used to separate local coherence, session state, and persistent preferences.',
    tags: ['Memory', 'RAG', 'Agents'],
    related: [
      { label: 'Multi-turn agent evaluation survey', href: 'https://arxiv.org/abs/2503.22458' },
    ],
    intro:
      'During my work on M365 Copilot email workflows at Microsoft Research Asia, “memory” quickly stopped being a useful single noun. Local conversational coherence, progressive task state, external documents, and user preferences need different storage, retrieval, and evaluation contracts.',
    sections: [
      {
        title: 'Three horizons',
        body: 'Turn-level memory keeps a local exchange coherent. Progressive in-conversation memory compresses the state of a longer task. Persistent memory retrieves documents and preferences beyond the session. Mixing these horizons makes it difficult to tell whether the model forgot, retrieved the wrong evidence, or preserved something it should have discarded.',
      },
      {
        title: 'Structure before similarity',
        body: 'For long documents, I explored tree-structured retrieval that maps content to section and paragraph coordinates: locate the relevant region first, then read continuously around it. This preserves cross-paragraph context better than collecting isolated chunks that happen to share vocabulary.',
      },
      {
        title: 'Remembering can make the agent worse',
        body: 'External memory adds ranking errors, stale evidence, privacy boundaries, and context pressure. Persistent preferences can also overfit a past behavior to a new task. More recalled tokens are not a success metric; the system should retrieve only what changes the current decision.',
      },
      {
        title: 'Evaluate memory by consequence',
        body: 'I evaluate whether memory improves intent understanding, task completion, and cross-turn consistency without leaking irrelevant context. The question is not “did the agent remember?” It is “did the right memory alter the right decision, and can we inspect why?”',
      },
    ],
  },
  {
    slug: 'supchain-bench-notes',
    title: 'Notes on supply-chain benchmarks',
    date: '2026-01-20',
    category: 'Research',
    excerpt: 'What 530 annotated samples across logistics, fulfillment, and finance reveal about generic evaluation.',
    tags: ['Supply chain', 'Benchmarks', 'Tool calling'],
    related: [
      { label: 'SupChain-Bench · ACL Findings', href: 'https://aclanthology.org/2026.findings-acl.371/' },
    ],
    intro:
      'We built SupChain-Bench because a plausible answer is cheap in a domain where the next step may update inventory, release a shipment, or affect a financial workflow. Its 530 annotated samples force models to combine domain knowledge with constrained, multi-step tool use.',
    sections: [
      {
        title: 'One domain contains several operating worlds',
        body: 'Logistics collaboration, warehouse fulfillment, and finance or customs workflows use different assumptions, tools, and failure costs. Treating them as generic “supply-chain QA” erases the constraints that make the tasks operationally meaningful.',
      },
      {
        title: 'Data construction needs disagreement',
        body: 'We used a heterogeneous multi-model generation process and expert review rather than trusting one model to generate both the question and its authority. Model disagreement was useful: it surfaced ambiguous assumptions and weak tool sequences before they entered the benchmark.',
      },
      {
        title: 'Procedures are often implicit',
        body: 'Real procedures live across SOPs, tools, experts, and local habits. SupChain-ReAct synthesizes an execution procedure through multiple reasoning paths and voting instead of assuming a hand-written SOP already exists for every case.',
      },
      {
        title: 'Tool calling exposes the real gap',
        body: 'Across more than 15 mainstream models, the difficult part was not producing fluent supply-chain language. It was choosing and sequencing capabilities while preserving constraints over a long horizon. That is the gap a real-world benchmark should make impossible to hide.',
      },
    ],
  },
  {
    slug: 'visual-quality-as-preference-signal',
    title: 'Visual quality as a preference signal',
    date: '2025-12-12',
    category: 'Research',
    excerpt: 'How controlled resolution changes produce preference pairs without labels, reward models, or larger teachers.',
    tags: ['VLM', 'DPO', 'Preference learning'],
    related: [
      { label: 'VisualDeltas paper', href: 'https://arxiv.org/abs/2603.07272' },
    ],
    intro:
      'VisualDeltas started from a simple observation: the same vision-language model can take a better reasoning path when the input retains more visual information. Instead of treating that difference only as a robustness failure, we use it as supervision.',
    sections: [
      {
        title: 'Create a controlled delta',
        body: 'We ask the same question over a high-quality image and a deliberately degraded version. When quality changes the reasoning path, the pair provides a structured positive and negative example tied to one controlled input difference rather than two unrelated model outputs.',
      },
      {
        title: 'Let the model supervise itself',
        body: 'The method does not require manual preference labels, an external reward model, or a larger teacher. DPO learns from the model’s own quality-conditioned reasoning paths, which keeps the supervision source cheap and inspectable.',
      },
      {
        title: 'Generalization is the useful result',
        body: 'Across HiTab, WikiTQ, VQA, GQA, and MathVision settings, the strongest improvements reached +8.2%. More important to me, the preference signal generalized across datasets better than reinforcement fine-tuning, suggesting the model learned a broader visual reasoning preference instead of memorizing one benchmark.',
      },
    ],
  },
] as const

const READING_WORDS_PER_MINUTE = 200

export function getReadingTime(note: (typeof notes)[number]) {
  const text = [
    note.intro,
    ...note.sections.flatMap((section) => [section.title, section.body]),
  ].join(' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / READING_WORDS_PER_MINUTE))} min read`
}

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
