import styled from 'styled-components';
import { ShinyButton, RingLoader } from './index';

export default function Hero() {
  return (
    <StyledWrapper>
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            I build{' '}
            <span className="ai-text">
              AI
              <div className="ai-tooltip">
                <span>Agent</span>
                <span>Foundation Model</span>
              </div>
            </span>
          </h1>
          <p className="hero-subtitle">Crafting intelligent systems that think, learn, and create.</p>
          <div className="hero-cta">
            <ShinyButton text="Explore my work" />
          </div>
        </div>
        <div className="hero-decoration">
          <RingLoader size={180} />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .hero-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    gap: 4rem;
  }

  .hero-content {
    text-align: center;
    z-index: 1;
  }

  .hero-title {
    font-size: clamp(3rem, 10vw, 5rem);
    font-weight: 700;
    font-family: 'Cartograph CF', "Poppins", system-ui, sans-serif;
    color: #1a1a1a;
    margin-bottom: 1rem;
  }

  .hero-subtitle {
    font-size: clamp(1rem, 2vw, 1.25rem);
    color: #64748b;
    margin-bottom: 2rem;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .ai-text {
    position: relative;
    color: #3b82f6;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-style: wavy;
    text-decoration-color: #3b82f6;
    text-underline-offset: 8px;
    transition: all 0.3s ease;

    &:hover {
      color: #2563eb;
    }

    &:hover .ai-tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
  }

  .ai-tooltip {
    position: absolute;
    left: 50%;
    top: 100%;
    transform: translateX(-50%) translateY(-10px);
    margin-top: 1rem;
    background: linear-gradient(145deg, #1e293b, #0f172a);
    color: #fff;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 400;
    white-space: nowrap;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    z-index: 100;

    &::before {
      content: "";
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 8px solid #1e293b;
    }

    span {
      display: block;
      padding: 0.25rem 0;

      &:not(:last-child) {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
    }
  }

  .hero-cta {
    display: flex;
    justify-content: center;
  }

  .hero-decoration {
    position: absolute;
    right: 10%;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.6;
    pointer-events: none;
  }

  @media (max-width: 1024px) {
    .hero-decoration {
      display: none;
    }
  }

  @media (prefers-color-scheme: dark) {
    .hero-title {
      color: #f1f5f9;
    }

    .hero-subtitle {
      color: #94a3b8;
    }
  }
`;
