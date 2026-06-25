import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projects } from '@/data/projects';

const reveal = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Production', value: 'production' },
  { label: 'Research', value: 'research' },
  { label: 'Side Project', value: 'side-project' },
];

function ProjectLink({ project, children, className }) {
  const isExternal = project.href.startsWith('http');

  if (isExternal) {
    return (
      <a href={project.href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={project.href} className={className}>
      {children}
    </Link>
  );
}

function ProjectRow({ project, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...reveal, delay: index * 0.04 }}
      className="group border-b border-[var(--line)] last:border-b-0"
    >
      <ProjectLink project={project} className="block py-8 md:py-10">
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          <div className="col-span-12 md:col-span-2">
            <div className="flex items-center gap-3 md:block">
              <span className="type-mono text-xs text-[var(--muted)]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--primary)] md:mt-5">
                {project.kicker}
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-5">
            <div className="overflow-hidden">
              <h2 className="type-display text-3xl font-medium leading-[1.05] tracking-tight text-[var(--text)] transition-colors duration-300 group-hover:text-[var(--primary)] md:text-5xl">
                {project.title}
              </h2>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="border border-[var(--line)] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
                {project.year}
              </span>
              <span className="border border-[var(--line)] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
                {project.stage}
              </span>
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="border border-[var(--line)] px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {project.description}
            </p>
            <p className="mt-4 border-l border-[var(--primary)] pl-4 text-sm font-medium leading-relaxed text-[var(--text)]">
              {project.outcome}
            </p>
            <ul className="mt-5 space-y-2">
              {project.details.slice(0, 3).map((detail) => (
                <li key={detail} className="flex gap-2 text-xs leading-relaxed text-[var(--muted)]">
                  <span className="mt-2 h-px w-4 shrink-0 bg-[var(--line)]" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 flex justify-start md:col-span-1 md:justify-end">
            <span className="inline-flex h-9 w-9 items-center justify-center border border-[var(--line)] text-[var(--muted)] transition-all duration-300 group-hover:border-[var(--primary)] group-hover:text-[var(--primary)]">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </ProjectLink>
    </motion.article>
  );
}

export default function Projects() {
  const [active, setActive] = useState('all');
  const filtered = active === 'all' ? projects : projects.filter((p) => p.category === active);
  const counts = useMemo(
    () =>
      filters.reduce((acc, filter) => {
        acc[filter.value] =
          filter.value === 'all'
            ? projects.length
            : projects.filter((project) => project.category === filter.value).length;
        return acc;
      }, {}),
    []
  );

  return (
    <section className="min-h-screen bg-[var(--bg)] pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reveal}
          className="grid grid-cols-1 gap-8 border-b border-[var(--line)] pb-10 md:grid-cols-12 md:gap-10"
        >
          <div className="md:col-span-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
              Projects
            </p>
            <h1 className="mt-5 type-display text-4xl font-medium tracking-tight text-[var(--text)] md:text-6xl">
              Systems, papers, and tools.
            </h1>
          </div>
          <div className="md:col-span-4 md:pt-12">
            <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              A fuller index of production LLM systems, agent evaluation research, post-training
              work, and creator tooling.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <aside className="md:col-span-3">
            <div className="sticky top-24 py-8">
              <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)]">
                Filter
              </p>
              <div className="flex flex-wrap gap-2 md:flex-col">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActive(filter.value)}
                    className={`flex items-center justify-between gap-4 border px-3 py-2 text-left text-sm transition-colors ${
                      active === filter.value
                        ? 'border-[var(--primary)] text-[var(--text)]'
                        : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--text)]'
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span className="type-mono text-xs">{counts[filter.value]}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="md:col-span-9">
            <div className="border-t border-[var(--line)]">
              {filtered.map((project, index) => (
                <ProjectRow key={project.id} project={project} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
