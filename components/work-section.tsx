import Link from 'next/link'
import { signals, work } from '@/lib/content'
import CaseSignal from '@/components/case-signal'

export default function WorkSection() {
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
          {work.map((project) => (
            <article className="case-study" id={project.id} key={project.id}>
              <header className="case-study__header">
                <span>{project.index}</span>
                <span>{project.kicker}</span>
                <span>{project.role}</span>
                <span>{project.stage} · {project.year}</span>
              </header>

              <div className="case-study__body">
                <div className="case-study__title">
                  <h3><Link href={`/work/${project.id}`}>{project.title}</Link></h3>
                  <div className="case-study__tags">
                    {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <Link className="case-study__open" href={`/work/${project.id}`}>
                    Open case study <i aria-hidden="true">↗</i>
                  </Link>
                </div>

                <div className="case-study__visual">
                  <CaseSignal type={project.visual} />
                </div>

                <div className="case-study__description">
                  <span>System brief</span>
                  <p>{project.statement}</p>
                </div>

                <div className="case-study__details">
                  <span>System decisions</span>
                  <ol>
                    {project.details.map((detail) => <li key={detail}>{detail}</li>)}
                  </ol>
                </div>

                <aside className="case-study__result">
                  <span>Observed outcome</span>
                  <strong>{project.result}</strong>
                  <p>{project.resultLabel}</p>
                  <small>{project.secondary}</small>
                </aside>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
