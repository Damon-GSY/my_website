import AboutSection from '@/components/about-section'
import FieldNotesSection from '@/components/field-notes-section'
import Hero from '@/components/hero'
import ResearchSection from '@/components/research-section'
import SiteFooter from '@/components/site-footer'
import SiteHeader from '@/components/site-header'
import WorkSection from '@/components/work-section'

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#work">
        Skip to selected work
      </a>
      <div className="page-progress" aria-hidden="true" />
      <SiteHeader />
      <main>
        <Hero />
        <WorkSection />
        <ResearchSection />
        <FieldNotesSection />
        <AboutSection />
      </main>
      <SiteFooter />
    </>
  )
}
