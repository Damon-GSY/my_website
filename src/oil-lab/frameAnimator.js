/*
 * Adapted from oil-oil/oil-motion, assets/interactive-motion.ts.
 * MIT License
 * Copyright (c) 2026 Lin Zhihuang
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function smoothDamp(current, target, velocity, smoothTime, maxSpeed, dt) {
  const safeTime = Math.max(.0001, smoothTime);
  const omega = 2 / safeTime;
  const x = omega * dt;
  const decay = 1 / (1 + x + .48 * x * x + .235 * x * x * x);
  const change = clamp(current - target, -maxSpeed * safeTime, maxSpeed * safeTime);
  const limitedTarget = current - change;
  const temp = (velocity + omega * change) * dt;
  let nextVelocity = (velocity - omega * temp) * decay;
  let nextPosition = limitedTarget + (change + temp) * decay;
  if ((target - current > 0) === (nextPosition > target)) {
    nextPosition = target;
    nextVelocity = 0;
  }
  return [nextPosition, nextVelocity];
}

// Oil Motion's integer-frame animator, with explicit lifecycle suspension.
export function createFrameAnimator(options) {
  const frameCount = Math.max(1, Math.floor(options.frameCount));
  const smoothTime = options.smoothTime ?? .11;
  const maxSpeed = options.maxSpeed ?? frameCount * 2;
  let position = clamp(options.initialFrame ?? 0, 0, frameCount - 1);
  let target = position;
  let velocity = 0;
  let lastFrame = -1;
  let lastTime = 0;
  let raf = 0;
  let destroyed = false;
  let suspended = false;
  const render = () => {
    const frame = Math.round(clamp(position, 0, frameCount - 1));
    if (frame !== lastFrame) { options.render(frame); lastFrame = frame; }
  };
  const unsettled = () => Math.abs(target - position) > .002 || Math.abs(velocity) > .002;
  const loop = (now) => {
    raf = 0;
    if (destroyed || suspended) return;
    const dt = lastTime ? Math.max(0, (now - lastTime) / 1000) : 1 / 60;
    lastTime = now;
    [position, velocity] = smoothDamp(position, target, velocity, smoothTime, maxSpeed, dt);
    if (!unsettled()) { position = target; velocity = 0; lastTime = 0; }
    render();
    if (unsettled()) raf = requestAnimationFrame(loop);
  };
  const schedule = () => {
    if (!raf && !destroyed && !suspended && unsettled()) raf = requestAnimationFrame(loop);
  };
  render();
  return {
    setTarget(frame) { target = clamp(frame, 0, frameCount - 1); schedule(); },
    setProgress(progress) { this.setTarget(clamp(progress, 0, 1) * (frameCount - 1)); },
    getCurrentFrame: () => position,
    isAnimating: () => Boolean(raf),
    pause() { suspended = true; cancelAnimationFrame(raf); raf = 0; lastTime = 0; },
    resume() { suspended = false; schedule(); },
    destroy() { destroyed = true; cancelAnimationFrame(raf); raf = 0; },
  };
}

export function readTimeline(timeline) {
  const fps = Number(timeline.fps);
  if (timeline.schemaVersion !== 1 || !Number.isFinite(fps) || fps <= 0) throw new Error('Invalid motion timeline.');
  const states = timeline.states;
  const segments = timeline.segments;
  if (!Array.isArray(states) || !states.length || !Array.isArray(segments) || !segments.length) throw new Error('Missing motion states.');
  if (states.length !== segments.length + 1 || new Set(states.map((state) => state.id)).size !== states.length) throw new Error('Inconsistent motion states.');
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (![segment.start, segment.hold, segment.endExclusive].every(Number.isFinite) || !(segment.start <= segment.hold && segment.hold < segment.endExclusive)) throw new Error('Invalid motion boundaries.');
    if (segment.from !== states[i].id || segment.to !== states[i + 1].id) throw new Error('Motion states are out of order.');
    if (i && segment.start < segments[i - 1].endExclusive - 1e-6) throw new Error('Overlapping motion segments.');
    if (Math.abs(states[i + 1].hold - segment.hold) > .5 / fps) throw new Error('Motion hold does not match state.');
  }
  const initial = states.find((state) => state.id === timeline.initialState);
  if (!initial || !Number.isFinite(initial.hold)) throw new Error('Missing initial motion state.');
  const last = segments.at(-1);
  const lastFrame = Math.round(last.hold * fps);
  const frameCount = Math.round(last.endExclusive * fps);
  if (lastFrame < 0 || lastFrame >= frameCount) throw new Error('Motion ends outside its encoded frames.');
  return { fps, frameDuration: 1 / fps, frameCount: lastFrame + 1, initialFrame: Math.round(initial.hold * fps), states, duration: last.endExclusive };
}
