"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface AnimatedBeamProps {
  className?: string
  containerRef: React.RefObject<HTMLElement | null>
  fromRef: React.RefObject<HTMLElement | null>
  toRef: React.RefObject<HTMLElement | null>
  curvature?: number
  reverse?: boolean
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: string
  gradientStopColor?: string
  delay?: number
  duration?: number
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
}

const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  delay = 0,
  duration = 4,
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}) => {
  const pathRef = useRef<SVGPathElement>(null)
  const [pathD, setPathD] = useState("")
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })
  const [gradientId] = useState(
    `gradient-${Math.random().toString(36).substring(2, 11)}`
  )

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const fromRect = fromRef.current.getBoundingClientRect()
        const toRect = toRef.current.getBoundingClientRect()

        const startX =
          fromRect.left -
          containerRect.left +
          fromRect.width / 2 +
          startXOffset
        const startY =
          fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset
        const endX =
          toRect.left - containerRect.left + toRect.width / 2 + endXOffset
        const endY =
          toRect.top - containerRect.top + toRect.height / 2 + endYOffset
        const controlY = startY - curvature
        const d = `M ${startX}, ${startY} Q ${(startX + endX) / 2}, ${controlY} ${endX}, ${endY}`
        setPathD(d)
        setSvgDimensions({
          width: containerRect.width,
          height: containerRect.height,
        })
      }
    }

    updatePath()
    window.addEventListener("resize", updatePath)
    return () => window.removeEventListener("resize", updatePath)
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ])

  return (
    <svg
      className={cn("pointer-events-none absolute left-0 top-0", className)}
      width={svgDimensions.width}
      height={svgDimensions.height}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradientStartColor} />
          <stop offset="100%" stopColor={gradientStopColor} />
        </linearGradient>
      </defs>
      <path
        d={pathD}
        fill="none"
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        ref={pathRef}
      />
      {pathRef.current && (
        <motion.circle
          r={4}
          fill={`url(#${gradientId})`}
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: reverse ? "0%" : "100%" }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration,
            ease: "linear",
            delay,
          }}
          style={{
            offsetPath: `path("${pathD}")`,
          }}
        />
      )}
    </svg>
  )
}

export { AnimatedBeam }
