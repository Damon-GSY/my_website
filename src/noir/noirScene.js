import * as THREE from 'three';
import { particleChoreography } from '../motion/choreography';

const TAU = Math.PI * 2;
export const clamp = (n) => Math.max(0, Math.min(1, n));
export const smooth = (a, b, n) => { const t = clamp((n - a) / (b - a)); return t * t * (3 - 2 * t); };
const WINDOWS = [[.12, .29], [.43, .61], [.76, .94]];

export function noirPose(progress) {
  let from = 0, blend = 0;
  WINDOWS.forEach(([start, end], index) => {
    if (progress >= start) { from = index; blend = clamp((progress - start) / (end - start)); }
  });
  const weights = [0, 0, 0, 0];
  weights[from] = 1 - smooth(0, 1, blend);
  weights[from + 1] = smooth(0, 1, blend);
  const opacity = [0, 0, 0, 0];
  opacity[from] = 1 - smooth(.20, .50, blend);
  opacity[from + 1] = smooth(.52, .84, blend);
  return { from, blend, weights, opacity, phase: blend < .5 ? from : from + 1 };
}

function randomGenerator() {
  let seed = 173831;
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

function createForms(count) {
  const random = randomGenerator();
  const forms = Array.from({ length: 4 }, () => new Float32Array(count * 3));
  const detail = new Float32Array(count * 3);
  const mask = document.createElement('canvas');
  mask.width = 1100; mask.height = 240;
  const ctx = mask.getContext('2d', { willReadFrequently: true });
  ctx.font = '400 230px Anton'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.fillText('GDAMON', 550, 126, 1080);
  const pixels = ctx.getImageData(0, 0, 1100, 240).data;
  const sites = [];
  for (let y = 0; y < 240; y += 2) for (let x = 0; x < 1100; x += 2) {
    if (pixels[(y * 1100 + x) * 4 + 3] > 160) sites.push([x, y]);
  }
  const nodes = [[0, 0, .18], [-.91, .43, -.18], [-.69, -.65, .22], [.04, .83, -.12], [.89, .43, .11], [.78, -.62, -.2], [.08, -.86, .32]];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const rotation = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(.78, -.28, -.23));
  const point = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const seed = random(), theta = i * golden, y = 1 - i / (count - 1) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const radius = .90 + .055 * Math.sin(theta * 3 + y * 8) + (random() - .5) * .06;
    forms[0].set([Math.cos(theta) * ring * radius, y * radius, Math.sin(theta) * ring * radius], i * 3);

    const u = random() * TAU, v = random() * TAU, thickness = .19 + random() * .07;
    point.set((.76 + Math.cos(v) * thickness) * Math.cos(u), Math.sin(v) * thickness, (.76 + Math.cos(v) * thickness) * Math.sin(u));
    point.applyMatrix4(rotation).toArray(forms[1], i * 3);

    const node = nodes[i % nodes.length];
    if (seed < .53) {
      const angle = random() * TAU, z = random() * 2 - 1, r = Math.sqrt(1 - z * z), size = i % nodes.length === 0 ? .24 : .12;
      forms[2].set([node[0] + Math.cos(angle) * r * size, node[1] + z * size, node[2] + Math.sin(angle) * r * size], i * 3);
    } else {
      const a = nodes[i % 6 + 1], b = i % 3 === 0 ? nodes[(i + 1) % 6 + 1] : nodes[0];
      const t = random(), bend = Math.sin(t * Math.PI), jitter = (random() - .5) * .02;
      forms[2].set([a[0] * (1 - t) + b[0] * t + jitter, a[1] * (1 - t) + b[1] * t + bend * .06 + jitter, a[2] * (1 - t) + b[2] * t + bend * .25 + jitter], i * 3);
    }

    if (seed < .88) {
      const site = sites[Math.floor(random() * sites.length)] || [550, 120];
      forms[3].set([(site[0] / 1100 - .5) * 2.75, (.5 - site[1] / 240) * .60, (random() - .5) * .085], i * 3);
    } else {
      const angle = random() * TAU, noise = (random() - .5) * .018;
      forms[3].set([Math.cos(angle) * 1.26, Math.sin(angle) * .53 + noise, Math.sin(angle) * .30 + noise], i * 3);
    }
    detail.set([seed, .5 + random() * .85, random()], i * 3);
  }
  return { forms, detail };
}

export function createNoirScene(canvas) {
  const count = innerWidth < 700 ? 15000 : 28000;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setClearColor(0x050505, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 30);
  const { forms, detail } = createForms(count);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(forms[0], 3));
  forms.forEach((form, i) => geometry.setAttribute(`p${i}`, new THREE.BufferAttribute(form, 3)));
  geometry.setAttribute('detail', new THREE.BufferAttribute(detail, 3));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
  const uniforms = { from: { value: 0 }, morph: { value: 0 }, progress: { value: 0 }, density: { value: 2 }, dpr: { value: renderer.getPixelRatio() }, focalDistance: { value: 5 } };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 p0, p1, p2, p3, detail;
      uniform float from, morph, progress, density, dpr, focalDistance;
      varying float alpha;
      ${particleChoreography}
      void main() {
        vec3 a = p0, b = p1;
        if (from > .5) { a = p1; b = p2; }
        if (from > 1.5) { a = p2; b = p3; }
        vec3 p = motionPose(a, b, morph, detail.x, 1.);
        p += vec3(sin(detail.x * 12. + progress * 8.), cos(detail.z * 14. + progress * 7.), sin(detail.y * 15. + progress * 5.)) * .006;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(density * dpr * detail.y * (focalDistance / max(1., -mv.z)), dpr, 4.8 * dpr);
        alpha = (.34 + detail.z * detail.z * .66) * clamp(1. - (-mv.z - focalDistance) * .12, .72, 1.);
      }`,
    fragmentShader: `
      precision mediump float;
      varying float alpha;
      void main() {
        float grain = 1. - smoothstep(.10, .5, length(gl_PointCoord - .5));
        if (grain < .01) discard;
        gl_FragColor = vec4(.95, .96, 1., grain * alpha);
      }`,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  let width = 0, height = 0, span = 0, renderedFrames = 0, disposed = false, state = noirPose(0), progress = 0;
  function resize() {
    width = canvas.clientWidth || innerWidth; height = canvas.clientHeight || innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const compact = width < 760;
    span = compact ? Math.max(3.25 / camera.aspect, 5.4) : height < 600 ? Math.max(4.4, 5.2 / camera.aspect) : Math.max(3.1, 4.85 / camera.aspect);
    camera.position.z = span / (2 * Math.tan(THREE.MathUtils.degToRad(17.5)));
    camera.updateProjectionMatrix();
    const spanX = span * camera.aspect;
    points.position.set(compact ? 0 : spanX * .19, compact ? span * (height < 700 ? .21 : .16) : span * .035, 0);
    uniforms.density.value = compact ? 1.75 : 1.9;
    uniforms.focalDistance.value = camera.position.z;
  }
  function render(p, pointer = { x: 0, y: 0 }) {
    if (disposed) return;
    progress = p; state = noirPose(p);
    uniforms.from.value = state.from; uniforms.morph.value = state.blend; uniforms.progress.value = p;
    const signature = state.weights[3];
    points.scale.setScalar(1 - signature * .10);
    points.position.y = width < 760 ? span * (height < 700 ? .21 : .16) : span * (.035 + signature * .08);
    points.rotation.set((-.10 + Math.sin(p * 5) * .07) * (1 - signature) + pointer.y * .045, p * 1.15 * (1 - signature) + pointer.x * .065, Math.sin(p * 5.3) * .025 * (1 - signature));
    renderer.render(scene, camera);
    renderedFrames++;
  }
  resize();
  return {
    resize, render,
    getMetrics: () => ({ count, renderedFrames, progress, weights: [...state.weights], phase: state.phase, width, height, drawCalls: renderer.info.render.calls }),
    dispose() { disposed = true; geometry.dispose(); material.dispose(); renderer.dispose(); },
  };
}
