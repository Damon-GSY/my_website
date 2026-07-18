'use client'

import type { PointerEvent } from 'react'
import './case-signal.css'

type SignalType = 'risk' | 'tools' | 'benchmark' | 'reward'

const signalCopy: Record<SignalType, { title: string; steps: string[] }> = {
  risk: {
    title: 'Decision policy',
    steps: ['observe', 'risk tier', 'confirm', 'handoff'],
  },
  tools: {
    title: 'Resolution graph',
    steps: ['intent', 'meta tool', 'registry', 'trace'],
  },
  benchmark: {
    title: 'Capability surface',
    steps: ['knowledge', 'tool use', 'SFT', 'RL'],
  },
  reward: {
    title: 'Reward hierarchy',
    steps: ['condition', 'variance', 'filter', 'balance'],
  },
}

function RiskGraphic() {
  return (
    <svg className="case-signal__plot case-signal__plot--risk" viewBox="0 0 420 520">
      <path className="case-signal__axis" d="M210 32V488" />
      <path className="case-signal__trace case-signal__trace--muted" d="M210 64V132C210 184 96 171 96 238V344" />
      <path className="case-signal__trace case-signal__trace--muted" d="M210 132C210 184 324 171 324 238V344" />
      <path className="case-signal__trace case-signal__flow" pathLength="1" d="M210 64V132C210 184 324 171 324 238V404C324 448 264 452 210 452" />
      <rect className="case-signal__zone" x="52" y="238" width="88" height="106" rx="2" />
      <rect className="case-signal__zone case-signal__zone--accent" x="280" y="238" width="88" height="106" rx="2" />
      <circle className="case-signal__node case-signal__node--accent" cx="210" cy="64" r="7" />
      <circle className="case-signal__node" cx="210" cy="132" r="5" />
      <circle className="case-signal__node" cx="96" cy="238" r="5" />
      <circle className="case-signal__node case-signal__node--accent" cx="324" cy="238" r="7" />
      <circle className="case-signal__node" cx="210" cy="452" r="5" />
      <text className="case-signal__label" x="52" y="366">routine / execute</text>
      <text className="case-signal__label case-signal__label--accent" x="280" y="366">high risk / confirm</text>
      <text className="case-signal__label" x="226" y="136">policy gate</text>
    </svg>
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

function SignalGraphic({ type }: { type: SignalType }) {
  if (type === 'risk') return <RiskGraphic />
  if (type === 'tools') return <ToolsGraphic />
  if (type === 'benchmark') return <BenchmarkGraphic />
  return <RewardGraphic />
}

export default function CaseSignal({ type }: { type: SignalType }) {
  const copy = signalCopy[type]

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
      className={`case-signal case-signal--${type}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-hidden="true"
    >
      <div className="case-signal__meta">
        <small>System trace</small>
        <strong>{copy.title}</strong>
      </div>
      <SignalGraphic type={type} />
      <div className="case-signal__legend">
        {copy.steps.map((step, index) => (
          <em key={step}><b>0{index + 1}</b>{step}</em>
        ))}
      </div>
    </div>
  )
}
