"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";
import {
  Particle,
  TextBoundaries,
  createParticles,
  updateParticles,
  resetParticles,
  transformValue,
  calculateVaporizeSpread,
} from "./particlePhysics";
import { renderParticles, renderFadeIn } from "./canvasRenderer";

type AnimationState = "static" | "vaporizing" | "fadingIn" | "waiting";

type UseVapourEffectOptions = {
  texts: string[];
  font: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: number;
  };
  color: string;
  spread: number;
  density: number;
  animation: {
    vaporizeDuration?: number;
    fadeInDuration?: number;
    waitDuration?: number;
  };
  direction: "left-to-right" | "right-to-left";
  alignment: "left" | "center" | "right";
};

declare global {
  interface HTMLCanvasElement {
    textBoundaries?: TextBoundaries;
  }
}

function useIsInView(ref: React.RefObject<HTMLElement | null>) {
  const [isInView, setIsInView] = React.useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return isInView;
}

function parseColor(color: string) {
  return color;
}

export function useVapourEffect(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  options: UseVapourEffectOptions
) {
  const {
    texts = ["Next.js", "React"],
    font = { fontFamily: "sans-serif", fontSize: "50px", fontWeight: 400 },
    color = "rgb(255, 255, 255)",
    spread = 5,
    density = 5,
    animation = { vaporizeDuration: 2, fadeInDuration: 1, waitDuration: 0.5 },
    direction = "left-to-right",
    alignment = "center",
  } = options;

  const isInView = useIsInView(wrapperRef as React.RefObject<HTMLElement | null>);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [animationState, setAnimationState] = useState<AnimationState>("static");
  const vaporizeProgressRef = useRef(0);
  const fadeOpacityRef = useRef(0);
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });

  const transformedDensity = useMemo(
    () => transformValue(density, [0, 10], [0.3, 1], true),
    [density]
  );

  // Cap DPR at 2 instead of devicePixelRatio * 1.5
  const globalDpr = useMemo(
    () =>
      typeof window !== "undefined"
        ? Math.min(window.devicePixelRatio || 1, 2)
        : 1,
    []
  );

  const animationDurations = useMemo(
    () => ({
      VAPORIZE_DURATION: (animation.vaporizeDuration ?? 2) * 1000,
      FADE_IN_DURATION: (animation.fadeInDuration ?? 1) * 1000,
      WAIT_DURATION: (animation.waitDuration ?? 0.5) * 1000,
    }),
    [animation.vaporizeDuration, animation.fadeInDuration, animation.waitDuration]
  );

  const fontConfig = useMemo(() => {
    const fontSize = parseInt(font.fontSize?.replace("px", "") || "50");
    return {
      fontSize,
      VAPORIZE_SPREAD: calculateVaporizeSpread(fontSize),
      MULTIPLIED_SPREAD:
        calculateVaporizeSpread(fontSize) * spread,
      font: `${font.fontWeight ?? 400} ${fontSize * globalDpr}px ${font.fontFamily}`,
    };
  }, [font.fontSize, font.fontWeight, font.fontFamily, spread, globalDpr]);

  // Visibility toggle
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

  // Animation loop
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      switch (animationState) {
        case "static":
          renderParticles(ctx, particlesRef.current, globalDpr);
          break;
        case "vaporizing":
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
            transformedDensity
          );
          renderParticles(ctx, particlesRef.current, globalDpr);
          if (vaporizeProgressRef.current >= 100 && allVaporized) {
            setCurrentTextIndex((p) => (p + 1) % texts.length);
            setAnimationState("fadingIn");
            fadeOpacityRef.current = 0;
          }
          break;
        case "fadingIn":
          fadeOpacityRef.current +=
            (deltaTime * 1000) / animationDurations.FADE_IN_DURATION;
          renderFadeIn(
            ctx,
            particlesRef.current,
            globalDpr,
            fadeOpacityRef.current
          );
          if (fadeOpacityRef.current >= 1) {
            setAnimationState("waiting");
            setTimeout(() => {
              setAnimationState("vaporizing");
              vaporizeProgressRef.current = 0;
              resetParticles(particlesRef.current);
            }, animationDurations.WAIT_DURATION);
          }
          break;
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
    canvasRef,
  ]);

  // Canvas sizing + particle creation
  useEffect(() => {
    const framerProps = { texts, font, color, alignment };
    const renderCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas || !wrapperSize.width || !wrapperSize.height) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const fontSize = parseInt(
        framerProps.font?.fontSize?.replace("px", "") || "50"
      );
      const f = `${framerProps.font?.fontWeight ?? 400} ${fontSize * globalDpr}px ${framerProps.font?.fontFamily ?? "sans-serif"}`;
      const c = parseColor(framerProps.color ?? "rgb(255,255,255)");
      let tx: number;
      const ty = canvas.height / 2;
      const ct = framerProps.texts[currentTextIndex] || "Next.js";
      tx =
        framerProps.alignment === "center"
          ? canvas.width / 2
          : framerProps.alignment === "left"
            ? 0
            : canvas.width;
      const result = createParticles(
        ctx,
        canvas,
        ct,
        tx,
        ty,
        f,
        c,
        framerProps.alignment || "left"
      );
      particlesRef.current = result.particles;
      canvas.textBoundaries = result.textBoundaries;
    };
    renderCanvas();
    const observer = new ResizeObserver(() => {
      setWrapperSize({
        width: wrapperRef.current?.clientWidth || 0,
        height: wrapperRef.current?.clientHeight || 0,
      });
      renderCanvas();
    });
    observer.observe(wrapperRef.current!);
    return () => observer.disconnect();
  }, [
    texts,
    font,
    color,
    alignment,
    wrapperSize,
    currentTextIndex,
    globalDpr,
    transformedDensity,
    canvasRef,
    wrapperRef,
  ]);

  // Initial size measurement
  useEffect(() => {
    if (wrapperRef.current)
      setWrapperSize({
        width: wrapperRef.current.clientWidth,
        height: wrapperRef.current.clientHeight,
      });
  }, [wrapperRef]);
}
