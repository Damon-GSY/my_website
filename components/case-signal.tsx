'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import type { PointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import './case-signal.css'

type SignalType = 'risk' | 'tools' | 'benchmark' | 'reward'

const signalCopy: Record<SignalType, { title: string; eyebrow: string; disclosure: string; steps: string[] }> = {
  risk: {
    title: 'Authority routing',
    eyebrow: 'Decision architecture / 12 scenarios',
    disclosure: 'A schematic of the policy boundary. No customer trace or production data shown.',
    steps: ['observe', 'risk tier', 'confirm', 'handoff'],
  },
  tools: {
    title: 'Resolution graph',
    eyebrow: 'Conceptual resolution trace',
    disclosure: 'Illustrates system logic. No production trace, task record, or customer data shown.',
    steps: ['intent', 'meta tool', 'registry', 'trace'],
  },
  benchmark: {
    title: 'Capability surface',
    eyebrow: 'Illustrative benchmark surface',
    disclosure: 'Shows evaluation structure, not disclosed benchmark scores or production data.',
    steps: ['knowledge', 'tool use', 'SFT', 'RL'],
  },
  reward: {
    title: 'Reward hierarchy',
    eyebrow: 'Illustrative reward topology',
    disclosure: 'Explains the reward architecture. No internal task-level score curve shown.',
    steps: ['condition', 'variance', 'filter', 'balance'],
  },
}

function RiskGraphic({ animated }: { animated: boolean }) {
  const traveler = animated
    ? {
        cx: [72, 198, 238, 326, 374, 422, 540, 576, 710],
        cy: [195, 195, 195, 195, 224, 282, 282, 282, 282],
        opacity: [0, 0.9, 1, 1, 1, 1, 1, 0.9, 0],
      }
    : { cx: 72, cy: 195, opacity: 0 }

  return (
    <>
    <svg className="case-signal__plot case-signal__plot--risk case-signal__plot--risk-desktop" viewBox="0 0 760 390">
      <path className="case-signal__axis" d="M72 195H198M278 195H326" />
      <path className="case-signal__trace case-signal__trace--muted" d="M326 195C374 195 370 108 422 108H672" />
      <path className="case-signal__trace case-signal__flow" pathLength="1" d="M326 195C374 195 370 282 422 282H710" />

      <g className="case-signal__module">
        <rect x="50" y="157" width="142" height="76" rx="2" />
        <text className="case-signal__micro" x="68" y="181">OBSERVED STATE</text>
        <text className="case-signal__module-title" x="68" y="210">intent + context</text>
      </g>

      <g className="case-signal__gate">
        <path d="M238 155L278 195L238 235L198 195Z" />
        <text className="case-signal__micro" x="221" y="191">RISK</text>
        <text className="case-signal__micro" x="221" y="206">TIER</text>
      </g>

      <g className="case-signal__module case-signal__module--muted">
        <rect x="422" y="70" width="118" height="76" rx="2" />
        <text className="case-signal__micro" x="440" y="94">ROUTINE</text>
        <text className="case-signal__module-title" x="440" y="123">execute</text>
      </g>

      <g className="case-signal__module case-signal__module--accent">
        <rect x="422" y="244" width="118" height="76" rx="2" />
        <text className="case-signal__micro" x="440" y="268">CONSEQUENCE</text>
        <text className="case-signal__module-title" x="440" y="297">confirm</text>
      </g>

      <path className="case-signal__handoff-link" d="M540 282H576" />
      <g className="case-signal__module case-signal__module--handoff">
        <rect x="576" y="244" width="134" height="76" rx="38" />
        <text className="case-signal__micro" x="596" y="268">EXCEPTION</text>
        <text className="case-signal__module-title" x="596" y="297">human handoff</text>
      </g>

      <text className="case-signal__lane-label" x="422" y="51">LOW CONSEQUENCE / BOUNDED ACTION</text>
      <text className="case-signal__lane-label case-signal__label--accent" x="422" y="349">HIGH CONSEQUENCE / EXPLICIT AUTHORITY</text>
      <circle className="case-signal__junction" cx="326" cy="195" r="3" />
      <motion.circle
        animate={traveler}
        className="case-signal__traveler"
        data-signal-traveler
        initial={false}
        r="5"
        transition={animated ? {
          duration: 4.2,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 0.7,
          times: [0, 0.16, 0.27, 0.4, 0.52, 0.65, 0.78, 0.88, 1],
        } : { duration: 0 }}
      />
    </svg>
    <svg className="case-signal__plot case-signal__plot--risk case-signal__plot--risk-mobile" viewBox="0 0 340 280">
      <path className="case-signal__axis" d="M100 125H102M150 125H164" />
      <path className="case-signal__trace case-signal__trace--muted" d="M164 125C181 125 179 62 198 62H320" />
      <path className="case-signal__trace case-signal__flow" pathLength="1" d="M164 125C181 125 179 184 198 184H308" />
      <path className="case-signal__handoff-link" d="M253 210V234" />

      <g className="case-signal__module">
        <rect x="8" y="98" width="92" height="54" rx="2" />
        <text className="case-signal__micro" x="18" y="116">OBSERVED STATE</text>
        <text className="case-signal__module-title" x="18" y="139">intent + context</text>
      </g>
      <g className="case-signal__gate">
        <path d="M126 101L150 125L126 149L102 125Z" />
        <text className="case-signal__micro" x="115" y="122">RISK</text>
        <text className="case-signal__micro" x="115" y="134">TIER</text>
      </g>
      <g className="case-signal__module case-signal__module--muted">
        <rect x="198" y="38" width="110" height="48" rx="2" />
        <text className="case-signal__micro" x="210" y="55">ROUTINE</text>
        <text className="case-signal__module-title" x="210" y="75">execute</text>
      </g>
      <g className="case-signal__module case-signal__module--accent">
        <rect x="198" y="158" width="110" height="52" rx="2" />
        <text className="case-signal__micro" x="210" y="176">HIGH CONSEQUENCE</text>
        <text className="case-signal__module-title" x="210" y="198">confirm</text>
      </g>
      <g className="case-signal__module case-signal__module--handoff">
        <rect x="198" y="234" width="110" height="40" rx="20" />
        <text className="case-signal__micro" x="210" y="250">EXCEPTION</text>
        <text className="case-signal__module-title" x="210" y="267">human handoff</text>
      </g>
      <circle className="case-signal__junction" cx="164" cy="125" r="3" />
      <motion.circle
        animate={animated ? {
          cx: [8, 102, 126, 164, 181, 198, 253, 308],
          cy: [125, 125, 125, 125, 150, 184, 184, 184],
          opacity: [0, 0.9, 1, 1, 1, 1, 0.9, 0],
        } : { cx: 8, cy: 125, opacity: 0 }}
        className="case-signal__traveler"
        initial={false}
        r="4"
        transition={animated ? {
          duration: 3.6,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 0.7,
        } : { duration: 0 }}
      />
    </svg>
    </>
  )
}

function ToolsGraphic() {
  return (
    <svg className="case-signal__plot case-signal__plot--tools" viewBox="0 0 420 520">
      <g className="case-signal__network">
        <path d="M210 260L90 100M210 260L320 82M210 260L350 210M210 260L326 398M210 260L165 444M210 260L70 350M90 100L320 82M350 210L326 398M70 350L165 444" />
        <path className="case-signal__flow" pathLength="1" d="M70 350L210 260L350 210L320 82" />
      </g>
      <circle className="case-signal__node" cx="90" cy="100" r="13" />
      <circle className="case-signal__node" cx="320" cy="82" r="8" />
      <circle className="case-signal__node" cx="350" cy="210" r="17" />
      <circle className="case-signal__node" cx="326" cy="398" r="10" />
      <circle className="case-signal__node" cx="165" cy="444" r="15" />
      <circle className="case-signal__node" cx="70" cy="350" r="7" />
      <rect className="case-signal__hub" x="172" y="222" width="76" height="76" rx="2" />
      <circle className="case-signal__node case-signal__node--accent" cx="210" cy="260" r="8" />
      <text className="case-signal__label case-signal__label--accent" x="172" y="322">meta-tool</text>
      <text className="case-signal__label" x="43" y="82">intent</text>
      <text className="case-signal__label" x="287" y="464">runtime registry / 100+</text>
    </svg>
  )
}

function BenchmarkGraphic() {
  return (
    <svg className="case-signal__plot case-signal__plot--benchmark" viewBox="0 0 420 520">
      <path className="case-signal__axis" d="M54 72V446H380M54 352H380M54 258H380M54 164H380" />
      <path className="case-signal__area" d="M54 408L120 348L186 365L252 226L318 258L380 96V446H54Z" />
      <path className="case-signal__trace case-signal__flow" pathLength="1" d="M54 408L120 348L186 365L252 226L318 258L380 96" />
      <circle className="case-signal__node" cx="120" cy="348" r="5" />
      <circle className="case-signal__node" cx="186" cy="365" r="5" />
      <circle className="case-signal__node case-signal__node--accent" cx="252" cy="226" r="7" />
      <circle className="case-signal__node" cx="318" cy="258" r="5" />
      <circle className="case-signal__node case-signal__node--accent" cx="380" cy="96" r="7" />
      <text className="case-signal__label" x="54" y="474">knowledge</text>
      <text className="case-signal__label" x="171" y="474">tool use</text>
      <text className="case-signal__label" x="295" y="474">reasoning</text>
      <text className="case-signal__label case-signal__label--accent" x="270" y="206">capability boundary</text>
    </svg>
  )
}

function RewardGraphic() {
  return (
    <svg className="case-signal__plot case-signal__plot--reward" viewBox="0 0 420 520">
      <path className="case-signal__axis" d="M42 444H386M42 84V444" />
      <path className="case-signal__trace case-signal__trace--faint" d="M44 420C112 416 122 226 188 214C254 202 269 410 386 420" />
      <path className="case-signal__trace case-signal__trace--muted" d="M44 420C112 414 159 102 230 92C301 82 318 402 386 420" />
      <path className="case-signal__reward-area" d="M44 420C106 414 135 176 204 164C273 152 302 405 386 420V444H44Z" />
      <path className="case-signal__trace case-signal__flow" pathLength="1" d="M44 420C106 414 135 176 204 164C273 152 302 405 386 420" />
      <path className="case-signal__marker" d="M204 164V444" />
      <circle className="case-signal__node case-signal__node--accent" cx="204" cy="164" r="7" />
      <text className="case-signal__label" x="43" y="474">rejected</text>
      <text className="case-signal__label" x="325" y="474">retained</text>
      <text className="case-signal__label case-signal__label--accent" x="218" y="154">balanced signal</text>
    </svg>
  )
}

function SignalGraphic({ animated, type }: { animated: boolean; type: SignalType }) {
  if (type === 'risk') return <RiskGraphic animated={animated} />
  if (type === 'tools') return <ToolsGraphic />
  if (type === 'benchmark') return <BenchmarkGraphic />
  return <RewardGraphic />
}

export default function CaseSignal({ type }: { type: SignalType }) {
  const copy = signalCopy[type]
  const rootRef = useRef<HTMLDivElement>(null)
  const visible = useInView(rootRef, { amount: 0.05 })
  const [enteredView, setEnteredView] = useState(false)
  const reducedMotion = useReducedMotion()
  const animated = visible && !reducedMotion
  const accessibleLabel = `${copy.eyebrow}. ${copy.disclosure} Flow: ${copy.steps.join(', ')}.`

  useEffect(() => {
    if (visible) setEnteredView(true)
  }, [visible])

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`)
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`)
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.removeProperty('--spot-x')
    event.currentTarget.style.removeProperty('--spot-y')
  }

  return (
    <div
      ref={rootRef}
      className={`case-signal case-signal--${type} case-signal--animated${enteredView ? ' is-active' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label={accessibleLabel}
    >
      <div className="case-signal__meta">
        <small>{copy.eyebrow}</small>
        <strong>{copy.title}</strong>
      </div>
      <p className="case-signal__disclosure">{copy.disclosure}</p>
      <SignalGraphic animated={animated} type={type} />
      <div className="case-signal__legend">
        {copy.steps.map((step, index) => (
          <em key={step}><b>0{index + 1}</b>{step}</em>
        ))}
      </div>
    </div>
  )
}
