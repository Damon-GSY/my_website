import { createIntroChapter } from './chapters/intro';
import { createRobotChapter } from './chapters/robot';
import { createSignatureChapter } from './chapters/signature';
import { clamp, DURATION, PALETTE, smooth } from './motion';

const CHAPTER_LENGTH = 6;
const WIPE_LENGTH = .22;

/** One explicit clock drives the live preview and every exported frame. */
export function createFilm(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas drawing is unavailable.');
  const chapters = [];
  try {
    chapters.push(createIntroChapter());
    chapters.push(createRobotChapter());
    chapters.push(createSignatureChapter());
  } catch (error) {
    chapters.forEach((chapter) => chapter.dispose?.());
    throw error;
  }
  let currentTime = 0;
  let disposed = false;
  let layout;

  function drawChapter(index, localTime) {
    ctx.save();
    chapters[index].draw(ctx, localTime, layout);
    ctx.restore();
  }

  function seek(value) {
    if (disposed) throw new Error('Film has been disposed.');
    if (!Number.isFinite(value)) throw new TypeError('Film time must be finite.');
    currentTime = clamp(value, 0, DURATION);
    const index = Math.min(2, Math.floor(currentTime / CHAPTER_LENGTH));
    const localTime = currentTime - index * CHAPTER_LENGTH;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'none';
    if (index > 0 && localTime < WIPE_LENGTH) {
      drawChapter(index - 1, CHAPTER_LENGTH);
      const progress = smooth(localTime / WIPE_LENGTH);
      const { width: w, height: h } = layout;
      ctx.save();
      ctx.beginPath();
      if (layout.portrait) {
        const edge = -w * .14 + progress * (h + w * .14);
        ctx.moveTo(0, 0);
        ctx.lineTo(w, 0);
        ctx.lineTo(w, edge + w * .14);
        ctx.lineTo(0, edge);
      } else {
        const edge = -h * .14 + progress * (w + h * .14);
        ctx.moveTo(0, 0);
        ctx.lineTo(edge, 0);
        ctx.lineTo(edge + h * .14, h);
        ctx.lineTo(0, h);
      }
      ctx.closePath();
      ctx.clip();
      drawChapter(index, localTime);
      ctx.restore();
    } else drawChapter(index, localTime);
    return currentTime;
  }

  function setSize(width, height) {
    if (!Number.isFinite(width) || !Number.isFinite(height)) throw new TypeError('Film size must be finite.');
    const w = Math.round(clamp(width, 64, 4096));
    const h = Math.round(clamp(height, 64, 4096));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    layout = { width: w, height: h, portrait: h > w * 1.15, square: Math.abs(w / h - 1) < .15, palette: PALETTE };
    seek(currentTime);
  }

  setSize(canvas.width || 1280, canvas.height || 720);
  return {
    duration: DURATION,
    seek,
    setSize,
    capture(time = currentTime) {
      seek(time);
      return canvas.toDataURL('image/png');
    },
    getMetrics() {
      return {
        ready: !disposed, duration: DURATION, time: currentTime,
        width: layout.width, height: layout.height,
        chapter: ['intro', 'robot', 'signature'][Math.min(2, Math.floor(currentTime / CHAPTER_LENGTH))],
        robot: chapters[1].getMetrics?.() || null,
      };
    },
    dispose() {
      disposed = true;
      chapters.forEach((chapter) => chapter.dispose?.());
    },
  };
}
