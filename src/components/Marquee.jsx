import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Marquee({ items = [], speed = 30 }) {
  const trackRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;

      const totalWidth = track.scrollWidth / 2;
      if (totalWidth === 0) return;

      gsap.to(track, {
        x: -totalWidth,
        duration: speed,
        ease: 'none',
        repeat: -1,
      });

      // Speed up slightly on scroll
      gsap.to(track, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            const timeScale = 1 + Math.abs(self.getVelocity()) / 4000;
            gsap.to(track, { timeScale: Math.min(timeScale, 4), duration: 0.3 });
          },
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [speed]);

  return (
    <section
      ref={sectionRef}
      className="relative py-8 md:py-12 border-y border-[var(--line)] overflow-hidden bg-[var(--bg)]"
    >
      <div className="overflow-hidden">
        <div ref={trackRef} className="flex items-center gap-8 whitespace-nowrap will-change-transform">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center gap-8">
              <span className="type-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[var(--text)]">
                {item}
              </span>
              <span className="text-3xl md:text-5xl text-[var(--primary)]">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
