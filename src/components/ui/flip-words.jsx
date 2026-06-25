import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function FlipWords({ words, duration = 3000, className = '' }) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % words.length);
  }, [words.length]);

  useEffect(() => {
    const id = setInterval(next, duration);
    return () => clearInterval(id);
  }, [next, duration]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[index]}
        initial={{ opacity: 0, y: 20, rotateX: 40 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, y: -20, rotateX: -40 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`inline-block ${className}`}
        style={{ perspective: '600px' }}
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
}
