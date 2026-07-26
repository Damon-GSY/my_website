import '@/components/rebuild-home.css'
import RebuildAbout from '@/components/rebuild-about'
import Hero from '@/components/rebuild-hero'
import RebuildMarquee from '@/components/rebuild-marquee'
import RebuildServices from '@/components/rebuild-services'
import WorkSection from '@/components/rebuild-work-section'
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
