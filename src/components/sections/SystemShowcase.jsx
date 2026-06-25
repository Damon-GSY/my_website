import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Braces,
  CheckCircle2,
  DatabaseZap,
  ShieldCheck,
} from 'lucide-react';
import { ContainerScroll } from '../ui/container-scroll';

const checks = [
  'Risk action routes to confirmation',
  'Tool pool narrows before execution',
  'Rollback checkpoint stores trace state',
  'Eval result attaches to the handoff',
];

const streams = [
  { label: 'planner', value: '13 active' },
  { label: 'resolver', value: '4 tools' },
  { label: 'judge', value: '92.4%' },
  { label: 'handoff', value: '0.8s' },
];

const checkList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const checkItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

function OperatorCard() {
  const reducedMotion = useReducedMotion();

  return (
    <article className="h-full rounded-2xl bg-[var(--surface)] p-4 md:p-5">
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--primary)]">
            agent desk
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--text)]">
            Operating layer
          </h3>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
          <DatabaseZap className="h-4 w-4 text-[var(--primary)]" />
        </span>
      </div>

      <div className="grid gap-3 py-3 md:grid-cols-[0.88fr_1.12fr]">
        <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
          <div className="flex items-center justify-between">
            <Braces className="h-5 w-5 text-[var(--primary)]" />
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-strong)]">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]"
                animate={reducedMotion ? undefined : { opacity: [0.45, 1, 0.45], scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
              />
              active
            </span>
          </div>
          <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            current run
          </p>
          <p className="mt-2 font-display text-[1.6rem] font-semibold leading-none tracking-tight text-[var(--text)]">
            supply-chain exception
          </p>
        </div>

        <motion.div
          variants={checkList}
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="divide-y divide-[var(--line)] border-y border-[var(--line)]"
        >
          {checks.map((check) => (
            <motion.div
              key={check}
              variants={checkItem}
              className="flex items-start gap-3 py-2.5"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
              <span className="text-[13px] leading-5 text-[var(--muted-strong)]">
                {check}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="grid border-t border-[var(--line)] sm:grid-cols-4">
        {streams.map((stream, index) => (
          <div
            key={stream.label}
            className={`py-2.5 sm:px-3 ${index > 0 ? 'border-t border-[var(--line)] sm:border-l sm:border-t-0' : ''}`}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
              {stream.label}
            </p>
            <p className="mt-1.5 font-display text-lg font-semibold text-[var(--text)]">
              {stream.value}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function ShowcaseHeader() {
  return (
    <div className="grid gap-5 text-left md:grid-cols-[0.78fr_1fr] md:items-end">
      <div>
        <p className="agent-os-inline-label">[02] control surface</p>
        <h2
          id="control-surface-title"
          className="max-w-lg font-display text-2xl font-medium leading-tight tracking-tight text-[var(--text)] md:text-3xl"
        >
          Runtime state settles into operations.
        </h2>
      </div>
      <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
        The same trace from the runtime selector becomes a flatter operating
        layer: guardrails stay visible, telemetry keeps moving, and the human
        handoff path remains attached.
      </p>
    </div>
  );
}

export default function SystemShowcase() {
  return (
    <section
      id="control-surface"
      className="agent-os-section pb-0 pt-0"
      aria-labelledby="control-surface-title"
    >
      <div className="agent-os-inner">
        <ContainerScroll titleComponent={<ShowcaseHeader />}>
          <div className="grid gap-3 p-2 md:grid-cols-[1.15fr_0.85fr] md:p-3">
            <OperatorCard />

            <div className="grid gap-3">
              <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
                  <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
                </div>
                <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  guardrail
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--text)]">
                  Approval stays visible.
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  High-risk execution is held in a separate surface, with the
                  trace and rollback path still attached.
                </p>
              </article>

              <article className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 md:p-5">
                <div
                  aria-hidden="true"
                  className="absolute right-5 top-5 h-16 w-16 rounded-full border border-[var(--line)]"
                />
                <Activity className="relative h-5 w-5 text-[var(--primary)]" />
                <p className="relative mt-10 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  telemetry
                </p>
                <h3 className="relative mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--text)]">
                  State changes stay legible.
                </h3>
              </article>
            </div>
          </div>
        </ContainerScroll>
      </div>
    </section>
  );
}
