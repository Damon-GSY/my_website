import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { projects } from '@/data/projects';
import SpotlightCard from './ui/spotlight-card';

const reveal = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Research', value: 'research' },
  { label: 'Open Source', value: 'open-source' },
  { label: 'Side Project', value: 'side-project' },
];

function ProjectCard({ project, index }) {
  const isExternal = project.href.startsWith('http');

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...reveal, delay: 0.06 + index * 0.05 }}
    >
      <SpotlightCard className="p-5" as="article">
        <div className="flex items-start justify-between">
          <h2 className="type-headline text-lg font-semibold text-[var(--text)]">
            {project.title}
          </h2>
          <a
            href={project.href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noreferrer' : undefined}
            aria-label={`View ${project.title}`}
            className="ml-2 shrink-0 text-[var(--muted)] transition-colors hover:text-[var(--primary-strong)]"
          >
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

export default function Projects() {
  const [active, setActive] = useState('all');
  const filtered = active === 'all' ? projects : projects.filter((p) => p.category === active);

  return (
    <section className="min-h-screen bg-[var(--bg)] pt-28 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reveal}
          className="max-w-3xl"
        >
          <h1 className="type-headline text-3xl font-semibold tracking-tight text-[var(--text)] md:text-4xl">
            Projects
          </h1>
          <p className="mt-3 text-base text-[var(--muted)] md:text-lg">
            Research, tools, and experiments I&apos;ve built and shipped.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...reveal, delay: 0.08 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActive(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                active === f.value
                  ? 'bg-[var(--primary)] text-[var(--surface)] [box-shadow:rgba(255,255,255,0.15)_0px_2px_0px_0px_inset]'
                  : 'bg-transparent text-[var(--muted)] [box-shadow:0_0_0_1px_var(--ring)] hover:bg-[var(--primary)] hover:text-[var(--surface)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}