import { useEffect, useRef, forwardRef } from 'react';
import { ArrowDown, Command } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import heroImage from '@/assets/hero.png';

gsap.registerPlugin(ScrollTrigger);

const Hero = forwardRef(function Hero() {
  const sectionRef = useRef(null);
  const introRef = useRef(null);
  const gridRef = useRef(null);
  const imageWrapRef = useRef(null);
  const imageInnerRef = useRef(null);
  const focusRef = useRef(null);
  const commandRef = useRef(null);
  const scrollHintRef = useRef(null);

  useEffect(() => {
    let ctx;
    let cleanupPointer;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(imageWrapRef.current, { clipPath: 'inset(0% 0% 0% 0%)' });
      gsap.set(imageInnerRef.current, { scale: 1, y: 0 });
      gsap.set(focusRef.current, { opacity: 1, y: 0 });
      gsap.set(commandRef.current, { opacity: 1, y: 0 });
      gsap.set(scrollHintRef.current, { opacity: 1, y: 0 });
      return undefined;
    }

    const timer = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.fromTo(
          '.meta-item',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
          0.1
        );

        tl.fromTo(
          '.hero-rule',
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 1.1, ease: 'power4.out' },
          0.15
        );

        const words = introRef.current?.querySelectorAll('.headline-word');
        if (words) {
          tl.fromTo(
            words,
            { yPercent: 110 },
            { yPercent: 0, duration: 1.05, stagger: 0.035 },
            0.3
          );
        }

        tl.fromTo(
          '.intro-sub',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          0.9
        );

        tl.fromTo(
          '.focus-row',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.08 },
          1.0
        );

        tl.fromTo(
          imageWrapRef.current,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power3.inOut' },
          0.4
        );

        tl.fromTo(
          imageInnerRef.current,
          { scale: 1.4 },
          { scale: 1, duration: 1.4, ease: 'power3.out' },
          0.4
        );

        tl.fromTo(
          '.focus-marker',
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.65, stagger: 0.08, ease: 'power3.out' },
          0.95
        );

        tl.fromTo(
          commandRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          1.25
        );

        tl.fromTo(
          scrollHintRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5 },
          1.2
        );

        gsap.to(introRef.current, {
          opacity: 0,
          y: -40,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '50% top',
            scrub: 1,
          },
        });

        gsap.to(gridRef.current, {
          yPercent: 10,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });

        gsap.to(imageInnerRef.current, {
          y: 60,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });

        gsap.to(focusRef.current, {
          y: -18,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.4,
          },
        });

        gsap.to(commandRef.current, {
          opacity: 0,
          y: -20,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: '20% top',
            end: '55% top',
            scrub: 1,
          },
        });
      }, sectionRef);

      const section = sectionRef.current;
      const grid = gridRef.current;
      const canTrackPointer = window.matchMedia('(pointer: fine)').matches;
      if (section && canTrackPointer) {
        const gridX = grid ? gsap.quickTo(grid, 'x', { duration: 0.7, ease: 'power3.out' }) : null;
        const gridY = grid ? gsap.quickTo(grid, 'y', { duration: 0.7, ease: 'power3.out' }) : null;

        const handlePointerMove = (event) => {
          const rect = section.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          gridX?.(x * 18);
          gridY?.(y * 14);
        };

        const handlePointerLeave = () => {
          gridX?.(0);
          gridY?.(0);
        };

        section.addEventListener('pointermove', handlePointerMove);
        section.addEventListener('pointerleave', handlePointerLeave);
        cleanupPointer = () => {
          section.removeEventListener('pointermove', handlePointerMove);
          section.removeEventListener('pointerleave', handlePointerLeave);
        };
      }
    });

    return () => {
      cancelAnimationFrame(timer);
      cleanupPointer?.();
      ctx?.revert();
    };
  }, []);

  const headline = 'Building agent systems that ship — not demos.';
  const focusItems = [
    { label: 'Research', value: 'Agentic RL' },
    { label: 'Production', value: 'Alibaba systems' },
    { label: 'Writing', value: 'YouTube / Bilibili' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col"
      id="home"
      aria-labelledby="hero-heading"
    >
      <div
        ref={gridRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'linear-gradient(to bottom, transparent, black 18%, black 72%, transparent)',
        }}
      />
      <div
        aria-hidden="true"
        className="hero-rule pointer-events-none absolute left-6 right-6 top-20 h-px bg-[var(--line)] md:left-10 md:right-10"
      />

      {/* Top metadata bar */}
      <div className="relative z-10 pt-24 md:pt-28 px-6 md:px-10">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="meta-item inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            Available for Work
          </span>
          <span className="meta-item hidden sm:inline">Hangzhou · 30.27°N</span>
          <span className="meta-item type-mono">©2026</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center px-6 md:px-10 py-10 md:py-16">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Headline + intro */}
          <div ref={introRef} className="lg:col-span-7 order-2 lg:order-1">
            <p className="meta-item text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)] mb-5 md:mb-7">
              AI Researcher / Agent Systems
            </p>
            <h1
              id="hero-heading"
              className="type-display font-medium leading-[1.02] tracking-[-0.02em] text-[var(--text)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {headline.split(' ').map((word, i) => (
                <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.25em]">
                  <span className="headline-word inline-block">
                    {word === 'ship' || word === 'demos.' ? (
                      <em className="not-italic text-[var(--primary)]">{word}</em>
                    ) : word === 'not' ? (
                      <span className="text-[var(--muted)]">{word}</span>
                    ) : (
                      word
                    )}
                  </span>
                </span>
              ))}
            </h1>
            <p className="intro-sub mt-7 md:mt-9 text-sm md:text-base leading-relaxed text-[var(--muted)] max-w-md">
              Researching and deploying agentic RL, post-training, and evaluation
              frameworks at Alibaba. Sharing practical AI on YouTube & Bilibili.
            </p>
            <div
              ref={focusRef}
              className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3"
              style={{ willChange: 'transform, opacity' }}
            >
              {focusItems.map((item) => (
                <div
                  key={item.label}
                  className="focus-row border-t border-[var(--line)] pt-3"
                >
                  <span className="focus-marker mb-3 block h-px w-10 bg-[var(--primary)]" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Portrait */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px] [perspective:900px]">
              <div
                ref={imageWrapRef}
                className="relative mx-auto h-[340px] w-[260px] overflow-hidden md:h-[400px] md:w-[320px] lg:ml-auto lg:mr-0 lg:h-[460px] lg:w-[360px]"
                style={{ clipPath: 'inset(100% 0% 0% 0%)', willChange: 'clip-path' }}
              >
                <div
                  ref={imageInnerRef}
                  className="absolute inset-0"
                  style={{ willChange: 'transform' }}
                >
                  <img
                    src={heroImage}
                    alt="Portrait of Damon"
                    className="h-full w-full object-cover grayscale-[15%]"
                    fetchPriority="high"
                    decoding="async"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/90 text-[10px] font-mono uppercase tracking-wider">
                    <span>Damon G.</span>
                    <span>2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom command surface */}
      <div className="relative z-10 px-6 md:px-10 pb-6 md:pb-8">
        <div className="flex items-end justify-between border-t border-[var(--line)] pt-4">
          <div
            ref={commandRef}
            className="hidden min-w-0 items-center gap-3 border border-[var(--line)] bg-[var(--surface)]/82 px-3 py-2 text-[11px] text-[var(--muted)] backdrop-blur md:inline-flex"
            style={{ willChange: 'transform, opacity' }}
          >
            <Command className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span className="font-mono uppercase tracking-[0.2em]">K</span>
            <span className="h-3 w-px bg-[var(--line)]" />
            <span className="truncate">Search agent systems, evals, post-training</span>
          </div>
          <div
            ref={scrollHintRef}
            className="flex flex-col items-center gap-1 text-[var(--muted)]"
            style={{ opacity: 0 }}
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Scroll</span>
            <ArrowDown className="h-3 w-3 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
});

export default Hero;
