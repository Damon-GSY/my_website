import * as THREE from 'three';
import { choreographyState, particleChoreography } from '../motion/choreography';

const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const random = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

// The chrome silhouette and live grains share the same image coordinates at the handoff.
async function sampleChrome() {
  const image = new Image();
  image.src = '/oil-lab/matter/K1.png';
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 216;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, 384, 216);
  const { data } = context.getImageData(0, 0, 384, 216);
  const sites = [];
  for (let y = 52; y < 184; y++) for (let x = 194; x < 319; x++) {
    const at = (y * 384 + x) * 4;
    const [r, g, b] = data.subarray(at, at + 3);
    if ((r + g) * .5 > b * .66 && (r + g + b) > 65) sites.push([x / 384, y / 216, (r + g + b) / 765]);
  }
  if (sites.length < 100) throw new Error('The chrome silhouette is unavailable.');
  return sites;
}

export async function createMatterScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 6000);
  let sites;
  try { sites = await sampleChrome(); } catch (error) { renderer.dispose(); throw error; }
  const count = innerWidth < 700 ? 13500 : 22000;
  const forms = [new Float32Array(count * 3), new Float32Array(count * 3), new Float32Array(count * 3)];
  const seeds = new Float32Array(count);
  const alphas = new Float32Array(count);
  const rawD = new Float32Array(count * 3);
  const rawNetwork = new Float32Array(count * 3);
  const rawRings = new Float32Array(count * 3);
  const nodes = [[0, 0, .04], [-.33, .22, -.10], [.31, .26, .06], [.37, -.15, -.02], [-.31, -.26, .04], [.02, -.35, -.1], [.02, .38, .05]];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const at = i * 3;
    const sample = sites[Math.floor(random(i + 9) * sites.length)];
    rawD.set([sample[0] + (random(i + 1) - .5) / 384, sample[1] + (random(i + 3) - .5) / 216, sample[2]], at);
    seeds[i] = random(i + 5);
    alphas[i] = .3 + random(i + 8) * .7;
    const nodeIndex = i % nodes.length;
    const node = nodes[nodeIndex];
    const phi = golden * i;
    const yy = 1 - random(i + 21) * 2;
    const rr = Math.sqrt(1 - yy * yy);
    const size = nodeIndex === 0 ? .155 : .067;
    if (i % 4 !== 0) {
      rawNetwork.set([node[0] + Math.cos(phi) * rr * size, node[1] + yy * size, node[2] + Math.sin(phi) * rr * size], at);
    } else {
      const target = nodes[1 + Math.floor(i / 4) % (nodes.length - 1)];
      const t = random(i + 33);
      const fuzz = .008;
      rawNetwork.set([target[0] * t + Math.sin(t * Math.PI) * .075 + (random(i + 71) - .5) * fuzz, target[1] * t + (random(i + 81) - .5) * fuzz, target[2] * t + Math.sin(t * Math.PI) * .12], at);
    }
    const ring = i % 3;
    const theta = random(i + 42) * Math.PI * 2;
    const radius = .31 + (random(i + 51) - .5) * .055;
    const point = new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, (random(i + 61) - .5) * .03);
    point.applyEuler(new THREE.Euler(.23 + ring * .56, ring * .8 - .5, ring * .55));
    rawRings.set(point.toArray(), at);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(forms[0], 3));
  forms.forEach((array, i) => geometry.setAttribute(`form${i}`, new THREE.BufferAttribute(array, 3)));
  geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
  const uniforms = {
    weights: { value: new THREE.Vector3(1, 0, 0) }, transition: { value: new THREE.Vector2() },
    opacity: { value: 0 }, pointSize: { value: 1.8 }, scale: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 form0, form1, form2;
      attribute float seed, alpha;
      uniform vec2 transition;
      uniform float pointSize, scale;
      varying float vAlpha;
      ${particleChoreography}
      void main() {
        vec3 from = transition.y < 1.5 ? form0 : form1;
        vec3 target = transition.y < 1.5 ? form1 : form2;
        vec3 p = motionPose(from, target, transition.x, seed, scale);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = pointSize * (0.7 + seed * 0.7);
        vAlpha = alpha;
      }
    `,
    fragmentShader: `
      precision mediump float;
      uniform float opacity;
      varying float vAlpha;
      void main() {
        float m = 1.0 - smoothstep(.17, .5, length(gl_PointCoord - .5));
        if (m < .015) discard;
        gl_FragColor = vec4(mix(vec3(.90,.93,.87), vec3(1.0), vAlpha), m * vAlpha * opacity);
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  let width = 1;
  let height = 1;
  let cameraDistance = 1;
  let phoneStage = null;
  let renders = 0;
  let choreography = choreographyState(0);
  let sampleBounds = {};
  const resize = () => {
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    cameraDistance = (height / 2) / Math.tan(20 * Math.PI / 180);
    camera.position.z = cameraDistance;
    camera.updateProjectionMatrix();
    const imageWidth = Math.min(width, height * 16 / 9);
    const imageHeight = imageWidth * 9 / 16;
    canvas.parentElement.style.setProperty('--matter-image-width', `${imageWidth}px`);
    canvas.parentElement.style.setProperty('--matter-image-height', `${imageHeight}px`);
    const offsetX = (width - imageWidth) / 2;
    const offsetY = (height - imageHeight) / 2;
    const centerX = offsetX + imageWidth * .675 - width / 2;
    const centerY = height / 2 - (offsetY + imageHeight * .55);
    const scale = Math.min(imageHeight * .92, width * .62);
    phoneStage = null;
    if (innerWidth <= 700) {
      const stage = canvas.closest('.matter-stage');
      const canvasRect = canvas.getBoundingClientRect();
      const copyBottom = Math.max(...[...stage.querySelectorAll('.matter-method')].map((node) => node.getBoundingClientRect().bottom)) + 14;
      const evidenceTop = Math.min(...[...stage.querySelectorAll('.matter-proof')].map((node) => node.getBoundingClientRect().top)) - 14;
      phoneStage = {
        height: Math.max(100, evidenceTop - copyBottom),
        centerY: canvasRect.top + height / 2 - (copyBottom + evidenceTop) / 2,
      };
    }
    for (let i = 0; i < count; i++) {
      const at = i * 3;
      forms[0][at] = offsetX + rawD[at] * imageWidth - width / 2 - centerX;
      forms[0][at + 1] = height / 2 - (offsetY + rawD[at + 1] * imageHeight) - centerY;
      forms[0][at + 2] = (random(i + 109) - .5) * 10;
      for (let shape = 1; shape < 3; shape++) {
        const raw = shape === 1 ? rawNetwork : rawRings;
        forms[shape][at] = raw[at] * scale;
        forms[shape][at + 1] = raw[at + 1] * scale;
        forms[shape][at + 2] = raw[at + 2] * scale;
      }
    }
    points.position.set(centerX, centerY, 0);
    ['position', 'form0', 'form1', 'form2'].forEach((name) => { geometry.attributes[name].needsUpdate = true; });
    uniforms.pointSize.value = (innerWidth < 700 ? 1.35 : 1.65) * renderer.getPixelRatio();
    uniforms.scale.value = scale;
    sampleBounds = { width, height, imageWidth, imageHeight, scale, centerX, centerY };
  };
  resize();
  return {
    resize,
    render(progress, pointer) {
      const a = smooth(.43, .66, progress);
      const b = smooth(.75, .94, progress);
      const boundary = progress < .75 ? 1 : 2;
      const phase = boundary === 1 ? clamp((progress - .43) / .23) : clamp((progress - .75) / .19);
      choreography = choreographyState(phase);
      // Reframe after the exact image handoff; short phones retain a clear reading area.
      const reframe = smooth(.42, .55, progress);
      const retreat = phoneStage ? Math.max(1, sampleBounds.imageHeight * (.84 + .34 * choreography.envelope) / phoneStage.height) : 1;
      const cameraScale = 1 + (retreat - 1) * reframe;
      camera.position.z = cameraDistance * cameraScale;
      const centerY = phoneStage ? sampleBounds.centerY + (phoneStage.centerY - sampleBounds.centerY) * reframe : sampleBounds.centerY;
      points.position.set(sampleBounds.centerX * cameraScale, centerY * cameraScale, 0);
      uniforms.weights.value.set(1 - a, a * (1 - b), b);
      uniforms.transition.value.set(phase, boundary);
      uniforms.opacity.value = smooth(.30, .42, progress) * 1.2;
      const spatial = smooth(.4, .54, progress);
      points.rotation.y = (Math.sin(progress * 4) * .18 + pointer.x * .10) * spatial;
      points.rotation.x = pointer.y * .07 * spatial;
      renderer.render(scene, camera);
      renders++;
    },
    getMetrics: () => ({ count, renders, choreography: 'anticipate-arc-settle', weights: uniforms.weights.value.toArray(), phase: choreography.phase, beat: choreography.beat, squeeze: choreography.compression, stretch: choreography.stretch, opacity: uniforms.opacity.value, drawCalls: renderer.info.render.calls, geometryVersion: geometry.attributes.form0.version, cameraScale: camera.position.z / cameraDistance, phoneStage, ...sampleBounds }),
    dispose() { geometry.dispose(); material.dispose(); renderer.dispose(); },
  };
}
