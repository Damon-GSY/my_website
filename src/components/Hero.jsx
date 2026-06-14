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
  const watermarkRef = useRef(null);

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
          0.85
        );

        tl.fromTo(
          '.focus-row',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.08 },
          0.95
        );

        tl.fromTo(
          '.credential-row',
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.06 },
          1.05
        );

        tl.fromTo(
          imageWrapRef.current,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power3.inOut' },
          0.35
        );

        tl.fromTo(
          imageInnerRef.current,
          { scale: 1.4 },
          { scale: 1, duration: 1.4, ease: 'power3.out' },
          0.35
        );

        tl.fromTo(
          '.focus-marker',
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.65, stagger: 0.08, ease: 'power3.out' },
          0.9
        );

        tl.fromTo(
          commandRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          1.2
        );

        tl.fromTo(
          scrollHintRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5 },
          1.15
        );

        tl.fromTo(
          watermarkRef.current,
          { opacity: 0 },
          { opacity: 0.04, duration: 1.4, ease: 'power2.out' },
          0.6
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
          y: 80,
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

        gsap.to(watermarkRef.current, {
          yPercent: -15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
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

  const headline = 'Building agent systems that ship.';
  const focusItems = [
    { label: 'Research', value: 'Agentic RL · Eval' },
    { label: 'Production', value: 'Alibaba · Shipping' },
    { label: 'Writing', value: 'YouTube / Bilibili' },
    { label: 'Education', value: 'NUS · UNSW' },
  ];
  const credentials = [
    { k: 'role', v: 'LLM Engineer' },
    { k: 'at', v: 'Alibaba' },
    { k: 'based', v: 'Hangzhou' },
    { k: 'papers', v: '4' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col"
      id="home"
      aria-labelledby="hero-heading"
    >
      {/* Background grid */}
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

      {/* Giant watermark — fills background space */}
      <div
        ref={watermarkRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[-4vw] flex justify-center overflow-hidden"
        style={{ opacity: 0 }}
      >
        <span className="type-display font-bold leading-[0.8] tracking-[-0.06em] text-[var(--text)] whitespace-nowrap select-none"
          style={{ fontSize: 'clamp(8rem, 32vw, 32rem)' }}>
          DAMON
        </span>
      </div>

      <div
        aria-hidden="true"
        className="hero-rule pointer-events-none absolute left-6 right-6 top-20 h-px bg-[var(--line)] md:left-10 md:right-10"
      />

      {/* Top metadata bar */}
      <div className="relative z-10 pt-24 md:pt-28 px-6 md:px-10 shrink-0">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="meta-item inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            Available for Work
          </span>
          <span className="meta-item hidden sm:inline">Hangzhou · 30.27°N</span>
          <span className="meta-item type-mono">©2026 / Vol.03</span>
        </div>
      </div>

      {/* Main content — fills the viewport */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 px-6 md:px-10 py-8 md:py-10 items-stretch">
        {/* Left: headline + focus */}
        <div ref={introRef} className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">
          <p className="meta-item text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)] mb-4 md:mb-6">
            AI Researcher / Agent Systems
          </p>
          <h1
            id="hero-heading"
            className="type-display font-medium leading-[1.0] tracking-[-0.03em] text-[var(--text)] text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            {headline.split(' ').map((word, i) => (
              <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.25em]">
                <span className="headline-word inline-block">
                  {word === 'ship.' ? (
                    <em className="not-italic text-[var(--primary)]">{word}</em>
                  ) : (
                    word
                  )}
                </span>
              </span>
            ))}
          </h1>
          <p className="intro-sub mt-6 md:mt-8 text-sm md:text-base leading-relaxed text-[var(--muted)] max-w-md">
            Researching and deploying agentic RL, post-training, and evaluation
            frameworks at Alibaba. Sharing practical AI on YouTube & Bilibili.
          </p>

          <div
            ref={focusRef}
            className="mt-7 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4"
            style={{ willChange: 'transform, opacity' }}
          >
            {focusItems.map((item) => (
              <div key={item.label} className="focus-row">
                <span className="focus-marker mb-2 block h-px w-8 bg-[var(--primary)]" />
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)]">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text)] leading-tight">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="mailto:hello@damon.ai"
              className="meta-item inline-flex items-center gap-2 rounded-full bg-[var(--text)] text-[var(--bg)] px-5 py-2.5 text-sm font-semibold transition-transform active:scale-[0.97]">
              Get in touch
            </a>
            <a href="https://github.com/Damon-GSY" target="_blank" rel="noreferrer"
              className="meta-item inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/60 px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[var(--line-strong)]">
              GitHub ↗
            </a>
          </div>
        </div>

        {/* Right: tall portrait + credential strip */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-4">
          <div className="relative flex-1 min-h-[280px] [perspective:900px]">
            <div
              ref={imageWrapRef}
              className="relative h-full w-full overflow-hidden"
              style={{ clipPath: 'inset(100% 0% 0% 0%)', willChange: 'clip-path' }}
            >
              <div ref={imageInnerRef} className="absolute inset-0" style={{ willChange: 'transform' }}>
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

          <div className="grid grid-cols-4 gap-0 border border-[var(--line)] bg-[var(--surface)]/50 backdrop-blur">
            {credentials.map((c) => (
              <div key={c.k} className="credential-row px-3 py-2.5 border-r border-[var(--line)] last:border-r-0">
                <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--muted)] mb-0.5">{c.k}</p>
                <p className="text-xs font-semibold text-[var(--text)] truncate">{c.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom command surface */}
      <div className="relative z-10 px-6 md:px-10 pb-5 md:pb-7 shrink-0">
        <div className="flex items-end justify-between border-t border-[var(--line)] pt-3.5">
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
