import { clamp, fitText, mix, PALETTE, seeded, smooth, spring } from '../motion';

const COUNT = 9600;
const TAU = Math.PI * 2;

function cubic(a, b, c, d, t) {
  const q = 1 - t;
  return q * q * q * a + 3 * q * q * t * b + 3 * q * t * t * c + t * t * t * d;
}

function makeLayout(width, height, portrait, square) {
  const rng = seeded(73421);
  const mask = document.createElement('canvas');
  mask.width = width;
  mask.height = height;
  const ctx = mask.getContext('2d', { willReadFrequently: true });
  const wordY = height * (portrait ? .315 : square ? .34 : .355);
  const size = fitText(ctx, 'GDAMON', '400 {size}px Anton', width * .875, width * .3);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GDAMON', width / 2, wordY);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const sites = [];
  const stride = Math.max(1, Math.floor(width / 720));
  for (let y = Math.max(0, Math.floor(wordY - size)); y < Math.min(height, wordY + size); y += stride) {
    for (let x = 0; x < width; x += stride) {
      if (pixels[(y * width + x) * 4 + 3] > 160) sites.push([x, y]);
    }
  }
  const cols = portrait ? 5 : 7;
  const nodes = [];
  const rows = portrait ? [3, 5, 7, 5, 3] : [3, 5, 6, 7, 6, 5, 3];
  const netTop = height * (portrait ? .23 : .24);
  const netHeight = height * (portrait ? .5 : .52);
  for (let c = 0; c < cols; c++) {
    nodes[c] = [];
    for (let r = 0; r < rows[c]; r++) {
      nodes[c].push({ x: width * (.09 + .82 * c / (cols - 1)), y: netTop + netHeight * ((r + .5) / rows[c]) });
    }
  }
  const edges = [];
  for (let c = 0; c < cols - 1; c++) {
    for (let r = 0; r < rows[c]; r++) {
      const corresponding = Math.round((r + .5) / rows[c] * rows[c + 1] - .5);
      for (const j of [corresponding - 1, corresponding, corresponding + 1]) {
        if (j >= 0 && j < rows[c + 1]) edges.push([nodes[c][r], nodes[c + 1][j]]);
      }
    }
  }
  const points = [];
  for (let i = 0; i < COUNT; i++) {
    const target = sites[Math.floor(rng() * sites.length)] || [width / 2, wordY];
    const lane = i % (portrait ? 17 : 13);
    const edge = edges[Math.floor(rng() * edges.length)];
    const phase = rng();
    points.push({
      tx: target[0] + (rng() - .5) * stride,
      ty: target[1] + (rng() - .5) * stride,
      lane, phase, speed: .035 + rng() * .055, edge,
      delay: target[0] / width * .42 + rng() * .16,
      radius: .52 + rng() * .85,
      color: i % 11 === 0 ? 1 : i % 17 === 0 ? 2 : 0,
      jitter: rng() - .5,
    });
  }
  return { width, height, wordY, size, nodes, edges, points, lanes: portrait ? 17 : 13 };
}

function wipeText(ctx, text, x, y, progress, maxWidth, maxSize, color, align = 'left', font = '400 {size}px Anton') {
  if (progress <= 0) return;
  const size = fitText(ctx, text, font, maxWidth, maxSize);
  const width = ctx.measureText(text).width;
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(align === 'right' ? x - width - 2 : x - 2, y - size * 1.12, width + 4, size * 1.4);
  ctx.clip();
  ctx.fillText(text, x, y + (1 - progress) * size * 1.32);
  ctx.restore();
}

export function createSignatureChapter() {
  const layouts = new Map();
  return {
    draw(ctx, time, layout) {
      const { width: w, height: h, portrait = false, square = false } = layout;
      const palette = layout.palette || PALETTE;
      const t = clamp(time, 0, 6);
      const key = `${w}:${h}:${portrait}:${square}`;
      if (!layouts.has(key)) {
        if (layouts.size >= 4) layouts.delete(layouts.keys().next().value);
        layouts.set(key, makeLayout(w, h, portrait, square));
      }
      const data = layouts.get(key);
      const unit = portrait ? w / 720 : square ? w / 900 : w / 1280;
      const margin = w * .065;
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = palette.ink;
      ctx.fillRect(0, 0, w, h);

      const network = smooth((t - .48) / 1.12);
      const resolve = smooth((t - 1.92) / 1.48);
      const blue = smooth((t - 3.75) / .8);
      if (blue > 0) {
        ctx.fillStyle = palette.blue;
        ctx.beginPath();
        ctx.arc(w * .83, data.wordY, Math.hypot(w, h) * blue, 0, TAU);
        ctx.fill();
      }

      if (t < 3.28) {
        const lineOpacity = .19 * (1 - smooth((t - 2.25) / .8));
        ctx.strokeStyle = palette.muted;
        ctx.lineWidth = Math.max(.5, unit);
        ctx.globalAlpha = lineOpacity * (1 - network);
        ctx.beginPath();
        for (let i = 0; i < data.lanes; i++) {
          const y = h * .235 + h * .53 * (i + .5) / data.lanes;
          ctx.moveTo(margin, y);
          ctx.lineTo(w - margin, y);
        }
        ctx.stroke();
        ctx.globalAlpha = lineOpacity * network;
        ctx.beginPath();
        for (const [a, b] of data.edges) {
          ctx.moveTo(a.x, a.y);
          ctx.bezierCurveTo(mix(a.x, b.x, .48), a.y, mix(a.x, b.x, .52), b.y, b.x, b.y);
        }
        ctx.stroke();
        ctx.globalAlpha = network * (1 - smooth((t - 2.1) / .9));
        for (let col = 0; col < data.nodes.length; col++) {
          for (let row = 0; row < data.nodes[col].length; row++) {
            const node = data.nodes[col][row];
            const pulse = .5 + .5 * Math.sin(t * TAU * 2 - col * .7 - row * .22);
            ctx.fillStyle = palette.ink;
            ctx.strokeStyle = palette.lime;
            ctx.lineWidth = unit * 1.3;
            ctx.beginPath();
            ctx.arc(node.x, node.y, (4.5 + pulse * 2) * unit, 0, TAU);
            ctx.fill();
            ctx.stroke();
          }
        }
      }

      for (let color = 0; color < 3; color++) {
        ctx.fillStyle = [palette.paper, palette.lime, palette.muted][color];
        ctx.globalAlpha = color === 2 ? .62 : .96;
        ctx.beginPath();
        for (let i = 0; i < data.points.length; i++) {
          const point = data.points[i];
          if (point.color !== color) continue;
          const phase = (point.phase + t * point.speed) % 1;
          const packet = (Math.floor(point.phase * 4) * .25 + (point.phase * 4 % 1) * .055 + t * .16 + point.lane * .027) % 1;
          const sx = margin + packet * (w - margin * 2);
          const sy = h * .235 + h * .53 * (point.lane + .5) / data.lanes + point.jitter * unit * 2.5;
          const [a, b] = point.edge;
          const nx = cubic(a.x, mix(a.x, b.x, .48), mix(a.x, b.x, .52), b.x, phase);
          const ny = cubic(a.y, a.y, b.y, b.y, phase);
          const x0 = mix(sx, nx, network);
          const y0 = mix(sy, ny, network);
          const seat = smooth((t - 1.92 - point.delay) / .92);
          const arc = Math.sin(seat * Math.PI);
          const x = mix(x0, point.tx, seat);
          const y = mix(y0, point.ty, seat) + arc * point.jitter * h * .19;
          const radius = Math.max(.5, point.radius * unit * (1 + resolve * .20));
          const streak = (1 - network) * unit * (2.2 + Math.sin(point.phase * TAU) * 1.2);
          ctx.rect(x - radius, y - radius, radius * 2 + streak, radius * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (t < 2.75) {
        const first = t < 1.23;
        const label = first ? 'SIGNAL.' : 'SYSTEM.';
        const entrance = first ? 1 : spring(t - 1.23, 3.4, 1);
        const departure = smooth((t - 2.25) / .4);
        ctx.save();
        ctx.translate(0, -departure * h * .21);
        wipeText(ctx, label, margin, h * .16, entrance, w - margin * 2, portrait ? w * .19 : h * .13, palette.paper);
        ctx.restore();
      }

      if (t > 3.6) {
        const settle = clamp(spring(t - 3.74, 2.7, 1));
        const line2 = clamp(spring(t - 3.94, 2.7, 1));
        const baseline = h * (portrait ? .58 : square ? .63 : .68);
        const headlineSize = portrait ? w * .151 : square ? w * .105 : w * .069;
        if (portrait || square) {
          wipeText(ctx, 'LET’S MAKE', margin, baseline, settle, w - 2 * margin, headlineSize, palette.paper);
          wipeText(ctx, 'IT USEFUL.', margin, baseline + headlineSize * 1.15, line2, w - 2 * margin, headlineSize, palette.paper);
        } else {
          wipeText(ctx, 'LET’S MAKE IT USEFUL.', margin, baseline, settle, w - 2 * margin, headlineSize, palette.paper);
        }
        const information = clamp(spring(t - 4.18, 3, 1));
        const contactY = h * (portrait ? .85 : square ? .86 : .855);
        const bodySize = portrait ? w * .036 : square ? w * .029 : w * .0205;
        if (portrait) {
          wipeText(ctx, 'Agentic RL / Post-training', margin, contactY - bodySize * 1.4, information, w - margin * 2, bodySize, palette.paper, 'left', '400 {size}px Arial');
          wipeText(ctx, '/ Evaluation', margin, contactY, information, w - margin * 2, bodySize, palette.paper, 'left', '400 {size}px Arial');
          wipeText(ctx, 'damon.ai', margin, h * .942, information, w - margin * 2, w * .064, palette.lime, 'left', '700 {size}px Arial');
        } else if (square) {
          wipeText(ctx, 'Agentic RL / Post-training / Evaluation', margin, contactY, information, w - margin * 2, bodySize, palette.paper, 'left', '400 {size}px Arial');
          wipeText(ctx, 'damon.ai', margin, h * .94, information, w - margin * 2, w * .04, palette.lime, 'left', '700 {size}px Arial');
        } else {
          wipeText(ctx, 'Agentic RL / Post-training / Evaluation', margin, contactY, information, w * .64, bodySize, palette.paper, 'left', '400 {size}px Arial');
          wipeText(ctx, 'damon.ai', w - margin, contactY, information, w * .24, w * .031, palette.lime, 'right', '700 {size}px Arial');
        }
      }
      ctx.restore();
    },
    dispose() { layouts.clear(); },
  };
}
