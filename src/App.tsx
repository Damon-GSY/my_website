import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { clamp, smooth, band } from './landscape/math'
import { createLandscapeRenderer } from './landscape/renderer'
import { AgentConsole, EncryptedText, MagneticButton, NumberTicker, Signature, useReducedMotionPreference } from './landscape/effects'
const foregroundUrl = '/assets/optimization-foreground.webp'
const landscapeUrl = '/assets/optimization-landscape.webp'
const depthUrl = '/assets/optimization-depth.webp'
const lightUrl = '/assets/optimization-light.webp'

const ACCENT = '#d97757'
const INK = '#f3eee9'
const MUTED = 'rgba(243,238,233,.78)'
const LINE = 'rgba(243,238,233,.16)'

const identity = {
  role: 'LLM Algorithm Engineer',
  company: 'Alibaba',
  location: 'Hangzhou, China',
  email: 'hello@damon.ai',
  links: [
    ['GitHub', 'https://github.com/Damon-GSY'],
    ['YouTube', 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA'],
    ['Bilibili', 'https://space.bilibili.com/358541297'],
  ],
} as const

// clamp / smooth / band are imported from ./landscape/math (unit-tested)

function useScrollProgress(reducedMotion: boolean) {
  const target = useRef(0)
  const frame = useRef(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const commit = () => {
      frame.current = 0
      setProgress(target.current)
    }
    const read = () => {
      const range = document.documentElement.scrollHeight - window.innerHeight
      target.current = range > 0 ? clamp(window.scrollY / range) : 0
      if (reducedMotion) commit()
      else if (!frame.current) frame.current = requestAnimationFrame(commit)
    }
    read()
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    return () => {
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
      cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [reducedMotion])
  return clamp(progress)
}

const meta: CSSProperties = {
  color: MUTED,
  fontFamily: "'Imprima', sans-serif",
  fontSize: '.68rem',
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
  const reducedMotion = useReducedMotionPreference()
  const progress = useScrollProgress(reducedMotion)
  const variation = (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('v') === '2') ? 2 : 1
  const enc = (text: string, always = false) => (variation === 1 || always) ? <EncryptedText text={text} /> : text
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!bgCanvasRef.current) return
    const r = createLandscapeRenderer(
      bgCanvasRef.current,
      { landscape: landscapeUrl, depth: depthUrl, light: lightUrl, foreground: foregroundUrl },
      { motionEnabled: !reducedMotion },
    )
    return () => r.dispose()
  }, [reducedMotion])
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

  const navDots = [
    { label: 'Hero', center: 0.05 },
    { label: 'Work', center: 0.20 },
    { label: 'Projects', center: 0.35 },
    { label: 'Research', center: 0.52 },
    { label: 'Path', center: 0.72 },
    { label: 'Contact', center: 0.90 },
  ]
  const activeIdx = navDots.reduce((bi, s, i, arr) => Math.abs(progress - s.center) < Math.abs(progress - arr[bi].center) ? i : bi, 0)
  const isActive = (index: number) => activeIdx === index
  const visibleOpacity = (index: number, opacity: number) => reducedMotion ? Number(isActive(index)) : opacity

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
          {!reducedMotion && particles.map((p) => (
            <i key={p.id} style={{ position: 'absolute', zIndex: 7, left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: p.id % 4 === 0 ? '#ffd5bf' : ACCENT, boxShadow: `0 0 7px ${p.id % 4 === 0 ? 'rgba(255,205,180,.68)' : 'rgba(217,119,87,.55)'}`, opacity: p.alpha * (.72 + core), transform: `translate3d(${progress * 110 * p.depth}px,${-progress * 150 * p.depth}px,0) scale(${.8 + progress * p.depth})` }} />
          ))}
          <div style={{ position: 'absolute', zIndex: 8, inset: 0, background: 'radial-gradient(ellipse at 54% 55%,transparent 20%,rgba(6,6,8,.14) 48%,rgba(4,4,6,.72))', boxShadow: 'inset 0 0 14vw rgba(0,0,0,.75)' }} />
          {/* perf: dropped noise grain (fullscreen soft-light blend every frame) */}
        </div>

        <header style={{ position: 'absolute', zIndex: 30, inset: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(1.15rem,2.8vw,2.4rem) clamp(1.15rem,4vw,4.5rem)' }}>
          <a href={`mailto:${identity.email}`} style={{ display: 'flex', alignItems: 'center', gap: '.8rem', textDecoration: 'none' }}>
            <span style={{ display: 'grid', width: 29, height: 29, placeItems: 'center', border: `1px solid ${LINE}`, borderRadius: '50%', color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: '.96rem' }}>D</span>
            <span style={{ ...meta, color: INK }}>Damon</span><span style={{ ...meta, margin: '0 -.3rem' }}>·</span><span style={meta}>AI Engineer · Alibaba</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1rem,3vw,3rem)' }}>
            <span className="hidden sm:inline" style={meta}>{identity.location}</span>
            <a href={`mailto:${identity.email}`} style={{ ...linkStyle, color: ACCENT }}>Contact ↗</a>
          </div>
        </header>

        <aside aria-label="Section navigation" style={{ position: 'absolute', zIndex: 40, top: '50%', right: 'clamp(1rem,2.8vw,2.8rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.8rem', transform: 'translateY(-50%)' }}>
          <span style={{ ...meta, color: INK, fontVariantNumeric: 'tabular-nums' }}>{String(Math.round(progress * 100)).padStart(2, '0')}</span>
          <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            {navDots.map((sec, i) => (
              <button type="button" key={sec.label} onClick={() => window.scrollTo({ top: Math.round(sec.center * (document.documentElement.scrollHeight - window.innerHeight)), behavior: reducedMotion ? 'auto' : 'smooth' })} aria-label={`Jump to ${sec.label}`} aria-current={i === activeIdx ? 'step' : undefined} className="group" style={{ position: 'relative', display: 'grid', width: 44, height: 44, placeItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <span className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" style={{ ...meta, position: 'absolute', right: '100%', marginRight: '.25rem', whiteSpace: 'nowrap', fontSize: '.65rem', color: i === activeIdx ? ACCENT : MUTED, transition: reducedMotion ? 'none' : 'opacity .2s' }}>{sec.label}</span>
                <span style={{ width: i === activeIdx ? 10 : 6, height: i === activeIdx ? 10 : 6, borderRadius: '50%', background: i === activeIdx ? ACCENT : 'rgba(243,238,233,.3)', transition: 'all .2s' }} />
              </button>
            ))}
          </nav>
        </aside>

        <article aria-hidden={!isActive(0)} inert={!isActive(0)} style={{ position: 'absolute', zIndex: 20, inset: 0, display: 'flex', alignItems: 'flex-start', paddingTop: 'clamp(7rem,14vh,10rem)', paddingInline: 'clamp(1.15rem,7vw,8rem)', opacity: visibleOpacity(0, sceneOne), transform: reducedMotion ? 'none' : `translateY(${-progress * 58}px)`, pointerEvents: isActive(0) ? 'auto' : 'none' }}>
          <div className="left-4 right-4 md:left-auto md:right-[clamp(1.15rem,4vw,4.5rem)]" style={{ position: 'absolute', bottom: 'clamp(5rem,8vh,7rem)', zIndex: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1.4rem 2.6rem', paddingRight: '0' }}>
            {[{v:4,s:'papers'},{v:100,suf:'+',s:'tools'},{v:90,suf:'%',s:'less manual'},{v:1,pre:'<',suf:'s',s:'handoff'}].map((st) => (
              <div key={st.s}>
                <p style={{ ...meta, margin: 0, color: ACCENT }}>{st.s}</p>
                <p style={{ margin: '.3rem 0 0', color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(1.6rem,3vw,2.4rem)', lineHeight: 1 }}>
                  {variation === 1 ? <NumberTicker value={st.v} prefix={st.pre || ''} suffix={st.suf || ''} /> : <span>{st.pre || ''}{st.v}{st.suf || ''}</span>}
                </p>
              </div>
            ))}
          </div>
          <div className="max-w-[64rem]">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.4rem' }}><span style={{ width: 34, height: 1, background: ACCENT }} /><p style={{ ...meta, margin: 0, color: ACCENT }}>Optimization Landscape · 01</p></div>
            <h1 className="landscape-gradient-title" style={{ margin: 0, maxWidth: '12ch', fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(3.3rem,8.8vw,9.2rem)', fontWeight: 400, letterSpacing: '-.045em', lineHeight: .84 }}>I map the terrain.</h1>
            <p style={{ maxWidth: '34rem', margin: 'clamp(1.4rem,3vw,2.5rem) 0 0', color: 'rgba(243,238,233,.86)', fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.88rem,1.15vw,1.03rem)', lineHeight: 1.7 }}>I'm Damon. I orchestrate AI agents to explore problems that resist single-pass solutions — mapping the terrain before any model moves through it.</p>
          </div>
          <div className="hidden md:block" style={{ position: 'absolute', right: 'clamp(4.5rem,9vw,8rem)', top: '52%', transform: 'translateY(-50%)', zIndex: 20, pointerEvents: 'none' }}><AgentConsole /></div>
        </article>

        <article className="landscape-split" aria-hidden={!isActive(1)} inert={!isActive(1)} style={{ position: 'absolute', zIndex: 21, inset: 0, display: 'grid', alignItems: 'center', opacity: visibleOpacity(1, research), transform: reducedMotion ? 'none' : `translateY(${(.2 - progress) * 70}px)`, pointerEvents: isActive(1) ? 'auto' : 'none' }}>
            <div>
            <p style={{ ...meta, margin: '0 0 1.2rem', color: ACCENT }}>Work · 02</p>
            <h2 style={{ margin: 0, color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(3rem,6.2vw,6.8rem)', fontWeight: 400, letterSpacing: '-.035em', lineHeight: .9, textShadow: '0 8px 38px rgba(0,0,0,.66)' }}>{enc('Four axes. One agent.')}</h2>
            </div>
            <div style={{ borderBottom: `1px solid ${LINE}` }}>
              <DataRow label="01" value="Planning · break complex requests into steps and revise the plan as context changes" at={.13} progress={progress} />
              <DataRow label="02" value="Tool use · choose and execute the right action across 100+ tools" at={.15} progress={progress} />
              <DataRow label="03" value="Memory · carry the right context across a session and over time" at={.17} progress={progress} />
              <DataRow label="04" value="Evaluation · check each important step, not only the final answer" at={.19} progress={progress} />
            </div>
        </article>

        <article className="landscape-split" aria-hidden={!isActive(2)} inert={!isActive(2)} style={{ position: 'absolute', zIndex: 21, inset: 0, display: 'grid', alignItems: 'center', opacity: visibleOpacity(2, production), transform: reducedMotion ? 'none' : `translateY(${(.36 - progress) * 70}px)`, pointerEvents: isActive(2) ? 'auto' : 'none' }}>
            <div>
            <p style={{ ...meta, margin: '0 0 1.2rem', color: ACCENT }}>Projects · 03</p>
            <h2 style={{ margin: 0, color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(2.9rem,5.8vw,6.4rem)', fontWeight: 400, letterSpacing: '-.035em', lineHeight: .91, textShadow: '0 8px 38px rgba(0,0,0,.66)' }}>{enc('Systems that survive contact with reality.')}</h2>
            </div>
            <div style={{ borderBottom: `1px solid ${LINE}` }}>
              <DataRow label="Safe Automation" value="Set clear checkpoints for risky decisions across 12 supply-chain workflows — cutting mistakes by 90% and handing exceptions to people in under a second." at={.28} progress={progress} />
              <DataRow label="Tool-using Agents" value="Trained ticket agents to choose from 100+ changing tools, reducing manual handling by 90%." at={.3} progress={progress} />
              <DataRow label="Supply-chain LLM" value="Built the benchmark first, then trained for domain knowledge and tool use — reaching the strongest internal result on both." at={.32} progress={progress} />
              <DataRow label="Stable Training" value="Balanced competing product goals so training stayed stable and the model made more reliable downstream decisions." at={.34} progress={progress} />
            </div>
        </article>

        <article className="landscape-split landscape-split--research" aria-hidden={!isActive(3)} inert={!isActive(3)} style={{ position: 'absolute', zIndex: 22, inset: 0, display: 'grid', alignItems: 'center', opacity: visibleOpacity(3, papers), transform: reducedMotion ? 'none' : `translateY(${(.53 - progress) * 70}px)`, pointerEvents: isActive(3) ? 'auto' : 'none' }}>
            <div>
            <p style={{ ...meta, margin: '0 0 1rem', color: ACCENT }}>Research · 04</p>
            <h2 style={{ margin: 0, color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(2.7rem,5.5vw,6rem)', fontWeight: 400, letterSpacing: '-.035em', lineHeight: .9, textShadow: '0 8px 38px rgba(0,0,0,.66)' }}>{enc('Claims must survive the benchmark.')}</h2>
            </div>
            <div className="landscape-research-grid grid grid-cols-2" style={{ borderTop: `1px solid ${LINE}`, borderLeft: `1px solid ${LINE}` }}>
              {[
                ['01 · Agent Evaluation', 'Reviewed ~250 papers to show where agents fail: planning, tool use, memory, and self-evaluation.'],
                ['02 · SupChain-Bench', 'Tested AI on 530 real supply-chain tasks across logistics, fulfillment, finance, and customs.'],
                ['03 · VisualDeltas', 'Turned high- vs low-quality images into training signals, improving results by up to 8.2% without manual labels.'],
                ['04 · Conversation Evaluation', 'Measured whether agents recover from mistakes, follow changing intent, and keep dependent steps consistent.'],
                ['05 · M365 Copilot Memory', 'Built layered memory and structured retrieval so GPT-4o email workflows stayed consistent in long conversations.'],
                ['06 · Product Decisions', 'Balanced competing product goals so training stayed stable and supported better supply-chain decisions.'],
              ].map(([title, copy]) => (
                <div className="landscape-research-card" key={title} style={{ minHeight: '6.4rem', padding: '1rem', borderRight: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, background: 'rgba(7,7,9,.5)' }}>
                  <p style={{ ...meta, margin: 0, color: 'rgba(243,238,233,.82)' }}>{title}</p>
                  <p style={{ margin: '.65rem 0 0', color: 'rgba(243,238,233,.82)', fontFamily: "'Imprima',sans-serif", fontSize: '.76rem', lineHeight: 1.5 }}>{copy}</p>
                </div>
              ))}
            </div>
        </article>

        <article className="landscape-split" aria-hidden={!isActive(4)} inert={!isActive(4)} style={{ position: 'absolute', zIndex: 22, inset: 0, display: 'grid', alignItems: 'center', opacity: visibleOpacity(4, trajectory), transform: reducedMotion ? 'none' : `translateY(${(.72 - progress) * 70}px)`, pointerEvents: isActive(4) ? 'auto' : 'none' }}>
          <div>
            <p style={{ ...meta, margin: '0 0 1.2rem', color: ACCENT }}>Path · 05</p>
            <h2 style={{ margin: 0, color: INK, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(3rem,6vw,6.5rem)', fontWeight: 400, letterSpacing: '-.035em', lineHeight: .9, textShadow: '0 8px 38px rgba(0,0,0,.66)' }}>{enc('Evolution of the search.')}</h2>
          </div>
          <div>
            <div>
              {[
                { label: '2019—22', value: 'UNSW · Computer Science · Dean\'s List', detail: 'GPA 85/100 · Academic Scholarship · Dean\'s List 2019–2022 · QS #19.' },
                { label: '2023—25', value: 'NUS · Statistics · top 5%', detail: 'GPA 4.0/5.0 · top 5% in major · QS #8.' },
                { label: '2024—25', value: 'MSRA · M365 Copilot', detail: 'GPT-4o email workflows · layered memory · structured retrieval · conversation-wide evaluation.' },
                { label: '2025—now', value: 'Alibaba · LLM systems', detail: 'Production agent systems · 12 supply-chain workflows · 100+ dynamic tools · Hangzhou.' },
              ].map((it) => (
                <div key={it.label} style={{ padding: '.78rem 0', borderTop: `1px solid ${LINE}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '5.5rem minmax(0,1fr)', gap: '1rem' }}>
                    <span style={meta}>{it.label}</span>
                    <span style={{ color: INK, fontSize: '.82rem', lineHeight: 1.45 }}>{it.value}</span>
                  </div>
                  <p style={{ margin: '.3rem 0 0 6.5rem', color: 'rgba(243,238,233,.72)', fontFamily: "'Imprima',sans-serif", fontSize: '.76rem', lineHeight: 1.45 }}>{it.detail}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.4rem', padding: '.9rem 1rem', border: `1px solid ${LINE}`, background: 'rgba(7,7,9,.42)' }}>
              <p style={{ ...meta, margin: 0, color: ACCENT }}>Field notes · recent writing</p>
              <div style={{ marginTop: '.6rem', display: 'grid', gap: '.5rem' }}>
                <p style={{ margin: 0, color: 'rgba(243,238,233,.88)', fontFamily: "'Imprima',sans-serif", fontSize: '.78rem', lineHeight: 1.4 }}><span style={{ color: 'rgba(243,238,233,.7)' }}>2026 · </span>Why Agent Evaluation Is Hard — lessons from evaluating entire conversations.</p>
                <p style={{ margin: 0, color: 'rgba(243,238,233,.88)', fontFamily: "'Imprima',sans-serif", fontSize: '.78rem', lineHeight: 1.4 }}><span style={{ color: 'rgba(243,238,233,.7)' }}>2026 · </span>Building Agents That Actually Work — patterns for production agent systems.</p>
                <p style={{ margin: 0, color: 'rgba(243,238,233,.88)', fontFamily: "'Imprima',sans-serif", fontSize: '.78rem', lineHeight: 1.4 }}><span style={{ color: 'rgba(243,238,233,.7)' }}>2026 · </span>Post-Training Lessons From Production — what shipped, what broke.</p>
              </div>
            </div>
          </div>
        </article>

        <article aria-hidden={!isActive(5)} inert={!isActive(5)} style={{ position: 'absolute', zIndex: 23, inset: 0, display: 'grid', placeItems: 'center', padding: '7rem 3.2rem 5rem 1.2rem', opacity: visibleOpacity(5, contact), transform: reducedMotion ? 'none' : `scale(${.96 + contact * .04})`, pointerEvents: isActive(5) ? 'auto' : 'none', textAlign: 'center' }}>
          <div style={{ maxWidth: '59rem' }}>
            <p style={{ ...meta, margin: '0 0 1.25rem', color: ACCENT }}>Loss minimum reached · Δ 0.0001</p>
            <h2 className="landscape-gradient-title" style={{ margin: 0, fontFamily: "'Viaoda Libre',serif", fontSize: 'clamp(3.7rem,9vw,9.4rem)', fontWeight: 400, letterSpacing: '-.045em', lineHeight: .86 }}>Continue the search.</h2>
            <p style={{ margin: 'clamp(1.2rem,2vw,1.7rem) auto 0', maxWidth: '33rem', color: 'rgba(243,238,233,.72)', fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.8rem,1.1vw,.94rem)', lineHeight: 1.65 }}>I design systems where intelligence emerges from exploration, verification, and iteration.</p>
            <p style={{ margin: '1.7rem auto 0', maxWidth: '33rem', color: 'rgba(243,238,233,.86)', fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.86rem,1.2vw,1rem)', lineHeight: 1.65 }}>Open to collaborations on agent systems, evaluation research, and practical AI communication.</p>
            <MagneticButton strength={0.4}><a href={`mailto:${identity.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2rem', marginTop: '2rem', padding: '.95rem 0', borderBottom: `1px solid ${ACCENT}`, color: INK, fontFamily: "'Imprima',sans-serif", fontSize: 'clamp(.88rem,1.5vw,1.1rem)', letterSpacing: '.06em', textDecoration: 'none' }}>{identity.email} <span style={{ color: ACCENT }}>↗</span></a></MagneticButton>
            <div style={{ marginTop: '1.8rem' }}><Signature text="Damon" color={ACCENT} /></div>
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
