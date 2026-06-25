import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export default function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  className = '',
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const hasAnimated = useRef(false);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    let rafId;
    const timeout = setTimeout(() => {
      const start = direction === 'up' ? 0 : value;
      const end = direction === 'up' ? value : 0;
      const startTime = performance.now();
      const duration = 1200;

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(start + (end - start) * eased));
        if (progress < 1) rafId = requestAnimationFrame(tick);
      }

      rafId = requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [inView, value, direction, delay]);

  return (
    <motion.span
      ref={ref}
      initial={false}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
      className={`tabular-nums ${className}`}
    >
      {display}
    </motion.span>
  );
}
