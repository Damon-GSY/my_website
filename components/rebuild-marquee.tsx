'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { notes, research, work } from '@/lib/content'
import { PORTFOLIO_VISUALS } from '@/lib/optimization-assets'

const firstRow = [
  ...work.map((entry) => ({ label: entry.title, href: `/work/${entry.id}` })),
  ...research.map((entry) => ({ label: entry.title, href: entry.href })),
].map((entry, index) => ({
  ...entry,
  image: PORTFOLIO_VISUALS[index % PORTFOLIO_VISUALS.length],
}))

const secondRow = notes.map((entry, index) => ({
  image: PORTFOLIO_VISUALS[(index + 2) % PORTFOLIO_VISUALS.length],
  label: entry.title,
  href: `/notes/${entry.slug}`,
}))

function MarqueeRow({ items }: { items: { image: string; label: string; href: string }[] }) {
  return (
    <div className="prompt-marquee__rail">
      {[...items, ...items, ...items].map((item, index) => {
        const duplicate = index >= items.length
        const external = item.href.startsWith('http')
        return <figure aria-hidden={duplicate} key={`${item.label}-${index}`}>
          <a aria-label={item.label} href={item.href} rel={external ? 'noreferrer' : undefined} tabIndex={duplicate ? -1 : undefined} target={external ? '_blank' : undefined}>
            <Image alt="" fill loading="lazy" sizes="420px" src={item.image} />
            <figcaption>{item.label}</figcaption>
          </a>
        </figure>
      })}
    </div>
  )
}

export default function RebuildMarquee() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rowOne = useTransform(scrollYProgress, [0, 1], ['-22%', '-3%'])
  const rowTwo = useTransform(scrollYProgress, [0, 1], ['-2%', '-24%'])

  return (
    <section aria-label="Selected systems, research, and field notes" className="prompt-marquee" ref={ref}>
      <motion.div style={{ x: rowOne }}><MarqueeRow items={firstRow} /></motion.div>
      <motion.div style={{ x: rowTwo }}><MarqueeRow items={secondRow} /></motion.div>
    </section>
  )
}
