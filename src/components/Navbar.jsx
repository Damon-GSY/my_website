import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { label: 'Home', to: '/', isHash: true },
  { label: 'Work', to: '/projects' },
  { label: 'Notes', to: '/blog' },
  { label: 'About', to: '/about' },
  { label: 'Uses', to: '/uses' },
];

function LiveTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Shanghai',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono tabular-nums">{time}</span>;
}

export default function Navbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHomePage = pathname === '/';
  const homeHref = isHomePage ? '#home' : '/#home';

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') closeMobile(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (path) => path === '/' ? isHomePage : pathname === path;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header className="absolute inset-x-0 top-3 z-50 px-3 md:fixed md:top-4">
        <div className="mx-auto max-w-7xl">
          <div className="glass flex h-12 items-center justify-between gap-3 rounded-full border border-[var(--line)] px-2.5 shadow-[0_18px_70px_-45px_var(--primary)] md:px-3">
            <a href={homeHref} className="flex items-center gap-2.5 shrink-0">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--bg)] font-display font-bold text-sm">
                D
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[var(--bg)] animate-pulse" />
              </span>
              <span className="hidden sm:inline font-display font-semibold tracking-tight text-[var(--text)]">
                Damon
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
              {navLinks.map((link) => {
                const active = isActive(link.to);
                const Wrapper = link.isHash ? 'a' : Link;
                const props = link.isHash ? { href: homeHref } : { to: link.to };
                return (
                  <Wrapper
                    key={link.to}
                    {...props}
                    className={`relative px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      active
                        ? 'text-[var(--text)]'
                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-[var(--surface-strong)]"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                  </Wrapper>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-[var(--line)] px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>CST</span>
                <LiveTime />
              </div>
              <ThemeToggle />
              <a
                href="mailto:hello@damon.ai"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--primary-strong)] active:scale-[0.97]"
              >
                Contact
              </a>
              <button
                className="rounded-full border border-[var(--line)] p-2 text-[var(--muted)] hover:text-[var(--text)] md:hidden"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileOpen(v => !v)}
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={closeMobile} aria-hidden="true" />
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            className="fixed left-3 right-3 top-20 z-[60] overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] shadow-[0_24px_90px_-45px_var(--primary)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
              <span className="font-display font-bold">Menu</span>
              <button onClick={closeMobile} aria-label="Close" className="rounded-md p-2 text-[var(--muted)] hover:text-[var(--text)]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col p-3" aria-label="Mobile navigation">
              {navLinks.map((link) => {
                const Wrapper = link.isHash ? 'a' : Link;
                const props = link.isHash ? { href: homeHref } : { to: link.to };
                return (
                  <Wrapper key={link.to} {...props} onClick={closeMobile}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]">
                    {link.label}
                  </Wrapper>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
