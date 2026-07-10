import { useEffect, useRef } from 'react';
import { animate, createScope, stagger } from 'animejs';
import OptimizationLandscape from './visuals/OptimizationLandscape';

const focusAreas = [
  'Agent systems',
  'Post-training',
  'Evaluation',
  'Agentic RL',
];

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reducedMotion) return undefined;

    let entranceScope;
    const frame = window.requestAnimationFrame(() => {
      entranceScope = createScope({ root: heroRef }).add(() => {
        animate('.hero-enter-eyebrow', {
          opacity: [0, 1],
          y: [14, 0],
          duration: 620,
          ease: 'out(4)',
        });

        animate('.hero-enter-name-line', {
          opacity: [0, 1],
          y: [28, 0],
          duration: 760,
          delay: stagger(95, { start: 90 }),
          ease: 'out(5)',
        });

        animate('.hero-enter-description', {
          opacity: [0, 1],
          y: [16, 0],
          duration: 650,
          delay: 280,
          ease: 'out(4)',
        });

        animate('.hero-enter-actions', {
          opacity: [0, 1],
          y: [14, 0],
          duration: 620,
          delay: 390,
          ease: 'out(4)',
        });
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      entranceScope?.revert();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="editorial-hero"
      id="home"
      aria-labelledby="hero-heading"
    >
      <OptimizationLandscape />

      <div className="editorial-hero__frame">
        <div className="editorial-hero__index" aria-hidden="true">
          <span>Portfolio / 2026</span>
          <span>30.27° N, 120.15° E</span>
        </div>

        <div className="editorial-hero__copy">
          <p className="editorial-hero__eyebrow hero-enter-eyebrow">
            AI researcher · Hangzhou
          </p>

          <h1
            id="hero-heading"
            className="editorial-hero__name"
            aria-label="Damon Guo-Shiyu"
          >
            <span className="hero-enter-name-line">Damon{' '}</span>
            <span className="hero-enter-name-line">Guo-Shiyu</span>
          </h1>

          <p className="editorial-hero__role">
            LLM Engineer at <strong>Alibaba</strong>.
          </p>

          <p className="editorial-hero__statement hero-enter-description">
            I research and ship learning systems for agents—how they are
            post-trained, evaluated, and improved through agentic reinforcement
            learning.
          </p>

          <ul className="editorial-hero__focus" aria-label="Research focus">
            {focusAreas.map((area, index) => (
              <li key={area}>
                <span aria-hidden="true">0{index + 1}</span>
                {area}
              </li>
            ))}
          </ul>

          <ul className="editorial-hero__proof" aria-label="Profile facts">
            <li>4 research works</li>
            <li>NUS Statistics · Top 5%</li>
            <li>UNSW Computer Science · Top 3%</li>
          </ul>

          <div className="editorial-hero__actions hero-enter-actions">
            <a className="editorial-hero__action editorial-hero__action--primary" href="#work">
              <span>Selected work</span>
              <span className="editorial-hero__action-mark" aria-hidden="true">
                ↓
              </span>
            </a>
            <a className="editorial-hero__action" href="#contact">
              <span>Contact</span>
              <span className="editorial-hero__action-mark" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </div>

        <div className="editorial-hero__caption">
          <span className="editorial-hero__caption-rule" />
          <p>
            Optimization landscape
            <span> Scroll to trace the signal.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
