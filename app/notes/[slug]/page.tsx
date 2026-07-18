import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteFooter from '@/components/site-footer'
import SiteHeader from '@/components/site-header'
import { notes, profile } from '@/lib/content'
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
    title: `${note.title} — ${profile.shortName}`,
    description: note.excerpt,
    alternates: { canonical: `/notes/${note.slug}` },
    openGraph: {
      title: `${note.title} — ${profile.shortName}`,
      description: note.excerpt,
      type: 'article',
      publishedTime: note.date,
      url: `/notes/${note.slug}`,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${note.title} — ${profile.shortName}`,
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
      <a className="skip-link" href="#note-main">Skip to article</a>
      <SiteHeader />
      <main className={styles.articlePage} id="note-main">
        <header className={styles.articleHero}>
          <div className={`section-shell ${styles.articleHeroGrid}`}>
            <Link className={styles.back} href="/#notes">← Field notes</Link>
            <div className={styles.articleMeta}>
              <span>{note.category}</span>
              <time dateTime={note.date}>{note.date}</time>
              <span>{note.readingTime}</span>
            </div>
            <h1>{note.title}</h1>
            <p>{note.excerpt}</p>
          </div>
        </header>

        <article className={styles.articleBody}>
          <div className={`section-shell ${styles.articleGrid}`}>
            <aside>
              <span>Filed under</span>
              <div>{note.tags.map((tag) => <small key={tag}>{tag}</small>)}</div>
              <p>{profile.name}<br />{profile.role}</p>
              <div className={styles.related}>
                <span>Related evidence</span>
                {note.related.map((reference) => {
                  const external = reference.href.startsWith('http')
                  return (
                    <a
                      key={reference.href}
                      href={reference.href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noreferrer' : undefined}
                    >
                      {reference.label}<i aria-hidden="true">{external ? '↗' : '→'}</i>
                    </a>
                  )
                })}
              </div>
            </aside>

            <div className={styles.prose}>
              <p className={styles.intro}>{note.intro}</p>
              {note.sections.map((section, index) => (
                <section key={section.title}>
                  <span>0{index + 1}</span>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </section>
              ))}
            </div>
          </div>
        </article>

        <nav className={styles.nextNote} aria-label="Next field note">
          <div className="section-shell">
            <span>Continue reading</span>
            <Link href={`/notes/${nextNote.slug}`}>
              {nextNote.title}<i aria-hidden="true">↗</i>
            </Link>
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
