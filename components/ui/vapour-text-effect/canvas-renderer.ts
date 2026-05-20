import type { Particle } from "./particle-physics";

export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  dpr: number,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.scale(dpr, dpr);
  for (const p of particles) {
    if (p.opacity <= 0) continue;
    ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity})`);
    ctx.fillRect(p.x / dpr, p.y / dpr, 1.5, 1.5);
  }
  ctx.restore();
}

export function renderFadeIn(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  fadeOpacity: number,
  dpr: number,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.scale(dpr, dpr);
  for (const p of particles) {
    const o = Math.min(fadeOpacity, 1) * p.originalAlpha;
    ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${o})`);
    ctx.fillRect(p.x / dpr, p.y / dpr, 1.5, 1.5);
  }
  ctx.restore();
}
