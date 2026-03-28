import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero.png';

const reveal = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

const services = [
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

const nowItems = [
  {
    title: 'Research',
    description: 'Training and evaluating agent systems for real supply-chain workflows at Alibaba.',
  },
  {
    title: 'Build',
    description: 'Turning post-training and RL insights into deployable systems with measurable outcomes.',
  },
  {
    title: 'Share',
    description: 'Publishing practical AI content and lessons learned for builders and researchers.',
  },
];

const proof = [
  {
    title: 'Industry',
    detail: 'LLM Algorithm Engineer at Alibaba, building and shipping supply-chain AI systems.',
    href: '/about',
    cta: 'See work timeline',
  },
  {
    title: 'Research',
    detail: 'Published work in multi-turn agent evaluation and benchmark design.',
    href: '/about',
    cta: 'Read research timeline',
  },
  {
    title: 'Education',
    detail: 'NUS Statistics (QS #8) and UNSW Computer Science (QS #19).',
    href: '/about',
    cta: 'View education timeline',
  },
  {
    title: 'Platforms',
    detail: 'I share ideas and experiments on YouTube, Bilibili, and LinkedIn.',
    href: 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA',
    cta: 'Visit channels',
    external: true,
  },
];

export default function WhatIDo() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <section id="whatido" className="bg-[var(--color-background)] pt-16 md:pt-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={reveal}
            className="max-w-3xl"
          >
            <h2 className="type-headline text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
              What I&apos;m doing now
            </h2>
            <p className="mt-3 text-base text-[var(--color-text-muted)] md:text-lg">
              Researching, building, and sharing practical AI systems every week.
            </p>
          </motion.div>
        </div>

        <div className="mx-auto mt-7 grid max-w-7xl gap-3 px-6 md:grid-cols-3 md:px-8">
          {nowItems.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-90px' }}
              transition={{ ...reveal, delay: 0.06 + index * 0.05 }}
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5"
            >
              <p className="type-caption text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                {item.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{item.description}</p>
            </motion.article>
          ))}
        </div>

        <div className="mx-auto mt-8 grid max-w-7xl gap-3 px-6 md:grid-cols-3 md:px-8">
          {[
            { title: 'Research', position: 'object-[32%_35%]' },
            { title: 'Build', position: 'object-[55%_42%]' },
            { title: 'Share', position: 'object-[70%_34%]' },
          ].map((item, index) => (
            <motion.figure
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-90px' }}
              transition={{ ...reveal, delay: 0.08 + index * 0.06 }}
              className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white"
            >
              <motion.img
                src={heroImage}
                alt={`${item.title} visual context`}
                className={`h-44 w-full ${item.position} object-cover md:h-56`}
                animate={reduceMotion ? undefined : { scale: [1, 1.025, 1] }}
                transition={{ duration: 9 + index, repeat: Infinity, ease: 'easeInOut' }}
              />
              <figcaption className="type-caption absolute left-4 top-4 rounded-full bg-white/86 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700 backdrop-blur-sm">
                {item.title}
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-90px' }}
          transition={{ ...reveal, delay: 0.14 }}
          className="mx-auto mt-6 flex max-w-7xl flex-wrap gap-3 px-6 md:px-8"
        >
          <a
            href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900"
          >
            YouTube
          </a>
          <a
            href="https://space.bilibili.com/358541297"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900"
          >
            Bilibili
          </a>
          <a
            href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900"
          >
            LinkedIn
          </a>
        </motion.div>
      </section>

      <section className="bg-[var(--color-background)] py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-110px' }}
            transition={reveal}
            className="max-w-3xl"
          >
            <h2 className="type-headline text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
              What I do
            </h2>
            <p className="mt-3 text-base text-[var(--color-text-muted)] md:text-lg">
              Three ways I create value for teams building serious AI products.
            </p>
          </motion.div>

          <div className="mt-10 border-y border-[var(--color-line)]">
            {services.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ ...reveal, delay: index * 0.08 }}
                className={`grid gap-4 py-7 md:grid-cols-[220px_1fr] md:gap-8 ${
                  index < services.length - 1 ? 'border-b border-[var(--color-line)]' : ''
                }`}
              >
                <h3 className="type-caption text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
                  {item.title}
                </h3>
                <p className="text-base leading-relaxed text-[var(--color-text-muted)]">{item.description}</p>
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
              className="inline-flex items-center gap-2 text-base font-semibold text-blue-700 transition-colors hover:text-blue-800"
            >
              Explore my full education and work timeline
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-[var(--color-surface)] py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={reveal}
            className="max-w-3xl"
          >
            <h2 className="type-headline text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
              Proof of work
            </h2>
            <p className="mt-3 text-base text-[var(--color-text-muted)] md:text-lg">
              A snapshot of outcomes across industry, research, and education.
            </p>
          </motion.div>

          <div className="mt-10 space-y-6">
            {proof.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ ...reveal, delay: index * 0.07 }}
                className="border-l-2 border-blue-300 pl-5"
              >
                <p className="type-caption text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                  {item.title}
                </p>
                <p className="mt-2 text-base leading-relaxed text-[var(--color-text-primary)]">{item.detail}</p>
                <a
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noreferrer' : undefined}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
                >
                  {item.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f9f6f0_0%,#f1ebe1_100%)] py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-6 text-center md:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={reveal}
            className="type-headline text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-5xl"
          >
            Let&apos;s build together
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ ...reveal, delay: 0.08 }}
            className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg"
          >
            If your team is building with agent systems, I&apos;m open to collaboration, advising, and knowledge sharing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ ...reveal, delay: 0.14 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Start a conversation
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:text-blue-800"
            >
              Watch on YouTube
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
