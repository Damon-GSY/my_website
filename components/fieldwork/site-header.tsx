'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from './site-shell.module.css'

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const path = usePathname()
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && toggle.current?.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.current.focus() }
    }
    const query = window.matchMedia('(min-width: 760px)')
    const onResize = () => { if (query.matches) setOpen(false) }
    window.addEventListener('keydown', handleKey)
    query.addEventListener('change', onResize)
    return () => { window.removeEventListener('keydown', handleKey); query.removeEventListener('change', onResize) }
  }, [])
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.brand} aria-label="Damon Guan home" onClick={() => setOpen(false)}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M7 5h5c9 0 15 20 5 20H7V5Z" stroke="currentColor" strokeWidth="1.6"/><path d="M7 25 23 5M7 16h15" stroke="currentColor" strokeWidth="1.2"/></svg>
          Damon Guan<span className={styles.brandNote}>Research & engineering</span>
        </Link>
        <button ref={toggle} className={styles.menuToggle} aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>{open ? 'Close −' : 'Menu +'}</button>
        <nav id="site-nav" aria-label="Main navigation" className={`${styles.nav} ${open ? styles.navOpen : ''}`}>
          {[['Work','/#work'], ['Research','/#research'], ['Notes','/notes'], ['About','/#about']].map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={href === path ? 'page' : undefined}>{label}</Link>)}
          <Link className={styles.contactLink} href="/#contact" onClick={() => setOpen(false)}>Let’s talk <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </header>
  </>
}
