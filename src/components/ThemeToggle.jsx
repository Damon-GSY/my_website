import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

function setStoredTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Private browsing or storage quota — silently ignore
  }
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    // sync with the class the inline FOUC script already applied before paint
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setStoredTheme(dark ? 'dark' : 'light');
  }, [dark]);

  const toggle = useCallback(() => setDark((v) => !v), []);

  return (
    <button
      onClick={toggle}
      className="relative rounded-full bg-[var(--surface-soft)] p-2 text-[var(--muted)] transition-colors hover:text-[var(--text)] [box-shadow:0_0_0_1px_var(--line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={dark}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? 'sun' : 'moon'}
          initial={{ y: -10, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 10, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="block"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
