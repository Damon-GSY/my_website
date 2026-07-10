import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { clamp, smooth, band } from './landscape/math'
const foregroundUrl = '/assets/optimization-foreground.webp'
const landscapeUrl = '/assets/optimization-landscape.webp'
const depthUrl = '/assets/optimization-depth.webp'
const lightUrl = '/assets/optimization-light.webp'

const ACCENT = '#d97757'
const INK = '#f3eee9'
const MUTED = 'rgba(243,238,233,.52)'
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
        current.current += delta * 0.075
        if (Math.abs(delta) > 0.00008) setProgress(current.current)
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

function Layer({ src, style }: { src: string; style: CSSProperties }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        position: 'absolute',
        inset: '-5%',
        width: '110%',
        height: '110%',
        objectFit: 'cover',
        userSelect: 'none',
        willChange: 'transform, opacity, filter',
        ...style,
      }}
    />
  )
}

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
  const particles = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    id: i,
    x: 4 + ((i * 29) % 93),
    y: 18 + ((i * 47) % 76),
    size: 1 + (i % 3) * 0.55,
    depth: 0.3 + (i % 7) * 0.11,
    alpha: 0.15 + (i % 5) * 0.055,
  })), [])

  const sceneOne = 1 - smooth(0.1, 0.17, progress)
  const research = band(0.12, 0.18, 0.25, 0.31, progress)
  const production = band(0.27, 0.34, 0.41, 0.47, progress)
  const papers = band(0.43, 0.5, 0.6, 0.66, progress)
  const trajectory = band(0.63, 0.7, 0.78, 0.84, progress)
  const contact = smooth(0.82, 0.93, progress)
  const core = smooth(0.52, 0.94, progress)
  const chapter = progress < 0.63 ? '01 / LANDSCAPE' : progress < 0.84 ? '02 / CORE' : '02 / MINIMUM'

  return (
    <main style={{ minHeight: '520svh', background: '#0a0a0c', color: INK }}>
      <a href="#experience" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]" style={{ ...linkStyle, padding: '.7rem 1rem', background: '#0a0a0c', border: `1px solid ${ACCENT}` }}>
        Skip to experience
      </a>

      <section id="experience" aria-label="Optimization landscape experience" style={{ position: 'sticky', top: 0, height: '100svh', minHeight: '38rem', overflow: 'hidden', isolation: 'isolate', background: '#0a0a0c' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <Layer src={landscapeUrl} style={{ zIndex: 1, opacity: .88, transform: `translate3d(${-progress * 3.5}vw,${5 - progress * 10}vh,0) scale(${1.04 + progress * .38})`, filter: `brightness(${.56 + core * .16}) saturate(${.78 + core * .25}) contrast(1.18)`, objectPosition: '52% 54%' }} />
          <div style={{ position: 'absolute', zIndex: 2, inset: 0, background: 'linear-gradient(180deg,rgba(3,4,4,.94),rgba(3,4,4,.34) 39%,rgba(3,4,4,.04) 72%,rgba(3,4,4,.44))' }} />
          <Layer src={depthUrl} style={{ zIndex: 3, opacity: .2 + core * .2, transform: `translate3d(${progress * 5.5}vw,${8 - progress * 15}vh,0) scale(${1.11 + progress * .55})`, mixBlendMode: 'screen', filter: `blur(${1.6 - core * .9}px) brightness(${.54 + core * .2})`, maskImage: 'linear-gradient(to bottom,transparent 5%,black 35%,black 82%,transparent)', WebkitMaskImage: 'linear-gradient(to bottom,transparent 5%,black 35%,black 82%,transparent)' }} />
          <Layer src={lightUrl} style={{ zIndex: 4, opacity: .07 + core * .42, transform: `translate3d(${5 - progress * 10}vw,${12 - progress * 14}vh,0) scale(${1.05 + progress * .72})`, mixBlendMode: 'screen', filter: `blur(${2.2 + core * .4}px) brightness(${.8 + core * .75}) saturate(1.12)`, maskImage: 'radial-gradient(ellipse at 56% 70%,black 0%,black 42%,transparent 82%)', WebkitMaskImage: 'radial-gradient(ellipse at 56% 70%,black 0%,black 42%,transparent 82%)' }} />
          <Layer src={foregroundUrl} style={{ zIndex: 5, opacity: .17 + (1 - progress) * .15, transform: `translate3d(${-5 - progress * 8}vw,${18 - progress * 30}vh,0) scale(${1.22 + progress * .84})`, mixBlendMode: 'screen', filter: `blur(${.2 + progress * 1.7}px) brightness(.48) contrast(1.16)`, maskImage: 'linear-gradient(to bottom,transparent 8%,transparent 32%,black 71%,black)', WebkitMaskImage: 'linear-gradient(to bottom,transparent 8%,transparent 32%,black 71%,black)', objectPosition: '43% 68%' }} />
          <div style={{ position: 'absolute', zIndex: 6, inset: 0, opacity: .13 + core * .12, backgroundImage: 'repeating-linear-gradient(106deg,transparent 0 46px,rgba(217,119,87,.16) 47px,transparent 48px)', transform: `translateX(${-progress * 42}px)`, maskImage: 'linear-gradient(to bottom,transparent,black 58%,transparent)', WebkitMaskImage: 'linear-gradient(to bottom,transparent,black 58%,transparent)' }} />
          {particles.map((p) => (
            <i key={p.id} style={{ position: 'absolute', zIndex: 7, left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: p.id % 4 === 0 ? '#ffd5bf' : ACCENT, boxShadow: `0 0 7px ${p.id % 4 === 0 ? 'rgba(255,205,180,.68)' : 'rgba(217,119,87,.55)'}`, opacity: p.alpha * (.72 + core), transform: `translate3d(${progress * 110 * p.depth}px,${-progress * 150 * p.depth}px,0) scale(${.8 + progress * p.depth})` }} />
          ))}
          <div style={{ position: 'absolute', zIndex: 8, inset: 0, background: `radial-gradient(ellipse at ${50 + progress * 8}% ${61 - progress * 8}%,transparent ${16 + progress * 7}%,rgba(6,6,8,${.08 + progress * .1}) 48%,rgba(4,4,6,.72))`, boxShadow: 'inset 0 0 14vw rgba(0,0,0,.75)' }} />
          <div style={{ position: 'absolute', zIndex: 9, inset: 0, opacity: .045, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 180 180%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.82%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%27.55%27/%3E%3C/svg%3E")', mixBlendMode: 'soft-light' }} />
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
            <p style={{ maxWidth: '34rem', margin: 'clamp(1.4rem,3vw,2.5rem) 0 0', color: 'rgba(243,238,233,.68)', fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.88rem,1.15vw,1.03rem)', lineHeight: 1.7 }}>I build evaluation systems, post-training methods, and production agents—mapping the terrain before asking a model to move through it.</p>
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
              <DataRow label="Current" value={`${identity.company} · ${identity.role}`} at={.28} progress={progress} />
              <DataRow label="Tool pool" value="100+ dynamically registered tools" at={.3} progress={progress} />
              <DataRow label="Impact" value="90% less manual ticket handling · 95% fewer interventions" at={.32} progress={progress} />
              <DataRow label="Handoff" value="Under one second across 12 supply-chain scenarios" at={.34} progress={progress} />
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
                <div key={title} style={{ minHeight: '6.4rem', padding: '1rem', borderRight: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, background: 'rgba(7,7,9,.22)', backdropFilter: 'blur(3px)' }}>
                  <p style={{ ...meta, margin: 0, color: 'rgba(243,238,233,.82)' }}>{title}</p>
                  <p style={{ margin: '.65rem 0 0', color: 'rgba(243,238,233,.61)', fontFamily: "'Imprima',sans-serif", fontSize: '.76rem', lineHeight: 1.5 }}>{copy}</p>
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
            <div style={{ marginTop: '1.4rem', padding: '.9rem 1rem', border: `1px solid ${LINE}`, background: 'rgba(7,7,9,.28)' }}>
              <p style={{ ...meta, margin: 0, color: ACCENT }}>Field notes · forthcoming</p>
              <p style={{ margin: '.5rem 0 0', color: 'rgba(243,238,233,.55)', fontFamily: "'Imprima',sans-serif", fontSize: '.78rem', lineHeight: 1.55 }}>A reserved slot for ongoing writing on agents, evaluation, and post-training — publishing soon.</p>
            </div>
          </div>
        </article>

        <article style={{ position: 'absolute', zIndex: 23, inset: 0, display: 'grid', placeItems: 'center', padding: '7rem 3.2rem 5rem 1.2rem', opacity: contact, transform: `scale(${.96 + contact * .04})`, pointerEvents: contact > .45 ? 'auto' : 'none', textAlign: 'center' }}>
          <div style={{ maxWidth: '59rem' }}>
            <p style={{ ...meta, margin: '0 0 1.25rem', color: ACCENT }}>Loss minimum reached · Δ 0.0001</p>
            <h2 style={{ margin: 0, color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(3.7rem,9vw,9.4rem)', fontWeight: 400, letterSpacing: '-.045em', lineHeight: .86, textShadow: '0 10px 42px rgba(0,0,0,.7)' }}>Continue the search.</h2>
            <p style={{ margin: '1.7rem auto 0', maxWidth: '33rem', color: 'rgba(243,238,233,.68)', fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.86rem,1.2vw,1rem)', lineHeight: 1.65 }}>Open to collaborations on agent systems, evaluation research, and practical AI communication.</p>
            <a href={`mailto:${identity.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2rem', marginTop: '2rem', padding: '.95rem 0', borderBottom: `1px solid ${ACCENT}`, color: INK, fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.88rem,1.5vw,1.1rem)', letterSpacing: '.06em', textDecoration: 'none' }}>{identity.email} <span style={{ color: ACCENT }}>↗</span></a>
          </div>
        </article>

        <footer style={{ position: 'absolute', zIndex: 30, right: 'clamp(3.2rem,7vw,7rem)', bottom: 'clamp(1.15rem,2.8vw,2.5rem)', left: 'clamp(1.15rem,4vw,4.5rem)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.9rem clamp(1rem,2.5vw,2.2rem)' }}>{identity.links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" style={linkStyle}>{label} ↗</a>)}</div>
          <div className="hidden md:block" style={{ textAlign: 'right' }}><p style={{ ...meta, margin: 0, color: 'rgba(243,238,233,.72)' }}>{identity.role}</p><p style={{ ...meta, margin: '.28rem 0 0' }}>{identity.company} · 2026</p></div>
        </footer>

        <div aria-hidden="true" className="hidden sm:block" style={{ position: 'absolute', zIndex: 29, left: 'clamp(1.15rem,4vw,4.5rem)', bottom: 'clamp(5.1rem,7.5vw,7rem)', opacity: sceneOne * (1 - smooth(.1, .22, progress)) }}><p style={{ ...meta, margin: 0 }}>Scroll to descend</p><div style={{ width: 72, height: 1, marginTop: '.7rem', background: `linear-gradient(90deg,${ACCENT},transparent)` }} /></div>
      </section>
    </main>
  )
}
