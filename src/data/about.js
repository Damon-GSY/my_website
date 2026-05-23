export const timelineData = [
  {
    title: '2025',
    entries: [
      {
        track: 'Full-time',
        title: 'LLM Algorithm Engineer @ Alibaba',
        location: 'Hangzhou, China',
        points: [
          'Led end-to-end training of a supply-chain domain LLM: built a dual-axis benchmark for knowledge QA and tool use, then achieved internal SOTA through continual pretraining plus integrated SFT/RL.',
          'Trained a multi-task, multi-objective product-attribute model (fulfillment, bundle consolidation, HS Code, etc.); addressed GRPO gradient imbalance with conditional reward design, variance control, zero-gradient filtering, and hierarchical rewards.',
          'Designed agentic RL training for ticket-resolution assistants and implemented dynamic tool registration (100+ tools), enabling Meta Tool access to a dynamic tool pool and reducing manual ticket handling by 90%.',
          'Built a risk-tiered multi-turn decision framework with progressive confirmations and explicit automation boundaries; reduced misoperations by 90%, cut manual interventions by 95%, and brought exception handoff latency below 1 second across 12 supply-chain scenarios.',
        ],
      },
      {
        track: 'Research',
        title: 'Evaluating LLM-based Agents for Multi-turn Conversation',
        location: 'Research Paper | 2025',
        points: [
          'Systematically reviewed around 250 papers and built a two-layer taxonomy that defines both what to evaluate and how to evaluate multi-turn LLM agents.',
          'Constructed a three-layer tool-use evaluation framework covering API execution accuracy, cross-turn multi-step tool-chain reasoning, and tool-hallucination detection.',
          'Identified a key benchmark gap in cross-turn replanning: current test sets under-evaluate whether an agent can recover and re-plan after step failures or user-intent shifts.',
          'Proposed a four-dimension planning evaluation framework: task modeling, task decomposition, in-dialog dynamic adjustment, and self-reflection plus verification.',
          'Defined a three-level memory-horizon taxonomy (turn-level memory, session memory, and persistent memory) with differentiated evaluation criteria and benchmarks.',
          'Separated memory form into an explicit evaluation axis: parametric memory in model weights versus external retrieval memory in textual storage, with distinct tradeoffs in adaptability and reasoning speed.',
          'Introduced Agent-as-Judge as a multi-turn evaluation paradigm that scores intermediate steps and dependency chains, yielding stronger alignment with human judgments than final-answer-only evaluation.',
        ],
      },
      {
        track: 'Research',
        title: 'SupChain-Bench: Benchmarking Large Language Models for Real-World Supply Chain Management',
        location: 'Research Paper | 2025',
        points: [
          'Built SupChain-Bench, the first unified supply-chain benchmark spanning logistics collaboration, warehouse fulfillment, and finance/customs workflows with 530 annotated real-world samples.',
          'Designed a multi-stage data-construction pipeline with a heterogeneous multi-model generation framework, significantly improving QA quality over single-model data pipelines under expert review.',
          'Proposed SupChain-ReAct, which synthesizes execution procedures without manual SOPs through multi-path reasoning and voting; achieved the best tool-calling accuracy across 15+ mainstream LLMs.',
        ],
      },
      {
        track: 'Research',
        title: 'VisualDeltas: Learning Preferences from Visual Quality-Induced Reasoning',
        location: 'Research Paper | 2025',
        points: [
          'Observed that VLM reasoning paths are highly sensitive to visual quality: the same question on high- versus low-resolution inputs can induce divergent reasoning behaviors that become supervision signals.',
          'Eliminated manual labels, external reward models, and larger teacher models by generating positive/negative preference pairs through controlled image-resolution degradation, then optimizing with DPO.',
          'On HiTab, WikiTQ, VQA, GQA, and MathVision, VD-S improved over baseline by up to +8.2%; compared with RFT, VisualDeltas generalized better across datasets while reducing overfitting risk.',
        ],
      },
    ],
  },
  {
    title: '2024',
    entries: [
      {
        track: 'Internship',
        title: 'LLM Intern @ Microsoft Research Asia (MSRA)',
        location: 'Beijing, China | MC AI Group | 2024.09 — 2025.02',
        points: [
          'Contributed to one of the first GPT-4o production rollouts in M365 Copilot, focusing on LLM capability development and evaluation for email workflows.',
          'Designed a three-layer memory architecture for long-context degradation: external long-term memory (vector store + RAG), in-conversation progressive memory (summarized cache), and personalized user-preference modeling.',
          'Proposed a tree-structured retrieval method that maps documents to hierarchical section/paragraph coordinates and follows a "locate first, read continuously" path for more stable cross-paragraph reasoning.',
          'Built an LLM-based multi-turn evaluation framework covering intent understanding, task completion, and contextual consistency for automated end-to-end quality checks.',
        ],
      },
      {
        track: 'Internship',
        title: 'Algorithm Intern @ Meituan',
        location: 'Beijing, China | 2024.05 — 2024.08',
        points: [
          'Independently led technical research and paper reproduction, delivering reusable algorithm implementations and engineering references.',
          'Addressed harmonic interference and divisor ambiguity in traffic-light countdown prediction using Fourier-based dominant-frequency extraction plus XGBoost/Random Forest ensemble forecasting.',
          'Improved prediction accuracy at 3s, 5s, and 10s horizons, providing more reliable timing signals for rider route planning.',
        ],
      },
    ],
  },
  {
    title: '2023',
    entries: [
      {
        track: 'Education',
        title: 'National University of Singapore (NUS)',
        location: 'Singapore | 2023.08 — 2025.02',
        points: [
          'Statistics, Faculty of Science.',
          'QS Global Rank #8.',
          'GPA: 4.0 / 5.0 (Top 5% in major).',
        ],
      },
      {
        track: 'Internship',
        title: 'Algorithm Intern @ Singapore AI Visual',
        location: 'Singapore | 2023.07 — 2023.12',
        points: [
          'Built a MobileNet-class lightweight CNN from scratch for multi-feature scalp microscopy detection (redness, dandruff, follicle blockage, etc.).',
          'Raised key feature-detection accuracy to 85%+ through data augmentation, loss tuning, and architecture iteration, improving overall accuracy by about 10% versus the baseline.',
          'Optimized quantization and inference acceleration for edge deployment, reducing per-image latency to under 150ms on a 2.4GHz CPU.',
        ],
      },
    ],
  },
  {
    title: '2022',
    entries: [
      {
        track: 'Project / Competition',
        title: 'Kaggle Starfish Object Detection',
        location: '2022.09 — 2022.12',
        points: [
          'The competition focused on efficient and accurate starfish detection in coral-reef underwater videos.',
          'Analyzed starfish image features (HOG and color histograms) and applied targeted image cropping, improving accuracy by roughly 30%.',
          'Combined sliding-window detection with non-maximum suppression (NMS) to produce more precise and reliable localization results.',
        ],
      },
      {
        track: 'Project / Competition',
        title: 'AT&T TrackHack (US)',
        location: '2022.02 — 2022.05',
        points: [
          'Initiated by AT&T, the project aimed to identify and serve low-income households eligible for a broadband subsidy program ($50/month).',
          'Built a binary classification pipeline under weak supervision with large unlabeled data and positive-only labeled samples.',
          'Combined PU learning, Random Forest, K-means, and RSFE; achieved a 0.94 F1 score and ranked in the top 10 among 500+ teams.',
        ],
      },
    ],
  },
  {
    title: '2019',
    entries: [
      {
        track: 'Education',
        title: 'University of New South Wales (UNSW)',
        location: 'Sydney, Australia | 2019.09 — 2022.12',
        points: [
          'Computer Science and Technology.',
          'QS Global Rank #19.',
          'GPA: 85 / 100 (Top 3% in major).',
          'Academic Scholarship recipient and Dean List (2019–2022).',
        ],
      },
    ],
  },
];

export const aboutProfile = {
  title: 'About Me',
  intro:
    'AI researcher and algorithm engineer focused on LLM systems, post-training, and agentic reinforcement learning.',
  focus:
    'I bridge research and production: from benchmark design and training pipelines to deployable agent systems in real business scenarios.',
  facts: [
    { label: 'Current Role', value: 'Alibaba · LLM Engineer' },
    { label: 'Graduate School', prefix: 'NUS · QS #', ticker: 8 },
    { label: 'Undergraduate', prefix: 'UNSW · QS #', ticker: 19 },
  ],
};
