export const posts = [
  {
    slug: 'why-agent-evaluation-is-hard',
    title: 'Why Agent Evaluation Is Hard',
    date: '2026-04-10',
    category: 'Research',
    featured: true,
    excerpt:
      'Lessons from building multi-turn evaluation benchmarks for real workflows.',
    tags: ['Agents', 'Evaluation', 'Benchmarks'],
    readingTime: '6 min read',
    content: `
      <p>Agent evaluation is fundamentally different from single-turn model evaluation. In a multi-turn setting, the agent makes a sequence of decisions, each affecting the state the next decision is made in.</p>
      <p>This creates three core challenges: state space explosion, compounding errors, and the gap between proxy metrics and real outcomes.</p>
      <h2>State Space Explosion</h2>
      <p>In single-turn evaluation, you compare a model output against a reference. In multi-turn work, the state after each action changes the distribution of possible next states. A small error early can produce a completely different trajectory.</p>
      <h2>Compounding Errors</h2>
      <p>If an agent makes a small mistake per turn, the probability of a fully correct trajectory drops quickly as the task gets longer. That is why I care about intermediate milestones, recovery behavior, and tool-use traces instead of final-answer scoring only.</p>
      <h2>What We Did</h2>
      <p>We designed evaluation around full task completion with partial credit for intermediate progress. This gives a more realistic picture of agent capability than pass/fail metrics on individual turns.</p>
    `,
  },
  {
    slug: 'building-agents-that-actually-work',
    title: 'Building Agents That Actually Work',
    date: '2026-03-28',
    category: 'Engineering',
    excerpt:
      'Practical patterns for designing agent systems that ship to production.',
    tags: ['Agents', 'Engineering', 'Production'],
    readingTime: '5 min read',
    content: `
      <p>Most agent demos look impressive but fall apart in production. The gap between "works in a notebook" and "works for real users" is where the actual engineering begins.</p>
      <h2>Start With Constraints</h2>
      <p>The best agent systems I have worked on started not with "what can the agent do?" but with "what must the agent not do?" Defining safety boundaries, operating constraints, and failure modes first leads to more robust systems.</p>
      <h2>Tool Orchestration Over Fancy Planning</h2>
      <p>Planning architectures get attention, but in production, clean tool interfaces, strong routing contracts, and observable traces usually matter more. Tool-use failures need to be visible, replayable, and easy to classify.</p>
      <h2>Observability Is Non-Negotiable</h2>
      <p>If you cannot see what your agent is doing at every step, you cannot debug it. Structured logging, step-by-step traces, and rollback mechanisms are requirements, not polish.</p>
    `,
  },
  {
    slug: 'post-training-lessons-from-production',
    title: 'Post-Training Lessons From Production',
    date: '2026-03-15',
    category: 'Post-Training',
    excerpt:
      'What I learned running SFT and RL loops on real business data.',
    tags: ['Post-Training', 'SFT', 'RL'],
    readingTime: '5 min read',
    content: `
      <p>Post-training gets discussed as a recipe, but production data rarely behaves like a recipe. The hard part is not only choosing SFT or RL; it is building the loop around a measurable outcome.</p>
      <h2>SFT First, RL Second</h2>
      <p>Start with supervised fine-tuning to establish a behavioral baseline. Jumping straight to RL without a reliable checkpoint wastes compute and makes reward problems harder to diagnose.</p>
      <h2>Reward Design Is Product Design</h2>
      <p>In multi-objective settings, reward shaping is not a pure modeling detail. It encodes what the system values, what tradeoffs are acceptable, and which failures are too costly to tolerate.</p>
      <h2>Evaluate Before Training</h2>
      <p>Design the evaluation pipeline before running expensive loops. If you cannot measure the behavior you want, the training run will mostly teach you how weak your measurement is.</p>
    `,
  },
  {
    slug: 'tool-use-is-a-product-interface',
    title: 'Tool Use Is a Product Interface',
    date: '2026-02-24',
    category: 'Engineering',
    excerpt:
      'Agents do not just call tools; they negotiate with a product surface made of permissions, latency, and failure states.',
    tags: ['Tool Use', 'Agents', 'UX'],
    readingTime: '4 min read',
    content: `
      <p>A tool schema is not only a technical contract. It is a product interface for the model. The names, arguments, permissions, and failure messages all shape how the agent behaves.</p>
      <h2>Bad Tools Create Bad Reasoning</h2>
      <p>When tools are ambiguous, overlapping, or under-documented, the agent has to infer product semantics from weak signals. This often looks like reasoning failure, but the root cause is interface design.</p>
      <h2>Latency Changes Strategy</h2>
      <p>Slow tools push agents toward fewer calls and more guessing. Fast tools encourage verification. Evaluation should account for the actual tool environment, not an idealized offline setup.</p>
      <h2>Design For Recoverability</h2>
      <p>Tool errors should be useful. A recoverable error message can turn a failed step into a replanning opportunity; a vague error message usually turns it into drift.</p>
    `,
  },
  {
    slug: 'memory-is-not-one-feature',
    title: 'Memory Is Not One Feature',
    date: '2026-02-08',
    category: 'Research',
    excerpt:
      'A practical taxonomy for thinking about session memory, long-term retrieval, and user preference modeling.',
    tags: ['Memory', 'RAG', 'Agents'],
    readingTime: '5 min read',
    content: `
      <p>Memory in agent systems is often described as one feature, but it is really a set of different mechanisms with different failure modes.</p>
      <h2>Three Horizons</h2>
      <p>Turn-level memory helps the model stay coherent inside a local exchange. Session memory preserves task state across multiple turns. Persistent memory stores user or domain information beyond the immediate conversation.</p>
      <h2>Retrieval Is A Form Factor</h2>
      <p>External memory is not automatically better than parametric memory. Retrieval gives adaptability and inspectability, but it also introduces ranking errors, context pressure, and stale information risks.</p>
      <h2>Evaluate Memory By Use</h2>
      <p>The right question is not "does the system remember?" The right question is whether memory improves task completion without leaking irrelevant context into decisions.</p>
    `,
  },
  {
    slug: 'supchain-bench-notes',
    title: 'Notes On Supply-Chain Benchmarks',
    date: '2026-01-20',
    category: 'Research',
    excerpt:
      'Why real-world supply-chain tasks expose gaps in generic LLM evaluation.',
    tags: ['Supply Chain', 'Benchmarks', 'Tool Calling'],
    readingTime: '4 min read',
    content: `
      <p>Supply-chain work is a good stress test for LLM systems because the tasks are operational, multi-step, and full of constraints. A plausible answer is not enough.</p>
      <h2>Domain Context Matters</h2>
      <p>Logistics collaboration, warehouse fulfillment, finance, and customs workflows each require different assumptions. A benchmark that collapses them into generic QA misses the hard parts.</p>
      <h2>Tool Calling Is Not A Sideshow</h2>
      <p>Many supply-chain tasks require checking state, calling APIs, comparing constraints, and updating decisions. Evaluating only natural-language answers underestimates the system problem.</p>
      <h2>Procedures Are Often Implicit</h2>
      <p>In real teams, procedures live across SOPs, tools, experts, and local habits. Benchmarks need to represent that messiness instead of assuming a clean textbook workflow.</p>
    `,
  },
  {
    slug: 'visual-quality-as-preference-signal',
    title: 'Visual Quality As A Preference Signal',
    date: '2025-12-12',
    category: 'Research',
    excerpt:
      'How controlled visual degradation can create preference pairs without manual labels or teacher models.',
    tags: ['VLM', 'DPO', 'Preference Learning'],
    readingTime: '4 min read',
    content: `
      <p>Visual reasoning can change when image quality changes. That sounds like a robustness problem, but it can also become a useful training signal.</p>
      <h2>The Core Observation</h2>
      <p>If the same question induces better reasoning on a high-quality image than on a degraded version, the pair can act as a preference signal. The model is compared against its own quality-conditioned reasoning paths.</p>
      <h2>Why It Is Useful</h2>
      <p>This avoids manual preference labels, external reward models, and larger teacher models. The supervision comes from a controlled transformation of the input.</p>
      <h2>Where It Helps</h2>
      <p>The approach is especially interesting for chart, table, and visual question-answering tasks where resolution affects OCR, object grounding, and multi-step reasoning.</p>
    `,
  },
];
