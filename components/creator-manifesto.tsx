'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { profile } from '@/lib/content'

function ManifestoCharacter({
  character,
  index,
  total,
  progress,
}: {
  character: string
  index: number
  total: number
  progress: ReturnType<typeof useScroll>['scrollYProgress']
}) {
  const start = index / total
  const opacity = useTransform(progress, [start * 0.68, start * 0.68 + 0.16], [0.14, 1])
  return <motion.span style={{ opacity }}>{character}</motion.span>
}

export default function CreatorManifesto() {
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const manifesto = `${profile.bio} ${profile.creatorLine}`
  const { scrollYProgress } = useScroll({
    target: paragraphRef,
    offset: ['start 0.82', 'end 0.28'],
  })

  return (
    <section className="creator-manifesto" aria-labelledby="creator-manifesto-title">
      <div className="creator-manifesto__object creator-manifesto__object--one" aria-hidden="true" />
      <div className="creator-manifesto__object creator-manifesto__object--two" aria-hidden="true" />
      <div className="creator-manifesto__object creator-manifesto__object--three" aria-hidden="true" />
      <div className="creator-shell creator-manifesto__inner">
        <p className="creator-kicker">About the practice / 2026</p>
        <h2 id="creator-manifesto-title">About Damon</h2>
        <p ref={paragraphRef} className="creator-manifesto__copy" aria-label={manifesto}>
          {reduceMotion
            ? manifesto
            : Array.from(manifesto).map((character, index) => (
                <ManifestoCharacter
                  character={character}
                  index={index}
                  key={`${character}-${index}`}
                  total={manifesto.length}
                  progress={scrollYProgress}
                />
              ))}
        </p>
        <a className="creator-contact" href={`mailto:${profile.email}`}>
          Start a conversation <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  )
}
