'use client';

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

interface BackgroundGradientAnimationProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  duration?: number;
}

export function BackgroundGradientAnimation({
  children,
  className,
  containerClassName,
  colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#10b981"],
  duration = 10,
}: BackgroundGradientAnimationProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const colorStops = colors.map((color, index) => {
    const angle = (index / colors.length) * 360;
    return `${color} ${angle}deg`;
  }).join(', ');

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-black dark:bg-black",
        containerClassName
      )}
    >
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {colors.map((color, index) => (
          <div
            key={index}
            className={cn(
              "absolute rounded-full mix-blend-screen filter blur-3xl opacity-50",
              {
                "animate-first": index === 0,
                "animate-second": index === 1,
                "animate-third": index === 2,
                "animate-fourth": index === 3,
                "animate-fifth": index === 4,
              }
            )}
            style={{
              background: color,
              width: "40%",
              height: "40%",
              left: `${20 + index * 15}%`,
              top: `${20 + (index % 2) * 20}%`,
              animationDuration: `${duration}s`,
            }}
          />
        ))}
      </div>

      {/* Mouse follower gradient */}
      <div
        className="pointer-events-none absolute inset-0 transition duration-300"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Content */}
      <div className={cn("relative z-10", className)}>
        {children}
      </div>
    </div>
  );
}
