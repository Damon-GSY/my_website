'use client';

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  duration?: number;
}

export function AnimatedGradientText({
  children,
  className,
  colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"],
  duration = 8,
}: AnimatedGradientTextProps) {
  const gradientStops = colors
    .map((color, i) => `${color} ${i * (100 / colors.length)}%`)
    .join(", ");

  return (
    <motion.span
      className={cn(
        "inline-block bg-clip-text text-transparent",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(90deg, ${gradientStops}, ${colors[0]})`,
        backgroundSize: "300% 100%",
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {children}
    </motion.span>
  );
}
