import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import { projects } from '@/data/projects';

const reveal = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

function SpotlightCard({ project, index }) {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handlePointerLeave = () => {
    mouseX.set(-200);
    mouseY.set(-200);
  };

  const background = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, rgba(201,100,66,0.08), transparent 70%)`;
  const isExternal = project.href.startsWith('http');

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ ...reveal, delay: 0.06 + index * 0.05 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-shadow hover:[box-shadow:0_0_0_1px_var(--ring-strong)]"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <h3 className="type-headline text-lg font-semibold text-[var(--text)]">
            {project.title}
          </h3>
          <a
            href={project.href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noreferrer' : undefined}
            aria-label={`View ${project.title}`}
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
      </div>
    </motion.article>
  );
}

function FeaturedHeroCard({ project }) {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handlePointerLeave = () => {
    mouseX.set(-200);
    mouseY.set(-200);
  };

  const background = useMotionTemplate`radial-gradient(480px circle at ${mouseX}px ${mouseY}px, rgba(201,100,66,0.08), transparent 70%)`;
  const isExternal = project.href.startsWith('http');

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ ...reveal, delay: 0.06 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8 transition-shadow hover:[box-shadow:0_0_0_1px_var(--ring-strong)]"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background }}
      />
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary)] mb-3">
            Featured Project
          </p>
          <h3 className="type-headline text-2xl font-bold tracking-tight text-[var(--text)]">
            {project.title}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-[var(--muted)]">
            {project.description}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <a
            href={project.href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noreferrer' : undefined}
            aria-label={`View ${project.title}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-strong)]"
          >
            View project
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export default function FeaturedProjects() {
  const featured = projects.filter((p) => p.featured);
  const [hero, ...rest] = featured;

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

        <div className="mt-10 grid gap-4 lg:grid-cols-5">
          {hero && (
            <div className="lg:col-span-3">
              <FeaturedHeroCard project={hero} />
            </div>
          )}
          {rest.length > 0 && (
            <div className="lg:col-span-2 flex flex-col gap-4">
              {rest.map((project, index) => (
                <SpotlightCard key={project.id} project={project} index={index} />
              ))}
            </div>
          )}
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
