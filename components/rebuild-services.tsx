import { FadeIn } from '@/components/rebuild-hero'
import { capabilities } from '@/lib/content'

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
