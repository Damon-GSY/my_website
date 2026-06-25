import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { posts } from '@/data/posts';

const reveal = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <section className="min-h-screen bg-[var(--bg)] pt-28 pb-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h1 className="type-headline text-3xl font-semibold text-[var(--text)]">
            Post not found
          </h1>
          <Link
            to="/blog"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-strong)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Writing
          </Link>
        </div>
      </section>
    );
  }

  const morePosts = posts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <section className="min-h-screen bg-[var(--bg)] pt-28 pb-20">
      <article className="mx-auto max-w-[42rem] px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reveal}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--text)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Writing
          </Link>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...reveal, delay: 0.06 }}
          className="mt-8 mb-10 border-b border-[var(--line)] pb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            {post.category && (
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                {post.category}
              </span>
            )}
            <span className="text-xs text-[var(--muted)]">{post.date}</span>
            {post.readingTime && (
              <span className="text-xs text-[var(--muted)]">{post.readingTime}</span>
            )}
          </div>
          <h1 className="type-display text-4xl font-medium tracking-tight text-[var(--text)] md:text-6xl leading-[1.05]">
            {post.title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-[var(--muted)] md:text-lg">
            {post.excerpt}
          </p>
          {post.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[var(--line)] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...reveal, delay: 0.12 }}
          className="
            prose-custom
            [&_h2]:type-display [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-[var(--text)]
            [&_p]:mb-5 [&_p]:text-base [&_p]:leading-[1.85] [&_p]:text-[var(--muted)]
            [&_p:first-child]:text-lg [&_p:first-child]:leading-[1.75] [&_p:first-child]:text-[var(--muted-strong)]
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-16 border-t border-[var(--line)] pt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-strong)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Writing
          </Link>
        </div>
      </article>

      {morePosts.length > 0 && (
        <div className="mx-auto max-w-[42rem] px-6 mt-20">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] mb-6">
            More Writing
          </h2>
          <div className="divide-y divide-[var(--line)]">
            {morePosts.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="group block py-5 first:pt-0"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  {p.category && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                      {p.category}
                    </span>
                  )}
                  <span className="text-xs text-[var(--muted)]">{p.date}</span>
                </div>
                <h3 className="text-base font-semibold text-[var(--text)] transition-colors group-hover:text-[var(--primary)]">
                  {p.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
