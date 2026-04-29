import { startTransition, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isHomePage = pathname === '/';

  const homeHref = isHomePage ? '#home' : '/#home';

  useEffect(() => {
    const handleScroll = () => {
      startTransition(() => {
        setScrolled(window.scrollY > 20);
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solid = !isHomePage || scrolled;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        solid
          ? 'border-[var(--line)] bg-[var(--bg)]/86 shadow-[var(--shadow-nav)] backdrop-blur-xl'
          : 'border-transparent bg-[var(--bg)]/24 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          <a href={homeHref} className="type-display text-xl font-bold tracking-tight text-[var(--text)]">
            Damon.
          </a>

          <div className="hidden gap-6 text-sm font-medium text-[var(--muted)] sm:flex">
            <a href={homeHref} className="transition-colors hover:text-[var(--text)]">
              Home
            </a>
            <Link to="/projects" className="transition-colors hover:text-[var(--text)]">
              Projects
            </Link>
            <Link to="/blog" className="transition-colors hover:text-[var(--text)]">
              Blog
            </Link>
            <Link to="/about" className="transition-colors hover:text-[var(--text)]">
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[var(--surface-soft)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[var(--muted-strong)] transition-[box-shadow] [box-shadow:0_0_0_1px_var(--ring)] hover:[box-shadow:0_0_0_1px_var(--ring-strong)]"
            >
              Connect
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
