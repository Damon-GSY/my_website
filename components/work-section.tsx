import Link from 'next/link'
import { signals, work } from '@/lib/content'
import CaseSignal from '@/components/case-signal'
import './work-section-layout.css'

export default function WorkSection() {
  const [signatureProject, ...projectIndex] = work

  return (
    <section className="work-section" id="work">
      <div className="section-shell">
        <header className="section-intro section-intro--work">
          <p className="section-eyebrow">Selected work</p>
          <h2>Systems that survive contact with production.</h2>
          <p>
            Four projects across agent safety, tool resolution, domain post-training, and reward
            design. Each one turns model capability into an observable operating system.
          </p>
        </header>

        <div className="impact-strip" aria-label="Selected production outcomes">
          {signals.map((signal) => (
            <div key={signal.label}>
              <strong>{signal.value}</strong>
              <span>{signal.label}</span>
            </div>
          ))}
        </div>

        <div className="case-list">
          <article className="case-study case-study--signature" id={signatureProject.id}>
            <header className="case-study__header">
              <span>{signatureProject.index}</span>
              <span>{signatureProject.kicker}</span>
              <span>{signatureProject.role}</span>
              <span>{signatureProject.stage} · {signatureProject.year}</span>
            </header>

            <div className="case-study__body">
              <div className="case-study__title">
                <h3><Link href={`/work/${signatureProject.id}`}>{signatureProject.title}</Link></h3>
                <div className="case-study__tags">
                  {signatureProject.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <Link className="case-study__open" href={`/work/${signatureProject.id}`}>
                  Open signature case <i aria-hidden="true">↗</i>
                </Link>
              </div>

              <div className="case-study__visual">
                <CaseSignal type={signatureProject.visual} />
              </div>

              <div className="case-study__description">
                <span>System brief</span>
                <p>{signatureProject.statement}</p>
              </div>

              <div className="case-study__details">
                <span>System decisions</span>
                <ol>
                  {signatureProject.details.map((detail) => <li key={detail}>{detail}</li>)}
                </ol>
              </div>

              <aside className="case-study__result">
                <span>Observed outcome</span>
                <strong className={signatureProject.outcome.value.length > 4 ? 'is-word' : undefined}>
                  {signatureProject.outcome.value}
                </strong>
                <p>{signatureProject.outcome.label}</p>
                <small>{signatureProject.outcome.evidence}</small>
              </aside>
            </div>
          </article>

          <div className="case-index" aria-label="More selected systems">
            <header className="case-index__intro">
              <span>Further systems / 02—04</span>
              <p>Three adjacent problems, compressed here for orientation. Each opens into its full context, decisions, ownership, and evidence.</p>
            </header>

            {projectIndex.map((project) => (
              <article className="case-index__item" id={project.id} key={project.id}>
              <header className="case-study__header">
                <span>{project.index}</span>
                <span>{project.kicker}</span>
                <span>{project.role}</span>
                <span>{project.stage} · {project.year}</span>
              </header>

              <div className="case-index__body">
                <div className="case-index__identity">
                  <h3><Link href={`/work/${project.id}`}>{project.title}</Link></h3>
                  <p>{project.statement}</p>
                  <div className="case-study__tags">
                    {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                </div>

                <div className="case-index__decision">
                  <span>Key decision</span>
                  <p>{project.details[0]}</p>
                </div>

                <aside className="case-index__result">
                  <span>Outcome</span>
                  <strong className={project.outcome.value.length > 4 ? 'is-word' : undefined}>
                    {project.outcome.value}
                  </strong>
                  <p>{project.outcome.label}</p>
                  <small>{project.outcome.evidence}</small>
                  <Link className="case-study__open" href={`/work/${project.id}`}>
                    Full case <i aria-hidden="true">↗</i>
                  </Link>
                </aside>
              </div>
            </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
