import { motion, useReducedMotion } from 'framer-motion';
import { useId } from 'react';

export default function BorderBeam({
  duration = 10,
  delay = 0,
  colorFrom = 'var(--primary)',
  colorTo = 'var(--primary-strong)',
  className = '',
}) {
  const prefersReducedMotion = useReducedMotion();
  const gradientId = useId().replace(/[:]/g, '');

  if (prefersReducedMotion) return null;

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-[1px] h-[calc(100%-2px)] w-[calc(100%-2px)] overflow-visible ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`border-beam-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colorFrom} stopOpacity="0" />
          <stop offset="48%" stopColor={colorFrom} stopOpacity="0.95" />
          <stop offset="100%" stopColor={colorTo} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.rect
        x="0.75"
        y="0.75"
        width="98.5"
        height="98.5"
        rx="5.5"
        ry="5.5"
        fill="none"
        pathLength="1"
        stroke={`url(#border-beam-${gradientId})`}
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeDasharray="0.16 0.84"
        animate={{ strokeDashoffset: [0, -1] }}
        transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
