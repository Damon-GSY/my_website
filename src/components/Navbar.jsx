import { startTransition, useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') closeMobile(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const solid = !isHomePage || scrolled;

  const mobileLinkClass =
    'block rounded-lg px-4 py-3 text-base font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)]';

  return (
    <>
      <nav
        aria-label="Main navigation"
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
              <Link to="/uses" className="transition-colors hover:text-[var(--text)]">
                Uses
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="sm:hidden rounded-full bg-[var(--surface-soft)] p-2 text-[var(--muted)] transition-colors hover:text-[var(--text)] [box-shadow:0_0_0_1px_var(--line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-sheet"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
              <ThemeToggle />
              <a
                href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[var(--muted-strong)] transition-[box-shadow] [box-shadow:0_0_0_1px_var(--ring)] hover:[box-shadow:0_0_0_1px_var(--ring-strong)]"
              >
                Connect
              </a>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <div
            id="mobile-nav-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed right-0 top-0 z-[60] h-full w-72 border-l border-[var(--line)] bg-[var(--bg)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
              <span className="type-display text-lg font-bold text-[var(--text)]">Damon.</span>
              <button
                onClick={closeMobile}
                aria-label="Close navigation menu"
                className="rounded-full p-2 text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              <a href={homeHref} onClick={closeMobile} className={mobileLinkClass}>
                Home
              </a>
              <Link to="/projects" onClick={closeMobile} className={mobileLinkClass}>
                Projects
              </Link>
              <Link to="/blog" onClick={closeMobile} className={mobileLinkClass}>
                Blog
              </Link>
              <Link to="/about" onClick={closeMobile} className={mobileLinkClass}>
                About
              </Link>
              <Link to="/uses" onClick={closeMobile} className={mobileLinkClass}>
                Uses
              </Link>
              <a
                href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
                target="_blank"
                rel="noreferrer"
                onClick={closeMobile}
                className={`${mobileLinkClass} mt-2 border-t border-[var(--line)] pt-4`}
              >
                Connect on LinkedIn
              </a>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
