// The flat record: 20 equilateral triangles in a zig-zag, numbered 1-20 left to right, in one row
// (or two rows of ten on phones), with a tally zone above each row. Units are arbitrary (side = 100);
// the SVG uses them as its viewBox and the WebGL scene maps them onto the docked rect.

export const SIDE = 100;
const H = (SIDE * Math.sqrt(3)) / 2;
const TALLY = 0.66 * SIDE; // room above a row for the tally marks
const ROW_GAP = 0.3 * SIDE;
const GAP = 0.05 * SIDE; // space between neighbouring tiles
const R_IN = SIDE / (2 * Math.sqrt(3));
const SHRINK = (R_IN - GAP / 2) / R_IN;

// Numeral metrics shared by the canvas atlas and the SVG twin (fractions of the face circumradius).
export const GLYPH = {
  size: 0.6, // font size
  base: 0.355, // baseline offset below the centroid, in font sizes
  barW: 0.44,
  barH: 0.075,
  barY: 0.1, // below the baseline, in font sizes
  font: "'Archivo Variable', sans-serif",
  weight: 900,
  stretch: 'semi-condensed',
};

export function stripLayout(rows) {
  const per = 20 / rows;
  const rowH = TALLY + H;
  const vbW = (SIDE * (per + 1)) / 2;
  const vbH = rows * rowH + (rows - 1) * ROW_GAP;
  const tris = [];
  for (let v = 1; v <= 20; v++) {
    const r = Math.floor((v - 1) / per);
    const j = (v - 1) % per;
    const top = r * (rowH + ROW_GAP) + TALLY;
    const base = top + H;
    const up = j % 2 === 0;
    const cx = ((j + 1) * SIDE) / 2;
    const cy = up ? base - H / 3 : top + H / 3;
    const full = up
      ? [
          [cx, top],
          [cx - SIDE / 2, base],
          [cx + SIDE / 2, base],
        ]
      : [
          [cx - SIDE / 2, top],
          [cx, base],
          [cx + SIDE / 2, top],
        ];
    const pts = full.map(([x, y]) => [cx + (x - cx) * SHRINK, cy + (y - cy) * SHRINK]);
    tris.push({ v, up, cx, cy, pts, rho: (SIDE / Math.sqrt(3)) * SHRINK, tallyBase: top - 0.12 * SIDE });
  }
  return { vbW, vbH, tris };
}

// One mark per roll, in roll order (k = step index). Groups of five: four strokes and a slash.
export function tallyMarks(layout, rolls) {
  const seen = new Array(21).fill(0);
  const count = new Array(21).fill(0);
  rolls.forEach((v) => count[v]++);
  const sp = 0.08 * SIDE;
  const th = 0.24 * SIDE;
  return rolls.map((v, k) => {
    const m = seen[v]++;
    const tri = layout.tris[v - 1];
    const group = Math.floor(m / 5);
    const i = m % 5;
    const strokes = Math.min(4, count[v] - group * 5);
    const y1 = tri.tallyBase - group * (th + 0.07 * SIDE);
    const y0 = y1 - th;
    const x0 = tri.cx - ((strokes - 1) * sp) / 2;
    if (i === 4) return { k, v, x1: x0 - 0.6 * sp, y1: y1 - 0.15 * th, x2: x0 + 3.6 * sp, y2: y0 + 0.15 * th };
    return { k, v, x1: x0 + i * sp, y1, x2: x0 + i * sp, y2: y0 };
  });
}
