// The 404 as a shadow play (assembly plan §3: "a wire whose shadow spells 404").
//
// The technique is Damon's Shadow study (src/directions/shadow/, route /shadow): lay the glyphs out on the
// receiving surface, then lift every point of every stroke off it along the ray to the light, each by its
// own amount. Seen from the light, the wire is the glyphs; seen from anywhere else it is a tangle, and its
// shadow is the glyphs only while the wire hangs at the angle it was bent for.
//
// Here the surface is the page itself (a wall at z = 0, +z towards the viewer, x/y in CSS px of the stage),
// the light is a point in front of it (the magenta mark, drawn by the page as a DOM dot), and instead of
// the light orbiting, the wire turns on its threads and settles. Canvas 2D, no WebGL.

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// single-stroke glyphs in a unit cell: x in [0, w], y 0 (cap) .. 1 (baseline)
const ellipse = (cx, cy, rx, ry, a0, a1, n) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });
const GLYPHS = {
  4: { w: 0.8, s: [[[0.6, 1], [0.6, 0], [0, 0.68], [0.8, 0.68]]] },
  0: { w: 0.62, s: [ellipse(0.31, 0.5, 0.31, 0.5, -Math.PI / 2, Math.PI * 1.5 + 0.12, 72)] },
};
const TEXT = '404';
const GAP = 0.17;
const TEXT_W = [...TEXT].reduce((w, ch) => w + GLYPHS[ch].w, 0) + GAP * (TEXT.length - 1);

function densify(poly, step) {
  const out = [poly[0]];
  for (let i = 1; i < poly.length; i += 1) {
    const [ax, ay] = poly[i - 1];
    const [bx, by] = poly[i];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
    for (let k = 1; k <= n; k += 1) out.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
  }
  return out;
}

// Where things sit for a stage of W x H: the glyphs' box on the wall, the light, the camera.
export function layout(W, H, avail = H) {
  const narrow = W < 700;
  // `avail`: the height above the page's copy; the glyphs and the caption under them stay inside it
  const h = narrow ? Math.min(((W - 36) * 0.88) / TEXT_W, avail * 0.3) : Math.min(avail * 0.46, (W * 0.5) / TEXT_W);
  const cx = narrow ? W * 0.52 : W * 0.6;
  const cy = narrow ? avail * 0.56 : avail * 0.5;
  const D = Math.max(W, H) * 1.5; // camera distance
  const cam = { x: W / 2, y: H / 2, z: D };
  // the light's place on screen, and how far it hangs in front of the wall
  const ls = narrow ? { x: W * 0.16, y: H * 0.115 } : { x: W * 0.15, y: H * 0.17 };
  const Sz = D * 0.42;
  const f = (D - Sz) / D;
  const light = { x: cam.x + (ls.x - cam.x) * f, y: cam.y + (ls.y - cam.y) * f, z: Sz };
  return { W, H, avail, h, cx, cy, half: (TEXT_W * h) / 2, cam, light, lightScreen: ls, narrow };
}

// The wire: every glyph point Q on the wall lifted towards the light by u, P = Q + u (S - Q).
export function buildWire(L) {
  const r = rng(404);
  const { h, cx, cy, light: S } = L;
  const strokes = [];
  let x = cx - (TEXT_W * h) / 2;
  for (const ch of TEXT) {
    const g = GLYPHS[ch];
    for (const s of g.s) {
      const pts = densify(
        s.map(([u, v]) => [x + u * h, cy - h / 2 + v * h]),
        h * 0.012,
      );
      const p1 = r() * 6.28;
      const p2 = r() * 6.28;
      const f1 = 1.7 + r() * 1.2;
      const f2 = 4.6 + r() * 2.4;
      let s0 = 0;
      strokes.push(
        pts.map(([qx, qy], i) => {
          if (i) s0 += Math.hypot(qx - pts[i - 1][0], qy - pts[i - 1][1]) / h;
          const u = clamp(0.5 + 0.17 * Math.sin(f1 * s0 + p1) + 0.07 * Math.sin(f2 * s0 + p2), 0.28, 0.74);
          return [qx + u * (S.x - qx), qy + u * (S.y - qy), u * S.z];
        }),
      );
    }
    x += (g.w + GAP) * h;
  }
  // pivot: the rig turns about a vertical axis through its middle
  let px = 0;
  let pz = 0;
  let n = 0;
  let py = Infinity;
  for (const s of strokes)
    for (const p of s) {
      px += p[0];
      pz += p[2];
      py = Math.min(py, p[1]);
      n += 1;
    }
  // each glyph hangs from a thread tied to its highest point
  const ties = strokes.map((s) => s.reduce((best, p) => (p[1] < best[1] ? p : best), s[0]));
  return { strokes, ties, pivot: [px / n, py, pz / n] };
}

// yaw about the vertical axis, then a little pitch, about the pivot
function turn(p, pv, cy, sy, cp, sp) {
  const x = p[0] - pv[0];
  const y = p[1] - pv[1];
  const z = p[2] - pv[2];
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const y2 = y * cp - z1 * sp;
  const z2 = y * sp + z1 * cp;
  return [x1 + pv[0], y2 + pv[1], Math.max(2, z2 + pv[2])];
}

// Everything to draw for one pose, as polylines: { shadow, penumbra, threadShadows, wire, threads }.
// `yaw` and `pitch` in radians; (0, 0) is the pose whose shadow reads "404".
export function pose(L, wire, yaw, pitch) {
  const { cam, light: S } = L;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const D = cam.z;
  const toWall = ([x, y, z]) => {
    const k = S.z / Math.max(S.z - z, S.z * 0.2);
    return [S.x + (x - S.x) * k, S.y + (y - S.y) * k];
  };
  const toEye = ([x, y, z]) => {
    const k = D / (D - z);
    return [cam.x + (x - cam.x) * k, cam.y + (y - cam.y) * k, k];
  };
  const wireW = Math.max(2.6, L.h * 0.028);
  const shadow = [];
  const wireChunks = [];
  for (const s of wire.strokes) {
    const P = s.map((p) => turn(p, wire.pivot, cy, sy, cp, sp));
    // shadow: width grows with the wire's distance from the wall (magnification), and so does the blur
    const STEP = 5;
    for (let i = 0; i < P.length - 1; i += STEP) {
      const seg = P.slice(i, Math.min(P.length, i + STEP + 1));
      const zAvg = seg.reduce((a, p) => a + p[2], 0) / seg.length;
      const m = S.z / Math.max(S.z - zAvg, S.z * 0.2);
      shadow.push({ pts: seg.map(toWall), w: wireW * Math.sqrt(m), blur: Math.min(3, m - 1) * wireW * 1.1 });
      const eye = seg.map(toEye);
      const k = eye.reduce((a, p) => a + p[2], 0) / eye.length;
      wireChunks.push({ pts: eye, w: wireW * k, depth: zAvg });
    }
  }
  wireChunks.sort((a, b) => a.depth - b.depth); // far (near the wall) first
  const threads = [];
  const threadShadows = [];
  for (const t of wire.ties) {
    const p = turn(t, wire.pivot, cy, sy, cp, sp);
    const top = [p[0], p[1] - L.H * 2, p[2]];
    threads.push([toEye(p), toEye(top)]);
    threadShadows.push([toWall(p), toWall(top)]);
  }
  return { shadow, wire: wireChunks, threads, threadShadows };
}

// How far from "404" a pose is, 0..1 (for the caption's state).
export const settledness = (yaw, pitch) => 1 - clamp(Math.hypot(yaw, pitch) / 0.5, 0, 1);

const BG = '#f4f4f2';
const INK = '#0d0d0d';

// Draw a pose into a 2D context (with two scratch canvases for the shadow layers, so overlapping pieces of
// one shadow do not darken each other, as real shadows don't).
export function paint(ctx, layers, L, P, dpr) {
  const { W, H } = L;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // the shadow, in two opaque layers composited at their own alpha: penumbra, then core
  const [pen, core] = layers;
  for (const [c, wide] of [
    [pen, true],
    [core, false],
  ]) {
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.strokeStyle = INK;
    for (const s of P.shadow) {
      g.lineWidth = wide ? s.w + s.blur * 2 : s.w;
      line(g, s.pts);
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 0.07;
  ctx.drawImage(pen, 0, 0);
  ctx.globalAlpha = 0.74;
  ctx.drawImage(core, 0, 0);
  ctx.globalAlpha = 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // threads' shadows, hairlines
  ctx.strokeStyle = 'rgba(13, 13, 13, 0.16)';
  ctx.lineWidth = 1;
  for (const t of P.threadShadows) line(ctx, t);
  // threads
  ctx.strokeStyle = 'rgba(13, 13, 13, 0.42)';
  ctx.lineWidth = 0.8;
  for (const t of P.threads) line(ctx, t);

  // the wire, far to near, each piece with a halo of wall colour so crossings read
  for (const c of P.wire) {
    ctx.lineCap = 'butt';
    ctx.strokeStyle = BG;
    ctx.lineWidth = c.w + 3;
    line(ctx, c.pts);
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = c.w;
    line(ctx, c.pts);
  }
  // a hairline of light along the wire
  ctx.strokeStyle = 'rgba(244, 244, 242, 0.38)';
  for (const c of P.wire) {
    ctx.lineWidth = Math.max(0.6, c.w * 0.22);
    line(
      ctx,
      c.pts.map(([x, y]) => [x - c.w * 0.18, y - c.w * 0.18]),
    );
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function line(g, pts) {
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i += 1) g.lineTo(pts[i][0], pts[i][1]);
  g.stroke();
}

// The settled pose as SVG path data, for reduced motion and when canvas is unavailable.
const d = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
export function poseSVG(L, P) {
  return {
    viewBox: `0 0 ${Math.round(L.W)} ${Math.round(L.H)}`,
    penumbra: P.shadow.map((s) => ({ d: d(s.pts), w: s.w + s.blur * 2 })),
    shadow: P.shadow.map((s) => ({ d: d(s.pts), w: s.w })),
    threadShadows: P.threadShadows.map(d),
    threads: P.threads.map(d),
    wire: P.wire.map((c) => ({ d: d(c.pts), w: c.w })),
  };
}
