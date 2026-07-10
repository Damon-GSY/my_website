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
        animate('.hero-reveal', {
          opacity: [0, 1],
          y: [22, 0],
          duration: 720,
          delay: stagger(78),
          ease: 'out(4)',
        });

        animate('.hero-rule-reveal', {
          opacity: [0, 1],
          scaleX: [0, 1],
          duration: 920,
          delay: 180,
          ease: 'out(5)',
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
        <div className="editorial-hero__index hero-reveal" aria-hidden="true">
          <span>Portfolio / 2026</span>
          <span>30.27° N, 120.15° E</span>
        </div>

        <div className="editorial-hero__copy">
          <p className="editorial-hero__eyebrow hero-reveal">
            AI researcher · Hangzhou
          </p>

          <h1
            id="hero-heading"
            className="editorial-hero__name hero-reveal"
            aria-label="Damon Guo-Shiyu"
          >
            <span>Damon{' '}</span>
            <span>Guo-Shiyu</span>
          </h1>

          <p className="editorial-hero__role hero-reveal">
            LLM Engineer at <strong>Alibaba</strong>.
          </p>

          <p className="editorial-hero__statement hero-reveal">
            I research and ship learning systems for agents—how they are
            post-trained, evaluated, and improved through agentic reinforcement
            learning.
          </p>

          <ul className="editorial-hero__focus hero-reveal" aria-label="Research focus">
            {focusAreas.map((area, index) => (
              <li key={area}>
                <span aria-hidden="true">0{index + 1}</span>
                {area}
              </li>
            ))}
          </ul>

          <div className="editorial-hero__actions hero-reveal">
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

        <div className="editorial-hero__caption hero-reveal">
          <span className="editorial-hero__caption-rule hero-rule-reveal" />
          <p>
            Optimization landscape
            <span> Scroll to trace the signal.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
