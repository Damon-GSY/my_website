import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects } from '@/data/projects';

const selectedProjectIds = [
  'supply-chain-agent-system',
  'dynamic-tool-resolution-agents',
  'multi-turn-agent-evaluation',
];

const selectedProjects = selectedProjectIds.map((id) => {
  const project = projects.find((item) => item.id === id);

  if (!project) {
    throw new Error(`Selected project not found: ${id}`);
  }

  return project;
});

export default function Work() {
  const [activeProject, setActiveProject] = useState(selectedProjectIds[0]);
  const projectRefs = useRef([]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 64rem)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!desktop.matches || reducedMotion.matches) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.dataset.projectId) {
          setActiveProject(visibleEntry.target.dataset.projectId);
        }
      },
      {
        rootMargin: '-28% 0px -48% 0px',
        threshold: [0, 0.2, 0.5, 0.8],
      },
    );

    projectRefs.current.forEach((project) => {
      if (project) observer.observe(project);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="work"
      className="selected-work"
      aria-labelledby="selected-work-title"
      data-hide-launcher
      data-hide-mobile-launcher
    >
      <div className="selected-work__frame">
        <header className="selected-work__header">
          <div className="selected-work__index" aria-hidden="true">
            <span>01</span>
            <span>Selected work</span>
          </div>

          <div className="selected-work__heading">
            <p className="selected-work__eyebrow">Systems in practice</p>
            <h2 id="selected-work-title">From research question to working system.</h2>
          </div>

          <div className="selected-work__introduction">
            <p>
              Three cases across production agents, agentic reinforcement
              learning, and evaluation research. Each starts with a concrete
              failure mode and ends with evidence.
            </p>
            <Link className="selected-work__all-link" to="/projects">
              <span>View all projects</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </header>

        <ol className="selected-work__list" aria-label="Selected project case studies">
          {selectedProjects.map((project, index) => {
            const isActive = activeProject === project.id;

            return (
              <li
                key={project.id}
                ref={(node) => {
                  projectRefs.current[index] = node;
                }}
                className="selected-work__item"
                data-project-id={project.id}
                data-active={isActive ? 'true' : 'false'}
              >
                <span className="selected-work__marker" aria-hidden="true" />

                <article className="selected-work__case">
                  <div className="selected-work__number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="selected-work__identity">
                    <p className="selected-work__meta">
                      <span>{project.kicker}</span>
                      <span>{project.category}</span>
                    </p>
                    <h3>{project.title}</h3>
                    <p className="selected-work__provenance">
                      <time dateTime={project.year}>{project.year}</time>
                      <span>{project.stage}</span>
                    </p>
                  </div>

                  <div className="selected-work__narrative">
                    <div>
                      <p className="selected-work__label">Context / problem</p>
                      <p className="selected-work__description">{project.description}</p>
                    </div>

                    <div className="selected-work__evidence">
                      <div>
                        <p className="selected-work__label">My contribution</p>
                        <p>{project.details[0]}</p>
                      </div>
                      <div>
                        <p className="selected-work__label">Outcome</p>
                        <p>{project.outcome}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
