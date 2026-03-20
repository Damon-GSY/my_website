import styled from 'styled-components';

export default function About() {
  return (
    <StyledWrapper>
      <section className="about-section">
        <div className="about-container">
          <div className="about-image">
            <div className="avatar-ring"></div>
            <span className="avatar-placeholder">👨‍💻</span>
          </div>
          <div className="about-content">
            <h2 className="section-title">About Me</h2>
            <p className="about-text">
              I'm passionate about building AI systems that make a difference.
              Currently focused on Agents and Foundation Models.
            </p>
            <div className="about-stats">
              <div className="stat">
                <span className="stat-number">∞</span>
                <span className="stat-label">Curiosity</span>
              </div>
              <div className="stat">
                <span className="stat-number">🚀</span>
                <span className="stat-label">Building</span>
              </div>
              <div className="stat">
                <span className="stat-number">☕</span>
                <span className="stat-label">Powered by</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .about-section {
    padding: 6rem 0;
  }

  .about-container {
    display: flex;
    align-items: center;
    gap: 4rem;
    max-width: 800px;
    margin: 0 auto;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
      gap: 2rem;
    }
  }

  .about-image {
    position: relative;
    flex-shrink: 0;
  }

  .avatar-ring {
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      #3b82f6,
      #8b5cf6,
      #ec4899,
      #3b82f6
    );
    animation: spin 4s linear infinite;
    opacity: 0.6;

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  }

  .avatar-placeholder {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: linear-gradient(145deg, #f8fafc, #e2e8f0);
    font-size: 4rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }

  .about-content {
    flex: 1;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    font-family: 'Cartograph CF', "Poppins", system-ui, sans-serif;
    color: #1a1a1a;
  }

  .about-text {
    color: #64748b;
    font-size: 1.1rem;
    line-height: 1.7;
    margin-bottom: 2rem;
  }

  .about-stats {
    display: flex;
    gap: 2rem;

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @media (prefers-color-scheme: dark) {
    .avatar-placeholder {
      background: linear-gradient(145deg, #1e293b, #0f172a);
    }

    .section-title {
      color: #f1f5f9;
    }

    .about-text {
      color: #94a3b8;
    }

    .stat-label {
      color: #64748b;
    }
  }
`;
