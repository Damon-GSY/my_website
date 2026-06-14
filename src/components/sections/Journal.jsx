import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { posts } from '@/data/posts';

gsap.registerPlugin(ScrollTrigger);

export default function Journal() {
  const sectionRef = useRef(null);
  const latest = posts.slice(0, 4);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.journal-header',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power4.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        }
      );

      gsap.fromTo(
        '.journal-row',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power4.out',
          scrollTrigger: { trigger: '.journal-list', start: 'top 82%', once: true },
        }
      );

      const rows = gsap.utils.toArray('.journal-row');
      rows.forEach((row) => {
        const title = row.querySelector('.journal-title');
        const indicator = row.querySelector('.journal-indicator');
        row.addEventListener('mouseenter', () => {
          gsap.to(title, { x: 12, color: 'var(--primary)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
          gsap.to(indicator, { width: '100%', duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        });
        row.addEventListener('mouseleave', () => {
          gsap.to(title, { x: 0, color: 'var(--text)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
          gsap.to(indicator, { width: '0%', duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[var(--surface)] py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="journal-header mb-12 md:mb-16 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)] mb-2">
              (04) Writing
            </p>
            <h2 className="type-display text-3xl md:text-4xl font-medium tracking-tight text-[var(--text)]">
              Recent journal
            </h2>
          </div>
          <Link
            to="/blog"
            className="text-sm font-semibold text-[var(--text)] border-b border-[var(--text)] pb-0.5 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
          >
            All posts →
          </Link>
        </div>

        <div className="journal-list border-t border-[var(--line)]">
          {latest.map((post) => (
            <div key={post.slug} className="journal-row border-b border-[var(--line)] last:border-b-0">
              <Link
                to={`/blog/${post.slug}`}
                className="block py-6 md:py-8 relative overflow-hidden"
              >
                <div className="grid grid-cols-12 gap-4 items-baseline">
                  <div className="col-span-3 md:col-span-2">
                    <span className="type-mono text-xs text-[var(--muted)]">
                      {post.date}
                    </span>
                  </div>
                  <div className="col-span-9 md:col-span-8">
                    <h3 className="journal-title type-display text-xl md:text-3xl font-medium tracking-tight text-[var(--text)]">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 text-xs md:text-sm text-[var(--muted)]">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-2 flex md:justify-end">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] border border-[var(--line)] rounded-full px-2.5 py-0.5">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="journal-indicator absolute bottom-0 left-0 h-[1px] w-0 bg-[var(--primary)]" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
