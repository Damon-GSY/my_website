import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BriefcaseBusiness,
  FileText,
  FlaskConical,
  GraduationCap,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Timeline } from './ui/timeline';
import { aboutProfile, timelineData } from '@/data/about';

const TRACK_STYLES = {
  'Full-time': {
    chip: 'border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]',
    iconWrap: 'border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]',
    dot: 'bg-[var(--primary)]/80',
    edge: 'from-[var(--primary)]/70 to-transparent',
  },
  Internship: {
    chip: 'border-[var(--sage)]/30 bg-[var(--sage)]/10 text-[var(--sage)]',
    iconWrap: 'border-[var(--sage)]/30 bg-[var(--sage)]/10 text-[var(--sage)]',
    dot: 'bg-[var(--sage)]/80',
    edge: 'from-[var(--sage)]/70 to-transparent',
  },
  Education: {
    chip: 'border-[var(--taupe)]/30 bg-[var(--taupe)]/10 text-[var(--taupe)]',
    iconWrap: 'border-[var(--taupe)]/30 bg-[var(--taupe)]/10 text-[var(--taupe)]',
    dot: 'bg-[var(--taupe)]/80',
    edge: 'from-[var(--taupe)]/70 to-transparent',
  },
  Research: {
    chip: 'border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]',
    iconWrap: 'border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]',
    dot: 'bg-[var(--primary)]/80',
    edge: 'from-[var(--primary)]/70 to-transparent',
  },
  'Project / Competition': {
    chip: 'border-[var(--sage)]/30 bg-[var(--sage)]/10 text-[var(--sage)]',
    iconWrap: 'border-[var(--sage)]/30 bg-[var(--sage)]/10 text-[var(--sage)]',
    dot: 'bg-[var(--sage)]/80',
    edge: 'from-[var(--sage)]/70 to-transparent',
  },
};

const TRACK_ICONS = {
  'Full-time': BriefcaseBusiness,
  Internship: FlaskConical,
  Education: GraduationCap,
  Research: FileText,
  'Project / Competition': Trophy,
};

function TimelineCard({ track, title, location, points }) {
  const style = TRACK_STYLES[track] ?? TRACK_STYLES['Project / Competition'];
  const TrackIcon = TRACK_ICONS[track] ?? Sparkles;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 [box-shadow:0_0_0_1px_var(--ring)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_66px_-42px_rgba(0,0,0,0.4)]">
      <div className={`pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${style.edge}`} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${style.chip}`}>
          {track}
        </span>
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${style.iconWrap}`}>
          <TrackIcon className="h-4 w-4" />
        </div>
      </div>

      <h4 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text)] mb-2">
        {title}
      </h4>
      <p className="text-sm text-[var(--muted)] mb-4">{location}</p>

      <ul className="space-y-2.5">
        {points.map((point) => (
          <li key={point} className="flex gap-2.5 text-[var(--muted)] leading-relaxed">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function YearAccordion({ year, entries, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);

  const timelineContent = (
    <div className="space-y-4">
      {entries.map((entry) => (
        <TimelineCard key={entry.title} {...entry} />
      ))}
    </div>
  );

  const content = (
    <>{timelineContent}</>
  );

  return (
    <div className="border-b border-[var(--line)] last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <h3 className="text-2xl font-bold tracking-tight text-[var(--text)]">
          {year}
        </h3>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChevronDown className="h-5 w-5 text-[var(--muted)]" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function About() {
  return (
    <main className="relative overflow-hidden bg-[linear-gradient(180deg,var(--bg)_0%,var(--surface-soft)_46%,var(--bg)_100%)] pt-24 pb-16 lg:pt-28 lg:pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[8%] h-64 w-64 rounded-full bg-[var(--primary)]/20 blur-3xl" />
        <div className="absolute top-[28%] right-[2%] h-64 w-64 rounded-full bg-[var(--primary)]/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--text)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-[var(--text)]">
            {aboutProfile.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[var(--muted)] leading-relaxed">
            {aboutProfile.intro}
          </p>
          <p className="mt-3 max-w-2xl text-[var(--muted-strong)] font-medium leading-relaxed">
            {aboutProfile.focus}
          </p>
        </div>

        <div className="mb-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aboutProfile.facts.map((fact) => (
            <div key={fact.label} className="rounded-xl border border-[var(--line)] bg-[var(--surface)]/90 p-4 [box-shadow:0_0_0_1px_var(--ring)]">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)] mb-1.5">{fact.label}</p>
              <p className="font-semibold text-[var(--text)]">{fact.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]">
            Education & Experience Timeline
          </h2>
          <p className="mt-2 text-[var(--muted)]">
            A detailed timeline of education, internships, full-time work, and key projects.
          </p>
        </div>

        <div className="mt-8 max-w-4xl">
          {timelineData.map((year, index) => (
            <YearAccordion
              key={year.title}
              year={year.title}
              entries={year.entries}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
