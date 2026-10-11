// The research handoff is one reversible composition. The caller owns the
// orange actor; this module only opens the aperture that the actor traces.
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => { const t = clamp(value); return t * t * t * (t * (t * 6 - 15) + 10); };
const mix = (a, b, t) => a + (b - a) * t;
const beat = (p, a, b) => ease((p - a) / (b - a));

function line(a, b, t) {
  return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), radius: mix(a.radius, b.radius, t) };
}

function arc(a, b, t, bend) {
  const point = line(a, b, t);
  point.x += Math.sin(Math.PI * t) ** 2 * bend;
  return point;
}

/** All coordinates, including from/to and returned point, are viewport-local. */
export function bridgeFrame(progress, { width, height, from, to }) {
  const p = clamp(progress), mobile = width < 720;
  const gutter = mobile ? 24 : Math.max(52, width * .08);
  const x = gutter, y = Math.max(mobile ? 144 : 162, height * .245);
  const w = width - gutter * 2, h = Math.min(height * .49, mobile ? 380 : 520);
  const radius = mobile ? 9 : 13;
  const a = { x, y, radius }, b = { x: x + w, y, radius };
  const c = { x: x + w, y: y + h, radius };
  let point;
  if (p < .17) point = arc(from, a, beat(p, 0, .17), -Math.min(64, width * .07));
  else if (p < .38) point = line(a, b, beat(p, .17, .38));
  else if (p < .58) point = line(b, c, beat(p, .38, .58));
  else if (p < .84) point = c;
  else point = arc(c, to, beat(p, .84, 1), Math.min(60, width * .07));
  // Explicit endpoint assignment avoids even a subpixel docking discrepancy.
  if (p === 0) point = { ...from };
  if (p === 1) point = { ...to };

  const unfold = beat(p, .38, .58), expand = beat(p, .58, .73);
  const leave = 1 - beat(p, .75, .83);
  const firstIn = beat(p, .15, .29), secondIn = beat(p, .32, .51);
  const frameOpacity = beat(p, .10, .19) * (1 - beat(p, .64, .76));
  const textX = x + (mobile ? 19 : 36), textRight = x + w - (mobile ? 19 : 36);
  const fontSize = mobile ? Math.min(47, w * .111, h * .23) : Math.min(112, w * .079, h * .23);
  return {
    progress: p, width, height, mobile, point,
    opacity: beat(p, 0, .065) * (1 - beat(p, .94, 1)),
    // The black plane grows behind the point as it traces the right edge,
    // then expands from the frame to all four corners. It never turns orange.
    panel: {
      x: mix(x, -2, expand), y: mix(y, -2, expand),
      width: mix(w, width + 4, expand), height: mix(h * unfold, height + 4, expand),
    },
    frame: { x, y, width: w, height: h, opacity: frameOpacity,
      top: beat(p, .17, .38), right: unfold },
    copy: {
      x: textX, right: textRight, fontSize,
      overlineY: y + (mobile ? 36 : 49),
      firstY: y + h * .41 + (1 - firstIn) * 18,
      secondY: y + h * .41 + fontSize * 1.2 + (1 - secondIn) * 23,
      supportY: y + h - (mobile ? 35 : 44),
      firstOpacity: firstIn * (1 - secondIn * .54) * leave,
      secondOpacity: secondIn * leave,
      supportOpacity: beat(p, .48, .60) * leave,
      metadataOpacity: beat(p, .13, .25) * leave,
      footerY: Math.min(height - 48, y + h + (mobile ? 39 : 62)),
    },
  };
}

/** Create once; render any frame in any order. Does not create an orange dot. */
export function createBridge(group) {
  const id = 'ah-research-aperture';
  const content = `
    <path data-frame fill="none" stroke="currentColor" stroke-width="1"/>
    <path data-corners fill="none" stroke="currentColor" stroke-width="2"/>
    <g font-family="Cartograph,monospace" font-size="10" letter-spacing="1">
      <text data-overline>FROM SYSTEMS / TO RESEARCH</text>
      <text data-index text-anchor="end">02 → 03</text>
      <text data-footer>ACTION → EVIDENCE → LEARNING</text>
    </g>
    <g font-family="Manrope,Arial,sans-serif" font-weight="650" letter-spacing="-.055em">
      <text data-first>Built to act.</text>
      <text data-second>Tested to adapt.</text>
    </g>
    <text data-support font-family="Manrope,'PingFang SC',sans-serif" font-weight="450"/>
  `;
  group.innerHTML = `
    <defs><clipPath id="${id}"><rect data-clip/></clipPath></defs>
    <rect data-paper fill="#f4f0e7"/>
    <rect data-panel fill="#121212"/>
    <g data-light color="#121212">${content}</g>
    <g data-dark color="#f4f0e7" clip-path="url(#${id})">${content}</g>
  `;
  group.setAttribute('pointer-events', 'none');
  const paper = group.querySelector('[data-paper]');
  const panel = group.querySelector('[data-panel]');
  const clip = group.querySelector('[data-clip]');
  const layers = ['light', 'dark'].map(name => {
    const element = group.querySelector(`[data-${name}]`);
    return Object.fromEntries(['frame', 'corners', 'overline', 'index', 'footer', 'first', 'second', 'support']
      .map(key => [key, element.querySelector(`[data-${key}]`)]));
  });
  const attrs = (element, values) => Object.entries(values).forEach(([key, value]) => element.setAttribute(key, value));
  return {
    render(state, language = 'zh') {
      if (!state) { group.setAttribute('opacity', '0'); return; }
      const { width, height, mobile, frame: f, copy: c } = state;
      group.setAttribute('opacity', state.opacity);
      attrs(paper, { x: 0, y: 0, width, height });
      attrs(panel, state.panel); attrs(clip, state.panel);
      const right = f.x + f.width, bottom = f.y + f.height, corner = mobile ? 10 : 18;
      const outline = `M${f.x},${f.y}H${f.x + f.width * f.top} M${right},${f.y}V${f.y + f.height * f.right}`;
      const corners = `M${f.x},${f.y + corner}V${f.y}H${f.x + corner} M${right - corner},${bottom}H${right}V${bottom - corner}`;
      for (const nodes of layers) {
        attrs(nodes.frame, { d: outline, opacity: f.opacity * .38 });
        attrs(nodes.corners, { d: corners, opacity: f.opacity });
        attrs(nodes.overline, { x: c.x, y: c.overlineY, opacity: c.metadataOpacity * .6, 'font-size': mobile ? 7 : 10 });
        attrs(nodes.index, { x: c.right, y: c.overlineY, opacity: mobile ? 0 : c.metadataOpacity * .6 });
        attrs(nodes.footer, { x: f.x, y: c.footerY, opacity: c.metadataOpacity * .5, 'font-size': mobile ? 8 : 10 });
        attrs(nodes.first, { x: c.x, y: c.firstY, 'font-size': c.fontSize, opacity: c.firstOpacity, fill: 'currentColor' });
        attrs(nodes.second, { x: c.x, y: c.secondY, 'font-size': c.fontSize, opacity: c.secondOpacity, fill: 'currentColor' });
        attrs(nodes.support, { x: c.x, y: c.supportY, 'font-size': mobile ? 12 : 16, opacity: c.supportOpacity * .7, fill: 'currentColor' });
        nodes.support.textContent = language === 'en' ? 'After action comes evaluation.' : '行动之后，还要验证。';
        // Text needs explicit fill; the duplicate layer is inverted only where
        // the advancing black aperture clips it, so contrast never flashes.
        for (const name of ['overline', 'index', 'footer']) nodes[name].setAttribute('fill', 'currentColor');
      }
    },
  };
}
