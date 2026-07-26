import { FadeIn } from '@/components/rebuild-hero'

const capabilities = [
  ['01', 'Agent system design', 'Control layers for planning, tools, permissions, recovery, and human handoff in production workflows.'],
  ['02', 'Post-training', 'Capability-first programs spanning continual pretraining, supervised fine-tuning, and reinforcement learning.'],
  ['03', 'Agent evaluation', 'Trace-level evaluation across planning, tool use, memory, recovery, and long-horizon execution.'],
  ['04', 'Reward architecture', 'Conditional and hierarchical reward systems for objectives that would otherwise silently conflict.'],
  ['05', 'Research & writing', 'First-author research and public field notes that turn operating lessons into inspectable methods.'],
] as const

export default function RebuildServices() {
  return (
    <section className="prompt-services" id="services">
      <FadeIn><h2>Capabilities</h2></FadeIn>
      <div className="prompt-services__list">
        {capabilities.map(([index, name, description], itemIndex) => (
          <FadeIn delay={itemIndex * 0.1} key={index}>
            <article>
              <strong>{index}</strong>
              <div><h3>{name}</h3><p>{description}</p></div>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
