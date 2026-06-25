import AnimatedBeam from './ui/animated-beam';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const nodes = [
  'Research / Data',
  'Post-Training (SFT·RL)',
  'Evaluation',
  'Agent Runtime',
  'Shipping',
];

/**
 * AgentPipeline - Horizontal agent-systems pipeline diagram.
 * Shows the flow from research through to shipping with animated connections.
 *
 * Layout: a single relative container holds BOTH the nodes and an absolutely
 * positioned SVG layer for the beams. Node centers are measured with
 * getBoundingClientRect() relative to that container, so the path coordinates
 * line up with the SVG's local space (the SVG fills the container via
 * absolute inset-0).
 */
export default function AgentPipeline() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef(null);
  const nodeRefs = useRef(nodes.map(() => ({ current: null })));
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [centers, setCenters] = useState(nodes.map(() => ({ x: 0, y: 0 })));
  const [activeIndex, setActiveIndex] = useState(0);

  // Re-measure container size + node centers on mount, resize, and after
  // fonts/layout settle. rAF ensures we measure after the browser has laid
  // the flex row out.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const measure = () => {
      const rect = container.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
      setCenters(
        nodeRefs.current.map((ref) => {
          const el = ref.current;
          if (!el) return { x: 0, y: 0 };
          const r = el.getBoundingClientRect();
          return {
            x: r.left - rect.left + r.width / 2,
            y: r.top - rect.top + r.height / 2,
          };
        })
      );
    };
    // measure twice: immediately + after paint (covers font swap / layout shift)
    measure();
    const raf = requestAnimationFrame(measure);
    const t = setTimeout(measure, 250);
    window.addEventListener('resize', measure);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(container);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % nodes.length);
    }, 1200);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion]);

  const setNodeRef = (index) => (el) => {
    nodeRefs.current[index].current = el;
  };

  // Build one SVG-layer per layout (desktop / mobile). Each holds a
  // <AnimatedBeam> per consecutive pair. The SVG layer sits absolutely
  // over the container so the beam paths render on top of empty space
  // between the pills — never clipped to a pill.
  const renderBeams = () =>
    nodes.slice(0, -1).map((_, index) => {
      const from = centers[index];
      const to = centers[index + 1];
      if (!from || !to) return null;
      return (
        <AnimatedBeam
          key={`beam-${index}`}
          fromX={from.x}
          fromY={from.y}
          toX={to.x}
          toY={to.y}
          curvature={0.5}
          duration={3}
          pathWidth={2}
          colorStart="var(--primary)"
          colorEnd="var(--primary-strong)"
          delay={index * 0.3}
        />
      );
    });

  return (
    <div ref={containerRef} className="relative w-full py-12 px-4">
      {/* Beam overlay (desktop). Sits over the row; pointer-events none. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{ width: size.w || '100%', height: size.h || '100%' }}
      >
        {renderBeams()}
      </div>

      {/* Mobile trace rail. Keeps the flow visible without crossing text. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-16 left-1/2 top-16 w-px -translate-x-1/2 overflow-hidden bg-[var(--line)] md:hidden"
      >
        <motion.span
          className="absolute left-0 top-0 h-16 w-px bg-gradient-to-b from-transparent via-[var(--primary)] to-transparent"
          animate={prefersReducedMotion ? undefined : { y: ['-120%', '720%'] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Desktop: horizontal layout */}
      <div className="hidden md:flex items-center justify-between gap-4 relative">
        {nodes.map((node, index) => (
          <div key={node} ref={setNodeRef(index)} className="relative">
            <motion.div
              className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
                index === activeIndex
                  ? 'border-[var(--primary)]/60 bg-[var(--primary)]/[0.08]'
                  : 'border-[var(--line)] bg-[var(--surface)]'
              }`}
              animate={prefersReducedMotion ? undefined : { y: index === activeIndex ? [0, -3, 0] : 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="relative flex h-2 w-2">
                {index === activeIndex && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-60 animate-ping" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
              </span>
              <span className="type-mono text-sm text-[var(--text)]">{node}</span>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Mobile: vertical layout */}
      <div className="md:hidden flex flex-col items-center gap-6 relative">
        {nodes.map((node, index) => (
          <div key={node} ref={setNodeRef(index)} className="relative w-full flex justify-center">
            <motion.div
              className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
                index === activeIndex
                  ? 'border-[var(--primary)]/60 bg-[var(--primary)]/[0.08]'
                  : 'border-[var(--line)] bg-[var(--surface)]'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {index === activeIndex && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-60 animate-ping" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
              </span>
              <span className="type-mono text-sm text-[var(--text)]">{node}</span>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
