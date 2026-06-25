import { memo, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const LiveCodeSurface = memo(function LiveCodeSurface({
  icon: Icon,
  label,
  title,
  objectId,
  lines = [],
  featured = false,
}) {
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion || lines.length < 2) return undefined;
    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % lines.length);
    }, featured ? 1200 : 1500);
    return () => window.clearInterval(id);
  }, [featured, lines.length, reducedMotion]);

  return (
    <div className={`rounded-[1.4rem] border border-[var(--line)] bg-[var(--bg)]/75 p-2 ${featured ? 'md:p-3' : ''}`}>
      <div className="relative overflow-hidden rounded-[1rem] border border-[var(--line)] bg-[var(--surface)]">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--primary)]/12 to-transparent"
          animate={reducedMotion ? undefined : { y: ['-100%', '420%'] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative flex items-center justify-between border-b border-[var(--line)] px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--line-strong)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--line-strong)]" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">
            {label}
          </span>
        </div>

        <div className={`relative grid gap-4 p-4 ${featured ? 'md:grid-cols-[0.82fr_1.18fr] md:p-5' : ''}`}>
          <div className="relative flex min-h-32 flex-col justify-between overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--primary)_0%,transparent_24%)] opacity-10"
              animate={reducedMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {Icon && <Icon className="relative h-5 w-5 text-[var(--primary)]" />}
            <div className="relative">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">
                object {objectId}
              </p>
              <p className="mt-1 font-display text-xl font-semibold tracking-tight text-[var(--text)]">
                {title}
                <motion.span
                  aria-hidden="true"
                  className="ml-1 inline-block h-5 w-[2px] translate-y-0.5 bg-[var(--primary)]"
                  animate={reducedMotion ? undefined : { opacity: [0, 1, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'steps(2)' }}
                />
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {lines.map((line, lineIndex) => {
              const active = lineIndex === activeIndex;
              return (
                <motion.div
                  key={line}
                  className={`relative flex items-center gap-2 overflow-hidden rounded-lg border px-3 py-2 ${
                    active
                      ? 'border-[var(--primary)]/50 bg-[var(--primary)]/[0.08]'
                      : 'border-[var(--line)] bg-[var(--surface-soft)]'
                  }`}
                  animate={active && !reducedMotion ? { x: [0, 2, 0] } : undefined}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  {active && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ['-120%', '680%'] }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                  <span className="relative font-mono text-[9px] tabular-nums text-[var(--primary)]">
                    0{lineIndex + 1}
                  </span>
                  <span className="relative font-mono text-[11px] text-[var(--muted-strong)]">
                    {line}
                  </span>
                </motion.div>
              );
            })}
            <div className="relative h-16 overflow-hidden rounded-lg border border-dashed border-[var(--line-strong)] bg-[linear-gradient(135deg,var(--primary)_0%,transparent_1px),linear-gradient(135deg,transparent_0%,transparent_100%)] bg-[length:18px_18px]">
              <motion.div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent"
                animate={reducedMotion ? undefined : { x: ['-100%', '420%'] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default LiveCodeSurface;
