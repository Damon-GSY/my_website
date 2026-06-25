import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { posts } from '@/data/posts';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function Journal() {
  const latest = posts.slice(0, 4);
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="journal"
      className="agent-os-section border-t border-[var(--line)] pb-20 pt-8 md:pb-24 md:pt-8"
      aria-labelledby="journal-title"
      data-hide-launcher
      data-hide-mobile-launcher
    >
      <div className="agent-os-inner">
        <motion.header
          variants={fadeUp}
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-6 flex flex-col gap-3 md:grid md:grid-cols-[0.72fr_1.28fr] md:items-end md:gap-5"
        >
          <div className="flex items-end justify-between gap-4">
            <div className="mr-auto">
              <p className="agent-os-inline-label">[04] event log</p>
              <h2
                id="journal-title"
                className="font-display text-2xl font-medium tracking-tight text-[var(--text)] md:text-3xl"
              >
                Field notes
              </h2>
            </div>
            <Link
              to="/blog"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-semibold text-[var(--text)] transition-colors hover:text-[var(--primary)] md:hidden"
            >
              All posts
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex items-end justify-between gap-5">
            <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
              Research and production observations appended to the same system.
            </p>
            <Link
              to="/blog"
              className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-[var(--text)] transition-colors hover:text-[var(--primary)] md:inline-flex"
            >
              All posts
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.header>

        <motion.ol
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="m-0 list-none border-b border-[var(--line)] p-0"
          aria-label="Latest journal events"
        >
          {latest.map((post, index) => (
            <motion.li
              key={post.slug}
              variants={fadeUp}
              className="border-t border-[var(--line)]"
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group grid gap-3 py-5 transition-colors hover:bg-[var(--surface)]/55 sm:grid-cols-[5.5rem_7rem_minmax(0,1fr)_auto] sm:items-center sm:px-3 md:py-6"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--primary)]">
                  event {String(index + 1).padStart(2, '0')}
                </span>
                <time
                  dateTime={post.date}
                  className="font-mono text-[11px] tabular-nums text-[var(--muted-strong)]"
                >
                  {post.date}
                </time>
                <span className="min-w-0">
                  <span className="block font-display text-base font-medium text-[var(--text)] transition-colors group-hover:text-[var(--primary)] md:text-lg">
                    {post.title}
                  </span>
                  <span className="mt-1 block truncate text-xs text-[var(--muted)]">
                    {post.excerpt}
                  </span>
                </span>
                <span className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted-strong)]">
                    {post.readingTime}
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
