import * as THREE from 'three';

const K_PERSP = Math.tan(THREE.MathUtils.degToRad(35 / 2));
const K_FLAT = Math.tan(THREE.MathUtils.degToRad(0.6 / 2)); // effectively orthographic

// World units are CSS pixels and the page is the plane z = 0. The camera distance always maps
// that plane 1:1 to the screen, so removing perspective never moves anything lying on the page.
export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const dir = new THREE.Vector3();
  const size = { w: 1, h: 1 };

  function resize() {
    // the canvas fills its film's pinned viewport; measure that box, not the window
    const box = canvas.parentElement;
    size.w = box?.clientWidth || window.innerWidth;
    size.h = box?.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size.w, size.h, false);
    camera.aspect = size.w / size.h;
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

  resize();
  setView({ flat: 1 });
  return { renderer, scene, camera, size: () => size, resize, setView, render: () => renderer.render(scene, camera) };
}
