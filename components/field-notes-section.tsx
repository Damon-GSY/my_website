import Link from 'next/link'
import { getReadingTime, notes, socials } from '@/lib/content'
import styles from './field-notes-section.module.css'

export default function FieldNotesSection() {
  const [featured, ...latest] = notes.slice(0, 4)
  const creatorChannels = socials.filter(([label]) => label === 'YouTube' || label === 'Bilibili')

  return (
    <section className={styles.section} id="notes" aria-labelledby="notes-heading">
      <div className="section-shell">
        <header className={styles.header}>
          <p className="section-eyebrow">Writing &amp; teaching</p>
          <h2 id="notes-heading">Working theories, made public.</h2>
          <p>
            Short essays on agent evaluation, production constraints, tool interfaces, memory, and
            post-training—written from the systems I build.
          </p>
        </header>

        <aside className={styles.publicPractice} aria-label="Public channels">
          <p>
            <span>Public practice</span>
            <strong>I publish the operating lessons behind the systems I build.</strong>
          </p>
          <nav aria-label="Public channels">
            {creatorChannels.map(([label, url], index) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${label} public channel (opens in a new tab)`}
              >
                <span>C/0{index + 1}</span>
                <strong>{label}</strong>
                <small>Public channel</small>
                <i aria-hidden="true">↗</i>
              </a>
            ))}
          </nav>
        </aside>

        <div className={styles.layout}>
          <Link className={styles.featured} href={`/notes/${featured.slug}`}>
            <div className={styles.featuredMeta}>
              <span>Latest note</span>
              <time dateTime={featured.date}>{featured.date}</time>
            </div>
            <h3>{featured.title}</h3>
            <p>{featured.excerpt}</p>
            <div className={styles.featuredFoot}>
              <span>{featured.category} · {getReadingTime(featured)}</span>
              <i aria-hidden="true">↗</i>
            </div>
          </Link>

          <div className={styles.list}>
            {latest.map((note, index) => (
              <article key={note.slug}>
                <Link href={`/notes/${note.slug}`}>
                  <span>0{index + 2}</span>
                  <div>
                    <p>{note.category} · {getReadingTime(note)}</p>
                    <h3>{note.title}</h3>
                    <small>{note.excerpt}</small>
                  </div>
                  <i aria-hidden="true">↗</i>
                </Link>
              </article>
            ))}

            <Link className={styles.allNotes} href="/notes">
              Browse all {notes.length} notes <i aria-hidden="true">→</i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
