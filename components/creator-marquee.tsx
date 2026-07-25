'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { notes, research, work } from '@/lib/content'

const workRail = work.map((project) => ({
  index: project.index,
  label: project.title,
  detail: project.outcome.value,
}))

const thinkingRail = [
  ...research.map((paper) => ({
    index: paper.index,
    label: paper.title,
    detail: paper.metric,
  })),
  ...notes.slice(0, 4).map((note, index) => ({
    index: `N/0${index + 1}`,
    label: note.title,
    detail: note.category,
  })),
]

function Rail({
  items,
  direction,
}: {
  items: readonly { index: string; label: string; detail: string }[]
  direction: 1 | -1
}) {
  return (
    <div className="creator-marquee__mask">
      <div className="creator-marquee__rail">
        {[...items, ...items, ...items].map((item, index) => (
          <article key={`${item.index}-${index}`}>
            <span>{item.index}</span>
            <strong>{item.label}</strong>
            <small>{item.detail}</small>
            <i aria-hidden="true" data-direction={direction} />
          </article>
        ))}
      </div>
    </div>
  )
}

export default function CreatorMarquee() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const rowOneX = useTransform(scrollYProgress, [0, 1], ['-22%', '-4%'])
  const rowTwoX = useTransform(scrollYProgress, [0, 1], ['-3%', '-24%'])

  return (
    <section ref={sectionRef} className="creator-marquee" aria-label="Selected systems and writing">
      <motion.div style={{ x: reduceMotion ? '-12%' : rowOneX }}>
        <Rail items={workRail} direction={1} />
      </motion.div>
      <motion.div style={{ x: reduceMotion ? '-12%' : rowTwoX }}>
        <Rail items={thinkingRail} direction={-1} />
      </motion.div>
    </section>
  )
}
