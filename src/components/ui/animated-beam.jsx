import { motion, useReducedMotion } from 'framer-motion';
import { useId } from 'react';

/**
 * AnimatedBeam - Aceternity-style SVG path that draws a glowing gradient beam
 * between two explicit coordinates and animates a FLOWING gradient along it.
 *
 * Caller must pass explicit from/to coordinates (in the SVG's local coordinate
 * space, which equals the parent container's pixel size — see AgentPipeline).
 *
 * The flowing effect comes from animating the `offset` of the linearGradient
 * stops via framer-motion, sweeping a bright segment along the path. This is
 * the canonical Aceternity approach and works without stroke-dash tricks.
 *
 * Reduced-motion users get a single static gradient line (no flow).
 */
export default function AnimatedBeam({
  fromX = 0,
  fromY = 0,
  toX = 0,
  toY = 0,
  curvature = 0,
  duration = 3,
  pathWidth = 2,
  colorStart = 'var(--primary)',
  colorEnd = 'var(--primary-strong)',
  delay = 0,
  className = '',
}) {
  const prefersReducedMotion = useReducedMotion();
  const gradientId = useId().replace(/[:]/g, '');

  // Degenerate (zero-length) path: render nothing so we never draw a
  // misleading dot at (0,0).
  if (fromX === toX && fromY === toY) return null;

  // Quadratic bezier control point — pulled "upward" (negative Y) by curvature.
  const controlX = (fromX + toX) / 2;
  const controlY = (fromY + toY) / 2 - curvature * 100;
  const pathD = `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;

  // Static fallback: terracotta gradient line, no motion.
  if (prefersReducedMotion) {
    return (
      <svg
        className={`pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible ${className}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`grad-static-${gradientId}`} gradientUnits="userSpaceOnUse" x1={fromX} y1={fromY} x2={toX} y2={toY}>
            <stop offset="0%" stopColor={colorStart} stopOpacity="0.4" />
            <stop offset="100%" stopColor={colorEnd} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          d={pathD}
          fill="none"
          stroke={`url(#grad-static-${gradientId})`}
          strokeWidth={pathWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Flowing gradient: animate stop offsets to sweep a bright segment from
  // start -> end, then reset. A second pair of stops paints the dim "tail"
  // so the path is always partially visible.
  const halfDuration = duration / 2;

  return (
    <svg
      className={`pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`grad-${gradientId}`} gradientUnits="userSpaceOnUse" x1={fromX} y1={fromY} x2={toX} y2={toY}>
          {/* dim base layer — always present so the path is visible even between sweeps */}
          <stop offset="0%" stopColor={colorStart} stopOpacity="0.15" />
          <stop offset="100%" stopColor={colorEnd} stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id={`flow-${gradientId}`} gradientUnits="userSpaceOnUse" x1={fromX} y1={fromY} x2={toX} y2={toY}>
          {/* three-stop traveling highlight: bright segment + soft edges */}
          <motion.stop
            stopColor={colorStart}
            stopOpacity="0"
            initial={{ offset: '-30%' }}
            animate={{ offset: ['0%', '100%'] }}
            transition={{ duration, delay, ease: 'linear', repeat: Infinity, repeatType: 'loop' }}
          />
          <motion.stop
            stopColor={colorEnd}
            stopOpacity="1"
            initial={{ offset: '-15%' }}
            animate={{ offset: ['15%', '115%'] }}
            transition={{ duration, delay, ease: 'linear', repeat: Infinity, repeatType: 'loop' }}
          />
          <motion.stop
            stopColor={colorEnd}
            stopOpacity="0"
            initial={{ offset: '0%' }}
            animate={{ offset: ['30%', '130%'] }}
            transition={{ duration, delay, ease: 'linear', repeat: Infinity, repeatType: 'loop' }}
          />
        </linearGradient>
      </defs>

      {/* base (dim) path — always visible */}
      <path
        d={pathD}
        fill="none"
        stroke={`url(#grad-${gradientId})`}
        strokeWidth={pathWidth}
        strokeLinecap="round"
      />

      {/* flowing highlight path — drawn in on mount, then the gradient does the work */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={`url(#flow-${gradientId})`}
        strokeWidth={pathWidth}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: halfDuration, delay, ease: 'easeInOut', repeat: 0 },
          opacity: { duration: halfDuration, delay, ease: 'easeOut', repeat: 0 },
        }}
        style={{ filter: `drop-shadow(0 0 ${pathWidth * 1.5}px ${colorStart})` }}
      />
    </svg>
  );
}
