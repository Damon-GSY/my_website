import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'

const C = {
  black: '#08090a',
  paper: '#eee9e2',
  clay: '#d97757',
  dim: 'rgba(238,233,226,.54)',
  line: 'rgba(238,233,226,.17)',
  faint: 'rgba(238,233,226,.07)',
}

const person = {
  name: 'Damon Guo-Siyi',
  role: 'LLM Algorithm Engineer',
  company: 'Alibaba',
  city: 'Hangzhou',
  email: 'hello@damon.ai',
  channels: [
    ['GH', 'GitHub', 'https://github.com/Damon-GSY'],
    ['IN', 'LinkedIn', 'https://www.linkedin.com/in/shengyue-guan-1a7b3226b/'],
    ['YT', 'YouTube', 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA'],
    ['BI', 'Bilibili', 'https://space.bilibili.com/358541297'],
  ],
} as const

const asset = (name: string) => `/assets/optimization-${name}.webp`
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (a: number, b: number, value: number) => {
  const x = clamp((value - a) / (b - a))
  return x * x * (3 - 2 * x)
}
const windowed = (enter: number, inAt: number, outAt: number, exit: number, value: number) =>
  ease(enter, inAt, value) * (1 - ease(outAt, exit, value))

function useScrollInstrument() {
  const target = useRef(0)
  const rendered = useRef(0)
  const frame = useRef(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const measure = () => {
      const range = document.documentElement.scrollHeight - innerHeight
      target.current = range > 0 ? clamp(scrollY / range) : 0
      if (media.matches) {
        rendered.current = target.current
        setProgress(target.current)
      }
    }
    const draw = () => {
      if (!media.matches) {
        const delta = target.current - rendered.current
        rendered.current += delta * .085
        if (Math.abs(delta) > .00008) setProgress(rendered.current)
      }
      frame.current = requestAnimationFrame(draw)
    }
    measure()
    frame.current = requestAnimationFrame(draw)
    addEventListener('scroll', measure, { passive: true })
    addEventListener('resize', measure)
    return () => {
      removeEventListener('scroll', measure)
      removeEventListener('resize', measure)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  return progress
}

const mono: CSSProperties = {
  fontFamily: "'Imprima', sans-serif",
  fontSize: '.61rem',
  lineHeight: 1.45,
  letterSpacing: '.18em',
  textTransform: 'uppercase',
}

function Raster({ name, style }: { name: string; style: CSSProperties }) {
  return (
    <img
      src={asset(name)}
      alt=""
      draggable={false}
      style={{
        position: 'absolute',
        inset: '-6%',
        width: '112%',
        height: '112%',
        objectFit: 'cover',
        userSelect: 'none',
        willChange: 'transform, opacity',
        ...style,
      }}
    />
  )
}

function Corner({ x, y }: { x: 'left' | 'right'; y: 'top' | 'bottom' }) {
  return (
    <i
      style={{
        position: 'absolute',
        [x]: 0,
        [y]: 0,
        width: 18,
        height: 18,
        borderTop: y === 'top' ? `1px solid ${C.paper}` : undefined,
        borderBottom: y === 'bottom' ? `1px solid ${C.paper}` : undefined,
        borderLeft: x === 'left' ? `1px solid ${C.paper}` : undefined,
        borderRight: x === 'right' ? `1px solid ${C.paper}` : undefined,
        opacity: .45,
      }}
    />
  )
}

function Signal({ index, label, value, progress }: { index: string; label: string; value: string; progress: number }) {
  return (
    <div className="grid grid-cols-[2rem_minmax(0,1fr)] md:grid-cols-[2.2rem_7rem_minmax(0,1fr)]" style={{ gap: '.35rem .7rem', padding: '.72rem 0', borderTop: `1px solid ${C.line}`, color: C.paper, opacity: progress, transform: `translateX(${(1 - progress) * -18}px)` }}>
      <span style={{ ...mono, color: C.clay }}>{index}</span>
      <span style={{ ...mono, color: C.dim }}>{label}</span>
      <span className="col-start-2 md:col-start-auto" style={{ fontFamily: "'Imprima',sans-serif", fontSize: '.8rem', lineHeight: 1.45 }}>{value}</span>
    </div>
  )
}

function Curve({ progress }: { progress: number }) {
  const offset = 420 - progress * 420
  return (
    <svg viewBox="0 0 520 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }} aria-hidden="true">
      <path d="M0 18 C82 18 96 87 173 72 C252 58 283 105 357 93 C414 83 444 102 520 108" fill="none" stroke="rgba(238,233,226,.13)" strokeWidth="1" />
      <path d="M0 18 C82 18 96 87 173 72 C252 58 283 105 357 93 C414 83 444 102 520 108" fill="none" stroke={C.clay} strokeWidth="1.25" strokeDasharray="420" strokeDashoffset={offset} vectorEffect="non-scaling-stroke" />
      <circle cx={520 * progress} cy={18 + 90 * progress} r="2.5" fill={C.clay} style={{ filter: 'drop-shadow(0 0 6px rgba(217,119,87,.8))' }} />
    </svg>
  )
}

export default function App() {
  const p = useScrollInstrument()
  const entry = 1 - ease(.17, .3, p)
  const fieldNotes = windowed(.17, .27, .39, .47, p)
  const lock = windowed(.43, .55, .76, .84, p)
  const contact = ease(.81, .95, p)
  const sceneTwo = ease(.43, .7, p)
  const lightGain = ease(.35, .82, p)

  const dust = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: 4 + ((i * 37) % 91),
    y: 23 + ((i * 53) % 70),
    z: .28 + (i % 7) * .1,
    s: .8 + (i % 3) * .55,
  })), [])

  return (
    <main style={{ minHeight: '640svh', background: C.black, color: C.paper }}>
      <section aria-label="Computational landscape instrument" style={{ position: 'sticky', top: 0, height: '100svh', minHeight: '38rem', overflow: 'hidden', isolation: 'isolate', background: C.black }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <Raster name="landscape" style={{ zIndex: 1, opacity: .87, objectPosition: `${52 + p * 4}% ${58 - p * 4}%`, filter: 'brightness(.54) saturate(.75) contrast(1.22)', transform: `translate3d(${-2 - p * 3}vw,${9 - p * 13}vh,0) scale(${1.08 + p * .39})` }} />
          <Raster name="depth" style={{ zIndex: 2, opacity: .12 + sceneTwo * .25, mixBlendMode: 'screen', objectPosition: '51% 62%', filter: 'brightness(.52) contrast(1.32)', transform: `translate3d(${p * 6}vw,${14 - p * 22}vh,0) scale(${1.17 + p * .58})`, maskImage: 'linear-gradient(180deg,transparent 8%,black 40%,black 88%,transparent)', WebkitMaskImage: 'linear-gradient(180deg,transparent 8%,black 40%,black 88%,transparent)' }} />
          <Raster name="light" style={{ zIndex: 3, opacity: .04 + lightGain * .55, mixBlendMode: 'screen', objectPosition: '56% 66%', filter: `brightness(${.72 + lightGain * .92}) saturate(1.08)`, transform: `translate3d(${6 - p * 11}vw,${17 - p * 21}vh,0) scale(${1.08 + p * .75})`, maskImage: 'radial-gradient(ellipse at 55% 70%,black 0 41%,transparent 79%)', WebkitMaskImage: 'radial-gradient(ellipse at 55% 70%,black 0 41%,transparent 79%)' }} />
          <Raster name="foreground" style={{ zIndex: 4, opacity: .32 - p * .13, mixBlendMode: 'screen', objectPosition: '43% 70%', filter: 'brightness(.42) contrast(1.28)', transform: `translate3d(${-8 - p * 11}vw,${25 - p * 38}vh,0) scale(${1.34 + p * .96})`, maskImage: 'radial-gradient(ellipse at 51% 57%,transparent 0 20%,rgba(0,0,0,.38) 36%,black 71%)', WebkitMaskImage: 'radial-gradient(ellipse at 51% 57%,transparent 0 20%,rgba(0,0,0,.38) 36%,black 71%)' }} />

          {dust.map((d) => (
            <i key={d.id} style={{ position: 'absolute', zIndex: 5, left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, borderRadius: '50%', background: d.id % 4 === 0 ? '#ffd8c4' : C.clay, opacity: .12 + lightGain * .28, boxShadow: '0 0 7px rgba(217,119,87,.72)', transform: `translate3d(${p * 125 * d.z}px,${-p * 175 * d.z}px,0) scale(${.75 + p * d.z})` }} />
          ))}

          <div style={{ position: 'absolute', zIndex: 6, inset: 0, background: `linear-gradient(90deg,rgba(8,9,10,${.8 - p * .17}) 0%,rgba(8,9,10,.16) 46%,rgba(8,9,10,.43) 100%),linear-gradient(180deg,rgba(8,9,10,.9),transparent 36%,rgba(8,9,10,.58))` }} />
          <div style={{ position: 'absolute', zIndex: 7, inset: 0, boxShadow: 'inset 0 0 15vw rgba(0,0,0,.8)', background: 'radial-gradient(ellipse at 55% 58%,transparent 16%,rgba(8,9,10,.08) 54%,rgba(8,9,10,.6))' }} />
        </div>

        <header style={{ position: 'absolute', zIndex: 30, top: 0, right: 0, left: 0, display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '1.3rem', padding: 'clamp(1.1rem,2.6vw,2.1rem) clamp(1.1rem,3vw,3rem)' }}>
          <a href={`mailto:${person.email}`} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', color: C.paper, textDecoration: 'none' }}>
            <span style={{ display: 'grid', width: 27, height: 27, placeItems: 'center', border: `1px solid ${C.line}`, fontFamily: "'Viaoda Libre',serif", fontSize: '.9rem' }}>D</span>
            <span className="hidden sm:inline" style={{ ...mono, color: C.paper }}>{person.name}</span>
          </a>
          <span style={{ height: 1, background: C.line }} />
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span className="hidden md:inline" style={{ ...mono, color: C.dim }}>{person.city} / 30.27°N</span>
            <span style={{ ...mono, color: C.clay }}>OBS–{String(Math.round(p * 999)).padStart(3, '0')}</span>
          </div>
        </header>

        <div aria-hidden="true" style={{ position: 'absolute', zIndex: 18, inset: 'clamp(4.8rem,8vw,7rem) clamp(1.1rem,3vw,3rem) clamp(4.4rem,7vw,6.5rem)' }}>
          <Corner x="left" y="top" /><Corner x="right" y="top" /><Corner x="left" y="bottom" /><Corner x="right" y="bottom" />
          <span style={{ position: 'absolute', top: '50%', left: '50%', width: 52, height: 52, border: `1px solid rgba(217,119,87,${.14 + sceneTwo * .42})`, borderRadius: '50%', transform: `translate(-50%,-50%) scale(${1.4 - sceneTwo * .4})` }} />
          <span style={{ position: 'absolute', top: '50%', left: '50%', width: 7, height: 7, border: `1px solid ${C.clay}`, transform: 'translate(-50%,-50%) rotate(45deg)', opacity: sceneTwo }} />
          <span style={{ position: 'absolute', top: '50%', left: 'calc(50% - 42px)', width: 26, height: 1, background: C.clay, opacity: sceneTwo }} />
          <span style={{ position: 'absolute', top: '50%', left: 'calc(50% + 16px)', width: 26, height: 1, background: C.clay, opacity: sceneTwo }} />
        </div>

        <article style={{ position: 'absolute', zIndex: 20, inset: 0, display: 'flex', alignItems: 'flex-end', padding: '6rem clamp(3.2rem,8vw,9rem) clamp(7rem,15vh,10rem) clamp(1.15rem,7vw,8rem)', opacity: entry, transform: `translateY(${p * -45}px)`, pointerEvents: entry > .2 ? 'auto' : 'none' }}>
          <div style={{ maxWidth: '68rem' }}>
            <p style={{ ...mono, margin: '0 0 1rem', color: C.clay }}>Field 01 / Unconstrained Search</p>
            <h1 style={{ margin: 0, maxWidth: '11ch', color: C.paper, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(4.1rem,10.6vw,11.5rem)', fontWeight: 400, letterSpacing: '-.055em', lineHeight: .76, textShadow: '0 12px 50px rgba(0,0,0,.68)' }}>Intelligence is a surface.</h1>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.4rem', marginTop: '1.6rem' }}>
              <span style={{ width: 54, height: 1, marginTop: '.7rem', background: C.clay }} />
              <p style={{ maxWidth: '31rem', margin: 0, color: 'rgba(238,233,226,.72)', fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.86rem,1.15vw,1rem)', lineHeight: 1.7 }}>I study how agents plan, use tools, remember, and recover—then turn those traces into systems that can operate in the real world.</p>
            </div>
          </div>
        </article>

        <article style={{ position: 'absolute', zIndex: 21, inset: 0, display: 'flex', alignItems: 'center', padding: '6.5rem clamp(3.2rem,8vw,9rem) 6rem clamp(1.15rem,7vw,8rem)', opacity: fieldNotes, transform: `translateX(${(1 - fieldNotes) * -32}px)`, pointerEvents: fieldNotes > .2 ? 'auto' : 'none' }}>
          <div className="w-full max-w-[35rem] md:w-[44vw]">
            <p style={{ ...mono, margin: '0 0 1.1rem', color: C.clay }}>Observed Variables / 04</p>
            <h2 style={{ margin: '0 0 2rem', color: C.paper, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(3.1rem,6.3vw,6.8rem)', fontWeight: 400, letterSpacing: '-.04em', lineHeight: .86 }}>Measure the path, not only the answer.</h2>
            <Signal index="01" label="Planning" value="Task decomposition and cross-turn replanning" progress={ease(.2,.29,p)} />
            <Signal index="02" label="Tool use" value="Execution across dynamic pools of 100+ tools" progress={ease(.23,.32,p)} />
            <Signal index="03" label="Memory" value="Session, persistent, and retrieval horizons" progress={ease(.26,.35,p)} />
            <Signal index="04" label="Evaluation" value="Intermediate-step and dependency-aware judgment" progress={ease(.29,.38,p)} />
          </div>
        </article>

        <article className="grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(18rem,31rem)]" style={{ position: 'absolute', zIndex: 22, inset: 0, display: 'grid', alignItems: 'center', gap: 'clamp(2rem,8vw,9rem)', padding: '6.5rem clamp(3.5rem,8vw,8.5rem) 6.5rem clamp(1.15rem,7vw,8rem)', opacity: lock, pointerEvents: lock > .2 ? 'auto' : 'none' }}>
          <div className="hidden md:block" style={{ alignSelf: 'end', paddingBottom: '3rem' }}>
            <p style={{ ...mono, margin: 0, color: C.dim }}>Current position</p>
            <p style={{ margin: '.55rem 0 0', fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(2rem,3.8vw,4rem)', lineHeight: 1 }}>{person.company}</p>
            <p style={{ ...mono, margin: '.8rem 0 0', color: C.clay }}>{person.role}</p>
          </div>
          <div>
            <p style={{ ...mono, margin: '0 0 1rem', color: C.clay }}>Field 02 / Loss Minimum</p>
            <h2 style={{ margin: 0, color: C.paper, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(4rem,8.3vw,9rem)', fontWeight: 400, letterSpacing: '-.055em', lineHeight: .77, textShadow: '0 12px 48px rgba(0,0,0,.7)' }}>The minimum is operational.</h2>
            <div style={{ marginTop: '2rem', borderBottom: `1px solid ${C.line}` }}>
              <Signal index="A" label="Impact" value="90% less manual ticket handling" progress={ease(.5,.6,p)} />
              <Signal index="B" label="Control" value="95% fewer manual interventions" progress={ease(.54,.64,p)} />
              <Signal index="C" label="Latency" value="Sub-second exception handoff across 12 scenarios" progress={ease(.58,.68,p)} />
              <Signal index="D" label="Training" value="Continual pretraining · SFT · agentic RL" progress={ease(.62,.72,p)} />
            </div>
          </div>
        </article>

        <article style={{ position: 'absolute', zIndex: 24, inset: 0, display: 'grid', placeItems: 'center', padding: '6rem 2.5rem', opacity: contact, transform: `scale(${.95 + contact * .05})`, pointerEvents: contact > .4 ? 'auto' : 'none', textAlign: 'center' }}>
          <div>
            <p style={{ ...mono, margin: '0 0 1rem', color: C.clay }}>Convergence confirmed / Δ 0.0001</p>
            <h2 style={{ margin: 0, color: C.paper, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(4.2rem,10vw,10.5rem)', fontWeight: 400, letterSpacing: '-.055em', lineHeight: .78 }}>Run the next experiment.</h2>
            <a href={`mailto:${person.email}`} style={{ display: 'inline-flex', gap: '1rem', marginTop: '2rem', padding: '.9rem 0', borderBottom: `1px solid ${C.clay}`, color: C.paper, fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.9rem,1.3vw,1.05rem)', letterSpacing: '.06em', textDecoration: 'none' }}>{person.email} <span style={{ color: C.clay }}>↗</span></a>
          </div>
        </article>

        <footer style={{ position: 'absolute', zIndex: 31, right: 'clamp(1.1rem,3vw,3rem)', bottom: 'clamp(1rem,2.2vw,1.9rem)', left: 'clamp(1.1rem,3vw,3rem)', display: 'grid', gridTemplateColumns: 'auto minmax(8rem,1fr) auto', alignItems: 'end', gap: 'clamp(1rem,3vw,3rem)' }}>
          <nav aria-label="Social links" style={{ display: 'flex', gap: '1rem' }}>
            {person.channels.map(([short, label, href]) => <a key={short} href={href} target="_blank" rel="noreferrer" aria-label={label} style={{ ...mono, color: C.paper, textDecoration: 'none' }}>{short}</a>)}
          </nav>
          <div style={{ height: 38 }}><Curve progress={p} /></div>
          <span style={{ ...mono, color: C.clay }}>{String(Math.round(p * 100)).padStart(2,'0')}%</span>
        </footer>
      </section>
    </main>
  )
}
