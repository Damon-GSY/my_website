import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/fieldwork/site-footer'
import { SiteHeader } from '@/components/fieldwork/site-header'
import { getReadingTime, notes, profile } from '@/lib/content'
import { socialImage } from '@/lib/metadata'
import styles from '../notes.module.css'

type NotePageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return notes.map((note) => ({ slug: note.slug }))
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params
  const note = notes.find((entry) => entry.slug === slug)
  if (!note) return {}

  return {
    title: `${note.title} — ${profile.name}`,
    description: note.excerpt,
    alternates: { canonical: `/notes/${note.slug}` },
    openGraph: {
      title: `${note.title} — ${profile.name}`,
      description: note.excerpt,
      type: 'article',
      publishedTime: note.date,
      url: `/notes/${note.slug}`,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${note.title} — ${profile.name}`,
      description: note.excerpt,
      images: [socialImage],
    },
  }
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params
  const noteIndex = notes.findIndex((entry) => entry.slug === slug)
  if (noteIndex === -1) notFound()

  const note = notes[noteIndex]
  const nextNote = notes[(noteIndex + 1) % notes.length]
  const formattedDate = new Intl.DateTimeFormat('en', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${note.date}T00:00:00Z`))
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${profile.siteUrl}/notes/${note.slug}#article`,
    headline: note.title,
    description: note.excerpt,
    datePublished: note.date,
    dateModified: note.date,
    mainEntityOfPage: `${profile.siteUrl}/notes/${note.slug}`,
    author: { '@id': `${profile.siteUrl}/#person` },
    keywords: note.tags.join(', '),
  }

  return (
    <>
      <SiteHeader />
      <main className={styles.articlePage} id="main-content">
        <header className={styles.articleHero}>
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href="/notes">Field notes</Link><span aria-hidden="true">/</span>
              <span aria-current="page">Note {String(noteIndex + 1).padStart(2, '0')}</span>
            </nav>
            <div className={styles.articleTitleBlock}>
              <div className={styles.articleMeta}>
                <span>{note.category}</span>
                <time dateTime={note.date}>{formattedDate}</time>
                <span>{getReadingTime(note)}</span>
              </div>
              <h1>{note.title}</h1>
              <p>{note.excerpt}</p>
            </div>
          </div>
        </header>

        <article className={`${styles.shell} ${styles.articleGrid}`}>
          <aside className={styles.articleSidebar} aria-label="About this note">
            <div className={styles.author}>
              <span className={styles.authorMark} aria-hidden="true">dg.</span>
              <p><strong>{profile.name}</strong><span>{profile.role}</span></p>
            </div>
            <nav className={styles.contents} aria-label="Article sections">
              <p className={styles.eyebrow}>In this note</p>
              {note.sections.map((section, index) => (
                <a key={section.title} href={`#section-${index + 1}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>{section.title}
                </a>
              ))}
            </nav>
            <div className={styles.related}>
              <p className={styles.eyebrow}>Related evidence</p>
              {note.related.map((reference) => {
                const external = reference.href.startsWith('http')
                return external ? (
                  <a key={reference.href} href={reference.href} target="_blank" rel="noopener noreferrer">
                    {reference.label}
                    <span aria-hidden="true">↗</span>
                    <span className={styles.srOnly}> (opens in a new tab)</span>
                  </a>
                ) : (
                  <Link key={reference.href} href={reference.href}>
                    {reference.label}<span aria-hidden="true">→</span>
                  </Link>
                )
              })}
            </div>
          </aside>

          <div className={styles.prose}>
            <p className={styles.intro}>{note.intro}</p>
            {note.sections.map((section, index) => (
              <section key={section.title} id={`section-${index + 1}`} aria-labelledby={`heading-${index + 1}`}>
                <p className={styles.sectionNumber}>0{index + 1}</p>
                <h2 id={`heading-${index + 1}`}>{section.title}</h2>
                <p>{section.body}</p>
              </section>
            ))}
            <div className={styles.articleEnd}>
              <span className={styles.endMark} aria-hidden="true">✳</span>
              <ul aria-label="Article topics">{note.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              <Link href="/notes">← All field notes</Link>
            </div>
          </div>
        </article>

        <nav className={styles.nextNote} aria-label="Next field note">
          <div className={styles.shell}>
            <p className={styles.eyebrow}>Keep reading</p>
            <Link href={`/notes/${nextNote.slug}`}>
              <span>{nextNote.title}</span><span aria-hidden="true">↗</span>
            </Link>
            <p className={styles.nextMeta}>{nextNote.category} · {getReadingTime(nextNote)}</p>
          </div>
        </nav>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}
      />
      <SiteFooter />
    </>
  )
}
