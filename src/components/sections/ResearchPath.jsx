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

const chronologyConfig = [
  {
    id: 'alibaba-llm-engineer',
    year: '2025',
    track: 'Full-time',
    title: 'LLM Algorithm Engineer @ Alibaba',
    evidenceKeywords: ['supply-chain domain LLM', 'dynamic tool registration'],
    annotation: 'Current / production',
  },
  {
    id: 'msra-llm-intern',
    year: '2024',
    track: 'Internship',
    title: 'LLM Intern @ Microsoft Research Asia (MSRA)',
    evidenceKeywords: ['GPT-4o', 'memory architecture'],
    annotation: 'Industry research',
  },
  {
    id: 'nus-graduate-study',
    year: '2023',
    track: 'Education',
    title: 'National University of Singapore (NUS)',
    evidenceKeywords: ['Statistics', 'QS Global Rank #8', 'Top 5%'],
    annotation: 'Graduate study',
  },
  {
    id: 'unsw-undergraduate-study',
    year: '2019',
    track: 'Education',
    title: 'University of New South Wales (UNSW)',
    evidenceKeywords: ['Computer Science', 'QS Global Rank #19', 'Top 3%'],
    annotation: 'Foundation',
  },
];

const describeTimelineNode = ({ id, year, track, title }) =>
  `"${id}" (year "${year}", track "${track}", title "${title}")`;

const chronology = chronologyConfig.flatMap((config) => {
  const matches = timelineEntries.filter(
    (entry) =>
      entry?.year === config.year &&
      entry?.track === config.track &&
      entry?.title === config.title,
  );

  if (import.meta.env.DEV && matches.length === 0) {
    console.warn(`[ResearchPath] Missing configured timeline node ${describeTimelineNode(config)}.`);
  }

  if (import.meta.env.DEV && matches.length > 1) {
    console.warn(
      `[ResearchPath] Duplicate configured timeline node ${describeTimelineNode(config)}: found ${matches.length} exact matches; the node was omitted.`,
    );
  }

  if (matches.length !== 1) {
    return [];
  }

  const entry = matches[0];
  const points = Array.isArray(entry?.points) ? entry.points.filter(Boolean) : [];
  const evidence = points.filter((point) =>
    config.evidenceKeywords.some((keyword) => point.toLowerCase().includes(keyword.toLowerCase())),
  );

  return [{ ...config, entry, evidence }];
});

const researchWorks = (Array.isArray(projects) ? projects : [])
  .filter((project) => project?.category === 'research');

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
              {chronology.map(({ id, entry, evidence, annotation }, index) => {
                const fallbackEvidence = entry.location || aboutProfile?.focus || aboutProfile?.intro;
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
                      {evidence.length > 0 ? (
                        <ul>
                          {evidence.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      ) : fallbackEvidence ? (
                        <p className="research-path__unavailable">{fallbackEvidence}</p>
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
                    key={id}
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
            <h3>
              {researchWorks.length} current research {researchWorks.length === 1 ? 'work' : 'works'},
              indexed from the portfolio.
            </h3>
            <p>
              Each entry retains its source category, year, and stage so papers and applied
              research remain distinct.
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
                  <div className="research-path__work-identity">
                    {work.kicker ? <span>{work.kicker}</span> : null}
                    <strong>{work.title}</strong>
                  </div>
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
