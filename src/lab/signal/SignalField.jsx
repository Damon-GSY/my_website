/*! @license
MIT License

Copyright (c) 2026 Oleksandr Yeromin

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
import { useEffect, useRef } from 'react';

// Magnet heading and squared radial displacement adapted from Cursor Lab:
// assets/db-field.js (Magnet Lines / Dot Grid Warp), commit
// c55b31c5c5ac5e4fe8ca10377ab38846ca3f4aa7. MIT © 2026 Oleksandr Yeromin.
// Full license: docs/licenses/cursor-lab-MIT.txt.
// Composition, the three field states, lifecycle and accessibility are original.

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export default function SignalField({ mode, paused }) {
  const canvasRef = useRef(null);
  const hostRef = useRef(null);
  const controlRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const context = canvas.getContext('2d');
    if (!context) return undefined;
    host.dataset.ready = 'true';
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 1;
    let height = 1;
    let raf = 0;
    let visible = true;
    let stopped = false;
    let reduced = motionQuery.matches;
    let targetMode = 0;
    let time = 0;
    let last = 0;
    let pointer = { x: 0.65, y: 0.5, strength: 0 };
    const cursor = { x: 0.65, y: 0.5, strength: 0 };
    const weights = [1, 0, 0];

    const paint = (now = 0) => {
      raf = 0;
      const elapsed = last ? Math.min(0.04, (now - last) / 1000) : 0.016;
      last = now;
      const live = !reduced && !stopped;
      if (live) time += elapsed;
      const ease = live ? 1 - Math.exp(-elapsed * 6) : 1;
      weights.forEach((_, index) => { weights[index] += ((targetMode === index ? 1 : 0) - weights[index]) * ease; });
      cursor.x += (pointer.x - cursor.x) * ease;
      cursor.y += (pointer.y - cursor.y) * ease;
      cursor.strength += (pointer.strength - cursor.strength) * ease;
      context.clearRect(0, 0, width, height);
      const cell = width < 500 ? 16 : 18;
      const scale = Math.min(width, height);
      const centerX = width * 0.51;
      const centerY = height * 0.5;
      const reach = scale * 0.36;
      context.lineCap = 'round';

      for (let x = cell / 2; x < width; x += cell) {
        for (let y = cell / 2; y < height; y += cell) {
          const nx = (x - centerX) / scale;
          const ny = (y - centerY) / scale;
          const radius = Math.hypot(nx, ny);
          const theta = Math.atan2(ny, nx);
          const wave = Math.sin(nx * 5.5 - time * 0.28) * 0.24;
          const planAngle = Math.atan2((wave - ny) * 2.5, 0.8);
          const resolveAngle = theta + Math.PI / 2 + Math.sin(radius * 12 - time * 0.35) * 0.3;
          const evaluateAngle = theta;
          const vx = Math.cos(planAngle) * weights[0] + Math.cos(resolveAngle) * weights[1] + Math.cos(evaluateAngle) * weights[2];
          const vy = Math.sin(planAngle) * weights[0] + Math.sin(resolveAngle) * weights[1] + Math.sin(evaluateAngle) * weights[2];
          const mx = x - cursor.x * width;
          const my = y - cursor.y * height;
          const distance = Math.hypot(mx, my) || 1;
          const force = clamp(1 - distance / reach) * cursor.strength;
          const push = force * force * 38;
          const heading = Math.atan2(vy - (my / distance) * force * 2, vx - (mx / distance) * force * 2);
          const bandPlan = Math.exp(-Math.pow((ny - wave) * 4.5, 2));
          const bandResolve = Math.exp(-Math.pow((radius - 0.32) * 11, 2));
          const bandEvaluate = Math.pow(Math.max(0, Math.cos(radius * 31 - 0.7)), 5) * clamp(1.2 - radius);
          const band = bandPlan * weights[0] + bandResolve * weights[1] + bandEvaluate * weights[2];
          const alpha = 0.1 + band * 0.76 + force * 0.14;
          const length = 2 + band * 5.5 + force * 2;
          const px = x + (mx / distance) * push;
          const py = y + (my / distance) * push;
          context.strokeStyle = `rgba(217, 250, 56, ${alpha})`;
          context.lineWidth = 1 + band * 0.7;
          context.beginPath();
          context.moveTo(px - Math.cos(heading) * length, py - Math.sin(heading) * length);
          context.lineTo(px + Math.cos(heading) * length, py + Math.sin(heading) * length);
          context.stroke();
        }
      }
      // A quiet registration mark ties the field to the graphic layout.
      context.strokeStyle = 'rgba(239, 240, 223, 0.33)';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(centerX - 8, centerY);
      context.lineTo(centerX + 8, centerY);
      context.moveTo(centerX, centerY - 8);
      context.lineTo(centerX, centerY + 8);
      context.stroke();
      if (live && visible && !document.hidden) raf = requestAnimationFrame(paint);
    };

    const wake = () => {
      if (raf || document.hidden) return;
      // Static drawings must not depend on an animation frame becoming visible.
      // This also keeps an offscreen reduced-motion field ready when scrolled to.
      if (reduced || stopped) { paint(performance.now()); return; }
      if (!visible) return;
      last = 0;
      raf = requestAnimationFrame(paint);
    };
    const fit = () => {
      const box = host.getBoundingClientRect();
      width = Math.max(1, box.width);
      height = Math.max(1, box.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      wake();
    };
    const move = (event) => {
      if (reduced || stopped) return;
      if (event.pointerType === 'touch' && event.type !== 'pointerdown') return;
      const box = host.getBoundingClientRect();
      pointer = { x: clamp((event.clientX - box.left) / width), y: clamp((event.clientY - box.top) / height), strength: 1 };
      wake();
    };
    const leave = () => { pointer.strength = 0; wake(); };
    const visibility = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (!document.hidden) wake();
    };
    const motionChange = () => {
      reduced = motionQuery.matches;
      cancelAnimationFrame(raf);
      raf = 0;
      wake();
    };
    const resize = new ResizeObserver(fit);
    resize.observe(host);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: '80px' });
    observer.observe(host);
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerdown', move, { passive: true });
    host.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', visibility);
    motionQuery.addEventListener('change', motionChange);
    controlRef.current = {
      update(nextMode, nextPaused) {
        targetMode = nextMode;
        stopped = nextPaused;
        cancelAnimationFrame(raf);
        raf = 0;
        wake();
      },
    };
    fit();
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      observer.disconnect();
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerdown', move);
      host.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', visibility);
      motionQuery.removeEventListener('change', motionChange);
      delete host.dataset.ready;
      controlRef.current = null;
    };
  }, []);

  useEffect(() => { controlRef.current?.update(mode, paused); }, [mode, paused]);

  return <div className="sl-field" ref={hostRef} aria-hidden="true">
    <svg className="sl-field-fallback" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: 84 }, (_, index) => <line key={index} x1="400" y1="118" x2="400" y2="58" transform={`rotate(${index * (360 / 84)} 400 250)`} />)}
      <circle cx="400" cy="250" r="82" />
    </svg>
    <canvas ref={canvasRef} />
  </div>;
}
