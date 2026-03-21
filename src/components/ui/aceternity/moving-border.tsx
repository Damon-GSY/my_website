'use client';

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface MovingBorderProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  as?: React.ElementType;
}

export function MovingBorder({
  children,
  duration = 2000,
  className,
  containerClassName,
  borderClassName,
  as: Component = "button",
}: MovingBorderProps) {
  return (
    <Component
      className={cn(
        "relative overflow-hidden bg-transparent p-[1px] text-sm font-medium",
        containerClassName
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          borderClassName
        )}
        style={{
          background: `linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)`,
          backgroundSize: "300% 100%",
          animation: `gradient ${duration}ms linear infinite`,
        }}
      />
      <div
        className={cn(
          "relative flex items-center justify-center gap-2 bg-background rounded-sm",
          className
        )}
      >
        {children}
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </Component>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  borderRadius?: string;
  children: React.ReactNode;
  as?: React.ElementType;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  className?: string;
}

export const Button = ({
  borderRadius = "1.75rem",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  duration,
  className,
  ...otherProps
}: ButtonProps) => {
  return (
    <Component
      {...otherProps}
      className={cn(
        "relative h-10 w-40 overflow-hidden bg-transparent p-[1px] text-sm font-medium",
        containerClassName
      )}
      style={{ borderRadius }}
    >
      <div
        className={cn(
          "absolute inset-0",
          borderClassName
        )}
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <MovingBorderDiv duration={duration} />
      </div>

      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center rounded-sm bg-background text-foreground antialiased",
          className
        )}
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        {children}
      </div>
    </Component>
  );
};

const MovingBorderDiv = ({ duration }: { duration?: number }) => {
  return (
    <motion.div
      className="h-full w-full"
      style={{
        background:
          "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #06b6d4, #3b82f6)",
        backgroundSize: "300% 100%",
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: (duration || 2000) / 1000,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};
