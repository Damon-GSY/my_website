"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import {
  createParticles,
  updateParticles,
  resetParticles,
  resetParticlePositions,
  calculateVaporizeSpread,
} from "./particle-physics";
import type { Particle } from "./particle-physics";
import { renderParticles, renderFadeIn } from "./canvas-renderer";

type AnimationConfig = {
  vaporizeDuration?: number;
  fadeInDuration?: number;
  waitDuration?: number;
};

export type UseVapourEffectConfig = {
  texts: string[];
  font: { fontFamily?: string; fontSize?: string; fontWeight?: number };
  color: string;
  spread: number;
  density: number;
  animation: AnimationConfig;
  direction: "left-to-right" | "right-to-left";
  alignment: "left" | "center" | "right";
};

function transformValue(value: number, inRange: number[], outRange: number[], clamp: boolean) {
  const [inMin, inMax] = inRange;
  const [outMin, outMax] = outRange;
  let result = outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  if (clamp) result = Math.max(outMin, Math.min(outMax, result));
  return result;
}

function useIsInView(ref: React.RefObject<HTMLElement | null>): boolean {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      threshold: 0.1,
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return isInView;
}

export function useVapourEffect(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  config: UseVapourEffectConfig,
): void {
  const { texts, font, color, spread, density, animation, direction, alignment } = config;

  const isInView = useIsInView(wrapperRef as React.RefObject<HTMLElement | null>);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [animationState, setAnimationState] = useState<
    "static" | "vaporizing" | "fadingIn" | "waiting"
  >("static");
  const vaporizeProgressRef = useRef(0);
  const fadeOpacityRef = useRef(0);
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });

  const transformedDensity = useMemo(
    () => transformValue(density, [0, 10], [0.3, 1], true),
    [density],
  );

  const globalDpr = useMemo(
    () =>
      typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) || 1 : 1,
    [],
  );

  const animationDurations = useMemo(
    () => ({
      VAPORIZE_DURATION: (animation.vaporizeDuration ?? 2) * 1000,
      FADE_IN_DURATION: (animation.fadeInDuration ?? 1) * 1000,
      WAIT_DURATION: (animation.waitDuration ?? 0.5) * 1000,
    }),
    [animation.vaporizeDuration, animation.fadeInDuration, animation.waitDuration],
  );

  const fontConfig = useMemo(() => {
    const fontSize = parseInt(font.fontSize?.replace("px", "") || "50");
    return {
      fontSize,
      MULTIPLIED_SPREAD: calculateVaporizeSpread(fontSize) * spread,
      font: `${font.fontWeight ?? 400} ${fontSize * globalDpr}px ${font.fontFamily}`,
    };
  }, [font.fontSize, font.fontWeight, font.fontFamily, spread, globalDpr]);

  useEffect(() => {
    if (isInView) {
      setTimeout(() => setAnimationState("vaporizing"), 0);
    } else {
      setAnimationState("static");
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;
    let lastTime = performance.now();
    let frameId: number;
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !particlesRef.current.length) {
        frameId = requestAnimationFrame(animate);
        return;
      }
      switch (animationState) {
        case "static":
          renderParticles(ctx, particlesRef.current, globalDpr);
          break;
        case "vaporizing": {
          vaporizeProgressRef.current +=
            (deltaTime * 100) / (animationDurations.VAPORIZE_DURATION / 1000);
          const tb = canvas.textBoundaries;
          if (!tb) break;
          const progress = Math.min(100, vaporizeProgressRef.current);
          const vaporizeX =
            direction === "left-to-right"
              ? tb.left + (tb.width * progress) / 100
              : tb.right - (tb.width * progress) / 100;
          const allVaporized = updateParticles(
            particlesRef.current,
            vaporizeX,
            deltaTime,
            fontConfig.MULTIPLIED_SPREAD,
            animationDurations.VAPORIZE_DURATION,
            direction,
            transformedDensity,
          );
          renderParticles(ctx, particlesRef.current, globalDpr);
          if (vaporizeProgressRef.current >= 100 && allVaporized) {
            setCurrentTextIndex((p) => (p + 1) % texts.length);
            setAnimationState("fadingIn");
            fadeOpacityRef.current = 0;
          }
          break;
        }
        case "fadingIn": {
          fadeOpacityRef.current +=
            (deltaTime * 1000) / animationDurations.FADE_IN_DURATION;
          resetParticlePositions(particlesRef.current);
          renderFadeIn(ctx, particlesRef.current, fadeOpacityRef.current, globalDpr);
          if (fadeOpacityRef.current >= 1) {
            setAnimationState("waiting");
            setTimeout(() => {
              setAnimationState("vaporizing");
              vaporizeProgressRef.current = 0;
              resetParticles(particlesRef.current);
            }, animationDurations.WAIT_DURATION);
          }
          break;
        }
        case "waiting":
          renderParticles(ctx, particlesRef.current, globalDpr);
          break;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [
    animationState,
    isInView,
    texts.length,
    direction,
    globalDpr,
    fontConfig.MULTIPLIED_SPREAD,
    animationDurations.VAPORIZE_DURATION,
    animationDurations.FADE_IN_DURATION,
    animationDurations.WAIT_DURATION,
    transformedDensity,
  ]);

  useEffect(() => {
    const renderCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas || !wrapperSize.width || !wrapperSize.height) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const fontSize = parseInt(font.fontSize?.replace("px", "") || "50");
      const f = `${font.fontWeight ?? 400} ${fontSize * globalDpr}px ${font.fontFamily ?? "sans-serif"}`;
      const ct = texts[currentTextIndex] || "Next.js";
      const ty = canvas.height / 2;
      const tx =
        alignment === "center"
          ? canvas.width / 2
          : alignment === "left"
            ? 0
            : canvas.width;
      const result = createParticles(ctx, canvas, ct, tx, ty, f, color, alignment || "left");
      particlesRef.current = result.particles;
      canvas.textBoundaries = result.textBoundaries;
    };
    renderCanvas();
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver(() => {
      setWrapperSize({
        width: wrapperRef.current?.clientWidth || 0,
        height: wrapperRef.current?.clientHeight || 0,
      });
      renderCanvas();
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [texts, font, color, alignment, wrapperSize, currentTextIndex, globalDpr, transformedDensity]);

  useEffect(() => {
    if (wrapperRef.current) {
      setWrapperSize({
        width: wrapperRef.current.clientWidth,
        height: wrapperRef.current.clientHeight,
      });
    }
  }, []);
}
