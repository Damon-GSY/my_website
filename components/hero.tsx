'use client'

import dynamic from 'next/dynamic'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { profile } from '@/lib/content'

const OptimizationLandscapeScene = dynamic(() => import('@/components/optimization-landscape-scene'), {
  ssr: false,
  loading: () => <div className="hero__scene-fallback" aria-hidden="true" />,
})

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const sceneActive = useInView(sectionRef, { margin: '15% 0px' })
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const copyY = useTransform(scrollYProgress, [0, 0.36], [0, -72])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.18, 0.36], [1, 1, 0])
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.92, 1], [1, 1, 0.08])
  const journeyOpacity = useTransform(scrollYProgress, [0.2, 0.32, 0.61, 0.7], [0, 1, 1, 0])
  const coreOpacity = useTransform(scrollYProgress, [0.59, 0.72, 0.93, 1], [0, 1, 1, 0])
  const journeyY = useTransform(scrollYProgress, [0.22, 0.7], [28, -12])
  const coreY = useTransform(scrollYProgress, [0.62, 1], [26, -10])
  const railScale = useTransform(scrollYProgress, [0.16, 0.94], [0, 1])

  return (
    <section ref={sectionRef} className="hero" id="top">
      <div className="hero__viewport">
        <motion.div className="hero__scene" style={{ opacity: sceneOpacity }} aria-hidden="true">
          <OptimizationLandscapeScene
            active={sceneActive}
            reducedMotion={Boolean(reduceMotion)}
            scrollProgress={scrollYProgress}
          />
        </motion.div>
        <div className="hero__grid" aria-hidden="true" />
        <div className="hero__wash" aria-hidden="true" />

        <motion.div
          className="section-shell hero__content"
          style={{
            y: reduceMotion ? 0 : copyY,
            opacity: reduceMotion ? 1 : copyOpacity,
          }}
        >
          <p className="hero__eyebrow">
            <strong>{profile.name}</strong>
            <span>{profile.role}</span>
          </p>

          <h1 aria-label={`${profile.shortName}. Agent systems, under control.`}>
            <span className="hero__name">{profile.shortName}.</span>
            <span className="hero__claim">Agent systems,<br />under control.</span>
          </h1>

          <div className="hero__lower">
            <p>{profile.thesis}</p>
            <div className="hero__actions">
              <a className="primary-link" href="#work">
                View selected work <i aria-hidden="true">↓</i>
              </a>
              <a className="text-link" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </div>
          </div>

          <div className="hero__foot">
            <span>{profile.company} · {profile.location}</span>
            <span>Research · Post-training · Agentic RL</span>
          </div>
        </motion.div>

        {!reduceMotion && (
          <>
            <motion.aside aria-hidden="true" className="hero__journey" style={{ opacity: journeyOpacity, y: journeyY }}>
              <span>01 / Gradient field</span>
              <strong>Follow the optimization path.</strong>
              <div className="hero__journey-rail" aria-hidden="true">
                <motion.i style={{ scaleX: railScale }} />
              </div>
              <small>Camera passage · Z 8.8 → −3.45</small>
            </motion.aside>
            <motion.aside aria-hidden="true" className="hero__journey hero__journey--core" style={{ opacity: coreOpacity, y: coreY }}>
              <span>02 / Loss minimum</span>
              <strong>Complex systems become legible.</strong>
              <div className="hero__journey-rail" aria-hidden="true">
                <motion.i style={{ scaleX: railScale }} />
              </div>
              <small>Evaluation · reward · control</small>
            </motion.aside>
          </>
        )}
      </div>
    </section>
  )
}
