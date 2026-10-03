/*! @license
MIT License

Copyright (c) 2026 CatsJuice

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
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { makePaperTexture } from './paperArtwork';
import { paperVertex, paperFragment, shadowVertex, shadowFragment } from './peelShaders';

// Pointer/depth inversion and fixed-step spring adapted from CatsJuice/sticker-forge
// lib/sticker-forge.ts, MIT; revision 068caa49eef69745564a5debbc01bab3fcd31042.
// Copyright (c) 2026 CatsJuice. See docs/licenses/sticker-forge-MIT.txt.
function createDesk(host, onSelect, onProgress, onUnavailable) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'tl-webgl';
  host.appendChild(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5, 5, 4.5, -4.5, 0.1, 100);
  camera.position.set(0, 0, 24);
  const desk = new THREE.Group();
  scene.add(desk);
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const inverse = new THREE.Matrix4();
  const localRay = new THREE.Ray();
  const flatPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const intersection = new THREE.Vector3();
  const layout = [
    { width: 3.95, height: 5.26, x: -1.76, y: 0.56, z: 0.2, angle: -0.12 },
    { width: 3.95, height: 5.26, x: 1.65, y: 0.94, z: 0, angle: 0.13 },
    { width: 4.78, height: 2.59, x: 0.45, y: -2.04, z: 0.9, angle: -0.095 },
  ];
  const papers = layout.map((item, index) => {
    const group = new THREE.Group();
    group.position.set(item.x, item.y, item.z);
    group.rotation.z = item.angle;
    desk.add(group);
    const uniforms = {
      uMap: { value: makePaperTexture(index) },
      uDepth: { value: index === 0 ? 0.88 : 0.19 },
      uRadius: { value: 0.2 },
      uOrigin: { value: new THREE.Vector2(item.width / 2, item.height / 2) },
      uDirection: { value: new THREE.Vector2(-0.74, -0.67).normalize() },
      uBack: { value: new THREE.Color('#e9e4d6') },
    };
    const geometry = new THREE.PlaneGeometry(item.width, item.height, 100, index === 2 ? 64 : 128);
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: paperVertex, fragmentShader: paperFragment, side: THREE.DoubleSide });
    const shadowMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader: shadowVertex, fragmentShader: shadowFragment, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    const shadow = new THREE.Mesh(geometry, shadowMaterial);
    const mesh = new THREE.Mesh(geometry, material);
    group.add(shadow, mesh);
    return { ...item, group, uniforms, geometry, material, shadowMaterial, depth: uniforms.uDepth.value, target: uniforms.uDepth.value, velocity: 0, extent: Math.hypot(item.width, item.height) };
  });
  let frame = 0;
  let lastTime = 0;
  let active = 0;
  let dragging = null;
  let visible = true;
  let destroyed = false;
  let contextAvailable = true;
  let desiredX = -0.11;
  let desiredY = 0.02;
  let lastPercent = -1;

  function request() {
    if (!frame && !destroyed && contextAvailable && visible && !document.hidden) frame = requestAnimationFrame(render);
  }

  function render(time) {
    frame = 0;
    if (destroyed || !visible || document.hidden) return;
    const delta = Math.min((time - lastTime) / 1000 || 1 / 60, 0.05);
    lastTime = time;
    let moving = false;
    papers.forEach((paper) => {
      if (media.matches) { paper.depth = paper.target; paper.velocity = 0; }
      else {
        let remaining = delta;
        while (remaining > 0) {
          const step = Math.min(remaining, 1 / 120);
          paper.velocity += (-230 * (paper.depth - paper.target) - 27.8 * paper.velocity) * step;
          paper.depth = Math.max(0, paper.depth + paper.velocity * step);
          remaining -= step;
        }
      }
      if (Math.abs(paper.depth - paper.target) > 0.001 || Math.abs(paper.velocity) > 0.004) moving = true;
      else { paper.depth = paper.target; paper.velocity = 0; }
      paper.uniforms.uDepth.value = paper.depth;
      paper.uniforms.uRadius.value = Math.min(0.32, Math.max(0.055, paper.depth / 2.7));
    });
    const targetX = media.matches ? -0.11 : desiredX;
    const targetY = media.matches ? 0.02 : desiredY;
    desk.rotation.x += (targetX - desk.rotation.x) * 0.12;
    desk.rotation.y += (targetY - desk.rotation.y) * 0.12;
    if (Math.abs(targetX - desk.rotation.x) + Math.abs(targetY - desk.rotation.y) > 0.0004) moving = true;
    const percent = Math.round(papers[active].depth / (papers[active].extent * 0.68) * 100);
    if (lastPercent !== percent) { lastPercent = percent; onProgress(Math.min(100, percent)); }
    renderer.render(scene, camera);
    if (moving) request();
  }

  function localPoint(event, paper) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    inverse.copy(paper.group.matrixWorld).invert();
    localRay.copy(raycaster.ray).applyMatrix4(inverse);
    return localRay.intersectPlane(flatPlane, intersection) ? intersection.clone() : null;
  }

  function hit(event) {
    scene.updateMatrixWorld(true);
    for (const index of [2, 0, 1]) {
      const paper = papers[index];
      const point = localPoint(event, paper);
      if (point && Math.abs(point.x) <= paper.width / 2 && Math.abs(point.y) <= paper.height / 2) return { index, point };
    }
    return null;
  }

  function select(index) {
    active = index;
    lastPercent = -1;
    onSelect(index);
    request();
  }

  function down(event) {
    if (event.button !== 0) return;
    const result = hit(event);
    if (!result) return;
    select(result.index);
    const paper = papers[active];
    const point = result.point;
    const right = point.x > 0;
    const top = point.y > 0;
    paper.uniforms.uOrigin.value.set((right ? 1 : -1) * paper.width / 2, (top ? 1 : -1) * paper.height / 2);
    paper.uniforms.uDirection.value.set(right ? -0.74 : 0.74, top ? -0.67 : 0.67).normalize();
    dragging = { id: event.pointerId, index: active, start: point, initial: 0.15 };
    paper.target = 0.32;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
    request();
  }

  function projection(depth) {
    const radius = Math.min(0.32, Math.max(0.055, depth / 2.7));
    const angle = Math.min(depth / radius, 2.95);
    return depth - radius * Math.sin(angle) - Math.max(0, depth - radius * 2.95) * Math.cos(2.95);
  }

  function move(event) {
    if (dragging) {
      const paper = papers[dragging.index];
      const point = localPoint(event, paper);
      if (!point) return;
      const direction = paper.uniforms.uDirection.value;
      const travel = Math.max(0, (point.x - dragging.start.x) * direction.x + (point.y - dragging.start.y) * direction.y) + dragging.initial;
      let low = 0;
      let high = paper.extent * 0.72;
      for (let i = 0; i < 16; i++) {
        const midpoint = (low + high) / 2;
        if (projection(midpoint) < travel) low = midpoint; else high = midpoint;
      }
      paper.target = (low + high) / 2;
    } else {
      const rect = canvas.getBoundingClientRect();
      desiredX = -0.11 + ((event.clientY - rect.top) / rect.height - 0.5) * 0.1;
      desiredY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.15;
      canvas.style.cursor = hit(event) ? 'grab' : 'default';
    }
    request();
  }

  function up(event) {
    if (!dragging || event.pointerId !== dragging.id) return;
    papers[dragging.index].target = 0.19;
    dragging = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = 'grab';
    request();
  }

  function leave() { desiredX = -0.11; desiredY = 0.02; request(); }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    const viewWidth = width / height < 1 ? 8.7 : 9.25;
    const viewHeight = viewWidth * height / width;
    camera.left = -viewWidth / 2; camera.right = viewWidth / 2;
    camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    request();
  }
  function visibility() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else { lastTime = 0; request(); } }
  function preference() { request(); }
  function contextLost(event) {
    event.preventDefault();
    contextAvailable = false;
    cancelAnimationFrame(frame); frame = 0;
    canvas.style.display = 'none';
    onUnavailable();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) { lastTime = 0; request(); } else { cancelAnimationFrame(frame); frame = 0; } });
  observer.observe(host);
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', leave);
  canvas.addEventListener('webglcontextlost', contextLost);
  media.addEventListener('change', preference);
  document.addEventListener('visibilitychange', visibility);
  resize();

  return {
    select,
    peel(percent) { const paper = papers[active]; paper.target = percent / 100 * paper.extent * 0.68; request(); },
    reset() { papers.forEach((paper) => { paper.target = 0; }); request(); },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect(); observer.disconnect();
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('pointerleave', leave);
      canvas.removeEventListener('webglcontextlost', contextLost);
      media.removeEventListener('change', preference); document.removeEventListener('visibilitychange', visibility);
      papers.forEach((paper) => { paper.uniforms.uMap.value.dispose(); paper.geometry.dispose(); paper.material.dispose(); paper.shadowMaterial.dispose(); });
      renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
    },
  };
}

export default function PaperDesk({ selected, onSelect, items }) {
  const host = useRef(null);
  const engine = useRef(null);
  const [available, setAvailable] = useState(true);
  const [progress, setProgress] = useState(20);
  useEffect(() => {
    let instance;
    try { instance = createDesk(host.current, onSelect, setProgress, () => setAvailable(false)); engine.current = instance; }
    catch { setAvailable(false); }
    return () => { instance?.destroy(); engine.current = null; };
  }, [onSelect]);
  useEffect(() => { engine.current?.select(selected); }, [selected]);

  return <div className="tl-desk-wrap">
    <div className="tl-desk-stamp" aria-hidden="true"><span>DG—S</span>RESEARCH ARCHIVE<br />HANDLE WITH CURIOSITY</div>
    <div className="tl-desk" ref={host}>
      {!available && <div className="tl-static-papers" aria-label="Research archive">
        {items.map((item, index) => <button type="button" key={item.id} onClick={() => onSelect(index)} className={`tl-static-paper tl-static-paper-${index}`}><small>RESEARCH / 0{index + 1}</small><strong>{['Agents that act.', 'The tool index.', 'Beyond the answer.'][index]}</strong><span>{item.title}</span></button>)}
      </div>}
    </div>
    <div className="tl-desk-bottom"><span><i /> {available ? 'GRAB A PAPER. PEEL IT BACK.' : 'SELECT A RESEARCH ARTIFACT.'}</span><span>01—03 / SELECTED WORK</span></div>
    {available && <div className="tl-peel-controls">
      <label htmlFor="tl-peel">Peel paper <span>{progress}%</span></label>
      <input id="tl-peel" type="range" min="0" max="100" value={progress} onChange={(event) => engine.current?.peel(Number(event.target.value))} aria-label={`Peel ${items[selected].title}`} />
      <button type="button" onClick={() => engine.current?.reset()}>Lay flat ↙</button>
    </div>}
  </div>;
}
