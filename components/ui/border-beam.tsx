"use client";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  delay = 0,
  colorFrom = "#818cf8",
  colorTo = "#06b6d4",
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-2xl",
        className,
      )}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          padding: "2px",
          background: `linear-gradient(90deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
          backgroundSize: `${size}% 100%`,
          maskImage: `linear-gradient(90deg, transparent 25%, black 75%)`,
          WebkitMaskImage: `linear-gradient(90deg, transparent 25%, black 75%)`,
          mask: `linear-gradient(90deg, transparent 25%, black 75%)`,
          animation: `beam ${duration}s linear infinite ${delay}s`,
        }}
      />
      <style>{`
        @keyframes beam {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
