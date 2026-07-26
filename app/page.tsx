import '@/components/rebuild-home.css'
import RebuildAbout from '@/components/rebuild-about'
import Hero from '@/components/rebuild-hero'
import RebuildMarquee from '@/components/rebuild-marquee'
import RebuildServices from '@/components/rebuild-services'
import WorkSection from '@/components/rebuild-work-section'

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#work">
        Skip to selected work
      </a>
      <div className="page-progress" aria-hidden="true" />
      <main>
        <Hero />
        <RebuildMarquee />
        <RebuildAbout />
        <RebuildServices />
        <WorkSection />
      </main>
    </>
  )
}
