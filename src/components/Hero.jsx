import styled from 'styled-components';
import { TextShimmer } from './ui/text-shimmer';

const stats = [
  { value: '120+', label: 'Practical essays published' },
  { value: '50K+', label: 'Monthly readers' },
  { value: '10+', label: 'Years building products' },
];

export default function Hero() {
  return (
    <StyledWrapper>
      <section className="hero" id="home">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Hi, I'm Damon.</p>
            <h1 className="hero-title">
              I build{' '}
              <TextShimmer
                as="span"
                duration={2.5}
                spread={3}
                className="text-shimmer-ai [--base-color:#3b82f6] [--base-gradient-color:#8b5cf6] dark:[--base-color:#60a5fa] dark:[--base-gradient-color:#a78bfa]"
              >
                AI
              </TextShimmer>
              {' '}systems that help people work{' '}
              <span className="highlight">better</span>
              {' '}and{' '}
              <span className="highlight">smarter</span>.
            </h1>
            <p className="hero-subtitle">
              Product builder, writer, and creator. I share practical ideas about
              productivity, AI workflows, and online business every week.
            </p>

            <div className="hero-cta">
              <a href="#contact" className="primary">Get Weekly Insights</a>
              <a href="#writing" className="secondary">Browse Writing</a>
            </div>

            <ul className="hero-stats">
              {stats.map((stat) => (
                <li key={stat.label}>
                  <span className="value">{stat.value}</span>
                  <span className="label">{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-visual">
            <div className="image-card">
              <div className="visual-placeholder">
                <div className="placeholder-ring"></div>
              </div>
              <p className="card-note">
                New weekly newsletter:
                <strong> Better, Not Busier</strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .hero {
    padding: 5rem 0 4rem;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 2.25rem;
    align-items: center;
  }

  .hero-copy {
    max-width: 640px;
  }

  .eyebrow {
    display: inline-block;
    margin: 0 0 1rem;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    background: var(--surface-soft);
    border: 1px solid var(--line);
    padding: 0.3rem 0.65rem;
    border-radius: 999px;
  }

  .hero-title {
    margin: 0;
    font-size: clamp(2.1rem, 5vw, 3.7rem);
    font-weight: 700;
    line-height: 1.12;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  .text-shimmer-ai {
    font-weight: 700;
  }

  .highlight {
    color: var(--primary-strong);
  }

  .hero-subtitle {
    margin: 1.2rem 0 0;
    font-size: clamp(1rem, 2vw, 1.15rem);
    color: var(--muted);
    max-width: 56ch;
  }

  .hero-cta {
    margin-top: 2rem;
    display: flex;
    gap: 0.85rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .hero-cta a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 0.75rem 1.4rem;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    cursor: pointer;
    text-decoration: none;
  }

  .hero-cta .primary {
    background: var(--primary);
    color: #fff;
    border: none;
    box-shadow: 0 4px 15px rgba(16, 114, 90, 0.3);
  }

  .hero-cta .primary:hover {
    background: var(--primary-strong);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 114, 90, 0.4);
  }

  .hero-cta .secondary {
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--line);
  }

  .hero-cta .secondary:hover {
    border-color: var(--primary);
    color: var(--primary-strong);
    transform: translateY(-2px);
  }

  .hero-stats {
    margin: 2.2rem 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.9rem;
  }

  .hero-stats li {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    padding: 0.85rem 0.95rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .hero-stats li:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-soft);
  }

  .hero-stats .value {
    display: block;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text);
  }

  .hero-stats .label {
    display: block;
    margin-top: 0.2rem;
    font-size: 0.8rem;
    color: var(--muted);
  }

  .hero-visual {
    display: flex;
    justify-content: flex-end;
  }

  .image-card {
    width: min(460px, 100%);
    padding: 0.8rem;
    border-radius: calc(var(--radius-lg) + 0.2rem);
    border: 1px solid var(--line);
    background: var(--surface);
    box-shadow: var(--shadow-soft);
  }

  .visual-placeholder {
    width: 100%;
    aspect-ratio: 4 / 5;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .placeholder-ring {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      #3b82f6,
      #8b5cf6,
      #ec4899,
      #3b82f6
    );
    animation: spin 8s linear infinite;
    opacity: 0.6;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .card-note {
    margin: 0.8rem 0 0.2rem;
    color: var(--muted);
    font-size: 0.9rem;
  }

  .card-note strong {
    color: var(--text);
  }

  @media (max-width: 1024px) {
    .hero-grid {
      grid-template-columns: 1fr;
    }

    .hero-visual {
      justify-content: flex-start;
    }
  }

  @media (max-width: 760px) {
    .hero {
      padding-top: 3.5rem;
    }

    .hero-stats {
      grid-template-columns: 1fr;
    }
  }
`;
