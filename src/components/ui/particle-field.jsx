import { useEffect, useRef } from 'react';

/**
 * Constellation / neural-network canvas background.
 * Nodes drift slowly; edges appear between near neighbours; the pointer
 * gently pulls nearby nodes. Pure Canvas 2D — no dependency.
 *
 * Respects prefers-reduced-motion (renders one static frame) and pauses via
 * IntersectionObserver when scrolled out of view.
 */
function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return '217, 119, 87';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export default function ParticleField({
  className = '',
  density = 0.00012,
  linkDistance = 132,
  pointerRadius = 168,
  speed = 0.28,
  baseAlpha = 0.5,
  cssVar = '--color-accent',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const accent = hexToRgb(
      getComputedStyle(document.documentElement).getPropertyValue(cssVar) || '#d97757'
    );

    let width = 0;
    let height = 0;
    let nodes = [];
    let raf = 0;
    let running = true;
    const pointer = { x: -9999, y: -9999, active: false };

    const clampSpeed = (n) => {
      const max = speed * 1.6;
      n.vx = Math.max(-max, Math.min(max, n.vx));
      n.vy = Math.max(-max, Math.min(max, n.vy));
    };

    function buildNodes() {
      const count = Math.max(26, Math.min(96, Math.floor(width * height * density)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * 1.3 + 0.7,
      }));
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function drawOnce() {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < linkDistance) {
            const alpha = (1 - d / linkDistance) * baseAlpha * 0.55;
            ctx.strokeStyle = `rgba(${accent}, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${accent}, ${baseAlpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step() {
      if (!running) return;
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (pointer.active) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const dist = Math.hypot(dx, dy);
          if (dist < pointerRadius && dist > 0.5) {
            const pull = (1 - dist / pointerRadius) * 0.05;
            n.vx += (dx / dist) * pull;
            n.vy += (dy / dist) * pull;
          }
        }
        n.vx *= 0.985;
        n.vy *= 0.985;
        // nudge back toward a baseline drift so motion never fully stalls
        n.vx += (Math.sign(n.vx) || 1) * 0.0008;
        clampSpeed(n);
        if (n.x < -12) n.x = width + 12;
        else if (n.x > width + 12) n.x = -12;
        if (n.y < -12) n.y = height + 12;
        else if (n.y > height + 12) n.y = -12;
      }
      drawOnce();
      raf = requestAnimationFrame(step);
    }

    resize();
    if (reduced) drawOnce();
    else raf = requestAnimationFrame(step);

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    }
    function onLeave() {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    }

    if (finePointer && !reduced) {
      window.addEventListener('pointermove', onMove, { passive: true });
      const parent = canvas.parentElement;
      parent?.addEventListener('pointerleave', onLeave);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (reduced) return;
        const visible = entries[0]?.isIntersecting;
        if (visible && !running) {
          running = true;
          raf = requestAnimationFrame(step);
        } else if (!visible && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    let resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        if (reduced) drawOnce();
      }, 150);
    }
    window.addEventListener('resize', onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      io.disconnect();
      const parent = canvas.parentElement;
      parent?.removeEventListener('pointerleave', onLeave);
    };
  }, [cssVar, density, linkDistance, pointerRadius, speed, baseAlpha]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
