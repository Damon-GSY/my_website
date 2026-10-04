import { createRobotScene } from '../../robot/robotScene.js';
import { clamp, fitText, mix, PALETTE, spring, track } from '../motion.js';

const WORDS = ['PLAN', 'ACT', 'LEARN'];
const CAPTIONS = ['Make a plan.', 'Take action.', 'Get better.'];
const CUES = [0, 1.6, 3.2];

function composition({ width: w, height: h, portrait, square, artworkOnly }) {
  if (artworkOnly) return { model: { x: 0, y: 0, width: w, height: h } };
  if (portrait) return {
    model: { x: w * .015, y: h * .275, width: w * .97, height: h * .55 },
    title: { x: w * .075, y: h * .065, width: w * .85, size: w * .073 },
    word: { x: w * .075, y: h * .14, width: w * .86, height: h * .16, size: w * .23 },
    caption: { x: w * .075, y: h * .89, width: w * .85, size: w * .078 },
  };
  if (square) return {
    model: { x: w * .10, y: h * .265, width: w * .84, height: h * .565 },
    title: { x: w * .075, y: h * .055, width: w * .85, size: w * .050 },
    word: { x: w * .075, y: h * .12, width: w * .85, height: h * .20, size: w * .205 },
    caption: { x: w * .075, y: h * .88, width: w * .85, size: w * .060 },
  };
  return {
    model: { x: w * .42, y: h * .04, width: w * .565, height: h * .91 },
    title: { x: w * .065, y: h * .13, width: w * .39, size: Math.min(w * .037, h * .075) },
    word: { x: w * .06, y: h * .295, width: w * .41, height: h * .36, size: w * .205 },
    caption: { x: w * .065, y: h * .755, width: w * .36, size: w * .042 },
  };
}

function fallbackProcessor(ctx, rect, t, palette) {
  const side = Math.min(rect.width, rect.height) * .48;
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(t * .5) * .065);
  ctx.fillStyle = palette.blue;
  ctx.fillRect(-side / 2, -side / 2, side, side);
  ctx.strokeStyle = palette.orange;
  ctx.lineWidth = side * .022;
  for (let i = 0; i < 8; i++) {
    const p = (i / 7 - .5) * side * .78;
    ctx.beginPath();
    ctx.moveTo(p, -side * .63); ctx.lineTo(p, -side * .50);
    ctx.moveTo(p, side * .50); ctx.lineTo(p, side * .63);
    ctx.moveTo(-side * .63, p); ctx.lineTo(-side * .50, p);
    ctx.moveTo(side * .50, p); ctx.lineTo(side * .63, p);
    ctx.stroke();
  }
  ctx.fillStyle = palette.lime;
  ctx.beginPath();
  ctx.arc(0, 0, side * .19, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = palette.paper;
  ctx.lineWidth = side * .012;
  ctx.rotate(t * .32);
  ctx.strokeRect(-side * .30, -side * .30, side * .60, side * .60);
  ctx.restore();
}

export function createRobotChapter() {
  const canvas = document.createElement('canvas');
  let scene = null;
  let failure = null;
  let sizeKey = '';
  let lastPose = null;
  let disposed = false;
  try {
    scene = createRobotScene(canvas, { pixelRatio: 1 });
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
  }

  function draw(ctx, time, layout) {
    if (disposed) return;
    const t = clamp(time, 0, 6);
    const { width: w, height: h } = layout;
    const palette = { ...PALETTE, ...layout.palette };
    const rects = composition(layout);
    const cue = t < CUES[1] ? 0 : t < CUES[2] ? 1 : 2;
    const transition = cue === 0 ? 1 : clamp(spring(t - CUES[cue], 3.2, .86));
    const explosion = clamp(track(t, [[0, 0], [1.05, 1], [4.30, 0]], 1.65, 1));

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = palette.paper;
    ctx.fillRect(0, 0, w, h);
    const model = rects.model;
    ctx.fillStyle = '#d7e1e8';
    ctx.beginPath();
    ctx.arc(
      model.x + model.width / 2,
      model.y + model.height / 2,
      Math.min(model.width, model.height) * (.43 + explosion * .02),
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    if (!layout.artworkOnly) {
      const title = rects.title;
      ctx.fillStyle = palette.ink;
      if (layout.portrait || layout.square) {
        fitText(ctx, 'INTELLIGENCE, IN MOTION.', '600 {size}px Arial, Helvetica, sans-serif', title.width, title.size);
        ctx.fillText('INTELLIGENCE, IN MOTION.', title.x, title.y);
      } else {
        fitText(ctx, 'INTELLIGENCE,', '600 {size}px Arial, Helvetica, sans-serif', title.width, title.size);
        ctx.fillText('INTELLIGENCE,', title.x, title.y);
        ctx.fillText('IN MOTION.', title.x, title.y + title.size * 1.1);
      }

      const word = rects.word;
      ctx.save();
      ctx.beginPath();
      ctx.rect(word.x - 2, word.y, word.width + 4, word.height);
      ctx.clip();
      ctx.fillStyle = palette.blue;
      fitText(ctx, 'LEARN', '400 {size}px Anton', word.width, word.size);
      if (cue > 0 && transition < 1) {
        ctx.fillText(WORDS[cue - 1], word.x, word.y - transition * word.height);
      }
      ctx.fillText(WORDS[cue], word.x, word.y + (1 - transition) * word.height);
      ctx.restore();
    }

    if (scene) {
      try {
        const width = Math.max(1, Math.round(model.width));
        const height = Math.max(1, Math.round(model.height));
        const nextSize = `${width}:${height}`;
        if (sizeKey !== nextSize) { scene.resize(width, height); sizeKey = nextSize; }
        lastPose = {
          time: t + 2,
          explosion,
          pointerX: -.10 + Math.sin(t * .55) * .36,
          pointerY: Math.sin(t * .44) * .15,
          entrance: false,
          greetingTime: t - 4.60,
        };
        scene.update(lastPose);
        // Copy immediately after render; no preserved WebGL buffer or accumulating state is needed.
        ctx.drawImage(canvas, model.x, model.y, model.width, model.height);
      } catch (error) {
        failure = error instanceof Error ? error.message : String(error);
        scene.dispose();
        scene = null;
        fallbackProcessor(ctx, model, t, palette);
      }
    } else {
      fallbackProcessor(ctx, model, t, palette);
    }

    if (!layout.artworkOnly) {
      const caption = rects.caption;
      const lineWidth = Math.min(caption.width * .17, h * .13);
      ctx.fillStyle = cue === 1 ? palette.orange : palette.lime;
      ctx.fillRect(caption.x, caption.y - caption.size * .30, lineWidth * mix(.55, 1, transition), Math.max(4, caption.size * .095));
      ctx.fillStyle = palette.ink;
      fitText(ctx, CAPTIONS[cue], '500 {size}px Arial, Helvetica, sans-serif', caption.width, caption.size);
      ctx.fillText(CAPTIONS[cue], caption.x, caption.y);
    }
    ctx.restore();
  }

  return {
    draw,
    getMetrics: () => ({ renderer: scene ? 'three' : 'fallback', failure, lastPose, ...scene?.getMetrics() }),
    dispose() {
      if (disposed) return;
      disposed = true;
      scene?.dispose();
      scene = null;
      canvas.width = canvas.height = 1;
    },
  };
}
