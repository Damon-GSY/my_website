'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import {
  motion,
  type MotionValue,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from 'react'
import { heroChapters, profile } from '@/lib/content'
import {
  resolveScenePerformanceProfile,
  type ScenePerformanceProfile,
} from '@/lib/scene-performance-profile'

const OptimizationLandscapeScene = dynamic(
  () => import('@/components/optimization-landscape-scene'),
  { ssr: false },
)

type NetworkHints = {
  effectiveType?: string
  saveData?: boolean
  addEventListener?: (type: 'change', listener: () => void) => void
  removeEventListener?: (type: 'change', listener: () => void) => void
}

const getNetworkHints = () =>
  (navigator as Navigator & { connection?: NetworkHints }).connection

const COARSE_SMALL_VIEWPORT_QUERY =
  '(pointer: coarse) and (max-width: 900px), (pointer: coarse) and (max-width: 1200px) and (max-height: 600px)'
const NETWORK_CONSTRAINED_CLIENT_QUERY = '(max-width: 1200px), (pointer: coarse)'

const subscribeToPerformanceProfile = (onStoreChange: () => void) => {
  const connection = getNetworkHints()
  const compactQuery = window.matchMedia(COARSE_SMALL_VIEWPORT_QUERY)
  const networkConstrainedQuery = window.matchMedia(NETWORK_CONSTRAINED_CLIENT_QUERY)
  connection?.addEventListener?.('change', onStoreChange)
  compactQuery.addEventListener('change', onStoreChange)
  networkConstrainedQuery.addEventListener('change', onStoreChange)
  return () => {
    connection?.removeEventListener?.('change', onStoreChange)
    compactQuery.removeEventListener('change', onStoreChange)
    networkConstrainedQuery.removeEventListener('change', onStoreChange)
  }
}

const getPerformanceProfile = (): ScenePerformanceProfile => {
  const hints = navigator as Navigator & { deviceMemory?: number }
  const connection = getNetworkHints()
  return resolveScenePerformanceProfile({
    compactCoarse: window.matchMedia(COARSE_SMALL_VIEWPORT_QUERY).matches,
    deviceMemory: hints.deviceMemory,
    effectiveType: connection?.effectiveType,
    hardwareConcurrency: navigator.hardwareConcurrency,
    networkConstrainedClient: window.matchMedia(NETWORK_CONSTRAINED_CLIENT_QUERY).matches,
    saveData: Boolean(connection?.saveData),
  })
}

const getServerPerformanceProfile = (): ScenePerformanceProfile => 'static-server'

type ChapterRange = [number, number, number, number]

const chapterMotion: readonly { range: ChapterRange }[] = [
  { range: [0, 0.08, 0.3, 0.46] },
  { range: [0.28, 0.42, 0.64, 0.78] },
  { range: [0.62, 0.74, 0.94, 1] },
]

function HeroChapter({
  chapter,
  progress,
  range,
}: {
  chapter: (typeof heroChapters)[number]
  progress: MotionValue<number>
  range: ChapterRange
}) {
  const opacity = useTransform(progress, range, [0.38, 1, 1, 0.38])
  const y = useTransform(progress, [range[0], range[1], range[3]], [8, 0, -6])
  const railScale = useTransform(progress, [range[0], range[2]], [0, 1])

  return (
    <motion.article style={{ opacity, y }}>
      <span>{chapter.index}</span>
      <strong>{chapter.title}</strong>
      <small>{chapter.evidence}</small>
      <motion.i aria-hidden="true" style={{ scaleX: railScale }} />
    </motion.article>
  )
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const preferredReducedMotion = useReducedMotion()
  const [motionPreferenceReady, setMotionPreferenceReady] = useState(false)
  const reduceMotion = motionPreferenceReady && Boolean(preferredReducedMotion)
  const motionEnabled = motionPreferenceReady && !reduceMotion
  const sceneActive = useInView(sectionRef, { margin: '12% 0px' })
  const performanceProfile = useSyncExternalStore(
    subscribeToPerformanceProfile,
    getPerformanceProfile,
    getServerPerformanceProfile,
  )
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const storyProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.35,
    restDelta: 0.0005,
  })
  const copyOpacity = useTransform(storyProgress, [0, 0.04, 0.08], [1, 1, 0.78])
  const headingY = useTransform(storyProgress, [0, 1], ['0%', '-10%'])
  const portalY = useTransform(storyProgress, [0, 1], ['0%', '12%'])
  const portalScale = useTransform(storyProgress, [0, 0.72, 1], [1, 1.08, 0.92])
  const sceneOpacity = useTransform(storyProgress, [0, 0.82, 1], [0.72, 0.5, 0])
  const magnetX = useMotionValue(0)
  const magnetY = useMotionValue(0)
  const magnetRotateX = useTransform(magnetY, [-28, 28], [4, -4])
  const magnetRotateY = useTransform(magnetX, [-28, 28], [-5, 5])

  useEffect(() => {
    setMotionPreferenceReady(true)
  }, [])

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !portalRef.current) return
    const rect = portalRef.current.getBoundingClientRect()
    const x = (event.clientX - rect.left - rect.width / 2) / 9
    const y = (event.clientY - rect.top - rect.height / 2) / 9
    magnetX.set(Math.max(-28, Math.min(28, x)))
    magnetY.set(Math.max(-28, Math.min(28, y)))
  }

  function resetPortal() {
    magnetX.set(0)
    magnetY.set(0)
  }

  return (
    <section
      ref={sectionRef}
      className="creator-hero"
      data-motion-mode={motionPreferenceReady ? (reduceMotion ? 'reduced' : 'full') : 'pending'}
      id="top"
    >
      <div className="creator-hero__viewport">
        <motion.div
          className="creator-hero__scene"
          data-performance-profile={performanceProfile}
          style={{ opacity: motionEnabled ? sceneOpacity : 0.5 }}
          aria-hidden="true"
        >
          {performanceProfile === 'full' && motionEnabled ? (
            <OptimizationLandscapeScene
              active={sceneActive}
              reducedMotion={false}
              scrollProgress={storyProgress}
            />
          ) : (
            <div className="creator-hero__scene-fallback" />
          )}
        </motion.div>
        <div className="creator-hero__veil" aria-hidden="true" />
        {motionEnabled && (
          <motion.div
            className="creator-hero__light-sweep"
            style={{ y: headingY }}
            aria-hidden="true"
          />
        )}

        <div className="creator-shell creator-hero__inner">
          <motion.p
            className="creator-hero__eyebrow"
            initial={motionEnabled ? { opacity: 0, y: -18 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>{profile.name} · Computational creator</span>
            <span>{profile.role} · {profile.location}</span>
          </motion.p>

          <motion.div
            className="creator-hero__title"
            style={{
              opacity: motionEnabled ? copyOpacity : 1,
              y: motionEnabled ? headingY : 0,
            }}
            initial={motionEnabled ? { opacity: 0, y: 48 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              aria-label={`${profile.name}. Production agents, research, and field notes.`}
              data-identity={profile.name}
              data-positioning="Agent systems, under control."
            >
              <span>Damon</span>
              <span>Guan</span>
            </h1>
          </motion.div>

          <motion.div
            ref={portalRef}
            className="creator-hero__portal"
            style={{
              x: magnetX,
              y: motionEnabled ? portalY : 0,
              scale: motionEnabled ? portalScale : 1,
              rotateX: magnetRotateX,
              rotateY: magnetRotateY,
            }}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetPortal}
            initial={motionEnabled ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src="/assets/optimization-core-midjourney.webp"
              alt="Abstract optimization surface with a terracotta minimum path"
              fill
              priority
              sizes="(max-width: 720px) 72vw, 34vw"
            />
            <span className="creator-hero__portal-index">DG / 01</span>
          </motion.div>

          <motion.div
            className="creator-hero__lower"
            initial={motionEnabled ? { opacity: 0, y: 24 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <p>{profile.thesis}</p>
            <a href="#work">
              Explore the systems
              <i aria-hidden="true">↓</i>
            </a>
          </motion.div>

          <div className="creator-hero__chapters" aria-label="Three parts of the practice">
            {heroChapters.map((chapter, index) => (
              <HeroChapter
                chapter={chapter}
                key={chapter.index}
                progress={storyProgress}
                range={chapterMotion[index].range}
              />
            ))}
          </div>

          <div className="creator-hero__proofs" aria-label="Selected proof points">
            {profile.heroProofs.map(([label, proof]) => (
              <span key={label}>
                <b>{label}</b>
                {proof}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
