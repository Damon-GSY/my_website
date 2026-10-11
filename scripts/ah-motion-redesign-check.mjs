import assert from 'node:assert/strict';
import { workFlight, researchFrame, RESEARCH_BEATS } from '../public/design-lab/creative/ah-journey.mjs';
import { bridgeFrame } from '../public/design-lab/creative/ah-bridge.mjs';
import { siteFrame } from '../public/design-lab/creative/ah-site-motion.mjs';

// These fixtures reserve actual reading regions instead of checking only that
// a curve is mathematically smooth. Font/layout bounds are checked in-browser.
const near = (a, b, label, tolerance = 1e-7) => {
  for (const key of ['x', 'y', 'radius']) assert.ok(Math.abs(a[key] - b[key]) <= tolerance,
    `${label}: ${key} ${a[key]} differs from ${b[key]}`);
};
const clear = (point, rect, label) => {
  const x = Math.max(rect.x, Math.min(rect.x + rect.width, point.x));
  const y = Math.max(rect.y, Math.min(rect.y + rect.height, point.y));
  const radius = point.radius * Math.max(point.scaleX ?? 1, point.scaleY ?? 1);
  assert.ok(Math.hypot(x - point.x, y - point.y) >= radius - 1e-7, `${label}: dot intersects readable content`);
};
const inside = (point, width, height, label) => {
  const rx = point.radius * (point.scaleX ?? 1), ry = point.radius * (point.scaleY ?? 1);
  assert.ok(point.x - rx >= -1e-7 && point.x + rx <= width + 1e-7, `${label}: horizontal clipping`);
  assert.ok(point.y - ry >= -1e-7 && point.y + ry <= height + 1e-7, `${label}: vertical clipping`);
};
function reversible(sample, label, count = 2000) {
  const frames = Array.from({ length: count + 1 }, (_, i) => sample(i / count));
  for (let i = count; i >= 0; i--) assert.deepEqual(sample(i / count), frames[i], `${label}: reverse ${i}`);
  // The same seek must work after unrelated jumps, not just adjacent frames.
  for (const i of [117, 1900, 410, 1, 2000, 0, 804]) {
    assert.deepEqual(sample(i / count), frames[i], `${label}: direct seek ${i}`);
  }
  return frames;
}

const workFixtures = [
  { name: 'measured desktop', width: 1169, height: 1148, header: 88, lane: 243.44677734375,
    from: { x: 148.44140625, y: 306.77734375, radius: 4.78515625 },
    to: { x: 967.3175048828, y: 306.77734375, radius: 11.3974609375 },
    text: [
      { x: 58.4453, y: 295, width: 529.2422, height: 157.59375, dock: 'from', pocket: 38 },
      { x: 669.5156, y: 269.4468, width: 441.0391, height: 138.8125, dock: 'to', pocket: 60 },
    ] },
  { name: 'measured phone', width: 390, height: 844, header: 72, lane: 163.171875,
    from: { x: 64.02734375, y: 205.23828125, radius: 2.12890625 },
    to: { x: 332.1742248535, y: 205.23828125, radius: 4.8671875 },
    text: [
      { x: 24, y: 200, width: 161, height: 105.140625, dock: 'from', pocket: 22 },
      { x: 205, y: 189.171875, width: 161, height: 59.2734375, dock: 'to', pocket: 24 },
    ] },
  { name: 'desktop', width: 1440, height: 900, header: 88, lane: 188,
    from: { x: 200, y: 360, radius: 7 }, to: { x: 1160, y: 360, radius: 15 },
    text: [{ x: 72, y: 378, width: 560, height: 220 }, { x: 860, y: 337, width: 248, height: 170 }] },
  { name: 'phone', width: 390, height: 844, header: 106, lane: 220,
    from: { x: 65, y: 310, radius: 2.2 }, to: { x: 333, y: 310, radius: 4.9 },
    text: [{ x: 24, y: 320, width: 202, height: 100 }, { x: 242, y: 304, width: 74, height: 56 }] },
];
let checks = 0;
for (const f of workFixtures) {
  const start = f.height * 2.4, end = start + f.height * 1.3;
  const from = { id: 'built-hold', at: start, point: { ...f.from, y: start + f.from.y } };
  const to = { id: 'percent', at: end, point: { ...f.to, y: end + f.to.y } };
  const original = structuredClone({ from, to });
  const sample = p => {
    const scroll = start + (end - start) * p;
    const point = workFlight(from, to, p, scroll, f.height, f.lane);
    return { ...point, y: point.y - scroll };
  };
  near(sample(0), f.from, `${f.name} Built i departure`);
  near(sample(1), f.to, `${f.name} percent-counter landing`);
  let previousX = f.from.x;
  const frames = reversible(sample, `${f.name} work`);
  frames.forEach((point, i) => {
    inside(point, f.width, f.height, `${f.name} work ${i}`);
    assert.ok(point.y >= f.lane - 1e-7 && point.y <= Math.max(f.from.y, f.to.y) + 1e-7,
      `${f.name}: route rebounds below the glyph baseline`);
    assert.ok(point.x >= previousX - 1e-7, `${f.name}: work route doubles back`);
    clear(point, { x: 0, y: 0, width: f.width, height: f.header }, `${f.name} header ${i}`);
    f.text.forEach((rect, n) => {
      // A DOM heading box includes the intentional i / percent counter dock.
      // Only that local docking pocket is exempt, never the full heading.
      const dock = rect.dock && f[rect.dock];
      if (!dock || Math.hypot(point.x - dock.x, point.y - dock.y) > rect.pocket) {
        clear(point, rect, `${f.name} text ${n} at ${i}`);
      }
    });
    previousX = point.x;
    checks++;
  });
  assert.deepEqual({ from, to }, original, `${f.name}: work seeking mutates measured glyphs`);
}

for (const [name, width, height, scale, origin] of [
  ['desktop', 1440, 900, 1, { x: 90, y: 240 }],
  ['phone', 390, 844, .6, { x: 39, y: 235 }],
]) {
  const rail = { cx: origin.x + 260 * scale, cy: origin.y + 270 * scale, rx: 190 * scale, ry: 160 * scale };
  const nodeAngles = [Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3, 2 * Math.PI];
  const nodes = nodeAngles.map(angle => ({ x: rail.cx + rail.rx * Math.cos(angle), y: rail.cy + rail.ry * Math.sin(angle), radius: 9 * scale }));
  const papers = name === 'desktop'
    ? [{ x: 820, y: 380, radius: 9 }, { x: 820, y: 630, radius: 9 }]
    : [{ x: 46, y: 570, radius: 6 }, { x: 46, y: 720, radius: 6 }];
  const g = { rail, nodes, nodeAngles, papers, paperLane: rail.cy - rail.ry - 30 };
  const original = structuredClone(g), sample = p => researchFrame(p, g);
  const names = ['AGENTIC RL', 'AGENTS', 'TOOLS', 'MEMORY'];
  RESEARCH_BEATS.nodes.forEach((beat, i) => {
    for (const p of [beat, beat + RESEARCH_BEATS.nodeHold / 2]) {
      const frame = sample(p);
      near(frame.dot, nodes[i], `${name}: ${names[i]} readable hold`);
      assert.equal(frame.activeNode, i, `${name}: wrong highlighted research topic`);
      assert.equal(frame.activePaper, -1, `${name}: paper highlighted before topic scan finishes`);
      assert.equal(frame.nodeWeights[i], 1, `${name}: research label must settle fully`);
    }
  });
  RESEARCH_BEATS.papers.forEach((beat, i) => {
    for (const p of [beat, Math.min(1, beat + RESEARCH_BEATS.paperHold / 2)]) {
      const frame = sample(p);
      near(frame.dot, papers[i], `${name}: paper ${i + 1} hold`);
      assert.equal(frame.activePaper, i, `${name}: wrong selected paper`);
      assert.equal(frame.paperWeights[i], 1, `${name}: paper label must settle fully`);
    }
  });
  const frames = reversible(sample, `${name} research`);
  frames.forEach((frame, i) => {
    inside(frame.dot, width, height, `${name} research ${i}`);
    frame.nodeWeights.concat(frame.paperWeights).forEach(weight => assert.ok(weight >= 0 && weight <= 1, `${name}: invalid research emphasis`));
    if (i) assert.ok(Math.hypot(frame.dot.x - frames[i - 1].dot.x, frame.dot.y - frames[i - 1].dot.y) < 9,
      `${name}: research actor jumps between sampled frames`);
    // Once at the papers, motion uses the left reading gutter, not titles.
    if (frame.progress >= RESEARCH_BEATS.papers[0]) {
      assert.ok(Math.abs(frame.dot.x - papers[0].x) < 1e-7, `${name}: paper-to-paper transfer cuts across a title`);
    }
    checks++;
  });
  const boundaries = [...RESEARCH_BEATS.nodes, ...RESEARCH_BEATS.nodes.map(p => p + RESEARCH_BEATS.nodeHold),
    RESEARCH_BEATS.paperDeparture, ...RESEARCH_BEATS.papers, RESEARCH_BEATS.papers[0] + RESEARCH_BEATS.paperHold];
  boundaries.filter(p => p > 0 && p < 1).forEach(p => {
    near(sample(p - 1e-7).dot, sample(p).dot, `${name} research incoming beat ${p}`, .002);
    near(sample(p + 1e-7).dot, sample(p).dot, `${name} research outgoing beat ${p}`, .002);
  });
  assert.deepEqual(g, original, `${name}: research seeking mutates measured docks`);
}

for (const [width, height] of [[1920, 1080], [1920, 720], [1440, 600], [390, 844], [375, 667]]) {
  const label = `bridge ${width}×${height}`;
  const g = { width, height, from: { x: width * .5, y: height * .5, radius: width < 720 ? 8 : 13 },
    to: { x: width * .17, y: height * .61, radius: width < 720 ? 6 : 10 } };
  const original = structuredClone(g), sample = p => bridgeFrame(p, g);
  near(sample(0).point, g.from, `${label}: incoming dock`);
  near(sample(1).point, g.to, `${label}: first research-node dock`);
  const frames = reversible(sample, label);
  frames.forEach((frame, i) => {
    inside(frame.point, width, height, `${label} actor ${i}`);
    const c = frame.copy, f = frame.frame;
    assert.ok(c.x >= 0 && c.right <= width && c.x < c.right, `${label}: text horizontal bounds`);
    for (const y of [c.overlineY, c.firstY, c.secondY, c.supportY, c.footerY]) {
      assert.ok(y > 0 && y < height, `${label}: text baseline outside viewport`);
    }
    if (c.firstOpacity > .1) assert.ok(c.firstY - c.fontSize * .8 > c.overlineY + 12, `${label}: title collides with overline`);
    if (c.supportOpacity > .1) {
      const gap = c.supportY - (frame.mobile ? 12 : 16) * .8 - (c.secondY + c.fontSize * .2);
      assert.ok(gap >= 8, `${label}: support copy collides with the heading (${gap}px gap)`);
    }
    assert.ok(f.x >= 0 && f.y >= 0 && f.x + f.width <= width && f.y + f.height <= height,
      `${label}: aperture extends beyond frame before expansion`);
    if (i) assert.ok(Math.hypot(frame.point.x - frames[i - 1].point.x, frame.point.y - frames[i - 1].point.y) < 10,
      `${label}: aperture actor teleports`);
    checks++;
  });
  for (const p of [.84, .9, 1]) {
    const c = sample(p).copy;
    for (const key of ['firstOpacity', 'secondOpacity', 'supportOpacity', 'metadataOpacity']) {
      assert.equal(c[key], 0, `${label}: bridge information remains over incoming research`);
    }
  }
  assert.deepEqual(g, original, `${label}: seeking mutates bridge docks`);
}

// Measured from the live sticky desktop/phone compositions. These node
// and paper Y values are stage-local, not document coordinates; confusing them
// used to make a correct standalone study break when integrated into the site.
const desktopResearch = {
  start: 12647.8, end: 15403,
  nodes: [
    { x: 123.7546, y: 751.874, radius: 10 }, { x: 212.3851, y: 622.6001, radius: 10 },
    { x: 389.6461, y: 622.6001, radius: 10 }, { x: 478.2766, y: 751.874, radius: 10 },
  ],
  papers: [{ x: 633.4141, y: 491.3281, radius: 10 }, { x: 633.4141, y: 741.4922, radius: 10 }],
  rail: { cx: 301.0156, cy: 751.874, rx: 177.263, ry: 149.274 },
  nodeAngles: [Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3, 2 * Math.PI],
  paperLane: 875.8281,
};
const phoneResearch = {
  start: 9382.09, end: 11407.69,
  nodes: [
    { x: 102.9231, y: 412.8384, radius: 8 }, { x: 148.9615, y: 345.688, radius: 8 },
    { x: 241.0385, y: 345.688, radius: 8 }, { x: 287.0769, y: 412.8384, radius: 8 },
  ],
  papers: [{ x: 32, y: 503.2891, radius: 8 }, { x: 32, y: 636.3828, radius: 8 }],
  rail: { cx: 195, cy: 412.8384, rx: 92.0769, ry: 77.5385 },
  nodeAngles: [Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3, 2 * Math.PI],
  paperLane: 482.9922,
};
const dock = (id, at, point) => ({ id, at, point: { ...point, y: point.y + at } });
const localPoint = (frame, scroll) => ({ ...frame.point, y: frame.point.y - scroll });
for (const [name, width, height, header, measuredResearch] of [
  ['desktop', 1169, 1148, 88, desktopResearch], ['phone', 390, 844, 72, phoneResearch],
]) {
const bridgeStart = measuredResearch.start - height * 2.3;
const entry = { x: width / 2, y: height / 2, radius: name === 'phone' ? 8 : 10 };
const researchEnd = dock('research-end', measuredResearch.end, measuredResearch.papers[1]);
const integrated = {
  width, height,
  tools: { start: bridgeStart - height * 2, end: bridgeStart - height },
  research: measuredResearch,
  stops: [dock('shape-in', bridgeStart, entry), dock('research', measuredResearch.start, measuredResearch.nodes[0]),
    researchEnd, { id: 'paper-02-hold', at: measuredResearch.end + height * .08, point: { ...researchEnd.point } },
    dock('blog', measuredResearch.end + height, { x: width * .7, y: height * .5, radius: 10 })],
};
const integratedOriginal = structuredClone(integrated);
for (const p of [0, .17, .38, .58, .84, .999]) {
  const scroll = bridgeStart + (measuredResearch.start - bridgeStart) * p;
  const frame = siteFrame(scroll, integrated);
  const expected = bridgeFrame(p, { width, height, from: entry, to: measuredResearch.nodes[0] });
  assert.equal(frame.phase, 'aperture→research', 'site must select the new bridge, not old orange takeover');
  near(localPoint(frame, scroll), expected.point, `integrated aperture progress ${p}`);
}
for (const p of [...RESEARCH_BEATS.nodes, ...RESEARCH_BEATS.papers, 1]) {
  const scroll = measuredResearch.start + (measuredResearch.end - measuredResearch.start) * p;
  const frame = siteFrame(scroll, integrated);
  const measuredProgress = (scroll - measuredResearch.start) / (measuredResearch.end - measuredResearch.start);
  const expected = researchFrame(measuredProgress, measuredResearch);
  assert.equal(frame.phase, `research-${expected.phase}`, `integrated research phase ${p}`);
  near(localPoint(frame, scroll), expected.dot, `integrated research docking ${p}`);
  assert.equal(frame.research.activeNode, expected.activeNode, `integrated research label ${p}`);
  assert.equal(frame.research.activePaper, expected.activePaper, `integrated research paper ${p}`);
}
for (const stop of integrated.stops.slice(0, -1)) {
  near(siteFrame(stop.at, integrated).point, stop.point, `integrated exact ${stop.id}`);
  near(siteFrame(stop.at - .001, integrated).point, stop.point, `integrated incoming ${stop.id}`, .0011);
  near(siteFrame(stop.at + .001, integrated).point, stop.point, `integrated outgoing ${stop.id}`, .0011);
}
const integratedFrames = reversible(p => {
  const scroll = bridgeStart + (measuredResearch.end - bridgeStart) * p;
  return { scroll, frame: siteFrame(scroll, integrated) };
}, `measured ${name} integrated aperture/research`);
integratedFrames.forEach(({ scroll, frame }, i) => {
  const point = localPoint(frame, scroll);
  inside(point, integrated.width, integrated.height, `integrated actor ${i}`);
  clear(point, { x: 0, y: 0, width, height: header }, `${name} integrated header ${i}`);
  if (name === 'phone' && frame.research?.progress > RESEARCH_BEATS.paperDeparture) {
    clear(point, { x: 125, y: 382, width: 135, height: 46 }, `phone research caption ${i}`);
    clear(point, { x: 145, y: 444, width: 105, height: 11 }, `phone research EVALUATION label ${i}`);
  }
  checks++;
});
assert.deepEqual(integrated, integratedOriginal, 'integrated seeking cannot mutate measured geometry');
}

console.log(`AH motion redesign passed: ${checks} frames; text-safe work corridor, 4 research-topic holds then 2 papers, reversible docking, aperture readability at 5 viewport sizes, measured site bridge/research integration.`);
