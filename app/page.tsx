import { SiteHeader } from '@/components/fieldwork/site-header'
import { SiteFooter } from '@/components/fieldwork/site-footer'
import { Hero } from '@/components/fieldwork/hero'
import { SelectedWork } from '@/components/fieldwork/selected-work'
import { ResearchNotes, AboutPractice } from '@/components/fieldwork/research-notes'

export default function HomePage() {
  return <>
    <SiteHeader/>
    <main id="main-content">
      <Hero/>
      <SelectedWork/>
      <ResearchNotes/>
      <AboutPractice/>
    </main>
    <SiteFooter/>
  </>
}
