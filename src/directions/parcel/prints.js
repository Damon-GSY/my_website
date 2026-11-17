// Canvas artwork for the box. Outside faces carry the hero; inside faces carry the card backs.
// Two printings of the same box: kraft (the /parcel study) and paper (the home page system).
export const KRAFT = {
  ink: '#17120c',
  board: '#c29a66',
  boardIn: '#d3b384',
  fibre: 'rgba(70, 45, 15, 0.08)',
  flute: 'rgba(70, 45, 15, 0.07)',
  dieline: 'rgba(23, 18, 12, 0.4)',
  numeral: 'rgba(23, 18, 12, 0.11)',
  sticker: '#ff5a1f',
  label: '#f6f3ea',
  shadow: '40,25,10',
};
export const PAPER = {
  ink: '#0d0d0d',
  board: '#fbfbf9',
  boardIn: '#e9e9e5',
  fibre: 'rgba(13, 13, 13, 0.025)',
  flute: 'rgba(13, 13, 13, 0.035)',
  dieline: 'rgba(13, 13, 13, 0.7)',
  numeral: 'rgba(13, 13, 13, 0.08)',
  sticker: '#ff2d8a',
  label: '#ffffff',
  shadow: '20,20,24',
};
let INK = KRAFT.ink;

const display = (px) => `800 ${px}px "Archivo Variable", sans-serif`;
const mono = (px, weight = 400) => `${weight} ${px}px "Cartograph CF", monospace`;

function board(c, S, color, seed, fibre) {
  c.fillStyle = color;
  c.fillRect(0, 0, S, S);
  let r = seed;
  const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  c.strokeStyle = fibre;
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

function dieline(c, S, color, width) {
  c.save();
  c.setLineDash([10, 8]);
  c.strokeStyle = color;
  c.lineWidth = width;
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

// a fill-in rule: the place is not filled in yet
function blank(c, x, y, w, h = 4) {
  c.fillStyle = INK;
  c.fillRect(x, y, w, h);
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
export function drawOutside(c, S, face, theme = KRAFT, opts = {}) {
  INK = theme.ink;
  board(c, S, theme.board, 7 + face * 13, theme.fibre);
  dieline(c, S, theme.dieline, theme === KRAFT ? 1.5 : 1.2);
  const m = 44;
  // which artwork each face carries: 5 name, 3 headline, 0 headline end, 1 label, 2 handling, 4 weight
  const role = [3, 0, 5, 2, 4, 1][face];
  if (role === 5 && theme === PAPER) {
    // home page: the hero above already says the name, so this face opens the sentence instead
    small(c, 'DIELINE 02 — SELECTED WORK', m, 62);
    small(c, 'FOLD →', S - m - 70, 62);
    headline(c, ['SIX', 'PROJECTS.'], m - 4, 96, S - m * 2, 190);
    small(c, 'LLM ALGORITHM ENGINEER', m, S - 48, 19, 600);
  } else if (role === 5) {
    small(c, 'DIELINE 01 — PERSONAL SITE', m, 62);
    small(c, 'FOLD →', S - m - 70, 62);
    headline(c, ['DAMON', 'GUAN'], m - 4, 96, S - m * 2, 190);
    small(c, 'LLM ALGORITHM ENGINEER', m, S - 48, 19, 600);
  } else if (role === 3) {
    small(c, 'CONTENTS', m, 62);
    headline(c, ['I BUILD', 'AGENTS'], m - 4, 110, S - m * 2, 190);
    small(c, 'AGENTIC RL · POST-TRAINING · EVALUATION', m, S - 48, 17);
  } else if (role === 0) {
    headline(c, ['THAT', 'SHIP.'], m - 4, 60, S - m * 2, 220);
    // on the home page the sticker is a mesh of its own: it is the travelling mark (see Scene.js)
    if (!opts.noSticker) {
      c.fillStyle = theme.sticker;
      c.beginPath();
      c.arc(S - m - 62, S - m - 62, 62, 0, Math.PI * 2);
      c.fill();
    }
    small(c, 'HANDLE WITH', m, S - 76, 19, 600);
    small(c, 'EVALUATION', m, S - 48, 19, 600);
  } else if (role === 1) {
    c.fillStyle = theme.label;
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
    blank(c, x + 300, 186, 150);
    small(c, '→', x + 210, 176, 40);
    c.fillRect(m, 214, S - m * 2, 3);
    small(c, 'ROUTE', x, 250, 15);
    small(c, 'SYD 2019 · SIN 2023 · PEK 2024 ·', x, 280, 18, 600);
    blank(c, x + c.measureText('SYD 2019 · SIN 2023 · PEK 2024 · ').width, 282, 64, 2);
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

export function drawInside(c, S, index, theme = KRAFT) {
  INK = theme.ink;
  board(c, S, theme.boardIn, 91 + index * 17, theme.fibre);
  c.strokeStyle = theme.flute;
  c.lineWidth = 2;
  for (let x = 10; x < S; x += 12) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, S);
    c.stroke();
  }
  c.font = display(330);
  c.fillStyle = theme.numeral;
  c.textAlign = 'right';
  c.textBaseline = 'alphabetic';
  c.fillText(`0${index + 1}`, S - 24, S - 34);
  c.textAlign = 'left';
}
