import { createIntroChapter } from './chapters/intro';
import { createRobotChapter } from './chapters/robot';
import { createSignatureChapter } from './chapters/signature';
import { clamp, DURATION, PALETTE, smooth } from './motion';

const CHAPTER_LENGTH = 6;
const WIPE_LENGTH = .22;

/** One explicit clock drives the live preview and every exported frame. */
export function createFilm(canvas, { wipeDuration = WIPE_LENGTH, storyArtwork = false } = {}) {
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
  let insetTop = 0, insetBottom = 0;
  let artworkBounds = null;
  let fullWidth = 0, fullHeight = 0;
  let layer, layerContext;
  const wipeLength = clamp(wipeDuration, .01, 2);

  function drawChapter(index, localTime) {
    if (storyArtwork) {
      const w = fullWidth, h = fullHeight;
      const compact = w / h < 1.1 || ((canvas.clientWidth || w) < 800 && (canvas.clientHeight || h) > 600);
      const rect = artworkBounds || (compact
        ? { x: w * .10, y: h * .35, width: w * .80, height: h * .24 }
        : { x: w * .49, y: h * .11, width: w * .50, height: h * .61 });
      ctx.fillStyle = [PALETTE.blue, PALETTE.paper, PALETTE.ink][index];
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
      ctx.clip();
      ctx.translate(rect.x, rect.y);
      chapters[index].draw(ctx, localTime, { ...layout, ...rect, portrait: false, square: true, artworkOnly: true });
      ctx.restore();
      return;
    }
    if (!insetTop && !insetBottom) {
      ctx.save();
      chapters[index].draw(ctx, localTime, layout);
      ctx.restore();
      return;
    }
    layerContext.save();
    chapters[index].draw(layerContext, localTime, layout);
    layerContext.restore();
    // Extend the corner color behind navigation without stretching artwork into the safe area.
    if (insetTop) ctx.drawImage(layer, 0, 0, 1, 1, 0, 0, fullWidth, insetTop);
    ctx.drawImage(layer, 0, insetTop);
    if (insetBottom) ctx.drawImage(layer, 0, layout.height - 1, 1, 1, 0, fullHeight - insetBottom, fullWidth, insetBottom);
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
    if (index > 0 && localTime < wipeLength) {
      drawChapter(index - 1, CHAPTER_LENGTH);
      const progress = smooth(localTime / wipeLength);
      const w = fullWidth, h = fullHeight;
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

  function setSize(width, height, insets) {
    if (!Number.isFinite(width) || !Number.isFinite(height)) throw new TypeError('Film size must be finite.');
    const w = Math.round(clamp(width, 64, 4096));
    const h = Math.round(clamp(height, 64, 4096));
    fullWidth = w; fullHeight = h;
    if (insets) {
      insetTop = Math.round(clamp(Number(insets.top) || 0, 0, h * .35));
      insetBottom = Math.round(clamp(Number(insets.bottom) || 0, 0, h * .35));
      artworkBounds = insets.artworkBounds || null;
    }
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const contentHeight = h - insetTop - insetBottom;
    layout = { width: w, height: contentHeight, portrait: contentHeight > w * 1.15, square: Math.abs(w / contentHeight - 1) < .15, palette: PALETTE };
    if (insetTop || insetBottom) {
      if (!layer) { layer = document.createElement('canvas'); layerContext = layer.getContext('2d', { alpha: false }); }
      if (!layerContext) throw new Error('Canvas composition is unavailable.');
      if (layer.width !== w) layer.width = w;
      if (layer.height !== contentHeight) layer.height = contentHeight;
    }
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
        width: fullWidth, height: fullHeight, contentHeight: layout.height, insetTop, insetBottom, artworkBounds,
        chapter: ['intro', 'robot', 'signature'][Math.min(2, Math.floor(currentTime / CHAPTER_LENGTH))],
        robot: chapters[1].getMetrics?.() || null,
      };
    },
    dispose() {
      disposed = true;
      chapters.forEach((chapter) => chapter.dispose?.());
      if (layer) layer.width = layer.height = 1;
    },
  };
}
