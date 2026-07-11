// Ported effects — pure React + CSS, no framer-motion / gsap / lucide.
// Re-implementations of main's EncryptedText, NumberTicker, MagneticButton,
// and an accordion for the trajectory — adapted to this site's zero-dep stack.
// All are reveal/hover/click triggered (no per-frame scroll work) so they
// don't touch the 60fps canvas parallax.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Text with continuous sparkle particles (always-visible, not one-time). */
export function SparklesText({
  text,
  count = 16,
  colors = ['#d97757', '#ffd5bf'],
  style,
}: {
  text: string
  count?: number
  colors?: [string, string]
  style?: CSSProperties
}) {
  const [sparkles] = useState(() =>
    prefersReduced()
      ? []
      : Array.from({ length: count }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: colors[Math.random() > 0.5 ? 0 : 1],
          delay: Math.random() * 3,
          dur: 0.9 + Math.random() * 1.4,
        })),
  )
  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }} aria-label={text}>
      {sparkles.map((s) => (
        <span
          key={s.id}
          aria-hidden
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: 5,
            height: 5,
            marginLeft: -2.5,
            marginTop: -2.5,
            borderRadius: '50%',
            background: s.color,
            boxShadow: `0 0 10px ${s.color}`,
            animation: `sparkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            pointerEvents: 'none',
          }}
        />
      ))}
      <span style={{ position: 'relative', zIndex: 1 }}>{text}</span>
    </span>
  )
}

function useInViewOnce<T extends HTMLElement>(margin = '-50px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced()) {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return { ref, inView }
}

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#________'

/** Text that "decrypts" character-by-character when scrolled into view. */
export function EncryptedText({
  text,
  speed = 22,
  maxIter = 4,
  style,
}: {
  text: string
  speed?: number
  maxIter?: number
  style?: CSSProperties
}) {
  const { ref, inView } = useInViewOnce<HTMLSpanElement>()
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    if (!inView) return
    if (prefersReduced()) {
      setDisplay(text)
      return
    }
    let it = 0
    const id = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((c, i) => (c === ' ' ? ' ' : i < it ? text[i] : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]))
          .join(''),
      )
      it += 1 / 3
      if (it >= text.length + maxIter) {
        clearInterval(id)
        setDisplay(text)
      }
    }, speed)
    return () => clearInterval(id)
  }, [inView, text, speed, maxIter])

  return (
    <span ref={ref} style={style} aria-label={text}>
      {display}
    </span>
  )
}

/** Counts up to `value` when scrolled into view. */
export function NumberTicker({
  value,
  prefix = '',
  suffix = '',
  duration = 1200,
  style,
}: {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  style?: CSSProperties
}) {
  const { ref, inView } = useInViewOnce<HTMLSpanElement>()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (prefersReduced()) {
      setDisplay(value)
      return
    }
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(value * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration])

  return (
    <span ref={ref} style={style}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

/** Wraps children and translates toward the cursor (magnetic pull). */
export function MagneticButton({
  children,
  strength = 0.3,
  style,
  ...rest
}: {
  children: ReactNode
  strength?: number
  style?: CSSProperties
} & React.HTMLAttributes<HTMLSpanElement>) {
  const ref = useRef<HTMLSpanElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const raf = useRef(0)

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const loop = () => {
    const el = ref.current
    if (!el) return
    current.current.x += (target.current.x - current.current.x) * 0.18
    current.current.y += (target.current.y - current.current.y) * 0.18
    el.style.transform = `translate(${current.current.x}px, ${current.current.y}px)`
    const dx = target.current.x - current.current.x
    const dy = target.current.y - current.current.y
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      raf.current = requestAnimationFrame(loop)
    } else {
      raf.current = 0
      el.style.transform = `translate(${target.current.x}px, ${target.current.y}px)`
    }
  }

  const onMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (prefersReduced()) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    target.current = {
      x: (e.clientX - r.left - r.width / 2) * strength,
      y: (e.clientY - r.top - r.height / 2) * strength,
    }
    if (!raf.current) raf.current = requestAnimationFrame(loop)
  }

  const onLeave = () => {
    target.current = { x: 0, y: 0 }
    if (!raf.current) raf.current = requestAnimationFrame(loop)
  }

  return (
    <span ref={ref} style={{ display: 'inline-block', willChange: 'transform', ...style }} onMouseMove={onMove} onMouseLeave={onLeave} {...rest}>
      {children}
    </span>
  )
}

/** Accordion row: click to expand a detail panel (grid-rows 0fr->1fr height anim, no measuring). */
export function Accordion({
  items,
  accent,
  line,
  labelStyle,
  valueStyle,
}: {
  items: { label: string; value: string; detail?: string }[]
  accent: string
  line: string
  labelStyle?: CSSProperties
  valueStyle?: CSSProperties
}) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={it.label} style={{ borderBottom: `1px solid ${line}` }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{ display: 'grid', gridTemplateColumns: '5.5rem minmax(0,1fr) 1.5rem', gap: '1rem', width: '100%', padding: '.78rem 0', background: 'none', border: 'none', cursor: 'pointer', alignItems: 'center', textAlign: 'left' }}
            >
              <span style={labelStyle}>{it.label}</span>
              <span style={valueStyle}>{it.value}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .25s ease', justifySelf: 'end' }} aria-hidden>
                <path d="M2 4l4 4 4-4" stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows .3s ease' }}>
              <div style={{ overflow: 'hidden' }}>
                {it.detail && (
                  <p style={{ margin: '0 0 .8rem', paddingLeft: '6.5rem', color: 'rgba(243,238,233,.62)', fontFamily: "'Imprima',sans-serif", fontSize: '.76rem', lineHeight: 1.5 }}>
                    {it.detail}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
