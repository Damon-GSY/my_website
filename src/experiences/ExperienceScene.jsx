import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const heroImages = {
  path: '/experience-assets/path-hero.webp',
  field: '/experience-assets/field-hero.webp',
  world: '/experience-assets/world-hero.webp',
};
const stageColors = [0xd9f94d, 0xfac379, 0x9eecff, 0xffffff];
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

function light(color, radius, opacity, parent) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 14, 10),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  );
  parent.add(mesh);
  return mesh;
}

function glowingRoute(points, color, parent, radius = 0.025) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 80, radius, 6, false),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  const glow = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 80, radius * 3.8, 6, false),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  parent.add(glow, tube);
  return curve;
}

function buildPath(parent, update) {
  const routes = [
    { color: 0xffd18a, points: [[-2.7, -4.3, 1], [-1.4, -2.4, 2.1], [0.9, -1.3, 0.6], [2.3, 0.6, 2.7], [0.7, 3.7, 0.7]] },
    { color: 0xd9f94d, points: [[-2.6, -4.2, 1.7], [-0.8, -2.8, 0.3], [1.4, -0.7, 2.9], [2.6, 1.6, 1.3], [1.0, 3.6, 2.2]] },
    { color: 0xffe5b4, points: [[-2.8, -4.1, 0], [-2.2, -1.6, 2.8], [0.5, -0.2, 1.2], [1.7, 2.1, 2.4], [0.6, 3.7, 0.1]] },
  ];
  const curves = routes.map(({ points, color }) => glowingRoute(points, color, parent));
  const traveler = light(stageColors[0], 0.12, 1, parent);
  const halo = light(stageColors[0], 0.36, 0.24, parent);
  const rings = [
    [-1.5, -2.5, 2], [1.3, -0.75, 3], [2.1, 1.55, 2.2], [0.7, 3.55, 1.5],
  ].map(([x, y, z], index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(index === 1 ? 0.4 : 0.25, 0.012, 6, 36),
      new THREE.MeshBasicMaterial({ color: stageColors[index], transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    );
    ring.position.set(x, y, z);
    parent.add(ring);
    return ring;
  });
  update.push((time, step) => {
    const point = curves[step % curves.length].getPointAt((time * 0.11 + step * 0.17) % 1);
    traveler.position.copy(point);
    halo.position.copy(point);
    halo.scale.setScalar(1 + Math.sin(time * 4.5) * 0.25);
    traveler.material.color.setHex(stageColors[step % stageColors.length]);
    halo.material.color.copy(traveler.material.color);
    rings.forEach((ring, index) => {
      ring.rotation.y = time * 0.28 + index * 0.45;
      ring.scale.setScalar(index === step ? 1.24 : 0.85);
    });
  });
}

function buildField(parent, update) {
  const cards = [];
  for (let index = 0; index < 4; index += 1) {
    const card = new THREE.Group();
    const width = 2.65;
    const height = 3.65;
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ color: index % 2 ? 0xb4caff : 0xffffff, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }),
    );
    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(panel.geometry),
      new THREE.LineBasicMaterial({ color: index % 2 ? 0x315bd5 : 0xff6548, transparent: true, opacity: 0.64 }),
    );
    card.add(panel, frame);
    for (let line = 0; line < 5; line += 1) {
      const rule = new THREE.Mesh(
        new THREE.PlaneGeometry(1.65 - line * 0.13, 0.013),
        new THREE.MeshBasicMaterial({ color: index % 2 ? 0x426ee0 : 0xf15942, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
      );
      rule.position.set(-0.3 + line * 0.04, 1.05 - line * 0.35, 0.02);
      card.add(rule);
    }
    card.position.set(-1.35 + index * 0.7, 0.2 - index * 0.29, index * 0.88);
    card.rotation.set(-0.08, -0.2 + index * 0.16, -0.25 + index * 0.11);
    parent.add(card);
    cards.push(card);
  }
  const glint = light(0xf45439, 0.13, 0.92, parent);
  const halo = light(0xf45439, 0.33, 0.18, parent);
  update.push((time, step) => {
    cards.forEach((card, index) => {
      card.rotation.y = -0.2 + index * 0.16 + Math.sin(time * 0.55 + index) * 0.08;
      card.position.y = 0.2 - index * 0.29 + Math.sin(time * 0.7 + index * 1.1) * 0.13;
      card.position.z = index * 0.88 + (index === step % 4 ? 0.35 : 0);
    });
    const target = cards[step % cards.length].position;
    glint.position.set(target.x + 1.1, target.y + 1.6, target.z + 0.15);
    halo.position.copy(glint.position);
    halo.scale.setScalar(1 + Math.sin(time * 4) * 0.2);
  });
}

function buildWorld(parent, update) {
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 0.13, 4.2),
    new THREE.MeshBasicMaterial({ color: 0xc5c9ff, transparent: true, opacity: 0.33, depthWrite: false }),
  );
  platform.rotation.x = -0.58;
  platform.position.set(0, -1.35, 0.6);
  parent.add(platform);
  const buildings = [
    [-2.2, -0.8, 0.65, 0.85], [-0.95, -0.05, 1.1, 1.25], [0.7, -0.35, 1.35, 0.78],
    [2.1, 0.35, 0.75, 1.3], [-1.65, 0.75, 0.62, 1.02], [1.4, 1.35, 1.05, 0.85],
  ];
  buildings.forEach(([x, y, height, depth], index) => {
    const geometry = new THREE.BoxGeometry(0.72, height, depth);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: index % 2 ? 0xe5e7ff : 0xaab8ff, transparent: true, opacity: 0.38, depthWrite: false }));
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: index % 2 ? 0x164bea : 0xff714a, transparent: true, opacity: 0.68 }));
    mesh.position.set(x, y, 1.1 + index * 0.11);
    edges.position.copy(mesh.position);
    parent.add(mesh, edges);
  });
  const paths = [
    [[-2.7, -2.3, 2.5], [-1.7, -1.2, 2.8], [-0.65, 0.15, 3], [0.8, 0.6, 2.9], [2.5, 1.6, 2.6]],
    [[-2.7, -2.3, 2.5], [-1.1, -1.6, 3.2], [0.2, -0.5, 3.1], [1.5, 0.45, 3.4], [2.5, 1.6, 2.6]],
    [[-2.7, -2.3, 2.5], [-1.8, -0.4, 2.7], [-0.4, 1.1, 3.5], [1.4, 0.9, 3.3], [2.5, 1.6, 2.6]],
  ].map((points, index) => glowingRoute(points, index === 1 ? 0xff7154 : 0x275fff, parent, 0.035));
  const travelers = paths.map((_, index) => ({
    dot: light(index === 1 ? 0xff6845 : 0x1a54ff, 0.13, 1, parent),
    halo: light(index === 1 ? 0xff6845 : 0x1a54ff, 0.4, 0.2, parent),
  }));
  update.push((time, step) => {
    travelers.forEach(({ dot, halo }, index) => {
      const point = paths[index].getPointAt((time * 0.13 + index * 0.24) % 1);
      dot.position.copy(point);
      halo.position.copy(point);
      dot.scale.setScalar(index === step ? 1.25 : 0.52);
      halo.material.opacity = index === step ? 0.31 : 0.06;
    });
  });
}

export default function ExperienceScene({ kind, activeStep = 0 }) {
  const hostRef = useRef(null);
  const stepRef = useRef(activeStep);
  const renderRef = useRef(null);

  useEffect(() => {
    stepRef.current = activeStep;
    renderRef.current?.();
  }, [activeStep]);

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.z = 14;
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    backdrop.position.z = -8;
    backdrop.renderOrder = -100;
    scene.add(backdrop);
    const depthGroup = new THREE.Group();
    scene.add(depthGroup);
    const updates = [];
    if (kind === 'path') buildPath(depthGroup, updates);
    if (kind === 'field') buildField(depthGroup, updates);
    if (kind === 'world') buildWorld(depthGroup, updates);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let texture;
    let alive = true;
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const viewHeight = 2 * (camera.position.z - backdrop.position.z) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      backdrop.scale.set(viewHeight * camera.aspect * 1.12, viewHeight * 1.12, 1);
      const small = camera.aspect < 0.85;
      if (texture) backdrop.material.opacity = small ? 0 : 1;
      depthGroup.scale.setScalar(small ? 0.56 : camera.aspect < 1.15 ? 0.78 : 1);
      depthGroup.userData.baseX = small ? 0 : 2.1;
      depthGroup.userData.baseY = small ? -1.55 : -0.1;
      if (texture?.image) {
        const imageAspect = texture.image.width / texture.image.height;
        if (imageAspect > camera.aspect) {
          texture.repeat.set(camera.aspect / imageAspect, 1);
          texture.offset.set((1 - texture.repeat.x) / 2, 0);
        } else {
          texture.repeat.set(1, imageAspect / camera.aspect);
          texture.offset.set(0, (1 - texture.repeat.y) / 2);
        }
        texture.needsUpdate = true;
      }
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    new THREE.TextureLoader().load(heroImages[kind], (loaded) => {
      if (!alive) { loaded.dispose(); return; }
      texture = loaded;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      backdrop.material.map = texture;
      backdrop.material.opacity = 1;
      backdrop.material.needsUpdate = true;
      resize();
      host.classList.add('is-ready');
    }, undefined, () => { host.dataset.webgl = 'asset-unavailable'; });

    let visible = true;
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    visibilityObserver.observe(host);
    const pointer = { x: 0, y: 0 };
    const move = (event) => {
      if (reducedMotion.matches) return;
      pointer.x = clamp((event.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      pointer.y = clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1);
    };
    const touch = (event) => { if (event.touches[0]) move(event.touches[0]); };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('touchmove', touch, { passive: true });
    let previous = 0;
    let elapsed = 0;
    let frame;
    const render = () => {
      updates.forEach((update) => update(elapsed, stepRef.current));
      renderer.render(scene, camera);
    };
    renderRef.current = render;
    const animate = (now = 0) => {
      frame = requestAnimationFrame(animate);
      if (!visible || reducedMotion.matches) { previous = 0; return; }
      elapsed += previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      const rect = host.getBoundingClientRect();
      const scroll = clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
      camera.position.x += (pointer.x * 0.85 - camera.position.x) * 0.055;
      camera.position.y += (-pointer.y * 0.48 - scroll * 0.65 - camera.position.y) * 0.055;
      camera.lookAt(0, 0, 0);
      depthGroup.position.x += (depthGroup.userData.baseX + pointer.x * 0.24 - depthGroup.position.x) * 0.05;
      depthGroup.position.y += (depthGroup.userData.baseY + scroll * 1.15 - depthGroup.position.y) * 0.05;
      depthGroup.rotation.y += (pointer.x * 0.2 - depthGroup.rotation.y) * 0.05;
      depthGroup.rotation.x += (-pointer.y * 0.12 - depthGroup.rotation.x) * 0.05;
      render();
    };
    resize();
    depthGroup.position.set(depthGroup.userData.baseX, depthGroup.userData.baseY, 0);
    render();
    animate();

    return () => {
      alive = false;
      renderRef.current = null;
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('touchmove', touch);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material?.dispose());
      });
      texture?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [kind]);

  return <div className={`experience-scene experience-scene-${kind}`} ref={hostRef} aria-hidden="true" />;
}
