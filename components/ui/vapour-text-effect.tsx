"use client";

import React, { useRef, useEffect, useMemo, useCallback, memo, createElement, useState } from "react";

export enum Tag {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  P = "p",
}

type VaporizeTextCycleProps = {
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
  direction?: "left-to-right" | "right-to-left";
  alignment?: "left" | "center" | "right";
  tag?: Tag;
};

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
};

type TextBoundaries = {
  left: number;
  right: number;
  width: number;
};

declare global {
  interface HTMLCanvasElement {
    textBoundaries?: TextBoundaries;
  }
}

function transformValue(value: number, inRange: number[], outRange: number[], clamp: boolean) {
  const [inMin, inMax] = inRange;
  const [outMin, outMax] = outRange;
  let result = outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  if (clamp) result = Math.max(outMin, Math.min(outMax, result));
  return result;
}

function useIsInView(ref: React.RefObject<HTMLElement | null>) {
  const [isInView, setIsInView] = React.useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return isInView;
}

function calculateVaporizeSpread(fontSize: number) {
  return fontSize * 1.2;
}

function updateParticles(particles: Particle[], vaporizeX: number, deltaTime: number, spread: number, duration: number, direction: string, density: number) {
  let allVaporized = true;
  particles.forEach((particle) => {
    const shouldVaporize = direction === "left-to-right" ? particle.originalX <= vaporizeX : particle.originalX >= vaporizeX;
    if (shouldVaporize) {
      if (particle.speed === 0) {
        particle.angle = Math.random() * Math.PI * 2;
        particle.speed = (Math.random() * 1 + 0.5) * spread;
        particle.velocityX = Math.cos(particle.angle) * particle.speed;
        particle.velocityY = Math.sin(particle.angle) * particle.speed - 1;
      }
      particle.x += particle.velocityX * deltaTime * 60;
      particle.y += particle.velocityY * deltaTime * 60;
      particle.velocityY -= 0.02;
      particle.opacity *= 0.98;
      if (particle.opacity < 0.01) particle.opacity = 0;
    } else {
      allVaporized = false;
    }
  });
  return allVaporized;
}

function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[], dpr: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.scale(dpr, dpr);
  particles.forEach((p) => {
    if (p.opacity <= 0) return;
    ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity})`);
    ctx.fillRect(p.x / dpr, p.y / dpr, 1.5, 1.5);
  });
  ctx.restore();
}

function createParticles(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, text: string, textX: number, textY: number, font: string, color: string, alignment: string) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = alignment as CanvasTextAlign;
  ctx.textBaseline = "middle";
  if ("fontKerning" in ctx) (ctx as any).fontKerning = "normal";
  if ("textRendering" in ctx) (ctx as any).textRendering = "geometricPrecision";

  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  let textLeft = alignment === "center" ? textX - textWidth / 2 : alignment === "left" ? textX : textX - textWidth;
  const textBoundaries = { left: textLeft, right: textLeft + textWidth, width: textWidth };

  ctx.fillText(text, textX, textY);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const particles: Particle[] = [];
  const dpr = canvas.width / parseInt(canvas.style.width || "1");
  const sampleRate = Math.max(1, Math.round(dpr / 3));

  for (let y = 0; y < canvas.height; y += sampleRate) {
    for (let x = 0; x < canvas.width; x += sampleRate) {
      const index = (y * canvas.width + x) * 4;
      const alpha = data[index + 3];
      if (alpha > 0) {
        const originalAlpha = alpha / 255;
        particles.push({
          x, y, originalX: x, originalY: y,
          color: `rgba(${data[index]},${data[index + 1]},${data[index + 2]},${originalAlpha})`,
          opacity: originalAlpha, originalAlpha,
          velocityX: 0, velocityY: 0, angle: 0, speed: 0,
        });
      }
    }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return { particles, textBoundaries };
}

function resetParticles(particles: Particle[]) {
  particles.forEach((p) => {
    p.x = p.originalX;
    p.y = p.originalY;
    p.opacity = p.originalAlpha;
    p.speed = 0;
    p.velocityX = 0;
    p.velocityY = 0;
  });
}

const SeoElement = memo(({ tag, texts }: { tag: Tag; texts: string[] }) => {
  const safeTag = Object.values(Tag).includes(tag) ? tag : "p";
  const style: React.CSSProperties = { position: "absolute", width: 0, height: 0, overflow: "hidden", userSelect: "none", pointerEvents: "none" };
  return createElement(safeTag, { style }, texts?.join(" ") ?? "");
});

export default function VaporizeTextCycle({
  texts = ["Next.js", "React"],
  font = { fontFamily: "sans-serif", fontSize: "50px", fontWeight: 400 },
  color = "rgb(255, 255, 255)",
  spread = 5,
  density = 5,
  animation = { vaporizeDuration: 2, fadeInDuration: 1, waitDuration: 0.5 },
  direction = "left-to-right",
  alignment = "center",
  tag = Tag.P,
}: VaporizeTextCycleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isInView = useIsInView(wrapperRef as React.RefObject<HTMLElement | null>);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [animationState, setAnimationState] = useState<"static" | "vaporizing" | "fadingIn" | "waiting">("static");
  const vaporizeProgressRef = useRef(0);
  const fadeOpacityRef = useRef(0);
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });
  const transformedDensity = useMemo(() => transformValue(density, [0, 10], [0.3, 1], true), [density]);
  const globalDpr = useMemo(() => (typeof window !== "undefined" ? window.devicePixelRatio * 1.5 || 1 : 1), []);

  const animationDurations = useMemo(() => ({
    VAPORIZE_DURATION: (animation.vaporizeDuration ?? 2) * 1000,
    FADE_IN_DURATION: (animation.fadeInDuration ?? 1) * 1000,
    WAIT_DURATION: (animation.waitDuration ?? 0.5) * 1000,
  }), [animation.vaporizeDuration, animation.fadeInDuration, animation.waitDuration]);

  const fontConfig = useMemo(() => {
    const fontSize = parseInt(font.fontSize?.replace("px", "") || "50");
    return { fontSize, VAPORIZE_SPREAD: calculateVaporizeSpread(fontSize), MULTIPLIED_SPREAD: calculateVaporizeSpread(fontSize) * spread, font: `${font.fontWeight ?? 400} ${fontSize * globalDpr}px ${font.fontFamily}` };
  }, [font.fontSize, font.fontWeight, font.fontFamily, spread, globalDpr]);

  useEffect(() => { if (isInView) setTimeout(() => setAnimationState("vaporizing"), 0); else { setAnimationState("static"); if (animationFrameRef.current) { cancelAnimationFrame(animationFrameRef.current); animationFrameRef.current = null; } } }, [isInView]);

  useEffect(() => {
    if (!isInView) return;
    let lastTime = performance.now();
    let frameId: number;
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !particlesRef.current.length) { frameId = requestAnimationFrame(animate); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      switch (animationState) {
        case "static":
          renderParticles(ctx, particlesRef.current, globalDpr);
          break;
        case "vaporizing":
          vaporizeProgressRef.current += deltaTime * 100 / (animationDurations.VAPORIZE_DURATION / 1000);
          const tb = canvas.textBoundaries;
          if (!tb) break;
          const progress = Math.min(100, vaporizeProgressRef.current);
          const vaporizeX = direction === "left-to-right" ? tb.left + tb.width * progress / 100 : tb.right - tb.width * progress / 100;
          const allVaporized = updateParticles(particlesRef.current, vaporizeX, deltaTime, fontConfig.MULTIPLIED_SPREAD, animationDurations.VAPORIZE_DURATION, direction, transformedDensity);
          renderParticles(ctx, particlesRef.current, globalDpr);
          if (vaporizeProgressRef.current >= 100 && allVaporized) { setCurrentTextIndex((p) => (p + 1) % texts.length); setAnimationState("fadingIn"); fadeOpacityRef.current = 0; }
          break;
        case "fadingIn":
          fadeOpacityRef.current += deltaTime * 1000 / animationDurations.FADE_IN_DURATION;
          ctx.save(); ctx.scale(globalDpr, globalDpr);
          particlesRef.current.forEach((p) => {
            p.x = p.originalX; p.y = p.originalY;
            const o = Math.min(fadeOpacityRef.current, 1) * p.originalAlpha;
            ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${o})`);
            ctx.fillRect(p.x / globalDpr, p.y / globalDpr, 1.5, 1.5);
          });
          ctx.restore();
          if (fadeOpacityRef.current >= 1) { setAnimationState("waiting"); setTimeout(() => { setAnimationState("vaporizing"); vaporizeProgressRef.current = 0; resetParticles(particlesRef.current); }, animationDurations.WAIT_DURATION); }
          break;
        case "waiting":
          renderParticles(ctx, particlesRef.current, globalDpr);
          break;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => { if (frameId) cancelAnimationFrame(frameId); };
  }, [animationState, isInView, texts.length, direction, globalDpr, fontConfig.MULTIPLIED_SPREAD, animationDurations.VAPORIZE_DURATION, animationDurations.FADE_IN_DURATION, animationDurations.WAIT_DURATION, transformedDensity]);

  useEffect(() => {
    const framerProps = { texts, font, color, alignment };
    const renderCanvas = () => {
      const canvas = canvasRef.current; if (!canvas || !wrapperSize.width || !wrapperSize.height) return;
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      const fontSize = parseInt(framerProps.font?.fontSize?.replace("px", "") || "50");
      const f = `${framerProps.font?.fontWeight ?? 400} ${fontSize * globalDpr}px ${framerProps.font?.fontFamily ?? "sans-serif"}`;
      const c = parseColor(framerProps.color ?? "rgb(255,255,255)");
      let tx: number; const ty = canvas.height / 2; const ct = framerProps.texts[currentTextIndex] || "Next.js";
      tx = framerProps.alignment === "center" ? canvas.width / 2 : framerProps.alignment === "left" ? 0 : canvas.width;
      const result = createParticles(ctx, canvas, ct, tx, ty, f, c, framerProps.alignment || "left");
      particlesRef.current = result.particles; canvas.textBoundaries = result.textBoundaries;
    };
    renderCanvas();
    const observer = new ResizeObserver(() => { setWrapperSize({ width: wrapperRef.current?.clientWidth || 0, height: wrapperRef.current?.clientHeight || 0 }); renderCanvas(); });
    observer.observe(wrapperRef.current!);
    return () => observer.disconnect();
  }, [texts, font, color, alignment, wrapperSize, currentTextIndex, globalDpr, transformedDensity]);

  useEffect(() => { if (wrapperRef.current) setWrapperSize({ width: wrapperRef.current.clientWidth, height: wrapperRef.current.clientHeight }); }, []);

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
      <canvas ref={canvasRef} style={{ minWidth: "30px", minHeight: "20px", pointerEvents: "none" }} />
      <SeoElement tag={tag} texts={texts} />
    </div>
  );
}

function parseColor(color: string) { return color; }
