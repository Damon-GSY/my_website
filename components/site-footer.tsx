import { profile, socials } from '@/lib/content'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-shell">
        <p className="section-eyebrow">Contact / agent systems · evaluation · post-training</p>

        <section className="footer-fit" aria-labelledby="footer-fit-heading">
          <div>
            <span>Collaboration fit</span>
            <h2 id="footer-fit-heading">Best reasons to reach out.</h2>
          </div>
          <ol>
            {profile.reachOutFor.map((reason, index) => (
              <li key={reason}>
                <span>0{index + 1}</span>
                <strong>{reason}</strong>
              </li>
            ))}
          </ol>
        </section>

        <a className="footer-cta" href={`mailto:${profile.email}`}>
          Bring me the hard failure.<span aria-hidden="true">↗</span>
        </a>

        <div className="footer-bottom">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <nav aria-label="Social links">
            {socials.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer">{label}</a>
            ))}
          </nav>
          <span>Hangzhou · UTC+8 · © 2026 {profile.name}</span>
        </div>
      </div>
    </footer>
  )
}
