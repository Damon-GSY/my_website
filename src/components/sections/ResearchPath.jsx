import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aboutProfile, timelineData } from '@/data/about';
import { projects } from '@/data/projects';

const timelineEntries = (Array.isArray(timelineData) ? timelineData : []).flatMap(
  (yearGroup) =>
    (Array.isArray(yearGroup?.entries) ? yearGroup.entries : []).map((entry) => ({
      ...entry,
      year: yearGroup?.title,
    })),
);

const findTimelineEntry = (titleFragment) =>
  timelineEntries.find((entry) => entry?.title?.includes(titleFragment));

const chronology = [
  {
    entry: findTimelineEntry('LLM Algorithm Engineer @ Alibaba'),
    pointIndexes: [0, 2],
    annotation: 'Current / production',
  },
  {
    entry: findTimelineEntry('Microsoft Research Asia'),
    pointIndexes: [0, 1],
    annotation: 'Industry research',
  },
  {
    entry: findTimelineEntry('National University of Singapore'),
    pointIndexes: [0, 1, 2],
    annotation: 'Graduate study',
  },
  {
    entry: findTimelineEntry('University of New South Wales'),
    pointIndexes: [0, 1, 2, 3],
    annotation: 'Foundation',
  },
].filter(({ entry }) => Boolean(entry));

const researchWorks = (Array.isArray(projects) ? projects : [])
  .filter((project) => project?.category === 'research')
  .slice(0, 4);

const firstEntryContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.03 },
  },
};

const firstEntryChild = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
  },
};

function EntryColumn({ animate, className, children }) {
  if (animate) {
    return (
      <motion.div className={className} variants={firstEntryChild}>
        {children}
      </motion.div>
    );
  }

  return <div className={className}>{children}</div>;
}

export default function ResearchPath() {
  const reducedMotion = useReducedMotion();
  const startYear = chronology[0]?.entry?.year;
  const endYear = chronology.at(-1)?.entry?.year;

  return (
    <section
      id="research-path"
      className="research-path"
      aria-labelledby="research-path-title"
      data-hide-launcher
      data-hide-mobile-launcher
    >
      <div className="research-path__frame">
        <header className="research-path__header">
          <div className="research-path__index" aria-hidden="true">
            <span>02</span>
            <span>Research &amp; experience</span>
          </div>

          <div className="research-path__heading">
            <p className="research-path__eyebrow">A practice shaped in the field</p>
            <h2 id="research-path-title">Research, carried into production.</h2>
          </div>

          <div className="research-path__introduction">
            {aboutProfile?.intro ? <p>{aboutProfile.intro}</p> : null}
            {aboutProfile?.focus ? <p>{aboutProfile.focus}</p> : null}
          </div>
        </header>

        {chronology.length > 0 ? (
          <div className="research-path__chronology">
            <div className="research-path__axis" aria-hidden="true">
              <span>Career / study path</span>
              <span className="research-path__axis-range">
                {startYear && endYear ? `${startYear} — ${endYear}` : 'Chronology'}
              </span>
              <span className="research-path__axis-rule" />
            </div>

            <ol className="research-path__list" aria-label="Research and experience chronology">
              {chronology.map(({ entry, pointIndexes, annotation }, index) => {
                const points = pointIndexes
                  .map((pointIndex) => entry.points?.[pointIndex])
                  .filter(Boolean);
                const isCurrent = index === 0;
                const articleContent = (
                  <>
                    <EntryColumn animate={isCurrent} className="research-path__year">
                      <time dateTime={entry.year}>{entry.year}</time>
                      <span>{annotation}</span>
                    </EntryColumn>

                    <EntryColumn animate={isCurrent} className="research-path__identity">
                      <p>{entry.track}</p>
                      <h3>{entry.title}</h3>
                      {entry.location ? <p>{entry.location}</p> : null}
                    </EntryColumn>

                    <EntryColumn animate={isCurrent} className="research-path__evidence">
                      {points.length > 0 ? (
                        <ul>
                          {points.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="research-path__unavailable">Details available on the full profile.</p>
                      )}
                    </EntryColumn>
                  </>
                );

                return (
                  <li
                    className="research-path__item"
                    data-depth={index}
                    key={`${entry.year}-${entry.title}`}
                  >
                    {isCurrent ? (
                      <motion.article
                        variants={firstEntryContainer}
                        initial={reducedMotion ? false : 'hidden'}
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.35 }}
                      >
                        {articleContent}
                      </motion.article>
                    ) : (
                      <article>{articleContent}</article>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <p className="research-path__empty">The detailed chronology is available on the full profile.</p>
        )}

        <div className="research-path__research-index">
          <div className="research-path__research-copy">
            <p className="research-path__eyebrow">
              Research index / {String(researchWorks.length).padStart(2, '0')}
            </p>
            <h3>{researchWorks.length} research works, one applied through-line.</h3>
            <p>
              Agent evaluation, supply-chain benchmarks, visual preference learning,
              and memory systems—different settings, the same concern for evidence.
            </p>
            <Link className="research-path__about-link" to="/about">
              <span>Full background</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>

          {researchWorks.length > 0 ? (
            <ol className="research-path__works" aria-label="Research work index">
              {researchWorks.map((work, index) => (
                <li key={work.id ?? `${work.title}-${index}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{work.title}</strong>
                  <span>
                    <time dateTime={work.year}>{work.year}</time>
                    {work.stage ? ` / ${work.stage}` : ''}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="research-path__empty">Research notes are being indexed.</p>
          )}
        </div>
      </div>
    </section>
  );
}
