import { useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

/**
 * macOS-style magnifying dock. Icons scale up based on cursor proximity,
 * spring-smoothed, with a hover/focus tooltip label.
 */
export default function Dock({ items = [], className = '' }) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`flex items-end gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/70 p-2 backdrop-blur-md ${className}`}
      role="navigation"
      aria-label="Social links"
    >
      {items.map((item) => (
        <DockIcon key={item.label} mouseX={mouseX} {...item} />
      ))}
    </motion.div>
  );
}

function DockIcon({ mouseX, label, href, icon }) {
  const Icon = icon;
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Scale value for visual magnification (disabled when prefersReducedMotion is true)
  const scaleSync = useTransform(distance, [-140, 0, 140], [1, 1.4, 1]);
  const scaleSpring = useSpring(scaleSync, { stiffness: 320, damping: 24, mass: 0.4 });
  const scale = prefersReducedMotion ? 1 : scaleSpring;

  return (
    <motion.a
      ref={ref}
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      style={{ width: 44, height: 44 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="relative flex shrink-0 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:border-[var(--primary)]"
      aria-label={label}
    >
      <motion.div
        style={{ scale }}
        className="flex items-center justify-center"
      >
        <Icon className="h-[42%] w-[42%]" />
      </motion.div>
      <span
        className={`pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text)] shadow-lg transition-opacity duration-150 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {label}
      </span>
    </motion.a>
  );
}
