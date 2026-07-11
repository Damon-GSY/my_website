import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { posts } from '@/data/posts';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function Journal() {
  const latest = posts.slice(0, 4);
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="journal"
      className="border-t border-[var(--line)] bg-[#0b0c0c] py-20 text-[#f1eee8] md:py-28"
      aria-labelledby="journal-title"
      data-hide-launcher
      data-hide-mobile-launcher
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <motion.header
          variants={fadeUp}
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-7 border-b border-white/15 pb-8 md:grid-cols-[minmax(0,0.8fr)_minmax(20rem,1.2fr)] md:items-end"
        >
          <div>
            <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#d4936d]">
              04 / Writing
            </p>
            <h2
              id="journal-title"
              className="font-display text-4xl font-normal tracking-[-0.04em] md:text-6xl"
            >
              Notes from the work.
            </h2>
          </div>
          <div className="flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between">
            <p className="max-w-xl text-sm leading-7 text-[#aaa39a] md:text-base">
              Practical essays on agent evaluation, production systems, post-training,
              and the interfaces that make model behavior dependable.
            </p>
            <Link
              to="/blog"
              className="inline-flex shrink-0 items-center gap-2 border-b border-[#d4936d]/70 pb-1 text-sm font-medium text-[#f1eee8] transition-colors hover:text-[#d4936d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4936d]"
            >
              Read all notes
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.header>

        <motion.ol
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={reducedMotion ? undefined : { visible: { transition: { staggerChildren: 0.055 } } }}
          className="m-0 list-none p-0"
          aria-label="Latest writing"
        >
          {latest.map((post, index) => (
            <motion.li key={post.slug} variants={reducedMotion ? undefined : fadeUp}>
              <Link
                to={`/blog/${post.slug}`}
                className="group grid gap-4 border-b border-white/15 py-7 transition-colors hover:border-[#d4936d]/60 md:grid-cols-[3.5rem_8.5rem_minmax(0,1fr)_7rem] md:items-start md:gap-6 md:py-8"
              >
                <span className="font-mono text-[0.68rem] tabular-nums tracking-[0.18em] text-[#d4936d]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex items-center justify-between gap-4 md:block">
                  <time
                    dateTime={post.date}
                    className="font-mono text-[0.68rem] tabular-nums tracking-[0.08em] text-[#aaa39a]"
                  >
                    {post.date}
                  </time>
                  <span className="font-mono text-[0.66rem] uppercase tracking-[0.1em] text-[#8c867f] md:mt-2 md:block">
                    {post.category}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-xl font-normal leading-tight tracking-[-0.02em] transition-colors group-hover:text-[#d4936d] md:text-2xl">
                    {post.title}
                  </span>
                  <span className="mt-2 block max-w-2xl text-sm leading-6 text-[#aaa39a]">
                    {post.excerpt}
                  </span>
                </span>
                <span className="flex items-center justify-between gap-3 md:justify-end">
                  <span className="font-mono text-[0.66rem] uppercase tracking-[0.08em] text-[#aaa39a]">
                    {post.readingTime}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-[#d4936d] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
