import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { TextShimmer } from './ui/text-shimmer';
import { posts } from '@/data/posts';

const reveal = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

export default function Blog() {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? posts.filter((post) => {
        const q = query.toLowerCase();
        return (
          post.title.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q) ||
          post.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      })
    : posts;

  return (
    <main className="min-h-screen bg-[var(--bg)] pt-28 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reveal}
          className="max-w-3xl"
        >
          <h1 className="type-headline text-3xl font-semibold tracking-tight text-[var(--text)] md:text-4xl">
            Writing
          </h1>
          <p className="mt-3 text-base text-[var(--muted)] md:text-lg">
            Thoughts on agents, evaluation, and building AI systems that work.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...reveal, delay: 0.1 }}
          className="mt-8 max-w-md"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles..."
              aria-label="Search articles"
              className="w-full rounded-xl bg-[var(--surface)] py-3 pl-10 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--muted)]/60 outline-none transition-[box-shadow] [box-shadow:0_0_0_1px_var(--ring)] focus:ring-[var(--focus)]"
            />
          </div>
        </motion.div>

        <div className="mt-10 space-y-10">
          {filtered.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...reveal, delay: 0.06 + index * 0.06 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group block"
              >
                <h2 className="type-headline text-lg font-semibold text-[var(--text)] transition-colors group-hover:text-[var(--primary-strong)]">
                  {post.title}
                </h2>
              </Link>
              <div className="mt-2 flex items-center gap-3">
                <span className="font-mono text-xs text-[var(--muted)]">
                  {post.date}
                </span>
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
                {post.excerpt}
              </p>
            </motion.article>
          ))}

          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-[var(--muted)]">
              No articles found for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
