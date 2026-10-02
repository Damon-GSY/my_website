import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const stageColors = [0xd9f94d, 0xfac379, 0x9eecff, 0xffffff];

export default function ExperienceScene({ kind, activeStep = 0 }) {
  const hostRef = useRef(null);
  const stepRef = useRef(activeStep);

  useEffect(() => { stepRef.current = activeStep; }, [activeStep]);

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
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 50);
    camera.position.z = 15;
    const group = new THREE.Group();
    scene.add(group);
    const objects = [];
    const dynamic = [];
    const makeDot = (radius, color, opacity = 1) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 16, 12),
        new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity }),
      );
      group.add(mesh);
      return mesh;
    };
    const toWorld = (x, y) => new THREE.Vector3((x - 0.5) * 16, (0.5 - y) * 10, 0);

    if (kind === 'path') {
      const route = new THREE.CatmullRomCurve3([
        toWorld(0.41, 0.96), toWorld(0.49, 0.76), toWorld(0.57, 0.61),
        toWorld(0.73, 0.48), toWorld(0.77, 0.26), toWorld(0.61, 0.12),
      ]);
      const marker = makeDot(0.095, stageColors[0]);
      const halo = makeDot(0.19, stageColors[0], 0.2);
      for (let index = 0; index < 26; index += 1) {
        const bead = makeDot(0.018 + (index % 4) * 0.006, index % 5 ? 0xffe3a7 : 0xd9f94d, 0.55);
        bead.position.copy(route.getPointAt(index / 26));
      }
      dynamic.push((time) => {
        const point = route.getPointAt((time * 0.055 + stepRef.current * 0.19) % 1);
        marker.position.copy(point);
        halo.position.copy(point);
        halo.scale.setScalar(1 + Math.sin(time * 4) * 0.25);
        marker.material.color.setHex(stageColors[stepRef.current % stageColors.length]);
        halo.material.color.copy(marker.material.color);
      });
    }

    if (kind === 'field') {
      for (let index = 0; index < 3; index += 1) {
        const sheet = new THREE.Mesh(
          new THREE.PlaneGeometry(1.2 + index * 0.2, 1.7 + index * 0.13),
          new THREE.MeshPhysicalMaterial({ color: index === 1 ? 0x9cb8ff : 0xffffff, metalness: 0.06, roughness: 0.08, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }),
        );
        sheet.position.set(2.1 + index * 0.8, 0.3 - index * 0.33, 0.8 + index * 0.1);
        sheet.rotation.set(0.1, -0.32 + index * 0.28, -0.24 + index * 0.15);
        group.add(sheet);
        objects.push(sheet);
      }
      const glint = makeDot(0.055, 0xf14c30, 0.75);
      dynamic.push((time) => {
        objects.forEach((sheet, index) => {
          sheet.rotation.y = -0.32 + index * 0.28 + Math.sin(time * 0.55 + index) * 0.15;
          sheet.position.y = 0.3 - index * 0.33 + Math.sin(time * 0.72 + index * 1.2) * 0.12;
        });
        glint.position.set(3.6 + Math.sin(time * 0.8) * 0.6, 1.25 + Math.cos(time * 0.8) * 0.36, 1.3);
      });
    }

    if (kind === 'world') {
      const routes = [
        [[0.46, 0.83], [0.51, 0.64], [0.68, 0.54], [0.74, 0.32]],
        [[0.47, 0.83], [0.64, 0.69], [0.73, 0.54], [0.84, 0.38]],
        [[0.48, 0.83], [0.56, 0.76], [0.75, 0.77], [0.86, 0.64]],
      ].map((points) => new THREE.CatmullRomCurve3(points.map(([x, y]) => toWorld(x, y))));
      const travelers = routes.map((route, index) => {
        const traveler = makeDot(0.07, index === 1 ? 0xff7945 : 0x1649ec, 0.9);
        const halo = makeDot(0.15, index === 1 ? 0xff7945 : 0x1649ec, 0.16);
        return { route, traveler, halo };
      });
      dynamic.push((time) => {
        travelers.forEach(({ route, traveler, halo }, index) => {
          const point = route.getPointAt((time * 0.11 + index * 0.27) % 1);
          traveler.position.copy(point);
          halo.position.copy(point);
          const selected = stepRef.current === index;
          traveler.scale.setScalar(selected ? 1.35 : 0.58);
          halo.material.opacity = selected ? 0.3 : 0.08;
        });
      });
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      const aspect = width / height;
      camera.left = -5 * aspect;
      camera.right = 5 * aspect;
      camera.top = 5;
      camera.bottom = -5;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    let visible = true;
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    visibilityObserver.observe(host);
    let targetX = 0;
    let targetY = 0;
    const move = (event) => {
      targetX = (event.clientY / window.innerHeight - 0.5) * 0.1;
      targetY = (event.clientX / window.innerWidth - 0.5) * 0.16;
    };
    window.addEventListener('pointermove', move, { passive: true });
    let elapsed = 0;
    let previous = 0;
    let frame;
    const animate = (now = 0) => {
      frame = requestAnimationFrame(animate);
      if (!visible || reduceMotion.matches) { previous = 0; return; }
      elapsed += previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      dynamic.forEach((update) => update(elapsed));
      group.rotation.x += (targetX - group.rotation.x) * 0.035;
      group.rotation.y += (targetY - group.rotation.y) * 0.035;
      renderer.render(scene, camera);
    };
    resize();
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material?.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [kind]);

  return <div className={`experience-scene experience-scene-${kind}`} ref={hostRef} aria-hidden="true" />;
}
