import * as THREE from 'three';
import { clamp, ease, lerp, span } from '../../engine/timeline.js';
import { dockRect } from '../../engine/dock.js';
import { KRAFT, PAPER, drawInside, drawOutside } from './prints.js';

const TEX = 640;
// face order: 0 base, 1 east, 2 west, 3 north, 4 south, 5 lid. Centres in face units, flat net.
const CENTRES = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [2, 0]];
// which card each face becomes once the box is unpacked (the net is mirrored by the half turn)
const CARD_OF_FACE = [4, 3, 2, 1, 5, 0];
const LIGHT = new THREE.Vector3(0.3, 0.45, 0.84).normalize();

function canvasTexture(draw, index, theme) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = TEX;
  draw(canvas.getContext('2d'), TEX, index, theme);
  const make = (mirror) => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    if (mirror) {
      t.wrapS = THREE.RepeatWrapping;
      t.repeat.x = -1;
      t.offset.x = 1;
    }
    return t;
  };
  return { canvas, make };
}

export async function buildParcel(stage, root, theme = KRAFT) {
  await Promise.all([
    document.fonts.load('800 64px "Archivo Variable"'),
    document.fonts.load('400 20px "Cartograph CF"'),
    document.fonts.load('600 20px "Cartograph CF"'),
  ]);
  const frameEl = root.querySelector('.sticky');
  const cards = [...root.querySelectorAll('[data-card]')];
  const workEl = root.querySelector('[data-work]');
  const headEl = root.querySelector('[data-work-head]');
  const hintEl = root.querySelector('[data-hint]');
  const routeEl = root.querySelector('[data-route]');
  const routeItems = [...routeEl.children];

  const geo = new THREE.PlaneGeometry(1, 1);
  const pivot = new THREE.Group();
  const net = new THREE.Group();
  pivot.add(net);
  stage.scene.add(pivot);

  const faces = [];
  const hinges = [];
  const tiles = [];
  const disposables = [geo];

  CENTRES.forEach((_, face) => {
    const out = canvasTexture(drawOutside, face, theme);
    const inn = canvasTexture(drawInside, CARD_OF_FACE[face], theme);
    const front = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: out.make(false) }));
    const back = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: inn.make(true), side: THREE.BackSide }));
    const holder = new THREE.Group();
    holder.add(front, back);
    faces.push({ holder, front, back });
    const tile = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: inn.make(false) }));
    tile.visible = false;
    stage.scene.add(tile);
    tiles[face] = tile;
    cards[CARD_OF_FACE[face]].style.backgroundImage = `url(${inn.canvas.toDataURL('image/png')})`;
    disposables.push(front.material, front.material.map, back.material, back.material.map, tile.material, tile.material.map);
  });

  // hinges: [parent, hinge x, hinge y, face x, face y, axis, direction]; flaps fold away from the viewer
  net.add(faces[0].holder);
  const flap = (parent, face, hx, hy, fx, fy, axis, dir, late) => {
    const hinge = new THREE.Group();
    hinge.position.set(hx, hy, 0);
    faces[face].holder.position.set(fx, fy, 0);
    hinge.add(faces[face].holder);
    parent.add(hinge);
    hinges.push({ hinge, axis, dir, late });
    return hinge;
  };
  const east = flap(net, 1, 0.5, 0, 0.5, 0, 'y', 1, false);
  flap(net, 2, -0.5, 0, -0.5, 0, 'y', -1, false);
  flap(net, 3, 0, 0.5, 0, 0.5, 'x', -1, false);
  flap(net, 4, 0, -0.5, 0, -0.5, 'x', 1, false);
  flap(east, 5, 1, 0, 0.5, 0, 'y', 1, true);

  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const sc = shadowCanvas.getContext('2d');
  const grad = sc.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, `rgba(${theme.shadow},0.55)`);
  grad.addColorStop(1, `rgba(${theme.shadow},0)`);
  sc.fillStyle = grad;
  sc.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }),
  );
  stage.scene.add(shadow);
  disposables.push(shadow.material, shadow.material.map);

  let s = 100;
  let docks = [];
  function resize() {
    const { w, h } = stage.size();
    s = Math.min(h * 0.26, w * 0.22);
    docks = cards.map((card) => dockRect(card, frameEl));
  }
  resize();

  const q = new THREE.Quaternion();
  const n = new THREE.Vector3();
  const shade = (d) => clamp(0.5 + (0.5 * Math.max(d, 0)) / LIGHT.z, 0.5, 1.06);

  function frame(p) {
    const { w, h } = stage.size();
    const foldLin = span(p, 0.14, 0.42) * (1 - span(p, 0.66, 0.86));
    const persp = ease(span(p, 0.08, 0.3)) * (1 - ease(span(p, 0.7, 0.88)));
    const travel = span(p, 0.4, 0.68);
    const folded = ease(foldLin);
    stage.setView({ flat: 1 - persp, tilt: 0.8 * persp, yaw: 0.5 * persp });

    const flaps = ease(span(foldLin, 0, 0.75));
    const lid = ease(span(foldLin, 0.45, 1));
    for (const { hinge, axis, dir, late } of hinges) hinge.rotation[axis] = (dir * (late ? lid : flaps) * Math.PI) / 2;

    const py = -h * 0.02;
    pivot.position.set(Math.sin(travel * Math.PI) * w * 0.1, py, 0);
    pivot.rotation.y = ease(travel) * Math.PI;
    net.scale.setScalar(s);
    net.position.set(-0.5 * s * (1 - folded), 0, 0.5 * s * folded);

    pivot.updateMatrixWorld(true);
    for (const { front, back } of faces) {
      n.set(0, 0, 1).applyQuaternion(front.getWorldQuaternion(q));
      const d = n.dot(LIGHT);
      front.material.color.setScalar(shade(d));
      back.material.color.setScalar(shade(-d));
    }

    shadow.position.set(pivot.position.x + s * 0.1 * persp, py - s * 0.5 * persp, -s * 0.6);
    shadow.scale.setScalar(s * 2.5);
    shadow.material.opacity = 0.6 * folded * persp;

    // unpacked: the six faces leave the net and land on the six cards
    const slide = ease(span(p, 0.885, 0.975));
    const inTiles = p >= 0.88 && p < 0.985;
    const landed = p >= 0.985;
    pivot.visible = p < 0.88;
    tiles.forEach((tile, face) => {
      tile.visible = inTiles;
      if (!inTiles) return;
      const dock = docks[CARD_OF_FACE[face]];
      const k = ease(clamp(slide * 1.25 - CARD_OF_FACE[face] * 0.05));
      const fx = (0.5 - CENTRES[face][0]) * s;
      const fy = py + CENTRES[face][1] * s;
      tile.position.set(lerp(fx, dock.x, k), lerp(fy, dock.y, k), 0);
      tile.scale.setScalar(lerp(s, dock.w, k));
    });
    workEl.classList.toggle('is-in', landed);
    headEl.style.opacity = span(p, 0.9, 0.97);
    hintEl.style.opacity = 1 - span(p, 0.03, 0.1);
    routeEl.style.opacity = span(p, 0.36, 0.42) * (1 - span(p, 0.68, 0.74));
    const stop = Math.min(routeItems.length - 1, Math.floor(travel * routeItems.length));
    routeItems.forEach((item, i) => item.classList.toggle('is-on', i <= stop));
  }

  return {
    frame,
    resize,
    dispose() {
      stage.scene.remove(pivot, shadow, ...tiles);
      disposables.forEach((d) => d.dispose());
    },
  };
}

// The same film printed on white paper, for the home page.
export const buildParcelPaper = (stage, root) => buildParcel(stage, root, PAPER);
