'use client'

import {
  motion,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useRef, useState } from 'react'
import { profile, research } from '@/lib/content'
import styles from './research-section.module.css'

const taxonomyNodes = [
  [92, 92, 15], [154, 68, 9], [216, 118, 13], [122, 172, 11], [202, 205, 17],
  [284, 82, 12], [342, 136, 18], [294, 218, 8], [388, 228, 13], [454, 98, 16],
  [504, 164, 10], [470, 244, 14], [552, 84, 8], [596, 206, 17], [652, 132, 11],
] as const

function ResearchVisual({
  activeIndex,
  compact = false,
  progress,
}: {
  activeIndex: number
  compact?: boolean
  progress?: MotionValue<number>
}) {
  const paper = research[activeIndex]
  const visualRef = useRef<HTMLDivElement>(null)
  const visible = useInView(visualRef, { amount: 0.32 })
  const reducedMotion = useReducedMotion()
  const staticProgress = useMotionValue(activeIndex / 2)
  const source = progress ?? staticProgress
  const animated = Boolean(progress)
  const taxonomyOpacity = useTransform(source, [0, 0.22, 0.36], [1, 1, 0])
  const taxonomyY = useTransform(source, [0, 0.36], [0, -18])
  const taxonomyScale = useTransform(source, [0, 0.36], [1, 1.04])
  const taxonomyDraw = useTransform(source, [0, 0.3], [0.18, 1])
  const benchmarkOpacity = useTransform(source, [0.22, 0.36, 0.57, 0.72], [0, 1, 1, 0])
  const benchmarkY = useTransform(source, [0.22, 0.36, 0.72], [20, 0, -14])
  const benchmarkScale = useTransform(source, [0.22, 0.48, 0.72], [0.96, 1, 1.03])
  const benchmarkDraw = useTransform(source, [0.28, 0.6], [0.08, 1])
  const deltaOpacity = useTransform(source, [0.57, 0.72, 1], [0, 1, 1])
  const deltaY = useTransform(source, [0.57, 0.72, 1], [20, 0, -6])
  const deltaScale = useTransform(source, [0.57, 0.84, 1], [0.96, 1, 1.025])
  const deltaDraw = useTransform(source, [0.64, 0.9], [0.05, 1])
  const taxonomyLive = visible && activeIndex === 0 && !reducedMotion

  return (
    <div
      ref={visualRef}
      className={`${styles.visual}${compact ? ` ${styles.visualCompact}` : ''}`}
      data-active={activeIndex}
      data-animated={animated}
      aria-hidden="true"
    >
      <svg viewBox="0 0 720 390">
        <motion.g
          className={`${styles.state} ${styles.taxonomyState}`}
          style={animated ? { opacity: taxonomyOpacity, y: taxonomyY, scale: taxonomyScale } : undefined}
        >
          <motion.path
            className={styles.network}
            pathLength="1"
            style={animated ? { pathLength: taxonomyDraw } : undefined}
            d="M92 92L216 118L202 205L342 136L388 228L504 164L596 206M154 68L284 82L342 136L454 98L552 84L652 132M122 172L202 205L294 218L388 228L470 244L596 206"
          />
          {taxonomyNodes.map(([cx, cy, radius], index) => (
            <motion.circle
              animate={taxonomyLive
                ? { opacity: 1, scale: 1 }
                : { opacity: reducedMotion ? 1 : 0.18, scale: reducedMotion ? 1 : 0.72 }}
              className={index % 4 === 0 ? styles.nodeAccent : styles.node}
              cx={cx}
              cy={cy}
              initial={false}
              key={`${cx}-${cy}`}
              r={radius}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              transition={{
                delay: taxonomyLive ? index * 0.045 : 0,
                duration: 0.46,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}
          <motion.circle
            animate={taxonomyLive ? {
              cx: [92, 216, 202, 342, 388, 504, 596, 652],
              cy: [92, 118, 205, 136, 228, 164, 206, 132],
              opacity: [0, 1, 1, 1, 1, 1, 1, 0],
            } : { cx: 92, cy: 92, opacity: 0 }}
            className={styles.signalPulse}
            data-research-pulse
            initial={false}
            r="5"
            transition={taxonomyLive ? {
              duration: 4.6,
              ease: 'linear',
              repeat: Infinity,
              repeatDelay: 0.8,
              times: [0, 0.14, 0.27, 0.42, 0.57, 0.72, 0.86, 1],
            } : { duration: 0 }}
          />
          <text x="70" y="322">planning</text>
          <text x="252" y="322">tools</text>
          <text x="404" y="322">memory</text>
          <text x="570" y="322">recovery</text>
        </motion.g>

        <motion.g
          className={`${styles.state} ${styles.benchmarkState}`}
          style={animated ? { opacity: benchmarkOpacity, y: benchmarkY, scale: benchmarkScale } : undefined}
        >
          <motion.path
            className={styles.benchmarkFrame}
            pathLength="1"
            style={animated ? { pathLength: benchmarkDraw } : undefined}
            d="M76 76H214V300H76ZM224 76H362V300H224ZM372 76H510V300H372ZM520 76H658V300H520Z"
          />
          {Array.from({ length: 48 }, (_, index) => {
            const group = Math.floor(index / 12)
            const item = index % 12
            const column = item % 3
            const row = Math.floor(item / 3)
            const cx = 99 + group * 148 + column * 42
            const cy = 112 + row * 48
            return <circle key={index} cx={cx} cy={cy} r={item === 5 ? 5.5 : 3.2} className={item === 5 ? styles.nodeAccent : styles.sample} />
          })}
          <text x="76" y="336">logistics</text>
          <text x="224" y="336">fulfillment</text>
          <text x="372" y="336">finance</text>
          <text x="520" y="336">tool calling</text>
        </motion.g>

        <motion.g
          className={`${styles.state} ${styles.deltaState}`}
          style={animated ? { opacity: deltaOpacity, y: deltaY, scale: deltaScale } : undefined}
        >
          <rect x="82" y="72" width="218" height="218" rx="2" className={styles.deltaFrame} />
          <rect x="420" y="72" width="218" height="218" rx="2" className={`${styles.deltaFrame} ${styles.deltaFrameAccent}`} />
          <path className={styles.deltaNoise} d="M102 118L278 248M116 92L290 196M98 188L226 282M440 242L612 112M448 274L628 164M486 282L624 218" />
          <motion.path
            className={styles.deltaArrow}
            pathLength="1"
            style={animated ? { pathLength: deltaDraw } : undefined}
            d="M324 181H394M380 167L394 181L380 195"
          />
          <circle cx="191" cy="181" r="44" className={styles.deltaBlur} />
          <circle cx="529" cy="181" r="44" className={styles.deltaFocus} />
          <text x="82" y="326">degraded input / rejected path</text>
          <text x="420" y="326">retained input / preferred path</text>
        </motion.g>
      </svg>

      <div className={styles.visualReadout}>
        <span>Observed signal / 0{activeIndex + 1}</span>
        <strong>{paper.metric}</strong>
        <small>{paper.topics.join(' · ')}</small>
        <em>Conceptual map · schematic, not to scale</em>
      </div>
    </div>
  )
}

function ResearchRecord({ paper, index, active = false }: {
  paper: (typeof research)[number]
  index: number
  active?: boolean
}) {
  return (
    <article className={`${styles.record}${active ? ` ${styles.recordActive}` : ''}`}>
      <a href={paper.href} target="_blank" rel="noreferrer" tabIndex={active ? 0 : -1}>
        <div className={styles.recordMeta}>
          <span>{paper.index}</span>
          <span>{paper.type}</span>
        </div>
        <p className={styles.authorship}>{paper.authorship}</p>
        <h3>{paper.title}</h3>
        <p className={styles.description}>{paper.description}</p>
        <div className={styles.topics}>
          {paper.topics.map((topic) => <span key={topic}>{topic}</span>)}
        </div>
        <footer className={styles.citation}>
          <strong>{paper.metric}</strong>
          <span>{paper.venue} · {paper.year}</span>
          <i aria-hidden="true">↗</i>
        </footer>
        <span className={styles.recordCount}>0{index + 1} / 03</span>
      </a>
    </article>
  )
}

export default function ResearchSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const nextIndex = progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2
    setActiveIndex((current) => current === nextIndex ? current : nextIndex)
  })

  return (
    <section ref={sectionRef} className={`research-section ${styles.section}`} id="research">
      <div className={styles.desktopExperience}>
        <div className={styles.sticky}>
          <div className="section-shell">
            <header className={styles.header}>
              <p className="section-eyebrow">Research observatory / three public records</p>
              <h2>Make capability observable.</h2>
              <div>
                <p>Benchmarks and taxonomies turn a model claim into a decision another team can inspect.</p>
                <small>Published as <strong>{profile.legalName}</strong> · first and contributing author</small>
              </div>
            </header>

            <div className={styles.stage}>
              <ResearchVisual activeIndex={activeIndex} progress={scrollYProgress} />
              <div className={styles.records} aria-live="polite">
                {research.map((paper, index) => (
                  <ResearchRecord key={paper.index} paper={paper} index={index} active={index === activeIndex} />
                ))}
              </div>
            </div>

            <div className={styles.progress} aria-hidden="true">
              <motion.i style={{ scaleX: railScale }} />
              {research.map((paper, index) => (
                <span key={paper.index} className={index === activeIndex ? styles.progressActive : undefined}>
                  {paper.index}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`section-shell ${styles.mobileExperience}`}>
        <header className={styles.mobileHeader}>
          <p className="section-eyebrow">Research / public record</p>
          <h2>Make capability observable.</h2>
          <p>Published as <strong>{profile.legalName}</strong> · first and contributing author</p>
        </header>

        {research.map((paper, index) => (
          <div className={styles.mobileRecord} key={paper.index}>
            <ResearchVisual activeIndex={index} compact />
            <ResearchRecord paper={paper} index={index} active />
          </div>
        ))}
      </div>
    </section>
  )
}
