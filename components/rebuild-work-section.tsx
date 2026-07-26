import Link from 'next/link'
import CaseSignal from '@/components/case-signal'
import { signals, work } from '@/lib/content'

export default function RebuildWorkSection() {
  return (
    <section className="rebuild-work" id="work">
      <div className="rebuild-shell">
        <header className="rebuild-work__header">
          <p>Selected systems / 01—04</p>
          <h2>Work with consequences.</h2>
          <div>
            <span>Production agents</span>
            <span>Post-training</span>
            <span>Evaluation</span>
          </div>
        </header>

        <div className="rebuild-work__signals" aria-label="Selected production outcomes">
          {signals.map((signal) => (
            <p key={signal.label}>
              <strong>{signal.value}</strong>
              <span>{signal.label}</span>
            </p>
          ))}
        </div>

        <div className="rebuild-work__list">
          {work.map((project, index) => (
            <article className="rebuild-case" key={project.id}>
              <div className="rebuild-case__index">
                <span>{project.index}</span>
                <small>{project.stage} / {project.year}</small>
              </div>

              <div className="rebuild-case__copy">
                <p>{project.kicker}</p>
                <h3><Link href={`/work/${project.id}`}>{project.title}</Link></h3>
                <blockquote>{project.statement}</blockquote>
                <ul>
                  {project.details.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
                <Link className="rebuild-case__link" href={`/work/${project.id}`}>
                  Read full case <span aria-hidden="true">↗</span>
                </Link>
              </div>

              <div className="rebuild-case__visual">
                <CaseSignal type={project.visual} />
                <div className="rebuild-case__outcome">
                  <small>Observed outcome</small>
                  <strong>{project.outcome.value}</strong>
                  <span>{project.outcome.label}</span>
                </div>
              </div>

              <p className="rebuild-case__role">{project.role}</p>
              <span className="rebuild-case__count">0{index + 1} / 04</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
