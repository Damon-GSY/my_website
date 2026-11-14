import * as THREE from 'three';

export const STEPS = 20;
export const P_STEP = 0.95;

// --- the run ----------------------------------------------------------------------------------

export function newSeed() {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0];
}

// ?seed=3fa9c2e1 reproduces a run (handy for sharing and for checking); otherwise a fresh one.
export function initialSeed() {
  try {
    const hex = new URLSearchParams(window.location.search).get('seed');
    if (hex && /^[0-9a-f]{1,8}$/i.test(hex)) return parseInt(hex, 16) >>> 0;
  } catch {
    /* no location */
  }
  return newSeed();
}

export const seedLabel = (seed) => (seed >>> 0).toString(16).padStart(8, '0');

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Twenty independent rolls, uniform on 1..20, from a crypto-sampled seed.
export function rollsFromSeed(seed) {
  const rnd = mulberry32(seed);
  return Array.from({ length: STEPS }, () => 1 + Math.floor(rnd() * 20));
}

export const failSteps = (rolls, upTo = STEPS) =>
  rolls.slice(0, upTo).flatMap((v, i) => (v === 1 ? [i + 1] : []));

export const pct = (k) => `${(Math.pow(P_STEP, k) * 100).toFixed(1)}%`;

// --- the solid --------------------------------------------------------------------------------

// Pair heads; each opposite face gets 21 - v, like a real d20.
const HEADS = [20, 8, 14, 2, 17, 11, 5, 15, 3, 12];

// 20 faces of a unit icosahedron. Each face has a local frame: origin at its centroid, z along the
// outward normal, y toward one vertex (the numeral's "up"). `q` maps that frame into the die.
export function buildFaces() {
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const pos = geo.attributes.position;
  const faces = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  for (let f = 0; f < 20; f++) {
    a.fromBufferAttribute(pos, f * 3);
    b.fromBufferAttribute(pos, f * 3 + 1);
    c.fromBufferAttribute(pos, f * 3 + 2);
    const centroid = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3);
    const normal = centroid.clone().normalize();
    const y = a.clone().sub(centroid).normalize();
    const x = new THREE.Vector3().crossVectors(y, normal);
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, normal));
    faces.push({ centroid, normal, q, circ: a.distanceTo(centroid), value: 0 });
  }
  geo.dispose();
  let h = 0;
  for (const face of faces) {
    if (face.value) continue;
    const opp = faces.find((o) => o !== face && !o.value && o.normal.dot(face.normal) < -0.999);
    face.value = HEADS[h];
    opp.value = 21 - HEADS[h];
    h++;
  }
  return faces.sort((p, q) => p.value - q.value); // faces[v - 1] has value v
}
