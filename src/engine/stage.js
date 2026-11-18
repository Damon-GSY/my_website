import * as THREE from 'three';

const K_PERSP = Math.tan(THREE.MathUtils.degToRad(35 / 2));
const K_FLAT = Math.tan(THREE.MathUtils.degToRad(0.6 / 2)); // effectively orthographic

// World units are CSS pixels and the page is the plane z = 0. The camera distance always maps
// that plane 1:1 to the screen, so removing perspective never moves anything lying on the page.
//
// The renderer can sleep (src/engine/gl.js: one live context per page): `sleep()` disposes it, loses
// its context and swaps the canvas for a fresh blank copy (a lost canvas cannot get a new context);
// `wake()` makes a new renderer on that canvas. The scene, camera and everything the film built stay,
// so a woken stage draws exactly the frame it would have drawn. While asleep `render()` does nothing.
// `{ asleep: true }` starts it without a renderer (the film is built first, then woken by the page).
export function createStage(canvas, { asleep = false } = {}) {
  let el = canvas;
  let renderer = null;
  let used = false;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const dir = new THREE.Vector3();
  const size = { w: 1, h: 1 };
  const dpr = () => Math.min(window.devicePixelRatio, 2);

  function apply() {
    if (!renderer) return;
    renderer.setPixelRatio(dpr());
    renderer.setSize(size.w, size.h, false);
  }

  // the canvas fills its film's pinned viewport; measure that box (or take the caller's), not the window
  function resize(w, h) {
    const box = el.parentElement;
    size.w = w ?? (box?.clientWidth || window.innerWidth);
    size.h = h ?? (box?.clientHeight || window.innerHeight);
    camera.aspect = size.w / size.h;
    apply();
  }

  // flat: 0 = perspective, 1 = orthographic. tilt and yaw (radians) orbit the page plane.
  function setView({ flat = 0, tilt = 0, yaw = 0 } = {}) {
    const k = THREE.MathUtils.lerp(K_PERSP, K_FLAT, flat);
    const dist = size.h / 2 / k;
    dir.set(Math.sin(yaw) * Math.cos(tilt), -Math.sin(tilt), Math.cos(yaw) * Math.cos(tilt));
    camera.position.copy(dir).multiplyScalar(dist);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(k));
    camera.near = dist * 0.2;
    camera.far = dist * 4;
    camera.updateProjectionMatrix();
  }

  // throws where no context can be made (the caller falls back to its static version)
  function wake() {
    if (renderer) return;
    if (used) {
      const fresh = el.cloneNode(false);
      el.replaceWith(fresh);
      el = fresh;
    }
    used = true;
    renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    apply();
  }

  function sleep() {
    if (!renderer) return;
    const old = renderer;
    renderer = null;
    old.dispose();
    old.forceContextLoss();
    // drop the lost canvas now: a blank, context-free copy holds its place (and is what wakes next)
    const fresh = el.cloneNode(false);
    el.replaceWith(fresh);
    el = fresh;
    used = false;
  }

  resize();
  setView({ flat: 1 });
  if (!asleep) wake();
  return {
    scene,
    camera,
    get renderer() {
      return renderer;
    },
    canvas: () => el,
    awake: () => Boolean(renderer),
    dpr,
    size: () => size,
    resize,
    setView,
    wake,
    sleep,
    render: () => renderer?.render(scene, camera),
    dispose: () => {
      if (!renderer) return;
      renderer.dispose();
      renderer = null;
    },
  };
}
