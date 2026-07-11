import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { clamp, smooth, band } from './landscape/math'
import { createLandscapeRenderer } from './landscape/renderer'
const foregroundUrl = '/assets/optimization-foreground.webp'
const landscapeUrl = '/assets/optimization-landscape.webp'
const depthUrl = '/assets/optimization-depth.webp'
const lightUrl = '/assets/optimization-light.webp'

const ACCENT = '#d97757'
const INK = '#f3eee9'
const MUTED = 'rgba(243,238,233,.72)'
const LINE = 'rgba(243,238,233,.16)'

const identity = {
  role: 'LLM Algorithm Engineer',
  company: 'Alibaba',
  location: 'Hangzhou, China',
  email: 'hello@damon.ai',
  links: [
    ['GitHub', 'https://github.com/Damon-GSY'],
    ['LinkedIn', 'https://www.linkedin.com/in/shengyue-guan-1a7b3226b/'],
    ['YouTube', 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA'],
    ['Bilibili', 'https://space.bilibili.com/358541297'],
  ],
} as const

// clamp / smooth / band are imported from ./landscape/math (unit-tested)

function useScrollProgress() {
  const target = useRef(0)
  const current = useRef(0)
  const frame = useRef(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const read = () => {
      const range = document.documentElement.scrollHeight - window.innerHeight
      target.current = range > 0 ? clamp(window.scrollY / range) : 0
      if (reduced.matches) {
        current.current = target.current
        setProgress(target.current)
      }
    }
    const tick = () => {
      if (!reduced.matches) {
        const delta = target.current - current.current
        if (Math.abs(delta) > 0.00008) {
          current.current = target.current // instant: no lag, no reversal overshoot
          setProgress(target.current)
        }
      }
      frame.current = requestAnimationFrame(tick)
    }
    read()
    frame.current = requestAnimationFrame(tick)
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    return () => {
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
      cancelAnimationFrame(frame.current)
    }
  }, [])
  return clamp(progress)
}

const meta: CSSProperties = {
  color: MUTED,
  fontFamily: "'Imprima', sans-serif",
  fontSize: '.62rem',
  letterSpacing: '.17em',
  lineHeight: 1.4,
  textTransform: 'uppercase',
}

const linkStyle: CSSProperties = {
  color: INK,
  fontFamily: "'Imprima', sans-serif",
  fontSize: '.7rem',
  letterSpacing: '.13em',
  textDecoration: 'none',
  textTransform: 'uppercase',
}

// (Layer component removed — parallax layers now drawn in renderer.ts canvas)

function DataRow({ label, value, at, progress }: { label: string; value: string; at: number; progress: number }) {
  const reveal = smooth(at, at + 0.045, progress)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '5.5rem minmax(0,1fr)', gap: '1rem', padding: '.78rem 0', borderTop: `1px solid ${LINE}`, opacity: reveal, transform: `translateY(${(1 - reveal) * 18}px)` }}>
      <span style={meta}>{label}</span>
      <span style={{ color: INK, fontSize: '.82rem', lineHeight: 1.45 }}>{value}</span>
    </div>
  )
}

export default function App() {
  const progress = useScrollProgress()
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!bgCanvasRef.current) return
    const r = createLandscapeRenderer(bgCanvasRef.current, { landscape: landscapeUrl, depth: depthUrl, light: lightUrl, foreground: foregroundUrl })
    return () => r.dispose()
  }, [])
  const particles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: 4 + ((i * 29) % 93),
    y: 18 + ((i * 47) % 76),
    size: 1 + (i % 3) * 0.55,
    depth: 0.3 + (i % 7) * 0.11,
    alpha: 0.15 + (i % 5) * 0.055,
  })), [])

  const sceneOne = 1 - smooth(0.1, 0.17, progress)
  const research = band(0.12, 0.18, 0.22, 0.26, progress)
  const production = band(0.27, 0.33, 0.38, 0.42, progress)
  const papers = band(0.43, 0.49, 0.58, 0.62, progress)
  const trajectory = band(0.63, 0.69, 0.76, 0.80, progress)
  const contact = smooth(0.81, 0.9, progress)
  const core = smooth(0.52, 0.94, progress)
  const chapter = progress < 0.63 ? '01 / LANDSCAPE' : progress < 0.84 ? '02 / CORE' : '02 / MINIMUM'

  return (
    <main style={{ minHeight: '520svh', background: '#0a0a0c', color: INK }}>
      <a href="#experience" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]" style={{ ...linkStyle, padding: '.7rem 1rem', background: '#0a0a0c', border: `1px solid ${ACCENT}` }}>
        Skip to experience
      </a>

      <section id="experience" aria-label="Optimization landscape experience" style={{ position: 'sticky', top: 0, height: '100svh', minHeight: '38rem', overflow: 'hidden', isolation: 'isolate', background: '#0a0a0c' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <canvas ref={bgCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, display: 'block' }} />
          {/* perf: dropped depth layer (fullscreen screen-blend+mask composite per frame) */}
          {/* perf: light glow baked into landscape (tools/bake-light-into-landscape.py); dropped per-frame screen+mask composite */}
          {/* foreground now drawn inside the canvas above (renderer.ts) */}
          {/* perf: dropped scan-lines (fullscreen masked composite every frame) */}
          {particles.map((p) => (
            <i key={p.id} style={{ position: 'absolute', zIndex: 7, left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: p.id % 4 === 0 ? '#ffd5bf' : ACCENT, boxShadow: `0 0 7px ${p.id % 4 === 0 ? 'rgba(255,205,180,.68)' : 'rgba(217,119,87,.55)'}`, opacity: p.alpha * (.72 + core), transform: `translate3d(${progress * 110 * p.depth}px,${-progress * 150 * p.depth}px,0) scale(${.8 + progress * p.depth})` }} />
          ))}
          <div style={{ position: 'absolute', zIndex: 8, inset: 0, background: 'radial-gradient(ellipse at 54% 55%,transparent 20%,rgba(6,6,8,.14) 48%,rgba(4,4,6,.72))', boxShadow: 'inset 0 0 14vw rgba(0,0,0,.75)' }} />
          {/* perf: dropped noise grain (fullscreen soft-light blend every frame) */}
        </div>

        <header style={{ position: 'absolute', zIndex: 30, inset: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(1.15rem,2.8vw,2.4rem) clamp(1.15rem,4vw,4.5rem)' }}>
          <a href={`mailto:${identity.email}`} style={{ display: 'flex', alignItems: 'center', gap: '.8rem', textDecoration: 'none' }}>
            <span style={{ display: 'grid', width: 29, height: 29, placeItems: 'center', border: `1px solid ${LINE}`, borderRadius: '50%', color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: '.96rem' }}>D</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1rem,3vw,3rem)' }}>
            <span className="hidden sm:inline" style={meta}>{identity.location}</span>
            <a href={`mailto:${identity.email}`} style={{ ...linkStyle, color: ACCENT }}>Contact ↗</a>
          </div>
        </header>

        <aside aria-label={`Scroll progress ${Math.round(progress * 100)} percent`} style={{ position: 'absolute', zIndex: 28, top: '50%', right: 'clamp(1rem,2.8vw,2.8rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.8rem', transform: 'translateY(-50%)' }}>
          <span style={{ ...meta, writingMode: 'vertical-rl', fontSize: '.55rem' }}>{chapter}</span>
          <span style={{ position: 'relative', width: 1, height: '22vh', minHeight: 100, background: LINE }}><span style={{ position: 'absolute', inset: '0 0 auto', width: 1, height: `${progress * 100}%`, background: ACCENT, boxShadow: '0 0 12px rgba(217,119,87,.75)' }} /></span>
          <span style={{ ...meta, color: INK, fontVariantNumeric: 'tabular-nums' }}>{String(Math.round(progress * 100)).padStart(2, '0')}</span>
        </aside>

        <article style={{ position: 'absolute', zIndex: 20, inset: 0, display: 'flex', alignItems: 'center', padding: 'clamp(6.5rem,12vh,9rem) clamp(1.15rem,7vw,8rem) 6rem', opacity: sceneOne, transform: `translateY(${-progress * 58}px)`, pointerEvents: sceneOne > .15 ? 'auto' : 'none' }}>
          <div className="max-w-[48rem] md:max-w-[58rem]">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.4rem' }}><span style={{ width: 34, height: 1, background: ACCENT }} /><p style={{ ...meta, margin: 0, color: ACCENT }}>Optimization Landscape · 01</p></div>
            <h1 style={{ margin: 0, maxWidth: '12ch', color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(3.3rem,8.8vw,9.2rem)', fontWeight: 400, letterSpacing: '-.045em', lineHeight: .84, textShadow: '0 8px 40px rgba(0,0,0,.55)' }}>Find the path before the answer.</h1>
            <p style={{ maxWidth: '34rem', margin: 'clamp(1.4rem,3vw,2.5rem) 0 0', color: 'rgba(243,238,233,.86)', fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.88rem,1.15vw,1.03rem)', lineHeight: 1.7 }}>I build evaluation systems, post-training methods, and production agents—mapping the terrain before asking a model to move through it.</p>
          </div>
        </article>

        <article style={{ position: 'absolute', zIndex: 21, inset: 0, display: 'flex', alignItems: 'center', padding: '7rem clamp(3.4rem,9vw,10rem) 7rem clamp(1.2rem,6vw,6rem)', opacity: research, transform: `translateY(${(.2 - progress) * 70}px)`, pointerEvents: research > .15 ? 'auto' : 'none' }}>
          <div className="w-full max-w-[31rem] md:w-[40vw]">
            <p style={{ ...meta, margin: '0 0 1.2rem', color: ACCENT }}>Research axes · waypoint 02</p>
            <h2 style={{ margin: 0, color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(3rem,6.2vw,6.8rem)', fontWeight: 400, letterSpacing: '-.035em', lineHeight: .9, textShadow: '0 8px 38px rgba(0,0,0,.66)' }}>Four axes. One agent.</h2>
            <div style={{ marginTop: 'clamp(1.5rem,3vw,2.5rem)', borderBottom: `1px solid ${LINE}` }}>
              <DataRow label="01" value="Planning · dynamic decomposition and cross-turn replanning" at={.13} progress={progress} />
              <DataRow label="02" value="Tool use · execution accuracy across 100+ tools" at={.15} progress={progress} />
              <DataRow label="03" value="Memory · session, persistent, and retrieval horizons" at={.17} progress={progress} />
              <DataRow label="04" value="Evaluation · judge intermediate steps, not just final answers" at={.19} progress={progress} />
            </div>
          </div>
        </article>

        <article style={{ position: 'absolute', zIndex: 21, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '7rem clamp(3.4rem,9vw,10rem) 7rem clamp(1.2rem,6vw,6rem)', opacity: production, transform: `translateY(${(.36 - progress) * 70}px)`, pointerEvents: production > .15 ? 'auto' : 'none' }}>
          <div className="w-full max-w-[29rem] md:w-[38vw]">
            <p style={{ ...meta, margin: '0 0 1.2rem', color: ACCENT }}>Production trace · waypoint 03</p>
            <h2 style={{ margin: 0, color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(2.9rem,5.8vw,6.4rem)', fontWeight: 400, letterSpacing: '-.035em', lineHeight: .91, textShadow: '0 8px 38px rgba(0,0,0,.66)' }}>Systems that survive contact with reality.</h2>
            <div style={{ marginTop: 'clamp(1.6rem,4vw,3.2rem)', borderBottom: `1px solid ${LINE}` }}>
              <DataRow label="Agent System" value="Risk-tiered multi-turn decisions across 12 supply-chain scenarios; 90% fewer misoperations, sub-second handoff." at={.28} progress={progress} />
              <DataRow label="Agentic RL" value="Ticket-resolution agents over 100+ dynamically registered tools; 90% less manual handling." at={.3} progress={progress} />
              <DataRow label="Domain LLM" value="Continual pretraining + integrated SFT/RL; internal SOTA on a dual-axis knowledge + tool-use benchmark." at={.32} progress={progress} />
              <DataRow label="Reward Design" value="Multi-objective GRPO stabilized via conditional rewards, variance control, and hierarchical rewards." at={.34} progress={progress} />
            </div>
          </div>
        </article>

        <article style={{ position: 'absolute', zIndex: 22, inset: 0, display: 'flex', alignItems: 'center', padding: '6.5rem clamp(3.4rem,8vw,9rem) 6.5rem clamp(1.2rem,7vw,8rem)', opacity: papers, transform: `translateY(${(.53 - progress) * 70}px)`, pointerEvents: papers > .15 ? 'auto' : 'none' }}>
          <div className="w-full max-w-[48rem] md:w-[58vw]">
            <p style={{ ...meta, margin: '0 0 1rem', color: ACCENT }}>Research record · waypoint 04</p>
            <h2 style={{ margin: 0, color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(2.7rem,5.5vw,6rem)', fontWeight: 400, letterSpacing: '-.035em', lineHeight: .9, textShadow: '0 8px 38px rgba(0,0,0,.66)' }}>Claims must survive the benchmark.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ marginTop: 'clamp(1.35rem,3vw,2.4rem)', borderTop: `1px solid ${LINE}`, borderLeft: `1px solid ${LINE}` }}>
              {[
                ['01 · Agent Evaluation', 'A taxonomy built from ~250 papers across planning, tools, memory, and Agent-as-Judge.'],
                ['02 · SupChain-Bench', '530 real-world samples spanning logistics, fulfillment, finance, and customs.'],
                ['03 · VisualDeltas', 'Preference learning from visual-quality-induced reasoning; gains up to +8.2%.'],
                ['04 · Multi-turn Evaluation', 'Cross-turn recovery, intent shifts, and dependency-aware intermediate scoring.'],
              ].map(([title, copy]) => (
                <div key={title} style={{ minHeight: '6.4rem', padding: '1rem', borderRight: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, background: 'rgba(7,7,9,.5)' }}>
                  <p style={{ ...meta, margin: 0, color: 'rgba(243,238,233,.82)' }}>{title}</p>
                  <p style={{ margin: '.65rem 0 0', color: 'rgba(243,238,233,.82)', fontFamily: "'Imprima',sans-serif", fontSize: '.76rem', lineHeight: 1.5 }}>{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article style={{ position: 'absolute', zIndex: 22, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '7rem clamp(3.4rem,9vw,10rem) 7rem clamp(1.2rem,6vw,6rem)', opacity: trajectory, transform: `translateY(${(.72 - progress) * 70}px)`, pointerEvents: trajectory > .15 ? 'auto' : 'none' }}>
          <div className="w-full max-w-[31rem] md:w-[40vw]">
            <p style={{ ...meta, margin: '0 0 1.2rem', color: ACCENT }}>Trajectory · waypoint 05</p>
            <h2 style={{ margin: 0, color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(3rem,6vw,6.5rem)', fontWeight: 400, letterSpacing: '-.035em', lineHeight: .9, textShadow: '0 8px 38px rgba(0,0,0,.66)' }}>Research, then production.</h2>
            <div style={{ marginTop: 'clamp(1.5rem,3vw,2.6rem)', borderBottom: `1px solid ${LINE}` }}>
              <DataRow label="2019—22" value="UNSW · Computer Science · Dean's List" at={.64} progress={progress} />
              <DataRow label="2023—25" value="NUS · Statistics · top 5%" at={.66} progress={progress} />
              <DataRow label="2024—25" value="Microsoft Research Asia · M365 Copilot" at={.68} progress={progress} />
              <DataRow label="2025—now" value="Alibaba · LLM systems · Hangzhou" at={.7} progress={progress} />
            </div>
            <div style={{ marginTop: '1.4rem', padding: '.9rem 1rem', border: `1px solid ${LINE}`, background: 'rgba(7,7,9,.42)' }}>
              <p style={{ ...meta, margin: 0, color: ACCENT }}>Field notes · recent writing</p>
              <div style={{ marginTop: '.6rem', display: 'grid', gap: '.5rem' }}>
                <p style={{ margin: 0, color: 'rgba(243,238,233,.88)', fontFamily: "'Imprima',sans-serif", fontSize: '.78rem', lineHeight: 1.4 }}><span style={{ color: 'rgba(243,238,233,.5)' }}>2026 · </span>Why Agent Evaluation Is Hard — lessons from multi-turn eval benchmarks.</p>
                <p style={{ margin: 0, color: 'rgba(243,238,233,.88)', fontFamily: "'Imprima',sans-serif", fontSize: '.78rem', lineHeight: 1.4 }}><span style={{ color: 'rgba(243,238,233,.5)' }}>2026 · </span>Building Agents That Actually Work — patterns for production agent systems.</p>
                <p style={{ margin: 0, color: 'rgba(243,238,233,.88)', fontFamily: "'Imprima',sans-serif", fontSize: '.78rem', lineHeight: 1.4 }}><span style={{ color: 'rgba(243,238,233,.5)' }}>2026 · </span>Post-Training Lessons From Production — what shipped, what broke.</p>
              </div>
            </div>
          </div>
        </article>

        <article style={{ position: 'absolute', zIndex: 23, inset: 0, display: 'grid', placeItems: 'center', padding: '7rem 3.2rem 5rem 1.2rem', opacity: contact, transform: `scale(${.96 + contact * .04})`, pointerEvents: contact > .45 ? 'auto' : 'none', textAlign: 'center' }}>
          <div style={{ maxWidth: '59rem' }}>
            <p style={{ ...meta, margin: '0 0 1.25rem', color: ACCENT }}>Loss minimum reached · Δ 0.0001</p>
            <h2 style={{ margin: 0, color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(3.7rem,9vw,9.4rem)', fontWeight: 400, letterSpacing: '-.045em', lineHeight: .86, textShadow: '0 10px 42px rgba(0,0,0,.7)' }}>Continue the search.</h2>
            <p style={{ margin: '1.7rem auto 0', maxWidth: '33rem', color: 'rgba(243,238,233,.86)', fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.86rem,1.2vw,1rem)', lineHeight: 1.65 }}>Open to collaborations on agent systems, evaluation research, and practical AI communication.</p>
            <a href={`mailto:${identity.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2rem', marginTop: '2rem', padding: '.95rem 0', borderBottom: `1px solid ${ACCENT}`, color: INK, fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.88rem,1.5vw,1.1rem)', letterSpacing: '.06em', textDecoration: 'none' }}>{identity.email} <span style={{ color: ACCENT }}>↗</span></a>
          </div>
        </article>

        <footer style={{ position: 'absolute', zIndex: 30, right: 'clamp(3.2rem,7vw,7rem)', bottom: 'clamp(1.15rem,2.8vw,2.5rem)', left: 'clamp(1.15rem,4vw,4.5rem)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.9rem clamp(1rem,2.5vw,2.2rem)' }}>{identity.links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" style={linkStyle}>{label} ↗</a>)}</div>
          <div className="hidden md:block" style={{ textAlign: 'right' }}><p style={{ ...meta, margin: 0, color: 'rgba(243,238,233,.88)' }}>{identity.role}</p><p style={{ ...meta, margin: '.28rem 0 0' }}>{identity.company} · 2026</p></div>
        </footer>

        <div aria-hidden="true" className="hidden sm:block" style={{ position: 'absolute', zIndex: 29, left: 'clamp(1.15rem,4vw,4.5rem)', bottom: 'clamp(5.1rem,7.5vw,7rem)', opacity: sceneOne * (1 - smooth(.1, .22, progress)) }}><p style={{ ...meta, margin: 0 }}>Scroll to descend</p><div style={{ width: 72, height: 1, marginTop: '.7rem', background: `linear-gradient(90deg,${ACCENT},transparent)` }} /></div>
      </section>
    </main>
  )
}
