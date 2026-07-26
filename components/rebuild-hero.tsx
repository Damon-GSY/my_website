'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { heroChapters, profile } from '@/lib/content'

const OptimizationLandscapeScene = dynamic(
  () => import('@/components/optimization-landscape-scene'),
  { ssr: false },
)

export default function RebuildHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const preferredReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const reducedMotion = mounted && Boolean(preferredReducedMotion)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const progress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 30,
    mass: 0.35,
    restDelta: 0.0005,
  })
  const firstNameX = useTransform(progress, [0, 0.82], ['0vw', '-17vw'])
  const lastNameX = useTransform(progress, [0, 0.82], ['0vw', '17vw'])
  const lensScale = useTransform(progress, [0, 0.72, 1], [1, 2.15, 3.35])
  const lensRadius = useTransform(progress, [0, 0.62, 1], ['48%', '18%', '0%'])
  const paperOpacity = useTransform(progress, [0.45, 0.92], [1, 0])
  const thesisOpacity = useTransform(progress, [0.64, 0.84, 1], [0, 1, 1])
  const thesisY = useTransform(progress, [0.62, 0.9], [32, 0])
  const sceneOpacity = useTransform(progress, [0, 0.32, 1], [0.72, 1, 1])

  useEffect(() => setMounted(true), [])

  return (
    <section className="rebuild-hero" id="top" ref={sectionRef}>
      <div className="rebuild-hero__viewport">
        <motion.div className="rebuild-hero__paper" style={{ opacity: paperOpacity }} />

        <motion.div
          aria-hidden="true"
          className="rebuild-hero__lens"
          style={{
            borderRadius: reducedMotion ? '18%' : lensRadius,
            scale: reducedMotion ? 1 : lensScale,
          }}
        >
          <motion.div className="rebuild-hero__scene" style={{ opacity: sceneOpacity }}>
            {mounted && !reducedMotion ? (
              <OptimizationLandscapeScene
                active
                reducedMotion={false}
                scrollProgress={progress}
              />
            ) : (
              <Image
                alt="Terracotta optimization landscape"
                fill
                priority
                sizes="(max-width: 720px) 78vw, 36vw"
                src="/assets/optimization-core-midjourney.webp"
              />
            )}
          </motion.div>
          <div className="rebuild-hero__lens-shade" />
        </motion.div>

        <div className="rebuild-shell rebuild-hero__frame">
          <motion.div className="rebuild-hero__topline" style={{ opacity: paperOpacity }}>
            <span>Portfolio / 2026</span>
            <span>{profile.role} · {profile.company}</span>
            <span>{profile.location}</span>
          </motion.div>

          <h1 aria-label={`${profile.name}. Agent systems, research, and field notes.`}>
            <motion.span style={{ x: reducedMotion ? 0 : firstNameX }}>Damon</motion.span>
            <motion.span style={{ x: reducedMotion ? 0 : lastNameX }}>Guan</motion.span>
          </h1>

          <motion.div className="rebuild-hero__margin-note" style={{ opacity: paperOpacity }}>
            <span>Current inquiry</span>
            <p>How much authority should an intelligent system be allowed to hold?</p>
          </motion.div>

          <motion.div
            className="rebuild-hero__thesis"
            style={{ opacity: reducedMotion ? 1 : thesisOpacity, y: reducedMotion ? 0 : thesisY }}
          >
            <small>Damon Guan / Point of view</small>
            <p>{profile.thesis}</p>
            <a href="#work">Enter selected systems <span aria-hidden="true">↓</span></a>
          </motion.div>

          <motion.div className="rebuild-hero__folio" style={{ opacity: paperOpacity }}>
            <span>DG</span>
            <i />
            <span>01</span>
          </motion.div>
        </div>
      </div>

      <div className="rebuild-identity" aria-label="Damon Guan's practice">
        <div className="rebuild-shell rebuild-identity__grid">
          <p>One practice, three operating modes.</p>
          {heroChapters.map((chapter) => (
            <article key={chapter.index}>
              <small>{chapter.index}</small>
              <h2>{chapter.title}</h2>
              <p>{chapter.evidence}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
