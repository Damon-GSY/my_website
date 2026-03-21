"use client";

import { motion, useMotionValue, useTransform, useScroll, useSpring, useAnimationFrame } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  className?: string;
  decimalPlaces?: number;
}

export function NumberTicker({ value, direction = "up", delay = 0, className, decimalPlaces = 0 }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "up" ? 0 : 100);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: 2.5,
  });
  const displayValue = useTransform(springValue, (latest) =>
    Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(latest / (direction === "up" ? 100 : 100)),
  );

  useEffect(() => {
    motionValue.set(direction === "up" ? 0 : 100);
  }, [motionValue, direction]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      motionValue.set(direction === "up" ? value : 100 - value);
    }, delay);
    return () => clearTimeout(timeout);
  }, [motionValue, value, direction, delay]);

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
}
