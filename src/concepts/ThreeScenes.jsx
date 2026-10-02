import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import helvetiker from './helvetiker_bold.typeface.json';

const font = new FontLoader().parse(helvetiker);

function addLights(scene, variant) {
  scene.add(new THREE.AmbientLight(0xffffff, variant === 'sculpture' ? 2.2 : 1.6));
  const key = new THREE.DirectionalLight(0xffffff, variant === 'kinetic' ? 5 : 3);
  key.position.set(-5, 7, 8);
  if (variant === 'kinetic') {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    key.shadow.bias = -0.0005;
  }
  scene.add(key);
  const rim = new THREE.DirectionalLight(variant === 'sculpture' ? 0xffa66d : 0xff5f49, 3);
  rim.position.set(5, -3, 2);
  scene.add(rim);
  const blue = new THREE.DirectionalLight(0x4a78ff, 2);
  blue.position.set(4, 5, -4);
  scene.add(blue);
}

function makeEditorial(group) {
  const coral = new THREE.MeshStandardMaterial({ color: 0xff654b, metalness: 0.02, roughness: 0.55 });
  const orb = new THREE.Mesh(new THREE.SphereGeometry(2.35, 64, 48), coral);
  orb.position.set(1.0, 0.1, 0);
  group.add(orb);
  const arc = new THREE.Mesh(
    new THREE.TorusGeometry(3.03, 0.009, 8, 180, Math.PI * 1.25),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.82 }),
  );
  arc.rotation.set(0.25, -0.25, 0.3);
  arc.position.set(1.0, -0.08, 0.85);
  group.add(arc);
  return (time) => {
    orb.position.y = 0.1 + Math.sin(time * 0.7) * 0.12;
    arc.rotation.z = 0.3 + time * 0.13;
  };
}

function makeKinetic(group) {
  const face = new THREE.MeshStandardMaterial({ color: 0xfaf7ee, metalness: 0.07, roughness: 0.73 });
  const side = new THREE.MeshStandardMaterial({ color: 0x1646b4, metalness: 0.13, roughness: 0.52 });
  const coralSide = new THREE.MeshStandardMaterial({ color: 0xf35139, metalness: 0.09, roughness: 0.49 });
  const letters = [
    ['A', -1.68, 0.62, 0.08], ['G', 0.6, 0.85, -0.11],
    ['E', -2.15, -1.18, -0.12], ['N', -0.05, -1.15, 0.14], ['T', 2.0, -1.02, -0.08],
  ];
  const animatedLetters = [];
  letters.forEach(([character, x, y, angle], index) => {
    const geometry = new TextGeometry(character, {
      font, size: 2.38, depth: 0.54, curveSegments: 10,
      bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.025, bevelSegments: 3,
    });
    geometry.computeBoundingBox();
    const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    geometry.translate(-width / 2, -1.1, 0);
    const mesh = new THREE.Mesh(geometry, [face, index === 1 || index === 3 ? coralSide : side]);
    mesh.position.set(x, y, index % 2 ? -0.28 : 0.15);
    mesh.rotation.y = angle - 0.18;
    mesh.rotation.z = index % 2 ? 0.08 : -0.035;
    mesh.castShadow = true;
    group.add(mesh);
    animatedLetters.push({ mesh, y, angle: mesh.rotation.z, index });
  });
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(13, 6),
    new THREE.ShadowMaterial({ opacity: 0.23 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -2.08, 0);
  floor.receiveShadow = true;
  group.add(floor);
  group.scale.setScalar(1.35);
  group.position.x = 0.85;
  group.rotation.set(-0.09, -0.17, -0.04);
  return (time) => {
    animatedLetters.forEach(({ mesh, y, angle, index }) => {
      const progress = THREE.MathUtils.clamp((time - index * 0.13) / 1.05, 0, 1);
      const settle = 1 - Math.pow(1 - progress, 3);
      mesh.position.y = y + (1 - settle) * 1.15 + Math.sin(time * 1.15 + index * 0.9) * 0.065 * settle;
      mesh.rotation.z = angle + (1 - settle) * (index % 2 ? 0.17 : -0.17);
    });
  };
}

function makeSculpture(group) {
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xdce9ff, metalness: 0.1, roughness: 0.12, clearcoat: 1,
    clearcoatRoughness: 0.05, transparent: true, opacity: 0.58,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const warmGlass = glass.clone();
  warmGlass.color.set(0xffc79f);
  const rings = [
    { rot: [0.58, 0.2, -0.28], material: glass, radius: 2.1 },
    { rot: [-0.48, 0.55, 0.45], material: warmGlass, radius: 2.3 },
    { rot: [0.22, -0.76, 0.22], material: glass, radius: 1.88 },
  ];
  const animatedRings = [];
  rings.forEach(({ rot, material, radius }) => {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.31, 28, 168), material);
    mesh.rotation.set(...rot);
    group.add(mesh);
    animatedRings.push({ mesh, rot });
  });
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 64, 48),
    new THREE.MeshPhysicalMaterial({ color: 0x0634bd, metalness: 0.32, roughness: 0.13, clearcoat: 1 }),
  );
  group.add(core);
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(2.9, 0.009, 8, 128),
    new THREE.MeshBasicMaterial({ color: 0x1f55de, transparent: true, opacity: 0.7 }),
  );
  orbit.rotation.set(0.85, 0.3, 0.25);
  group.add(orbit);
  for (const [x, y, z] of [[-2.8, 0.1, 0.8], [2.5, 1.1, -0.6], [0.4, -2.7, 0.9]]) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0x1746cf }),
    );
    dot.position.set(x, y, z);
    group.add(dot);
  }
  return (time) => {
    animatedRings.forEach(({ mesh, rot }, index) => {
      mesh.rotation.x = rot[0] + Math.sin(time * 0.35 + index) * 0.11;
      mesh.rotation.y = rot[1] + time * (index % 2 ? -0.12 : 0.1);
      mesh.rotation.z = rot[2] + Math.sin(time * 0.42 + index * 1.2) * 0.1;
    });
    core.position.y = Math.sin(time * 0.9) * 0.13;
    orbit.rotation.z = 0.25 + time * 0.08;
  };
}

export default function ThreeScene({ variant, className = '' }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      host.dataset.webgl = 'unavailable';
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = variant === 'kinetic' ? 1.7 : 1.25;
    renderer.shadowMap.enabled = variant === 'kinetic';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = variant === 'kinetic' ? 11.3 : 9.2;
    addLights(scene, variant);
    const group = new THREE.Group();
    scene.add(group);
    const updateScene = variant === 'editorial' ? makeEditorial(group)
      : variant === 'kinetic' ? makeKinetic(group) : makeSculpture(group);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      camera.position.z = variant === 'kinetic' && width < 500 ? 12 : variant === 'kinetic' ? 11.3 : 9.2;
      if (variant === 'kinetic') group.position.x = width < 500 ? 0.15 : 0.85;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let targetX = group.rotation.x;
    let targetY = group.rotation.y;
    const pointerDown = (event) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      host.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event) => {
      if (dragging) {
        targetY += (event.clientX - lastX) * 0.004;
        targetX += (event.clientY - lastY) * 0.003;
        lastX = event.clientX;
        lastY = event.clientY;
      } else if (!reduceMotion.matches) {
        const rect = host.getBoundingClientRect();
        targetY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.35;
        targetX = ((event.clientY - rect.top) / rect.height - 0.5) * 0.19;
      }
      if (reduceMotion.matches) {
        group.rotation.x = targetX;
        group.rotation.y = targetY;
        renderer.render(scene, camera);
      }
    };
    const pointerUp = () => { dragging = false; };
    host.addEventListener('pointerdown', pointerDown);
    host.addEventListener('pointermove', pointerMove);
    host.addEventListener('pointerup', pointerUp);
    host.addEventListener('pointercancel', pointerUp);

    let visible = true;
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    visibilityObserver.observe(host);
    let frame;
    let elapsed = 0;
    let lastFrame = 0;
    const animate = (now = 0) => {
      frame = requestAnimationFrame(animate);
      if (!visible || reduceMotion.matches) {
        lastFrame = 0;
        return;
      }
      elapsed += lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0;
      lastFrame = now;
      updateScene(elapsed);
      group.rotation.x += (targetX - group.rotation.x) * 0.04;
      const idleTurn = dragging ? 0 : Math.sin(elapsed * 0.55) * (variant === 'kinetic' ? 0.06 : 0.035);
      group.rotation.y += (targetY + idleTurn - group.rotation.y) * 0.04;
      renderer.render(scene, camera);
    };
    resize();
    animate();

    return () => {
      cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      host.removeEventListener('pointerdown', pointerDown);
      host.removeEventListener('pointermove', pointerMove);
      host.removeEventListener('pointerup', pointerUp);
      host.removeEventListener('pointercancel', pointerUp);
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material?.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [variant]);

  return <div ref={hostRef} className={`concept-three ${className}`} role="img" aria-label="Interactive 3D research sculpture; drag to rotate" />;
}
