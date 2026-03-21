import styled from 'styled-components';

const links = [
  { label: 'How I Help', href: '#help' },
  { label: 'Writing', href: '#writing' },
  { label: 'Newsletter', href: '#newsletter' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <StyledWrapper>
      <footer className="footer">
        <div className="container footer-inner">
          <p className="brand">Damon</p>

          <nav className="footer-links" aria-label="Footer">
            {links.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </nav>

          <p className="copyright">© {year} Damon. All rights reserved.</p>
        </div>
      </footer>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .footer {
    margin-top: 2.5rem;
    border-top: 1px solid var(--line);
  }

  .footer-inner {
    padding-top: 1.25rem;
    padding-bottom: 1.6rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .brand {
    margin: 0;
    font-weight: 700;
    color: var(--text);
  }

  .footer-links {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .footer-links a {
    color: var(--muted);
    font-size: 0.9rem;
  }

  .footer-links a:hover {
    color: var(--text);
  }

  .copyright {
    margin: 0;
    color: var(--muted);
    font-size: 0.84rem;
  }
`;
