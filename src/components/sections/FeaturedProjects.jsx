import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { projects } from '@/data/projects';

const reveal = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

export default function FeaturedProjects() {
  const featured = projects.filter((p) => p.featured);

  return (
    <section className="bg-[var(--bg)] py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={reveal}
          className="max-w-3xl"
        >
          <h2 className="type-headline text-3xl font-semibold tracking-tight text-[var(--text)] md:text-4xl">
            Featured Work
          </h2>
          <p className="mt-3 text-base text-[var(--muted)] md:text-lg">
            Selected projects across research, tooling, and production systems.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((project, index) => {
            const isExternal = project.href.startsWith('http');

            return (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-90px' }}
                transition={{ ...reveal, delay: 0.06 + index * 0.05 }}
                className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-shadow hover:[box-shadow:0_0_0_1px_var(--ring-strong)]"
              >
                <div className="flex items-start justify-between">
                  <h3 className="type-headline text-lg font-semibold text-[var(--text)]">
                    {project.title}
                  </h3>
                  <a
                    href={project.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noreferrer' : undefined}
                    className="ml-2 shrink-0 text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
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
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-90px' }}
          transition={{ ...reveal, delay: 0.14 }}
          className="mt-8"
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition-all duration-200 [box-shadow:0_0_0_1px_var(--ring)] hover:bg-[var(--primary)] hover:text-[var(--surface)]"
          >
            View all projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
