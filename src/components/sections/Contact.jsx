import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MagneticButton from '../MagneticButton';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-letter',
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1,
          stagger: 0.04,
          ease: 'power4.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
        }
      );

      gsap.fromTo(
        '.contact-cta',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power4.out',
          scrollTrigger: { trigger: '.contact-cta', start: 'top 85%', once: true },
        }
      );

      gsap.fromTo(
        '.contact-meta',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.contact-meta', start: 'top 88%', once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const phrase = "LET'S TALK";

  return (
    <section ref={sectionRef} className="bg-[var(--bg)] pt-24 md:pt-32 pb-12 md:pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)] mb-6 md:mb-10">
          (05) Get in touch
        </p>

        <div className="overflow-hidden">
          <h2 className="type-display font-medium leading-[0.9] tracking-[-0.04em] text-[var(--text)]"
            style={{ fontSize: 'clamp(3.5rem, 16vw, 16rem)' }}
          >
            {phrase.split('').map((letter, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <span className="contact-letter inline-block" style={{ willChange: 'transform' }}>
                  {letter === ' ' ? ' ' : letter}
                </span>
              </span>
            ))}
          </h2>
        </div>

        <div className="contact-cta mt-10 md:mt-14 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <MagneticButton strength={0.2}>
            <a
              href="mailto:hello@damon.ai"
              className="inline-flex items-center gap-3 bg-[var(--text)] text-[var(--bg)] rounded-full px-7 py-4 text-sm font-semibold transition-transform"
            >
              hello@damon.ai
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </MagneticButton>
          <p className="text-sm text-[var(--muted)] max-w-sm">
            Open to collaborations on agent systems, evaluation research, and
            AI content production.
          </p>
        </div>

        <div className="contact-meta mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[var(--line)]">
          {[
            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shengyue-guan-1a7b3226b/', value: '@shengyue-guan' },
            { label: 'YouTube', href: 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA', value: '@damon-ai' },
            { label: 'Bilibili', href: 'https://space.bilibili.com/358541297', value: '@damon' },
            { label: 'GitHub', href: 'https://github.com/Damon-GSY', value: '@Damon-GSY' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group block"
            >
              <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] mb-1">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                {item.value} ↗
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
