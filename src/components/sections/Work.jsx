import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects } from '@/data/projects';
import ProjectCarousel from '../ui/project-carousel';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

export default function Work() {
  const featured = projects.filter((project) => project.featured).slice(0, 6);
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="work"
      className="agent-os-section border-t border-[var(--line)] pb-8 pt-4 md:pb-8 md:pt-4"
      aria-labelledby="work-title"
      data-hide-launcher
      data-hide-mobile-launcher
    >
      <div className="agent-os-inner">
        <motion.div
          variants={fadeUp}
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-6 grid gap-5 md:grid-cols-[0.72fr_1.28fr] md:items-end"
        >
          <div>
            <p className="agent-os-inline-label">[03] work objects</p>
            <h2
              id="work-title"
              className="font-display text-2xl font-medium leading-tight tracking-tight text-[var(--text)] md:text-3xl"
            >
              Cases from the same surface.
            </h2>
          </div>
          <div className="flex flex-col gap-5 md:items-start">
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
              These projects keep the same operating grammar: traces, gates,
              metrics, and case details surfaced as inspectable work objects.
            </p>
            <Link
              to="/projects"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-sm font-semibold text-[var(--text)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-[0.98]"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial={reducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <ProjectCarousel projects={featured} />
        </motion.div>
      </div>
    </section>
  );
}
