'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { notes, research, work } from '@/lib/content'

const images = [
  '/assets/optimization-core-midjourney.webp',
  '/assets/optimization-world-v2-1920.webp',
  '/assets/optimization-world-v2-1280.webp',
  '/assets/optimization-core-mobile-720.webp',
] as const

const firstRow = [...work, ...research].map((entry, index) => ({
  image: images[index % images.length],
  label: entry.title,
}))

const secondRow = notes.map((entry, index) => ({
  image: images[(index + 2) % images.length],
  label: entry.title,
}))

function MarqueeRow({ items }: { items: { image: string; label: string }[] }) {
  return (
    <div className="prompt-marquee__rail">
      {[...items, ...items, ...items].map((item, index) => (
        <figure aria-hidden={index >= items.length} key={`${item.label}-${index}`}>
          <Image alt="" fill loading="lazy" sizes="420px" src={item.image} />
          <figcaption>{item.label}</figcaption>
        </figure>
      ))}
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
