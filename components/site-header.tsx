'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { profile } from '@/lib/content'

const navItems = [
  { id: 'work', href: '#work', label: 'Work', routePrefix: '/work/' },
  { id: 'research', href: '#research', label: 'Research', routePrefix: null },
  { id: 'notes', href: '#notes', label: 'Notes', routePrefix: '/notes' },
  { id: 'about', href: '#about', label: 'About', routePrefix: null },
] as const

type NavigationId = (typeof navItems)[number]['id']

export default function SiteHeader() {
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState<NavigationId | ''>('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const routeItem = navItems.find(
      (item) => item.routePrefix !== null && pathname.startsWith(item.routePrefix),
    )
    if (routeItem) {
      setActiveSection(routeItem.id)
      return
    }

    setActiveSection('')
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const current = navItems.find((item) => item.id === visible?.target.id)
        if (current) setActiveSection(current.id)
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.12, 0.35] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    const toggle = toggleRef.current
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        return
      }

      if (event.key === 'Tab') {
        const menuLinks = Array.from(
          menuRef.current?.querySelectorAll<HTMLElement>('a[href]:not([tabindex="-1"])') ?? [],
        )
        const focusables = [toggle, ...menuLinks].filter(
          (element): element is HTMLElement => Boolean(element),
        )
        const first = focusables[0]
        const last = focusables[focusables.length - 1]

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    menuRef.current?.querySelector<HTMLElement>('a[href]:not([tabindex="-1"])')?.focus({ preventScroll: true })

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      toggle?.focus()
    }
  }, [menuOpen])

  const homeAnchor = pathname === '/' ? '' : '/'

  return (
    <header className="site-header">
      <a className="site-brand" href={pathname === '/' ? '#top' : '/'} aria-label="Damon, home">
        <svg className="site-brand__mark" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M7 5v22h6.5C21.2 27 26 22.8 26 16S21.2 5 13.5 5H7Z" />
          <path d="M10.5 22c2.8-1 3.2-4.8 5.3-7 1.8-1.9 3.6-.7 5.9-4.5" />
          <circle cx="21.7" cy="10.5" r="1.3" />
        </svg>
        <span>Damon</span>
        <small>Agent systems</small>
      </a>

      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`${homeAnchor}${item.href}`}
            aria-current={activeSection === item.id ? 'location' : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <a className="site-contact" href={`mailto:${profile.email}`}>
        <i aria-hidden="true" /> Contact
      </a>

      <button
        ref={toggleRef}
        className={`site-menu-toggle${menuOpen ? ' is-open' : ''}`}
        type="button"
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
      </button>

      <div
        ref={menuRef}
        className={`site-mobile-menu${menuOpen ? ' is-open' : ''}`}
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Mobile primary navigation">
          {navItems.map((item, index) => (
            <a
              key={item.id}
              href={`${homeAnchor}${item.href}`}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>{item.label}
            </a>
          ))}
        </nav>

        <div className="site-mobile-menu__foot">
          <span>{profile.role} · {profile.location}</span>
          <a href={`mailto:${profile.email}`} tabIndex={menuOpen ? 0 : -1}>{profile.email}</a>
        </div>
      </div>
    </header>
  )
}
