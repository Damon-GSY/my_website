import { profile, socials } from '@/lib/content'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-shell">
        <p className="section-eyebrow">Contact</p>
        <a className="footer-cta" href={`mailto:${profile.email}`}>
          Let&apos;s compare traces.<span aria-hidden="true">↗</span>
        </a>

        <div className="footer-bottom">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <nav aria-label="Social links">
            {socials.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer">{label}</a>
            ))}
          </nav>
          <span>Hangzhou · UTC+8 · © 2026 {profile.legalName}</span>
        </div>
      </div>
    </footer>
  )
}
