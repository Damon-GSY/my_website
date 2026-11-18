// UI labels for notes in Chinese mode (titles and bodies stay English).
const CATEGORY_ZH = { Research: '研究', Engineering: '工程', 'Post-Training': '后训练' };
export const noteCategory = (note, lang) => (lang === 'zh' ? CATEGORY_ZH[note.category] ?? note.category : note.category);
export const noteMinutes = (note, lang, withRead = false) => {
  const n = parseInt(note.readingTime, 10);
  if (lang === 'zh') return withRead ? `阅读约 ${n} 分钟` : `${n} 分钟`;
  return withRead ? note.readingTime : `${n} min`;
};

// Field notes, moved from main:src/data/posts.js: the list fields only. The bodies (trusted HTML written by
// Damon, English only) are in src/chapters/notes/bodies.js, which only the note sheet imports, so the
// home page's first paint carries the list and not the text.
export const notes = [
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
  },
];
