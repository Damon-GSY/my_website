// The Evidence film (Evidence.jsx), fetched when the chapter is near. A pure function of scroll:
//
//   p 0 … A   the type board, flat (plain DOM: its rules, the labels at their board places)
//     A … B   the camera tilts down. Each count and rate rises from the back of its cell as a paper
//             tower with its figure printed on the roof, while the printed scale keys stand up beside
//             them as the axes (a tower is always its value × its axis's height). SOTA and GRPO, which
//             are not quantities, stay flat.
//     B … C   the towers gather into two rows, one per axis, at their bars' places
//     C … D   the camera swings level and flattens: the towers' fronts are the bars, inked; the two flat
//             plates hinge up into the notes beside the chart
//     D … 1   the chart, flat (plain DOM)
//
// The 3D world is CSS 3D (preserve-3d faces) and holds no text. Every label is the chart's own DOM text,
// moved in 2D to its geometry's projected corner (project() is the transform the world uses), so labels
// are crisp in every frame and exactly where the board, then the chart, has them at the two rests.

import { FIGURES } from './figures.js';

const A = 0.06;
const B = 0.4;
const C = 0.62;
const D = 0.9;
const RAD = Math.PI / 180;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) });
const lerpFp = (a, b, t) => ({ x0: lerp(a.x0, b.x0, t), w: lerp(a.w, b.w, t), z0: lerp(a.z0, b.z0, t), z1: lerp(a.z1, b.z1, t) });
const px = (v) => `${v.toFixed(2)}px`;

export function startEvidence(root) {
  const stage = root.querySelector('.ev-stage');
  const track = root.querySelector('.ev-track');
  const q = (sel) => root.querySelector(sel);
  const caps = [...root.querySelectorAll('.ev-cap [data-state]')];

  // ---- the world: faces are made once, then sized and placed every frame ----
  const world = document.createElement('div');
  world.className = 'ev-world';
  const make = (cls, parent = world) => {
    const el = document.createElement(parent === world ? 'div' : 'i');
    el.className = cls;
    parent.appendChild(el);
    return el;
  };
  // the floor is the board itself: a copy of its rules, laid down flat
  const cells = q('.ev-board .ev-cells');
  const ground = cells.cloneNode(true);
  ground.querySelectorAll('[data-ph], [data-cell]').forEach((el) => {
    el.removeAttribute('data-ph');
    el.removeAttribute('data-cell');
  });
  ground.classList.add('ev-ground');
  world.appendChild(ground);

  const rulers = {};
  for (const g of ['count', 'rate']) {
    const ru = { base: make('ev-base3'), line: make('ev-rule3'), grids: [] };
    const n = g === 'count' ? 4 : 5;
    for (let k = 0; k < n; k += 1) {
      make('mk', ru.line).style.setProperty('--f', k / (n - 1));
      const gl = make('gl', ru.line);
      gl.style.setProperty('--f', k / (n - 1));
      ru.grids.push(gl);
    }
    rulers[g] = ru;
  }

  const items = FIGURES.map((f) => {
    const it = { f, faces: {} };
    if (f.scale === 'none') {
      it.faces.roof = make('ev-face ev-plate');
    } else {
      it.faces.shadow = make('ev-shadow');
      it.faces.left = make('ev-face ev-left');
      it.faces.right = make('ev-face ev-right');
      it.faces.front = make('ev-face ev-front');
      it.faces.roof = make('ev-face ev-roof');
      if (f.lower) it.faces.cap = make('ev-face ev-capface');
    }
    return it;
  });
  const indexOf = Object.fromEntries(items.map((it, i) => [it.f.n, i]));

  // ---- the labels that travel: the chart's own text ----
  const movers = [...root.querySelectorAll('[data-mv]')].map((el) => {
    const key = el.dataset.mv;
    const [type, a, b] = key.split(':');
    return { el, key, type, a, b: b === undefined ? undefined : Number(b), ph: q(`[data-ph="${key}"]`) };
  });

  let geo = null;
  let raf = 0;
  let lastP = -1;

  const T = (el, v) => {
    if (el._t !== v) {
      el._t = v;
      el.style.transform = v;
    }
  };
  const O = (el, v) => {
    const s = v >= 0.999 ? '' : v.toFixed(3);
    if (el._o !== s) {
      el._o = s;
      el.style.opacity = s;
    }
  };
  const V = (el, on) => {
    const v = on ? '' : 'hidden';
    if (el._v !== v) {
      el._v = v;
      el.style.visibility = v;
    }
  };

  // ---- geometry: stage pixels; the floor is the plane y = Yb, and z = (board y) − Yb on it ----
  function measure() {
    movers.forEach((m) => {
      T(m.el, '');
      O(m.el, 1);
      m.el.style.width = '';
      m.el.style.height = '';
    });
    const S = stage.getBoundingClientRect();
    const rel = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - S.left, y: r.top - S.top, w: r.width, h: r.height };
    };
    const G = {};
    for (const g of ['count', 'rate']) {
      const a = rel(q(`[data-plot="${g}"]`));
      G[g] = { ax: a.x, yb: a.y + a.h - 1, H: a.h - 1, W: a.w };
    }
    const Yb = G.count.yb;
    const cellsBox = rel(cells);
    const keys = {};
    for (const g of ['count', 'rate']) {
      const k = rel(q(`[data-keyline="${g}"]`));
      keys[g] = { x: k.x, y: k.y, len: k.w };
    }
    // on the board a label is as wide as its cell; it takes its column's width under the bar while it
    // is out of sight, so it wraps as the board does at one rest and as the chart does at the other
    movers.forEach((m) => {
      if (m.ph && (m.type === 'cat' || m.type === 'meta')) m.wide = `${m.ph.getBoundingClientRect().width}px`;
    });
    items.forEach((it) => {
      const { f } = it;
      const c = rel(q(`[data-cell="${f.n}"]`));
      const fig = rel(q(`[data-ph="val:${f.n}"]`));
      it.cell = { x0: c.x, w: c.w, z0: c.y - Yb, z1: c.y + c.h - Yb };
      // in the city each figure stands at the back of its cell, its label plaque left in front
      const d = c.h;
      it.city = { x0: fig.x - 6, w: Math.min(c.w * 0.52, Math.max(fig.w + 12, c.w * 0.4)), z0: c.y - Yb + 8, z1: c.y - Yb + 8 + d * 0.5 };
      if (f.scale === 'none') {
        // a plate stays flat; on the board's back row it steps back off the board, where no tower
        // stands in front of it
        const back = c.y - cellsBox.y < 2 ? cellsBox.y - Yb - 40 : c.y - Yb + 8 + d * 0.5;
        it.city = { x0: fig.x - 6, w: c.w * 0.62, z0: back - d * 0.5, z1: back };
      }
      if (f.scale === 'none') {
        const li = rel(q(`[data-word="${f.n}"]`));
        it.g = null;
        it.end = { x0: li.x, w: li.w, z0: -li.h, z1: 0 };
        it.yb = li.y + li.h;
      } else {
        const b = rel(q(`[data-bar="${f.n}"]`));
        const dd = clamp(b.w * 0.8, 18, 80);
        it.g = f.scale;
        it.end = { x0: b.x, w: b.w, z0: -dd, z1: 0 };
        it.yb = G[f.scale].yb;
      }
    });
    ground.style.width = px(cellsBox.w);
    const chartBox = rel(q('.ev-chart'));
    geo = {
      S: { w: S.width, h: S.height },
      G,
      Yb,
      keys,
      cellsBox,
      zc0: cellsBox.y + cellsBox.h / 2 - Yb,
      cxBoard: cellsBox.x + cellsBox.w / 2,
      cxChart: chartBox.x + chartBox.w / 2,
      ycChart: G.count.yb - G.count.H / 2,
    };
    // each label's offset from its anchor at the board (p = 0) and at the chart (p = 1)
    const s0 = state(0);
    const s1 = state(1);
    movers.forEach((m) => {
      const n = rel(m.el);
      const isVal = m.type === 'val';
      m.N = { x: n.x, y: isVal ? n.y + n.h : n.y };
      m.wN = n.w;
      m.hN = n.h;
      const b = m.ph ? rel(m.ph) : n;
      m.B = { x: b.x, y: isVal ? b.y + b.h : b.y };
      m.sB = isVal ? parseFloat(getComputedStyle(m.ph).fontSize) / parseFloat(getComputedStyle(m.el).fontSize) : 1;
      const a0 = project(s0, anchor(m, s0));
      const a1 = project(s1, anchor(m, s1));
      m.offB = { x: m.B.x - a0.x, y: m.B.y - a0.y };
      m.offC = { x: m.N.x - a1.x, y: m.N.y - a1.y };
    });
    lastP = -1;
    frame();
  }

  // the whole film as a pure function of p
  function state(p) {
    const { G, Yb, keys, zc0, S, cellsBox } = geo;
    const r = ease(span(p, A, B));
    const k = ease(span(p, B, C));
    const l = ease(span(p, C, D));
    const c = ease(span(p, B, D));
    // the plates step back before the towers are tall, and cross to the notes once the rows have formed
    const r2 = ease(span(p, A, A + (B - A) * 0.55));
    const k2 = ease(span(p, B + (C - B) * 0.45, C));
    const phi = 90 * r;
    const rul = {};
    for (const g of ['count', 'rate']) {
      const key = keys[g];
      // printed key -> standing at the board's near corner (counts left, rates right) -> the chart's axis
      const from = { x: key.x, y: Yb, z: key.y - Yb };
      const side = { x: g === 'count' ? cellsBox.x - 14 : cellsBox.x + cellsBox.w + 14, y: Yb, z: cellsBox.y + cellsBox.h - Yb };
      const to = { x: G[g].ax, y: G[g].yb, z: 0 };
      rul[g] = { base: lerp3(lerp3(from, side, r), to, k), len: lerp(key.len, G[g].H, r), phi };
    }
    const box = items.map((it) => {
      const fp = lerpFp(lerpFp(it.cell, it.city, it.g ? r : r2), it.end, it.g ? k : k2);
      // rates take a lane behind the others while the rows form, so no tower passes through another
      if (it.g === 'rate') {
        const lane = Math.sin(Math.PI * k) * 90;
        fp.z0 -= lane;
        fp.z1 -= lane;
      }
      const base = lerp(Yb, it.yb, it.g ? k : k2);
      const h = it.g ? it.f.frac * rul[it.g].len * Math.sin(phi * RAD) : 0;
      const stand = it.g ? 0 : 90 * l; // the plates hinge up on their front edge into the notes
      return { ...fp, base, h, stand };
    });
    const kk = (i) => (items[i].g ? k : k2);
    const hMax = G.count.H * r;
    return {
      p,
      r,
      k,
      kk,
      l,
      c,
      e: (90 - (S.w < 640 ? 30 : 40) * r + 10 * Math.sin(Math.PI * k) - 4 * k) * (1 - l),
      yaw: (-15 * r + 4 * k) * (1 - l),
      zoom: 1 - (S.w < 640 ? 0.3 : 0.2) * r * (1 - c),
      P: lerp(S.h * 3.4, S.h * 16, l * l),
      rul,
      box,
      L: { x: lerp(geo.cxBoard, geo.cxChart, k), y: lerp(Yb - 0.35 * hMax, geo.ycChart, c), z: zc0 * (1 - k) },
      pan: {
        x: lerp(lerp(geo.cxBoard, S.w * 0.47, r), geo.cxChart, c),
        y: lerp(lerp(Yb + zc0, S.h * 0.6, r), geo.ycChart, c),
      },
    };
  }

  // the world's CSS transform, for one point:
  // translate(pan) scale(zoom) perspective(P) rotateX(−e) rotateY(yaw) translate(−L)
  function project(st, X) {
    const dx = X.x - st.L.x;
    const dy = X.y - st.L.y;
    const dz = X.z - st.L.z;
    const cy = Math.cos(st.yaw * RAD);
    const sy = Math.sin(st.yaw * RAD);
    const x1 = dx * cy + dz * sy;
    const z1 = -dx * sy + dz * cy;
    const th = -st.e * RAD;
    const y2 = dy * Math.cos(th) - z1 * Math.sin(th);
    const z2 = dy * Math.sin(th) + z1 * Math.cos(th);
    const w = 1 - z2 / st.P;
    return { x: st.pan.x + (st.zoom * x1) / w, y: st.pan.y + (st.zoom * y2) / w, d: z2 };
  }

  // a box's outline on screen and its depth (larger d = nearer the viewer)
  function shadowOf(st, b) {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    let d = 0;
    for (const x of [b.x0, b.x0 + b.w])
      for (const y of [b.base, b.base - b.h])
        for (const z of [b.z0, b.z1]) {
          const q = project(st, { x, y, z });
          x0 = Math.min(x0, q.x);
          y0 = Math.min(y0, q.y);
          x1 = Math.max(x1, q.x);
          y1 = Math.max(y1, q.y);
          d += q.d / 8;
        }
    return { x0, y0, x1, y1, d };
  }
  // the share of rect a covered by rect b
  const cover = (a, b) =>
    (Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0))) /
    Math.max(1, (a.x1 - a.x0) * (a.y1 - a.y0));

  // a box's back-left top corner: the roof's for a tower, the plate's far edge as it stands up
  const backLeft = (b) => ({
    x: b.x0,
    y: b.base - b.h - (b.z1 - b.z0) * Math.sin(b.stand * RAD),
    z: b.stand ? b.z1 - (b.z1 - b.z0) * Math.cos(b.stand * RAD) : b.z0,
  });

  // what each label is attached to
  function anchor(m, st) {
    if (m.type === 'val' || m.type === 'meta' || m.type === 'cat') {
      const i = indexOf[Number(m.a)];
      const b = st.box[i];
      if (m.type === 'val') return backLeft(b);
      // the plaque: on the floor in front of its cell, then under its bar (or on its plate)
      const cell = items[i].cell;
      if (!items[i].g) return lerp3({ x: b.x0 - (items[i].city.x0 - cell.x0), y: b.base, z: b.z1 }, backLeft(b), st.kk(i));
      return lerp3({ x: cell.x0, y: geo.Yb, z: cell.z1 }, { x: b.x0, y: b.base, z: b.z1 }, st.k);
    }
    if (m.type === 'tick' || (m.type === 'title' && m.a !== 'words')) {
      const R = st.rul[m.a];
      const n = m.a === 'count' ? 4 : 5;
      const d = R.len * (m.type === 'tick' ? m.b / (n - 1) : 1);
      return { x: R.base.x + d * Math.cos(R.phi * RAD), y: R.base.y - d * Math.sin(R.phi * RAD), z: R.base.z };
    }
    return backLeft(st.box[indexOf[3]]); // the notes' title rides with the first plate
  }
  const plaque = (m) => m.type === 'meta' || m.type === 'cat' || (m.type === 'title' && m.a === 'words');
  // how far along its own hand-off (board offset -> chart offset) each label is
  const kOf = (m, st) => (m.type === 'meta' || m.type === 'cat' ? st.kk(indexOf[Number(m.a)]) : st.k);
  const weight = (m, st) => (m.type === 'val' ? st.c : m.type === 'title' ? st.r : plaque(m) ? kOf(m, st) : st.r);

  function frame() {
    raf = 0;
    if (!geo) return;
    const tr = track.getBoundingClientRect();
    const travel = Math.max(1, tr.height - stage.offsetHeight);
    const p = clamp(-tr.top / travel);
    if (p === lastP) return;
    lastP = p;
    const st = state(p);
    const atBoard = p <= A;
    const atChart = p >= D;
    stage.classList.toggle('at-board', atBoard);
    stage.classList.toggle('at-chart', atChart);
    const idx = st.c > 0.55 ? 2 : st.r > 0.3 ? 1 : 0;
    caps.forEach((s, i) => s.classList.toggle('is-on', i === idx));

    // labels: attached to the geometry, crossing from their board offset to their chart offset;
    // the plaques step aside while the rows form
    const vals = [];
    for (const m of movers) {
      const a = project(st, anchor(m, st));
      const w = weight(m, st);
      const x = a.x + lerp(m.offB.x, m.offC.x, w) - m.N.x;
      const y = a.y + lerp(m.offB.y, m.offC.y, w) - m.N.y;
      const fade = 1 - clamp(Math.sin(Math.PI * kOf(m, st)) * 2.4);
      const s = m.type === 'val' ? lerp(m.sB, 1, clamp(0.75 * st.r + 0.25 * st.c)) : 1;
      // in flight, a label is kept on screen (at the rests every label is already inside)
      const lx = clamp(x, 6 - m.N.x, geo.S.w - 6 - m.N.x - m.wN * s);
      T(m.el, Math.abs(lx) + Math.abs(y) < 0.01 && s === 1 ? '' : `translate(${px(lx)}, ${px(y)})${s !== 1 ? ` scale(${s.toFixed(4)})` : ''}`);
      if (m.type === 'val') {
        const cx = m.N.x + lx + m.wN / 2;
        const cy = m.N.y - m.hN + y + m.hN / 2;
        const hw = (m.wN * s) / 2;
        const hh = (m.hN * s) / 2;
        vals.push({ m, i: indexOf[Number(m.a)], lx, y, s, r: { x0: cx - hw, y0: cy - hh, x1: cx + hw, y1: cy + hh } });
      }
      // what a figure measures, and its number, step aside while the towers stand and come back
      // under its bar; on the board they are as wide as their cell, in the chart as their column
      if (m.type === 'cat' || m.type === 'meta') {
        O(m.el, Math.min(fade, Math.max(1 - span(p, A + 0.03, A + 0.16), span(p, C + 0.04, D - 0.02))));
        // (its box keeps the chart's height meanwhile, so the chart's layout never moves)
        const wide = m.wide && p < A + 0.1;
        const wd = wide ? m.wide : '';
        if (m.el.style.width !== wd) {
          m.el.style.width = wd;
          m.el.style.height = wide ? `${m.hN}px` : '';
        }
      } else if (plaque(m)) O(m.el, Math.min(fade, Math.max(1 - span(p, A + 0.05, A + 0.2), span(p, C, D - 0.04))));
      else if (m.type === 'tick' && m.b % 2) {
        // where an axis is seen steeply foreshortened, its in-between ticks give way to the ends
        const n = project(st, anchor({ ...m, b: m.b + 1 }, st));
        O(m.el, clamp((Math.hypot(n.x - a.x, n.y - a.y) - 11) / 6));
      }
    }

    // a figure whose tower stands behind a nearer tower (or under a nearer figure) gives way while the
    // towers stand, instead of printing over it (finish pass, 2026-11-18); at the rests every figure is
    // clear, so this only acts in between
    const between = !atBoard && !atChart && st.r > 0.05 && st.c < 0.95;
    const shadows = between ? st.box.map((b) => shadowOf(st, b)) : null;
    for (const v of vals) {
      let hide = 0;
      if (between) {
        const mine = shadows[v.i];
        for (const u of vals) {
          if (u === v) continue;
          const other = shadows[u.i];
          if (other.d <= mine.d + 1) continue; // only nearer boxes hide a figure
          hide = Math.max(hide, cover(v.r, other), cover(v.r, u.r));
        }
      }
      v.o = 1 - clamp((hide - 0.12) / 0.28);
      O(v.m.el, v.o);
    }

    // Two figures that are both in view and still touch (on phones, "+8.2%" and SOTA as the rows form;
    // edges pass, 2026-11-19): the lesser one (a figure that is not a quantity, else the farther one)
    // steps sideways, away from the other, by as much as they overlap plus a gap. Continuous in their
    // positions, so still a pure function of scroll; at the rests every figure is clear and nothing moves.
    if (between) {
      const GAP = 8;
      const push = new Map();
      for (const a of vals)
        for (const b of vals) {
          if (a === b || a.o < 0.3 || b.o < 0.3) continue;
          const qa = Boolean(items[a.i].g);
          const qb = Boolean(items[b.i].g);
          const lesser = qa !== qb ? !qb : shadows[b.i].d < shadows[a.i].d || (shadows[b.i].d === shadows[a.i].d && b.i > a.i);
          if (!lesser) continue; // b gives way to a
          const oy = Math.min(a.r.y1, b.r.y1) - Math.max(a.r.y0, b.r.y0);
          const fy = clamp((oy + GAP) / GAP);
          if (!fy) continue;
          const right = b.r.x0 + b.r.x1 >= a.r.x0 + a.r.x1;
          const need = (right ? a.r.x1 + GAP - b.r.x0 : b.r.x1 + GAP - a.r.x0) * fy;
          if (need > 0) push.set(b, Math.max(push.get(b) || 0, need) * (right ? 1 : -1));
        }
      for (const [v, dx] of push) {
        const m = v.m;
        const lx = clamp(v.lx + dx, 6 - m.N.x, geo.S.w - 6 - m.N.x - m.wN * v.s);
        T(m.el, `translate(${px(lx)}, ${px(v.y)})${v.s !== 1 ? ` scale(${v.s.toFixed(4)})` : ''}`);
        // held by the screen's edge short of clear: it fades by what is left
        const short = Math.abs(dx) - Math.abs(lx - v.lx);
        if (short > 0) O(m.el, v.o * (1 - 0.75 * clamp(short / (2 * GAP))));
      }
    }

    const live = !atBoard && !atChart;
    V(world, live);
    if (live) {
      T(
        world,
        `translate(${px(st.pan.x)}, ${px(st.pan.y)}) scale(${st.zoom.toFixed(4)}) perspective(${px(st.P)}) rotateX(${(-st.e).toFixed(3)}deg) rotateY(${st.yaw.toFixed(3)}deg) translate3d(${px(-st.L.x)}, ${px(-st.L.y)}, ${px(-st.L.z)})`,
      );
      world.style.setProperty('--r', st.r.toFixed(3));
      world.style.setProperty('--inked', ease(span(p, C + 0.1, D)).toFixed(3));
      const { cellsBox, Yb, G } = geo;
      T(ground, `translate3d(${px(cellsBox.x)}, ${px(Yb)}, ${px(cellsBox.y - Yb)}) rotateX(90deg)`);
      O(ground, 1 - st.l);

      for (const g of ['count', 'rate']) {
        const R = st.rul[g];
        const ru = rulers[g];
        ru.line.style.width = px(R.len);
        ru.line.style.setProperty('--gl', px(G[g].W * st.c));
        T(ru.line, `translate3d(${px(R.base.x)}, ${px(R.base.y)}, ${px(R.base.z)}) rotateZ(${-R.phi}deg) rotateX(${90 - R.phi}deg)`);
        ru.grids.forEach((gl) => O(gl, st.c));
        ru.base.style.width = px(G[g].W);
        O(ru.base, st.c);
        T(ru.base, `translate3d(${px(R.base.x)}, ${px(R.base.y)}, ${px(R.base.z)})`);
      }

      const size = (el, w, h) => {
        el.style.width = px(w);
        el.style.height = px(h);
      };
      items.forEach((it, i) => {
        const b = st.box[i];
        const d = b.z1 - b.z0;
        const top = b.base - b.h;
        const F = it.faces;
        size(F.roof, b.w, d);
        if (!it.g) {
          const bl = backLeft(b);
          T(F.roof, `translate3d(${px(bl.x)}, ${px(bl.y)}, ${px(bl.z)}) rotateX(${90 - b.stand}deg)`);
          O(F.roof, st.r * (1 - st.l));
          return;
        }
        T(F.roof, `translate3d(${px(b.x0)}, ${px(top)}, ${px(b.z0)}) rotateX(90deg)`);
        const up = b.h >= 1;
        [F.front, F.left, F.right, F.cap].forEach((el) => el && V(el, up));
        size(F.front, b.w, b.h);
        T(F.front, `translate3d(${px(b.x0)}, ${px(top)}, ${px(b.z1)})`);
        size(F.right, d, b.h);
        T(F.right, `translate3d(${px(b.x0 + b.w)}, ${px(top)}, ${px(b.z1)}) rotateY(90deg)`);
        size(F.left, d, b.h);
        T(F.left, `translate3d(${px(b.x0)}, ${px(top)}, ${px(b.z0)}) rotateY(-90deg)`);
        if (F.cap) {
          size(F.cap, b.w, 14);
          T(F.cap, `translate3d(${px(b.x0)}, ${px(top - 14)}, ${px(b.z1)})`);
        }
        // a soft shadow cast back and to the right, while there is a floor to fall on
        const sx = b.h * 0.3;
        const sz = b.h * 0.42;
        size(F.shadow, b.w + sx * 0.4, d + sz * 0.5);
        T(F.shadow, `translate3d(${px(b.x0 + sx * 0.6)}, ${px(b.base - 0.5)}, ${px(b.z0 - sz * 0.6)}) rotateX(90deg)`);
        O(F.shadow, st.r * (1 - st.l));
      });
    }
    document.dispatchEvent(new Event('markmove'));
  }

  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  let mraf = 0;
  const remeasure = () => {
    cancelAnimationFrame(mraf);
    mraf = requestAnimationFrame(measure);
  };

  stage.prepend(world);
  stage.classList.add('is-film');
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', remeasure);
  const ro = new ResizeObserver(remeasure);
  ro.observe(stage);
  measure();
  document.fonts?.ready.then(() => geo && remeasure());

  return () => {
    cancelAnimationFrame(raf);
    cancelAnimationFrame(mraf);
    window.removeEventListener('scroll', kick);
    window.removeEventListener('resize', remeasure);
    ro.disconnect();
    world.remove();
    movers.forEach((m) => {
      T(m.el, '');
      O(m.el, 1);
      m.el.style.width = '';
      m.el.style.height = '';
    });
    stage.classList.remove('is-film', 'at-board', 'at-chart');
    caps.forEach((s) => s.classList.remove('is-on'));
  };
}
