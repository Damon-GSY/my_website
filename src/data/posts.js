export const posts = [
  {
    slug: 'why-agent-evaluation-is-hard',
    title: 'Why Agent Evaluation Is Hard',
    date: '2026-04-10',
    excerpt:
      'Lessons from building multi-turn evaluation benchmarks for real workflows.',
    tags: ['Agents', 'Evaluation'],
    content: `<p>Agent evaluation is fundamentally different from single-turn model evaluation. In a multi-turn setting, the agent makes a sequence of decisions, each affecting the state the next decision is made in.</p><p>This creates three core challenges: state space explosion, compounding errors, and the gap between proxy metrics and real outcomes.</p><h2>State Space Explosion</h2><p>In single-turn evaluation, you compare a model output against a reference. In multi-turn, the state after each action changes the distribution of possible next states. A small error early compounds into a completely different trajectory.</p><h2>Compounding Errors</h2><p>If an agent makes a 5% error rate per turn, after 10 turns the probability of a completely correct trajectory drops to about 60%. After 20 turns, it's under 36%. This isn't a linear problem — it's exponential.</p><h2>What We Did</h2><p>We designed a benchmark that evaluates agents on full task completion with partial credit for intermediate milestones. This gives a much more realistic picture of agent capability than pass/fail metrics on individual turns.</p>`,
  },
  {
    slug: 'building-agents-that-actually-work',
    title: 'Building Agents That Actually Work',
    date: '2026-03-28',
    excerpt:
      'Practical patterns for designing agent systems that ship to production.',
    tags: ['Agents', 'Engineering'],
    content: `<p>Most agent demos look impressive but fall apart in production. The gap between "works in a notebook" and "works for real users" is where the actual engineering happens.</p><h2>Start With Constraints</h2><p>The best agent systems I've built started not with "what can the agent do?" but with "what must the agent NOT do?" Defining safety boundaries, operating constraints, and failure modes first leads to more robust systems.</p><h2>Tool Orchestration Over Planning</h2><p>Fancy planning architectures (ReAct, Tree of Thought) get all the attention, but in practice, clean tool interfaces with simple routing logic outperforms complex planning 90% of the time.</p><h2>Observability Is Non-Negotiable</h2><p>If you can't see what your agent is doing at every step, you can't debug it. Structured logging, step-by-step traces, and rollback mechanisms are not nice-to-haves — they're requirements.</p>`,
  },
  {
    slug: 'post-training-lessons-from-production',
    title: 'Post-Training Lessons From Production',
    date: '2026-03-15',
    excerpt:
      'What I learned running SFT and RL loops on real business data.',
    tags: ['Post-Training', 'RL'],
    content: `<p>After running dozens of post-training experiments on production data at Alibaba, here are the patterns that consistently worked.</p><h2>SFT First, RL Second</h2><p>Always start with supervised fine-tuning to establish a behavioral baseline. Jumping straight to RL without a good SFT checkpoint wastes compute and produces unstable results.</p><h2>Data Quality > Data Quantity</h2><p>500 high-quality demonstration pairs consistently outperformed 5,000 noisy ones. The model learns the noise too, and in RL, this creates reward hacking pathways.</p><h2>Evaluation Before Training</h2><p>Design your evaluation pipeline BEFORE you start training. If you can't measure it, you can't improve it. This seems obvious but is the most common mistake I see teams make.</p>`,
  },
];
