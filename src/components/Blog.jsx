import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { posts } from '@/data/posts';

const reveal = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

function PostMeta({ post }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
      <span className="text-[var(--primary)]">{post.category}</span>
      <span aria-hidden="true">/</span>
      <span>{post.date}</span>
      {post.readingTime && (
        <>
          <span aria-hidden="true">/</span>
          <span>{post.readingTime}</span>
        </>
      )}
    </div>
  );
}

function FeaturedPost({ post }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reveal}
      className="border-b border-[var(--line)] pb-10"
    >
      <Link to={`/blog/${post.slug}`} className="group block">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <PostMeta post={post} />
            <h2 className="mt-5 type-display text-4xl font-medium leading-[1.04] tracking-tight text-[var(--text)] transition-colors group-hover:text-[var(--primary)] md:text-6xl">
              {post.title}
            </h2>
          </div>
          <div className="lg:col-span-4 lg:pt-8">
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {post.excerpt}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[var(--line)] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)] transition-colors group-hover:text-[var(--primary)]">
              Read featured note
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function PostRow({ post, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...reveal, delay: 0.04 + index * 0.04 }}
      className="border-b border-[var(--line)] last:border-b-0"
    >
      <Link to={`/blog/${post.slug}`} className="group block py-7 md:py-9">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-2">
            <PostMeta post={post} />
          </div>
          <div className="md:col-span-6">
            <h3 className="type-display text-2xl font-medium tracking-tight text-[var(--text)] transition-colors group-hover:text-[var(--primary)] md:text-4xl">
              {post.title}
            </h3>
          </div>
          <div className="md:col-span-3">
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {post.excerpt}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="border border-[var(--line)] px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex md:col-span-1 md:justify-end">
            <ArrowRight className="h-5 w-5 text-[var(--muted)] transition-all group-hover:translate-x-1 group-hover:text-[var(--primary)]" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function Blog() {
  const [active, setActive] = useState('All');
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(posts.map((post) => post.category)))],
    []
  );
  const filtered = active === 'All' ? posts : posts.filter((post) => post.category === active);
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const list =
    active === 'All' ? filtered.filter((post) => post.slug !== featured.slug) : filtered;

  return (
    <section className="min-h-screen bg-[var(--bg)] pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reveal}
          className="grid grid-cols-1 gap-8 border-b border-[var(--line)] pb-10 md:grid-cols-12 md:gap-10"
        >
          <div className="md:col-span-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
              Writing
            </p>
            <h1 className="mt-5 type-display text-4xl font-medium tracking-tight text-[var(--text)] md:text-6xl">
              Notes on agents, training, and evaluation.
            </h1>
          </div>
          <div className="md:col-span-4 md:pt-12">
            <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              Working notes from production LLM systems, agent benchmarks, memory design,
              tool use, and post-training loops.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActive(category)}
                className={`border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active === category
                    ? 'border-[var(--primary)] text-[var(--text)]'
                    : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--text)]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
            {filtered.length} notes
          </p>
        </div>

        {active === 'All' && featured && (
          <div className="mt-12">
            <FeaturedPost post={featured} />
          </div>
        )}

        <div className="mt-4 border-t border-[var(--line)]">
          {list.map((post, index) => (
            <PostRow key={post.slug} post={post} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
