import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SparklesText } from './sparkles-text';

export default function HeroKineticWord() {
  const reducedMotion = useReducedMotion();
  const words = useMemo(() => ['ship', 'evaluate', 'recover', 'learn'], []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, 2100);
    return () => window.clearInterval(id);
  }, [reducedMotion, words.length]);

  return (
    <span className="relative inline-flex min-w-[8.1ch] justify-start overflow-visible align-baseline text-[var(--primary)]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 30, rotateX: 42, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -28, rotateX: -36, filter: 'blur(8px)' }}
          transition={{ type: 'spring', stiffness: 120, damping: 22, mass: 0.8 }}
          className="absolute left-0 top-0"
          style={{ transformOrigin: '50% 55%' }}
        >
          <SparklesText
            as="span"
            text={words[index]}
            sparklesCount={7}
            colors={{ first: 'var(--primary)', second: '#69d7c2' }}
            className="font-display font-semibold"
          />
        </motion.span>
      </AnimatePresence>
      <span className="invisible">{words.reduce((a, b) => (a.length > b.length ? a : b), '')}</span>
    </span>
  );
}
