import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const reveal = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

const capabilities = [
  {
    title: 'Agent System Design',
    description:
      'I design robust agent workflows with planning, tool orchestration, memory, and safety boundaries.',
  },
  {
    title: 'Post-Training & Evaluation',
    description:
      'I build benchmarks, run SFT and RL loops, and align model behavior with measurable business outcomes.',
  },
  {
    title: 'Production Deployment',
    description:
      'I ship systems with observability, rollback strategy, and clear operating constraints for real teams.',
  },
];

export default function WhatIDo() {
  return (
    <section id="whatido" className="bg-[var(--bg)] pt-16 md:pt-20">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={reveal}
          className="max-w-3xl"
        >
          <h2 className="type-headline text-3xl font-semibold tracking-tight text-[var(--text)] md:text-4xl">
            What I do
          </h2>
          <p className="mt-3 text-base text-[var(--muted)] md:text-lg">
            I research, build, and ship agent systems at Alibaba — and share what I learn along the way.
          </p>
        </motion.div>

        <div className="mt-10 border-y border-[var(--line)]">
          {capabilities.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ ...reveal, delay: index * 0.08 }}
              className={`grid gap-4 py-7 md:grid-cols-[220px_1fr] md:gap-8 ${
                index < capabilities.length - 1 ? 'border-b border-[var(--line)]' : ''
              }`}
            >
              <h3 className="type-caption text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                {item.title}
              </h3>
              <p className="text-base leading-relaxed text-[var(--muted)]">{item.description}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ ...reveal, delay: 0.14 }}
          className="mt-8"
        >
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-base font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-strong)]"
          >
            Explore my full education and work timeline
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
