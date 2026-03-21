import styled from 'styled-components';
import { BlurFade } from './ui/blur-fade';

const socials = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
  { label: 'Bilibili', href: 'https://bilibili.com' },
];

export default function Contact() {
  return (
    <StyledWrapper>
      <section className="section" id="contact">
        <div className="container">
          <BlurFade delay={0.1} inView>
            <div className="contact-card">
              <p className="kicker">Get in Touch</p>
              <h2>Let's build something together.</h2>
              <p className="subtitle">
                I'm always open to discussing new projects, creative ideas, or opportunities to
                collaborate on AI and productivity tools.
              </p>

              <div className="contact-actions">
                <a href="mailto:hello@damon.dev" className="contact-button">
                  Say Hello
                </a>
              </div>

              <div className="social-section">
                <p className="social-hint">Or find me on</p>
                <div className="social-links">
                  {socials.map((social) => (
                    <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .contact-card {
    border-radius: var(--radius-xl);
    border: 1px solid var(--line);
    background: linear-gradient(140deg, #ffffff, #f8fcfb);
    box-shadow: var(--shadow-soft);
    padding: clamp(1.5rem, 3vw, 2.5rem);
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }

  .kicker {
    margin: 0;
    color: var(--muted);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  h2 {
    margin: 0.65rem 0 0;
    font-size: clamp(1.5rem, 2.7vw, 2.25rem);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .subtitle {
    margin: 1rem 0 0;
    max-width: 50ch;
    margin-left: auto;
    margin-right: auto;
    color: var(--muted);
    line-height: 1.7;
  }

  .contact-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: center;
  }

  .contact-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--primary);
    color: #fff;
    padding: 0.85rem 1.8rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    box-shadow: 0 4px 15px rgba(16, 114, 90, 0.3);
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .contact-button:hover {
    background: var(--primary-strong);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 114, 90, 0.4);
  }

  .social-section {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--line);
  }

  .social-hint {
    margin: 0;
    color: var(--muted);
    font-size: 0.85rem;
  }

  .social-links {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .social-links a {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: 1px solid var(--line);
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-size: 0.9rem;
    color: var(--text);
    background: var(--surface);
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .social-links a:hover {
    color: var(--primary-strong);
    border-color: var(--primary);
    transform: translateY(-2px);
  }

  @media (prefers-color-scheme: dark) {
    .contact-card {
      background: linear-gradient(140deg, #1e293b, #0f172a);
    }
  }
`;
