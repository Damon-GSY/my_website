'use client'

import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import CaseSignal from '@/components/case-signal'
import { signals, work } from '@/lib/content'
import './work-section-layout.css'

type Project = (typeof work)[number]

export default function WorkSection() {
  const [signatureProject, ...projectIndex] = work

  return (
    <section className="work-section project-stack" id="work">
      <div className="creator-shell">
        <header className="project-stack__intro">
          <p className="creator-kicker">Selected work / 01—04</p>
          <h2>Systems, not demos.</h2>
          <p>
            Four production and post-training systems. Each card opens into its constraints,
            decisions, ownership, and evidence.
          </p>
        </header>

        <div className="project-stack__signals" aria-label="Selected production outcomes">
          {signals.map((signal) => (
            <div key={signal.label}>
              <strong>{signal.value}</strong>
              <span>{signal.label}</span>
            </div>
          ))}
        </div>

        <div className="project-stack__cards">
          <ProjectCard project={signatureProject} index={0} total={work.length} />
          {projectIndex.map((project, index) => (
            <ProjectCard
              project={project}
              index={index + 1}
              key={project.id}
              total={work.length}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({
  project,
  index,
  total,
}: {
  project: Project
  index: number
  total: number
}) {
  const cardRef = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  })
  const scale = useTransform(
    scrollYProgress,
    [0.08, 0.45, 0.9],
    [0.965, 1, 1 - (total - index - 1) * 0.018],
  )
  const opacity = useTransform(scrollYProgress, [0, 0.16, 0.95], [0.42, 1, 0.78])

  return (
    <motion.article
      ref={cardRef}
      className={`project-stack__card ${
        index === 0
          ? 'project-stack__card--signature case-study--signature'
          : 'project-stack__card--index case-index__item'
      }`}
      style={{
        opacity: reduceMotion ? 1 : opacity,
        scale: reduceMotion ? 1 : scale,
        top: `calc(5.8rem + ${index * 0.75}rem)`,
      }}
      id={project.id}
    >
      <header className="project-stack__card-head">
        <strong>{project.index}</strong>
        <span>{project.kicker}</span>
        <div>
          <small>{project.stage} · {project.year}</small>
          <Link href={`/work/${project.id}`}>Full case ↗</Link>
        </div>
      </header>

      <div className="project-stack__title">
        <h3><Link href={`/work/${project.id}`}>{project.title}</Link></h3>
        <p>{project.statement}</p>
      </div>

      <div className="project-stack__body">
        <div className="project-stack__visual">
          <CaseSignal type={project.visual} />
        </div>
        <aside className="project-stack__evidence">
          <span>Key decision</span>
          <p>{project.details[0]}</p>
          <span>Observed outcome</span>
          <strong className={project.outcome.value.length > 4 ? 'is-word' : undefined}>
            {project.outcome.value}
          </strong>
          <h4>{project.outcome.label}</h4>
          <p>{project.outcome.evidence}</p>
          <dl>
            <div><dt>Role</dt><dd>{project.role}</dd></div>
            <div><dt>Evidence</dt><dd>{project.proof.evidenceType}</dd></div>
          </dl>
        </aside>
      </div>
    </motion.article>
  )
}
