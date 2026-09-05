'use client'

import { useEffect, useRef, useState } from 'react'
import { profile, socials } from '@/lib/content'
import styles from './site-shell.module.css'

export function SiteFooter() {
  const [copied, setCopied] = useState('Copy email')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  async function copy() {
    try { await navigator.clipboard.writeText(profile.email); setCopied('Email copied') }
    catch { setCopied('Select the email to copy') }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied('Copy email'), 3000)
  }
  return <footer id="contact" className={styles.footer}>
    <div className="container">
      <div className={styles.contactTop}><span className="eyebrow">Good work starts with a conversation</span><span className={styles.location}>Hangzhou, China · UTC+8</span></div>
      <div className={styles.contactBody}><h2 className="editorial">Have a good<br/><em>question?</em></h2><a href={`mailto:${profile.email}`} aria-label={`Email ${profile.name}`} className={styles.bigArrow}>↗</a></div>
      <div className={styles.emailRow}><a href={`mailto:${profile.email}`}>{profile.email}</a><button type="button" onClick={copy} aria-live="polite">{copied} <span aria-hidden="true">⧉</span></button></div>
      <div className={styles.footerBottom}><span>© {new Date().getFullYear()} Damon Guan</span><div>{socials.slice(0, 2).map(([name, url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}<a href="#main-content">Back to top ↑</a></div></div>
    </div>
  </footer>
}
