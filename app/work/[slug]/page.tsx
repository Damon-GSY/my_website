import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/fieldwork/site-footer'
import { SiteHeader } from '@/components/fieldwork/site-header'
import { profile, work } from '@/lib/content'
import { socialImage } from '@/lib/metadata'
import styles from './case-study.module.css'

type CaseStudyPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return work.map((project) => ({ slug: project.id }))
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = work.find((entry) => entry.id === slug)
  if (!project) return {}

  return {
    title: `${project.title} — ${profile.name}`,
    description: project.statement,
    alternates: { canonical: `/work/${project.id}` },
    openGraph: {
      title: `${project.title} — ${profile.name}`,
      description: project.statement,
      url: `/work/${project.id}`,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} — ${profile.name}`,
      description: project.statement,
      images: [socialImage],
    },
  }
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params
  const projectIndex = work.findIndex((entry) => entry.id === slug)
  if (projectIndex === -1) notFound()

  const project = work[projectIndex]
  const nextProject = work[(projectIndex + 1) % work.length]
  const proofSteps = [
    { label: 'Baseline', value: project.proof.baseline },
    { label: 'Intervention', value: project.proof.intervention },
    { label: 'Result', value: project.proof.result },
    { label: 'Scope', value: project.proof.scope },
  ]
  const caseStudySchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${profile.siteUrl}/work/${project.id}#case-study`,
    name: project.title,
    url: `${profile.siteUrl}/work/${project.id}`,
    description: project.statement,
    abstract: project.context,
    dateCreated: project.year,
    creator: { '@id': `${profile.siteUrl}/#person` },
    about: project.tags,
    keywords: project.tags.join(', '),
  }

  return (
    <>
      <SiteHeader />
      <main className={styles.page} id="main-content">
        <header className={styles.hero}>
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href="/#work">Selected work</Link><span aria-hidden="true">/</span>
              <span aria-current="page">Case {project.index}</span>
            </nav>
            <div className={styles.meta}>
              <span>Case study {project.index} / {String(work.length).padStart(2, '0')}</span>
              <span>{project.kicker}</span>
            </div>
            <h1>{project.title}</h1>
            <div className={styles.heroLower}>
              <p className={styles.summary}>{project.statement}</p>
              <dl>
                <div><dt>My role</dt><dd>{project.role}</dd></div>
                <div><dt>Where / when</dt><dd>{project.stage} · {project.year}</dd></div>
              </dl>
            </div>
            <ul className={styles.tags} aria-label="Project topics">
              {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </div>
        </header>

        <div className={`${styles.shell} ${styles.storyLayout}`}>
          <aside className={styles.sidebar}>
            <p className={styles.eyebrow}>Inside this case</p>
            <nav aria-label="Case study sections">
              <a href="#context"><span>01</span> The context</a>
              <a href="#approach"><span>02</span> The approach</a>
              <a href="#ownership"><span>03</span> My contribution</a>
              <a href="#evidence"><span>04</span> Outcomes & evidence</a>
            </nav>
            <p className={styles.sidebarNote}>A public account of internal work. Scope and disclosure are included with the results.</p>
          </aside>

          <div className={styles.story}>
            <section className={styles.chapter} id="context" aria-labelledby="context-heading">
              <p className={styles.eyebrow}>01 / The context</p>
              <h2 id="context-heading">{project.constraintTitle}</h2>
              <p className={styles.prose}>{project.context}</p>
            </section>

            <section className={styles.chapter} id="approach" aria-labelledby="approach-heading">
              <p className={styles.eyebrow}>02 / The approach</p>
              <h2 id="approach-heading">The principle behind the system.</h2>
              <blockquote className={styles.principle}>{project.principle}</blockquote>
              <ol className={styles.decisions}>
                {project.details.map((detail, index) => (
                  <li key={detail}>
                    <span aria-hidden="true">0{index + 1}</span><p>{detail}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className={styles.chapter} id="ownership" aria-labelledby="ownership-heading">
              <p className={styles.eyebrow}>03 / My contribution</p>
              <h2 id="ownership-heading">{project.ownershipTitle}</h2>
              <p className={styles.prose}>{project.ownership}</p>
              <figure className={styles.flowFigure}>
                <figcaption>System sequence <span>Conceptual overview</span></figcaption>
                <ol className={styles.trace}>
                  {project.flow.map((step, index) => (
                    <li key={step}>
                      <span aria-hidden="true">0{index + 1}</span><strong>{step}</strong>
                    </li>
                  ))}
                </ol>
              </figure>
            </section>

            <section className={styles.chapter} id="evidence" aria-labelledby="evidence-heading">
              <p className={styles.eyebrow}>04 / Outcomes & evidence</p>
              <h2 id="evidence-heading">{project.evidenceTitle}</h2>
              <div className={styles.evidenceOutcome}>
                <span className={styles.evidenceType}>{project.proof.evidenceType}</span>
                <strong className={project.outcome.value.length > 5 ? styles.outcomeWord : undefined}>
                  {project.outcome.value}
                </strong>
                <span>{project.outcome.label}</span>
                <p>{project.outcome.evidence}</p>
              </div>
              <dl className={styles.evidenceProtocol}>
                {proofSteps.map((step) => (
                  <div key={step.label}><dt>{step.label}</dt><dd>{step.value}</dd></div>
                ))}
              </dl>
              <p className={styles.disclosure}>
                <strong>Disclosure</strong>{project.proof.disclosure}
              </p>
            </section>

            <aside className={styles.notebook} aria-label="Related field note">
              <p className={styles.eyebrow}>From the notebook</p>
              <Link href={project.relatedNote.href}>
                <strong>{project.relatedNote.label}</strong><span aria-hidden="true">↗</span>
              </Link>
            </aside>
          </div>
        </div>

        <nav className={styles.next} aria-label="Next case study">
          <div className={styles.shell}>
            <p className={styles.eyebrow}>Next case / {nextProject.index}</p>
            <Link href={`/work/${nextProject.id}`}>
              {nextProject.title}<span aria-hidden="true">↗</span>
            </Link>
          </div>
        </nav>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudySchema).replace(/</g, '\\u003c') }}
      />
      <SiteFooter />
    </>
  )
}
