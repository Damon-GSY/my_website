import { education, profile, socials } from '@/lib/content'
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
