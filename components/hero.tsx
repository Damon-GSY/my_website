'use client'

import dynamic from 'next/dynamic'
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { heroChapters, profile } from '@/lib/content'

const OptimizationLandscapeScene = dynamic(() => import('@/components/optimization-landscape-scene'), {
  ssr: false,
  loading: () => <div className="hero__scene-fallback" aria-hidden="true" />,
})

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const [introInteractive, setIntroInteractive] = useState(true)
  const introInteractiveRef = useRef(true)
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
  const journeyRailScale = useTransform(scrollYProgress, [0.2, 0.61], [0, 1])
  const coreRailScale = useTransform(scrollYProgress, [0.62, 0.94], [0, 1])
  const contentInteractive = Boolean(reduceMotion) || introInteractive

  useEffect(() => {
    const nextInteractive = Boolean(reduceMotion) || scrollYProgress.get() < 0.38
    if (introInteractiveRef.current === nextInteractive) return
    introInteractiveRef.current = nextInteractive
    setIntroInteractive(nextInteractive)
  }, [reduceMotion, scrollYProgress])

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const nextInteractive = Boolean(reduceMotion) || progress < 0.38
    if (introInteractiveRef.current === nextInteractive) return
    introInteractiveRef.current = nextInteractive
    setIntroInteractive(nextInteractive)
  })

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
          className={`section-shell hero__content${contentInteractive ? '' : ' is-inactive'}`}
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
              <a className="primary-link" href="#work" tabIndex={contentInteractive ? 0 : -1}>
                View selected work <i aria-hidden="true">↓</i>
              </a>
              <a className="text-link" href={`mailto:${profile.email}`} tabIndex={contentInteractive ? 0 : -1}>
                {profile.email}
              </a>
            </div>
          </div>

          <div className="hero__foot" aria-label="Profile at a glance">
            {profile.heroProofs.map(([label, value]) => (
              <span key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
              </span>
            ))}
          </div>
        </motion.div>

        {!reduceMotion && (
          <>
            <motion.aside aria-hidden="true" className="hero__journey" style={{ opacity: journeyOpacity, y: journeyY }}>
              <span>{heroChapters[0].index}</span>
              <strong>{heroChapters[0].title}</strong>
              <p>{heroChapters[0].description}</p>
              <div className="hero__journey-rail" aria-hidden="true">
                <motion.i style={{ scaleX: journeyRailScale }} />
              </div>
              <small>{heroChapters[0].evidence}</small>
            </motion.aside>
            <motion.aside aria-hidden="true" className="hero__journey hero__journey--core" style={{ opacity: coreOpacity, y: coreY }}>
              <span>{heroChapters[1].index}</span>
              <strong>{heroChapters[1].title}</strong>
              <p>{heroChapters[1].description}</p>
              <div className="hero__journey-rail" aria-hidden="true">
                <motion.i style={{ scaleX: coreRailScale }} />
              </div>
              <small>{heroChapters[1].evidence}</small>
            </motion.aside>
          </>
        )}
      </div>
    </section>
  )
}
