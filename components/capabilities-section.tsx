import { profile } from '@/lib/content'

const capabilities = [
  {
    index: '01',
    title: 'Agent systems',
    description:
      'Control layers for planning, tool use, permissions, recovery, and fast human handoff in production workflows.',
  },
  {
    index: '02',
    title: 'Post-training',
    description:
      'Capability-first training programs spanning continual pretraining, supervised fine-tuning, and reinforcement learning.',
  },
  {
    index: '03',
    title: 'Evaluation',
    description:
      'Trace-level evaluation for multi-turn agents, with separate surfaces for planning, tools, memory, and recovery.',
  },
  {
    index: '04',
    title: 'Reward design',
    description:
      'Conditional and hierarchical reward systems that keep conflicting objectives from silently consuming one another.',
  },
  {
    index: '05',
    title: 'Research & writing',
    description:
      'First-author research and public field notes that turn operating lessons into methods other builders can inspect.',
  },
] as const

export default function CapabilitiesSection() {
  return (
    <section className="creator-capabilities" aria-labelledby="capabilities-title">
      <div className="creator-shell">
        <header className="creator-capabilities__header">
          <p className="creator-kicker">What I build</p>
          <h2 id="capabilities-title">Capability, made operational.</h2>
          <p>{profile.thesis}</p>
        </header>
        <div className="creator-capabilities__list">
          {capabilities.map((capability) => (
            <article key={capability.index}>
              <strong>{capability.index}</strong>
              <div>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
