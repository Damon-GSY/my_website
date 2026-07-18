import type { Metadata } from 'next'
import Link from 'next/link'
import SiteFooter from '@/components/site-footer'
import SiteHeader from '@/components/site-header'
import { notes, profile } from '@/lib/content'
import { socialImage } from '@/lib/metadata'
import styles from './notes.module.css'

export const metadata: Metadata = {
  title: `Field Notes — ${profile.shortName}`,
  description: 'Notes on agent systems, post-training, tool use, memory, and evaluation.',
  alternates: { canonical: '/notes' },
  openGraph: {
    title: `Field Notes — ${profile.shortName}`,
    description: 'Notes on agent systems, post-training, tool use, memory, and evaluation.',
    url: '/notes',
    images: [socialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Field Notes — ${profile.shortName}`,
    description: 'Notes on agent systems, post-training, tool use, memory, and evaluation.',
    images: [socialImage],
  },
}

export default function NotesIndexPage() {
  return (
    <>
      <a className="skip-link" href="#notes-main">Skip to field notes</a>
      <SiteHeader />
      <main className={styles.indexPage} id="notes-main">
        <header className={styles.indexHero}>
          <div className={`section-shell ${styles.indexHeroGrid}`}>
            <p>Field notes / {notes.length} entries</p>
            <h1>Thinking in public, close to the work.</h1>
            <p>
              Working notes on production agents, evaluation, memory, tool interfaces, and the
              post-training loops behind reliable behavior.
            </p>
          </div>
        </header>

        <section className={styles.noteIndex} aria-label="All field notes">
          <div className="section-shell">
            {notes.map((note, index) => (
              <article key={note.slug}>
                <Link href={`/notes/${note.slug}`}>
                  <span>0{index + 1}</span>
                  <time dateTime={note.date}>{note.date}</time>
                  <div>
                    <small>{note.category} · {note.readingTime}</small>
                    <h2>{note.title}</h2>
                    <p>{note.excerpt}</p>
                  </div>
                  <i aria-hidden="true">↗</i>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
