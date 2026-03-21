import styled from 'styled-components';

export default function TopicCard({ eyebrow, title, description, cta }) {
  return (
    <StyledWrapper>
      <article className="topic-card">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p className="description">{description}</p>
        <a href="#newsletter" className="card-link">
          {cta}
          <span aria-hidden="true">→</span>
        </a>
      </article>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .topic-card {
    height: 100%;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 1.35rem;
    box-shadow: var(--shadow-soft);
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  .topic-card:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--primary) 35%, var(--line));
  }

  .eyebrow {
    margin: 0;
    color: var(--muted);
    font-size: 0.76rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h3 {
    margin: 0.65rem 0 0;
    font-size: 1.2rem;
    line-height: 1.3;
  }

  .description {
    margin: 0.9rem 0 0;
    color: var(--muted);
    line-height: 1.65;
    font-size: 0.95rem;
  }

  .card-link {
    margin-top: 1rem;
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
    color: var(--primary-strong);
    font-weight: 600;
    font-size: 0.92rem;
  }

  .card-link span {
    transition: transform 0.2s ease;
  }

  .card-link:hover span {
    transform: translateX(2px);
  }
`;
