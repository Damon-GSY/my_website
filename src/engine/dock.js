// Where a DOM element sits, in stage coordinates (pixels, origin at the centre of `frame`, y up).
// `frame` is the pinned viewport, so the result does not depend on the current scroll position.
export function dockRect(el, frame) {
  const r = el.getBoundingClientRect();
  const f = frame.getBoundingClientRect();
  return {
    x: r.left - f.left + r.width / 2 - f.width / 2,
    y: f.height / 2 - (r.top - f.top + r.height / 2),
    w: r.width,
    h: r.height,
  };
}
