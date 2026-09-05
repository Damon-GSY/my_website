import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/fieldwork/site-footer'
import { SiteHeader } from '@/components/fieldwork/site-header'
import { getReadingTime, notes, profile } from '@/lib/content'
import { socialImage } from '@/lib/metadata'
import styles from './notes.module.css'

export const metadata: Metadata = {
  title: `Field Notes — ${profile.name}`,
  description: 'Notes on agent systems, post-training, tool use, memory, and evaluation.',
  alternates: { canonical: '/notes' },
  openGraph: {
    title: `Field Notes — ${profile.name}`,
    description: 'Notes on agent systems, post-training, tool use, memory, and evaluation.',
    url: '/notes',
    images: [socialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Field Notes — ${profile.name}`,
    description: 'Notes on agent systems, post-training, tool use, memory, and evaluation.',
    images: [socialImage],
  },
}

const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
})

export default function NotesIndexPage() {
  const categories = [...new Set(notes.map((note) => note.category))]

  return (
    <>
      <SiteHeader />
      <main className={styles.indexPage} id="main-content">
        <header className={styles.indexHero}>
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <span aria-current="page">Field notes</span>
            </nav>
            <div className={styles.indexHeroGrid}>
              <div>
                <p className={styles.eyebrow}>The notebook / {String(notes.length).padStart(2, '0')} entries</p>
                <h1>Field notes.<br /><em>Close to the work.</em></h1>
              </div>
              <div className={styles.indexIntroduction}>
                <p>Working notes on production agents, evaluation, memory, tool interfaces, and the post-training loops behind reliable behavior.</p>
                <span>Written by {profile.name}</span>
              </div>
            </div>
          </div>
        </header>

        <section className={`${styles.shell} ${styles.noteIndex}`} aria-labelledby="all-notes-heading">
          <div className={styles.indexBar}>
            <h2 id="all-notes-heading">All notes <span>({notes.length})</span></h2>
            <p>{categories.join(' / ')}</p>
          </div>
          {notes.map((note, index) => (
            <article key={note.slug}>
              <Link className={styles.noteLink} href={`/notes/${note.slug}`}>
                <div className={styles.entryMeta}>
                  <span className={styles.entryNumber}>N / {String(index + 1).padStart(2, '0')}</span>
                  <time dateTime={note.date}>{dateFormatter.format(new Date(`${note.date}T00:00:00Z`))}</time>
                </div>
                <div className={styles.entryContent}>
                  <span className={styles.category}>{note.category}</span>
                  <h3>{note.title}</h3>
                  <p>{note.excerpt}</p>
                </div>
                <div className={styles.entryEnd}>
                  <span>{getReadingTime(note)}</span>
                  <span className={styles.arrow} aria-hidden="true">↗</span>
                </div>
              </Link>
            </article>
          ))}
          <p className={styles.indexColophon}>Thinking in public, one field note at a time.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
