import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Preloader({ onComplete }) {
  const containerRef = useRef(null);
  const completedRef = useRef(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const complete = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setHidden(true);
      onComplete?.();
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const frame = requestAnimationFrame(complete);
      return () => cancelAnimationFrame(frame);
    }

    const fallback = window.setTimeout(complete, 1400);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: complete,
      });

      tl.fromTo(
        '.loader-mark',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3 },
        0
      );

      tl.fromTo(
        '.loader-line',
        { scaleX: 0, transformOrigin: 'left center', opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.35, stagger: 0.06 },
        0.12
      );

      tl.to(
        '.loader-mark',
        { y: -8, opacity: 0, duration: 0.2, ease: 'power2.in' },
        0.62
      );

      tl.to(
        '.loader-line',
        { scaleX: 0, opacity: 0, duration: 0.2, stagger: 0.035, ease: 'power2.in' },
        0.62
      );

      tl.to(
        containerRef.current,
        { yPercent: -100, duration: 0.34, ease: 'power3.inOut' },
        0.82
      );
    }, containerRef);

    return () => {
      window.clearTimeout(fallback);
      ctx.revert();
    };
  }, [onComplete]);

  if (hidden) return null;

  return (
    <div
      ref={containerRef}
      data-preloader="true"
      aria-label="Loading"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--bg)]"
      style={{ willChange: 'transform' }}
    >
      <div className="w-[180px] text-[var(--text)]">
        <div className="loader-mark flex items-baseline justify-between">
          <span className="type-display text-2xl font-semibold tracking-tight">D.</span>
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)]">
            Agent OS
          </span>
        </div>
        <div className="mt-4 space-y-2">
          <span className="loader-line block h-px w-full bg-[var(--primary)]" />
          <span className="loader-line block h-px w-2/3 bg-[var(--line)]" />
          <span className="loader-line block h-px w-5/6 bg-[var(--line)]" />
        </div>
      </div>
    </div>
  );
}
