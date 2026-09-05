import Link from 'next/link'
import { SiteFooter } from '@/components/fieldwork/site-footer'
import { SiteHeader } from '@/components/fieldwork/site-header'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page} id="main-content">
        <div className={styles.inner}>
          <p className={styles.eyebrow}>404 / A page out of place</p>
          <h1>Nothing here.<br /><em>Plenty elsewhere.</em></h1>
          <p>This page may have moved, or the address may be incomplete. The work and the notebook are still here.</p>
          <div className={styles.links}>
            <Link href="/">Back to the homepage <span aria-hidden="true">↗</span></Link>
            <Link href="/notes">Browse field notes <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
