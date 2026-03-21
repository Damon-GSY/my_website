import styled from 'styled-components';
import { BlurFade } from './ui/blur-fade';

const principles = [
  'Clarity beats complexity.',
  'Consistency beats intensity.',
  'Systems beat motivation.',
];

export default function About() {
  return (
    <StyledWrapper>
      <section className="section" id="about">
        <div className="container about-layout">
          <BlurFade delay={0.1} inView>
            <div>
              <p className="kicker">About</p>
              <h2>Designing a calmer and more effective way to work.</h2>
            </div>
          </BlurFade>

          <div className="about-body">
            <BlurFade delay={0.2} inView>
              <p>
                Over the last decade, I&apos;ve built products, teams, and content systems that help
                people ship meaningful work without sacrificing health or relationships.
              </p>
            </BlurFade>
            <BlurFade delay={0.3} inView>
              <p>
                My work combines practical productivity, thoughtful use of AI, and honest lessons
                from building in public.
              </p>
            </BlurFade>

            <BlurFade delay={0.4} inView>
              <ul>
                {principles.map((item, index) => (
                  <li key={item} style={{ animationDelay: `${index * 0.1}s` }}>{item}</li>
                ))}
              </ul>
            </BlurFade>
          </div>
        </div>
      </section>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .about-layout {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 1.5rem 2rem;
    align-items: start;
  }

  .kicker {
    margin: 0;
    color: var(--muted);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  h2 {
    margin: 0.6rem 0 0;
    font-size: clamp(1.65rem, 2.8vw, 2.3rem);
    line-height: 1.25;
    letter-spacing: -0.02em;
  }

  .about-body p {
    margin: 0;
    color: var(--muted);
    line-height: 1.8;
  }

  .about-body p + p {
    margin-top: 0.9rem;
  }

  ul {
    margin: 1.2rem 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0.55rem;
  }

  li {
    border: 1px solid var(--line);
    background: var(--surface);
    border-radius: var(--radius-md);
    padding: 0.65rem 0.8rem;
    font-size: 0.93rem;
    color: var(--text);
  }

  @media (max-width: 940px) {
    .about-layout {
      grid-template-columns: 1fr;
    }
  }
`;
