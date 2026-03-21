import styled from 'styled-components';

const navLinks = [
  { label: 'How I Help', href: '#help' },
  { label: 'About', href: '#about' },
  { label: 'Writing', href: '#writing' },
  { label: 'Newsletter', href: '#newsletter' },
];

export default function Navbar() {
  return (
    <StyledWrapper>
      <header className="site-nav">
        <div className="container nav-inner">
          <a href="#home" className="brand">Damon</a>
          <nav className="nav-links" aria-label="Primary">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </nav>
          <a href="#newsletter" className="nav-cta">Join Newsletter</a>
        </div>
      </header>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .site-nav {
    position: sticky;
    top: 0;
    z-index: 20;
    backdrop-filter: blur(10px);
    background: color-mix(in srgb, var(--bg) 86%, white);
    border-bottom: 1px solid var(--line);
  }

  .nav-inner {
    min-height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .brand {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text);
    letter-spacing: 0.02em;
  }

  .nav-links {
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-links a {
    color: var(--muted);
    font-size: 0.95rem;
    font-weight: 500;
  }

  .nav-links a:hover {
    color: var(--text);
  }

  .nav-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.65rem 1rem;
    border-radius: 999px;
    background: var(--primary);
    color: #fff;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .nav-cta:hover {
    background: var(--primary-strong);
  }

  @media (max-width: 900px) {
    .nav-inner {
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
      min-height: 0;
      flex-wrap: wrap;
      justify-content: center;
    }
  }
`;
