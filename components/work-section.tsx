import Link from 'next/link'
import { signals, work } from '@/lib/content'
import CaseSignal from '@/components/case-signal'
import BlurText from '@/components/ui/blur-text'
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

            <div className="signature-story">
              <aside className="signature-story__anchor">
                <span className="signature-story__eyebrow">Signature case / production system</span>
                <h3><Link href={`/work/${signatureProject.id}`}>{signatureProject.title}</Link></h3>
                <div className="case-study__tags">
                  {signatureProject.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <p className="signature-story__lead">{signatureProject.statement}</p>
                <Link className="case-study__open" href={`/work/${signatureProject.id}`}>
                  Read the complete case <i aria-hidden="true">↗</i>
                </Link>

                <ol className="signature-story__progress" aria-label="Case narrative">
                  <li><b>01</b><span>The risk</span></li>
                  <li><b>02</b><span>The control layer</span></li>
                  <li><b>03</b><span>The evidence</span></li>
                </ol>
              </aside>

              <div className="signature-story__stack">
                <section className="signature-story__panel signature-story__panel--problem">
                  <div className="signature-story__panel-head">
                    <span>01 / The risk</span>
                    <span>Why this system exists</span>
                  </div>
                  <div className="signature-story__problem-copy">
                    <h4>
                      <BlurText
                        text={signatureProject.constraintTitle}
                        animateBy="words"
                        delay={55}
                        direction="bottom"
                        rootMargin="-12% 0px"
                      />
                    </h4>
                    <p>{signatureProject.context}</p>
                  </div>
                  <dl className="signature-story__facts">
                    <div><dt>Scope</dt><dd>12 production scenarios</dd></div>
                    <div><dt>Failure cost</dt><dd>Not uniformly reversible</dd></div>
                    <div><dt>Design principle</dt><dd>Route authority before execution</dd></div>
                  </dl>
                </section>

                <section className="signature-story__panel signature-story__panel--route">
                  <div className="signature-story__panel-head">
                    <span>02 / The control layer</span>
                    <p>{signatureProject.visualCaption}</p>
                  </div>
                  <div className="case-study__visual">
                    <CaseSignal type={signatureProject.visual} />
                  </div>
                </section>

                <section className="signature-story__panel signature-story__panel--evidence">
                  <div className="signature-story__panel-head">
                    <span>03 / The evidence</span>
                    <span>{signatureProject.proof.evidenceType}</span>
                  </div>
                  <div className="signature-story__outcome">
                    <span>Observed outcome</span>
                    <strong className={signatureProject.outcome.value.length > 4 ? 'is-word' : undefined}>
                      {signatureProject.outcome.value}
                    </strong>
                    <h4>{signatureProject.outcome.label}</h4>
                    <p>{signatureProject.outcome.evidence}</p>
                  </div>
                  <div className="signature-story__decisions">
                    <span>What I changed</span>
                    <ol>
                      {signatureProject.details.map((detail, index) => (
                        <li key={detail}><b>0{index + 1}</b><span>{detail}</span></li>
                      ))}
                    </ol>
                  </div>
                  <p className="signature-story__disclosure">{signatureProject.proof.disclosure}</p>
                </section>
              </div>
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
