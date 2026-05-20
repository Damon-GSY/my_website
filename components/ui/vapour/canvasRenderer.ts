import { Particle } from "./particlePhysics";

export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  dpr: number
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.scale(dpr, dpr);
  particles.forEach((p) => {
    if (p.opacity <= 0) return;
    ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity})`);
    ctx.fillRect(p.x / dpr, p.y / dpr, 1.5, 1.5);
  });
  ctx.restore();
}

export function renderFadeIn(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  dpr: number,
  fadeProgress: number
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.scale(dpr, dpr);
  const clampedProgress = Math.min(fadeProgress, 1);
  particles.forEach((p) => {
    p.x = p.originalX;
    p.y = p.originalY;
    const o = clampedProgress * p.originalAlpha;
    ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${o})`);
    ctx.fillRect(p.x / dpr, p.y / dpr, 1.5, 1.5);
  });
  ctx.restore();
}
