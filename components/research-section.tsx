import { profile, research } from '@/lib/content'
import styles from './research-section.module.css'

export default function ResearchSection() {
  return (
    <section className="research-section" id="research">
      <div className="section-shell research-layout">
        <header className="research-intro">
          <p className="section-eyebrow">Research</p>
          <h2>Make capability observable.</h2>
          <p>
            Benchmarks and taxonomies are the interface between a model claim and a production
            decision.
          </p>
          <p className={styles.identity}>
            Published as <strong>{profile.legalName}</strong> · first and contributing author
          </p>
          <blockquote>
            The final answer is a lossy compression of the system that produced it.
          </blockquote>
        </header>

        <div className={`research-list ${styles.list}`}>
          {research.map((paper) => (
            <article key={paper.index}>
              <a className={styles.link} href={paper.href} target="_blank" rel="noreferrer" aria-label={`${paper.title}, open paper`}>
                <div className="research-list__meta">
                  <span>{paper.index}</span>
                  <span>{paper.type}</span>
                </div>
                <p className={styles.authorship}>{paper.authorship}</p>
                <h3>{paper.title}</h3>
                <p className={styles.description}>{paper.description}</p>
                <div className="research-list__topics">
                  {paper.topics.map((topic) => <span key={topic}>{topic}</span>)}
                </div>
                <footer className={styles.citation}>
                  <strong>{paper.metric}</strong>
                  <span>{paper.venue} · {paper.year}</span>
                  <i aria-hidden="true">↗</i>
                </footer>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
