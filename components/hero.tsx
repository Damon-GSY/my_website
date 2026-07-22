'use client'

import dynamic from 'next/dynamic'
import {
  motion,
  type MotionValue,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { heroChapters, profile } from '@/lib/content'

const OptimizationLandscapeScene = dynamic(() => import('@/components/optimization-landscape-scene'), {
  ssr: false,
  loading: () => <div className="hero__scene-fallback" aria-hidden="true" />,
})

type PerformanceProfile =
  | 'full'
  | 'static-server'
  | 'static-save-data'
  | 'static-slow-network'
  | 'static-low-memory'
  | 'static-low-cpu'
  | 'static-compact-coarse'

type NetworkHints = {
  effectiveType?: string
  saveData?: boolean
  addEventListener?: (type: 'change', listener: () => void) => void
  removeEventListener?: (type: 'change', listener: () => void) => void
}

const COARSE_SMALL_VIEWPORT_QUERY = '(pointer: coarse) and (max-width: 900px), (pointer: coarse) and (max-height: 600px)'
const SLOW_EFFECTIVE_TYPES = new Set(['slow-2g', '2g', '3g'])

const getNetworkHints = () => (navigator as Navigator & { connection?: NetworkHints }).connection

const subscribeToPerformanceProfile = (onStoreChange: () => void) => {
  const connection = getNetworkHints()
  const compactCoarseQuery = window.matchMedia(COARSE_SMALL_VIEWPORT_QUERY)
  connection?.addEventListener?.('change', onStoreChange)
  compactCoarseQuery.addEventListener('change', onStoreChange)

  return () => {
    connection?.removeEventListener?.('change', onStoreChange)
    compactCoarseQuery.removeEventListener('change', onStoreChange)
  }
}

const getPerformanceProfile = (): PerformanceProfile => {
  const hints = navigator as Navigator & {
    deviceMemory?: number
  }
  const connection = getNetworkHints()

  if (connection?.saveData) return 'static-save-data'
  if (connection?.effectiveType && SLOW_EFFECTIVE_TYPES.has(connection.effectiveType)) {
    return 'static-slow-network'
  }
  if (hints.deviceMemory !== undefined && hints.deviceMemory < 4) return 'static-low-memory'
  if (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4) {
    return 'static-low-cpu'
  }
  if (window.matchMedia(COARSE_SMALL_VIEWPORT_QUERY).matches) return 'static-compact-coarse'
  return 'full'
}
const getServerPerformanceProfile = (): PerformanceProfile => 'static-server'

type ChapterMotion = {
  range: [number, number, number, number]
  className: string
}

const chapterMotion: readonly ChapterMotion[] = [
  { range: [0.18, 0.27, 0.43, 0.52], className: 'hero__journey--production' },
  { range: [0.42, 0.51, 0.68, 0.77], className: 'hero__journey--research' },
  { range: [0.67, 0.76, 0.94, 1], className: 'hero__journey--creator' },
]

type HeroChapterProps = {
  chapter: (typeof heroChapters)[number]
  className: string
  range: [number, number, number, number]
  scrollProgress: MotionValue<number>
}

function HeroChapter({ chapter, className, range, scrollProgress }: HeroChapterProps) {
  const opacity = useTransform(scrollProgress, range, [0, 1, 1, 0])
  const y = useTransform(scrollProgress, [range[0], range[3]], [26, -12])
  const railScale = useTransform(scrollProgress, [range[0], range[2]], [0, 1])

  return (
    <motion.aside
      aria-hidden="true"
      className={`hero__journey ${className}`}
      style={{ opacity, y }}
    >
      <span>{chapter.index}</span>
      <strong>{chapter.title}</strong>
      <p>{chapter.description}</p>
      <div className="hero__journey-rail" aria-hidden="true">
        <motion.i style={{ scaleX: railScale }} />
      </div>
      <small>{chapter.evidence}</small>
    </motion.aside>
  )
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const [introInteractive, setIntroInteractive] = useState(true)
  const introInteractiveRef = useRef(true)
  const reduceMotion = useReducedMotion()
  const performanceProfile = useSyncExternalStore(
    subscribeToPerformanceProfile,
    getPerformanceProfile,
    getServerPerformanceProfile,
  )
  const sceneActive = useInView(sectionRef, { margin: '15% 0px' })
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const storyProgress = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 34,
    mass: 0.28,
    restDelta: 0.0005,
  })

  const copyY = useTransform(storyProgress, [0, 0.36], [0, -72])
  const copyOpacity = useTransform(storyProgress, [0, 0.18, 0.36], [1, 1, 0])
  const sceneOpacity = useTransform(storyProgress, [0, 0.92, 1], [1, 1, 0.08])
  const contentInteractive = Boolean(reduceMotion) || introInteractive

  useEffect(() => {
    const nextInteractive = Boolean(reduceMotion) || storyProgress.get() < 0.38
    if (introInteractiveRef.current === nextInteractive) return
    introInteractiveRef.current = nextInteractive
    setIntroInteractive(nextInteractive)
  }, [reduceMotion, storyProgress])

  useMotionValueEvent(storyProgress, 'change', (progress) => {
    const nextInteractive = Boolean(reduceMotion) || progress < 0.38
    if (introInteractiveRef.current === nextInteractive) return
    introInteractiveRef.current = nextInteractive
    setIntroInteractive(nextInteractive)
  })

  return (
    <section ref={sectionRef} className="hero" id="top">
      <div className="hero__viewport">
        <motion.div
          className="hero__scene"
          data-performance-profile={performanceProfile}
          style={{ opacity: sceneOpacity }}
          aria-hidden="true"
        >
          {performanceProfile === 'full' && !reduceMotion ? (
            <OptimizationLandscapeScene
              active={sceneActive}
              reducedMotion={false}
              scrollProgress={storyProgress}
            />
          ) : (
            <div className="hero__scene-fallback" aria-hidden="true" />
          )}
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

          <h1 aria-label={`${profile.name}. Agent systems, under control.`}>
            <span className="hero__name">{profile.name}.</span>
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
          heroChapters.map((chapter, index) => (
            <HeroChapter
              key={chapter.index}
              chapter={chapter}
              className={chapterMotion[index].className}
              range={chapterMotion[index].range}
              scrollProgress={storyProgress}
            />
          ))
        )}
      </div>
    </section>
  )
}
