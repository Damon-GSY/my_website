export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const span = (p, a, b) => clamp((p - a) / (b - a));
export const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
export const lerp = (a, b, t) => a + (b - a) * t;

// Native scroll -> damped progress across `track`. Reversible, and it stops ticking when idle.
export function createTimeline(track, onFrame, damping = 0.14) {
  let target = 0;
  let current = -1;
  let raf = 0;
  const tick = () => {
    current = current < 0 ? target : current + (target - current) * damping;
    if (Math.abs(target - current) < 2e-4) current = target;
    onFrame(current);
    raf = current === target ? 0 : requestAnimationFrame(tick);
  };
  const read = () => {
    const r = track.getBoundingClientRect();
    target = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
    if (!raf) raf = requestAnimationFrame(tick);
  };
  window.addEventListener('scroll', read, { passive: true });
  window.addEventListener('resize', read);
  read();
  return () => {
    window.removeEventListener('scroll', read);
    window.removeEventListener('resize', read);
    cancelAnimationFrame(raf);
  };
}
