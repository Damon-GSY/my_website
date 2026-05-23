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
  const [display, setDisplay] = useState(direction === 'up' ? 0 : value);

  useEffect(() => {
    if (!inView) return;

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
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [inView, value, direction, delay]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
      className={`tabular-nums ${className}`}
    >
      {display}
    </motion.span>
  );
}
