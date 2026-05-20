export type Particle = {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  color: string;
  opacity: number;
  originalAlpha: number;
  velocityX: number;
  velocityY: number;
  angle: number;
  speed: number;
};

export type TextBoundaries = {
  left: number;
  right: number;
  width: number;
};

declare global {
  interface HTMLCanvasElement {
    textBoundaries?: TextBoundaries;
  }
}

export function calculateVaporizeSpread(fontSize: number): number {
  return fontSize * 1.2;
}

export function createParticles(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
  textX: number,
  textY: number,
  font: string,
  color: string,
  alignment: string,
): { particles: Particle[]; textBoundaries: TextBoundaries } {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = alignment as CanvasTextAlign;
  ctx.textBaseline = "middle";
  if ("fontKerning" in ctx) (ctx as any).fontKerning = "normal";
  if ("textRendering" in ctx) (ctx as any).textRendering = "geometricPrecision";

  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textLeft =
    alignment === "center"
      ? textX - textWidth / 2
      : alignment === "left"
        ? textX
        : textX - textWidth;
  const textBoundaries = { left: textLeft, right: textLeft + textWidth, width: textWidth };

  ctx.fillText(text, textX, textY);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const particles: Particle[] = [];
  const dpr = canvas.width / parseInt(canvas.style.width || "1");
  const sampleRate = Math.max(1, Math.round(dpr / 3));

  for (let y = 0; y < canvas.height; y += sampleRate) {
    for (let x = 0; x < canvas.width; x += sampleRate) {
      const index = (y * canvas.width + x) * 4;
      const alpha = data[index + 3];
      if (alpha > 0) {
        const originalAlpha = alpha / 255;
        particles.push({
          x,
          y,
          originalX: x,
          originalY: y,
          color: `rgba(${data[index]},${data[index + 1]},${data[index + 2]},${originalAlpha})`,
          opacity: originalAlpha,
          originalAlpha,
          velocityX: 0,
          velocityY: 0,
          angle: 0,
          speed: 0,
        });
      }
    }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return { particles, textBoundaries };
}

export function updateParticles(
  particles: Particle[],
  vaporizeX: number,
  deltaTime: number,
  spread: number,
  duration: number,
  direction: string,
  density: number,
): boolean {
  let allVaporized = true;
  for (const particle of particles) {
    const shouldVaporize =
      direction === "left-to-right"
        ? particle.originalX <= vaporizeX
        : particle.originalX >= vaporizeX;
    if (shouldVaporize) {
      if (particle.speed === 0) {
        particle.angle = Math.random() * Math.PI * 2;
        particle.speed = (Math.random() * 1 + 0.5) * spread;
        particle.velocityX = Math.cos(particle.angle) * particle.speed;
        particle.velocityY = Math.sin(particle.angle) * particle.speed - 1;
      }
      particle.x += particle.velocityX * deltaTime * 60;
      particle.y += particle.velocityY * deltaTime * 60;
      particle.velocityY -= 0.02;
      particle.opacity *= 0.98;
      if (particle.opacity < 0.01) particle.opacity = 0;
    } else {
      allVaporized = false;
    }
  }
  return allVaporized;
}

export function resetParticles(particles: Particle[]): void {
  for (const p of particles) {
    p.x = p.originalX;
    p.y = p.originalY;
    p.opacity = p.originalAlpha;
    p.speed = 0;
    p.velocityX = 0;
    p.velocityY = 0;
  }
}

export function resetParticlePositions(particles: Particle[]): void {
  for (const p of particles) {
    p.x = p.originalX;
    p.y = p.originalY;
  }
}
