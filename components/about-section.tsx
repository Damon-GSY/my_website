import { education, profile, socials, trajectory } from '@/lib/content'
import BlurText from '@/components/ui/blur-text'
import styles from './about-section.module.css'

export default function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="section-shell">
        <header className={styles.intro}>
          <p className="section-eyebrow">About / the person behind the systems</p>
          <h2>
            <BlurText text={profile.name} animateBy="words" delay={100} direction="bottom" rootMargin="-10% 0px" />
          </h2>
          <div className={styles.copy}>
            <p>{profile.bio}</p>
            <p>{profile.creatorLine}</p>
            <nav className={styles.channels} aria-label={`${profile.name} around the web`}>
              {socials.map(([label, url]) => (
                <a key={label} href={url} target="_blank" rel="noreferrer">
                  {label}<i aria-hidden="true">↗</i>
                </a>
              ))}
            </nav>
          </div>
        </header>

        <div className={styles.principles} aria-label="Working principles">
          {profile.principles.map((principle) => (
            <article key={principle.index}>
              <span>{principle.index}</span>
              <h3>{principle.title}</h3>
              <p>{principle.description}</p>
            </article>
          ))}
        </div>

        <section className={styles.trajectory} aria-labelledby="trajectory-heading">
          <header className={styles.trajectoryHead}>
            <span>Trajectory / four operating contexts</span>
            <h3 id="trajectory-heading">The work moved east. The questions moved closer to consequence.</h3>
            <p>From statistical foundations to production agents, each city added a different constraint to how I build.</p>
          </header>

          <div className={styles.route}>
            <svg viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden="true">
              <path className={styles.routeBase} d="M64 338C198 338 264 94 382 94S616 224 754 206S962 72 1136 72" />
              <path className={styles.routeProgress} pathLength="1" d="M64 338C198 338 264 94 382 94S616 224 754 206S962 72 1136 72" />
              <circle cx="64" cy="338" r="5" />
              <circle cx="382" cy="94" r="5" />
              <circle cx="754" cy="206" r="5" />
              <circle cx="1136" cy="72" r="5" />
            </svg>

            <div className={styles.routeNodes}>
              {trajectory.map((stop) => (
                <article key={stop.index}>
                  <span>{stop.index} / {stop.period}</span>
                  <h4>{stop.city}</h4>
                  <p>{stop.title}</p>
                  <small>{stop.evidence}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="about-layout">
          <aside className="profile-note">
            <span>Current position</span>
            <strong>{profile.role}</strong>
            <small>{profile.company} · {profile.location}</small>
            <dl className="profile-facts">
              {profile.facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <blockquote>
              “Research depth.<br />Production pressure.”
            </blockquote>
          </aside>

          <div className="experience-list" aria-labelledby="education-heading">
            <header className={styles.educationHead}>
              <span>Education / foundation</span>
              <h3 id="education-heading">Statistical thinking, built across two disciplines.</h3>
              <small>Singapore → Sydney</small>
            </header>
            {education.map((entry) => (
              <article key={`${entry.time}-${entry.place}`}>
                <time>{entry.time}</time>
                <div>
                  <h3>{entry.place}</h3>
                  <p>{entry.role}</p>
                  <ul aria-label={`${entry.place} highlights`}>
                    {entry.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                  </ul>
                </div>
                <span>{entry.location}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
