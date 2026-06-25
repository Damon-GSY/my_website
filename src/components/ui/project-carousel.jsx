import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  X,
} from 'lucide-react';

const resolverNodes = [
  { label: 'api', x: '16%', y: '22%' },
  { label: 'db', x: '74%', y: '18%' },
  { label: 'ops', x: '82%', y: '68%' },
  { label: 'risk', x: '20%', y: '72%' },
  { label: 'meta', x: '50%', y: '48%' },
];

const matrixCells = Array.from({ length: 35 }, (_, index) => ({
  id: index,
  hot: [2, 8, 11, 18, 21, 27, 31].includes(index),
}));

const streamBars = [42, 67, 53, 84, 61, 75, 48];

function visualTypeFor(project) {
  if (project.id.includes('tool-resolution')) return 'resolver';
  if (project.id.includes('domain-llm') || project.kicker.toLowerCase().includes('post-training')) return 'loop';
  if (project.id.includes('evaluation')) return 'matrix';
  if (project.id.includes('supply-chain-agent')) return 'trace';
  return 'stream';
}

function TraceFlowPreview({ reducedMotion, index }) {
  const points = [
    { x: 34, y: 88, label: 'request' },
    { x: 114, y: 46, label: 'plan' },
    { x: 202, y: 78, label: 'gate' },
    { x: 292, y: 38, label: 'handoff' },
  ];

  return (
    <div className="relative h-36 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]/70">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 326 132" aria-hidden="true">
        <path
          d="M34 88 C74 30, 100 34, 114 46 S160 104, 202 78 S260 20, 292 38"
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="1"
        />
        <motion.path
          d="M34 88 C74 30, 100 34, 114 46 S160 104, 202 78 S260 20, 292 38"
          fill="none"
          stroke="var(--primary)"
          strokeLinecap="round"
          strokeWidth="2"
          initial={{ pathLength: reducedMotion ? 1 : 0.1 }}
          animate={reducedMotion ? undefined : { pathLength: [0.1, 1, 0.1] }}
          transition={{ duration: 3.8, repeat: Infinity, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {points.map((point) => (
          <circle
            key={point.label}
            cx={point.x}
            cy={point.y}
            r="5"
            fill="var(--primary)"
          />
        ))}
      </svg>
      <div className="absolute inset-x-4 bottom-4 grid grid-cols-4 gap-2">
        {points.map((point) => (
          <span key={point.label} className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ResolverPreview({ reducedMotion }) {
  return (
    <div className="relative h-36 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]/70">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:24px_24px]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 326 132" aria-hidden="true">
        {resolverNodes.slice(0, 4).map((node) => (
          <line
            key={node.label}
            x1={node.x}
            y1={node.y}
            x2="50%"
            y2="48%"
            stroke="var(--primary)"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
        ))}
      </svg>
      {resolverNodes.map((node) => {
        const isMeta = node.label === 'meta';
        const Node = isMeta ? motion.div : 'div';
        return (
          <Node
            key={node.label}
            className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border font-mono text-[9px] uppercase tracking-[0.12em] ${
              isMeta
                ? 'border-[var(--primary)] bg-[var(--primary)]/12 text-[var(--text)]'
                : 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)]'
            }`}
            style={{ left: node.x, top: node.y }}
            animate={isMeta && !reducedMotion ? { opacity: [0.62, 1, 0.62] } : undefined}
            transition={isMeta ? { duration: 2.6, repeat: Infinity, ease: [0.22, 1, 0.36, 1] } : undefined}
          >
            {node.label}
          </Node>
        );
      })}
    </div>
  );
}

function LoopPreview({ reducedMotion }) {
  const phases = ['bench', 'sft', 'reward', 'eval'];

  return (
    <div className="relative h-36 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]/70">
      <svg className="absolute left-4 top-1/2 h-28 w-28 -translate-y-1/2" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="42" fill="none" stroke="var(--line-strong)" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r="42"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="86 264"
          animate={reducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '60px 60px' }}
        />
        <circle cx="60" cy="60" r="24" fill="var(--surface-soft)" stroke="var(--line)" />
      </svg>
      <div className="absolute bottom-5 right-5 top-5 grid w-[52%] content-center gap-2">
        {phases.map((phase, phaseIndex) => (
          <div
            key={phase}
            className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
              0{phaseIndex + 1}
            </span>
            <span className="text-xs font-semibold text-[var(--muted-strong)]">{phase}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatrixPreview({ reducedMotion }) {
  return (
    <div className="relative h-36 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]/70 p-4">
      <div className="grid h-full grid-cols-7 gap-2">
        {matrixCells.map((cell) => {
          const Cell = cell.id === 18 ? motion.span : 'span';
          return (
            <Cell
              key={cell.id}
              className={`rounded-md border ${
                cell.hot
                  ? 'border-[var(--primary)]/60 bg-[var(--primary)]/22'
                  : 'border-[var(--line)] bg-[var(--surface-soft)]'
              }`}
              animate={cell.id === 18 && !reducedMotion ? { opacity: [0.45, 1, 0.45] } : undefined}
              transition={cell.id === 18 ? { duration: 2.4, repeat: Infinity, ease: [0.22, 1, 0.36, 1] } : undefined}
            />
          );
        })}
      </div>
      <span className="absolute bottom-4 right-4 bg-[var(--surface)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
        250 papers
      </span>
    </div>
  );
}

function BarStreamPreview({ reducedMotion, index }) {
  return (
    <div className="relative grid h-36 grid-cols-7 items-end gap-2 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]/70 p-4">
      {streamBars.map((bar, barIndex) => {
        const Bar = barIndex === 3 ? motion.span : 'span';
        return (
          <Bar
            key={barIndex}
            className="rounded-t-md bg-[var(--primary)]/70"
            style={barIndex === 3 ? undefined : { height: `${bar}%` }}
            initial={barIndex === 3 ? { height: `${bar}%` } : undefined}
            animate={
              barIndex === 3 && !reducedMotion
                ? { height: [`${bar - 18}%`, `${bar}%`, `${bar - 12}%`] }
                : undefined
            }
            transition={
              barIndex === 3
                ? { duration: 2.4, repeat: Infinity, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

function ProjectVisual({ project, index, reducedMotion }) {
  const type = visualTypeFor(project);
  if (type === 'trace') return <TraceFlowPreview reducedMotion={reducedMotion} index={index} />;
  if (type === 'resolver') return <ResolverPreview reducedMotion={reducedMotion} />;
  if (type === 'loop') return <LoopPreview reducedMotion={reducedMotion} />;
  if (type === 'matrix') return <MatrixPreview reducedMotion={reducedMotion} />;
  return <BarStreamPreview reducedMotion={reducedMotion} index={index} />;
}

function ProjectSignal({ project, index }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative min-h-72 overflow-hidden px-3 py-4 md:px-5">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_1px_1px,var(--primary)_1px,transparent_0)] [background-size:20px_20px]"
      />
      <div className="relative flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
          object {String(index + 1).padStart(2, '0')}
        </span>
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--primary)]">
          {project.kicker}
        </span>
      </div>

      <div className="relative mt-7">
        <ProjectVisual project={project} index={index} reducedMotion={reducedMotion} />
      </div>

      <div className="relative mt-5">
        <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight text-[var(--text)] md:text-3xl">
          {project.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
          {project.description}
        </p>
      </div>
    </div>
  );
}

function ProjectLink({ project, children, className = '' }) {
  if (project.href.startsWith('http')) {
    return (
      <a href={project.href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={project.href} className={className}>
      {children}
    </Link>
  );
}

export default function ProjectCarousel({ projects }) {
  const scrollRef = useRef(null);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [active, setActive] = useState(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!active) return undefined;

    const previouslyFocused = document.activeElement;
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActive(null);
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll(focusableSelector));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [active]);

  const scrollBy = (direction) => {
    scrollRef.current?.scrollBy({
      left: direction * 420,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <div className="relative border-t border-[var(--line)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
          object rail / trace-backed cases
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-[0.97]"
            aria-label="Previous project"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-[0.97]"
            aria-label="Next project"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="-mx-4 flex snap-x overflow-x-auto border-b border-[var(--line)] px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((project, index) => (
          <motion.button
            key={project.id}
            type="button"
            layoutId={`project-card-${project.id}`}
            onClick={() => setActive(project)}
            className="group relative min-w-[min(84vw,24rem)] snap-start overflow-hidden border-r border-[var(--line)] bg-transparent p-0 text-left transition-colors last:border-r-0 hover:bg-[var(--surface)]/55 md:min-w-[27rem]"
          >
            <ProjectSignal project={project} index={index} />
            <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-3 md:px-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                  {project.year} / {project.stage}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                  Open case
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-[var(--muted)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--primary)]" />
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]/88 p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setActive(null)}
          >
            <motion.article
              ref={dialogRef}
              layoutId={`project-card-${active.id}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`project-dialog-${active.id}`}
              className="relative max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-[1.65rem] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[0_30px_110px_-70px_rgba(0,0,0,0.9)]"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setActive(null)}
                className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                aria-label="Close project details"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                <ProjectSignal project={active} index={projects.findIndex((project) => project.id === active.id)} />

                <div className="p-4 md:p-6">
                  <p className="pr-12 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--primary)]">
                    {active.kicker} / {active.year}
                  </p>
                  <h3
                    id={`project-dialog-${active.id}`}
                    className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-[var(--text)] md:text-5xl"
                  >
                    {active.title}
                  </h3>
                  <p className="mt-5 text-sm leading-7 text-[var(--muted)] md:text-base">
                    {active.description}
                  </p>

                  {active.outcome && (
                    <p className="mt-5 border-l-2 border-[var(--primary)] bg-[var(--primary)]/[0.04] py-2 pl-4 pr-3 font-mono text-xs leading-6 text-[var(--muted-strong)]">
                      {active.outcome}
                    </p>
                  )}

                  <div className="mt-6 space-y-3">
                    {active.details?.map((detail) => (
                      <div key={detail} className="flex gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                        <span className="text-sm leading-6 text-[var(--muted-strong)]">
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>

                  <ProjectLink
                    project={active}
                    className="mt-8 inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    View project
                    <ArrowUpRight className="h-4 w-4" />
                  </ProjectLink>
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
