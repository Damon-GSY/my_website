"use client";

import React, { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const GlowyWaves = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const getThemeColors = () => {
      const root = getComputedStyle(document.documentElement);
      const get = (vars: string[]) => {
        const el = document.createElement("div");
        el.style.cssText = "position:absolute;visibility:hidden;width:1px;height:1px";
        document.body.appendChild(el);
        let color = "rgba(129,140,248,0.8)";
        for (const v of vars) {
          el.style.backgroundColor = `var(${v})`;
          const computed = getComputedStyle(el).backgroundColor;
          if (computed && computed !== "rgba(0, 0, 0, 0)") {
            color = computed;
            break;
          }
        }
        document.body.removeChild(el);
        return color;
      };
      return {
        bg: get(["--background", "--muted", "--background"]),
        waves: [
          { offset: 0, amplitude: 70, frequency: 0.003, color: get(["--primary", "--accent"]), opacity: 0.4 },
          { offset: Math.PI / 2, amplitude: 90, frequency: 0.0026, color: get(["--accent", "--primary"]), opacity: 0.3 },
          { offset: Math.PI, amplitude: 60, frequency: 0.0034, color: get(["--foreground"]), opacity: 0.2 },
          { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, color: get(["--foreground"]), opacity: 0.15 },
        ],
      };
    };

    let themeColors = getThemeColors();
    const observer = new MutationObserver(() => { themeColors = getThemeColors(); });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouseInfluence = prefersReduced ? 10 : 50;
    const influenceRadius = prefersReduced ? 160 : 280;
    const smoothing = prefersReduced ? 0.04 : 0.1;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const recenter = () => { mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 }; targetMouseRef.current = mouseRef.current; };
    recenter();
    const onMove = (e: MouseEvent) => { targetMouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = recenter;
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const drawWave = (wave: { offset: number; amplitude: number; frequency: number; color: string; opacity: number }) => {
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 4) {
        const dx = x - mouseRef.current.x;
        const dy = canvas.height / 2 - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / influenceRadius);
        const mouseEffect = influence * mouseInfluence * Math.sin(time * 0.001 + x * 0.01 + wave.offset);
        const y = canvas.height / 2
          + Math.sin(x * wave.frequency + time * 0.002 + wave.offset) * wave.amplitude
          + Math.sin(x * wave.frequency * 0.4 + time * 0.003) * (wave.amplitude * 0.45)
          + mouseEffect;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = wave.color;
      ctx.globalAlpha = wave.opacity;
      ctx.shadowBlur = 30;
      ctx.shadowColor = wave.color;
      ctx.stroke();
      ctx.restore();
    };

    const animate = () => {
      time += 1;
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * smoothing;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * smoothing;

      ctx.fillStyle = themeColors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      themeColors.waves.forEach(drawWave);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
};
