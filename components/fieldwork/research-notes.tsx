import Link from 'next/link'
import { education, experience, getReadingTime, notes, profile, research, socials } from '@/lib/content'
import styles from './research-notes.module.css'

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
      {diagonal ? (
        <path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.5" />
      ) : (
        <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
      )}
    </svg>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

export function ResearchNotes() {
  const recentNotes = [...notes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  return (
    <>
      <section id="research" className={styles.research} aria-labelledby="research-heading">
        <div className={styles.container}>
          <div className={styles.sectionLabel}><span>02 / Research</span><span>Published &amp; in progress</span></div>
          <div className={styles.researchIntro}>
            <h2 id="research-heading">Questions worth<br /><em>staying with.</em></h2>
            <p>How do we know an agent is doing the right thing? My research connects evaluation, real-world decisions, and the signals models learn from.</p>
          </div>
          <div className={styles.paperList}>
            {research.map((paper, index) => (
              <a className={styles.paper} href={paper.href} target="_blank" rel="noreferrer" key={paper.index}>
                <span className={styles.paperIndex}>0{index + 1}</span>
                <div className={styles.paperBody}>
                  <div className={styles.paperMeta}><span>{paper.venue}</span><span>{paper.authorship}</span></div>
                  <h3>{paper.title}</h3>
                  <p>{paper.description}</p>
                </div>
                <span className={styles.paperArrow}><Arrow diagonal /><span className={styles.srOnly}>Open paper in a new tab</span></span>
              </a>
            ))}
          </div>
          <div className={styles.researchFootnote}><span>From the research desk</span><span>Agent evaluation · Domain intelligence · Preference learning</span></div>
        </div>
      </section>

      <section id="notes" className={styles.notes} aria-labelledby="notes-heading">
        <div className={styles.container}>
          <div className={styles.sectionLabel}><span>03 / Field notes</span><span>Ideas from the work</span></div>
          <div className={styles.notesIntro}>
            <h2 id="notes-heading">Thinking in public.</h2>
            <Link className={styles.textLink} href="/notes">All {notes.length} notes <Arrow /></Link>
          </div>
          <div className={styles.noteGrid}>
            {recentNotes.map((note, index) => (
              <Link className={styles.note} href={`/notes/${note.slug}`} key={note.slug}>
                <div className={styles.noteTop}><span>{note.category}</span><span>0{index + 1}</span></div>
                <h3>{note.title}</h3>
                <p>{note.excerpt}</p>
                <div className={styles.noteBottom}>
                  <span><time dateTime={note.date}>{formatDate(note.date)}</time><span className={styles.readingTime}>{getReadingTime(note)}</span></span>
                  <Arrow />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function AboutPractice() {
  const educationNames = new Set(education.map((entry) => entry.place))
  const selectedExperience = experience.filter((entry) => !educationNames.has(entry.place)).slice(0, 4)

  return (
    <section id="about" className={styles.about} aria-labelledby="about-heading">
      <div className={styles.container}>
        <div className={styles.sectionLabel}><span>04 / A little context</span><span>{profile.location}</span></div>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutCopy}>
            <span className={styles.nameLabel}>Hi, I’m {profile.name}.</span>
            <h2 id="about-heading">A researcher’s curiosity.<br /><em>An engineer’s instinct.</em></h2>
            <p>{profile.bio}</p>
            <p>{profile.creatorLine}</p>
            <div className={styles.socials} aria-label="Social profiles">
              {socials.map(([label, href]) => (
                <a href={href} key={label} target="_blank" rel="noreferrer">{label}<Arrow diagonal /><span className={styles.srOnly}> (opens in a new tab)</span></a>
              ))}
            </div>
          </div>
          <div className={styles.trajectory}>
            <h3 className={styles.columnLabel}>Along the way</h3>
            <ol className={styles.experienceList}>
              {selectedExperience.map((entry, index) => (
                <li key={entry.place}>
                  <span className={`${styles.timelineDot} ${index === 0 ? styles.currentDot : ''}`} aria-hidden="true" />
                  <div className={styles.experienceTop}><h4>{entry.place}</h4><span>{entry.time}</span></div>
                  <p>{entry.role}</p>
                </li>
              ))}
            </ol>
            <div className={styles.education}>
              <h3 className={styles.columnLabel}>Foundations</h3>
              {education.map((entry) => (
                <div className={styles.educationEntry} key={entry.place}>
                  <h4>{entry.place}</h4>
                  <p>{entry.role}</p>
                  <span>{entry.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
