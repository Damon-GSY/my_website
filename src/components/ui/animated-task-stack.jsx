import { memo, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const baseItems = [
  { id: 'eval', label: 'Eval gate', detail: 'multi-turn trace passed', score: 92 },
  { id: 'tool', label: 'Tool resolver', detail: '4 candidates selected', score: 86 },
  { id: 'risk', label: 'Risk guard', detail: 'confirmation required', score: 79 },
  { id: 'ship', label: 'Ship lane', detail: 'handoff checkpoint saved', score: 71 },
];

function rotateItems(items) {
  if (items.length < 2) return items;
  const [first, ...rest] = items;
  return [...rest, first];
}

const AnimatedTaskStack = memo(function AnimatedTaskStack({ items = baseItems, className = '' }) {
  const reducedMotion = useReducedMotion();
  const normalized = useMemo(() => items.map((item, index) => ({ ...item, score: item.score ?? 80 - index * 7 })), [items]);
  const [ordered, setOrdered] = useState(normalized);

  useEffect(() => {
    setOrdered(normalized);
  }, [normalized]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const id = window.setInterval(() => {
      setOrdered((current) => rotateItems(current));
    }, 1900);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return (
    <div className={`relative overflow-hidden rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-3 ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,var(--primary)_1px,transparent_0)] [background-size:18px_18px]" />
      <div className="relative mb-3 flex items-center justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--primary)]">
            live priority stack
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Trace priority shifts as constraints and eval signals arrive.
          </p>
        </div>
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)]">
          <span className="absolute h-2.5 w-2.5 rounded-full bg-[var(--primary)] opacity-40 animate-ping" />
          <span className="relative h-2 w-2 rounded-full bg-[var(--primary)]" />
        </span>
      </div>

      <motion.div layout className="relative grid gap-2">
        <AnimatePresence initial={false}>
          {ordered.map((item, index) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.7 }}
              className="group relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2.5"
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-px bg-[var(--primary)]"
                animate={reducedMotion ? undefined : { opacity: index === 0 ? [0.45, 1, 0.45] : 0.35 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] tabular-nums text-[var(--primary)]">
                      0{index + 1}
                    </span>
                    <p className="truncate text-sm font-semibold text-[var(--text)]">
                      {item.label}
                    </p>
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                    {item.detail}
                  </p>
                </div>
                <span className="font-mono text-xs tabular-nums text-[var(--muted-strong)]">
                  {item.score}%
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

export default AnimatedTaskStack;
