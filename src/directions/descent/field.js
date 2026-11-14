// The loss surface. `m` blends the objective from SFT (m = 0) to RL (m = 1): the first basin
// fills in and the second deepens. The same function is mirrored in GLSL below.
export function height(x, y, m = 0) {
  return (
    0.06 * Math.sin(3.1 * x + 1.7) * Math.cos(2.3 * y) +
    0.11 * (y - x) -
    0.5 * (1 - m) * Math.exp(-((x + 0.25) ** 2 + (y - 0.2) ** 2) / 0.09) -
    (0.3 + 0.7 * m) * Math.exp(-((x - 0.38) ** 2 + (y + 0.3) ** 2) / 0.13)
  );
}

export const GLSL_HEIGHT = /* glsl */ `
float height(vec2 p, float m) {
  vec2 a = p - vec2(-0.25, 0.2);
  vec2 b = p - vec2(0.38, -0.3);
  return 0.06 * sin(3.1 * p.x + 1.7) * cos(2.3 * p.y) + 0.11 * (p.y - p.x)
    - 0.5 * (1.0 - m) * exp(-dot(a, a) / 0.09)
    - (0.3 + 0.7 * m) * exp(-dot(b, b) / 0.13);
}`;

const smooth = (t) => t * t * (3 - 2 * t);

// Gradient descent with momentum, precomputed so scroll position maps to a fixed step.
export function makePath({ sft = 300, rl = 400, lr = 0.0025, momentum = 0.9 } = {}) {
  const n = sft + rl;
  const x = new Float32Array(n);
  const y = new Float32Array(n);
  const m = new Float32Array(n);
  const h = new Float32Array(n);
  const p = { x: -0.72, y: 0.6 };
  const v = { x: 0, y: 0 };
  const e = 1e-3;
  for (let i = 0; i < n; i++) {
    const mix = i < sft ? 0 : smooth(Math.min(1, (i - sft) / 140));
    x[i] = p.x;
    y[i] = p.y;
    m[i] = mix;
    h[i] = height(p.x, p.y, mix);
    const gx = (height(p.x + e, p.y, mix) - height(p.x - e, p.y, mix)) / (2 * e);
    const gy = (height(p.x, p.y + e, mix) - height(p.x, p.y - e, mix)) / (2 * e);
    v.x = v.x * momentum - lr * gx;
    v.y = v.y * momentum - lr * gy;
    p.x += v.x;
    p.y += v.y;
  }
  let lo = Infinity;
  let hi = -Infinity;
  for (const value of h) {
    lo = Math.min(lo, value);
    hi = Math.max(hi, value);
  }
  return { n, sft, x, y, m, h, lo, hi };
}
