import AboutSection from '@/components/about-section'
import FieldNotesSection from '@/components/field-notes-section'
import EarlierSystemsSection from '@/components/earlier-systems-section'
import Hero from '@/components/hero'
import ResearchSection from '@/components/research-section'
import SiteFooter from '@/components/site-footer'
import SiteHeader from '@/components/site-header'
import WorkSection from '@/components/work-section'
import { WORLD_PLATE_MEDIA, WORLD_PLATE_URLS } from '@/lib/optimization-assets'

export default function Home() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href={WORLD_PLATE_URLS.mobile}
        media={WORLD_PLATE_MEDIA.mobilePortrait}
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={WORLD_PLATE_URLS.standard}
        media={WORLD_PLATE_MEDIA.standard}
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={WORLD_PLATE_URLS.highDensity}
        media={WORLD_PLATE_MEDIA.highDensityWide}
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
        <AboutSection />
        <ResearchSection />
        <EarlierSystemsSection />
        <FieldNotesSection />
      </main>
      <SiteFooter />
    </>
  )
}
