import * as THREE from 'three';
import { GLYPH } from './strip.js';

export const COLS = 5;
export const ROWS = 4;
const CELL = 384;

// Numerals 1-20 as white-on-transparent glyphs (the shader uses alpha only). Cell v-1 holds v.
// A cell spans one face circumradius, centred on the face centroid.
export async function numeralAtlas() {
  const fontPx = Math.round(GLYPH.size * CELL);
  const font = `${GLYPH.weight} ${fontPx}px ${GLYPH.font}`;
  try {
    await document.fonts.load(font, '0123456789');
  } catch {
    /* fall back to whatever is available */
  }
  const canvas = document.createElement('canvas');
  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;
  const ctx = canvas.getContext('2d');
  ctx.font = font;
  if ('fontStretch' in ctx) ctx.fontStretch = GLYPH.stretch;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff';
  for (let v = 1; v <= 20; v++) {
    const col = (v - 1) % COLS;
    const row = Math.floor((v - 1) / COLS);
    const cx = col * CELL + CELL / 2;
    const base = row * CELL + CELL / 2 + GLYPH.base * fontPx;
    ctx.fillText(String(v), cx, base);
    if (v === 6 || v === 9) {
      const w = GLYPH.barW * fontPx;
      ctx.fillRect(cx - w / 2, base + GLYPH.barY * fontPx, w, GLYPH.barH * fontPx);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.needsUpdate = true;
  return tex;
}
