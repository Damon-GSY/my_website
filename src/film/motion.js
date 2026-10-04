export const DURATION = 18;
export const PALETTE = { blue: '#0757ed', paper: '#f2f0e6', lime: '#d8fc59', orange: '#ff6c24', ink: '#111a23', muted: '#9baaaf' };
export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const mix = (a, b, t) => a + (b - a) * t;
export const smooth = (value) => { const t = clamp(value); return t * t * (3 - 2 * t); };
export function spring(t, frequency = 3, damping = 1) {
  if (t <= 0) return 0;
  const w = frequency * Math.PI * 2;
  if (damping < 1) {
    const wd = w * Math.sqrt(1 - damping * damping);
    return 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + damping * w / wd * Math.sin(wd * t));
  }
  if (damping === 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const root = Math.sqrt(damping * damping - 1), a = -w * (damping - root), b = -w * (damping + root);
  return 1 + (b * Math.exp(a * t) - a * Math.exp(b * t)) / (a - b);
}
export function track(t, keys, frequency = 3, damping = 1) {
  let value = keys[0][1];
  for (let i = 1; i < keys.length; i++) value += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], frequency, damping);
  return value;
}
export function seeded(seed) {
  return () => { seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function fitText(ctx, text, font, maxWidth, maxSize, minSize = 10) {
  let size = maxSize;
  ctx.font = font.replace('{size}', size);
  while (ctx.measureText(text).width > maxWidth && size > minSize) { size = Math.max(minSize, size * .97); ctx.font = font.replace('{size}', size); }
  return size;
}
