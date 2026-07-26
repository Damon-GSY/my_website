'use client'

import Image from 'next/image'
import { motion, type MotionValue, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ContactButton, FadeIn } from '@/components/rebuild-hero'
import { profile } from '@/lib/content'
import { PORTFOLIO_VISUALS } from '@/lib/optimization-assets'

function Character({ character, index, progress, total }: {
  character: string
  index: number
  progress: MotionValue<number>
  total: number
}) {
  const opacity = useTransform(progress, [index / total * 0.72, index / total * 0.72 + 0.16], [0.2, 1])
  return <motion.span style={{ opacity }}>{character}</motion.span>
}

const ornaments = [
  { className: 'is-top-left', image: PORTFOLIO_VISUALS[0], x: -80 },
  { className: 'is-bottom-left', image: PORTFOLIO_VISUALS[2], x: -80 },
  { className: 'is-top-right', image: PORTFOLIO_VISUALS[3], x: 80 },
  { className: 'is-bottom-right', image: PORTFOLIO_VISUALS[4], x: 80 },
] as const

export default function RebuildAbout() {
  const textRef = useRef<HTMLParagraphElement>(null)
  const copy = `${profile.bio} ${profile.creatorLine}`
  const { scrollYProgress } = useScroll({ target: textRef, offset: ['start 0.8', 'end 0.2'] })

  return (
    <section className="prompt-about" id="about">
      {ornaments.map((ornament, index) => (
        <FadeIn className={`prompt-about__ornament ${ornament.className}`} delay={0.1 + index * 0.08} duration={0.9} key={ornament.className} x={ornament.x} y={0}>
          <Image alt="" fill sizes="220px" src={ornament.image} />
        </FadeIn>
      ))}
      <div className="prompt-about__content">
        <FadeIn><h2>About me</h2></FadeIn>
        <p aria-label={copy} ref={textRef}>
          {Array.from(copy).map((character, index) => (
            <Character character={character} index={index} key={`${character}-${index}`} progress={scrollYProgress} total={copy.length} />
          ))}
        </p>
        <ContactButton />
      </div>
    </section>
  )
}
