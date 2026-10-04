import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;
const smooth = (v) => { const t = clamp(v, 0, 1); return t * t * (3 - 2 * t); };

function makeEnvironment(renderer) {
  const plate = document.createElement('canvas');
  plate.width = 1024;
  plate.height = 512;
  const ctx = plate.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#bdd3fc');
  gradient.addColorStop(.45, '#647dad');
  gradient.addColorStop(.51, '#273b6a');
  gradient.addColorStop(1, '#203763');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = '#fff9e8';
  ctx.fillRect(135, 40, 115, 310);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(450, 55, 300, 36);
  ctx.fillStyle = '#9cb8ff';
  ctx.fillRect(800, 160, 65, 240);
  const map = new THREE.CanvasTexture(plate);
  map.colorSpace = THREE.SRGBColorSpace;
  map.mapping = THREE.EquirectangularReflectionMapping;
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromEquirectangular(map);
  map.dispose();
  generator.dispose();
  return target;
}

function makeLabel(text, foreground = '#122c6a', background = '#f6f5ed') {
  const plate = document.createElement('canvas');
  plate.width = 512;
  plate.height = 128;
  const ctx = plate.getContext('2d');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 512, 128);
  ctx.font = 'bold 64px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = foreground;
  ctx.fillText(text, 256, 69);
  const texture = new THREE.CanvasTexture(plate);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function roundedPlateGeometry(width, height, depth, radius) {
  const x = width / 2;
  const y = height / 2;
  const r = Math.min(radius, x, y);
  const shape = new THREE.Shape();
  shape.moveTo(-x + r, -y);
  shape.lineTo(x - r, -y);
  shape.quadraticCurveTo(x, -y, x, -y + r);
  shape.lineTo(x, y - r);
  shape.quadraticCurveTo(x, y, x - r, y);
  shape.lineTo(-x + r, y);
  shape.quadraticCurveTo(-x, y, -x, y - r);
  shape.lineTo(-x, -y + r);
  shape.quadraticCurveTo(-x, -y, -x + r, -y);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: Math.min(depth * .15, .018), bevelThickness: Math.min(depth * .15, .018), bevelSegments: 3, steps: 1, curveSegments: 18 });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function curvedVisorGeometry(width, height, radius) {
  const columns = 64;
  const rows = 36;
  const vertices = [];
  const indices = [];
  for (let row = 0; row <= rows; row++) {
    const y = (row / rows - .5) * height;
    const edge = Math.max(0, Math.abs(y) - (height / 2 - radius));
    const halfWidth = width / 2 - radius + Math.sqrt(Math.max(0, radius * radius - edge * edge));
    for (let col = 0; col <= columns; col++) {
      const x = (col / columns * 2 - 1) * halfWidth;
      const z = .12 + .18 * (1 - (x / (width / 2)) ** 2) + .03 * (1 - (y / (height / 2)) ** 2);
      vertices.push(x, y, z);
      if (row < rows && col < columns) {
        const a = row * (columns + 1) + col;
        const b = a + columns + 1;
        indices.push(a, a + 1, b + 1, a, b + 1, b);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** A self-contained, procedural character. Its timeline is controlled by the page. */
export function createRobotScene(canvas, { onReady, pixelRatio } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(pixelRatio == null ? Math.min(window.devicePixelRatio || 1, 1.75) : clamp(pixelRatio, .5, 2));
  renderer.setClearColor(0x0954ed, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene();
  const environment = makeEnvironment(renderer);
  scene.environment = environment.texture;
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
  camera.position.set(0, .1, 8.8);
  const rig = new THREE.Group();
  scene.add(rig);
  const head = new THREE.Group();
  head.position.y = .25;
  rig.add(head);
  const hemi = new THREE.HemisphereLight(0xeaf2ff, 0x183695, 2.4);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfffae8, 4.2);
  key.position.set(-4, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xabc9ff, 3.3);
  rim.position.set(5, 2, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 1.2);
  fill.position.set(-1, -3, 3);
  scene.add(fill);

  const mats = {
    ceramic: new THREE.MeshPhysicalMaterial({ color: 0xf9f8ef, metalness: .08, roughness: .25, clearcoat: .85, clearcoatRoughness: .24, envMapIntensity: .8 }),
    pearl: new THREE.MeshPhysicalMaterial({ color: 0xe3e8ea, metalness: .26, roughness: .25, clearcoat: 1 }),
    blue: new THREE.MeshPhysicalMaterial({ color: 0x123fe9, metalness: .42, roughness: .23, clearcoat: 1 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x101c30, metalness: .24, roughness: .48 }),
    visor: new THREE.MeshPhysicalMaterial({ color: 0x010912, metalness: .32, roughness: .12, clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: .28 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xd5e4f1, metalness: .95, roughness: .2, envMapIntensity: 1.35 }),
    orange: new THREE.MeshPhysicalMaterial({ color: 0xff6636, roughness: .29, metalness: .16, clearcoat: 1 }),
    amber: new THREE.MeshStandardMaterial({ color: 0xff9b21, metalness: .68, roughness: .27, emissive: 0xff4800, emissiveIntensity: .16 }),
    eye: new THREE.MeshBasicMaterial({ color: 0xd8ff68, toneMapped: false }),
    eyeBright: new THREE.MeshBasicMaterial({ color: 0xf0ffb9, toneMapped: false }),
    cyan: new THREE.MeshBasicMaterial({ color: 0x6eefff, toneMapped: false }),
    ink: new THREE.MeshStandardMaterial({ color: 0x123582, roughness: .45 }),
  };
  const parts = [];
  const disposableTextures = [];
  const mesh = (geometry, material, parent, x = 0, y = 0, z = 0) => {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(x, y, z);
    parent.add(item);
    return item;
  };
  const rounded = (w, h, d, r, material, parent, x = 0, y = 0, z = 0) => mesh(new RoundedBoxGeometry(w, h, d, Math.max(w, h, d) > 1 ? 4 : 2, r), material, parent, x, y, z);
  const cylinder = (radius, length, material, parent, x = 0, y = 0, z = 0) => {
    const item = mesh(new THREE.CylinderGeometry(radius, radius, length, 64), material, parent, x, y, z);
    item.rotation.x = Math.PI / 2;
    return item;
  };
  const movingPart = (x, y, z, offset, angle = [0, 0, 0]) => {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    head.add(group);
    parts.push({ group, home: group.position.clone(), offset: new THREE.Vector3(...offset), angle: new THREE.Vector3(...angle) });
    return group;
  };

  // Rounded ceramic panels surround a complete mechanical interior, rather than a flat face plate.
  const back = movingPart(0, 0, -.12, [0, .12, -.8], [0, -.15, 0]);
  const bowl = mesh(new THREE.SphereGeometry(1, 48, 28, Math.PI, Math.PI), mats.pearl, back);
  bowl.scale.set(1.32, 1.3, 1.03);
  const crown = movingPart(0, .97, 0, [0, 1.04, -.12], [-.18, 0, -.04]);
  const dome = mesh(new THREE.SphereGeometry(1, 64, 28, 0, TAU, 0, 1.10), mats.ceramic, crown, 0, -.97, 0);
  dome.scale.set(1.36, 1.35, 1.045);
  const crest = new THREE.CatmullRomCurve3(Array.from({ length: 18 }, (_, i) => {
    const theta = -.45 + i / 17 * 1.16;
    return new THREE.Vector3(0, Math.cos(theta) * 1.355 - .97, Math.sin(theta) * 1.052);
  }));
  mesh(new THREE.TubeGeometry(crest, 30, .033, 8, false), mats.rubber, crown);
  const crestLamp = new THREE.CatmullRomCurve3(Array.from({ length: 8 }, (_, i) => {
    const theta = .47 + i / 7 * .21;
    return new THREE.Vector3(0, Math.cos(theta) * 1.365 - .97, Math.sin(theta) * 1.063);
  }));
  mesh(new THREE.TubeGeometry(crestLamp, 12, .035, 8, false), mats.orange, crown);
  const chin = movingPart(0, -.97, .045, [0, -.64, .23], [.12, 0, 0]);
  rounded(2.47, .7, 1.81, .29, mats.ceramic, chin);
  rounded(1.02, .20, .08, .095, mats.rubber, chin, 0, -.075, .911);
  for (let i = 0; i < 7; i++) rounded(.07, .10, .025, .015, mats.chrome, chin, (i - 3) * .114, -.075, .96);
  rounded(.44, .032, .025, .012, mats.orange, chin, .77, .20, .876);
  const labelTexture = makeLabel('D / 01');
  disposableTextures.push(labelTexture);
  mesh(new THREE.PlaneGeometry(.53, .132), new THREE.MeshStandardMaterial({ map: labelTexture, roughness: .5 }), chin, -.74, .15, .9);

  [-1, 1].forEach((side) => {
    const cheek = movingPart(side * 1.12, -.25, .06, [side * .63, -.22, .05], [0, side * .18, side * -.14]);
    rounded(.39, 1.20, 1.63, .18, mats.ceramic, cheek);
    rounded(.07, .52, .025, .032, mats.blue, cheek, side * .06, -.11, .824);
    const ear = movingPart(side * 1.36, .05, -.09, [side * 1.05, .13, -.02], [0, side * .12, 0]);
    ear.rotation.y = 0;
    const earRig = new THREE.Group();
    earRig.rotation.y = side * Math.PI / 2;
    ear.add(earRig);
    cylinder(.65, .20, mats.rubber, earRig);
    cylinder(.57, .12, mats.chrome, earRig, 0, 0, .14);
    cylinder(.48, .10, mats.ceramic, earRig, 0, 0, .225);
    cylinder(.345, .08, mats.blue, earRig, 0, 0, .30);
    cylinder(.205, .08, mats.chrome, earRig, 0, 0, .345);
    cylinder(.147, .08, mats.orange, earRig, 0, 0, .395);
    for (let i = 0; i < 8; i++) {
      const angle = i / 8 * TAU;
      cylinder(.032, .022, mats.rubber, earRig, Math.cos(angle) * .435, Math.sin(angle) * .435, .288);
    }
    const band = mesh(new THREE.TorusGeometry(.555, .027, 8, 64), mats.blue, earRig, 0, 0, .19);
    band.rotation.z = .4;
  });

  const face = movingPart(0, .025, .94, [1.6, .12, .50], [-.06, 1.30, -.07]);
  const rimGeometry = roundedPlateGeometry(2.49, 1.51, .13, .50);
  mesh(rimGeometry, mats.rubber, face, 0, 0, .015);
  mesh(roundedPlateGeometry(2.37, 1.40, .12, .48), mats.visor, face, 0, 0, .055);
  mesh(curvedVisorGeometry(2.37, 1.40, .48), mats.visor, face, 0, 0, .02);
  // The eyes sit on the convex visor. Their capsules and reflections are actual geometry.
  const eyes = [];
  [-1, 1].forEach((side) => {
    const eye = new THREE.Group();
    eye.position.set(side * .52, .04, .343);
    eye.rotation.y = side * .10;
    face.add(eye);
    mesh(roundedPlateGeometry(.23, .46, .024, .114), mats.eye, eye);
    mesh(roundedPlateGeometry(.057, .28, .026, .028), mats.eyeBright, eye, -.035, .025, .01);
    eyes.push(eye);
  });
  const smileCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.19, -.32, .347), new THREE.Vector3(0, -.45, .365), new THREE.Vector3(.19, -.32, .347));
  const smile = mesh(new THREE.TubeGeometry(smileCurve, 20, .018, 6, false), mats.eye, face);
  rounded(.22, .026, .018, .012, mats.cyan, face, -.76, -.44, .292);
  for (let i = 0; i < 4; i++) rounded(.021, .045 + i * .015, .016, .009, mats.cyan, face, .65 + i * .048, -.42, .317 - i * .009);

  const antenna = movingPart(.94, 1.2, -.12, [.2, .95, -.12], [0, 0, -.15]);
  rounded(.16, .25, .24, .07, mats.chrome, antenna);
  rounded(.043, .44, .05, .02, mats.rubber, antenna, .005, .25, 0);
  const tip = mesh(new THREE.SphereGeometry(.11, 16, 12), mats.orange, antenna, .005, .49, 0);
  const tipLight = mesh(new THREE.SphereGeometry(.044, 12, 8), mats.eye, antenna, .005, .49, .091);

  // A gold processor, ceramic carrier, wiring, and an orbital energy kernel remain inside the shell.
  const brain = new THREE.Group();
  brain.position.z = -.2;
  head.add(brain);
  rounded(1.74, 1.47, .63, .18, mats.rubber, brain, 0, 0, -.09);
  rounded(1.40, 1.20, .10, .09, mats.blue, brain, 0, 0, .275);
  rounded(.83, .78, .20, .11, mats.amber, brain, 0, 0, .39);
  rounded(.59, .53, .07, .07, mats.orange, brain, 0, 0, .52);
  const core = mesh(new THREE.IcosahedronGeometry(.225, 1), mats.eye, brain, 0, 0, .59);
  const coreRings = [];
  for (let j = 0; j < 3; j++) {
    const ring = mesh(new THREE.TorusGeometry(.48 + j * .078, .014, 8, 56), j === 1 ? mats.chrome : mats.amber, brain, 0, 0, .56);
    ring.rotation.set(j * .55, j * .61, j * .5);
    coreRings.push(ring);
  }
  for (let i = 0; i < 8; i++) {
    const v = (i - 3.5) * .145;
    rounded(.047, .115, .026, .008, mats.chrome, brain, v, .54, .348);
    rounded(.047, .115, .026, .008, mats.chrome, brain, v, -.54, .348);
    rounded(.115, .047, .026, .008, mats.chrome, brain, -.65, v * .86, .348);
    rounded(.115, .047, .026, .008, mats.chrome, brain, .65, v * .86, .348);
  }
  [-1, 1].forEach((side) => {
    const cable = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * .65, -.35, .08), new THREE.Vector3(side * .97, -.1, .08),
      new THREE.Vector3(side * 1.02, .53, -.08), new THREE.Vector3(side * .61, .88, -.17),
    ]);
    mesh(new THREE.TubeGeometry(cable, 30, .044, 7, false), mats.orange, brain);
  });

  const torso = new THREE.Group();
  torso.position.y = -1.43;
  rig.add(torso);
  const neck = cylinder(.43, .43, mats.chrome, torso, 0, .04, -.13);
  neck.rotation.x = 0;
  for (let i = 0; i < 3; i++) {
    const ring = mesh(new THREE.TorusGeometry(.43, .047, 8, 48), i === 1 ? mats.orange : mats.rubber, torso, 0, -.065 + i * .13, -.13);
    ring.rotation.x = Math.PI / 2;
  }
  mesh(new THREE.CylinderGeometry(.75, .87, .34, 64), mats.ceramic, torso, 0, -.37, -.13);
  const collarLip = mesh(new THREE.TorusGeometry(.755, .06, 12, 64), mats.pearl, torso, 0, -.20, -.13);
  collarLip.rotation.x = Math.PI / 2;
  rounded(.40, .025, .035, .012, mats.rubber, torso, 0, -.37, .674);
  rounded(.08, .035, .038, .015, mats.orange, torso, .35, -.37, .619);

  let ready = false;
  let disposed = false;
  let previousGesture = 0;
  let gestureStarted = -100;
  let renderedFrames = 0;
  let currentExplosion = 0;
  let width = 1;
  let height = 1;
  let phase = 0;
  let helloStrength = 0;
  let blinkAmount = 1;
  let gazeX = 0;
  let gazeY = 0;

  function resize(explicitWidth, explicitHeight) {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Number.isFinite(explicitWidth) ? explicitWidth : rect.width);
    height = Math.max(1, Number.isFinite(explicitHeight) ? explicitHeight : rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const fullHeight = 4.92;
    const visibleHeight = Math.max(fullHeight, 4.25 / camera.aspect);
    camera.position.z = visibleHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.position.y = .10;
    camera.lookAt(0, -.08, 0);
    camera.updateProjectionMatrix();
  }

  function update({ time = 0, pointerX = 0, pointerY = 0, explosion = 0, paused = false, reduced = false, gesture = 0, entrance = true, greetingTime = null } = {}) {
    if (disposed) return;
    // The host supplies elapsed active time. A slow GPU must not slow the choreography.
    if (!paused && !reduced) {
      if (time < phase) gestureStarted = -100;
      phase = Math.max(0, time);
      gazeX = clamp(pointerX, -1, 1);
      gazeY = clamp(pointerY, -1, 1);
    }
    const localTime = phase;
    if (gesture !== previousGesture) {
      previousGesture = gesture;
      gestureStarted = localTime;
    }
    const helloTime = Number.isFinite(greetingTime) ? greetingTime : localTime - gestureStarted;
    const hello = !reduced && helloTime >= 0 && helloTime < 1.85 ? Math.sin(helloTime / 1.85 * Math.PI) : 0;
    helloStrength = hello;
    const boot = reduced || !entrance ? 0 : (1 - smooth(localTime / 1.25)) * .65;
    // The page already interpolates scroll progress; use that same pose for geometry and copy.
    currentExplosion = clamp(explosion, 0, 1);
    const spread = currentExplosion + boot;
    const inspectionScale = 1 - currentExplosion * .30;
    rig.scale.setScalar(inspectionScale);
    rig.position.y = reduced ? 0 : Math.sin(localTime * 1.05) * .052;
    const inspectionTurn = -.34 + currentExplosion * .14;
    const gazeStrength = 1 - currentExplosion * .76;
    rig.rotation.y = reduced ? inspectionTurn : inspectionTurn + gazeX * .38 * gazeStrength + Math.sin(localTime * .36) * .065 * gazeStrength;
    rig.rotation.x = reduced ? .035 : .035 + gazeY * .14 * gazeStrength;
    head.rotation.z = reduced ? -.04 : -.04 + Math.sin(localTime * .5) * .018 + hello * .14 * Math.sin(helloTime * 5);
    head.rotation.x = hello * Math.sin(helloTime * 7) * .12;
    for (const part of parts) {
      part.group.position.copy(part.home).addScaledVector(part.offset, spread);
      part.group.rotation.set(part.angle.x * spread, part.angle.y * spread, part.angle.z * spread);
    }
    torso.position.y = -1.43 - currentExplosion * .36;
    brain.position.set(-.20 * currentExplosion, .04 * currentExplosion, -.20 + .65 * currentExplosion);
    const blinkPhase = localTime % 4.7;
    const blink = !reduced && blinkPhase > 4.40 ? Math.max(.10, Math.abs((blinkPhase - 4.55) / .15)) : 1;
    blinkAmount = blink;
    eyes.forEach((eye, index) => {
      eye.scale.y = blink * (hello > .15 ? .74 + Math.sin(helloTime * 4 + index) * .10 : 1);
      eye.position.x = (index === 0 ? -.52 : .52) + (reduced ? 0 : gazeX * .075);
      eye.position.y = .04 - (reduced ? 0 : gazeY * .055);
    });
    smile.scale.y = 1 + hello * .65;
    core.rotation.set(localTime * .23, localTime * .35, localTime * .10);
    coreRings.forEach((ring, i) => {
      ring.rotation.x = i * .55 + localTime * (.12 + i * .045);
      ring.rotation.y = i * .61 + localTime * (.10 + i * .02);
    });
    tip.scale.setScalar(1 + hello * .10);
    tipLight.scale.setScalar(reduced ? 1 : .86 + Math.sin(localTime * 2.3) * .14);
    renderer.render(scene, camera);
    renderedFrames++;
    if (!ready) { ready = true; onReady?.(); }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    const geometries = new Set();
    const materials = new Set();
    scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => materials.add(material));
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    disposableTextures.forEach((texture) => texture.dispose());
    environment.dispose();
    renderer.dispose();
  }

  resize();
  return {
    resize,
    update,
    dispose,
    captureFrame: () => { renderer.render(scene, camera); return canvas.toDataURL('image/png'); },
    getMetrics: () => ({ renderedFrames, explosion: currentExplosion, meshes: renderer.info.render.calls, triangles: renderer.info.render.triangles, width, height, ready, phase, gesture: previousGesture, helloStrength, blinkAmount, eyes: eyes.map((eye) => ({ position: eye.position.toArray(), scaleY: eye.scale.y })), assemblyParts: parts.length, headRotation: head.rotation.toArray().slice(0, 3), modelRotation: rig.rotation.toArray().slice(0, 3) }),
  };
}
