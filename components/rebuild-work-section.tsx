'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import CaseSignal from '@/components/case-signal'
import { work } from '@/lib/content'
import { PROJECT_VISUALS } from '@/lib/optimization-assets'

function ProjectCard({ index, project, total }: {
  index: number
  project: (typeof work)[number]
  total: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const targetScale = 1 - (total - 1 - index) * 0.03
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [0.97, 1, targetScale])

  return (
    <div className="prompt-project__slot" ref={ref}>
      <motion.article
        className="prompt-project__card"
        style={{
          height: `calc(100svh - 7rem - ${index * 1.75}rem)`,
          scale,
          top: `calc(6rem + ${index * 1.75}rem)`,
        }}
      >
        <header>
          <strong>{project.index}</strong>
          <span>{project.kicker}</span>
          <h3>{project.title}</h3>
          <Link href={`/work/${project.id}`}>Full case</Link>
        </header>
        <div className="prompt-project__media">
          <div className="prompt-project__left">
            <div className="prompt-project__signal"><CaseSignal type={project.visual} /></div>
            <div className="prompt-project__summary">
              <p>{project.statement}</p>
              <strong>{project.outcome.value}</strong>
              <span>{project.outcome.label}</span>
            </div>
          </div>
          <div className="prompt-project__image">
            <Image
              alt={`${project.title} — ${project.visualCaption}`}
              fill
              sizes="(max-width: 720px) calc(100vw - 3rem), (max-width: 1600px) 60vw, 960px"
              src={PROJECT_VISUALS[project.visual]}
            />
            <p>{project.role}</p>
          </div>
        </div>
      </motion.article>
    </div>
  )
}

export default function RebuildWorkSection() {
  return (
    <section className="prompt-projects" id="work">
      <h2>Projects</h2>
      <div className="prompt-projects__stack">
        {work.map((project, index) => <ProjectCard index={index} key={project.id} project={project} total={work.length} />)}
      </div>
    </section>
  )
}
