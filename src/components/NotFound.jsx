import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="min-h-[80dvh] flex items-center justify-center bg-[var(--bg)] px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <p className="text-7xl font-bold tracking-tighter text-[var(--primary)]">404</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--text)]">
          Page not found
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition-all duration-200 [box-shadow:0_0_0_1px_var(--ring)] hover:bg-[var(--primary)] hover:text-[var(--surface)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </motion.div>
    </section>
  );
}
