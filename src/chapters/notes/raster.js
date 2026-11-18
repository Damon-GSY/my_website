// A picture of what the DOM shows inside a rectangle of the viewport, drawn into a 2D canvas: the
// texture the paper carries while it moves. Port of the Paper study's renderPage: backgrounds and
// borders of every element, then the text, word by word, at the exact boxes the browser laid it out
// in (Range client rects), so when the paper lies flat its print sits on the DOM text's pixels.
// `[data-raster="skip"]` leaves an element out (the pin, which moves on its own).

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

function hidden(el, cache) {
  if (!el || el.nodeType !== 1) return false;
  if (cache.has(el)) return cache.get(el);
  const cs = getComputedStyle(el);
  const h =
    el.dataset.raster === 'skip' ||
    cs.display === 'none' ||
    cs.visibility === 'hidden' ||
    cs.clipPath.startsWith('inset(50%') ||
    hidden(el.parentElement, cache);
  cache.set(el, h);
  return h;
}

function fillBox(g, x, y, w, h, radius) {
  if (radius > 0 && g.roundRect) {
    g.beginPath();
    g.roundRect(x, y, w, h, Math.min(radius, w / 2, h / 2));
    g.fill();
  } else g.fillRect(x, y, w, h);
}

// Simple line icons (the list's arrow): each <path>, mapped from the viewBox onto the box.
function drawSvg(g, svg, r) {
  const vb = svg.viewBox?.baseVal;
  if (!vb || !vb.width || !vb.height) return;
  for (const p of svg.querySelectorAll('path')) {
    const cs = getComputedStyle(p);
    const path = new Path2D(p.getAttribute('d') || '');
    g.save();
    g.translate(r.left, r.top);
    g.scale(r.width / vb.width, r.height / vb.height);
    g.translate(-vb.x, -vb.y);
    if (cs.fill !== 'none') {
      g.fillStyle = cs.fill;
      g.fill(path);
    }
    if (cs.stroke !== 'none') {
      g.strokeStyle = cs.stroke;
      g.lineWidth = parseFloat(cs.strokeWidth) || 1;
      g.lineCap = cs.strokeLinecap;
      g.lineJoin = cs.strokeLinejoin;
      g.stroke(path);
    }
    g.restore();
  }
}

// root: the element whose subtree is drawn. clip: {x, y, w, h}, whole CSS px in viewport coordinates.
// bg: the colour under everything (the page or the paper).
export function raster(root, clip, bg) {
  // the screen's own density (up to 3), so the print is as sharp as the text it stands in for
  const dpr = Math.min(3, window.devicePixelRatio || 1, 4096 / Math.max(clip.w, clip.h));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(clip.w * dpr));
  c.height = Math.max(1, Math.round(clip.h * dpr));
  const g = c.getContext('2d');
  g.scale(c.width / clip.w, c.height / clip.h);
  g.translate(-clip.x, -clip.y);
  g.fillStyle = bg;
  g.fillRect(clip.x, clip.y, clip.w, clip.h);
  const meet = (r) => r.right > clip.x && r.left < clip.x + clip.w && r.bottom > clip.y && r.top < clip.y + clip.h && r.width > 0;
  const cache = new Map();

  // boxes snap to device pixels, as the browser paints them (a 1px rule must not blur across two rows)
  const px = (v) => Math.round(v * dpr) / dpr;
  for (const el of [root, ...root.querySelectorAll('*')]) {
    const b = el.getBoundingClientRect();
    const r = { left: px(b.left), top: px(b.top), right: px(b.right), bottom: px(b.bottom), width: b.width, height: b.height };
    r.width = r.right - r.left;
    r.height = r.bottom - r.top;
    if (!meet(r) || hidden(el, cache)) continue;
    const cs = getComputedStyle(el);
    if (el.tagName === 'svg') {
      drawSvg(g, el, b);
      continue;
    }
    if (el.closest('svg')) continue;
    if (cs.backgroundColor !== TRANSPARENT) {
      g.fillStyle = cs.backgroundColor;
      fillBox(g, r.left, r.top, r.width, r.height, parseFloat(cs.borderTopLeftRadius) || 0);
    }
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      const w = parseFloat(cs[`border${side}Width`]);
      if (!(w > 0) || cs[`border${side}Style`] === 'none') continue;
      g.fillStyle = cs[`border${side}Color`];
      if (side === 'Top') g.fillRect(r.left, r.top, r.width, w);
      else if (side === 'Bottom') g.fillRect(r.left, r.bottom - w, r.width, w);
      else if (side === 'Left') g.fillRect(r.left, r.top, w, r.height);
      else g.fillRect(r.right - w, r.top, w, r.height);
    }
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const draw = (text, rr) => {
    g.fillText(text, rr.left, rr.top + g.measureText(text).fontBoundingBoxAscent);
  };
  let n;
  while ((n = walker.nextNode())) {
    const el = n.parentElement;
    if (hidden(el, cache)) continue;
    const cs = getComputedStyle(el);
    g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    g.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
    g.fillStyle = cs.color;
    g.textBaseline = 'alphabetic';
    const up = cs.textTransform === 'uppercase';
    const re = /\S+/g;
    let m;
    while ((m = re.exec(n.data))) {
      range.setStart(n, m.index);
      range.setEnd(n, m.index + m[0].length);
      const rects = range.getClientRects();
      if (!rects.length) continue;
      const word = up ? m[0].toUpperCase() : m[0];
      if (rects.length === 1) {
        if (meet(rects[0])) draw(word, rects[0]);
        continue;
      }
      // a run without spaces that wraps (Chinese): one character at a time, each at its own box
      for (let k = 0; k < m[0].length; k += 1) {
        range.setStart(n, m.index + k);
        range.setEnd(n, m.index + k + 1);
        const rr = range.getClientRects()[0];
        if (rr && meet(rr)) draw(up ? m[0][k].toUpperCase() : m[0][k], rr);
      }
    }
  }
  return c;
}

// Plain paper, for an end that has nothing printed on it.
export function blank(w, h, bg) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const g = c.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}
