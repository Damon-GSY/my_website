import * as THREE from 'three';
import { clamp, ease, lerp, span } from '../../engine/timeline.js';
import { dockRect } from '../../engine/dock.js';
import { GLSL_HEIGHT, height, makePath } from './field.js';

const RING = 96;

const vertexShader = /* glsl */ `
uniform float uZ;
uniform float uMix;
varying float vH;
varying vec2 vP;
varying vec3 vW;
${GLSL_HEIGHT}
void main() {
  vP = position.xy;
  vH = height(position.xy, uMix);
  vec4 world = modelMatrix * vec4(position.xy, vH * uZ, 1.0);
  vW = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const fragmentShader = /* glsl */ `
uniform vec3 uPaper;
uniform vec3 uInk;
uniform float uLines;
uniform float uAlpha;
uniform float uShade;
varying float vH;
varying vec2 vP;
varying vec3 vW;
void main() {
  float f = vH * uLines;
  float thin = 1.0 - clamp(abs(fract(f - 0.5) - 0.5) / fwidth(f), 0.0, 1.0);
  float g = f / 5.0;
  float bold = 1.0 - clamp(abs(fract(g - 0.5) - 0.5) / fwidth(g) - 0.6, 0.0, 1.0);
  float line = max(thin * 0.5, bold);
  float rim = 1.0 - smoothstep(0.72, 1.0, length(vP));
  vec3 col = mix(uPaper, uInk, 0.07 * clamp(-vH, 0.0, 1.0) * rim * uAlpha);
  vec3 nrm = normalize(cross(dFdx(vW), dFdy(vW)));
  if (nrm.z < 0.0) nrm = -nrm;
  float lam = dot(nrm, normalize(vec3(-0.55, 0.55, 0.63)));
  col = mix(col, uInk, clamp((0.63 - lam) * 0.8, 0.0, 0.4) * uShade * rim);
  col = mix(col, uInk, line * rim * uAlpha);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export async function buildDescent(stage, root) {
  await document.fonts.ready;
  const $ = (sel) => root.querySelector(sel);
  const frameEl = $('.sticky');
  const dotEl = $('[data-dot]');
  const rowDotEl = $('[data-rowdot]');
  const rows = [...root.querySelectorAll('[data-row]')];
  const heroEl = $('[data-hero]');
  const workEl = $('[data-work]');
  const headEl = $('[data-work-head]');
  const hudEl = $('[data-hud]');
  const readEl = $('[data-read]');
  const curveEl = $('[data-curve]');

  const path = makePath();
  const last = path.n - 1;
  const points = [];
  for (let i = 0; i < path.n; i += 2) {
    const u = (i / last) * 160;
    const v = 40 - ((path.h[i] - path.lo) / (path.hi - path.lo)) * 36;
    points.push(`${u.toFixed(1)},${v.toFixed(1)}`);
  }
  curveEl.setAttribute('points', points.join(' '));
  root.querySelector('[data-curve-bg]').setAttribute('points', points.join(' '));

  const world = new THREE.Group();
  stage.scene.add(world);
  const uniforms = {
    uZ: { value: 0 },
    uMix: { value: 0 },
    uLines: { value: 18 },
    uAlpha: { value: 1 },
    uShade: { value: 0 },
    uPaper: { value: new THREE.Color('#f4f0e7') },
    uInk: { value: new THREE.Color('#121212') },
  };
  const terrain = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 256, 256),
    new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader }),
  );
  terrain.frustumCulled = false;
  world.add(terrain);

  const orange = new THREE.Color('#ff5a1f');
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20), new THREE.MeshBasicMaterial({ color: orange }));
  world.add(ball);

  const trailPos = new Float32Array(path.n * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: orange }));
  trail.frustumCulled = false;
  world.add(trail);

  const rules = rows.map(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RING * 3), 3));
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#121212', transparent: true }));
    line.frustumCulled = false;
    stage.scene.add(line);
    return line;
  });

  let R = 1;
  let relief = 1;
  let d0;
  let d1;
  let ruleDocks = [];
  function resize() {
    const { w, h } = stage.size();
    R = Math.max(w, h) * 0.85;
    relief = R * 0.5;
    terrain.scale.set(R, R, 1);
    d0 = dockRect(dotEl, frameEl);
    d1 = dockRect(rowDotEl, frameEl);
    ruleDocks = rows.map((row) => dockRect(row, frameEl));
  }
  resize();

  function frame(p) {
    const { h } = stage.size();
    const persp = ease(span(p, 0.08, 0.34)) * (1 - ease(span(p, 0.7, 0.9)));
    stage.setView({ flat: 1 - persp, tilt: 1.05 * persp, yaw: 0.3 * persp });

    const s = span(p, 0.14, 0.8) * last;
    const i = Math.floor(s);
    const j = Math.min(i + 1, last);
    const f = s - i;
    const bx = lerp(path.x[i], path.x[j], f);
    const by = lerp(path.y[i], path.y[j], f);
    const mix = lerp(path.m[i], path.m[j], f);
    const z = relief * persp;
    uniforms.uZ.value = z;
    uniforms.uMix.value = mix;
    uniforms.uShade.value = persp;
    uniforms.uAlpha.value = 1 - span(p, 0.84, 0.92);

    // pan the terrain: start under the headline's full stop, follow the ball, end on row 1
    const a = ease(span(p, 0.1, 0.3));
    const b = ease(span(p, 0.72, 0.9));
    const ox = lerp(lerp(d0.x - path.x[0] * R, -bx * R, a), d1.x - path.x[last] * R, b);
    const oy = lerp(lerp(d0.y - path.y[0] * R, -by * R - h * 0.06, a), d1.y - path.y[last] * R, b);
    world.position.set(ox, oy, 0);

    const radius = lerp(d0.w / 2, d1.w / 2, span(p, 0.14, 0.8));
    ball.scale.setScalar(radius);
    ball.position.set(bx * R, by * R, height(bx, by, mix) * z + radius);

    for (let k = 0; k <= j; k++) {
      trailPos[k * 3] = path.x[k] * R;
      trailPos[k * 3 + 1] = path.y[k] * R;
      trailPos[k * 3 + 2] = height(path.x[k], path.y[k], mix) * z + 1.5;
    }
    trailPos[j * 3] = bx * R;
    trailPos[j * 3 + 1] = by * R;
    trailGeo.attributes.position.needsUpdate = true;
    trailGeo.setDrawRange(0, j + 1);
    trail.visible = p < 0.9;

    // contour rings around the minimum unroll into the rules of the work list
    const morph = span(p, 0.9, 0.975);
    const landed = p >= 0.985;
    const cx = ox + bx * R;
    const cy = oy + by * R;
    rules.forEach((line, k) => {
      line.visible = p > 0.86 && !landed;
      if (!line.visible) return;
      line.material.opacity = span(p, 0.86, 0.9);
      const dock = ruleDocks[k];
      const q = ease(clamp(morph * 1.35 - k * 0.07));
      const rad = 24 + k * 27;
      const arr = line.geometry.attributes.position.array;
      for (let t = 0; t < RING; t++) {
        const u = t / (RING - 1);
        const angle = Math.PI - u * Math.PI * 2;
        arr[t * 3] = lerp(cx + Math.cos(angle) * rad, dock.x - dock.w / 2 + u * dock.w, q);
        arr[t * 3 + 1] = lerp(cy + Math.sin(angle) * rad, dock.y + dock.h / 2, q);
        arr[t * 3 + 2] = 2;
      }
      line.geometry.attributes.position.needsUpdate = true;
    });
    ball.visible = !landed;
    workEl.classList.toggle('is-in', landed);
    headEl.style.opacity = span(p, 0.9, 0.97);

    heroEl.style.opacity = 1 - span(p, 0.09, 0.2);
    heroEl.style.transform = `translateY(${-40 * span(p, 0.09, 0.2)}px)`;
    hudEl.style.opacity = span(p, 0.14, 0.2) * (1 - span(p, 0.8, 0.86));
    curveEl.style.strokeDashoffset = 1 - s / last;
    const loss = lerp(path.h[i], path.h[j], f) - path.lo;
    readEl.textContent = `STEP ${String(i).padStart(3, '0')} / ${last} · LOSS ${loss.toFixed(3)} · ${mix < 0.5 ? 'SFT' : 'RL'}`;
  }

  return {
    frame,
    resize,
    dispose() {
      stage.scene.remove(world, ...rules);
      [terrain, ball, trail, ...rules].forEach((o) => {
        o.geometry.dispose();
        o.material.dispose();
      });
    },
  };
}
