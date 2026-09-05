'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Component, useCallback, useEffect, useState, type ReactNode } from 'react'
import { paperCurve, paperPoint, pathPoint } from './surface-math'
import styles from './home.module.css'

const SurfaceCanvas = dynamic(() => import('./surface-canvas'), { ssr: false })
class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.failed ? null : this.props.children }
}
const line = Array.from({ length: 81 }, (_, i) => {
  const [x, y] = paperPoint(pathPoint(i / 80))
  return `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`
}).join(' ')
const bead = paperPoint(pathPoint(.58))

export function Hero() {
  const [enhanced, setEnhanced] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const preference = window.matchMedia('(min-width: 760px) and (prefers-reduced-motion: no-preference)')
    const change = () => { setEnhanced(preference.matches); setReady(false) }
    change()
    preference.addEventListener('change', change)
    return () => preference.removeEventListener('change', change)
  }, [])
  const onReady = useCallback(() => setReady(true), [])
  const onLost = useCallback(() => { setEnhanced(false); setReady(false) }, [])
  return <section className={styles.hero} aria-labelledby="hero-title">
    <div className={`container ${styles.heroGrid}`}>
      <div className={styles.heroCopy}>
        <div className={styles.intro}><span className={styles.dot}/> AI researcher & engineer</div>
        <h1 id="hero-title">Curiosity,<br/>made <em>useful.</em></h1>
        <p>I’m Damon. I turn research into AI systems<br className={styles.desktopBreak}/> that work beyond the demo.</p>
        <div className={styles.heroActions}><Link className={styles.primaryButton} href="/#work">Explore my work <span aria-hidden="true">↗</span></Link><Link className={styles.textLink} href="/#about">A little about me <span aria-hidden="true">↗</span></Link></div>
        <div className={styles.current}><span>Currently at</span><strong>Alibaba</strong><span className={styles.currentDivider}/><span>Building reliable autonomy.</span></div>
      </div>
      <div className={styles.study}>
        <div className={styles.studyLabel}><span className="eyebrow">Fig. 01 — A landscape of possibilities</span><span className={styles.cross}>+</span></div>
        <div className={styles.surface} role="img" aria-label="A folded mathematical surface in sage green with a terracotta optimization path. The surface responds to your pointer and scrolling.">
          <svg className={styles.paperSurface} style={{ opacity: ready ? 0 : 1 }} viewBox="0 0 640 530" aria-hidden="true">
            <ellipse cx="325" cy="430" rx="175" ry="26" fill="#20352c" opacity=".04"/>
            <path d={paperCurve(1)} fill="#e0e3cc"/>
            {Array.from({ length: 64 }, (_, i) => <path key={i} d={paperCurve((i + 1) / 64)} fill="none" stroke="#687758" strokeWidth=".7"/>)}
            <path d={line} fill="none" stroke="#bd573a" strokeWidth="2.8"/><circle cx={bead[0]} cy={bead[1]} r="7" fill="#bd573a" stroke="#f5f3ec" strokeWidth="2"/>
          </svg>
          {enhanced && <div className={styles.canvas} aria-hidden="true"><SceneBoundary onError={onLost}><SurfaceCanvas onReady={onReady} onLost={onLost}/></SceneBoundary></div>}
        </div>
        <div className={styles.studyFooter}><span><span className={styles.pathKey}/> From possibility to something useful.</span><span>{ready ? 'Move to explore ↗' : 'A study in optimization'}</span></div>
      </div>
    </div>
    <div className={`container ${styles.heroFoot}`}><span>Research-minded. Production-tested.</span><a href="#work">Scroll to discover <span aria-hidden="true">↓</span></a><span className={styles.edition}>Personal fieldwork · 2026</span></div>
  </section>
}
