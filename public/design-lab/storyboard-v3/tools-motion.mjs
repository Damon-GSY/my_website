import { clamp, ease } from '../creative/ah-journey.mjs';

export const ROW_BEATS = [.20, .32, .44, .56, .68, .80];
export const EXIT_BEAT = .88;
const mix = (a, b, t) => a + (b - a) * t;

function jump(a, b, progress, arc) {
  const t = ease(progress);
  const lift = Math.sin(Math.PI * t) ** 2;
  const impact = Math.sin(Math.PI * clamp((progress - .78) / .22)) ** 2;
  const stretch = 1 - .12 * lift + .14 * impact;
  return {
    x: mix(a.x, b.x, t),
    y: mix(a.y, b.y, t) - arc * lift,
    radius: mix(a.radius, b.radius, t),
    scaleX: stretch, scaleY: 1 / stretch,
  };
}

// All geometry is stage-local. No prior-frame state: reverse scroll and direct
// row navigation produce precisely the same actor and selection-strip position.
export function toolsFrame(progress, geometry) {
  const p = clamp(progress), { source, rows, exit } = geometry;
  let position = 0, phase = 'entry', dot;
  if (p < ROW_BEATS[0]) {
    const flight = clamp((p - .025) / .175);
    dot = jump(source, rows[0], flight, Math.min(86, Math.abs(rows[0].x - source.x) * .23 + 24));
    // A brief local anticipation is part of the same actor.
    if (p < .025) {
      const squash = .18 * Math.sin(Math.PI * p / .025) ** 2;
      dot.scaleX = 1 + squash;
      dot.scaleY = 1 / dot.scaleX;
    }
  } else if (p < EXIT_BEAT) {
    phase = 'scan';
    for (let i = 0; i < rows.length - 1; i++) {
      const local = clamp((p - ROW_BEATS[i]) / (ROW_BEATS[i + 1] - ROW_BEATS[i]));
      // First 42% of each beat is an actual reading hold, then a smooth descent.
      const move = ease((local - .42) / .58);
      position = i + move;
      if (p < ROW_BEATS[i + 1]) break;
    }
    const index = Math.min(rows.length - 2, Math.floor(position));
    const t = position - index;
    dot = {
      x: mix(rows[index].x, rows[index + 1].x, t),
      y: mix(rows[index].y, rows[index + 1].y, t),
      radius: mix(rows[index].radius, rows[index + 1].radius, t),
      scaleX: 1 - .055 * Math.sin(Math.PI * t) ** 2,
      scaleY: 1 / (1 - .055 * Math.sin(Math.PI * t) ** 2),
    };
  } else {
    phase = 'exit';
    position = rows.length - 1;
    dot = jump(rows.at(-1), exit, (p - EXIT_BEAT) / (1 - EXIT_BEAT), 22);
  }
  return {
    dot, position, phase,
    active: Math.round(position),
    selectionOpacity: ease((p - .135) / .065) * (1 - ease((p - EXIT_BEAT) / .05)),
    // Selection strip and actor share this exact y during the entire scan.
    selectionY: phase === 'scan' ? dot.y : phase === 'entry' ? rows[0].y : rows.at(-1).y,
    introOpacity: ease((p - .075) / .10),
    previousOpacity: 1 - ease((p - .025) / .075),
    nextOpacity: ease((p - .83) / .12),
  };
}
