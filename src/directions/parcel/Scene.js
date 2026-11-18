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

function canvasTexture(draw, index, theme, opts) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = TEX;
  draw(canvas.getContext('2d'), TEX, index, theme, opts);
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

export async function buildParcel(stage, root, theme = KRAFT, opts = {}) {
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
    const out = canvasTexture(drawOutside, face, theme, { noSticker: Boolean(opts.mark) });
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

  // Home page: the sticker is the travelling mark (src/engine/mark.js). It is a mesh of its own on the
  // east face, shown only while the page's mark is docked on it (the DOM dot hides at the same pixel).
  // It peels off as the carton starts to fold, waits, marks each stop of the route, then lands on the
  // first card. `markEl` is the dock the page's mark follows, placed here in frame pixels.
  const markEl = opts.mark ? root.querySelector('[data-mark="work"]') : null;
  const PEEL = 0.08;
  let sticker = null;
  let markOn = false;
  let lastP = 0;
  const onDock = (e) => {
    markOn = e.detail;
    sticker.visible = markOn && lastP < PEEL;
    stage.render();
  };
  if (markEl) {
    const sGeo = new THREE.CircleGeometry(62 / TEX, 48);
    const sMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(theme.sticker), polygonOffset: true, polygonOffsetFactor: -2 });
    sticker = new THREE.Mesh(sGeo, sMat);
    sticker.position.set(0.5 - 106 / TEX, -(0.5 - 106 / TEX), 0.002); // the printed sticker's centre
    sticker.visible = false;
    faces[1].holder.add(sticker);
    disposables.push(sGeo, sMat);
    markEl.addEventListener('markdock', onDock);
  }

  let s = 100;
  let docks = [];
  let stops = [];
  let cardDot = { x: 0, y: 0 };
  function resize() {
    const { w, h } = stage.size();
    s = Math.min(h * 0.26, w * 0.22);
    docks = cards.map((card) => dockRect(card, frameEl));
    if (markEl) {
      const f = frameEl.getBoundingClientRect();
      stops = routeItems.map((li) => {
        const r = li.getBoundingClientRect();
        return { x: Math.max(6, r.left - f.left - 12), y: r.top - f.top + r.height / 2 };
      });
      const c = cards[0].getBoundingClientRect();
      const inset = Math.max(10, c.width * 0.09);
      cardDot = { x: c.right - f.left - inset, y: c.top - f.top + inset };
    }
  }
  resize();

  const q = new THREE.Quaternion();
  const n = new THREE.Vector3();
  const shade = (d) => clamp(0.5 + (0.5 * Math.max(d, 0)) / LIGHT.z, 0.5, 1.06);

  function frame(pIn) {
    const p = opts.warp ? opts.warp(pIn) : pIn;
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
    headEl.style.opacity = span(p, ...(opts.headIn || [0.9, 0.97]));
    hintEl.style.opacity = 1 - span(p, 0.03, 0.1);
    routeEl.style.opacity = span(p, 0.36, 0.42) * (1 - span(p, 0.68, 0.74));
    const stop = Math.min(routeItems.length - 1, Math.floor(travel * routeItems.length));
    routeItems.forEach((item, i) => item.classList.toggle('is-on', i <= stop));
    if (markEl) placeMark(p, w, h, travel);
  }

  function placeMark(p, w, h, travel) {
    lastP = p;
    // where the printed sticker sits while the carton is still flat (frame px, y down)
    const st = { x: w / 2 + (0.5 + 0.5 - 106 / TEX) * s, y: h / 2 + h * 0.02 + (0.5 - 106 / TEX) * s, d: (124 / TEX) * s };
    const n = stops.length;
    const along = (a, b, k, d0, d1) => {
      const e = ease(k);
      const bow = Math.sin(Math.PI * e) * Math.min(120, Math.hypot(b.x - a.x, b.y - a.y) * 0.2);
      return { x: lerp(a.x, b.x, e) + bow, y: lerp(a.y, b.y, e) - bow, d: lerp(d0, d1, e) };
    };
    let m;
    if (p < 0.28 || !n) m = st;
    else if (p < 0.4) m = along(st, stops[0], span(p, 0.28, 0.4), st.d, 9);
    else if (p < 0.72) {
      const i = clamp(travel * n - 0.5, 0, n - 1);
      const a = stops[Math.floor(i)];
      const b = stops[Math.ceil(i)];
      const k = ease(i - Math.floor(i));
      m = { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), d: 9 };
    } else m = along(stops[n - 1], cardDot, span(p, 0.72, 0.97), 9, 14);
    markEl.style.transform = `translate(${(m.x - m.d / 2).toFixed(2)}px, ${(m.y - m.d / 2).toFixed(2)}px)`;
    markEl.style.width = markEl.style.height = `${m.d.toFixed(2)}px`;
    markEl.dataset.markVis = p < PEEL ? '0' : '1';
    sticker.visible = markOn && p < PEEL;
    markEl.dispatchEvent(new Event('markmove', { bubbles: true }));
  }

  return {
    frame,
    resize,
    dispose() {
      markEl?.removeEventListener('markdock', onDock);
      stage.scene.remove(pivot, shadow, ...tiles);
      disposables.forEach((d) => d.dispose());
    },
  };
}

// The same film printed on white paper, for the home page.
export const buildParcelPaper = (stage, root) => buildParcel(stage, root, PAPER);
// ... and with the sticker handed over to the page's travelling mark, on the home page's own clock.
// The home film (finish pass, 2026-11-18) is shorter than /parcel and spends it differently: the carton
// starts to fold 0.16 screens after it pins (not 0.7), the unfold to the flat net takes half a screen
// (not a whole one), and "Selected work · 06 / Unpacked." comes up as the box opens, so the grey net
// reads as the box being unpacked rather than as an empty stretch. [home p, scene p] keys, piecewise
// linear; the scene's own timings (and so /parcel) are untouched.
const HOME_KEYS = [
  [0, 0],
  [0.04, 0.14],
  [0.7, 0.68],
  [0.82, 0.885],
  [1, 1],
];
const piecewise = (keys, a, b) => (x) => {
  for (let i = 1; i < keys.length; i++) {
    const [x0, x1] = [keys[i - 1][a], keys[i][a]];
    if (x <= x1 || i === keys.length - 1) return lerp(keys[i - 1][b], keys[i][b], clamp((x - x0) / (x1 - x0)));
  }
  return x;
};
export const homeWarp = piecewise(HOME_KEYS, 0, 1);
export const homeUnwarp = piecewise(HOME_KEYS, 1, 0);
export const buildParcelHome = (stage, root) =>
  buildParcel(stage, root, PAPER, { mark: true, warp: homeWarp, headIn: [0.72, 0.84] });
