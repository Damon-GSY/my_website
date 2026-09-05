export const heightAt = (x: number, z: number) =>
  .72 * Math.sin(x * 1.05) * Math.cos(z * .7) + .17 * (x * x - z * z)

export function surfacePoint(radius: number, angle: number): [number, number, number] {
  const x = 3.05 * radius * Math.cos(angle)
  const z = 2.45 * radius * Math.sin(angle)
  return [x, heightAt(x, z), z]
}

export function pathPoint(t: number): [number, number, number] {
  const x = -2.7 + 5.35 * t
  const z = .55 * Math.sin(t * Math.PI * 2 - .7)
  return [x, heightAt(x, z) + .06, z]
}

// Orthographic paper-study fallback uses the same surface as the WebGL scene.
export function paperPoint([x, y, z]: [number, number, number]) {
  return [320 + (x - z) * 66, 270 + (x + z) * 25 - y * 65]
}

export function paperCurve(radius: number) {
  return Array.from({ length: 161 }, (_, i) => {
    const [x, y] = paperPoint(surfacePoint(radius, i / 160 * Math.PI * 2))
    return `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ') + 'Z'
}
