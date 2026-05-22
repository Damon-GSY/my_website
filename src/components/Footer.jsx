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
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <a href="/#home" className="type-display text-lg font-bold tracking-tight text-[var(--text)]">
            Damon
          </a>

          <nav aria-label="Social links" className="flex flex-wrap items-center justify-center gap-4">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-[var(--line)] pt-6 text-center">
          <p className="text-[var(--muted)] text-xs">
            &copy; {year} Shengyue Guan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
