import styled from 'styled-components';

import TopicCard from './TopicCard';

const offers = [
  {
    eyebrow: '01',
    title: 'Build your personal operating system',
    description: 'Frameworks and templates to manage goals, tasks, and energy without burnout.',
    cta: 'See the framework',
  },
  {
    eyebrow: '02',
    title: 'Use AI as a practical thinking partner',
    description: 'Real workflows for research, planning, writing, and decision making using AI tools.',
    cta: 'Explore workflows',
  },
  {
    eyebrow: '03',
    title: 'Create meaningful content online',
    description: 'A clear system for turning your expertise into articles, videos, and digital products.',
    cta: 'Read the playbook',
  },
];

export default function Topics() {
  return (
    <StyledWrapper>
      <section className="section" id="help">
        <div className="container">
          <p className="section-kicker">How I can help</p>
          <h2 className="section-title">Practical systems for ambitious builders.</h2>
          <p className="section-intro">
            Everything here is designed to be applied in real life, not just admired in theory.
          </p>

          <div className="topics-grid">
            {offers.map((offer) => (
              <TopicCard key={offer.title} {...offer} />
            ))}
          </div>
        </div>
      </section>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .section-kicker {
    margin: 0;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
  }

  .section-title {
    margin: 0.65rem 0 0;
    font-size: clamp(1.7rem, 3vw, 2.45rem);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .section-intro {
    margin: 1rem 0 0;
    max-width: 62ch;
    color: var(--muted);
    font-size: 1.02rem;
  }

  .topics-grid {
    margin-top: 2rem;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  @media (max-width: 980px) {
    .topics-grid {
      grid-template-columns: 1fr;
    }
  }
`;
