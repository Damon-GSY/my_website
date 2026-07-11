import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { label: 'Home', to: '/', homeAnchor: true },
  { label: 'Work', to: '/projects' },
  { label: 'Writing', to: '/blog' },
  { label: 'About', to: '/about' },
  { label: 'Uses', to: '/uses' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const menuButtonRef = useRef(null);
  const isHomePage = pathname === '/';
  const homeHref = isHomePage ? '#home' : '/#home';

  const closeMobile = useCallback((restoreFocus = true) => {
    setMobileOpen(false);
    if (restoreFocus) requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobile();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = Array.from(dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? []).filter((element) => !element.hasAttribute('hidden'));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialogRef.current?.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const background = [document.querySelector('main'), document.querySelector('footer')]
      .filter(Boolean)
      .map((element) => ({
        element,
        wasInert: element.inert,
        hadInertAttribute: element.hasAttribute('inert'),
      }));

    document.body.style.overflow = 'hidden';
    background.forEach(({ element }) => { element.inert = true; });

    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach(({ element, wasInert, hadInertAttribute }) => {
        element.inert = wasInert;
        if (!hadInertAttribute) element.removeAttribute('inert');
      });
    };
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (path) => {
    if (path === '/') return isHomePage;
    if (path === '/blog') return pathname === '/blog' || pathname.startsWith('/blog/');
    return pathname === path;
  };

  const renderLink = (link, mobile = false) => {
    const active = isActive(link.to);
    const Wrapper = link.homeAnchor ? 'a' : Link;
    const props = link.homeAnchor ? { href: homeHref } : { to: link.to };

    return (
      <Wrapper
        key={link.to}
        {...props}
        onClick={mobile ? () => closeMobile() : undefined}
        aria-current={active ? 'page' : undefined}
        className={mobile
          ? `border-b border-[var(--line)] py-4 font-display text-3xl tracking-[-0.03em] transition-colors ${active ? 'text-[var(--primary)]' : 'text-[var(--text)] hover:text-[var(--primary)]'}`
          : `relative py-1 text-sm transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-[var(--primary)] after:transition-transform ${active ? 'text-[var(--text)] after:scale-x-100' : 'text-[var(--muted)] after:scale-x-0 hover:text-[var(--text)] hover:after:scale-x-100'}`}
      >
        {link.label}
      </Wrapper>
    );
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <a
            href={homeHref}
            className="group shrink-0 leading-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
            aria-label="Damon Guo-Shiyu — home"
          >
            <span className="block font-display text-lg font-medium tracking-[-0.025em] text-[var(--text)] transition-colors group-hover:text-[var(--primary)]">
              Damon Guo-Shiyu
            </span>
            <span className="mt-1 hidden font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[var(--muted)] sm:block">
              LLM engineer · researcher
            </span>
          </a>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            {navLinks.map((link) => renderLink(link))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={isHomePage ? '#contact' : '/#contact'}
              className="hidden border-l border-[var(--line)] pl-4 text-sm font-medium text-[var(--text)] transition-colors hover:text-[var(--primary)] sm:inline-flex"
            >
              Start a conversation
            </a>
            <button
              ref={menuButtonRef}
              type="button"
              className="p-2 text-[var(--muted)] transition-colors hover:text-[var(--text)] md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => (mobileOpen ? closeMobile() : setMobileOpen(true))}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[55] cursor-default bg-black/55"
            onClick={() => closeMobile()}
            aria-hidden="true"
          />
          <div
            ref={dialogRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="fixed inset-x-0 top-0 z-[60] max-h-dvh overflow-y-auto border-b border-[var(--line)] bg-[var(--bg)] px-4 pb-8 pt-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <span className="font-display text-lg text-[var(--text)]">Damon Guo-Shiyu</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => closeMobile()}
                aria-label="Close menu"
                className="p-2 text-[var(--muted)] hover:text-[var(--text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col" aria-label="Mobile navigation links">
              {navLinks.map((link) => renderLink(link, true))}
            </nav>
            <a
              href={isHomePage ? '#contact' : '/#contact'}
              onClick={() => closeMobile()}
              className="mt-7 inline-flex border-b border-[var(--primary)] pb-1 text-sm font-medium text-[var(--text)]"
            >
              Start a conversation
            </a>
          </div>
        </>
      )}
    </>
  );
}
