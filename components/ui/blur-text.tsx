'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

// Adapted from React Bits BlurText (MIT + Commons Clause):
// https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/TextAnimations/BlurText
type BlurTextProps = {
  text: string
  className?: string
  animateBy?: 'words' | 'letters'
  delay?: number
  direction?: 'top' | 'bottom'
  threshold?: number
  rootMargin?: string
}

export default function BlurText({
  text,
  className,
  animateBy = 'words',
  delay = 90,
  direction = 'bottom',
  threshold = 0.22,
  rootMargin = '0px',
}: BlurTextProps) {
  const reduceMotion = useReducedMotion()
  const [inView, setInView] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)
  const segments = useMemo(
    () => (animateBy === 'words' ? text.split(/\s+/) : Array.from(text)),
    [animateBy, text],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container || reduceMotion) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setInView(true)
        observer.unobserve(container)
      },
      { threshold, rootMargin },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [reduceMotion, rootMargin, threshold])

  const visible = Boolean(reduceMotion) || inView
  const initialY = direction === 'top' ? -34 : 34

  return (
    <span ref={containerRef} className={className} aria-label={text}>
      {segments.map((segment, index) => (
        <motion.span
          aria-hidden="true"
          key={`${segment}-${index}`}
          initial={reduceMotion ? false : { filter: 'blur(10px)', opacity: 0, y: initialY }}
          animate={
            visible
              ? { filter: ['blur(10px)', 'blur(3px)', 'blur(0px)'], opacity: [0, 0.58, 1], y: [initialY, -2, 0] }
              : { filter: 'blur(10px)', opacity: 0, y: initialY }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 0.78,
                  delay: (index * delay) / 1000,
                  ease: [0.22, 1, 0.36, 1],
                  times: [0, 0.58, 1],
                }
          }
          style={{
            display: 'inline-block',
            marginRight: animateBy === 'words' && index < segments.length - 1 ? '0.22em' : undefined,
            willChange: visible ? 'transform, filter, opacity' : undefined,
          }}
        >
          {segment}
        </motion.span>
      ))}
    </span>
  )
}
