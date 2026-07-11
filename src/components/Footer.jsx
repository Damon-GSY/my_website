import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer data-hide-launcher className="border-t border-[var(--line)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 text-xs text-[var(--muted)] md:flex-row md:items-end md:justify-between md:px-6 md:py-10">
        <div>
          <p className="font-display text-base text-[var(--text)]">Damon Guo-Shiyu</p>
          <p className="mt-1 font-mono text-[0.67rem] uppercase tracking-[0.13em]">
            Hangzhou, China · UTC+8
          </p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer navigation">
            <Link to="/projects" className="transition-colors hover:text-[var(--text)]">Work</Link>
            <Link to="/blog" className="transition-colors hover:text-[var(--text)]">Writing</Link>
            <Link to="/about" className="transition-colors hover:text-[var(--text)]">About</Link>
            <a href="mailto:hello@damon.ai" className="transition-colors hover:text-[var(--text)]">Email</a>
          </nav>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em]">
            © {year} Damon Guo-Shiyu · React · GSAP · Tailwind
          </p>
        </div>
      </div>
    </footer>
  );
}
