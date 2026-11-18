import * as THREE from 'three';
import { clamp, ease, lerp, span } from '../../engine/timeline.js';
import { dockRect } from '../../engine/dock.js';
import { buildFaces, STEPS } from './dice.js';
import { COLS, ROWS, numeralAtlas } from './atlas.js';

// sRGB values written straight to the framebuffer, so they match the CSS colours exactly.
const hex = (h) => new THREE.Vector3(((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255);
const FACE = hex(0xfbfbf9);
const INSIDE = hex(0xdcdcd8);
const INK = hex(0x0d0d0d);
const MAGENTA = hex(0xff2d8a);
const WHITE = hex(0xffffff);

// Timings (progress p, 0..1 across the scroll track).
export const T = {
  stepsFrom: 0.08,
  stepsTo: 0.62,
  foldFrom: 0.64,
  foldTo: 0.88,
  handoff: 0.9,
};

const vertexShader = /* glsl */ `
  attribute vec3 bary;
  uniform vec3 uLight;
  varying vec3 vB;
  varying vec2 vP;
  varying float vShade;
  varying float vShadeBack;
  void main() {
    vB = bary;
    vP = position.xy;
    vec3 n = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
    float d = dot(n, uLight);
    vShade = 0.72 + 0.28 * smoothstep(-0.25, 0.8, d);
    vShadeBack = 0.72 + 0.28 * smoothstep(-0.25, 0.8, -d);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uFill;
  uniform vec3 uInk;
  uniform vec3 uLine;
  uniform vec3 uInside;
  uniform float uEdge;
  uniform float uPlain;
  uniform float uNumRot;
  uniform vec2 uCell;
  uniform sampler2D uAtlas;
  varying vec3 vB;
  varying vec2 vP;
  varying float vShade;
  varying float vShadeBack;
  void main() {
    vec3 w = fwidth(vB);
    vec3 e = smoothstep(w * (uEdge - 0.5), w * (uEdge + 0.5), vB);
    float edge = 1.0 - min(min(e.x, e.y), e.z);
    float c = cos(uNumRot);
    float s = sin(uNumRot);
    vec2 uv = clamp(mat2(c, -s, s, c) * vP + 0.5, 0.002, 0.998);
    float glyph = texture2D(uAtlas, (uCell + uv) / vec2(${COLS}.0, ${ROWS}.0)).a;
    vec3 col;
    if (gl_FrontFacing) {
      col = mix(uFill, uInk, glyph) * mix(vShade, 1.0, uPlain);
    } else {
      col = uInside * mix(vShadeBack, 1.0, uPlain);
    }
    gl_FragColor = vec4(mix(col, uLine, edge), 1.0);
  }
`;

// One equilateral triangle, circumradius 1, centroid at the origin, vertex 0 pointing up (+y).
function triangleGeometry() {
  const geo = new THREE.BufferGeometry();
  const p = [];
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
    p.push(Math.cos(a), Math.sin(a), 0);
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  geo.setAttribute('bary', new THREE.Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1], 3));
  return geo;
}

// Rotation of `face` that turns it toward `toward` with its numeral upright (plus a small in-plane lean).
function presentQuat(face, toward, lean, out) {
  const z = toward.clone().normalize();
  const x = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), z).normalize();
  const y = new THREE.Vector3().crossVectors(z, x);
  const basis = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  const roll = new THREE.Quaternion().setFromAxisAngle(z, lean);
  return out.copy(roll).multiply(basis).multiply(face.q.clone().invert());
}

export async function buildD20(stage, el, onStep) {
  await document.fonts.ready;
  const atlas = await numeralAtlas();
  const faces = buildFaces();
  const geo = triangleGeometry();
  const light = new THREE.Vector3(-0.42, 0.62, 0.66).normalize();
  const dpr = () => stage.dpr();

  const group = new THREE.Group();
  stage.scene.add(group);

  const meshes = faces.map((face) => {
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uFill: { value: face.value === 1 ? MAGENTA : FACE },
        uInk: { value: face.value === 1 ? WHITE : INK },
        uLine: { value: INK },
        uInside: { value: INSIDE },
        uEdge: { value: 1.25 },
        uPlain: { value: 0 },
        uNumRot: { value: 0 },
        uCell: { value: new THREE.Vector2((face.value - 1) % COLS, ROWS - 1 - Math.floor((face.value - 1) / COLS)) },
        uAtlas: { value: atlas },
        uLight: { value: light },
      },
    });
    const mesh = new THREE.Mesh(geo, material);
    mesh.frustumCulled = false;
    group.add(mesh);
    return mesh;
  });

  // A slightly larger black shell drawn inside-out: the die's silhouette line.
  const hullGeo = new THREE.IcosahedronGeometry(1, 0);
  const hullMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide, transparent: true });
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.frustumCulled = false;
  group.add(hull);

  // --- layout: where the die sits and where each face lands, both read from the DOM ---------------
  let die = { x: 0, y: 0, r: 100 };
  let strip = { x: 0, y: 0, s: 1, layout: null };
  let rolls = new Array(STEPS).fill(20);
  const targets = []; // per step 0..20, the die orientation that shows that roll
  const spinAxis = [];
  const marks = [];

  function computeTargets() {
    const { h } = stage.size();
    const dist = h / 2 / Math.tan(THREE.MathUtils.degToRad(35 / 2));
    const toward = new THREE.Vector3(-die.x, -die.y, dist).normalize();
    toward.x -= 0.05;
    toward.y += 0.16;
    const show = [20, ...rolls];
    show.forEach((v, k) => {
      const lean = k === 0 ? -0.12 : (((k * 7) % 11) / 10 - 0.5) * 0.22;
      targets[k] = presentQuat(faces[v - 1], toward, lean, targets[k] || new THREE.Quaternion());
      const phi = k * 2.39996 + 0.7;
      spinAxis[k] = new THREE.Vector3(Math.cos(phi), Math.sin(phi), 0.25).normalize();
    });
  }

  function layout(stripLayout) {
    die = (() => {
      const r = dockRect(el.slot, el.view);
      return { x: r.x, y: r.y, r: Math.min(r.w, r.h) * 0.43 };
    })();
    if (stripLayout) {
      const r = dockRect(el.strip, el.view);
      strip = { x: r.x - r.w / 2, y: r.y + r.h / 2, s: r.w / stripLayout.vbW, layout: stripLayout };
    }
    computeTargets();
  }

  function setRolls(next) {
    rolls = next.slice();
    computeTargets();
    marks.length = 0;
    el.strip.querySelectorAll('[data-k]').forEach((m) => {
      marks[Number(m.dataset.k)] = m;
    });
  }

  // --- per frame --------------------------------------------------------------------------------
  const qDie = new THREE.Quaternion();
  const qSpin = new THREE.Quaternion();
  const qFace = new THREE.Quaternion();
  const qFlat = new THREE.Quaternion();
  const qDown = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
  const idleAxis = new THREE.Vector3(0.35, 1, 0.15).normalize();
  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  const p2 = new THREE.Vector3();
  const n = new THREE.Vector3();
  const dieAt = new THREE.Vector3();
  let lastStep = -1;
  let lastRevealed = -1;

  function frame(p) {
    // 1-2: the die. Orientation is a pure function of p: slerp between consecutive roll targets,
    // plus a whole number of turns about a tumble axis (which is the identity at both ends).
    const steps = span(p, T.stepsFrom, T.stepsTo) * STEPS;
    let stepNo = 0;
    let revealed = 0;
    let hop = 0;
    let drift = 0;
    if (steps <= 0) {
      const settle = 1 - ease(span(p, 0, T.stepsFrom));
      qDie.setFromAxisAngle(idleAxis, 0.55 * settle).multiply(targets[0]);
    } else {
      const i = Math.min(Math.floor(steps), STEPS - 1);
      const tau = span(steps - i, 0, 0.64);
      const e = ease(tau);
      qDie.slerpQuaternions(targets[i], targets[i + 1], e);
      qSpin.setFromAxisAngle(spinAxis[i + 1], Math.PI * 2 * (i % 4 === 3 ? 2 : 1) * e);
      qDie.premultiply(qSpin);
      hop = Math.abs(Math.sin(tau * Math.PI * 2)) * (1 - tau) * 0.55;
      drift = Math.sin(tau * Math.PI) * (i % 2 ? 1 : -1) * 0.12;
      stepNo = i + 1;
      revealed = i + (tau >= 0.88 ? 1 : 0);
    }
    if (stepNo !== lastStep || revealed !== lastRevealed) {
      lastStep = stepNo;
      lastRevealed = revealed;
      onStep(stepNo, revealed);
    }

    // 3: unfold. Faces peel off in value order along a curve that first lifts them off the solid.
    const fold = span(p, T.foldFrom, T.foldTo);
    const flat = ease(span(p, T.foldFrom + 0.02, T.foldTo));
    stage.setView({ flat });
    dieAt.set(die.x + drift * die.r, die.y + hop * die.r, 0);
    const lay = strip.layout;
    const px = dpr();

    faces.forEach((face, j) => {
      const mesh = meshes[j];
      const u = ease(span(fold, (j / 19) * 0.42, (j / 19) * 0.42 + 0.58));
      const scaleDie = face.circ * die.r;
      n.copy(face.normal).applyQuaternion(qDie);
      p0.copy(face.centroid).multiplyScalar(die.r).applyQuaternion(qDie).add(dieAt);
      qFace.copy(qDie).multiply(face.q);
      const u_ = mesh.material.uniforms;
      if (u <= 0 || !lay) {
        mesh.position.copy(p0);
        mesh.quaternion.copy(qFace);
        mesh.scale.setScalar(scaleDie);
        u_.uPlain.value = 0;
        u_.uNumRot.value = 0;
        u_.uEdge.value = 1.25 * px;
        return;
      }
      const tri = lay.tris[j];
      p2.set(strip.x + tri.cx * strip.s, strip.y - tri.cy * strip.s, 0);
      p1.copy(p0).addScaledVector(n, die.r * 0.75);
      p1.z += die.r * 0.45;
      const a = (1 - u) * (1 - u);
      const b = 2 * u * (1 - u);
      const c = u * u;
      mesh.position.set(a * p0.x + b * p1.x + c * p2.x, a * p0.y + b * p1.y + c * p2.y, a * p0.z + b * p1.z + c * p2.z);
      qFlat.copy(tri.up ? new THREE.Quaternion() : qDown);
      mesh.quaternion.slerpQuaternions(qFace, qFlat, ease(span(u, 0.04, 0.92)));
      mesh.scale.setScalar(lerp(scaleDie, tri.rho * strip.s, u));
      u_.uPlain.value = u;
      u_.uNumRot.value = tri.up ? 0 : Math.PI * ease(span(u, 0.15, 0.95));
      u_.uEdge.value = lerp(1.25, 1.5, u) * px;
    });

    hull.position.copy(dieAt);
    hull.quaternion.copy(qDie);
    hull.scale.setScalar(die.r * (1 + 2.4 / (0.951 * die.r)));
    hullMat.opacity = 1 - span(fold, 0, 0.05);
    hull.visible = hullMat.opacity > 0;

    // 4: hand off to the SVG twin, then replay the run as tally marks.
    const landed = p >= T.handoff;
    group.visible = !landed;
    el.strip.style.opacity = landed ? 1 : 0;
    marks.forEach((m, k) => {
      if (m) m.style.opacity = span(p, 0.905 + k * 0.003, 0.908 + k * 0.003);
    });

    // DOM text
    const introOut = span(p, 0.62, 0.67);
    el.intro.style.opacity = 1 - introOut;
    el.intro.style.transform = `translateY(${(-24 * introOut).toFixed(1)}px)`;
    const hudIn = span(p, 0.05, 0.09) * (1 - span(p, 0.62, 0.66));
    el.hud.style.opacity = hudIn;
    // not hidden: its Roll control stays in the tab order at every p (d20.css shows it while focused)
    el.hud.style.pointerEvents = hudIn > 0.5 ? '' : 'none';
    el.end.style.visibility = p >= 0.86 ? 'visible' : 'hidden';
    el.endItems.forEach((item, k) => {
      const o = span(p, 0.92 + k * 0.016, 0.95 + k * 0.016);
      item.style.opacity = o;
      item.style.transform = `translateY(${(18 * (1 - o)).toFixed(1)}px)`;
    });
    return clamp(p);
  }

  return {
    frame,
    layout,
    setRolls,
    dispose() {
      stage.scene.remove(group);
      geo.dispose();
      hullGeo.dispose();
      hullMat.dispose();
      meshes.forEach((m) => m.material.dispose());
      atlas.dispose();
    },
  };
}
