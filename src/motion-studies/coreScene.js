import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const CORE_DURATION = 18;
const TAU = Math.PI * 2;
const smooth = (a, b, value) => {
  const t = THREE.MathUtils.clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function studioEnvironment(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#171411';
  ctx.fillRect(0, 0, 1024, 512);
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#54545a');
  gradient.addColorStop(.4, '#151516');
  gradient.addColorStop(1, '#100904');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = '#fff8e9';
  ctx.fillRect(125, 80, 95, 310);
  ctx.fillStyle = '#929aa9';
  ctx.fillRect(690, 30, 190, 145);
  ctx.fillStyle = '#ff951c';
  ctx.fillRect(470, 210, 32, 260);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(50, 20, 730, 14);
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromEquirectangular(texture);
  texture.dispose();
  pmrem.dispose();
  return target;
}

function arcGeometry(inner, outer, start, length, depth) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, start, start + length, false);
  shape.lineTo(Math.cos(start + length) * inner, Math.sin(start + length) * inner);
  shape.absarc(0, 0, inner, start + length, start, true);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelSegments: 3, steps: 1,
    bevelSize: .022, bevelThickness: .022, curveSegments: 20,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

export function createCoreScene(canvas, { onFrame } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x080907, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene();
  const environment = studioEnvironment(renderer);
  scene.environment = environment.texture;
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
  const rig = new THREE.Group();
  scene.add(rig);
  scene.add(new THREE.HemisphereLight(0xd8e2f0, 0x6b2b05, 1.5));
  const key = new THREE.DirectionalLight(0xfff6e8, 5);
  key.position.set(-4, 6, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8dabe3, 3.6);
  rim.position.set(4, 3, -4);
  scene.add(rim);
  const warm = new THREE.PointLight(0xff7008, 30, 12, 2);
  warm.position.set(0, -.3, 1);
  rig.add(warm);
  const materials = {
    metal: new THREE.MeshStandardMaterial({ color: 0x767575, metalness: 1, roughness: .24, envMapIntensity: 1.65 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x171a1c, metalness: .88, roughness: .3, envMapIntensity: 1.1 }),
    ceramic: new THREE.MeshStandardMaterial({ color: 0xbfc0bb, metalness: .92, roughness: .19, envMapIntensity: 1.7 }),
    amber: new THREE.MeshPhysicalMaterial({ color: 0xf89b12, metalness: .72, roughness: .18, clearcoat: 1, emissive: 0xff7200, emissiveIntensity: .15, envMapIntensity: 1.3 }),
    light: new THREE.MeshStandardMaterial({ color: 0xffb443, emissive: 0xff770d, emissiveIntensity: 3, toneMapped: false }),
  };
  const ringGroups = [];
  const movingSectors = [];
  const boltGeometry = new THREE.CylinderGeometry(.037, .037, .023, 6);
  boltGeometry.rotateX(Math.PI / 2);

  // Each layer is a real assembly: split machined plates, edge lighting and face fasteners.
  [
    { r: 1.07, w: .18, z: .52, sectors: 6, depth: .2 },
    { r: 1.46, w: .23, z: .1, sectors: 8, depth: .23 },
    { r: 1.88, w: .19, z: -.31, sectors: 10, depth: .22 },
  ].forEach((spec, ringIndex) => {
    const group = new THREE.Group();
    group.position.z = spec.z;
    rig.add(group);
    ringGroups.push({ group, spec, index: ringIndex });
    for (let index = 0; index < spec.sectors; index += 1) {
      const sector = new THREE.Group();
      const angle = index / spec.sectors * TAU;
      const gap = .045;
      const plate = new THREE.Mesh(arcGeometry(spec.r - spec.w / 2, spec.r + spec.w / 2, angle + gap, TAU / spec.sectors - gap * 2, spec.depth), ringIndex === 1 ? materials.dark : materials.metal);
      sector.add(plate);
      const edging = new THREE.Mesh(new THREE.TorusGeometry(spec.r - spec.w / 2 - .025, .019, 6, 36, TAU / spec.sectors - .12), materials.light);
      edging.rotation.z = angle + .06;
      edging.position.z = spec.depth * .35;
      sector.add(edging);
      for (const offset of [.13, TAU / spec.sectors - .13]) {
        const bolt = new THREE.Mesh(boltGeometry, materials.ceramic);
        bolt.position.set(Math.cos(angle + offset) * spec.r, Math.sin(angle + offset) * spec.r, spec.depth / 2 + .017);
        sector.add(bolt);
      }
      group.add(sector);
      movingSectors.push({ sector, angle: angle + Math.PI / spec.sectors, ringIndex });
    }
  });

  const rotor = new THREE.Group();
  rig.add(rotor);
  const fins = [];
  const finGeometry = new RoundedBoxGeometry(.055, .32, .47, 2, .025);
  for (let index = 0; index < 48; index += 1) {
    const angle = index / 48 * TAU;
    const geometry = finGeometry.clone();
    geometry.rotateZ(angle - .35);
    geometry.translate(-Math.sin(angle) * .76, Math.cos(angle) * .76, 0);
    fins.push(geometry);
  }
  rotor.add(new THREE.Mesh(mergeGeometries(fins), materials.ceramic));
  fins.forEach((geometry) => geometry.dispose());
  finGeometry.dispose();
  rotor.add(new THREE.Mesh(new THREE.TorusGeometry(.62, .046, 10, 80), materials.light));
  const lens = new THREE.Mesh(new THREE.SphereGeometry(.51, 48, 32), materials.amber);
  lens.scale.z = .58;
  lens.position.z = .15;
  rotor.add(lens);
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(.315, 40, 24), materials.dark);
  pupil.scale.z = .42;
  pupil.position.z = .405;
  rotor.add(pupil);
  const lensRing = new THREE.Mesh(new THREE.TorusGeometry(.33, .015, 8, 80), materials.light);
  lensRing.position.z = .4;
  rotor.add(lensRing);

  const orbitals = [];
  for (let index = 0; index < 3; index += 1) {
    const orbital = new THREE.Group();
    const line = new THREE.Mesh(new THREE.TorusGeometry(2.15 + index * .12, .006, 4, 160), materials.amber);
    orbital.add(line);
    const satellite = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8), materials.light);
    satellite.position.x = 2.15 + index * .12;
    orbital.add(satellite);
    rig.add(orbital);
    orbitals.push(orbital);
  }

  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(360 * 3);
  for (let index = 0; index < 360; index += 1) {
    const theta = index * 2.399963;
    const r = 2.6 + ((index * 17) % 100) / 45;
    dustPositions[index * 3] = Math.cos(theta) * r;
    dustPositions[index * 3 + 1] = Math.sin(theta) * r * .8;
    dustPositions[index * 3 + 2] = Math.sin(index * 9.24) * 2;
  }
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({ color: 0xe0ad65, size: .012, transparent: true, opacity: .34, depthWrite: false });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  let width = 1;
  let height = 1;
  let elapsed = 0;
  let pointer = { x: 0, y: 0 };
  let disposed = false;
  let captureMode = false;
  let previousPixelRatio = renderer.getPixelRatio();
  function resize(forcedWidth, forcedHeight) {
    if (captureMode) return;
    width = forcedWidth || canvas.clientWidth || 1;
    height = forcedHeight || canvas.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 760 ? Math.max(12.5, 5.4 / (camera.aspect * 2 * Math.tan(THREE.MathUtils.degToRad(18)))) : 10.4;
    camera.updateProjectionMatrix();
    renderAt(elapsed);
  }

  function renderAt(seconds, { capture = captureMode } = {}) {
    if (disposed) return;
    elapsed = ((seconds % CORE_DURATION) + CORE_DURATION) % CORE_DURATION;
    const time = elapsed;
    const cycle = time / CORE_DURATION * TAU;
    const opening = smooth(0, 3.8, time) * (1 - smooth(7.2, 12, time));
    const orbit = smooth(2, 6, time) * (1 - smooth(7.6, 12.4, time));
    const activation = smooth(11.8, 13, time) * (1 - smooth(15.5, 17.9, time));
    const px = capture ? 0 : pointer.x;
    const py = capture ? 0 : pointer.y;
    rig.rotation.set(.2 + Math.sin(cycle) * .12 + py * .08, -.38 + Math.sin(cycle) * .23 + px * .12, -.12 + Math.sin(cycle) * .06);
    const worldHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(18));
    rig.position.x = capture ? 0 : width > 760 ? worldHeight * camera.aspect * .185 : 0;
    rig.position.y = capture ? 0 : width > 760 ? .08 : -.45;
    rig.scale.setScalar(1 + activation * .035);
    ringGroups.forEach(({ group, spec, index }) => {
      group.position.z = spec.z + (index - 1) * opening * 1.38;
      group.rotation.x = orbit * [.76, -.54, .33][index];
      group.rotation.y = orbit * [-.5, .7, -.45][index];
      group.rotation.z = Math.sin(cycle) * (index % 2 ? -.25 : .3) + orbit * (index + 1) * .22;
    });
    movingSectors.forEach(({ sector, angle, ringIndex }) => {
      const travel = opening * (.24 + ringIndex * .08);
      sector.position.set(Math.cos(angle) * travel, Math.sin(angle) * travel, Math.sin(angle * 3 + cycle) * opening * .13);
      sector.rotation.z = Math.sin(cycle) * opening * .025;
    });
    rotor.rotation.z = cycle;
    rotor.position.z = .1 + opening * .25;
    rotor.rotation.y = orbit * -.2;
    orbitals.forEach((orbital, index) => {
      orbital.rotation.set(.55 + index * .7 + Math.sin(cycle) * .16, -.8 + index * .65, cycle * (index % 2 ? -1 : 1) + index);
      orbital.scale.setScalar(.91 + opening * .12);
    });
    materials.light.emissiveIntensity = 2.1 + activation * (2 + Math.sin(time * 5) * .5);
    materials.amber.emissiveIntensity = .1 + activation * .28;
    warm.intensity = 24 + activation * 24;
    dust.rotation.z = Math.sin(cycle) * .05;
    dust.position.x = rig.position.x;
    renderer.render(scene, camera);
    canvas.dataset.time = time.toFixed(3);
    canvas.dataset.phase = time < 4.5 ? 'Separate' : time < 9 ? 'Connect' : time < 13.5 ? 'Assemble' : 'Activate';
    onFrame?.(time);
  }

  function beginCapture(captureWidth = 1280, captureHeight = 800) {
    if (!captureMode) previousPixelRatio = renderer.getPixelRatio();
    captureMode = true;
    width = captureWidth;
    height = captureHeight;
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x080907, 1);
    camera.aspect = width / height;
    camera.position.z = 10.4;
    camera.updateProjectionMatrix();
  }
  function captureFrame(seconds) {
    if (!captureMode) beginCapture();
    renderAt(seconds);
    return canvas.toDataURL('image/png');
  }
  function endCapture() {
    captureMode = false;
    renderer.setPixelRatio(previousPixelRatio);
    renderer.setClearColor(0x080907, 0);
    resize();
  }

  resize();
  return {
    renderAt, resize, beginCapture, captureFrame, endCapture,
    setPointer(x, y) { pointer = { x, y }; },
    capture(seconds, captureWidth = 1280, captureHeight = 800) {
      beginCapture(captureWidth, captureHeight);
      const frame = captureFrame(seconds);
      endCapture();
      return frame;
    },
    dispose() {
      disposed = true;
      scene.traverse((node) => { if (node.geometry) node.geometry.dispose(); });
      Object.values(materials).forEach((material) => material.dispose());
      dustMaterial.dispose();
      environment.dispose();
      renderer.dispose();
    },
  };
}
