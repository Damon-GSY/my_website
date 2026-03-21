'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';

type Particle = {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  color: string;
  opacity: number;
  originalAlpha: number;
  velocityX: number;
  velocityY: number;
  angle: number;
  speed: number;
  shouldFadeQuickly?: boolean;
};

interface VaporizeTextCycleProps {
  texts: string[];
  font?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: number;
  };
  color?: string;
  spread?: number;
  density?: number;
  animation?: {
    vaporizeDuration?: number;
    fadeInDuration?: number;
    waitDuration?: number;
  };
  direction?: 'left-to-right' | 'right-to-left';
  alignment?: 'left' | 'center' | 'right';
  className?: string;
}

export function VaporizeTextCycle({
  texts = ['Next.js', 'React'],
  font = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '50px',
    fontWeight: 400,
  },
  color = 'rgb(255, 255, 255)',
  spread = 5,
  density = 5,
  animation = {
    vaporizeDuration: 2,
    fadeInDuration: 1,
    waitDuration: 0.5,
  },
  direction = 'left-to-right',
  alignment = 'center',
  className,
}: VaporizeTextCycleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [animationState, setAnimationState] = useState<'static' | 'vaporizing' | 'fadingIn' | 'waiting'>('static');
  const vaporizeProgressRef = useRef(0);
  const fadeOpacityRef = useRef(0);
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });

  const globalDpr = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.devicePixelRatio * 1.5 || 1;
    }
    return 1;
  }, []);

  const animationDurations = useMemo(
    () => ({
      VAPORIZE_DURATION: (animation.vaporizeDuration ?? 2) * 1000,
      FADE_IN_DURATION: (animation.fadeInDuration ?? 1) * 1000,
      WAIT_DURATION: (animation.waitDuration ?? 0.5) * 1000,
    }),
    [animation.vaporizeDuration, animation.fadeInDuration, animation.waitDuration]
  );

  const transformedDensity = useMemo(() => {
    return Math.max(0.3, Math.min(1, density / 10));
  }, [density]);

  useEffect(() => {
    const container = wrapperRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setWrapperSize({ width, height });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !wrapperSize.width || !wrapperSize.height) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = wrapperSize;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * globalDpr);
    canvas.height = Math.floor(height * globalDpr);

    const fontSize = parseInt(font.fontSize?.replace('px', '') || '50');
    const fontStr = `${font.fontWeight ?? 400} ${fontSize * globalDpr}px ${font.fontFamily ?? 'sans-serif'}`;

    let textX: number;
    const textY = canvas.height / 2;
    const currentText = texts[currentTextIndex] || 'Text';

    if (alignment === 'center') {
      textX = canvas.width / 2;
    } else if (alignment === 'left') {
      textX = 0;
    } else {
      textX = canvas.width;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = fontStr;
    ctx.textAlign = alignment;
    ctx.textBaseline = 'middle';

    if ('fontKerning' in ctx) {
      (ctx as any).fontKerning = 'normal';
    }

    ctx.fillText(currentText, textX, textY);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const particles: Particle[] = [];
    const sampleRate = 4;

    for (let y = 0; y < canvas.height; y += sampleRate) {
      for (let x = 0; x < canvas.width; x += sampleRate) {
        const index = (y * canvas.width + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 0) {
          const originalAlpha = alpha / 255 * (sampleRate / globalDpr);
          particles.push({
            x,
            y,
            originalX: x,
            originalY: y,
            color: `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, ${originalAlpha})`,
            opacity: originalAlpha,
            originalAlpha,
            velocityX: 0,
            velocityY: 0,
            angle: 0,
            speed: 0,
          });
        }
      }
    }

    particlesRef.current = particles;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [texts, currentTextIndex, font, color, alignment, wrapperSize, globalDpr]);

  useEffect(() => {
    renderCanvas();

    const timeout = setTimeout(() => {
      setAnimationState('vaporizing');
    }, 500);

    return () => clearTimeout(timeout);
  }, [renderCanvas]);

  useEffect(() => {
    if (animationState === 'static') return;

    let lastTime = performance.now();
    let frameId: number;

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx || !particlesRef.current.length) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      switch (animationState) {
        case 'vaporizing': {
          vaporizeProgressRef.current += deltaTime * 100;

          const progress = Math.min(100, vaporizeProgressRef.current);
          const textWidth = canvas.width * 0.8;
          const vaporizeX =
            direction === 'left-to-right'
              ? (canvas.width - textWidth) / 2 + textWidth * (progress / 100)
              : (canvas.width + textWidth) / 2) - textWidth * (1 - progress / 100);

          let allVaporized = true;

          particlesRef.current.forEach((particle) => {
            const shouldVaporize =
              direction === 'left-to-right'
                ? particle.originalX <= vaporizeX
                : particle.originalX >= vaporizeX;

            if (shouldVaporize) {
              if (particle.speed === 0) {
                particle.angle = Math.random() * Math.PI * 2;
                particle.speed = Math.random() * spread + 0.5;
                particle.velocityX = Math.cos(particle.angle) * particle.speed;
                particle.velocityY = Math.sin(particle.angle) * particle.speed;
                particle.shouldFadeQuickly = Math.random() > transformedDensity;
              }

              if (particle.shouldFadeQuickly) {
                particle.opacity = Math.max(0, particle.opacity - deltaTime);
              } else {
                particle.velocityX *= 0.98;
                particle.velocityY *= 0.98;
                particle.x += particle.velocityX * deltaTime * 20;
                particle.y += particle.velocityY * deltaTime * 10;
                particle.opacity = Math.max(0, particle.opacity - deltaTime * 0.25);
              }

              if (particle.opacity > 0.01) {
                allVaporized = false;
              }

              if (particle.opacity > 0.01) {
                ctx.fillStyle = particle.color.replace(/[\d.]+\)$/, `${particle.opacity})`);
                ctx.fillRect(
                  particle.x / globalDpr,
                  particle.y / globalDpr,
                  1 * globalDpr,
                  1 * globalDpr
                );
              }
            } else {
              allVaporized = false;
              ctx.fillStyle = particle.color;
              ctx.fillRect(
                particle.x / globalDpr,
                particle.y / globalDpr,
                1 * globalDpr,
                1 * globalDpr
              );
            }
          });

          if (progress >= 100 && allVaporized) {
            const nextIndex = (currentTextIndex + 1) % texts.length;
            setCurrentTextIndex(nextIndex);
            setAnimationState('fadingIn');
            fadeOpacityRef.current = 0;
            renderCanvas();
          }
          break;
        }

        case 'fadingIn': {
          fadeOpacityRef.current += deltaTime * 1000 / animationDurations.FADE_IN_DURATION;

          const opacity = Math.min(1, fadeOpacityRef.current);

          particlesRef.current.forEach((particle) => {
            particle.x = particle.originalX;
            particle.y = particle.originalY;
            particle.opacity = opacity * particle.originalAlpha;

            ctx.fillStyle = particle.color.replace(/[\d.]+\)$/, `${particle.opacity})`);
            ctx.fillRect(
              particle.x / globalDpr,
              particle.y / globalDpr,
              1 * globalDpr,
              1 * globalDpr
            );
          });

          if (opacity >= 1) {
            setAnimationState('waiting');
            setTimeout(() => {
              setAnimationState('vaporizing');
              vaporizeProgressRef.current = 0;
              particlesRef.current.forEach((p) => {
                p.x = p.originalX;
                p.y = p.originalY;
                p.opacity = p.originalAlpha;
                p.speed = 0;
                p.velocityX = 0;
                p.velocityY = 0;
              });
            }, animationDurations.WAIT_DURATION);
          }
          break;
        }

        case 'waiting': {
          particlesRef.current.forEach((particle) => {
            ctx.fillStyle = particle.color;
            ctx.fillRect(
              particle.x / globalDpr,
              particle.y / globalDpr,
              1 * globalDpr,
              1 * globalDpr
            );
          });
          break;
        }
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [
    animationState,
    texts.length
    direction
    globalDpr
    spread
    transformedDensity
    animationDurations.FADE_IN_DURATION
    animationDurations.WAIT_DURATION
    renderCanvas
  ]);

  return (
    <div ref={wrapperRef} className={className} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ minWidth: '30px', minHeight: '20px' }} />
    </div>
  );
}
