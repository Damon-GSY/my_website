import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import landscapeDesktop from '../../assets/optimization-landscape-2200.webp';
import landscapeMobile from '../../assets/optimization-landscape-1100.webp';

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function getReducedMotionPreference() {
  return typeof window !== 'undefined'
    ? window.matchMedia(REDUCED_MOTION_QUERY).matches
    : false;
}

export default function OptimizationLandscape() {
  const sceneRef = useRef(null);
  const planeRef = useRef(null);
  const beaconRef = useRef(null);
  const particlesRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(
    getReducedMotionPreference,
  );

  useEffect(() => {
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const handlePreferenceChange = (event) => setReducedMotion(event.matches);

    motionQuery.addEventListener('change', handlePreferenceChange);
    return () => motionQuery.removeEventListener('change', handlePreferenceChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      scrollProgressRef.current = 0;
      return undefined;
    }

    const scene = sceneRef.current;
    const hero = scene?.closest('.editorial-hero');
    if (!scene || !hero) return undefined;

    let disposed = false;
    let p5Instance;
    let resizeObserver;
    let visibilityObserver;
    let idleCallbackId;
    let fallbackTimerId;

    const gsapContext = gsap.context(() => {
      gsap.to(planeRef.current, {
        rotateX: 7,
        scale: 1.075,
        yPercent: 4.5,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            scrollProgressRef.current = self.progress;
          },
        },
      });

      gsap.to(beaconRef.current, {
        x: () => Math.min(window.innerWidth * 0.29, 390),
        y: () => Math.min(window.innerHeight * 0.31, 300),
        scale: 0.72,
        opacity: 0.28,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      });
    }, scene);

    const mountParticles = async () => {
      try {
        const p5Module = await import('p5');
        if (disposed || !particlesRef.current) return;

        const P5 = p5Module.default;
        p5Instance = new P5((p) => {
          let particles = [];

          const createParticles = () => {
            const width = particlesRef.current?.clientWidth ?? 0;
            const particleCount = width < 700 ? 24 : 46;
            particles = Array.from({ length: particleCount }, (_, index) => ({
              phase: index / particleCount,
              speed: 0.00013 + (index % 7) * 0.000012,
              offset: ((index * 17) % 19) - 9,
              size: 0.7 + (index % 5) * 0.32,
              alpha: 42 + (index % 6) * 14,
            }));
          };

          const resizeCanvas = () => {
            const host = particlesRef.current;
            if (!host) return;
            p.resizeCanvas(host.clientWidth, host.clientHeight, true);
            createParticles();
          };

          p.setup = () => {
            if (disposed) {
              p.noLoop();
              return;
            }

            const host = particlesRef.current;
            if (!host) return;
            const canvas = p.createCanvas(host.clientWidth, host.clientHeight);
            canvas.parent(host);
            p.pixelDensity(Math.min(window.devicePixelRatio || 1, 1.5));
            p.frameRate(30);
            p.noStroke();
            createParticles();
            p.noLoop();

            resizeObserver = new ResizeObserver(resizeCanvas);
            resizeObserver.observe(host);

            visibilityObserver = new IntersectionObserver(
              ([entry]) => {
                if (disposed) return;

                if (entry.isIntersecting) {
                  p.loop();
                } else {
                  p.noLoop();
                }
              },
              { threshold: 0.01 },
            );
            visibilityObserver.observe(scene);
          };

          p.draw = () => {
            p.clear();

            const progress = scrollProgressRef.current;
            const now = p.millis();
            const width = p.width;
            const height = p.height;

            particles.forEach((particle) => {
              const travel = (particle.phase + now * particle.speed + progress * 0.14) % 1;
              const x = width * (0.17 + travel * 0.7);
              const ridge =
                height * (0.625 - 0.085 * Math.sin(travel * Math.PI * 2.1)) -
                height * 0.065 * Math.exp(-Math.pow((travel - 0.34) * 5, 2));
              const y = ridge + particle.offset + progress * height * 0.025;
              const emphasis = Math.max(0.22, Math.sin(travel * Math.PI));

              p.fill(218, 145, 104, particle.alpha * emphasis);
              p.circle(x, y, particle.size * emphasis);
            });
          };
        }, particlesRef.current);
      } catch {
        // The responsive image is the complete visual fallback if p5 is unavailable.
      }
    };

    if ('requestIdleCallback' in window) {
      idleCallbackId = window.requestIdleCallback(mountParticles, {
        timeout: 700,
      });
    } else {
      fallbackTimerId = window.setTimeout(mountParticles, 160);
    }

    return () => {
      disposed = true;
      if (idleCallbackId !== undefined) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (fallbackTimerId !== undefined) {
        window.clearTimeout(fallbackTimerId);
      }
      visibilityObserver?.disconnect();
      resizeObserver?.disconnect();
      p5Instance?.remove();
      gsapContext.revert();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={sceneRef}
      className="optimization-landscape"
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      aria-hidden="true"
    >
      <div ref={planeRef} className="optimization-landscape__plane">
        <picture>
          <source media="(max-width: 47.999rem)" srcSet={landscapeMobile} />
          <img
            className="optimization-landscape__image"
            src={landscapeDesktop}
            width="2200"
            height="1232"
            alt=""
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>
      <div className="optimization-landscape__reflection" />
      <div ref={beaconRef} className="optimization-landscape__beacon" />
      {!reducedMotion && (
        <div
          ref={particlesRef}
          className="optimization-landscape__particles"
          data-landscape-particles
        />
      )}
      <div className="optimization-landscape__contrast" />
    </div>
  );
}
