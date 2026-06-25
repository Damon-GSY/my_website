import { useEffect, useRef, forwardRef } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { posts } from '@/data/posts';
import ParticleField from '@/components/ui/particle-field';
import EncryptedText from '@/components/ui/encrypted-text';
import HeroKineticWord from '@/components/ui/hero-kinetic-word';
import MagneticButton from './MagneticButton';
import MorphContact from '@/components/ui/morph-contact';

gsap.registerPlugin(ScrollTrigger);

const Hero = forwardRef(function Hero() {
  const sectionRef = useRef(null);
  const introRef = useRef(null);
  const gridRef = useRef(null);
  const imageWrapRef = useRef(null);
  const imageInnerRef = useRef(null);
  const focusRef = useRef(null);
  const stripRef = useRef(null);
  const scrollHintRef = useRef(null);

  useEffect(() => {
    let ctx;
    let cleanupPointer;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(imageWrapRef.current, { opacity: 1, y: 0 });
      gsap.set(imageInnerRef.current, { scale: 1, y: 0 });
      gsap.set(focusRef.current, { opacity: 1, y: 0 });
      gsap.set(stripRef.current, { opacity: 1, y: 0 });
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
          '.credential-cell',
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.06 },
          1.0
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
          '.strip-cell',
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: 'power3.out' },
          1.15
        );

        tl.fromTo(
          scrollHintRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5 },
          1.3
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

        gsap.to(stripRef.current, {
          opacity: 0,
          y: 20,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '50% top',
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
  const dashboardSignals = [
    { k: 'eval suite', v: '42 axes' },
    { k: 'tool pool', v: '100+' },
    { k: 'handoff', v: '<1s' },
  ];
  const deskItems = [
    'multi-turn eval taxonomy',
    'tool resolver traces',
    'post-training reward notes',
  ];
  const latestPost = posts[0];
  const techStack = ['Python', 'PyTorch', 'React', 'GSAP'];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[86dvh] w-full overflow-hidden flex flex-col"
      id="home"
      aria-labelledby="hero-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[5%] h-[460px] w-[680px] max-w-[92%] -translate-x-1/2 rounded-full bg-[var(--primary)]/[0.08] blur-[130px]"
      />
      <ParticleField />
      <div
        ref={gridRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
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
      <div className="relative z-10 pt-20 px-6 md:px-10 md:pt-24 shrink-0">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="meta-item inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            Available for Work
          </span>
          <span className="meta-item hidden sm:inline">Hangzhou · 30.27°N</span>
          <span className="meta-item type-mono">©2026 / Vol.03</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 grid grid-cols-1 gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.78fr)] lg:items-center">
        {/* Left: headline + focus + CTAs */}
        <div ref={introRef} className="order-1 flex flex-col justify-center">
          <div className="meta-item mb-4 md:mb-6">
            <EncryptedText
              as="p"
              text="AI Researcher / Agent Systems"
              className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)]"
            />
          </div>
          <h1
            id="hero-heading"
            className="type-display max-w-4xl text-[2.55rem] font-medium leading-[0.96] tracking-[-0.03em] text-[var(--text)] sm:text-5xl md:text-6xl lg:text-[4.7rem] xl:text-[5.35rem]"
          >
            {['Building', 'agent', 'systems', 'that'].map((word) => (
              <span key={word} className="inline-block overflow-hidden align-bottom mr-[0.25em]">
                <span className="headline-word inline-block">{word}</span>
              </span>
            ))}
            <span className="headline-word inline-block overflow-visible align-bottom">
              <HeroKineticWord />.
            </span>
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
            <MagneticButton strength={0.35}>
              <MorphContact
                triggerClassName="meta-item inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-strong)] active:scale-[0.97]"
                triggerAriaLabel="Get in touch — open contact overlay"
              >
                Get in touch
              </MorphContact>
            </MagneticButton>
            <MagneticButton strength={0.35}>
              <a href="https://github.com/Damon-GSY" target="_blank" rel="noreferrer"
                className="meta-item inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/60 px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[var(--line-strong)]">
                GitHub ↗
              </a>
            </MagneticButton>
          </div>
        </div>

        {/* Right: portrait + credential caption */}
        <div className="order-2 flex flex-col gap-4 lg:min-h-[520px]">
          <div className="relative min-h-[340px] flex-1 overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface-soft)] shadow-[0_24px_80px_-48px_var(--primary)] [perspective:900px]">
            <div
              ref={imageWrapRef}
              className="absolute inset-2 overflow-hidden rounded-[1.45rem] border border-[var(--line)] bg-[var(--bg)]"
              style={{ willChange: 'transform, opacity' }}
            >
              <div ref={imageInnerRef} className="absolute inset-0 p-4 md:p-5" style={{ willChange: 'transform' }}>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,var(--primary)_0%,transparent_18%),radial-gradient(circle_at_80%_70%,var(--primary)_0%,transparent_16%)] opacity-20"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.16]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)',
                    backgroundSize: '42px 42px',
                  }}
                />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[9px] font-mono uppercase tracking-[0.16em] text-white/75 backdrop-blur-md">
                  <span>research desk</span>
                  <span>hangzhou / 2026</span>
                </div>

                <div className="relative flex h-full flex-col justify-between pt-12 text-white">
                  <div className="grid gap-3">
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <div
                        aria-hidden="true"
                        className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-[var(--primary)]/25"
                      />
                      <div className="relative flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 font-display text-xl font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                          D
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                            active profile
                          </p>
                          <p className="mt-2 font-display text-3xl font-semibold leading-none tracking-tight md:text-4xl">
                            Damon Guo-Siyi
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {['Alibaba', 'Hangzhou', 'AI creator'].map((item) => (
                              <span key={item} className="rounded-md border border-white/10 bg-black/20 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="relative mt-4 max-w-sm text-sm leading-6 text-white/62">
                        I write the eval before I train the model, then turn the
                        trace into a tool surface people can actually operate.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {dashboardSignals.map((item) => (
                        <div key={item.k} className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
                            {item.k}
                          </p>
                          <p className="mt-2 font-display text-xl font-semibold tracking-tight text-white">
                            {item.v}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3 backdrop-blur-md">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/38">
                        desk queue
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--primary)]">
                        public notes soon
                      </span>
                    </div>
                    {deskItems.map((item, index) => (
                      <div key={item} className="flex items-center gap-3 border-b border-white/10 py-2 last:border-b-0">
                        <span className="font-mono text-[9px] text-[var(--primary)]">
                          0{index + 1}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/65">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-0 border border-[var(--line)] bg-[var(--surface)]/50 backdrop-blur">
            {credentials.map((c) => (
              <div key={c.k} className="credential-cell px-3 py-2.5 border-r border-[var(--line)] last:border-r-0">
                <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--muted)] mb-0.5">{c.k}</p>
                <p className="text-xs font-semibold text-[var(--text)] truncate">{c.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editorial info strip — restrained horizontal, magazine footer style */}
      <div ref={stripRef} className="relative z-10 px-6 md:px-10 pb-5 md:pb-7 shrink-0">
        <div className="border-t border-[var(--line)]">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--line)]">
            {/* Now */}
            <div className="strip-cell py-3 md:py-3.5 md:pr-6">
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--primary)] mb-1">
                Now
              </p>
              <p className="text-sm font-semibold text-[var(--text)] leading-tight">
                Multi-turn agent evaluation taxonomy
              </p>
              <p className="text-[11px] text-[var(--muted)] mt-1 font-mono">
                research · 2025
              </p>
            </div>

            {/* Latest writing */}
            <div className="strip-cell py-3 md:py-3.5 md:px-6">
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--primary)] mb-1">
                Latest writing
              </p>
              <Link
                to={`/blog/${latestPost.slug}`}
                className="group flex items-start gap-1.5"
              >
                <span className="text-sm font-semibold text-[var(--text)] leading-tight group-hover:text-[var(--primary)] transition-colors">
                  {latestPost.title}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 mt-0.5 text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors shrink-0" />
              </Link>
              <p className="text-[11px] text-[var(--muted)] mt-1 font-mono">
                {latestPost.date} · {latestPost.category}
              </p>
            </div>

            {/* Tech stack */}
            <div className="strip-cell py-3 md:py-3.5 md:pl-6">
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--primary)] mb-1">
                Stack
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {techStack.map((tech, i) => (
                  <span key={tech} className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text)]">{tech}</span>
                    {i < techStack.length - 1 && (
                      <span className="text-[var(--muted)] text-xs">·</span>
                    )}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-[var(--muted)] mt-1 font-mono">
                + vLLM · Docker · LangGraph
              </p>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-3 flex justify-center">
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
