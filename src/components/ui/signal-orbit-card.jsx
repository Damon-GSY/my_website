import { memo, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

function buildDots(count, radius, center = 120) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      delay: index * 0.035,
    };
  });
}

const SignalOrbitCard = memo(function SignalOrbitCard({ className = '' }) {
  const reducedMotion = useReducedMotion();
  const outerDots = useMemo(() => buildDots(44, 95), []);
  const innerDots = useMemo(() => buildDots(32, 70), []);

  const rotateOuter = reducedMotion ? undefined : { rotate: 360 };
  const rotateInner = reducedMotion ? undefined : { rotate: -360 };

  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(217,119,87,0.16),transparent_42%)]" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--primary)]">
            eval signal
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--text)]">
            Live coverage
          </h3>
        </div>
        <span className="rounded-full border border-[var(--line)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">
          online
        </span>
      </div>

      <div className="relative mt-3 h-56 overflow-hidden">
        <svg
          className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2"
          viewBox="0 0 240 240"
          aria-hidden="true"
        >
          <motion.g
            style={{ transformOrigin: '120px 120px' }}
            animate={rotateOuter}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          >
            {outerDots.map((dot, index) => (
              <motion.circle
                key={`outer-${index}`}
                cx={dot.x}
                cy={dot.y}
                r="2.8"
                fill="var(--primary)"
                initial={{ opacity: 0.12, scale: 0.8 }}
                animate={
                  reducedMotion
                    ? undefined
                    : { opacity: [0.16, 0.72, 0.16], scale: [0.82, 1.08, 0.82] }
                }
                transition={{ duration: 2.2, repeat: Infinity, delay: dot.delay, ease: 'easeInOut' }}
              />
            ))}
          </motion.g>

          <motion.g
            style={{ transformOrigin: '120px 120px' }}
            animate={rotateInner}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            {innerDots.map((dot, index) => (
              <motion.circle
                key={`inner-${index}`}
                cx={dot.x}
                cy={dot.y}
                r="2.5"
                fill="#69d7c2"
                initial={{ opacity: 0.1, scale: 0.8 }}
                animate={
                  reducedMotion
                    ? undefined
                    : { opacity: [0.12, 0.58, 0.12], scale: [0.8, 1, 0.8] }
                }
                transition={{ duration: 2.6, repeat: Infinity, delay: dot.delay * 1.2, ease: 'easeInOut' }}
              />
            ))}
          </motion.g>

          <motion.circle
            cx="120"
            cy="120"
            r="50"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="74 240"
            animate={reducedMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '120px 120px' }}
          />
          <circle cx="120" cy="120" r="38" fill="var(--surface-soft)" stroke="var(--line)" />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.p
              className="font-display text-4xl font-semibold tabular-nums tracking-tight text-[var(--text)]"
              animate={reducedMotion ? undefined : { y: [0, -2, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              124
            </motion.p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)]">
              live traces
            </p>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">
            passed
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--text)]">91%</p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">
            reviewed
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--text)]">37</p>
        </div>
      </div>
    </div>
  );
});

export default SignalOrbitCard;
