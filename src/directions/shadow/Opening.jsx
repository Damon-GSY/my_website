import { useEffect, useRef, useState } from 'react';
import { Header, Outro } from '../../components/Chrome.jsx';
import { useLang } from '../../i18n.jsx';
import { profile, work, route, footnote, joinParts } from '../../content.js';
import './shadow.css';

const THETA_MIN = 180.0;
const THETA_MAX = 360.0;
const THETA_LOCK = 318.0;
const LOCK_TOLERANCE = 1.8;
const INITIAL_ANGLE = 294.0;

const LOCK_RAD = (THETA_LOCK * Math.PI) / 180;
const COS_LOCK = Math.cos(LOCK_RAD);
const SIN_LOCK = Math.sin(LOCK_RAD);

// Light elevation phi = 45deg => tan(phi) = 1.0, so d(theta) = (cos theta, -tan phi, sin theta)
const PHI_RAD = (45 * Math.PI) / 180;
const TAN_PHI = Math.tan(PHI_RAD);

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function createRng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function arcPts(cx, cy, rx, ry, a0Deg, a1Deg, steps = 28) {
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = ((a0Deg + ((a1Deg - a0Deg) * i) / steps) * Math.PI) / 180;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pts;
}

// Single-stroke geometric vector glyphs in unit cell [0..w] x [0..1] (v=0 top, v=1 baseline)
const GLYPHS = {
  D: {
    w: 0.72,
    s: [
      [
        [0, 0],
        [0, 1],
      ],
      [[0, 0], [0.3, 0], ...arcPts(0.3, 0.5, 0.42, 0.5, -90, 90, 26), [0, 1]],
    ],
  },
  A: {
    w: 0.8,
    s: [
      [
        [0, 1],
        [0.35, 0],
        [0.45, 0],
        [0.8, 1],
      ],
      [
        [0.125, 0.65],
        [0.675, 0.65],
      ],
    ],
  },
  M: {
    w: 0.9,
    s: [
      [
        [0, 1],
        [0, 0],
        [0.45, 0.72],
        [0.9, 0],
        [0.9, 1],
      ],
    ],
  },
  O: {
    w: 0.84,
    s: [arcPts(0.42, 0.5, 0.42, 0.5, -90, 270, 38)],
  },
  N: {
    w: 0.74,
    s: [
      [
        [0, 1],
        [0, 0],
        [0.74, 1],
        [0.74, 0],
      ],
    ],
  },
  G: {
    w: 0.84,
    s: [[...arcPts(0.43, 0.5, 0.43, 0.5, -42, -354, 42), [0.86, 0.55], [0.47, 0.55]]],
  },
  U: {
    w: 0.74,
    s: [[[0, 0], [0, 0.62], ...arcPts(0.37, 0.62, 0.37, 0.38, 180, 0, 24), [0.74, 0]]],
  },
  '9': {
    w: 0.56,
    s: [
      arcPts(0.27, 0.28, 0.25, 0.28, 0, 360, 26),
      [[0.52, 0.28], [0.52, 0.72], ...arcPts(0.27, 0.72, 0.25, 0.28, 0, 145, 16)],
    ],
  },
  '0': {
    w: 0.56,
    s: [arcPts(0.28, 0.5, 0.28, 0.5, -90, 270, 30)],
  },
  '%': {
    w: 0.74,
    s: [
      arcPts(0.16, 0.2, 0.14, 0.18, 0, 360, 16),
      [
        [0.68, 0.04],
        [0.06, 0.96],
      ],
      arcPts(0.58, 0.8, 0.14, 0.18, 0, 360, 16),
    ],
  },
  '·': {
    w: 0.24,
    s: [arcPts(0.12, 0.5, 0.08, 0.08, 0, 360, 10)],
  },
  '1': {
    w: 0.52,
    s: [
      [
        [0.08, 0.2],
        [0.28, 0],
        [0.28, 1],
      ],
      [
        [0.04, 1],
        [0.5, 1],
      ],
    ],
  },
  '+': {
    w: 0.6,
    s: [
      [
        [0.3, 0.2],
        [0.3, 0.8],
      ],
      [
        [0.02, 0.5],
        [0.58, 0.5],
      ],
    ],
  },
  '5': {
    w: 0.56,
    s: [[[0.52, 0], [0.08, 0], [0.06, 0.44], ...arcPts(0.28, 0.68, 0.25, 0.32, -125, 145, 20)]],
  },
  '3': {
    w: 0.54,
    s: [arcPts(0.26, 0.26, 0.25, 0.26, -145, 90, 18), arcPts(0.26, 0.74, 0.26, 0.26, -90, 145, 18)],
  },
};

function layoutWord(text, hx, hz, gap, space, zTop) {
  let totalW = 0;
  for (const ch of text) {
    totalW += ch === ' ' ? space : GLYPHS[ch].w * hx + gap;
  }
  totalW -= gap;

  let cursorX = -totalW / 2;
  const strokes = [];
  for (const ch of text) {
    if (ch === ' ') {
      cursorX += space;
      continue;
    }
    const g = GLYPHS[ch];
    for (const st of g.s) {
      strokes.push(st.map(([u, v]) => [cursorX + u * hx, zTop - v * hz]));
    }
    cursorX += g.w * hx + gap;
  }
  return strokes;
}

function densifyPolyline(poly, maxStep = 4.2) {
  const out = [poly[0]];
  for (let i = 1; i < poly.length; i += 1) {
    const a = poly[i - 1];
    const b = poly[i];
    const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const steps = Math.max(1, Math.ceil(dist / maxStep));
    for (let k = 1; k <= steps; k += 1) {
      const t = k / steps;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

// Deterministic 3D wire sculpture lifted along inverse ray of theta_lock = 318.0 deg
function buildSculpture() {
  const rng = createRng(31807);
  const primaryFloor = layoutWord('DAMON GUAN', 68, 92, 14, 34, 56);
  const subFloor = layoutWord('90% · 100+ · 530', 23, 31, 7.5, 13, -54);

  const liftStrokes = (rawStrokes, minH, maxH, isSub) =>
    rawStrokes.map((raw) => {
      const poly = densifyPolyline(raw, isSub ? 3.2 : 4.2);
      const hBase = minH + 28 + rng() * (maxH - minH - 56);
      const amp1 = 28 + rng() * 42;
      const amp2 = 10 + rng() * 18;
      const f1 = 0.028 + rng() * 0.022;
      const f2 = 0.072 + rng() * 0.045;
      const ph1 = rng() * Math.PI * 2;
      const ph2 = rng() * Math.PI * 2;

      let arcS = 0;
      return poly.map(([x, z], idx) => {
        if (idx > 0) {
          arcS += Math.hypot(x - poly[idx - 1][0], z - poly[idx - 1][1]);
        }
        const h = clamp(hBase + amp1 * Math.sin(arcS * f1 + ph1) + amp2 * Math.cos(arcS * f2 + ph2), minH, maxH);
        // (X_k, Y_k, Z_k) = (x_k - h_k cos theta_lock, h_k, z_k - h_k sin theta_lock)
        return {
          x,
          z,
          h,
          X: x - h * COS_LOCK,
          Y: h,
          Z: z - h * SIN_LOCK,
          isSub,
        };
      });
    });

  const primaryWires = liftStrokes(primaryFloor, 52, 220, false);
  const subWires = liftStrokes(subFloor, 45, 162, true);
  const allWires = [...primaryWires, ...subWires];

  // Structural brass connector bridges tying letters into one continuous hanging rig
  const bridges = [];
  for (let i = 0; i < primaryWires.length - 1; i += 1) {
    const a = primaryWires[i][primaryWires[i].length - 1];
    const b = primaryWires[i + 1][0];
    const midLift = 26 + rng() * 48;
    const mid = {
      X: (a.X + b.X) * 0.5 + (rng() - 0.5) * 44,
      Y: clamp(Math.max(a.Y, b.Y) + midLift, 60, 245),
      Z: (a.Z + b.Z) * 0.5 + (rng() - 0.5) * 32,
    };
    const pts = [];
    for (let k = 0; k <= 14; k += 1) {
      const u = k / 14;
      const v = 1 - u;
      const X = v * v * a.X + 2 * u * v * mid.X + u * u * b.X;
      const Y = v * v * a.Y + 2 * u * v * mid.Y + u * u * b.Y;
      const Z = v * v * a.Z + 2 * u * v * mid.Z + u * u * b.Z;
      pts.push({ X, Y, Z, h: Y });
    }
    bridges.push(pts);
  }

  // Pick vertical suspension filament anchors from primary strokes
  const filaments = [];
  for (let i = 0; i < primaryWires.length; i += 2) {
    const w = primaryWires[i];
    const p = w[Math.floor(w.length * 0.45)];
    filaments.push({ X: p.X, Y: p.Y, Z: p.Z });
  }

  // Pick tangerine solder/metric junction nodes & 3 calibration ray anchors
  const nodes = [];
  primaryWires.forEach((w, idx) => {
    if (idx % 2 === 0) {
      nodes.push(w[0]);
    }
    if (idx % 3 === 1) {
      nodes.push(w[Math.floor(w.length * 0.65)]);
    }
  });
  subWires.forEach((w, idx) => {
    if (idx % 5 === 0) {
      nodes.push(w[0]);
    }
  });

  const rayAnchors = [
    primaryWires[0][0], // D stem top
    primaryWires[Math.floor(primaryWires.length * 0.48)][Math.floor(primaryWires[Math.floor(primaryWires.length * 0.48)].length * 0.5)],
    primaryWires[primaryWires.length - 1][primaryWires[primaryWires.length - 1].length - 1], // N end
  ];

  // Break all wire strokes into short 3D segments for painter depth-sorting
  const chunks = [];
  const pushChunks = (pts, isBridge, isSub) => {
    const step = isBridge ? 4 : 5;
    for (let i = 0; i < pts.length - 1; i += step) {
      const slice = pts.slice(i, Math.min(pts.length, i + step + 1));
      let sumH = 0;
      for (const pt of slice) sumH += pt.Y;
      chunks.push({
        pts: slice,
        isBridge,
        isSub,
        avgH: sumH / slice.length,
      });
    }
  };
  primaryWires.forEach((w) => pushChunks(w, false, false));
  subWires.forEach((w) => pushChunks(w, false, true));
  bridges.forEach((b) => pushChunks(b, true, false));

  return { primaryWires, subWires, allWires, bridges, filaments, nodes, rayAnchors, chunks };
}

const SCULPTURE = buildSculpture();

function computeEntropy(thetaDeg) {
  const halfDiff = (Math.abs(thetaDeg - THETA_LOCK) * Math.PI) / 360;
  const maxHalfDiff = ((THETA_LOCK - THETA_MIN) * Math.PI) / 360;
  const norm = Math.sin(halfDiff) / Math.sin(maxHalfDiff);
  return clamp(Math.pow(norm, 0.72), 0, 1);
}

const LOCK_SPARK_X = (((THETA_LOCK - THETA_MIN) / (THETA_MAX - THETA_MIN)) * 84).toFixed(1);

const ENTROPY_CURVE_PATH = (() => {
  const pts = [];
  for (let i = 0; i <= 60; i += 1) {
    const deg = THETA_MIN + ((THETA_MAX - THETA_MIN) * i) / 60;
    const x = (i / 60) * 84;
    const y = 21 - computeEntropy(deg) * 18;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
})();

// Exact orthonormal 3D camera basis & perspective projection
function createCamera(width, height, leanX, leanY) {
  const alpha = ((34 + leanY * 5.2) * Math.PI) / 180;
  const beta = ((10 + leanX * 7.8) * Math.PI) / 180;
  const dist = 1320;
  const target = { x: -78, y: 68, z: 24 };

  const sinA = Math.sin(alpha);
  const cosA = Math.cos(alpha);
  const sinB = Math.sin(beta);
  const cosB = Math.cos(beta);

  const cam = {
    x: target.x + dist * cosA * sinB,
    y: target.y + dist * sinA,
    z: target.z - dist * cosA * cosB,
  };

  // Right, Up, Forward orthonormal basis
  const rx = cosB;
  const rz = sinB;

  const ux = -sinA * sinB;
  const uy = cosA;
  const uz = sinA * cosB;

  const fx = -cosA * sinB;
  const fy = -sinA;
  const fz = cosA * cosB;

  const scaleFit = Math.min(width / 1360, height / 690);
  const focal = dist * scaleFit;
  const cx = width * 0.51;
  const cy = height * 0.59;

  const project = (X, Y, Z) => {
    const qx = X - cam.x;
    const qy = Y - cam.y;
    const qz = Z - cam.z;
    const px = qx * rx + qz * rz;
    const py = qx * ux + qy * uy + qz * uz;
    const pz = Math.max(120, qx * fx + qy * fy + qz * fz);
    const k = focal / pz;
    return {
      x: cx + px * k,
      y: cy - py * k,
      z: pz,
      k,
    };
  };

  return { project, scaleFit };
}

function drawShadowScene(ctx, width, height, thetaDeg, leanX, leanY, lang) {
  const rad = (thetaDeg * Math.PI) / 180;
  const cosT = Math.cos(rad);
  const sinT = Math.sin(rad);
  const deltaDeg = Math.abs(thetaDeg - THETA_LOCK);
  const lockGain = deltaDeg <= LOCK_TOLERANCE ? 1 - (deltaDeg / LOCK_TOLERANCE) * 0.22 : 0;
  const isLocked = deltaDeg <= LOCK_TOLERANCE;

  const { project, scaleFit } = createCamera(width, height, leanX, leanY);

  // Orbiting light source on upper sun-track along -d(theta)
  const orbR = 285;
  const lightPos = {
    X: -orbR * cosT,
    Y: orbR * TAN_PHI,
    Z: -orbR * sinT,
  };
  const lightScreen = project(lightPos.X, lightPos.Y, lightPos.Z);
  const lightFloorScreen = project(lightPos.X, 0, lightPos.Z);
  const centerFloor = project(0, 0, 0);

  // 1. Warm stone floor + directional spotlight pool
  ctx.fillStyle = '#f2efe8';
  ctx.fillRect(0, 0, width, height);

  const poolX = centerFloor.x + cosT * 110 * scaleFit;
  const poolY = centerFloor.y - sinT * 60 * scaleFit;
  const poolRadius = Math.max(width, height) * 0.72;
  const floorGrad = ctx.createRadialGradient(poolX, poolY, 12, poolX, poolY, poolRadius);
  floorGrad.addColorStop(0, isLocked ? 'rgba(255, 251, 244, 0.95)' : 'rgba(252, 249, 242, 0.78)');
  floorGrad.addColorStop(0.5, 'rgba(242, 239, 232, 0.25)');
  floorGrad.addColorStop(1, 'rgba(224, 217, 203, 0.65)');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Architectural target registration sheet on floor (Y = 0)
  const sheetCorners = [
    project(-345, 0, 82),
    project(345, 0, 82),
    project(345, 0, -108),
    project(-345, 0, -108),
  ];

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(sheetCorners[0].x, sheetCorners[0].y);
  for (let i = 1; i < sheetCorners.length; i += 1) {
    ctx.lineTo(sheetCorners[i].x, sheetCorners[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = isLocked ? 'rgba(255, 253, 248, 0.78)' : 'rgba(255, 253, 248, 0.48)';
  ctx.fill();
  ctx.lineWidth = Math.max(1, 1.1 * scaleFit);
  ctx.strokeStyle = isLocked ? 'rgba(255, 90, 31, 0.62)' : 'rgba(17, 17, 17, 0.16)';
  ctx.stroke();

  // Subtle typographic baseline & capline guides inside sheet
  const guides = [56, -36, -54, -85];
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = isLocked ? 'rgba(255, 90, 31, 0.18)' : 'rgba(17, 17, 17, 0.06)';
  for (const gz of guides) {
    const a = project(-330, 0, gz);
    const b = project(330, 0, gz);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // Corner registration crop ticks on sheet
  const tickLen = 16;
  const cornersSpec = [
    [-345, 82, 1, -1],
    [345, 82, -1, -1],
    [345, -108, -1, 1],
    [-345, -108, 1, 1],
  ];
  ctx.strokeStyle = isLocked ? '#ff5a1f' : 'rgba(17, 17, 17, 0.34)';
  ctx.lineWidth = isLocked ? 1.6 : 1;
  for (const [cxw, czw, sxDir, szDir] of cornersSpec) {
    const o = project(cxw, 0, czw);
    const px = project(cxw + sxDir * tickLen, 0, czw);
    const pz = project(cxw, 0, czw + szDir * tickLen);
    ctx.beginPath();
    ctx.moveTo(px.x, px.y);
    ctx.lineTo(o.x, o.y);
    ctx.lineTo(pz.x, pz.y);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Floor goniometer protractor arc (180..360 deg)
  ctx.save();
  ctx.beginPath();
  for (let deg = THETA_MIN; deg <= THETA_MAX; deg += 3) {
    const r = (deg * Math.PI) / 180;
    const pt = project(-orbR * Math.cos(r), 0, -orbR * Math.sin(r));
    if (deg === THETA_MIN) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.strokeStyle = 'rgba(17, 17, 17, 0.14)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Protractor ticks + 318.0 deg permanent lock notch
  for (let deg = 180; deg <= 360; deg += 15) {
    const r = (deg * Math.PI) / 180;
    const inner = project(-(orbR - 10) * Math.cos(r), 0, -(orbR - 10) * Math.sin(r));
    const outer = project(-(orbR + 4) * Math.cos(r), 0, -(orbR + 4) * Math.sin(r));
    ctx.beginPath();
    ctx.moveTo(inner.x, inner.y);
    ctx.lineTo(outer.x, outer.y);
    ctx.strokeStyle = deg % 45 === 0 ? 'rgba(17, 17, 17, 0.35)' : 'rgba(17, 17, 17, 0.15)';
    ctx.lineWidth = deg % 45 === 0 ? 1.2 : 0.8;
    ctx.stroke();
  }

  // Permanent 318.0 lock notch on floor arc
  const notchIn = project(-(orbR - 16) * COS_LOCK, 0, -(orbR - 16) * SIN_LOCK);
  const notchOut = project(-(orbR + 12) * COS_LOCK, 0, -(orbR + 12) * SIN_LOCK);
  ctx.beginPath();
  ctx.moveTo(notchIn.x, notchIn.y);
  ctx.lineTo(notchOut.x, notchOut.y);
  ctx.strokeStyle = '#ff5a1f';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(notchOut.x, notchOut.y, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = '#ff5a1f';
  ctx.fill();

  // Active light azimuth floor needle + vertical drop line to overhead orb
  ctx.beginPath();
  ctx.moveTo(lightFloorScreen.x, lightFloorScreen.y);
  ctx.lineTo(centerFloor.x, centerFloor.y);
  ctx.strokeStyle = isLocked ? 'rgba(255, 90, 31, 0.42)' : 'rgba(255, 90, 31, 0.18)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 5]);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(lightScreen.x, lightScreen.y);
  ctx.lineTo(lightFloorScreen.x, lightFloorScreen.y);
  ctx.strokeStyle = 'rgba(255, 90, 31, 0.28)';
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.arc(lightFloorScreen.x, lightFloorScreen.y, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ff7a1a';
  ctx.fill();
  ctx.restore();

  // 4. Cast shadows on the floor plane (Y = 0)
  // x_shadow = X_k + h_k cos(theta), z_shadow = Z_k + h_k sin(theta)
  const drawFloorShadowStroke = (pts, strokeStyle, baseW, penumbraAlpha) => {
    const projected = pts.map((p) => {
      const xs = p.X + p.h * cosT;
      const zs = p.Z + p.h * sinT;
      return { sp: project(xs, 0, zs), h: p.h };
    });

    // Penumbra soft under-stroke when off-axis or tall
    if (penumbraAlpha > 0.01) {
      ctx.beginPath();
      for (let i = 0; i < projected.length; i += 1) {
        const { sp } = projected[i];
        if (i === 0) ctx.moveTo(sp.x, sp.y);
        else ctx.lineTo(sp.x, sp.y);
      }
      ctx.strokeStyle = `rgba(17, 17, 17, ${penumbraAlpha.toFixed(3)})`;
      ctx.lineWidth = baseW * 1.85;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    ctx.beginPath();
    for (let i = 0; i < projected.length; i += 1) {
      const { sp } = projected[i];
      if (i === 0) ctx.moveTo(sp.x, sp.y);
      else ctx.lineTo(sp.x, sp.y);
    }
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = baseW;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  // Faint bridge shadows first
  const bridgeShadowAlpha = isLocked ? 0.045 : 0.095;
  for (const br of SCULPTURE.bridges) {
    drawFloorShadowStroke(br, `rgba(17, 17, 17, ${bridgeShadowAlpha})`, 1.2 * scaleFit, 0);
  }

  // Tangerine lock glow under aligned target strokes when locked
  if (lockGain > 0.02) {
    ctx.save();
    ctx.shadowColor = 'rgba(255, 90, 31, 0.75)';
    ctx.shadowBlur = 14 * lockGain;
    for (const w of SCULPTURE.primaryWires) {
      drawFloorShadowStroke(
        w,
        `rgba(255, 90, 31, ${(0.34 * lockGain).toFixed(3)})`,
        8.6 * scaleFit,
        0,
      );
    }
    for (const w of SCULPTURE.subWires) {
      drawFloorShadowStroke(
        w,
        `rgba(255, 122, 26, ${(0.28 * lockGain).toFixed(3)})`,
        4.6 * scaleFit,
        0,
      );
    }
    ctx.restore();
  }

  // Crisp primary & sub-glyph cast ink shadows
  const inkAlpha = isLocked ? 0.96 : 0.72;
  const penumbra = isLocked ? 0.08 : 0.16;
  const primaryW = (isLocked ? 6.6 : 5.4) * scaleFit;
  const subW = (isLocked ? 3.2 : 2.6) * scaleFit;

  for (const w of SCULPTURE.primaryWires) {
    drawFloorShadowStroke(w, `rgba(17, 17, 17, ${inkAlpha})`, primaryW, penumbra);
  }
  for (const w of SCULPTURE.subWires) {
    drawFloorShadowStroke(
      w,
      isLocked ? 'rgba(218, 68, 14, 0.92)' : `rgba(17, 17, 17, ${(inkAlpha * 0.82).toFixed(2)})`,
      subW,
      penumbra * 0.6,
    );
  }

  // 5. Vertical suspension filaments up to ceiling rig
  ctx.save();
  ctx.strokeStyle = 'rgba(17, 17, 17, 0.14)';
  ctx.lineWidth = 0.8;
  for (const f of SCULPTURE.filaments) {
    const bot = project(f.X, f.Y, f.Z);
    const top = project(f.X, 340, f.Z);
    ctx.beginPath();
    ctx.moveTo(bot.x, bot.y);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
  }
  ctx.restore();

  // 6. Depth-sorted 3D brass & ink wire sculpture
  const projectedChunks = SCULPTURE.chunks.map((ch) => {
    const sp = ch.pts.map((pt) => project(pt.X, pt.Y, pt.Z));
    let depthSum = 0;
    for (const s of sp) depthSum += s.z;
    return {
      ...ch,
      sp,
      depth: depthSum / sp.length,
    };
  });
  projectedChunks.sort((a, b) => b.depth - a.depth);

  for (const ch of projectedChunks) {
    const { sp, isBridge, isSub, avgH } = ch;
    let kSum = 0;
    for (const s of sp) kSum += s.k;
    const avgK = kSum / sp.length;

    if (isBridge) {
      ctx.beginPath();
      for (let i = 0; i < sp.length; i += 1) {
        if (i === 0) ctx.moveTo(sp[i].x, sp[i].y);
        else ctx.lineTo(sp[i].x, sp[i].y);
      }
      ctx.strokeStyle = 'rgba(158, 115, 59, 0.44)';
      ctx.lineWidth = Math.max(0.75, 1.05 * avgK);
      ctx.lineCap = 'round';
      ctx.stroke();
      continue;
    }

    const wireW = (isSub ? 2.8 : 4.5) * avgK;
    // Paper halo clearance so overlapping 3D crossings read cleanly
    ctx.beginPath();
    for (let i = 0; i < sp.length; i += 1) {
      if (i === 0) ctx.moveTo(sp[i].x, sp[i].y);
      else ctx.lineTo(sp[i].x, sp[i].y);
    }
    ctx.strokeStyle = 'rgba(242, 239, 232, 0.88)';
    ctx.lineWidth = wireW + 2.6 * scaleFit;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Brass-ink shaded core
    const hNorm = clamp((avgH - 45) / 175, 0, 1);
    const rCol = Math.round(24 + hNorm * 124);
    const gCol = Math.round(20 + hNorm * 82);
    const bCol = Math.round(17 + hNorm * 34);
    ctx.beginPath();
    for (let i = 0; i < sp.length; i += 1) {
      if (i === 0) ctx.moveTo(sp[i].x, sp[i].y);
      else ctx.lineTo(sp[i].x, sp[i].y);
    }
    ctx.strokeStyle = isSub ? 'rgba(34, 30, 26, 0.86)' : `rgb(${rCol}, ${gCol}, ${bCol})`;
    ctx.lineWidth = wireW;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Fine warm metallic specular edge facing the light
    if (!isSub && hNorm > 0.25) {
      const offX = -cosT * wireW * 0.22;
      const offY = -wireW * 0.24;
      ctx.beginPath();
      for (let i = 0; i < sp.length; i += 1) {
        if (i === 0) ctx.moveTo(sp[i].x + offX, sp[i].y + offY);
        else ctx.lineTo(sp[i].x + offX, sp[i].y + offY);
      }
      ctx.strokeStyle = `rgba(255, 228, 186, ${(0.2 + 0.32 * hNorm).toFixed(2)})`;
      ctx.lineWidth = Math.max(0.7, wireW * 0.26);
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  // Tangerine metric junction nodes on suspended wire
  for (const nd of SCULPTURE.nodes) {
    const np = project(nd.X, nd.Y, nd.Z);
    const rNode = clamp((nd.isSub ? 2.4 : 3.2) * scaleFit, 2, 4.2);
    ctx.beginPath();
    ctx.arc(np.x, np.y, rNode, 0, Math.PI * 2);
    ctx.fillStyle = isLocked ? '#ff5a1f' : '#ff7a1a';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#111111';
    ctx.stroke();
  }

  // 7. Calibration optical rays when near/at 318.0 deg lock
  const rayFade = clamp(1 - deltaDeg / 8.0, 0, 1);
  if (rayFade > 0.02) {
    ctx.save();
    for (const anchor of SCULPTURE.rayAnchors) {
      const wirePt = project(anchor.X, anchor.Y, anchor.Z);
      const shadowPt = project(anchor.X + anchor.h * cosT, 0, anchor.Z + anchor.h * sinT);
      // Extend backward along -d(theta) toward the light direction
      const backExt = 95;
      const rayStart = project(
        anchor.X - backExt * cosT,
        anchor.Y + backExt * TAN_PHI,
        anchor.Z - backExt * sinT,
      );

      ctx.beginPath();
      ctx.moveTo(rayStart.x, rayStart.y);
      ctx.lineTo(shadowPt.x, shadowPt.y);
      ctx.strokeStyle = `rgba(255, 90, 31, ${(0.58 * rayFade).toFixed(3)})`;
      ctx.lineWidth = 1.1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(wirePt.x, wirePt.y, 4.8 * scaleFit, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 90, 31, ${(0.9 * rayFade).toFixed(3)})`;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(shadowPt.x, shadowPt.y, 3.2 * scaleFit, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 90, 31, ${(0.95 * rayFade).toFixed(3)})`;
      ctx.fill();
    }
    ctx.restore();
  }

  // 8. Orbiting tangerine light beacon
  ctx.save();
  const glowR = 54 * Math.max(0.65, scaleFit);
  const orbGrad = ctx.createRadialGradient(lightScreen.x, lightScreen.y, 2, lightScreen.x, lightScreen.y, glowR);
  orbGrad.addColorStop(0, 'rgba(255, 90, 31, 0.72)');
  orbGrad.addColorStop(0.32, 'rgba(255, 122, 26, 0.25)');
  orbGrad.addColorStop(1, 'rgba(255, 122, 26, 0)');
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(lightScreen.x, lightScreen.y, glowR, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(lightScreen.x, lightScreen.y, 13 * Math.max(0.7, scaleFit), 0, Math.PI * 2);
  ctx.strokeStyle = isLocked ? '#ff5a1f' : 'rgba(255, 90, 31, 0.52)';
  ctx.lineWidth = isLocked ? 1.6 : 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(lightScreen.x, lightScreen.y, 6.5 * Math.max(0.7, scaleFit), 0, Math.PI * 2);
  ctx.fillStyle = isLocked ? '#ff5a1f' : '#ff7a1a';
  ctx.fill();

  const labelStr = `${thetaDeg.toFixed(1)}°${isLocked ? (lang === 'zh' ? ' · 锁定' : ' · LOCK') : ''}`;
  ctx.font = '600 11px "Cartograph CF", ui-monospace, monospace';
  ctx.fillStyle = isLocked ? '#ff5a1f' : '#111111';
  ctx.textBaseline = 'middle';
  const labelLeft = lightScreen.x > width * 0.72;
  ctx.textAlign = labelLeft ? 'right' : 'left';
  ctx.fillText(labelStr, lightScreen.x + (labelLeft ? -18 : 18), lightScreen.y);
  ctx.restore();
}

export default function ShadowOpening({ embedded = false, head = null }) {
  const { lang, t } = useLang();
  const [angle, setAngle] = useState(INITIAL_ANGLE);
  const [autoSweep, setAutoSweep] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const langRef = useRef(lang);

  const animRef = useRef({
    angle: INITIAL_ANGLE,
    autoSweep: false,
    sweepDir: 1,
    snapActive: false,
    snapFrom: INITIAL_ANGLE,
    snapStartMs: 0,
    leanX: 0,
    leanY: 0,
    targetLeanX: 0,
    targetLeanY: 0,
    dirty: true,
    size: { w: 0, h: 0, dpr: 1 },
  });

  useEffect(() => {
    langRef.current = lang;
    animRef.current.dirty = true;
  }, [lang]);

  useEffect(() => {
    animRef.current.autoSweep = autoSweep;
    animRef.current.dirty = true;
  }, [autoSweep]);

  // Main Canvas resize, pointer parallax, and rAF render loop
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateSize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (w <= 0 || h <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      animRef.current.size = { w, h, dpr };
      animRef.current.dirty = true;
    };

    updateSize();

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateSize);
      ro.observe(stage);
    } else {
      window.addEventListener('resize', updateSize);
    }

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const st = animRef.current;

      // Smooth pointer parallax lean
      if (!reducedMotion) {
        const dlx = st.targetLeanX - st.leanX;
        const dly = st.targetLeanY - st.leanY;
        if (Math.abs(dlx) > 0.0005 || Math.abs(dly) > 0.0005) {
          const factor = 1 - Math.exp(-8 * dt);
          st.leanX += dlx * factor;
          st.leanY += dly * factor;
          st.dirty = true;
        }
      }

      // Snap-to-318.0 animation
      if (st.snapActive) {
        const dur = reducedMotion ? 0 : 380;
        const elapsed = now - st.snapStartMs;
        const p = dur <= 0 ? 1 : clamp(elapsed / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const nextAngle = Math.round((st.snapFrom + (THETA_LOCK - st.snapFrom) * eased) * 10) / 10;
        if (nextAngle !== st.angle) {
          st.angle = nextAngle;
          setAngle(nextAngle);
          st.dirty = true;
        }
        if (p >= 1) {
          st.snapActive = false;
          st.angle = THETA_LOCK;
          setAngle(THETA_LOCK);
          st.dirty = true;
        }
      } else if (st.autoSweep) {
        // Auto-orbit gently slows near 318.0 deg so the signal lock reads clearly
        const distToLock = Math.abs(st.angle - THETA_LOCK);
        const speedFactor = distToLock < 12 ? 0.35 + (distToLock / 12) * 0.65 : 1.0;
        const degPerSec = 26 * speedFactor;
        let nextRaw = st.angle + st.sweepDir * degPerSec * dt;
        if (nextRaw >= THETA_MAX - 2) {
          nextRaw = THETA_MAX - 2;
          st.sweepDir = -1;
        } else if (nextRaw <= THETA_MIN + 2) {
          nextRaw = THETA_MIN + 2;
          st.sweepDir = 1;
        }
        st.angle = nextRaw;
        const snappedDisplay = Math.round(nextRaw * 10) / 10;
        setAngle((prev) => (prev === snappedDisplay ? prev : snappedDisplay));
        st.dirty = true;
      }

      if (st.dirty && st.size.w > 0 && st.size.h > 0) {
        st.dirty = false;
        ctx.save();
        ctx.scale(st.size.dpr, st.size.dpr);
        drawShadowScene(ctx, st.size.w, st.size.h, st.angle, st.leanX, st.leanY, langRef.current);
        ctx.restore();
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Dragging directly on canvas rotates light; pointermove updates camera parallax lean
  const dragRef = useRef({ active: false, pointerId: -1, startX: 0, startAngle: INITIAL_ANGLE });

  const handleCanvasPointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startAngle: animRef.current.angle,
    };
    animRef.current.snapActive = false;
    setAutoSweep(false);
    setIsDragging(true);
  };

  const handleCanvasPointerMove = (e) => {
    const stage = stageRef.current;
    if (stage) {
      const rect = stage.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const nx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
        const ny = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
        animRef.current.targetLeanX = nx;
        animRef.current.targetLeanY = -ny;
      }
    }

    if (dragRef.current.active && dragRef.current.pointerId === e.pointerId) {
      const dx = e.clientX - dragRef.current.startX;
      const stageW = stage ? Math.max(260, stage.clientWidth) : 640;
      const deltaDeg = (dx / stageW) * 180;
      const next = Math.round(clamp(dragRef.current.startAngle + deltaDeg, THETA_MIN, THETA_MAX) * 2) / 2;
      animRef.current.angle = next;
      animRef.current.dirty = true;
      setAngle(next);
    }
  };

  const handleCanvasPointerUp = (e) => {
    if (dragRef.current.active && dragRef.current.pointerId === e.pointerId) {
      dragRef.current.active = false;
      setIsDragging(false);
    }
  };

  const handleCanvasPointerLeave = () => {
    if (!dragRef.current.active) {
      animRef.current.targetLeanX = 0;
      animRef.current.targetLeanY = 0;
    }
  };

  const handleSliderChange = (e) => {
    const next = parseFloat(e.target.value);
    animRef.current.snapActive = false;
    setAutoSweep(false);
    animRef.current.angle = next;
    animRef.current.dirty = true;
    setAngle(next);
  };

  const handleSnapToLock = () => {
    setAutoSweep(false);
    animRef.current.autoSweep = false;
    animRef.current.snapFrom = animRef.current.angle;
    animRef.current.snapStartMs = performance.now();
    animRef.current.snapActive = true;
    animRef.current.dirty = true;
  };

  const handleToggleSweep = () => {
    animRef.current.snapActive = false;
    setAutoSweep((prev) => !prev);
  };

  const rad = (angle * Math.PI) / 180;
  const cosTheta = Math.cos(rad);
  const sinTheta = Math.sin(rad);
  const deltaTheta = Math.abs(angle - THETA_LOCK);
  const isLocked = deltaTheta <= LOCK_TOLERANCE;
  const entropy = computeEntropy(angle);

  // Live CSS box-shadow reaction vector for route & work cards
  const boxDx = (cosTheta * 11).toFixed(2);
  const boxDy = (sinTheta * 11).toFixed(2);
  const sparkX = (((angle - THETA_MIN) / (THETA_MAX - THETA_MIN)) * 84).toFixed(1);
  const sparkY = (21 - entropy * 18).toFixed(1);

  const stateLabel = isLocked
    ? t({ en: 'SIGNAL LOCKED · 318.0°', zh: '信号锁定 · 318.0°' })
    : deltaTheta <= 26
      ? t({ en: 'CONVERGING', zh: '即将收敛' })
      : t({ en: 'SCATTERED', zh: '杂乱散射' });

  const HeadingTag = embedded ? 'h2' : 'h1';
  const MainTag = embedded ? 'div' : 'main';
  const RootTag = embedded ? 'section' : 'div';
  const rootStyle = {
    '--sh-dx': `${boxDx}px`,
    '--sh-dy': `${boxDy}px`,
    '--sh-lock': isLocked ? '1' : '0',
  };

  return (
    <RootTag
      className={`shadow-study${embedded ? ' is-embedded' : ''}${isLocked ? ' is-locked' : ''}`}
      style={rootStyle}
    >
      {!embedded && <Header />}

      <MainTag className="sh-main">
        {embedded && head && <div className="sh-embedded-head">{head}</div>}

        <div className="sh-intro">
          <div>
            <p className="eyebrow sh-eyebrow">
              <span className="sh-eyebrow-dot" aria-hidden="true" />
              <span>
                10 · {t({ en: 'Shadow Theatre', zh: '影戏装置' })} ·{' '}
                {joinParts([profile.name, joinParts([t(profile.role), t(profile.org)], ', ')], ' — ')}
              </span>
            </p>
            <HeadingTag className="sh-title">
              {t({
                en: (
                  <>
                    Find the angle where noise snaps into <em>form</em>.
                  </>
                ),
                zh: (
                  <>
                    找到那个让杂乱投影成<em>型</em>的角度。
                  </>
                ),
              })}
            </HeadingTag>
          </div>
          <p className="sh-premise">
            {t({
              en: 'A suspended 3D brass-and-ink wire rig casts scattered traces across warm stone paper. Orbit the light across 180°–360°; only at 318.0° do all rays cancel into legible structure.',
              zh: '悬空的三维黄铜与墨线丝网将杂乱线条投射在温润石纸上。在 180°–360° 间旋转光源；唯有行至 318.0° 时，所有光线才会精准校准为清晰字迹。',
            })}
          </p>
        </div>

        {/* 3D Canvas Stage + Goniometer & Signal Lock HUD */}
        <div className="sh-bench">
          <div
            ref={stageRef}
            className="sh-stage-wrap"
            onPointerLeave={handleCanvasPointerLeave}
          >
            <div className="sh-stage-overlay">
              <span className="sh-hint-pill">
                {t({
                  en: 'Drag stage to orbit light · Move pointer for 3D parallax',
                  zh: '拖拽画布旋转光源 · 移动光标观察三维视差',
                })}
              </span>
              <span className={`sh-lock-pill${isLocked ? ' is-locked' : ''}`} aria-live="polite">
                <i aria-hidden="true" />
                {isLocked
                  ? t({ en: 'SIGNAL LOCKED · 318.0°', zh: '信号锁定 · 318.0°' })
                  : `${t({ en: 'OFF-AXIS', zh: '偏轴' })} · Δθ ${deltaTheta.toFixed(1)}°`}
              </span>
            </div>

            <canvas
              ref={canvasRef}
              className={`sh-canvas${isDragging ? ' is-dragging' : ''}`}
              aria-label={t({
                en: 'Interactive 3D anamorphic wire sculpture casting a shadow onto stone paper',
                zh: '可交互的三维畸变透视铁丝雕塑及其在石纸平面上的投影',
              })}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerCancel={handleCanvasPointerUp}
            />
          </div>

          <div className="sh-hud">
            <div className="sh-controls">
              <div className="sh-slider-block">
                <div className="sh-slider-head">
                  <label htmlFor="sh-azimuth-slider">
                    {t({ en: 'Light Azimuth θ (180.0° — 360.0°)', zh: '光源方位角 θ (180.0° — 360.0°)' })}
                  </label>
                  <span className={`sh-slider-val${isLocked ? ' is-locked' : ''}`}>
                    θ = {angle.toFixed(1)}°
                  </span>
                </div>

                <div className="sh-range-wrap">
                  <span className="sh-lock-notch" aria-hidden="true" />
                  <input
                    id="sh-azimuth-slider"
                    className="sh-range"
                    type="range"
                    min={THETA_MIN}
                    max={THETA_MAX}
                    step={0.5}
                    value={angle}
                    onChange={handleSliderChange}
                  />
                </div>

                <div className="sh-ticks" aria-hidden="true">
                  <span>180°</span>
                  <span style={{ left: '25%' }}>225°</span>
                  <span style={{ left: '50%' }}>270°</span>
                  <button
                    type="button"
                    className="sh-tick-lock"
                    tabIndex={-1}
                    onClick={handleSnapToLock}
                  >
                    318.0° LOCK
                  </button>
                  <span>360°</span>
                </div>
              </div>

              <div className="sh-actions">
                <button
                  type="button"
                  className={`sh-btn sh-btn-lock${isLocked ? ' is-locked' : ''}`}
                  onClick={handleSnapToLock}
                >
                  {isLocked
                    ? t({ en: 'Locked · 318.0° ✓', zh: '已锁定 · 318.0° ✓' })
                    : t({ en: 'Snap to 318.0° Lock', zh: '一键校准 318.0°' })}
                </button>
                <button
                  type="button"
                  className={`sh-btn sh-btn-sweep${autoSweep ? ' is-active' : ''}`}
                  aria-pressed={autoSweep}
                  onClick={handleToggleSweep}
                >
                  <i aria-hidden="true" />
                  {autoSweep
                    ? t({ en: 'Pause Orbit Sweep', zh: '暂停自动扫描' })
                    : t({ en: 'Auto Orbit Sweep', zh: '自动轨道扫描' })}
                </button>
              </div>
            </div>

            <div className="sh-telemetry" aria-live="polite">
              <div className="sh-metric-cell">
                <span className="sh-metric-k">{t({ en: 'Azimuth θ', zh: '当前方位角 θ' })}</span>
                <span className={`sh-metric-v${isLocked ? ' is-locked' : ''}`}>
                  {angle.toFixed(1)}°
                </span>
              </div>

              <div className="sh-metric-cell">
                <span className="sh-metric-k">{t({ en: 'Delta Error |Δθ|', zh: '角度误差 |Δθ|' })}</span>
                <span className={`sh-metric-v${isLocked ? ' is-locked' : ''}`}>
                  {deltaTheta.toFixed(1)}°
                </span>
              </div>

              <div className="sh-metric-cell">
                <span className="sh-metric-k">{t({ en: 'Shadow Entropy', zh: '投影熵值' })}</span>
                <div className="sh-entropy-row">
                  <span className={`sh-metric-v${isLocked ? ' is-locked' : ''}`}>
                    {entropy.toFixed(3)}
                  </span>
                  <svg className="sh-spark" viewBox="0 0 84 24" aria-hidden="true">
                    <line x1={LOCK_SPARK_X} y1="0" x2={LOCK_SPARK_X} y2="24" stroke="rgba(255, 90, 31, 0.35)" strokeDasharray="2 2" />
                    <path d={ENTROPY_CURVE_PATH} fill="none" stroke="rgba(17, 17, 17, 0.35)" strokeWidth="1.2" />
                    <circle cx={sparkX} cy={sparkY} r="3" fill={isLocked ? '#ff5a1f' : '#111111'} />
                  </svg>
                </div>
              </div>

              <div className="sh-metric-cell">
                <span className="sh-metric-k">{t({ en: 'Signal Status', zh: '信号状态' })}</span>
                <span className={`sh-status-tag${isLocked ? ' is-locked' : ''}`}>{stateLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Route & Shadow-Projected Work Showcase */}
        <div className="sh-showcase">
          <div>
            <div className="sh-sec-head">
              <h2>{t({ en: '02 · Route Coordinates', zh: '02 · 轨迹坐标' })}</h2>
              <span>SYD → SIN → PEK → ALIBABA</span>
            </div>

            <ol className="sh-route-list">
              {route.map((stop, idx) => {
                const city = t(stop.city);
                const isLast = idx === route.length - 1;
                return (
                  <li key={stop.years} className={`sh-stop${isLast ? ' is-current' : ''}`}>
                    <div className="sh-stop-top">
                      <span className="sh-stop-code">
                        {stop.code || (
                          <span className="sh-blank" aria-label={t({ en: 'to be filled in', zh: '待填写' })} />
                        )}
                      </span>
                      <span className="sh-stop-arrow" aria-hidden="true">
                        {isLast ? '●' : '→'}
                      </span>
                    </div>
                    <span className="sh-stop-what">{stop.what}</span>
                    <span className="sh-stop-meta">{joinParts([stop.years, city])}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div>
            <div className="sh-sec-head">
              <h2>{t({ en: '03 · Selected Work · Cast Shadow Projection', zh: '03 · 代表工作 · 实时光影投射' })}</h2>
              <span>
                {t({ en: 'Shadow vector', zh: '投影向量' })} ({cosTheta.toFixed(2)}, {sinTheta.toFixed(2)})
              </span>
            </div>

            <div className="sh-work-grid">
              {work.map((item, idx) => (
                <article key={item.id} className="sh-card">
                  <div className="sh-card-top">
                    <span>0{idx + 1}</span>
                    <span>
                      {item.where} · {item.year}
                    </span>
                  </div>
                  <div className="sh-card-metric-row">
                    <strong className="sh-card-metric">{item.metric}</strong>
                    <span className="sh-card-metric-label">{t(item.metricLabel)}</span>
                  </div>
                  <h3 className="sh-card-title">{item.title}</h3>
                  <p className="sh-card-line">{t(item.line)}</p>
                </article>
              ))}
            </div>

            <small className="mono sh-footnote">{t(footnote)}</small>
          </div>
        </div>
      </MainTag>

      {!embedded && <Outro current="shadow" />}
    </RootTag>
  );
}
