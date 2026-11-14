// Canvas artwork for the box. Outside faces carry the hero; inside faces carry the card backs.
const INK = '#17120c';
const KRAFT = '#c29a66';
const KRAFT_IN = '#d3b384';
const ORANGE = '#ff5a1f';
const LABEL = '#f6f3ea';

const display = (px) => `800 ${px}px "Archivo Variable", sans-serif`;
const mono = (px, weight = 400) => `${weight} ${px}px "Cartograph CF", monospace`;

function board(c, S, color, seed) {
  c.fillStyle = color;
  c.fillRect(0, 0, S, S);
  let r = seed;
  const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  c.strokeStyle = 'rgba(70, 45, 15, 0.08)';
  c.lineWidth = 1;
  for (let i = 0; i < 320; i++) {
    const x = rnd() * S;
    const y = rnd() * S;
    const l = 6 + rnd() * 26;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + l, y + (rnd() - 0.5) * 3);
    c.stroke();
  }
}

function dieline(c, S) {
  c.save();
  c.setLineDash([10, 8]);
  c.strokeStyle = 'rgba(23, 18, 12, 0.4)';
  c.lineWidth = 1.5;
  c.strokeRect(16, 16, S - 32, S - 32);
  c.restore();
}

// Draw lines of display type at one shared size that fits `maxW`.
function headline(c, lines, x, top, maxW, px) {
  let size = px;
  for (const line of lines) {
    c.font = display(size);
    const w = c.measureText(line).width;
    if (w > maxW) size = Math.floor((size * maxW) / w);
  }
  c.font = display(size);
  c.fillStyle = INK;
  c.textBaseline = 'alphabetic';
  lines.forEach((line, i) => c.fillText(line, x, top + size * (0.86 + i * 0.9)));
  return top + size * (0.86 + (lines.length - 1) * 0.9);
}

function small(c, text, x, y, px = 17, weight = 400, color = INK) {
  c.font = mono(px, weight);
  c.fillStyle = color;
  c.textBaseline = 'alphabetic';
  c.fillText(text, x, y);
}

function barcode(c, text, x, y, w, h) {
  const bits = [];
  for (const ch of text) for (let b = 6; b >= 0; b--) bits.push((ch.charCodeAt(0) >> b) & 1);
  const unit = w / bits.length;
  c.fillStyle = INK;
  bits.forEach((bit, i) => {
    if (bit) c.fillRect(x + i * unit, y, Math.max(1, unit * (i % 3 === 0 ? 1 : 0.7)), h);
  });
}

function arrowUp(c, x, y, s) {
  c.fillStyle = INK;
  c.beginPath();
  c.moveTo(x, y - s);
  c.lineTo(x + s * 0.62, y - s * 0.25);
  c.lineTo(x + s * 0.24, y - s * 0.25);
  c.lineTo(x + s * 0.24, y + s * 0.5);
  c.lineTo(x - s * 0.24, y + s * 0.5);
  c.lineTo(x - s * 0.24, y - s * 0.25);
  c.lineTo(x - s * 0.62, y - s * 0.25);
  c.closePath();
  c.fill();
  c.fillRect(x - s * 0.7, y + s * 0.62, s * 1.4, s * 0.12);
}

// face: 0 base, 1 east, 2 west, 3 north, 4 south, 5 lid
export function drawOutside(c, S, face) {
  board(c, S, KRAFT, 7 + face * 13);
  dieline(c, S);
  const m = 44;
  // which artwork each face carries: 5 name, 3 headline, 0 headline end, 1 label, 2 handling, 4 weight
  const role = [3, 0, 5, 2, 4, 1][face];
  if (role === 5) {
    small(c, 'DIELINE 01 — PERSONAL SITE', m, 62);
    small(c, 'FOLD →', S - m - 70, 62);
    headline(c, ['DAMON', 'GUAN'], m - 4, 96, S - m * 2, 190);
    small(c, 'LLM ALGORITHM ENGINEER', m, S - 76, 19, 600);
    small(c, 'ALIBABA', m, S - 48, 19);
  } else if (role === 3) {
    small(c, 'CONTENTS', m, 62);
    headline(c, ['I BUILD', 'AGENTS'], m - 4, 110, S - m * 2, 190);
    small(c, 'AGENTIC RL · POST-TRAINING · EVALUATION', m, S - 48, 17);
  } else if (role === 0) {
    headline(c, ['THAT', 'SHIP.'], m - 4, 60, S - m * 2, 220);
    c.fillStyle = ORANGE;
    c.beginPath();
    c.arc(S - m - 62, S - m - 62, 62, 0, Math.PI * 2);
    c.fill();
    small(c, 'HANDLE WITH', m, S - 76, 19, 600);
    small(c, 'EVALUATION', m, S - 48, 19, 600);
  } else if (role === 1) {
    c.fillStyle = LABEL;
    c.fillRect(m, m + 10, S - m * 2, S - m * 2 - 20);
    c.strokeStyle = INK;
    c.lineWidth = 3;
    c.strokeRect(m, m + 10, S - m * 2, S - m * 2 - 20);
    const x = m + 26;
    small(c, 'FROM', x, 110, 15);
    c.font = display(84);
    c.fillStyle = INK;
    c.fillText('SYD', x, 190);
    small(c, 'TO', x + 300, 110, 15);
    c.fillText('HGH', x + 296, 190);
    small(c, '→', x + 210, 176, 40);
    c.fillRect(m, 214, S - m * 2, 3);
    small(c, 'ROUTE', x, 250, 15);
    small(c, 'SYD 2019 · SIN 2023 · PEK 2024 · HGH 2025', x, 280, 18, 600);
    small(c, 'UNSW · NUS · MEITUAN / MSRA · ALIBABA', x, 308, 15);
    c.fillRect(m, 332, S - m * 2, 3);
    barcode(c, 'DAMON GUAN LLM', x, 362, S - m * 2 - 52, 120);
    small(c, 'DG 2019 0901 — 2026 · 6 PROJECTS · 3 PAPERS', x, 516, 15);
    small(c, 'SHIP TO: REAL WORK', x, 556, 22, 600);
  } else if (role === 2) {
    arrowUp(c, S * 0.32, S * 0.36, 120);
    arrowUp(c, S * 0.68, S * 0.36, 120);
    small(c, 'THIS SIDE UP', m, S - 132, 30, 600);
    small(c, 'EVALUATE BEFORE TRAINING', m, S - 88, 21);
    small(c, 'BOUND THE AUTHORITY · READ THE TRACE', m, S - 52, 16);
  } else {
    small(c, 'NET WT.', m, 80, 17);
    headline(c, ['6 / 3'], m - 4, 96, S - m * 2, 200);
    small(c, 'PROJECTS / PAPERS', m, 320, 19, 600);
    small(c, 'INTERNAL MEASUREMENTS,', m, S - 132, 17);
    small(c, 'NOT PUBLIC BENCHMARKS.', m, S - 106, 17);
    small(c, 'SCROLL TO PACK ↓', m, S - 52, 24, 600);
  }
}

export function drawInside(c, S, index) {
  board(c, S, KRAFT_IN, 91 + index * 17);
  c.strokeStyle = 'rgba(70, 45, 15, 0.07)';
  c.lineWidth = 2;
  for (let x = 10; x < S; x += 12) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, S);
    c.stroke();
  }
  c.font = display(330);
  c.fillStyle = 'rgba(23, 18, 12, 0.11)';
  c.textAlign = 'right';
  c.textBaseline = 'alphabetic';
  c.fillText(`0${index + 1}`, S - 24, S - 34);
  c.textAlign = 'left';
}
