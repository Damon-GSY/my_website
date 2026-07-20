import { earlierSystems } from '@/lib/content'
import styles from './earlier-systems-section.module.css'

export default function EarlierSystemsSection() {
  return (
    <section className={styles.section} aria-labelledby="earlier-systems-title">
      <div className="section-shell">
        <header className={styles.intro}>
          <p className="section-eyebrow">Earlier systems / selected archive</p>
          <h2 id="earlier-systems-title">The constraints changed. The habit did not.</h2>
          <p>
            Before production LLM agents, I worked on memory, forecasting, edge inference, and weak
            supervision. Different models; the same insistence on measurable behavior.
          </p>
        </header>

        <div className={styles.archive}>
          {earlierSystems.map((entry, index) => (
            <article key={`${entry.time}-${entry.place}`}>
              <div className={styles.meta}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <time>{entry.time}</time>
                <small>{entry.location}</small>
              </div>

              <div className={styles.identity}>
                <h3>{entry.place}</h3>
                <p>{entry.role}</p>
              </div>

              <ul aria-label={`${entry.place} evidence`}>
                {entry.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
