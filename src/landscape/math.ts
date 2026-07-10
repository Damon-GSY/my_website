// Pure scroll/animation math for the optimization-landscape scene.
// Extracted from App.tsx so it can be unit-tested in isolation (no React/DOM).

/** Clamp a value into [0, 1]. */
export const clamp = (value: number): number => Math.min(1, Math.max(0, value))

/** Smoothstep easing of `value` across the [from, to] ramp. */
export const smooth = (from: number, to: number, value: number): number => {
  const x = clamp((value - from) / (to - from))
  return x * x * (3 - 2 * x)
}

/**
 * A fade band: ramps opacity in across [enter, arrive] and back out across
 * [leave, exit]. Product of an ingress smoothstep and (1 - egress smoothstep).
 */
export const band = (
  enter: number,
  arrive: number,
  leave: number,
  exit: number,
  value: number,
): number => smooth(enter, arrive, value) * (1 - smooth(leave, exit, value))
