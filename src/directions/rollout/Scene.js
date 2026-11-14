import * as THREE from 'three';
import { clamp, ease, lerp, span } from '../../engine/timeline.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { dockRect } from '../../engine/dock.js';

export const STEPS = 20;
export const P_STEP = 0.95;
const CHAPTERS = [5, 10, 15];

const BG = new THREE.Color('#0b0d0c');
const BONE = new THREE.Color('#e9e6dc');
const DEAD = new THREE.Color('#7b837d');
const LIVE = new THREE.Color('#ff5a1f');

function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One chosen path of 20 steps; at every step two alternatives branch off and die.
function growTree() {
  const rnd = mulberry32(11);
  const main = [new THREE.Vector3()];
  const verts = []; // { p: Vector3, d: depth, live, ty: tick offset once flat }
  const add = (a, b) => verts.push(a, b);
  for (let d = 0; d < STEPS; d++) {
    const here = main[d];
    const next = here.clone().add(new THREE.Vector3((rnd() - 0.5) * 240, (rnd() - 0.5) * 170, -330));
    main.push(next);
    add({ p: here, d, live: true, ty: 0 }, { p: next, d: d + 1, live: true, ty: 0 });
    for (let k = 0; k < 2; k++) {
      const sign = k ? 1 : -1;
      const dirn = new THREE.Vector3(sign * (150 + rnd() * 190), (rnd() - 0.5) * 330, -150 - rnd() * 130);
      const q1 = here.clone().add(dirn);
      const q2 = q1.clone().add(dirn.clone().multiplyScalar(0.7)).add(new THREE.Vector3(0, (rnd() - 0.5) * 140, -90));
      add({ p: here, d, live: false, ty: 0 }, { p: q1, d: d + 0.55, live: false, ty: sign * 11 });
      add({ p: q1, d: d + 0.55, live: false, ty: sign * 11 }, { p: q2, d: d + 1.1, live: false, ty: sign * 19 });
    }
  }
  return { main, verts };
}

export async function buildRollout(stage, root) {
  await document.fonts.ready;
  const $ = (sel) => root.querySelector(sel);
  const frameEl = $('.sticky');
  const heroEl = $('[data-hero]');
  const pctEl = $('[data-pct]');
  const stepEl = $('[data-step]');
  const expEl = $('[data-exp]');
  const traceEl = $('[data-trace]');
  const workEl = $('[data-work]');
  const labels = [...root.querySelectorAll('[data-chapter]')];

  const { main, verts } = growTree();
  const bodyEl = $('.r-body');
  // fat lines: the instanced buffers are written in place every frame
  const makeSet = (list, width) => {
    const geo = new LineSegmentsGeometry();
    geo.setPositions(new Float32Array(list.length * 3));
    geo.setColors(new Float32Array(list.length * 3));
    const obj = new LineSegments2(geo, new LineMaterial({ vertexColors: true, linewidth: width }));
    obj.frustumCulled = false;
    stage.scene.add(obj);
    return { list, obj, pos: geo.attributes.instanceStart.data, col: geo.attributes.instanceColorStart.data };
  };
  const sets = [makeSet(verts.filter((vert) => !vert.live), 1.1), makeSet(verts.filter((vert) => vert.live), 2.4)];

  const nodePos = new Float32Array(main.length * 3);
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
  const nodes = new THREE.Points(nodeGeo, new THREE.PointsMaterial({ color: BONE, size: 6, sizeAttenuation: false }));
  nodes.frustumCulled = false;
  stage.scene.add(nodes);

  const headGeo = new THREE.BufferGeometry();
  headGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
  const head = new THREE.Points(headGeo, new THREE.PointsMaterial({ color: LIVE, size: 12, sizeAttenuation: false }));
  head.frustumCulled = false;
  stage.scene.add(head);

  let T = { x: 0, y: 0, w: 100, h: 60 };
  const flatX = (d) => T.x - T.w / 2 + (d / STEPS) * T.w;

  function resize() {
    const { w, h } = stage.size();
    sets.forEach((set) => set.obj.material.resolution.set(w, h));
    T = dockRect(traceEl, frameEl);
    // the DOM twin of the collapsed tree, drawn from the same numbers
    const mid = T.h / 2;
    const sx = (d) => ((d / STEPS) * T.w).toFixed(1);
    let dead = '';
    for (let i = 0; i < verts.length; i += 2) {
      const a = verts[i];
      const b = verts[i + 1];
      if (a.live) continue;
      dead += `M${sx(a.d)},${(mid - a.ty).toFixed(1)}L${sx(b.d)},${(mid - b.ty).toFixed(1)}`;
    }
    let dots = '';
    for (let d = 0; d <= STEPS; d++) dots += `M${(Number(sx(d)) - 2.5).toFixed(1)},${mid - 2.5}h5v5h-5z`;
    traceEl.querySelector('[data-trace-dead]').setAttribute('d', dead);
    traceEl.querySelector('[data-trace-live]').setAttribute('d', `M0,${mid}H${T.w.toFixed(1)}`);
    traceEl.querySelector('[data-trace-dots]').setAttribute('d', dots);
    traceEl.querySelector('[data-trace-head]').setAttribute('transform', `translate(${T.w.toFixed(1)},${mid})`);
  }
  resize();

  const o = new THREE.Vector3();
  const v = new THREE.Vector3();
  const c = new THREE.Color();

  function frame(p) {
    const { w, h } = stage.size();
    const n = span(p, 0.08, 0.6) * STEPS;
    const collapse = ease(span(p, 0.62, 0.9));
    const landed = p >= 0.97;
    stage.setView({ flat: collapse, tilt: 0.16 * (1 - collapse), yaw: -0.24 * (1 - collapse) });

    const i = Math.min(Math.floor(n), STEPS - 1);
    o.lerpVectors(main[i], main[i + 1], n - i);
    const shift = w * 0.24 * (1 - collapse);
    const place = (vert, target, at) => {
      const x3 = vert.p.x - o.x + shift;
      const y3 = vert.p.y - o.y - h * 0.04;
      const z3 = vert.p.z - o.z;
      target[at] = lerp(x3, flatX(vert.d), collapse);
      target[at + 1] = lerp(y3, T.y + vert.ty, collapse);
      target[at + 2] = lerp(z3, 0, collapse);
      return z3;
    };

    for (const set of sets) {
      const P = set.pos.array;
      const C = set.col.array;
      set.list.forEach((vert, k) => {
        const z3 = place(vert, P, k * 3);
        const seen = Math.max(clamp((n + 6 - vert.d) / 3), collapse);
        const fog = lerp(clamp(1 + z3 / 3800), 1, collapse);
        if (vert.live) c.copy(vert.d <= n + 0.001 || collapse > 0.5 ? LIVE : BONE);
        else c.copy(DEAD);
        const passed = !vert.live && vert.d < n - 0.4 ? lerp(0.5, 1, collapse) : 1;
        c.lerpColors(BG, c, seen * fog * passed);
        C[k * 3] = c.r;
        C[k * 3 + 1] = c.g;
        C[k * 3 + 2] = c.b;
      });
      set.pos.needsUpdate = true;
      set.col.needsUpdate = true;
      set.obj.visible = !landed;
    }

    main.forEach((point, d) => place({ p: point, d, ty: 0 }, nodePos, d * 3));
    nodeGeo.attributes.position.needsUpdate = true;
    nodes.material.opacity = 1;
    place({ p: o, d: n, ty: 0 }, headGeo.attributes.position.array, 0);
    headGeo.attributes.position.needsUpdate = true;
    nodes.visible = head.visible = !landed;

    // the number is the headline: it falls and the type narrows with it
    const prob = Math.pow(P_STEP, n);
    pctEl.textContent = n < 0.02 ? '100%' : `${(prob * 100).toFixed(1)}%`;
    pctEl.style.fontVariationSettings = `"wght" 800, "wdth" ${(62 + 63 * prob).toFixed(1)}`;
    stepEl.textContent = String(Math.round(n)).padStart(2, '0');
    expEl.textContent = String(Math.round(n));
    heroEl.style.opacity = 1 - span(p, 0.86, 0.95);

    labels.forEach((label, k) => {
      const step = CHAPTERS[k];
      v.set(main[step].x - o.x + shift, main[step].y - o.y - h * 0.04, main[step].z - o.z).project(stage.camera);
      const near = clamp(1 - Math.abs(n - step + 1.6) / 2.6) * (1 - collapse * 4);
      label.style.opacity = v.z < 1 ? clamp(near) : 0;
      label.style.transform = `translate(${((v.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((0.5 - v.y * 0.5) * h).toFixed(1)}px)`;
    });

    workEl.classList.toggle('is-in', landed);
    bodyEl.style.opacity = span(p, 0.9, 0.97);
  }

  return {
    frame,
    resize,
    dispose() {
      const objs = [...sets.map((set) => set.obj), nodes, head];
      stage.scene.remove(...objs);
      objs.forEach((obj) => {
        obj.geometry.dispose();
        obj.material.dispose();
      });
    },
  };
}
