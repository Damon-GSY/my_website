import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.manifesto-line',
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'bottom 60%',
            once: true,
          },
        }
      );

      gsap.fromTo(
        '.manifesto-aside',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.manifesto-aside',
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const lines = [
    ['I', 'research', 'and', 'ship'],
    ['agent', 'systems', 'at', 'Alibaba'],
    ['—', 'not', 'demos.'],
  ];

  return (
    <section ref={sectionRef} className="bg-[var(--bg)] py-24 md:py-40">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
              (01)
            </p>
            <p className="mt-2 text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
              Manifesto
            </p>
          </div>

          <div className="lg:col-span-10">
            <h2 className="type-display font-medium leading-[1.05] tracking-tight text-[var(--text)] text-3xl md:text-5xl lg:text-6xl">
              {lines.map((line, li) => (
                <span key={li} className="block overflow-hidden py-1">
                  <span className="manifesto-line block">
                    {line.map((word, wi) => (
                      <span
                        key={wi}
                        className={`inline-block mr-[0.25em] ${
                          word === 'ship' || word === 'agent' || word === 'Alibaba'
                            ? 'text-[var(--primary)] italic'
                            : ''
                        }`}
                      >
                        {word}
                      </span>
                    ))}
                  </span>
                </span>
              ))}
            </h2>

            <div className="manifesto-aside mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
              <p className="text-sm md:text-base leading-relaxed text-[var(--muted)] max-w-md">
                From benchmark design and post-training pipelines to deployable agent
                systems in real business scenarios — I bridge research and production,
                turning LLM capabilities into measurable outcomes.
              </p>
              <div className="flex flex-col gap-4 md:items-end">
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-2 self-start text-sm font-semibold text-[var(--text)]"
                >
                  <span className="border-b border-[var(--text)] pb-0.5 transition-colors group-hover:border-[var(--primary)] group-hover:text-[var(--primary)]">
                    Full background
                  </span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
