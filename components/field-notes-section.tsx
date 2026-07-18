import Link from 'next/link'
import { notes } from '@/lib/content'
import styles from './field-notes-section.module.css'

export default function FieldNotesSection() {
  const [featured, ...latest] = notes.slice(0, 4)

  return (
    <section className={styles.section} id="notes" aria-labelledby="notes-heading">
      <div className="section-shell">
        <header className={styles.header}>
          <p className="section-eyebrow">Field notes</p>
          <h2 id="notes-heading">Working theories, written down.</h2>
          <p>
            Short essays on agent evaluation, production constraints, tool interfaces, memory, and
            post-training—written from the systems I build.
          </p>
        </header>

        <div className={styles.layout}>
          <Link className={styles.featured} href={`/notes/${featured.slug}`}>
            <div className={styles.featuredMeta}>
              <span>Latest note</span>
              <time dateTime={featured.date}>{featured.date}</time>
            </div>
            <h3>{featured.title}</h3>
            <p>{featured.excerpt}</p>
            <div className={styles.featuredFoot}>
              <span>{featured.category} · {featured.readingTime}</span>
              <i aria-hidden="true">↗</i>
            </div>
          </Link>

          <div className={styles.list}>
            {latest.map((note, index) => (
              <article key={note.slug}>
                <Link href={`/notes/${note.slug}`}>
                  <span>0{index + 2}</span>
                  <div>
                    <p>{note.category} · {note.readingTime}</p>
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
