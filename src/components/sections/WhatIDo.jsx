import { ArrowRight, Bot, BarChart3, Rocket } from 'lucide-react';
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
    icon: Bot,
  },
  {
    title: 'Post-Training & Evaluation',
    description:
      'I build benchmarks, run SFT and RL loops, and align model behavior with measurable business outcomes.',
    icon: BarChart3,
  },
  {
    title: 'Production Deployment',
    description:
      'I ship systems with observability, rollback strategy, and clear operating constraints for real teams.',
    icon: Rocket,
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

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {capabilities.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ ...reveal, delay: index * 0.08 }}
              className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-shadow hover:[box-shadow:0_0_0_1px_var(--ring-strong)]"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--primary)]">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="type-headline text-base font-semibold text-[var(--text)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.description}</p>
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
