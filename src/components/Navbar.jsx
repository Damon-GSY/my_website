import { startTransition, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
          ? 'border-[var(--color-line)] bg-white/86 shadow-[0_16px_40px_-34px_rgba(17,24,39,0.35)] backdrop-blur-xl'
          : 'border-transparent bg-white/24 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          <a href={homeHref} className="type-display text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Damon.
          </a>

          <div className="hidden gap-6 text-sm font-medium text-zinc-700 sm:flex">
            <a href={homeHref} className="transition-colors hover:text-zinc-900">
              Home
            </a>
            <Link to="/about" className="transition-colors hover:text-zinc-900">
              About
            </Link>
          </div>

          <a
            href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-zinc-300 bg-white/90 px-4 py-1.5 text-xs font-semibold tracking-wide text-zinc-900 transition hover:border-zinc-400 hover:bg-white"
          >
            Connect
          </a>
        </div>
      </div>
    </nav>
  );
}
