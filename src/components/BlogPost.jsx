import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-strong)]"
          >
            &larr; Back to Blog
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[var(--bg)] pt-28 pb-20">
      <article className="mx-auto max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reveal}
        >
          <h1 className="type-headline text-3xl font-semibold tracking-tight text-[var(--text)]">
            {post.title}
          </h1>
          <div className="mt-3 flex items-center gap-3">
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...reveal, delay: 0.1 }}
          className="prose mt-10 max-w-none text-[var(--text)] [&_h2]:type-headline [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[var(--text)] [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-[var(--muted)]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-16 border-t border-[var(--line)] pt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-strong)]"
          >
            &larr; Back to Blog
          </Link>
        </div>
      </article>
    </section>
  );
}
