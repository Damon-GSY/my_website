import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'

const ASSET = '/assets/optimization-'
const BG = '#0a0a0c'
const INK = '#f4eee9'
const ACCENT = '#d97757'
const MUTED = 'rgba(244,238,233,.64)'
const LINE = 'rgba(244,238,233,.16)'

const profile = {
  name: 'Damon Guo-Siyi',
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

export const clamp = (value: number) => Math.max(0, Math.min(1, value))
export const smoothstep = (from: number, to: number, value: number) => {
  const x = clamp((value - from) / (to - from))
  return x * x * (3 - 2 * x)
}

function useScrollProgress() {
  const target = useRef(0)
  const current = useRef(0)
  const frame = useRef(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const read = () => {
      const range = document.documentElement.scrollHeight - innerHeight
      target.current = range > 0 ? clamp(scrollY / range) : 0
      if (reduced.matches) setProgress(target.current)
    }
    const render = () => {
      if (!reduced.matches) {
        const delta = target.current - current.current
        current.current += delta * 0.1
        if (Math.abs(delta) > 0.0001) setProgress(current.current)
      }
      frame.current = requestAnimationFrame(render)
    }
    read()
    frame.current = requestAnimationFrame(render)
    addEventListener('scroll', read, { passive: true })
    addEventListener('resize', read)
    return () => {
      removeEventListener('scroll', read)
      removeEventListener('resize', read)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  return progress
}

const meta: CSSProperties = {
  color: MUTED,
  fontFamily: "'Imprima', sans-serif",
  fontSize: '.62rem',
  letterSpacing: '.18em',
  lineHeight: 1.4,
  textTransform: 'uppercase',
}

const link: CSSProperties = {
  color: INK,
  fontFamily: "'Imprima', sans-serif",
  fontSize: '.7rem',
  letterSpacing: '.13em',
  textDecoration: 'none',
  textTransform: 'uppercase',
}

function Layer({ name, style }: { name: string; style: CSSProperties }) {
  return (
    <img
      src={`${ASSET}${name}.webp`}
      alt=""
      draggable={false}
      style={{
        position: 'absolute',
        inset: '-7%',
        width: '114%',
        height: '114%',
        objectFit: 'cover',
        userSelect: 'none',
        willChange: 'transform, opacity',
        ...style,
      }}
    />
  )
}

function Metric({ label, value, reveal }: { label: string; value: string; reveal: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '6rem 1fr', gap: '1rem', padding: '.8rem 0', borderTop: `1px solid ${LINE}`, opacity: reveal, transform: `translateY(${(1 - reveal) * 16}px)` }}>
      <span style={meta}>{label}</span>
      <span style={{ color: INK, fontFamily: "'Imprima',sans-serif", fontSize: '.82rem', lineHeight: 1.45 }}>{value}</span>
    </div>
  )
}

export default function App() {
  const progress = useScrollProgress()
  const sceneOne = 1 - smoothstep(.24, .43, progress)
  const sceneTwo = smoothstep(.39, .56, progress) * (1 - smoothstep(.8, .91, progress))
  const finale = smoothstep(.83, .96, progress)
  const intensity = smoothstep(.32, .88, progress)

  const particles = useMemo(() => Array.from({ length: 28 }, (_, index) => ({
    id: index,
    x: 3 + ((index * 31) % 94),
    y: 17 + ((index * 43) % 78),
    depth: .35 + (index % 6) * .12,
    size: 1 + (index % 3) * .55,
  })), [])

  return (
    <main style={{ minHeight: '520svh', background: BG, color: INK }}>
      <section aria-label="Optimization landscape portfolio" style={{ position: 'sticky', top: 0, height: '100svh', minHeight: '38rem', overflow: 'hidden', isolation: 'isolate', background: BG }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <Layer name="landscape" style={{ zIndex: 1, opacity: .86, objectPosition: '53% 55%', transform: `translate3d(${-progress * 3}vw,${5 - progress * 9}vh,0) scale(${1.04 + progress * .38})`, filter: `brightness(${.57 + intensity * .11}) saturate(${.82 + intensity * .2}) contrast(1.16)` }} />
          <Layer name="depth" style={{ zIndex: 2, opacity: .14 + intensity * .2, mixBlendMode: 'screen', transform: `translate3d(${progress * 5}vw,${9 - progress * 15}vh,0) scale(${1.12 + progress * .53})`, filter: 'brightness(.62) contrast(1.2)', maskImage: 'linear-gradient(to bottom,transparent 5%,black 34%,black 84%,transparent)', WebkitMaskImage: 'linear-gradient(to bottom,transparent 5%,black 34%,black 84%,transparent)' }} />
          <Layer name="light" style={{ zIndex: 3, opacity: .08 + intensity * .42, mixBlendMode: 'screen', transform: `translate3d(${5 - progress * 9}vw,${11 - progress * 14}vh,0) scale(${1.06 + progress * .7})`, filter: `brightness(${.76 + intensity * .68}) saturate(1.1)`, maskImage: 'radial-gradient(ellipse at 56% 70%,black 0 44%,transparent 82%)', WebkitMaskImage: 'radial-gradient(ellipse at 56% 70%,black 0 44%,transparent 82%)' }} />
          <Layer name="foreground" style={{ zIndex: 4, opacity: .17 + (1 - progress) * .17, mixBlendMode: 'screen', objectPosition: '43% 68%', transform: `translate3d(${-5 - progress * 8}vw,${18 - progress * 30}vh,0) scale(${1.22 + progress * .82})`, filter: 'brightness(.48) contrast(1.18)', maskImage: 'linear-gradient(to bottom,transparent 6%,transparent 31%,black 70%,black)', WebkitMaskImage: 'linear-gradient(to bottom,transparent 6%,transparent 31%,black 70%,black)' }} />

          {particles.map((particle) => (
            <i key={particle.id} style={{ position: 'absolute', zIndex: 5, left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size, borderRadius: '50%', background: particle.id % 5 === 0 ? '#ffd3bd' : ACCENT, boxShadow: '0 0 8px rgba(217,119,87,.7)', opacity: .16 + intensity * .22, transform: `translate3d(${progress * 100 * particle.depth}px,${-progress * 145 * particle.depth}px,0) scale(${.8 + progress * particle.depth})` }} />
          ))}

          <div style={{ position: 'absolute', zIndex: 6, inset: 0, background: `radial-gradient(ellipse at ${50 + progress * 7}% ${60 - progress * 7}%,transparent 16%,rgba(5,5,7,.12) 48%,rgba(3,3,5,.76) 100%)`, boxShadow: 'inset 0 0 14vw rgba(0,0,0,.78)' }} />
          <div style={{ position: 'absolute', zIndex: 7, inset: 0, opacity: .04, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 160 160%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.8%27 numOctaves=%273%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")', mixBlendMode: 'soft-light' }} />
        </div>

        <header style={{ position: 'absolute', zIndex: 30, inset: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(1.15rem,2.8vw,2.4rem) clamp(1.15rem,4vw,4.5rem)' }}>
          <a href={`mailto:${profile.email}`} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', textDecoration: 'none' }}>
            <span style={{ display: 'grid', width: 30, height: 30, placeItems: 'center', borderRadius: '50%', border: `1px solid ${LINE}`, color: INK, fontFamily: "'Viaoda Libre',serif" }}>D</span>
            <span className="hidden sm:inline" style={{ ...meta, color: INK }}>{profile.name}</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1rem,3vw,3rem)' }}>
            <span className="hidden sm:inline" style={meta}>{profile.location}</span>
            <a href={`mailto:${profile.email}`} style={{ ...link, color: ACCENT }}>Contact ↗</a>
          </div>
        </header>

        <aside aria-label={`Scroll progress ${Math.round(progress * 100)} percent`} style={{ position: 'absolute', zIndex: 28, top: '50%', right: 'clamp(1rem,2.7vw,2.8rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem', transform: 'translateY(-50%)' }}>
          <span style={{ ...meta, writingMode: 'vertical-rl', fontSize: '.54rem' }}>{progress < .55 ? '01 / LANDSCAPE' : '02 / CORE'}</span>
          <span style={{ position: 'relative', width: 1, height: '22vh', minHeight: 110, background: LINE }}><span style={{ position: 'absolute', inset: '0 0 auto', width: 1, height: `${progress * 100}%`, background: ACCENT, boxShadow: '0 0 12px rgba(217,119,87,.7)' }} /></span>
          <span style={{ ...meta, color: INK }}>{String(Math.round(progress * 100)).padStart(2, '0')}</span>
        </aside>

        <article style={{ position: 'absolute', zIndex: 20, inset: 0, display: 'flex', alignItems: 'center', padding: '7rem clamp(3.2rem,7vw,8rem) 6rem clamp(1.15rem,7vw,8rem)', opacity: sceneOne, transform: `translateY(${-progress * 54}px)`, pointerEvents: sceneOne > .15 ? 'auto' : 'none' }}>
          <div className="max-w-[54rem]">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.35rem' }}><span style={{ width: 34, height: 1, background: ACCENT }} /><p style={{ ...meta, margin: 0, color: ACCENT }}>Optimization Landscape · Scene 01</p></div>
            <h1 style={{ margin: 0, maxWidth: '11ch', color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(3.3rem,8.7vw,9rem)', fontWeight: 400, letterSpacing: '-.045em', lineHeight: .86, textShadow: '0 10px 42px rgba(0,0,0,.62)' }}>Map the terrain before the model moves.</h1>
            <p style={{ maxWidth: '34rem', margin: 'clamp(1.4rem,3vw,2.5rem) 0 0', color: 'rgba(244,238,233,.76)', fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.88rem,1.2vw,1.04rem)', lineHeight: 1.7 }}>I design evaluation systems, post-training methods, and production agents—turning uncertain search spaces into decisions that can be inspected.</p>
          </div>
        </article>

        <article style={{ position: 'absolute', zIndex: 21, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '7rem clamp(3.3rem,9vw,10rem) 6.5rem clamp(1.15rem,6vw,6rem)', opacity: sceneTwo, transform: `translateY(${(.58 - progress) * 62}px)`, pointerEvents: sceneTwo > .15 ? 'auto' : 'none' }}>
          <div className="w-full max-w-[31rem] md:w-[40vw]">
            <p style={{ ...meta, margin: '0 0 1.15rem', color: ACCENT }}>Optimization Core · Scene 02</p>
            <h2 style={{ margin: 0, color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(3rem,5.9vw,6.4rem)', fontWeight: 400, letterSpacing: '-.04em', lineHeight: .91, textShadow: '0 9px 40px rgba(0,0,0,.7)' }}>Systems that survive contact with reality.</h2>
            <div style={{ marginTop: 'clamp(1.6rem,3.5vw,2.8rem)', borderBottom: `1px solid ${LINE}` }}>
              <Metric label="Current" value={`${profile.company} · ${profile.role}`} reveal={smoothstep(.43, .52, progress)} />
              <Metric label="Research" value="Agentic RL · Post-training · Multi-turn evaluation" reveal={smoothstep(.47, .56, progress)} />
              <Metric label="Training" value="100+ tool environments · risk-aware decision traces" reveal={smoothstep(.51, .6, progress)} />
              <Metric label="Education" value="NUS Statistics · UNSW Computer Science" reveal={smoothstep(.55, .64, progress)} />
            </div>
          </div>
        </article>

        <article style={{ position: 'absolute', zIndex: 22, inset: 0, display: 'grid', placeItems: 'center', padding: '7rem 3.3rem 5rem 1.2rem', opacity: finale, transform: `scale(${.96 + finale * .04})`, pointerEvents: finale > .4 ? 'auto' : 'none', textAlign: 'center' }}>
          <div>
            <p style={{ ...meta, margin: '0 0 1.2rem', color: ACCENT }}>Loss minimum reached · Δ 0.0001</p>
            <h2 style={{ margin: 0, color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(3.8rem,9vw,9.4rem)', fontWeight: 400, letterSpacing: '-.045em', lineHeight: .86, textShadow: '0 10px 44px rgba(0,0,0,.72)' }}>Continue the search.</h2>
            <p style={{ maxWidth: '32rem', margin: '1.6rem auto 0', color: 'rgba(244,238,233,.76)', fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.86rem,1.15vw,1rem)', lineHeight: 1.65 }}>Open to collaborations on agent systems, evaluation research, and practical AI communication.</p>
            <a href={`mailto:${profile.email}`} style={{ display: 'inline-flex', gap: '1rem', marginTop: '1.8rem', padding: '.9rem 0', borderBottom: `1px solid ${ACCENT}`, color: INK, fontFamily: "'Imprima',sans-serif", textDecoration: 'none' }}>{profile.email} <span style={{ color: ACCENT }}>↗</span></a>
          </div>
        </article>

        <footer style={{ position: 'absolute', zIndex: 30, right: 'clamp(3.2rem,7vw,7rem)', bottom: 'clamp(1.1rem,2.8vw,2.4rem)', left: 'clamp(1.15rem,4vw,4.5rem)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.85rem clamp(1rem,2.5vw,2.2rem)' }}>{profile.links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" style={link}>{label} ↗</a>)}</div>
          <div className="hidden md:block" style={{ textAlign: 'right' }}><p style={{ ...meta, margin: 0, color: 'rgba(244,238,233,.84)' }}>{profile.role}</p><p style={{ ...meta, margin: '.28rem 0 0' }}>{profile.company} · 2026</p></div>
        </footer>
      </section>
    </main>
  )
}
