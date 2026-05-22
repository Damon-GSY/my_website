import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Monitor,
  Terminal,
  Brain,
  Video,
  PenTool,
  Headphones,
  Wifi,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const reveal = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

const categories = [
  {
    title: 'Development',
    icon: Terminal,
    items: [
      { name: 'VS Code', detail: 'Primary editor with Neovim keybindings' },
      { name: 'Cursor', detail: 'AI-assisted coding for rapid prototyping' },
      { name: 'Claude Code', detail: 'CLI agent for refactoring and codebase exploration' },
      { name: 'iTerm2 + tmux', detail: 'Terminal multiplexer for parallel workflows' },
      { name: 'GitHub Copilot', detail: 'Inline code completion' },
    ],
  },
  {
    title: 'AI & Research',
    icon: Brain,
    items: [
      { name: 'PyTorch', detail: 'Training and evaluation framework' },
      { name: 'Hugging Face', detail: 'Model hub and transformers library' },
      { name: 'Weights & Biases', detail: 'Experiment tracking and visualization' },
      { name: 'Claude', detail: 'Research assistant and reasoning partner' },
      { name: 'ChatGPT', detail: 'Quick Q&A and code generation' },
    ],
  },
  {
    title: 'Content Creation',
    icon: Video,
    items: [
      { name: 'DaVinci Resolve', detail: 'Video editing and color grading' },
      { name: 'OBS Studio', detail: 'Screen recording and streaming' },
      { name: 'Figma', detail: 'Thumbnails and visual design' },
      { name: 'Notion', detail: 'Script writing and content planning' },
    ],
  },
  {
    title: 'Productivity',
    icon: PenTool,
    items: [
      { name: 'Notion', detail: 'Knowledge base and project management' },
      { name: 'Raycast', detail: 'App launcher and clipboard manager' },
      { name: 'Arc Browser', detail: 'Tab management and research browsing' },
      { name: 'Apple Reminders', detail: 'Quick capture and daily tasks' },
    ],
  },
  {
    title: 'Hardware',
    icon: Monitor,
    items: [
      { name: 'MacBook Pro 14"', detail: 'M3 Pro, 18GB RAM — daily driver' },
      { name: 'LG 27" 4K', detail: 'External display for coding and editing' },
      { name: 'Keychron K3 Pro', detail: 'Low-profile wireless mechanical keyboard' },
      { name: 'Logitech MX Master 3S', detail: 'Precision scroll and gesture support' },
    ],
  },
  {
    title: 'Audio & Network',
    icon: Headphones,
    items: [
      { name: 'AirPods Pro 2', detail: 'Calls, focus, and commuting' },
      { name: 'Sony WH-1000XM5', detail: 'Deep focus and travel' },
      { name: 'Surfshark VPN', detail: 'Global access for research and streaming' },
    ],
  },
];

export default function Uses() {
  return (
    <main className="min-h-screen bg-[var(--bg)] pt-28 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reveal}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--text)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...reveal, delay: 0.06 }}
          className="mt-6 max-w-2xl"
        >
          <h1 className="type-headline text-3xl font-semibold tracking-tight text-[var(--text)] md:text-4xl">
            Uses
          </h1>
          <p className="mt-3 text-base text-[var(--muted)] leading-relaxed">
            Tools, software, and gear I use daily for research, engineering, and content creation.
          </p>
        </motion.div>

        <div className="mt-12 space-y-12">
          {categories.map((cat, catIndex) => (
            <motion.section
              key={cat.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...reveal, delay: 0.08 + catIndex * 0.04 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--primary)]">
                  <cat.icon className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
                  {cat.title}
                </h2>
              </div>

              <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {cat.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-baseline justify-between gap-4 py-3.5 px-1"
                  >
                    <span className="text-sm font-medium text-[var(--text)]">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-xs text-[var(--muted)] text-right">
                      {item.detail}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </main>
  );
}
