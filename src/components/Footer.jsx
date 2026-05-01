export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { name: 'YouTube', href: 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA' },
    { name: 'Bilibili', href: 'https://space.bilibili.com/358541297' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/shengyue-guan-1a7b3226b/' },
    { name: 'GitHub', href: 'https://github.com/Damon-GSY' },
    { name: 'Email', href: 'mailto:hello@damon.ai' },
  ];

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="type-display mb-4 text-2xl font-bold text-[var(--text)]">Damon</h3>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              AI researcher and builder documenting the journey from ideas to deployed systems.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Social links">
            <h4 className="mb-4 font-semibold text-[var(--text)]">Connect</h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Follow CTA */}
          <div>
            <h4 className="mb-4 font-semibold text-[var(--text)]">Follow</h4>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Follow my latest thoughts and experiments on AI systems.
            </p>
            <a
              href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA?sub_confirmation=1"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--muted-strong)] transition-[box-shadow] [box-shadow:0_0_0_1px_var(--ring)] hover:[box-shadow:0_0_0_1px_var(--ring-strong)]"
            >
              Follow on YouTube ↗
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 flex items-center justify-center border-t border-[var(--line)] pt-8 md:justify-start">
          <p className="text-[var(--muted)] text-sm">© {year} Shengyue Guan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
