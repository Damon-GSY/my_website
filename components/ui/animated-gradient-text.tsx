"use client";

import { motion, useMotionValue, useTransform, useScroll, useSpring, useAnimationFrame } from "framer-motion";
import React, { useEffect, useRef } from "react";

interface AnimatedGradientTextProps {
  children: string;
  className?: string;
}

export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <motion.span
      className={className}
      initial={{
        backgroundPosition: "0% 50%",
        backgroundSize: "200% 200%",
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%"],
      }}
      transition={{
        duration: 3,
        ease: "linear",
        repeat: Infinity,
      }}
      style={{
        backgroundImage:
          "linear-gradient(90deg, #818cf8, #a78bfa, #06b6d4, #818cf8)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </motion.span>
  );
}
