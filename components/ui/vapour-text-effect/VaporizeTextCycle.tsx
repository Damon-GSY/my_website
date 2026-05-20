"use client";

import React, { useRef, memo, createElement } from "react";
import { useVapourEffect } from "./use-vapour-effect";

export enum Tag {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  P = "p",
}

export type VaporizeTextCycleProps = {
  texts?: string[];
  font?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: number;
  };
  color?: string;
  spread?: number;
  density?: number;
  animation?: {
    vaporizeDuration?: number;
    fadeInDuration?: number;
    waitDuration?: number;
  };
  direction?: "left-to-right" | "right-to-left";
  alignment?: "left" | "center" | "right";
  tag?: Tag;
};

const SeoElement = memo(({ tag, texts }: { tag: Tag; texts: string[] }) => {
  const safeTag = Object.values(Tag).includes(tag) ? tag : "p";
  const style: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    overflow: "hidden",
    userSelect: "none",
    pointerEvents: "none",
  };
  return createElement(safeTag, { style }, texts?.join(" ") ?? "");
});

export default function VaporizeTextCycle({
  texts = ["Next.js", "React"],
  font = { fontFamily: "sans-serif", fontSize: "50px", fontWeight: 400 },
  color = "rgb(255, 255, 255)",
  spread = 5,
  density = 5,
  animation = { vaporizeDuration: 2, fadeInDuration: 1, waitDuration: 0.5 },
  direction = "left-to-right",
  alignment = "center",
  tag = Tag.P,
}: VaporizeTextCycleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useVapourEffect(canvasRef, wrapperRef, {
    texts,
    font,
    color,
    spread,
    density,
    animation,
    direction,
    alignment,
  });

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
      <canvas
        ref={canvasRef}
        style={{ minWidth: "30px", minHeight: "20px", pointerEvents: "none" }}
      />
      <SeoElement tag={tag} texts={texts} />
    </div>
  );
}
