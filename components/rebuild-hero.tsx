'use client'

import dynamic from 'next/dynamic'
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Component, useEffect, useRef, useState, type ErrorInfo, type PointerEvent, type ReactNode } from 'react'
import { profile } from '@/lib/content'

const OptimizationLandscapeScene = dynamic(
  () => import('@/components/optimization-landscape-scene'),
  { ssr: false },
)

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
}: {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  x?: number
  y?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

function Magnet({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const smoothX = useSpring(x, { stiffness: 140, damping: 18 })
  const smoothY = useSpring(y, { stiffness: 140, damping: 18 })

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!ref.current || event.pointerType !== 'mouse') return
    const bounds = ref.current.getBoundingClientRect()
    x.set((event.clientX - bounds.left - bounds.width / 2) / 3)
    y.set((event.clientY - bounds.top - bounds.height / 2) / 3)
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className="prompt-hero__magnet"
      onPointerLeave={reset}
      onPointerMove={move}
      ref={ref}
      style={{ x: smoothX, y: smoothY }}
    >
      {children}
    </motion.div>
  )
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('The interactive landscape fell back to the static art.', error, info)
    }
  }

  render() {
    return this.state.failed ? <div className="prompt-hero__art-fallback" /> : this.props.children
  }
}

export function ContactButton() {
  return <a className="prompt-contact" href={`mailto:${profile.email}`}>Contact me</a>
}

export default function RebuildHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const [mounted, setMounted] = useState(false)
  const reducedMotion = useReducedMotion()
  const active = useInView(sectionRef, { margin: '10% 0px' })
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.0005,
  })
  const artScale = useTransform(progress, [0, 1], [1, 1.08])
  const artY = useTransform(progress, [0, 1], ['0%', '8%'])

  useEffect(() => setMounted(true), [])

  return (
    <section className="prompt-hero" id="top" ref={sectionRef}>
      <FadeIn className="prompt-hero__nav" y={-20}>
        <a href="#about">About</a>
        <a href="#services">Capabilities</a>
        <a href="#work">Projects</a>
        <a href={`mailto:${profile.email}`}>Contact</a>
      </FadeIn>

      <div className="prompt-hero__heading-wrap">
        <FadeIn delay={0.15} y={40}>
          <h1>Hi, I&apos;m Damon</h1>
        </FadeIn>
      </div>

      <FadeIn className="prompt-hero__art" delay={0.6} y={30}>
        <Magnet>
          <motion.div className="prompt-hero__art-frame" style={{ scale: artScale, y: artY }}>
            <SceneBoundary>
              {mounted && !reducedMotion ? (
                <OptimizationLandscapeScene
                  active={active}
                  reducedMotion={false}
                  scrollProgress={progress}
                />
              ) : (
                <div className="prompt-hero__art-fallback" />
              )}
            </SceneBoundary>
            <div className="prompt-hero__art-shade" />
            <span>DG / Computational practice</span>
          </motion.div>
        </Magnet>
      </FadeIn>

      <div className="prompt-hero__bottom">
        <FadeIn delay={0.35} y={20}>
          <p>{profile.heroSummary}</p>
        </FadeIn>
        <FadeIn delay={0.5} y={20}><ContactButton /></FadeIn>
      </div>
    </section>
  )
}
