import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CaseSignal from '@/components/case-signal'
import SiteFooter from '@/components/site-footer'
import SiteHeader from '@/components/site-header'
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
    title: `${project.title} — ${profile.shortName}`,
    description: project.statement,
    alternates: { canonical: `/work/${project.id}` },
    openGraph: {
      title: `${project.title} — ${profile.shortName}`,
      description: project.statement,
      url: `/work/${project.id}`,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} — ${profile.shortName}`,
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
    { index: '01', label: 'Baseline', value: project.proof.baseline },
    { index: '02', label: 'Intervention', value: project.proof.intervention },
    { index: '03', label: 'Result', value: project.proof.result },
    { index: '04', label: 'Scope', value: project.proof.scope },
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
      <a className="skip-link" href="#case-main">Skip to case study</a>
      <SiteHeader />
      <main className={styles.page} id="case-main">
        <header className={styles.hero}>
          <div className={`section-shell ${styles.heroShell}`}>
            <Link className={styles.back} href="/#work">← Selected work</Link>

            <div className={styles.meta}>
              <span>{project.index} / 04</span>
              <span>{project.kicker}</span>
              <span>{project.stage} · {project.year}</span>
            </div>

            <h1>{project.title}</h1>

            <div className={styles.heroLower}>
              <p>{project.statement}</p>
              <dl>
                <div>
                  <dt>Role</dt>
                  <dd>{project.role}</dd>
                </div>
                <div>
                  <dt>Outcome</dt>
                  <dd>{project.outcome.value} {project.outcome.label}</dd>
                </div>
                <div>
                  <dt>Scope</dt>
                  <dd>{project.tags.join(' · ')}</dd>
                </div>
              </dl>
            </div>
          </div>
        </header>

        <section className={styles.visualSection} aria-label={`${project.title} system visualization`}>
          <div className={`section-shell ${styles.visualShell}`}>
            <CaseSignal type={project.visual} />
            <p>
              A reduced system trace. The visual describes the operating logic, while the case study
              records the decisions that made it reliable.
            </p>
          </div>
        </section>

        <section className={styles.chapter}>
          <div className={`section-shell ${styles.chapterGrid}`}>
            <div className={styles.chapterIndex}>
              <span>01</span>
              <small>Operating context</small>
            </div>
            <div className={styles.chapterContent}>
              <p className={styles.eyebrow}>The constraint</p>
              <h2>Capability was only half of the system.</h2>
              <p className={styles.prose}>{project.context}</p>
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.chapterDark}`}>
          <div className={`section-shell ${styles.chapterGrid}`}>
            <div className={styles.chapterIndex}>
              <span>02</span>
              <small>System design</small>
            </div>
            <div className={styles.chapterContent}>
              <p className={styles.eyebrow}>Design principle</p>
              <h2>{project.principle}</h2>
              <ol className={styles.decisions}>
                {project.details.map((detail, index) => (
                  <li key={detail}>
                    <span>0{index + 1}</span>
                    <p>{detail}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className={styles.chapter}>
          <div className={`section-shell ${styles.chapterGrid}`}>
            <div className={styles.chapterIndex}>
              <span>03</span>
              <small>Personal ownership</small>
            </div>
            <div className={styles.chapterContent}>
              <p className={styles.eyebrow}>What Damon designed</p>
              <h2>{project.ownershipTitle}</h2>
              <p className={styles.prose}>{project.ownership}</p>
              <div className={styles.trace} aria-label="System trace">
                {project.flow.map((step, index) => (
                  <div key={step}>
                    <span>0{index + 1}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.evidence}>
          <div className="section-shell">
            <header className={styles.evidenceHeader}>
              <p className={styles.eyebrow}>04 / Observed evidence</p>
              <h2>What changed,<br />and where it was measured.</h2>
            </header>

            <div className={styles.evidenceGrid}>
              <div className={styles.evidenceOutcome} aria-hidden="true">
                <small className={styles.evidenceType}>{project.proof.evidenceType}</small>
                <strong className={project.outcome.value.length > 4 ? styles.outcomeWord : undefined}>
                  {project.outcome.value}
                </strong>
                <span>{project.outcome.label}</span>
                <small>{project.outcome.evidence}</small>
              </div>

              <ol className={styles.evidenceProtocol} aria-label="Evidence protocol">
                {proofSteps.map((step) => (
                  <li key={step.label}>
                    <span>{step.index}</span>
                    <small>{step.label}</small>
                    <p>{step.value}</p>
                  </li>
                ))}
              </ol>
            </div>

            <p className={styles.disclosure}>
              <span>Disclosure</span>
              {project.proof.disclosure}
            </p>
          </div>
        </section>

        <nav className={styles.next} aria-label="Next case study">
          <div className="section-shell">
            <span>Next case / {nextProject.index}</span>
            <Link href={`/work/${nextProject.id}`}>
              {nextProject.title}<i aria-hidden="true">↗</i>
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
