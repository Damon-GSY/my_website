"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

type ContainerScrollProps = {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  cardClassName?: string;
};

export function ContainerScroll({
  titleComponent,
  children,
  className = "",
  cardClassName = "",
}: ContainerScrollProps) {
  const cardTargetRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll({
    target: cardTargetRef,
    offset: ["start 90%", "start 38%"],
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const settleRange: [number, number, number] = [0, 0.72, 1];
  const initialRotate = isMobile ? 4.5 : 9;
  const initialScale = isMobile ? 0.985 : 0.96;
  const rotate = useTransform(
    scrollYProgress,
    settleRange,
    reducedMotion ? [0, 0, 0] : [initialRotate, 0, 0]
  );
  const scale = useTransform(
    scrollYProgress,
    settleRange,
    reducedMotion ? [1, 1, 1] : [initialScale, 1, 1]
  );
  const headerTranslate = useTransform(
    scrollYProgress,
    [0, 0.72, 1],
    reducedMotion ? [0, 0, 0] : [0, -24, -24]
  );
  const shadow = useTransform(
    scrollYProgress,
    settleRange,
    reducedMotion
      ? [
          "0 2px 12px -12px rgba(0,0,0,0.35)",
          "0 2px 12px -12px rgba(0,0,0,0.35)",
          "0 2px 12px -12px rgba(0,0,0,0.35)",
        ]
      : [
          "0 24px 72px -54px rgba(0,0,0,0.9)",
          "0 2px 12px -12px rgba(0,0,0,0.35)",
          "0 2px 12px -12px rgba(0,0,0,0.35)",
        ]
  );

  return (
    <div className={`relative pb-2 pt-7 md:pb-2 md:pt-8 ${className}`}>
      <Header translate={headerTranslate} titleComponent={titleComponent} />
      <div
        ref={cardTargetRef}
        className="relative mt-7 md:mt-8"
        style={{ perspective: "1100px" }}
      >
        <Card rotate={rotate} scale={scale} shadow={shadow} className={cardClassName}>
          {children}
        </Card>
      </div>
    </div>
  );
}

type HeaderProps = {
  translate: MotionValue<number>;
  titleComponent: React.ReactNode;
};

export function Header({ translate, titleComponent }: HeaderProps) {
  return (
    <motion.div style={{ translateY: translate }} className="w-full">
      {titleComponent}
    </motion.div>
  );
}

type CardProps = {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  shadow: MotionValue<string>;
  children: React.ReactNode;
  className?: string;
};

export function Card({
  rotate,
  scale,
  shadow,
  children,
  className = "",
}: CardProps) {
  return (
    <motion.div
      data-agent-os-console
      style={{ rotateX: rotate, scale, boxShadow: shadow, transformOrigin: "50% 0%" }}
      className={`mx-auto w-full rounded-[1.65rem] border border-[var(--line)] bg-[var(--surface-soft)] p-1 ${className}`}
    >
      <div className="w-full overflow-hidden rounded-[1.25rem] bg-[var(--bg)]">
        {children}
      </div>
    </motion.div>
  );
}
