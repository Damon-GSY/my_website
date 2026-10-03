/*! @license
MIT License

Copyright (c) 2026 Meng To

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Camera rail adapted from ThreeUI / public/landing-pages/kage.html (4033–4107).
 * https://github.com/MengTo/threeui/tree/68802d5428071ada5c20db8094b1649e6bb770ed
 * Copyright (c) 2026 Meng To. MIT; full notice: docs/licenses/threeui-MIT.txt.
 * Architecture, research exhibits, textures and React integration are original.
 */

const clamp = THREE.MathUtils.clamp;
const CAMERA_STOPS = [
  { position: [10, 5.6, 16], target: [-2.5, 2.1, -1.5], fov: 37 },
  { position: [1.7, 3.2, 8], target: [-5.3, 2.1, -1.4], fov: 41 },
  { position: [6.6, 3.8, 5.6], target: [-2.9, 2.5, -4.1], fov: 41 },
  { position: [11.4, 3.4, 6.1], target: [.1, 2.35, -1.6], fov: 42 },
  { position: [10, 6.6, 17.5], target: [-2.2, 2.4, -2], fov: 38 },
];

function makeCanvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function stoneTexture() {
  let seed = 194;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  return makeCanvasTexture(512, 512, (ctx, width, height) => {
    ctx.fillStyle = '#bcb6a0'; ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 18000; i++) {
      const alpha = random() * .1;
      ctx.fillStyle = `rgba(${random() > .5 ? '255,249,226' : '42,44,32'},${alpha})`;
      ctx.fillRect(random() * width, random() * height, random() * 3 + .3, random() * 2 + .3);
    }
    for (let i = 0; i < 35; i++) {
      ctx.strokeStyle = `rgba(64,65,44,${random() * .045})`;
      ctx.lineWidth = random() * 4;
      ctx.beginPath();
      const y = random() * height;
      ctx.moveTo(0, y); ctx.bezierCurveTo(180, y - 15, 360, y + 15, 512, y + 6); ctx.stroke();
    }
  });
}

function printExhibit(index) {
  return makeCanvasTexture(768, 1024, (ctx, width, height) => {
    const palettes = ['#ded8bb', '#c3c9bd', '#d8c3a9'];
    ctx.fillStyle = palettes[index]; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#283c37'; ctx.font = '18px monospace';
    ctx.fillText(`DG — FIELD STUDY 0${index + 1}`, 58, 66);
    ctx.strokeStyle = '#45574855'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(58, 88); ctx.lineTo(710, 88); ctx.stroke();
    ctx.fillStyle = '#293f37'; ctx.font = '66px Georgia';
    const titles = [['Plan.', 'Act.', 'Learn.'], ['The right', 'tool.', 'The right', 'moment.'], ['Make the', 'invisible', 'measurable.']][index];
    titles.forEach((word, line) => ctx.fillText(word, 58, 190 + line * 75));
    const baseY = index === 1 ? 550 : 470;
    ctx.strokeStyle = '#617462'; ctx.lineWidth = 2;
    if (index === 0) {
      const nodes = [[100, baseY], [384, baseY], [668, baseY], [384, baseY + 190]];
      nodes.forEach(([x, y], i) => {
        if (i < 2) { ctx.beginPath(); ctx.moveTo(x + 35, y); ctx.lineTo(nodes[i + 1][0] - 35, y); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(x, y, 33, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#435b4b';ctx.font = '22px monospace';ctx.textAlign = 'center';ctx.fillText(`0${i + 1}`, x, y + 7);
      });
      ctx.beginPath();ctx.moveTo(384, baseY + 33);ctx.lineTo(384, baseY + 157);ctx.stroke();
      ctx.font = '16px monospace';ctx.fillText('REASON → EXECUTE → EVALUATE', 384, baseY + 285);
    } else if (index === 1) {
      for (let y = 0; y < 3; y++) for (let x = 0; x < 7; x++) {
        const size = x === 3 && y === 1 ? 15 : 5;
        ctx.fillStyle = x === 3 && y === 1 ? '#aa6243' : '#627467';
        ctx.beginPath();ctx.arc(105 + x * 93, baseY + y * 68, size, 0, Math.PI * 2);ctx.fill();
        if (x < 6) {ctx.beginPath();ctx.moveTo(120 + x * 93, baseY + y * 68);ctx.lineTo(185 + x * 93, baseY + y * 68);ctx.stroke();}
      }
      ctx.fillStyle = '#435b4b';ctx.font = '16px monospace';ctx.textAlign = 'center';ctx.fillText('SELECT · RESOLVE · USE', 384, baseY + 230);
    } else {
      for (let i = 0; i < 7; i++) {
        const barHeight = 40 + (i * 37 % 150);
        ctx.fillStyle = i === 5 ? '#ac6449' : '#526854';
        ctx.fillRect(75 + i * 92, baseY + 235 - barHeight, 46, barHeight);
      }
      ctx.beginPath();ctx.moveTo(58, baseY + 247);ctx.lineTo(710, baseY + 247);ctx.stroke();
      ctx.fillStyle = '#435b4b';ctx.font = '16px monospace';ctx.textAlign = 'center';ctx.fillText('PLANNING / MEMORY / TOOL USE', 384, baseY + 290);
    }
    ctx.textAlign = 'left';ctx.fillStyle = '#435b4b';ctx.font = '17px monospace';
    ctx.fillText('RESEARCH → REAL-WORLD SYSTEMS', 58, height - 65);
    ctx.font = '13px monospace';ctx.fillText('DAMON GUO-SIYI / ALIBABA / HANGZHOU', 58, height - 36);
  });
}

function archGeometry(width, height, depth, thickness) {
  const radius = width * .5;
  const spring = height - radius;
  const shape = new THREE.Shape();
  shape.moveTo(-radius, 0); shape.lineTo(-radius, spring);
  shape.absarc(0, spring, radius, Math.PI, 0, true);
  shape.lineTo(radius, 0); shape.lineTo(radius - thickness, 0);
  shape.lineTo(radius - thickness, spring);
  shape.absarc(0, spring, radius - thickness, 0, Math.PI, false);
  shape.lineTo(-radius + thickness, 0); shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .018, bevelThickness: .018, curveSegments: 48 });
}

export function createObservatory(canvas, host, callbacks) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor('#283731');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 680 ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#283731');
  scene.fog = new THREE.FogExp2('#283731', .012);
  const camera = new THREE.PerspectiveCamera(37, 1, .1, 90);
  const environmentGenerator = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = environmentGenerator.fromScene(room, .05);
  room.dispose(); environmentGenerator.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = .24;

  const stone = stoneTexture();
  stone.wrapS = stone.wrapT = THREE.RepeatWrapping;
  stone.repeat.set(2, 2);
  const stoneMaterial = new THREE.MeshStandardMaterial({ map: stone, color: '#e2ded0', roughness: .92, metalness: .02, bumpMap: stone, bumpScale: .035 });
  const edgeMaterial = new THREE.MeshStandardMaterial({ color: '#515b4a', roughness: .78, metalness: .22 });
  const brass = new THREE.MeshStandardMaterial({ color: '#b9a775', metalness: .76, roughness: .36 });
  const ink = new THREE.MeshStandardMaterial({ color: '#243a32', roughness: .6, metalness: .3 });

  const mesh = (geometry, material, position, parent = scene) => {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(...position); item.castShadow = true; item.receiveShadow = true; parent.add(item);return item;
  };
  const box = (width, height, depth, material, position, parent) => mesh(new THREE.BoxGeometry(width, height, depth), material, position, parent);

  // Cut stone rings turn the archive into a place, with a low stepped approach.
  const floor = mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: '#405047', roughness: .88 }), [0, -.14, 0]);
  floor.rotation.x = -Math.PI / 2;
  for (let step = 0; step < 3; step++) {
    mesh(new THREE.CylinderGeometry(9 - step * .35, 9 - step * .35, .17, 96), step === 2 ? stoneMaterial : edgeMaterial, [0, step * .17 - .01, -2.1]);
  }
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 20) {
    const seam = box(7.9, .007, .009, edgeMaterial, [Math.cos(angle) * 3.95, .423, -2.1 + Math.sin(angle) * 3.95]);
    seam.rotation.y = -angle;
  }

  // A sequence of carved barrel-vault frames catches the raking evening light.
  const archGeo = archGeometry(11.8, 8.2, .38, .32);
  for (let index = 0; index < 8; index++) {
    const arch = mesh(archGeo, stoneMaterial, [0, .43, -5.9 - index * .72]);
    arch.scale.setScalar(1 - index * .021);
  }
  box(12, .38, 7, stoneMaterial, [0, .23, -8.6]);
  const rearWall = mesh(archGeometry(10.2, 7.2, .24, 1.35), edgeMaterial, [0, .42, -11.9]);
  rearWall.receiveShadow = true;

  // Vertical bronze screens make the camera travel legible through occlusion.
  for (let side = -1; side <= 1; side += 2) {
    for (let index = 0; index < 28; index++) {
      const angle = (side === -1 ? Math.PI * .70 : -.18) + index * .022;
      const x = Math.cos(angle) * 7.8;
      const z = Math.sin(angle) * -7.8 - 1.8;
      const fin = box(.09, 4.8, .24, index % 5 === 0 ? brass : edgeMaterial, [x, 2.83, z]);
      fin.rotation.y = -angle;
    }
  }

  const exhibits = [];
  [[-3.4, -1.2, .1], [0, -4.2, -.08], [3.8, -1.4, -.30]].forEach(([x, z, angle], index) => {
    const exhibit = new THREE.Group();
    exhibit.position.set(x, .43, z);exhibit.rotation.y = angle;scene.add(exhibit);
    box(2.75, .16, 1.52, edgeMaterial, [0, .08, 0], exhibit);
    box(2.47, .13, 1.27, stoneMaterial, [0, .22, -.04], exhibit);
    const documentRig = new THREE.Group();
    documentRig.position.set(0, 2.18, 0);documentRig.rotation.x = -.035;exhibit.add(documentRig);
    box(2.32, 3.22, .105, ink, [0, 0, -.015], documentRig);
    const pageMaterial = new THREE.MeshPhysicalMaterial({ map: printExhibit(index), roughness: .86, metalness: .015, sheen: .3, sheenColor: new THREE.Color('#ebe3bf'), side: THREE.DoubleSide });
    mesh(new THREE.PlaneGeometry(2.16, 3.03), pageMaterial, [0, 0, .044], documentRig);
    // Printed archive leaves sit behind the front sheet at real, separate depths.
    for (let leaf = 1; leaf < 4; leaf++) {
      const page = box(2.25, 3.12, .022, stoneMaterial, [.07 * leaf, .02 * leaf, -.14 * leaf], documentRig);
      page.rotation.y = leaf * -.037;
    }
    [-1.16, 1.16].forEach((sideX) => box(.023, 3.25, .025, brass, [sideX, 0, .047], documentRig));
    box(2.34, .023, .025, brass, [0, 1.62, .047], documentRig);
    box(2.34, .023, .025, brass, [0, -1.62, .047], documentRig);
    // A small hooded reading light, built into each exhibit frame.
    [-.88, .88].forEach((sideX) => {
      box(.038, 4.32, .038, brass, [sideX, 2.25, -.2], exhibit);
      box(.038, .038, .53, brass, [sideX, 4.41, .05], exhibit);
    });
    box(2.06, .075, .19, ink, [0, 4.42, .24], exhibit);
    box(1.87, .01, .09, new THREE.MeshBasicMaterial({ color: '#f6deaa' }), [0, 4.374, .24], exhibit);
    const lamp = new THREE.PointLight('#ffe2a4', 3.5, 5.8, 2);lamp.position.set(0, 3.55, 1.1);exhibit.add(lamp);
    const labelMap = makeCanvasTexture(512, 128, (ctx) => {
      ctx.fillStyle = '#b8b098';ctx.fillRect(0, 0, 512, 128);ctx.fillStyle = '#273e33';ctx.font = '20px monospace';ctx.fillText(`0${index + 1}  /  ${['EXECUTION', 'TOOL USE', 'EVALUATION'][index]}`, 34, 57);ctx.font = '12px monospace';ctx.fillText('DAMON GUO-SIYI  —  RESEARCH ARCHIVE', 34, 86);
    });
    const label = mesh(new THREE.PlaneGeometry(1.66, .415), new THREE.MeshStandardMaterial({ map: labelMap, roughness: .8 }), [0, .51, .59], exhibit);label.rotation.x = -.33;
    exhibits.push(documentRig);
  });

  // A polished botanical mobile beyond the exhibits gives the vault a focal point.
  const mobile = new THREE.Group();mobile.position.set(0, 5.9, -7.3);scene.add(mobile);
  for (let blade = 0; blade < 5; blade++) {
    const points = [];
    for (let step = 0; step <= 64; step++) {
      const angle = step / 64 * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * (1.1 + blade * .04), Math.sin(angle) * .19, Math.sin(angle) * (1.1 + blade * .04)));
    }
    const shape = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), 80, .025, 6, true);
    const ring = mesh(shape, brass, [0, 0, 0], mobile);ring.rotation.set(blade * .56, blade * .27, blade * .43);
  }
  box(.01, 1.6, .01, brass, [0, 7.28, -7.3]);

  scene.add(new THREE.HemisphereLight('#e2e4ce', '#172a25', .7));
  const sun = new THREE.DirectionalLight('#fff0cc', 2.8);sun.position.set(-6, 14, 9);sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);sun.shadow.camera.left = -15;sun.shadow.camera.right = 15;sun.shadow.camera.top = 15;sun.shadow.camera.bottom = -15;sun.shadow.normalBias = .035;sun.shadow.bias = -.00015;scene.add(sun);
  const rim = new THREE.DirectionalLight('#c9ded0', 1.15);rim.position.set(10, 5, -8);scene.add(rim);
  const archLight = new THREE.PointLight('#e4c483', 32, 15, 2);archLight.position.set(0, 5, -9);scene.add(archLight);

  // The chapter camera is derived from ThreeUI's Kage camera rig. Separate
  // position/target rails preserve composed views while the viewer scrolls.
  const positionRail = new THREE.CatmullRomCurve3(CAMERA_STOPS.map((stop) => new THREE.Vector3(...stop.position)), false, 'catmullrom', .42);
  const targetRail = new THREE.CatmullRomCurve3(CAMERA_STOPS.map((stop) => new THREE.Vector3(...stop.target)), false, 'catmullrom', .42);
  const position = new THREE.Vector3();const target = new THREE.Vector3();const direction = new THREE.Vector3();
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = media.matches, paused = false, destroyed = false, visible = true, frame = 0, lastTime = 0, elapsed = 0, ready = false, compiling = true;
  let progress = 0, smoothProgress = 0, pointerX = 0, pointerY = 0, targetPointerX = 0, targetPointerY = 0;
  let anchors = [];
  const chapterElements = [...host.querySelectorAll('[data-ob-chapter]')];

  function measure() {
    const height = window.innerHeight;
    anchors = chapterElements.map((element) => element.getBoundingClientRect().top + window.scrollY);
    renderer.setSize(window.innerWidth, height, false);
    camera.aspect = window.innerWidth / height;camera.updateProjectionMatrix();
    updateProgress();requestFrame();
  }

  function updateProgress() {
    const y = window.scrollY;
    progress = 0;
    for (let index = 0; index < anchors.length - 1; index++) {
      if (y >= anchors[index]) progress = index + clamp((y - anchors[index]) / Math.max(anchors[index + 1] - anchors[index], 1), 0, 1);
    }
  }

  function applyCamera() {
    const u = clamp(smoothProgress / 4, 0, 1);
    positionRail.getPoint(u, position);targetRail.getPoint(u, target);
    const index = clamp(Math.floor(smoothProgress), 0, 3);const fraction = clamp(smoothProgress - index, 0, 1);
    let fov = THREE.MathUtils.lerp(CAMERA_STOPS[index].fov, CAMERA_STOPS[index + 1].fov, fraction);
    const narrow = clamp((1.5 - camera.aspect) / 1.05, 0, 1);
    direction.subVectors(position, target).normalize();position.addScaledVector(direction, narrow * 5);
    const heroFraming = 1 - clamp(smoothProgress, 0, 1);
    position.y += narrow * 3.4;target.y += narrow * (1.9 + heroFraming * 1.6);fov *= 1 + narrow * .20;
    if (!reduced && !paused) {position.x += pointerX * .74;position.y += pointerY * .34;target.x -= pointerX * .24;target.y -= pointerY * .13;}
    camera.position.copy(position);camera.lookAt(target);
    if (Math.abs(camera.fov - fov) > .0001) {camera.fov = fov;camera.updateProjectionMatrix();}
  }

  function render(now) {
    frame = 0;
    if (destroyed || document.hidden || !visible || compiling) return;
    // Keep compositing and input responsive on integrated/software renderers.
    if (!reduced && !paused && lastTime && now - lastTime < 1000 / 30) {requestFrame();return;}
    const delta = lastTime ? Math.min((now - lastTime) / 1000, .05) : .016;
    lastTime = now;
    const damping = 1 - Math.exp(-delta * 5.4);
    smoothProgress = reduced || paused ? progress : THREE.MathUtils.lerp(smoothProgress, progress, damping);
    pointerX += (targetPointerX - pointerX) * damping;pointerY += (targetPointerY - pointerY) * damping;
    if (!reduced && !paused) {
      elapsed += delta;mobile.rotation.y = Math.sin(elapsed * .12) * .17;
      exhibits.forEach((exhibit, index) => {exhibit.rotation.y = Math.sin(elapsed * .22 + index) * .014;});
    }
    applyCamera();renderer.render(scene, camera);
    if (!ready) {ready = true;callbacks.onReady();}
    if ((!reduced && !paused) || Math.abs(smoothProgress - progress) > .0005) requestFrame();
  }

  function requestFrame() {if (!frame && !destroyed && !document.hidden && visible) frame = requestAnimationFrame(render);}
  function onScroll() {updateProgress();requestFrame();}
  function onPointer(event) {
    if (event.pointerType === 'touch' && event.buttons === 0) return;
    targetPointerX = (event.clientX / window.innerWidth - .5) * 2;
    targetPointerY = (.5 - event.clientY / window.innerHeight) * 2;requestFrame();
  }
  function resetPointer() {targetPointerX = targetPointerY = 0;requestFrame();}
  function onVisibility() {lastTime = 0;if (document.hidden) {cancelAnimationFrame(frame);frame = 0;}else requestFrame();}
  function onReduce(event) {reduced = event.matches;requestFrame();}
  function onLost(event) {event.preventDefault();callbacks.onError();cancelAnimationFrame(frame);frame = 0;}
  function onRestored() {ready = false;renderer.shadowMap.needsUpdate = true;requestFrame();}
  const observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting;lastTime = 0;if (visible) requestFrame();else {cancelAnimationFrame(frame);frame = 0;}}, { threshold: 0 });
  observer.observe(host);
  const resizeObserver = new ResizeObserver(measure);resizeObserver.observe(host);
  window.addEventListener('scroll', onScroll, { passive: true });window.addEventListener('resize', measure);
  host.addEventListener('pointermove', onPointer, { passive: true });host.addEventListener('pointerleave', resetPointer);
  document.addEventListener('visibilitychange', onVisibility);media.addEventListener('change', onReduce);
  canvas.addEventListener('webglcontextlost', onLost);canvas.addEventListener('webglcontextrestored', onRestored);
  // These architectural shadows are static. Reusing the map avoids a full
  // second render of every arch on every pointer or scroll frame.
  renderer.shadowMap.autoUpdate = false;renderer.shadowMap.needsUpdate = true;
  measure();smoothProgress = progress;applyCamera();
  renderer.compileAsync(scene, camera).then(() => {
    if (destroyed) return;
    compiling = false;requestFrame();
  }).catch(() => {if (!destroyed) callbacks.onError();});

  return {
    syncScroll() {updateProgress();requestFrame();},
    setPaused(value) {paused = value;requestFrame();},
    dispose() {
      destroyed = true;cancelAnimationFrame(frame);observer.disconnect();resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);window.removeEventListener('resize', measure);host.removeEventListener('pointermove', onPointer);host.removeEventListener('pointerleave', resetPointer);
      document.removeEventListener('visibilitychange', onVisibility);media.removeEventListener('change', onReduce);canvas.removeEventListener('webglcontextlost', onLost);canvas.removeEventListener('webglcontextrestored', onRestored);
      const geometries = new Set();const materials = new Set();const textures = new Set();
      scene.traverse((item) => {if (item.geometry) geometries.add(item.geometry);if (item.material) (Array.isArray(item.material) ? item.material : [item.material]).forEach((material) => materials.add(material));});
      materials.forEach((material) => {Object.values(material).forEach((value) => {if (value?.isTexture) textures.add(value);});material.dispose();});
      textures.forEach((texture) => texture.dispose());geometries.forEach((geometry) => geometry.dispose());environment.dispose();renderer.dispose();
    },
  };
}
