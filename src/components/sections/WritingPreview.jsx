import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { posts } from '@/data/posts';

const reveal = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

export default function WritingPreview() {
  const latest = posts.slice(0, 3);

  return (
    <section className="bg-[var(--surface)] py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={reveal}
          className="max-w-3xl"
        >
          <h2 className="type-headline text-3xl font-semibold tracking-tight text-[var(--text)] md:text-4xl">
            Writing
          </h2>
          <p className="mt-3 text-base text-[var(--muted)] md:text-lg">
            Recent thoughts on agents, evaluation, and building AI systems.
          </p>
        </motion.div>

        <div className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {latest.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ ...reveal, delay: index * 0.06 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group flex items-baseline justify-between gap-4 py-5 transition-colors"
              >
                <span className="type-headline text-base font-medium text-[var(--text)] transition-colors group-hover:text-[var(--primary)]">
                  {post.title}
                </span>
                <span className="shrink-0 font-mono text-xs text-[var(--muted)]">
                  {post.date}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-90px' }}
          transition={{ ...reveal, delay: 0.14 }}
          className="mt-6"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition-all duration-200 [box-shadow:0_0_0_1px_var(--ring)] hover:bg-[var(--primary)] hover:text-[var(--surface)]"
          >
            Read more
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
