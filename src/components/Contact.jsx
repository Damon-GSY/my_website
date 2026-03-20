import styled from 'styled-components';
import { SocialButtons } from './index';

export default function Contact() {
  return (
    <StyledWrapper>
      <section className="contact-section">
        <h2 className="section-title">Get in Touch</h2>
        <p className="contact-text">
          Feel free to reach out. I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
        </p>
        <div className="contact-content">
          <a href="mailto:hello@example.com" className="contact-btn">
            <span className="btn-icon">✉️</span>
            Say Hello
          </a>
          <div className="divider">
            <span>or connect with me</span>
          </div>
          <div className="social-container">
            <SocialButtons />
          </div>
        </div>
      </section>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .contact-section {
    padding: 6rem 0;
    text-align: center;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1rem;
    font-family: 'Cartograph CF', "Poppins", system-ui, sans-serif;
    color: #1a1a1a;
  }

  .contact-text {
    color: #64748b;
    font-size: 1rem;
    margin-bottom: 2.5rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }

  .contact-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .contact-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: #fff;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 600;
    font-family: 'Cartograph CF', "Poppins", system-ui, sans-serif;
    font-size: 1rem;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    &:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
    }

    &:active {
      transform: translateY(-1px) scale(0.98);
    }

    .btn-icon {
      font-size: 1.2rem;
    }
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    max-width: 400px;
    margin-top: 1rem;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
    }

    span {
      color: #94a3b8;
      font-size: 0.875rem;
      white-space: nowrap;
    }
  }

  .social-container {
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    border-radius: 24px;
    padding: 0.5rem 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    margin-top: 0.5rem;
  }

  @media (prefers-color-scheme: dark) {
    .section-title {
      color: #f1f5f9;
    }

    .contact-text {
      color: #94a3b8;
    }

    .divider {
      &::before,
      &::after {
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      }

      span {
        color: #64748b;
      }
    }

    .social-container {
      background: linear-gradient(145deg, #1e293b, #0f172a);
    }
  }
`;
