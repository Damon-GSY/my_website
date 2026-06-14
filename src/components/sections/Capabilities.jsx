import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const capabilities = [
  {
    num: '01',
    title: 'Agent System Design',
    desc: 'Robust agent workflows with planning, tool orchestration, memory, and safety boundaries.',
    tags: ['Planning', 'Tools', 'Memory'],
  },
  {
    num: '02',
    title: 'Post-Training & Evaluation',
    desc: 'Benchmarks, SFT and RL loops aligned with measurable business outcomes.',
    tags: ['SFT', 'RLHF', 'Eval'],
  },
  {
    num: '03',
    title: 'Production Deployment',
    desc: 'Systems with observability, rollback strategy, and clear operating constraints.',
    tags: ['Observability', 'Safety', 'Scale'],
  },
];

export default function Capabilities() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cap-header',
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
        '.cap-row',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power4.out',
          scrollTrigger: { trigger: '.cap-list', start: 'top 80%', once: true },
        }
      );

      // Hover effect — number scales
      const rows = gsap.utils.toArray('.cap-row');
      rows.forEach((row) => {
        const num = row.querySelector('.cap-num');
        const arrow = row.querySelector('.cap-arrow');
        row.addEventListener('mouseenter', () => {
          gsap.to(num, { scale: 1.15, color: 'var(--primary)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
          gsap.to(arrow, { x: 8, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        });
        row.addEventListener('mouseleave', () => {
          gsap.to(num, { scale: 1, color: 'var(--muted)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
          gsap.to(arrow, { x: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[var(--surface)] py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="cap-header mb-12 md:mb-16 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)] mb-2">
              (02) Capabilities
            </p>
            <h2 className="type-display text-3xl md:text-4xl font-medium tracking-tight text-[var(--text)]">
              What I do
            </h2>
          </div>
          <p className="text-sm text-[var(--muted)] max-w-xs">
            Three focus areas, one goal: agents that work in production.
          </p>
        </div>

        <div className="cap-list border-t border-[var(--line)]">
          {capabilities.map((cap) => (
            <div
              key={cap.num}
              className="cap-row group grid grid-cols-12 gap-4 md:gap-8 py-8 md:py-12 border-b border-[var(--line)] items-center"
            >
              <div className="col-span-2 md:col-span-1">
                <span className="cap-num type-mono text-2xl md:text-3xl font-bold text-[var(--muted)] inline-block">
                  {cap.num}
                </span>
              </div>
              <div className="col-span-10 md:col-span-5">
                <h3 className="type-display text-2xl md:text-4xl font-medium tracking-tight text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  {cap.title}
                </h3>
              </div>
              <div className="col-span-12 md:col-span-5">
                <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed">
                  {cap.desc}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {cap.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] border border-[var(--line)] rounded-full px-2.5 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-12 md:col-span-1 flex md:justify-end">
                <span className="cap-arrow text-2xl text-[var(--muted)] inline-block">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
