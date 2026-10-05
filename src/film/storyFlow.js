import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, DURATION, seeded, smooth } from './motion';

const COUNT = 24000;
const TAU = Math.PI * 2;
const HALF_TRANSITION = .8;
const BACKGROUNDS = ['#0757ed', '#101e34', '#111a23'].map((color) => new THREE.Color(color));

// The artwork and DOM both read these weights; reversing scroll reverses the same path.
export function storyState(time) {
  const weights = [1, 0, 0];
  let blend = 0;
  let boundary = 0;
  if (time > 6 - HALF_TRANSITION) {
    boundary = time < 12 - HALF_TRANSITION ? 1 : 2;
    blend = smooth((time - (boundary * 6 - HALF_TRANSITION)) / (HALF_TRANSITION * 2));
    weights.fill(0);
    weights[boundary - 1] = 1 - blend;
    weights[boundary] = blend;
  }
  const chapter = weights.indexOf(Math.max(...weights));
  return {
    weights, chapter, blend, boundary,
    squeeze: 1 - .72 * Math.sin(blend * Math.PI),
    morphing: blend > 0 && blend < 1,
  };
}

function sampleHelmet(random) {
  const pieces = [];
  const add = (geometry, x = 0, y = 0, z = 0, accent = 0) => {
    geometry.translate(x, y, z);
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    const attribute = flat.getAttribute('position');
    for (let i = 0; i < attribute.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(attribute, i);
      const b = new THREE.Vector3().fromBufferAttribute(attribute, i + 1);
      const c = new THREE.Vector3().fromBufferAttribute(attribute, i + 2);
      const area = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).length() * .5;
      // Small eye capsules need more samples than their surface area alone would receive.
      pieces.push({ a, b, c, area: area * (accent === 1 ? 6 : 1), accent });
    }
    flat.dispose();
    if (flat !== geometry) geometry.dispose();
  };
  const round = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 2, r);
  add(new THREE.SphereGeometry(1, 36, 20, 0, TAU, 0, 1.12).scale(.91, .96, .66));
  add(round(1.66, .43, 1.04, .16), 0, -.68, 0);
  for (const side of [-1, 1]) {
    add(round(.24, .89, .95, .10), side * .78, -.12, .02);
    add(new THREE.CylinderGeometry(.37, .37, .23, 32).rotateZ(Math.PI / 2), side * .98, .01, -.03, .25);
    add(new THREE.TorusGeometry(.26, .025, 6, 32).rotateY(Math.PI / 2), side * 1.105, .01, -.03, .8);
    add(round(.14, .29, .035, .065), side * .23, .01, .77, 1);
  }
  add(new THREE.TorusGeometry(1, .025, 6, 48).scale(.73, .42, .5), 0, .02, .64, .55);
  add(round(.09, .15, .9, .035), 0, .91, -.04, .75);
  add(round(.56, .055, .04, .02), 0, -.66, .54, .6);
  add(new THREE.CylinderGeometry(.25, .28, .18, 24), 0, -.97, 0, .3);
  let total = 0;
  const cumulative = pieces.map((piece) => (total += piece.area));
  return () => {
    const target = random() * total;
    let low = 0, high = pieces.length - 1;
    while (low < high) { const middle = (low + high) >>> 1; if (cumulative[middle] < target) low = middle + 1; else high = middle; }
    const { a, b, c, accent } = pieces[low];
    let u = random(), v = random();
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    return [a.x + u * (b.x - a.x) + v * (c.x - a.x), a.y + u * (b.y - a.y) + v * (c.y - a.y), a.z + u * (b.z - a.z) + v * (c.z - a.z), accent];
  };
}

function createForms() {
  const random = seeded(83174);
  const train = new Float32Array(COUNT * 3);
  const agent = new Float32Array(COUNT * 3);
  const signature = new Float32Array(COUNT * 3);
  const detail = new Float32Array(COUNT * 3);
  const sample = sampleHelmet(random);
  const mask = document.createElement('canvas');
  mask.width = 1024; mask.height = 256;
  const ctx = mask.getContext('2d', { willReadFrequently: true });
  ctx.font = '400 215px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('GDAMON', 512, 135, 990);
  const pixels = ctx.getImageData(0, 0, 1024, 256).data;
  const sites = [];
  for (let y = 0; y < 256; y += 2) for (let x = 0; x < 1024; x += 2) if (pixels[(y * 1024 + x) * 4 + 3] > 160) sites.push([x, y]);
  const modelRotation = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(.31, -.46, -.12));
  const point = new THREE.Vector3();
  for (let i = 0; i < COUNT; i++) {
    const layer = i % 3;
    const grid = Math.round(random() * 16) / 8 - 1;
    let x = random() * 2 - 1, z = grid;
    if (i % 2) { z = x; x = grid; }
    point.set(x, (layer - 1) * .55 + (random() - .5) * .018, z * .7).applyMatrix4(modelRotation);
    point.toArray(train, i * 3);
    const helmet = sample();
    agent.set(helmet.slice(0, 3), i * 3);
    const site = sites[Math.floor(random() * sites.length)] || [512, 128];
    signature.set([(site[0] / 1024 - .5) * 3.2, (.5 - site[1] / 256) * .8, (random() - .5) * .13], i * 3);
    detail.set([random(), .6 + random() * .8, helmet[3]], i * 3);
  }
  return { train, agent, signature, detail };
}

/** One GPU point cloud: no 2D readback, per-frame geometry rebuild, or timed scene cuts. */
export function createStoryFlow(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const background = new THREE.Color();
  scene.background = background;
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 50);
  camera.position.z = 8;
  const forms = createForms();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(forms.train, 3));
  geometry.setAttribute('pA', new THREE.BufferAttribute(forms.train, 3));
  geometry.setAttribute('pB', new THREE.BufferAttribute(forms.agent, 3));
  geometry.setAttribute('pC', new THREE.BufferAttribute(forms.signature, 3));
  geometry.setAttribute('detail', new THREE.BufferAttribute(forms.detail, 3));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
  const uniforms = {
    weights: { value: new THREE.Vector3(1, 0, 0) }, squeeze: { value: 1 },
    time: { value: 0 }, pointSize: { value: 2.1 }, viewportHeight: { value: 900 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 pA, pB, pC, detail;
      uniform vec3 weights;
      uniform float squeeze, time, pointSize, viewportHeight;
      varying float alpha, accent;
      void main() {
        vec3 p = pA * weights.x + pB * weights.y + pC * weights.z;
        float phase = detail.x * 6.283185;
        float displacement = .004 + (1. - squeeze) * .055;
        p += vec3(sin(phase + time * .6), cos(phase * 1.4 + time * .5), sin(phase * 2.1 + time * .4)) * displacement;
        p.xz *= squeeze;
        p.y += sin(phase) * (1. - squeeze) * .12;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(pointSize * detail.y * viewportHeight / (700. * max(.4, -mv.z / 8.)), 1., 4.);
        alpha = .23 + .50 * detail.x;
        accent = mix(step(.88, detail.x) * .7, detail.z, weights.y);
      }`,
    fragmentShader: `
      precision mediump float;
      varying float alpha, accent;
      void main() {
        float grain = 1. - smoothstep(.16, .5, length(gl_PointCoord - .5));
        if (grain < .01) discard;
        vec3 color = mix(vec3(.84, .94, 1.), vec3(.65, 1., .36), accent);
        gl_FragColor = vec4(color, grain * alpha);
      }`,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  let width = 0, height = 0, insetTop = 0, insetBottom = 0, artworkBounds = null;
  let rect = { x: 0, y: 0, width: 1, height: 1 };
  let time = 0, frames = 0, disposed = false, drawMs = 0;
  let state = storyState(0);
  const contextLost = (event) => { event.preventDefault(); disposed = true; };
  canvas.addEventListener('webglcontextlost', contextLost);
  function seek(value) {
    if (disposed) throw new Error('The particle scene is unavailable.');
    const start = performance.now();
    time = clamp(value, 0, DURATION);
    state = storyState(time);
    uniforms.weights.value.fromArray(state.weights);
    uniforms.squeeze.value = state.squeeze;
    uniforms.time.value = time;
    // Color has no vector mutation API; accumulate in linear light for a seamless palette change.
    background.setRGB(...['r', 'g', 'b'].map((channel) => BACKGROUNDS.reduce((sum, color, index) => sum + color[channel] * state.weights[index], 0)));
    points.rotation.set(Math.sin(time * .20) * .035, (.16 + Math.sin(time * .27) * .15) * (1 - state.weights[2]), Math.sin(time * .14) * .02 * (1 - state.weights[2]));
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, width, height);
    renderer.setClearColor(background, 1);
    renderer.clear();
    renderer.setViewport(rect.x, height - rect.y - rect.height, rect.width, rect.height);
    renderer.setScissor(rect.x, height - rect.y - rect.height, rect.width, rect.height);
    renderer.setScissorTest(true);
    renderer.render(scene, camera);
    frames++;
    drawMs = performance.now() - start;
    return time;
  }
  function setSize(nextWidth, nextHeight, insets = {}) {
    width = Math.round(clamp(nextWidth, 64, 4096)); height = Math.round(clamp(nextHeight, 64, 4096));
    insetTop = insets.top || 0; insetBottom = insets.bottom || 0; artworkBounds = insets.artworkBounds || null;
    const cssWidth = canvas.clientWidth || width, cssHeight = canvas.clientHeight || height;
    const compact = width / height < 1.1 || (cssWidth < 800 && cssHeight > 600);
    rect = artworkBounds || (compact ? { x: width * .10, y: height * .35, width: width * .8, height: height * .24 } : { x: width * .49, y: height * .11, width: width * .50, height: height * .61 });
    renderer.setSize(width, height, false);
    camera.aspect = rect.width / Math.max(1, rect.height);
    camera.position.z = Math.max(2.35, 3.3 / camera.aspect) / (2 * Math.tan(THREE.MathUtils.degToRad(17.5)));
    camera.updateProjectionMatrix();
    uniforms.viewportHeight.value = rect.height;
    uniforms.pointSize.value = Math.min(3.3, Math.max(1.8, height / cssHeight * 2));
    seek(time);
  }
  setSize(canvas.width || 1440, canvas.height || 900);
  return {
    duration: DURATION, seek, setSize,
    capture(value = time) { seek(value); return canvas.toDataURL('image/png'); },
    getMetrics: () => ({ ready: !disposed, duration: DURATION, time, width, height, contentHeight: height - insetTop - insetBottom, insetTop, insetBottom, artworkBounds,
      chapter: ['intro', 'robot', 'signature'][state.chapter],
      flow: { renderer: 'gpu-particles', count: COUNT, weights: [...state.weights], squeeze: state.squeeze, morphing: state.morphing, renderedFrames: frames, drawCalls: renderer.info.render.calls, drawMs, geometryVersion: geometry.attributes.pA.version, artworkRect: { ...rect } },
      robot: { renderer: 'three', renderedFrames: frames, meshes: renderer.info.render.calls, triangles: 0, particleCount: COUNT },
    }),
    dispose() { disposed = true; canvas.removeEventListener('webglcontextlost', contextLost); geometry.dispose(); material.dispose(); renderer.dispose(); },
  };
}
