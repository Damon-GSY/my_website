import AboutSection from '@/components/about-section'
import FieldNotesSection from '@/components/field-notes-section'
import EarlierSystemsSection from '@/components/earlier-systems-section'
import Hero from '@/components/hero'
import ResearchSection from '@/components/research-section'
import SiteFooter from '@/components/site-footer'
import SiteHeader from '@/components/site-header'
import WorkSection from '@/components/work-section'

export default function Home() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/assets/optimization-signature-mobile.webp"
        media="(max-width: 720px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/assets/optimization-signature-1280.webp"
        imageSrcSet="/assets/optimization-signature-1280.webp 1280w, /assets/optimization-signature-1920.webp 1920w"
        imageSizes="100vw"
        media="(min-width: 721px)"
        fetchPriority="high"
      />
      <a className="skip-link" href="#work">
        Skip to selected work
      </a>
      <div className="page-progress" aria-hidden="true" />
      <SiteHeader />
      <main>
        <Hero />
        <WorkSection />
        <EarlierSystemsSection />
        <ResearchSection />
        <FieldNotesSection />
        <AboutSection />
      </main>
      <SiteFooter />
    </>
  )
}
