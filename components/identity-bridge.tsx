import { identityBrief } from '@/lib/content'
import styles from './identity-bridge.module.css'

export default function IdentityBridge() {
  return (
    <section className={styles.bridge} aria-labelledby="identity-bridge-title">
      <div className="section-shell">
        <header className={styles.lead}>
          <p className="section-eyebrow">Damon / in 20 seconds</p>
          <h2 id="identity-bridge-title">
            Production pressure.<br />Research depth.<br />Public practice.
          </h2>
          <p>
            I work across the full loop: define what an agent should be allowed to do, train the
            behavior, evaluate the trace, and publish what survives contact with reality.
          </p>
        </header>

        <div className={styles.evidence} aria-label="Profile evidence at a glance">
          {identityBrief.map((entry, index) => (
            <article key={entry.label}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <small>{entry.label}</small>
              <strong>{entry.value}</strong>
              <p>{entry.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
