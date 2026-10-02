import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createSculpture } from './ExperienceSculptures';

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = kind === 'path' ? 1.25 : kind === 'field' ? 0.93 : 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    camera.position.z = 14;
    const sculpture = createSculpture(kind, scene);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    let elapsed = 0;
    let previous = 0;
    let frame;
    const pointer = { x: 0, y: 0 };

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const [x, y, scale] = width <= 680 ? sculpture.layout.mobile : sculpture.layout.desktop;
      sculpture.group.userData.baseX = width > 680 && width < 1100 ? x - 0.52 : x;
      sculpture.group.userData.baseY = y;
      sculpture.group.scale.setScalar(width > 680 && width < 1100 ? scale * 0.84 : scale);
      sculpture.group.position.set(sculpture.group.userData.baseX, y, 0);
      renderer.setSize(width, height, false);
      sculpture.update(elapsed, stepRef.current, false);
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    visibilityObserver.observe(host);
    const move = (event) => {
      if (reducedMotion.matches) return;
      pointer.x = clamp((event.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      pointer.y = clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1);
    };
    const touch = (event) => { if (event.touches[0]) move(event.touches[0]); };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('touchmove', touch, { passive: true });

    const render = () => {
      sculpture.update(elapsed, stepRef.current, !reducedMotion.matches);
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
      camera.position.x += (pointer.x * 0.48 - camera.position.x) * 0.045;
      camera.position.y += (-pointer.y * 0.24 - scroll * 0.44 - camera.position.y) * 0.045;
      camera.lookAt(0, 0, 0);
      sculpture.group.position.x += (sculpture.group.userData.baseX + pointer.x * 0.18 - sculpture.group.position.x) * 0.045;
      sculpture.group.position.y += (sculpture.group.userData.baseY + scroll * 0.58 - sculpture.group.position.y) * 0.045;
      sculpture.group.rotation.y += (pointer.x * 0.16 - sculpture.group.rotation.y) * 0.045;
      sculpture.group.rotation.x += (-pointer.y * 0.08 - sculpture.group.rotation.x) * 0.045;
      render();
    };
    resize();
    host.classList.add('is-ready');
    host.dataset.webgl = 'ready';
    animate();

    return () => {
      renderRef.current = null;
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('touchmove', touch);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      const textures = new Set();
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (!material) return;
          if (material.map) textures.add(material.map);
          material.dispose();
        });
      });
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [kind]);

  return <div className={`experience-scene experience-scene-${kind}`} ref={hostRef} aria-hidden="true" />;
}
