import { clamp, fitText, mix, smooth, spring, PALETTE } from '../motion.js';

const TAU = Math.PI * 2;
const DISPLAY = '400 {size}px Anton';

function asterisk(ctx, x, y, radius, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  for (let i = 0; i < 6; i++) {
    ctx.rotate(TAU / 6);
    ctx.fillRect(-radius * .15, -radius, radius * .3, radius * 2);
  }
  ctx.restore();
}

function fill(ctx, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

function text(ctx, words, x, y, maxWidth, maxSize, color, align = 'left') {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  const size = fitText(ctx, words, DISPLAY, maxWidth, maxSize);
  ctx.fillText(words, x, y);
  return size;
}

function rails(ctx, x, y, radius, angle, color, count = 4) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, radius * .011);
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * (1 + i * .14), radius * .4 * (1 + i * .14), 0, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function hello(ctx, t, { width: w, height: h, portrait, square, palette: p }) {
  fill(ctx, w, h, p.blue);
  const narrow = portrait || square;
  const unit = Math.min(w, h);
  rails(ctx, w * .22, h * (narrow ? .42 : .51), unit * .67, -.55 + t * .12, '#296ffa', 5);

  const size = fitText(ctx, 'HELLO.', DISPLAY, w * .91, narrow ? w * .32 : h * .55);
  const total = ctx.measureText('HELLO.').width;
  const x = (w - total) * .5;
  const baseline = h * (portrait ? .665 : square ? .65 : .7);
  ctx.fillStyle = p.paper;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Each letter settles on its own spring; the first frame already reads HELLO.
  let offset = 0;
  for (let i = 0; i < 6; i++) {
    const letter = 'HELLO.'[i];
    const advance = ctx.measureText(letter).width;
    const settled = spring(t + .16 - i * .015, 2.7, .69);
    ctx.save();
    ctx.translate(x + offset + advance * .5, baseline + (1 - settled) * size * .25);
    ctx.rotate((1 - settled) * (i % 2 ? -.14 : .14));
    ctx.fillText(letter, -advance * .5, 0);
    ctx.restore();
    offset += advance;
  }

  const spin = mix(-.58, .12, spring(t + .06, 1.8, .61)) + t * .12;
  asterisk(ctx, w * (portrait ? .73 : .84), h * (portrait ? .255 : .23), unit * (portrait ? .18 : .13), spin, p.lime);

  ctx.fillStyle = p.paper;
  ctx.textAlign = 'left';
  ctx.font = `500 ${unit * (portrait ? .044 : .038)}px Arial`;
  ctx.fillText('GDAMON', w * .06, h * .92);
  ctx.beginPath();
  ctx.arc(w * .925, h * .902, unit * .012, 0, TAU);
  ctx.fill();
}

function identity(ctx, t, { width: w, height: h, portrait, square, palette: p }) {
  fill(ctx, w, h, p.paper);
  const unit = Math.min(w, h);
  const narrow = portrait || square;
  const enter = spring(t, 2.4, .88);
  const margin = w * .058;
  const headingY = h * (portrait ? .335 : square ? .355 : .37);
  const nameY = h * (portrait ? .63 : square ? .68 : .79);

  asterisk(ctx, w * .80, h * (portrait ? .23 : .27), unit * .145, -.1 + spring(t - .15, 1.8, .7) * .4, p.orange);
  ctx.save();
  ctx.translate((1 - enter) * -w * .12, 0);
  text(ctx, "I'M", margin, headingY, w * .38, unit * (narrow ? .235 : .265), p.blue);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, nameY - unit * .46, w, unit * .49);
  ctx.clip();
  text(ctx, 'DAMON.', margin, nameY + (1 - spring(t - .08, 2.5, .86)) * unit * .35, w - margin * 2, unit * .46, p.blue);
  ctx.restore();

  const labelSize = unit * (portrait ? .046 : square ? .038 : .042);
  const roleY = h * (portrait ? .77 : .90);
  ctx.font = `600 ${labelSize}px Arial`;
  ctx.fillStyle = p.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.save();
  ctx.beginPath();
  ctx.rect(margin, roleY - labelSize, w - margin * 2, labelSize * 3.2);
  ctx.clip();
  ctx.translate(0, (1 - spring(t - .25, 2.6, 1)) * labelSize * 3);
  if (narrow) {
    ctx.fillText('AI RESEARCHER', margin, roleY);
    ctx.fillText('LLM ENGINEER', margin, roleY + labelSize * 1.45);
  } else {
    ctx.fillText('AI RESEARCHER  /  LLM ENGINEER', margin, roleY);
  }
  ctx.restore();
}

function mantra(ctx, t, { width: w, height: h, portrait, square, palette: p }) {
  fill(ctx, w, h, p.blue);
  const unit = Math.min(w, h);
  const narrow = portrait || square;
  const margin = w * .06;
  const maxSize = square ? w * .21 : portrait ? w * .235 : h * .275;
  const textWidth = narrow ? w * .87 : w * .74;
  const rowGap = h * (square ? .25 : portrait ? .172 : .269);
  const firstY = h * (portrait ? .39 : square ? .28 : .285);
  const phrases = ['THINK.', 'BUILD.', 'REPEAT.'];
  rails(ctx, w * 1.015, h * .50, unit * .56, -.63 + t * .13, '#3479f8', 5);

  for (let i = 0; i < phrases.length; i++) {
    const start = i * .48;
    const progress = spring(t - start + .13, 2.65, .86);
    const y = firstY + rowGap * i;
    const x = narrow ? margin : margin + w * .087 * i;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y - maxSize, w, maxSize * 1.075);
    ctx.clip();
    ctx.translate(0, (1 - progress) * maxSize * 1.15);
    text(ctx, phrases[i], x, y, textWidth, maxSize, i === 1 ? p.lime : p.paper);
    ctx.restore();
  }

  const iconRadius = unit * (portrait ? .078 : .07);
  asterisk(ctx, w * (narrow ? .80 : .79), h * (portrait ? .185 : .15), iconRadius, .32 + t * .32, p.lime);

  if (portrait) {
    ctx.fillStyle = p.paper;
    ctx.font = `500 ${unit * .042}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText('FROM RESEARCH TO REALITY.', margin, h * .89);
  }
}

function trainingArtwork(ctx, t, { width: w, height: h, palette: p }) {
  fill(ctx, w, h, p.blue);
  const unit = Math.min(w, h);
  const turn = -.12 + Math.sin(t * .45) * .11;
  const spread = .88 + .12 * Math.sin(t * .6);
  const project = (x, y, z) => {
    const rx = x * Math.cos(turn) - y * Math.sin(turn);
    const ry = x * Math.sin(turn) + y * Math.cos(turn);
    return [w * .52 + (rx - ry) * unit * .38, h * .58 + (rx + ry) * unit * .16 - z * unit * .30];
  };
  const path = (points) => {
    ctx.beginPath();
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
  };
  ctx.save();
  ctx.lineWidth = Math.max(1, unit * .002);
  for (let layer = 0; layer < 3; layer++) {
    const z = (layer - .7) * spread;
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => project(x, y, z));
    const lower = corners.map(([x, y]) => [x, y + unit * .04]);
    path([corners[3], corners[2], lower[2], lower[3]]);
    ctx.fillStyle = '#0144bc'; ctx.fill();
    ctx.strokeStyle = '#7aabff'; ctx.stroke();
    path([corners[2], corners[1], lower[1], lower[2]]);
    ctx.fillStyle = '#063da0'; ctx.fill(); ctx.stroke();
    path(corners);
    ctx.fillStyle = ['#1763e7', '#397ff1', '#e2edff'][layer]; ctx.fill();
    ctx.strokeStyle = layer === 2 ? '#ffffff' : '#9abfff'; ctx.stroke();
    ctx.strokeStyle = layer === 2 ? '#0757ed33' : '#bcd4ff50';
    for (let line = 1; line < 10; line++) {
      const position = -1 + line / 5;
      for (const ends of [[[-1, position], [1, position]], [[position, -1], [position, 1]]]) {
        ctx.beginPath();
        ends.forEach(([x, y], index) => { const point = project(x, y, z); index ? ctx.lineTo(...point) : ctx.moveTo(...point); });
        ctx.stroke();
      }
    }
    for (let cell = 0; cell < 13; cell++) {
      const x = -1 + ((cell * 7 + layer * 3) % 10) / 5;
      const y = -1 + ((cell * 3 + layer) % 10) / 5;
      const pulse = .28 + .72 * ((Math.sin(t * 1.5 - cell * .63 - layer) + 1) / 2);
      path([[x + .03, y + .03], [x + .17, y + .03], [x + .17, y + .17], [x + .03, y + .17]].map(([px, py]) => project(px, py, z)));
      ctx.fillStyle = layer === 2 ? p.blue : p.lime;
      ctx.globalAlpha = pulse; ctx.fill(); ctx.globalAlpha = 1;
    }
  }
  // Signals travel between model layers; every position is derived from scroll time.
  for (let i = 0; i < 4; i++) {
    const x = (i % 2 ? .8 : -.8), y = (i < 2 ? -.8 : .8);
    const a = project(x, y, -.7 * spread), b = project(x, y, 1.3 * spread);
    ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b);
    ctx.strokeStyle = '#ffffff55'; ctx.stroke();
    const progress = (t * .23 + i * .23) % 1;
    const py = mix(a[1], b[1], progress);
    ctx.fillStyle = i % 2 ? p.orange : p.lime;
    ctx.beginPath(); ctx.arc(a[0], py, unit * .012, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

export function createIntroChapter() {
  return {
    draw(ctx, localTime, layout) {
      const t = clamp(localTime, 0, 6);
      const frame = { ...layout, palette: layout.palette || PALETTE };
      const { width: w, height: h } = frame;
      if (layout.artworkOnly) { trainingArtwork(ctx, t, frame); return; }
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (t < 1.7) {
        hello(ctx, t, frame);
      } else if (t < 1.98) {
        hello(ctx, t, frame);
        const extent = smooth((t - 1.7) / .28) * (w + h * .16);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(extent, 0);
        ctx.lineTo(extent - h * .16, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.clip();
        identity(ctx, t - 1.7, frame);
        ctx.restore();
      } else if (t < 3.65) {
        identity(ctx, t - 1.7, frame);
      } else if (t < 3.93) {
        identity(ctx, t - 1.7, frame);
        const progress = smooth((t - 3.65) / .28);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, h * (1 - progress), w, h * progress);
        ctx.clip();
        mantra(ctx, t - 3.65, frame);
        ctx.restore();
      } else {
        mantra(ctx, t - 3.65, frame);
      }
      ctx.restore();
    },
  };
}
