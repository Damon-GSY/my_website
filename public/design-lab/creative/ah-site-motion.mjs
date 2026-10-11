import { clamp, ease, segment, flight, workFlight, researchFrame } from './ah-journey.mjs';
import { toolsFrame } from '../storyboard-v3/tools-motion.mjs';
import { bridgeFrame } from './ah-bridge.mjs';

// Three compositions share one pinned surface. These beats are scroll
// distances, not timers; the page can be stopped or reversed at any frame.
export function openingTimeline(height, start = 0) {
  const heroEnd = start + height * .9;
  const heroHoldEnd = start + height * 1.1;
  const workStart = start + height * 1.95;
  const workSpan = height * 1.7;
  const toolsStart = workStart + workSpan;
  return { start, heroEnd, heroHoldEnd, workStart, workSpan,
    toolsStart, toolsEnd: toolsStart + height * 4.6 };
}

// Outgoing context leaves before the incoming hierarchy becomes readable.
// In the second handoff the SAME percentage remains in place until the dot
// departs; there is no duplicate metric on a second screen.
export function openingFrame(scroll, timeline) {
  const t = clamp((scroll - timeline.heroHoldEnd) / (timeline.workStart - timeline.heroHoldEnd));
  const toolProgress = clamp((scroll - timeline.toolsStart) / (timeline.toolsEnd - timeline.toolsStart));
  return {
    hero: 1 - ease((t - .04) / .35),
    heroContext: 1 - ease(t / .25),
    workTitle: ease((t - .39) / .4) * (1 - ease(toolProgress / .065)),
    workTitleY: 20 * (1 - ease((t - .39) / .4)),
    workContext: ease((scroll - timeline.workStart) / ((timeline.workSpan) * .13)) * (1 - ease(toolProgress / .055)),
    metric: ease((scroll - timeline.workStart - timeline.workSpan * .12) / (timeline.workSpan * .25)) * (1 - ease((toolProgress - .025) / .05)),
    toolsTitle: ease((toolProgress - .075) / .1),
    toolsList: ease((toolProgress - .08) / .10),
    toolsContext: ease((toolProgress - .165) / .035),
    toolProgress,
    handoff: scroll < timeline.heroHoldEnd ? 'intro' : scroll < timeline.workStart ? 'identity-to-work' : scroll < timeline.toolsStart ? 'work' : toolProgress < .2 ? 'outcome-to-discovery' : 'tools',
  };
}

// The approved tool study keeps its own stage-local choreography. The site
// supplies the two document-space handoffs, without creating another actor.
export function siteFrame(scroll, geometry) {
  const { stops, tools, height, width } = geometry;
  if (geometry.closing && scroll >= geometry.closing.start) return closingFrame(scroll, geometry.closing);
  if (scroll >= tools.start && scroll <= tools.end) {
    const frame = toolsFrame((scroll - tools.start) / (tools.end - tools.start), tools);
    return { point: { ...frame.dot, y: frame.dot.y + scroll }, phase: 'tools-' + frame.phase, tools: frame };
  }
  if (geometry.research && scroll >= geometry.research.start && scroll <= geometry.research.end) {
    const frame = researchFrame((scroll - geometry.research.start) / (geometry.research.end - geometry.research.start), geometry.research);
    return { point: { ...frame.dot, y: frame.dot.y + scroll }, phase: 'research-' + frame.phase, research: frame };
  }
  const leg = segment(stops, scroll), { from, to, progress } = leg;
  if (from.id === 'built-hold' && to.id === 'percent' && Number.isFinite(geometry.workLane)) {
    return { point: workFlight(from, to, progress, scroll, height, geometry.workLane), phase: 'built-hold→percent' };
  }
  if (from.id === 'shape-in' && to.id === 'research') {
    const bridge = bridgeFrame(progress, { width, height,
      from: { ...from.point, y: from.point.y - from.at },
      to: { ...to.point, y: to.point.y - to.at } });
    return { point: { ...bridge.point, y: bridge.point.y + scroll }, phase: 'aperture→research', bridge };
  }
  return { point: flight(from, to, progress, scroll, height), phase: from.id + '→' + to.id };
}

// The closing route lives in document space: down the principle gutter,
// across the empty section margin, then down the email's right-hand rail.
// The destination is a real link, so it stays docked as the footer scrolls.
export function closingFrame(scroll, g) {
  const p = clamp((scroll - g.start) / (g.end - g.start));
  const t = ease(p / .72), a = g.source, b = g.target;
  const direction = b.x < a.x ? -1 : 1;
  const turn = Math.min(24, Math.abs(b.x - a.x) / 2, g.laneY - a.y, b.y - g.laneY);
  const first = g.laneY - a.y - turn, across = Math.abs(b.x - a.x) - 2 * turn;
  const last = b.y - g.laneY - turn, arc = Math.PI * turn / 2;
  let distance = t * (first + across + last + 2 * arc), x, y;
  if (distance < first) {
    x = a.x; y = a.y + distance;
  } else if ((distance -= first) < arc) {
    const angle = distance / turn;
    x = a.x + direction * turn * (1 - Math.cos(angle));
    y = g.laneY - turn + turn * Math.sin(angle);
  } else if ((distance -= arc) < across) {
    x = a.x + direction * (turn + distance); y = g.laneY;
  } else if ((distance -= across) < arc) {
    const angle = distance / turn;
    x = b.x - direction * turn * (1 - Math.sin(angle));
    y = g.laneY + turn * (1 - Math.cos(angle));
  } else {
    x = b.x; y = g.laneY + turn + Math.min(last, distance - arc);
  }
  if (t === 0) { x = a.x; y = a.y; }
  if (t === 1) { x = b.x; y = b.y; }
  const shrink = ease((p - .73) / .14), shaft = ease((p - .78) / .18), head = ease((p - .88) / .12);
  return {
    point: { x, y, radius: a.radius * (1 - shrink) + 1.1 * shrink, scaleX: 1, scaleY: 1 },
    dotOpacity: 1 - ease((p - .83) / .12),
    closing: { progress: p, shaft, head },
    phase: p < .72 ? 'closing-arrive' : p < 1 ? 'closing-resolve' : 'closing-rest',
  };
}

export function workFrame(progress) {
  const p = clamp(progress);
  return {
    policy: [0, 1, 2, 3].map(i => ease((p - .13 - i * .115) / .18)),
    result: ease((p - .4) / .3),
  };
}
