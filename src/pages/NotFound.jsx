import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n.jsx';
import AroundBar from './around/Bar.jsx';
import { CHAPTERS } from './around/run.js';
import { buildWire, layout, paint, pose, poseSVG } from './around/wire.js';
import './around/around.css';

// The 404: a bent wire hangs in front of the page, lit by the mark. It arrives turned away, a tangle, and
// swings on its threads until its shadow on the page spells "404" (src/pages/around/wire.js, after Damon's
// Shadow study). Drag it and it swings back. With reduced motion, or without canvas, the settled frame is
// drawn once as SVG.

const START = { yaw: -1.05, pitch: 0.42 };
// a damped torsion pendulum: ~8% overshoot, reads as "404" after about two seconds
const OMEGA = 3.6;
const ZETA = 0.62;

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function NotFound() {
  const { t } = useLang();
  const wallRef = useRef(null);
  const canvasRef = useRef(null);
  const kickRef = useRef(null);
  const copyRef = useRef(null);
  const [L, setL] = useState(null);
  const [still, setStill] = useState(null); // SVG frame, when the wire does not move
  const [path] = useState(() => decodeURI(window.location.pathname));

  useEffect(() => {
    document.title = `${t({ en: 'Not found', zh: '未找到' })} — Damon Guan`;
  }, [t]);

  useEffect(() => {
    const wall = wallRef.current;
    const canvas = canvasRef.current;
    const ctx = !reducedMotion() && canvas?.getContext('2d');
    const layers = ctx ? [document.createElement('canvas'), document.createElement('canvas')] : null;
    let lay;
    let wire;
    let dpr = 1;
    const s = { yaw: START.yaw, pitch: START.pitch, vy: 0, vp: 0, drag: null };
    let raf = 0;
    let last = 0;

    const draw = () => paint(ctx, layers, lay, pose(lay, wire, s.yaw, s.pitch), dpr);
    const frame = (now) => {
      raf = 0;
      const dt = Math.min(0.034, (now - (last || now)) / 1000);
      last = now;
      if (!s.drag) {
        // integrate both springs (semi-implicit Euler, a few substeps)
        for (let i = 0; i < 4; i += 1) {
          const h = dt / 4;
          s.vy += (-OMEGA * OMEGA * s.yaw - 2 * ZETA * OMEGA * s.vy) * h;
          s.vp += (-OMEGA * OMEGA * s.pitch - 2 * ZETA * OMEGA * s.vp) * h;
          s.yaw += s.vy * h;
          s.pitch += s.vp * h;
        }
      }
      const resting = !s.drag && Math.abs(s.yaw) + Math.abs(s.pitch) < 2.5e-3 && Math.abs(s.vy) + Math.abs(s.vp) < 1.5e-2;
      if (resting) {
        s.yaw = 0;
        s.pitch = 0;
        s.vy = 0;
        s.vp = 0;
      }
      draw();
      if (!resting) raf = requestAnimationFrame(frame);
    };
    const run = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const copy = copyRef.current;
    const measure = () => {
      const r = wall.getBoundingClientRect();
      lay = layout(r.width, r.height, copy.offsetTop - 12);
      wire = buildWire(lay);
      setL(lay);
      if (!ctx) {
        setStill(poseSVG(lay, pose(lay, wire, 0, 0)));
        return;
      }
      dpr = Math.min(2, window.devicePixelRatio || 1);
      for (const c of [canvas, ...layers]) {
        c.width = Math.round(r.width * dpr);
        c.height = Math.round(r.height * dpr);
      }
      draw();
    };
    measure();
    const ro = new ResizeObserver(() => {
      const r = wall.getBoundingClientRect();
      if (Math.abs(r.width - lay.W) > 1 || Math.abs(r.height - lay.H) > 1 || Math.abs(copy.offsetTop - 12 - lay.avail) > 1)
        measure();
    });
    ro.observe(wall);
    ro.observe(copy);
    if (!ctx) return () => ro.disconnect();

    run();

    // drag: sideways turns it, up and down tips it; let go and it swings back to "404"
    const down = (e) => {
      if (e.button > 0) return;
      s.drag = { x: e.clientX, y: e.clientY, yaw: s.yaw, pitch: s.pitch, t: performance.now() };
      s.vy = 0;
      s.vp = 0;
      wall.setPointerCapture?.(e.pointerId);
      wall.classList.add('is-dragging');
      run();
    };
    const move = (e) => {
      const d = s.drag;
      if (!d) return;
      const now = performance.now();
      const yaw = Math.max(-1.3, Math.min(1.3, d.yaw + (e.clientX - d.x) * 0.006));
      const pitch = Math.max(-0.6, Math.min(0.6, d.pitch + (e.clientY - d.y) * 0.003));
      const dt = Math.max(0.008, (now - d.t) / 1000);
      s.vy = (yaw - s.yaw) / dt;
      s.vp = (pitch - s.pitch) / dt;
      s.yaw = yaw;
      s.pitch = pitch;
      d.t = now;
      run();
    };
    const up = () => {
      if (!s.drag) return;
      s.drag = null;
      s.vy = Math.max(-6, Math.min(6, s.vy));
      s.vp = Math.max(-4, Math.min(4, s.vp));
      wall.classList.remove('is-dragging');
      run();
    };
    // a wheel nudges it (the page itself does not scroll on a desktop screen)
    const wheel = (e) => {
      s.vy += Math.max(-1.2, Math.min(1.2, e.deltaY * 0.004));
      run();
    };
    kickRef.current = () => {
      s.yaw = START.yaw;
      s.pitch = START.pitch;
      s.vy = 0;
      s.vp = 0;
      run();
    };
    wall.addEventListener('pointerdown', down);
    wall.addEventListener('pointermove', move);
    wall.addEventListener('pointerup', up);
    wall.addEventListener('pointercancel', up);
    wall.addEventListener('wheel', wheel, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wall.removeEventListener('pointerdown', down);
      wall.removeEventListener('pointermove', move);
      wall.removeEventListener('pointerup', up);
      wall.removeEventListener('pointercancel', up);
      wall.removeEventListener('wheel', wheel);
    };
  }, []);

  const moving = L && !still;

  return (
    <div className="ar ar-nf">
      <a className="skip-link" href="#content">
        {t({ en: 'Skip to content', zh: '跳到正文' })}
      </a>
      <AroundBar />
      <main id="content" className="nf-stage">
        <div
          className={`nf-wall${moving ? ' is-live' : ''}`}
          ref={wallRef}
          role="img"
          aria-label={t({
            en: 'A bent wire hangs in front of the page. Lit from above, its shadow spells 404.',
            zh: '一根弯折的铁丝悬在页面前，被灯照着，它的影子拼出 404。',
          })}
        >
          <canvas ref={canvasRef} hidden={!!still} />
          {still && (
            <svg viewBox={still.viewBox} preserveAspectRatio="none" aria-hidden="true">
              <g fill="none" stroke="#0d0d0d" strokeLinecap="round" strokeLinejoin="round">
                <g opacity="0.07">
                  {still.penumbra.map((p, i) => (
                    <path key={i} d={p.d} strokeWidth={p.w} />
                  ))}
                </g>
                <g opacity="0.74">
                  {still.shadow.map((p, i) => (
                    <path key={i} d={p.d} strokeWidth={p.w} />
                  ))}
                </g>
                <g opacity="0.16" strokeWidth="1">
                  {still.threadShadows.map((p, i) => (
                    <path key={i} d={p} />
                  ))}
                </g>
                <g opacity="0.42" strokeWidth="0.8">
                  {still.threads.map((p, i) => (
                    <path key={i} d={p} />
                  ))}
                </g>
                {still.wire.map((p, i) => (
                  <g key={i}>
                    <path d={p.d} stroke="#f4f4f2" strokeWidth={p.w + 3} strokeLinecap="butt" />
                    <path d={p.d} strokeWidth={p.w} />
                  </g>
                ))}
              </g>
            </svg>
          )}
          {L && (
            <>
              <span className="nf-cord" style={{ left: L.lightScreen.x, height: L.lightScreen.y }} aria-hidden="true" />
              {/* the mark: here it is the light */}
              <span className="nf-light" style={{ left: L.lightScreen.x, top: L.lightScreen.y }} aria-hidden="true" />
            </>
          )}
        </div>
        {moving && (
          <button
            type="button"
            className="nf-again mono"
            style={{ left: L.cx + L.half, top: L.cy + L.h / 2 + (L.narrow ? 14 : 22) }}
            onClick={() => kickRef.current?.()}
          >
            {t({ en: 'Drag the wire, or turn it again ↻', zh: '拖动铁丝，或再转一次 ↻' })}
          </button>
        )}
        <div className="nf-copy" ref={copyRef}>
          <p className="ar-head mono">
            <span className="ar-num">(404)</span>
            <span className="ar-label">{t({ en: 'Not found', zh: '未找到' })}</span>
            <span className="ar-aside" title={path}>
              {path}
            </span>
          </p>
          <h1 className="nf-line">{t({ en: 'This page isn’t on the record.', zh: '这一页不在记录里。' })}</h1>
          <nav className="nf-ways mono" aria-label={t({ en: 'Ways back', zh: '回去的路' })}>
            <a className="nf-start" href="/">
              <span aria-hidden="true">← </span>
              {t({ en: 'Back to the start', zh: '回到开头' })}
            </a>
            <ol className="nf-chapters" aria-label={t({ en: 'Chapters of the run', zh: '主站的章节' })}>
              {CHAPTERS.map((c) => (
                <li key={c.id}>
                  <a href={`/#${c.id}`}>
                    <span className="nf-n">({c.n})</span>
                    {t(c.label)}
                  </a>
                </li>
              ))}
            </ol>
            <a className="nf-lab" href="/lab">
              {t({ en: 'The studies it was made from', zh: '拼出它的那些研究' })}
              <span aria-hidden="true"> →</span>
            </a>
          </nav>
        </div>
      </main>
    </div>
  );
}
