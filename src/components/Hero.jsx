import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, Cpu, FileText, Github, Sparkles, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero.png';
import { AnimatedGradientText } from './ui/animated-gradient-text';
import NumberTicker from './ui/number-ticker';
import { posts } from '@/data/posts';

const ease = [0.16, 1, 0.3, 1];

const cellVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, delay: i * 0.06, ease },
  }),
};

const Hero = forwardRef(function Hero() {
  const latestPost = posts[0];

  const stats = [
    { value: 4, label: 'papers', suffix: '' },
    { value: 3, label: 'prod systems', suffix: '' },
    { value: 90, label: 'automation', suffix: '%' },
  ];

  const techStack = ['Python', 'PyTorch', 'React', 'GSAP', 'Docker', 'vLLM'];

  return (
    <section
      className="relative min-h-[100dvh] w-full overflow-hidden pt-16"
      id="home"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-bg grid-bg-fade opacity-30" />
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[var(--primary)]/8 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-[var(--primary)]/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6">
        <motion.div
          initial="hidden"
          animate="visible"
          className="grid grid-cols-12 gap-3 md:gap-4 auto-rows-min"
        >
          {/* Main headline cell — spans 8 cols, 2 rows */}
          <motion.div
            variants={cellVariants}
            custom={0}
            className="col-span-12 lg:col-span-8 lg:row-span-2 relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8 lg:p-10 overflow-hidden min-h-[360px] md:min-h-[420px] flex flex-col justify-between"
          >
            <div className="pointer-events-none absolute right-0 top-0 h-[200px] w-[200px] rounded-full bg-[var(--primary)]/8 blur-[80px]" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online · Available for Work
              </div>

              <h1
                id="hero-heading"
                className="mt-5 font-display font-medium leading-[1.0] tracking-[-0.025em] text-[var(--text)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              >
                Building agent<br />
                systems that{' '}
                <AnimatedGradientText speed={2} className="font-display italic">
                  actually ship
                </AnimatedGradientText>
                .
              </h1>

              <p className="mt-4 max-w-lg text-sm md:text-base leading-relaxed text-[var(--muted)]">
                AI researcher & engineer at Alibaba. Working on agentic RL,
                post-training, and evaluation frameworks for production LLM systems.
              </p>
            </div>

            <div className="relative mt-6 flex flex-wrap items-center gap-2.5">
              <a href="mailto:hello@damon.ai"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--primary-strong)] active:scale-[0.97]">
                Get in touch
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a href="https://github.com/Damon-GSY" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition-all hover:border-[var(--line-strong)] active:scale-[0.97]">
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <span className="ml-auto hidden md:flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                <Sparkles className="h-3 w-3" />
                v3.0
              </span>
            </div>
          </motion.div>

          {/* Profile cell — 4 cols, 1 row */}
          <motion.div
            variants={cellVariants}
            custom={1}
            className="col-span-7 lg:col-span-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden glow-accent"
          >
            <div className="flex items-center gap-3 p-3 border-b border-[var(--line)]">
              <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-[var(--line)] shrink-0">
                <img src={heroImage} alt="Damon" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-[var(--text)] truncate">Damon G.</p>
                <p className="text-[10px] text-[var(--muted)] font-mono truncate">@damon · AI researcher</p>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 shrink-0">● online</span>
            </div>
            <div className="p-3 space-y-1.5 text-[11px] font-mono">
              {[
                { icon: MapPin, k: 'location', v: 'Hangzhou, CN' },
                { icon: Cpu, k: 'role', v: 'LLM @ Alibaba' },
                { icon: FileText, k: 'status', v: 'shipping' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.k} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[var(--muted)]">
                      <Icon className="h-3 w-3" /> {item.k}
                    </span>
                    <span className="text-[var(--text)]">{item.v}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Now widget — 5 cols on mobile (stacks), 4 cols lg */}
          <motion.div
            variants={cellVariants}
            custom={2}
            className="col-span-5 lg:col-span-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 flex flex-col justify-between"
          >
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--primary)] mb-2">
                // now
              </p>
              <p className="text-sm font-semibold text-[var(--text)] leading-tight">
                Multi-turn agent<br />evaluation taxonomy
              </p>
            </div>
            <p className="mt-3 text-[11px] text-[var(--muted)] font-mono">
              research · 2025
            </p>
          </motion.div>

          {/* Stats cells — 3 cells in a row */}
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={cellVariants}
              custom={3 + i}
              className="col-span-4 lg:col-span-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 md:p-5"
            >
              <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--muted)] mb-1">
                {stat.label}
              </p>
              <p className="font-display text-3xl md:text-4xl font-bold text-[var(--text)] tabular-nums leading-none">
                <NumberTicker value={stat.value} />{stat.suffix}
              </p>
              <div className="mt-2 h-0.5 w-full bg-[var(--line)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] rounded-full"
                  style={{ width: `${Math.min(stat.value * 10, 100)}%` }}
                />
              </div>
            </motion.div>
          ))}

          {/* Latest post + tech stack — spans remaining 6 cols */}
          <motion.div
            variants={cellVariants}
            custom={6}
            className="col-span-12 lg:col-span-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 md:p-5 flex flex-col sm:flex-row gap-4 sm:items-center"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--primary)] mb-1.5">
                // latest_note
              </p>
              <Link to={`/blog/${latestPost.slug}`} className="group block">
                <h3 className="font-display text-base font-medium text-[var(--text)] group-hover:text-[var(--primary)] transition-colors leading-tight">
                  {latestPost.title}
                </h3>
                <p className="text-[11px] text-[var(--muted)] mt-1 font-mono">
                  {latestPost.date} · {latestPost.category}
                </p>
              </Link>
            </div>
            <div className="shrink-0 sm:border-l sm:border-[var(--line)] sm:pl-4">
              <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--muted)] mb-1.5 flex items-center gap-1">
                <PenLine className="h-3 w-3" /> stack
              </p>
              <div className="flex flex-wrap gap-1 max-w-[160px]">
                {techStack.map((tech) => (
                  <span key={tech}
                    className="text-[9px] font-mono text-[var(--muted)] border border-[var(--line)] rounded px-1 py-0.5">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
});

export default Hero;
