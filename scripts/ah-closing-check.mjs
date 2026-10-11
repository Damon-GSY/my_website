import assert from 'node:assert/strict';
import { closingFrame, siteFrame } from '../public/design-lab/creative/ah-site-motion.mjs';
import { ease } from '../public/design-lab/creative/ah-journey.mjs';

// The final actor must arrive at the real email link before its arrow unfolds.
// Browser-measured document-space docks and text bounds protect the actual
// desktop/mobile route. Synthetic sizes cover additional supported layouts.
const fixtures = [
  {
    name: 'measured-desktop', width: 1169, height: 1148, maxScroll: 17908,
    start: 17508.89, end: 17884, laneY: 18285.6484375,
    source: { x: 633.4140625, y: 17956.609375, radius: 10 },
    target: { x: 1088.5546875, y: 18664.015625, radius: 1.1 },
    obstacles: [
      [58.4453125, 18501.15625, 529.2421875, 199.859375],
      [669.515625, 18545.46875, 389.0390625, 60.546875],
      [669.515625, 18644.765625, 188.8515625, 38.5],
      [663.4140625, 17992.609375, 447.140625, 91.640625],
      [663.4140625, 18104.25, 350, 23.3984375],
    ],
  },
  {
    name: 'measured-phone', width: 390, height: 844, maxScroll: 14394,
    start: 14060.07, end: 14370, laneY: 14683.421875,
    source: { x: 32, y: 14389.234375, radius: 8 },
    target: { x: 344, y: 15003.671875, radius: 1.1 },
    obstacles: [
      [24, 14761.421875, 302, 108.453125],
      [24, 14901.875, 290, 51.796875],
      [24, 14986.671875, 168.2890625, 34],
      [62, 14425.234375, 304, 78.390625],
      [62, 14523.625, 304, 46.796875],
    ],
  },
  {
    name: 'desktop', width: 1440, height: 900, maxScroll: 19200,
    start: 18420, end: 19176, laneY: 19100,
    source: { x: 778, y: 18771, radius: 10 },
    target: { x: 1317, y: 19620, radius: 1.1 },
  },
  {
    name: 'tall-desktop', width: 1169, height: 1148, maxScroll: 23600,
    start: 22780, end: 23576, laneY: 23490,
    source: { x: 631, y: 23227.72, radius: 10 },
    target: { x: 1085, y: 24320, radius: 1.1 },
  },
  {
    name: 'phone', width: 390, height: 844, maxScroll: 16720,
    start: 16050, end: 16696, laneY: 16540,
    source: { x: 32, y: 16379.16, radius: 8 },
    target: { x: 344, y: 17310, radius: 1.1 },
  },
];

const near = (a, b, keys, label, tolerance = 1e-7) => {
  for (const key of keys) assert.ok(Math.abs(a[key] - b[key]) <= tolerance,
    `${label}: ${key} ${a[key]} differs from ${b[key]}`);
};
const atProgress = (g, p) => g.start + (g.end - g.start) * p;
const inverseEase = target => {
  let low = 0, high = 1;
  for (let i = 0; i < 60; i++) {
    const middle = (low + high) / 2;
    if (ease(middle) < target) low = middle; else high = middle;
  }
  return (low + high) / 2;
};
let samples = 0;

for (const fixture of fixtures) {
  const { name, width, height, maxScroll, obstacles = [], ...closing } = fixture;
  const original = structuredClone(closing);
  assert.ok(closing.end > closing.start, `${name}: closing has a reachable positive scroll interval`);
  assert.ok(closing.end <= maxScroll, `${name}: morph completes before the scroll limit`);
  assert.ok(closing.source.y < closing.laneY && closing.laneY < closing.target.y,
    `${name}: lane lies between the actual source and destination`);

  const start = closingFrame(closing.start, closing);
  near(start.point, closing.source, ['x', 'y', 'radius'], `${name}: exact source`);
  assert.equal(start.dotOpacity, 1);
  assert.deepEqual(start.closing, { progress: 0, shaft: 0, head: 0 });
  assert.deepEqual(closingFrame(closing.start - height, closing), start,
    `${name}: earlier seeks clamp to departure`);

  for (const progress of [.72, .73, .78, .83, .88, .95, 1]) {
    const frame = closingFrame(atProgress(closing, progress), closing);
    near(frame.point, closing.target, ['x', 'y'], `${name}: docked at ${progress}`);
  }
  const final = closingFrame(closing.end, closing);
  near(final.point, closing.target, ['x', 'y', 'radius'], `${name}: resolved target`);
  assert.equal(final.dotOpacity, 0, `${name}: the dot is gone at rest`);
  assert.equal(final.closing.shaft, 1, `${name}: complete arrow shaft`);
  assert.equal(final.closing.head, 1, `${name}: complete arrow head`);
  assert.equal(final.phase, 'closing-rest');
  for (const scroll of [maxScroll, closing.end + height]) {
    assert.deepEqual(closingFrame(scroll, closing), final,
      `${name}: completed state stays attached in document coordinates`);
  }

  // Probe both rounded corners at their precise arclength boundaries. A
  // changed branch equation must not create a teleport at the join.
  const a = closing.source, b = closing.target;
  const turn = Math.min(24, Math.abs(b.x - a.x) / 2, closing.laneY - a.y, b.y - closing.laneY);
  const first = closing.laneY - a.y - turn;
  const across = Math.abs(b.x - a.x) - turn * 2;
  const last = b.y - closing.laneY - turn;
  const arc = Math.PI * turn / 2;
  const distance = first + across + last + 2 * arc;
  for (const join of [first, first + arc, first + arc + across, first + 2 * arc + across]) {
    const scroll = atProgress(closing, inverseEase(join / distance) * .72);
    const before = closingFrame(scroll - .0001, closing).point;
    const after = closingFrame(scroll + .0001, closing).point;
    assert.ok(Math.hypot(after.x - before.x, after.y - before.y) < .003,
      `${name}: rounded-corner continuity at ${join}`);
  }

  const positions = Array.from({ length: 1001 }, (_, i) => atProgress(closing, i / 1000));
  const baseline = positions.map((scroll, index) => {
    const frame = closingFrame(scroll, closing);
    for (const value of Object.values(frame.point)) assert.ok(Number.isFinite(value), `${name}: finite actor geometry`);
    assert.ok(frame.point.radius > 0 && frame.point.radius <= a.radius, `${name}: positive shrinking radius`);
    assert.ok(frame.point.x - frame.point.radius >= 0 && frame.point.x + frame.point.radius <= width,
      `${name}: actor fits horizontally`);
    assert.ok(frame.point.y >= a.y - 1e-7 && frame.point.y <= b.y + 1e-7,
      `${name}: route stays between the two document docks`);
    for (const value of [frame.dotOpacity, frame.closing.shaft, frame.closing.head]) {
      assert.ok(value >= -1e-12 && value <= 1 + 1e-12, `${name}: visibility is bounded`);
    }
    for (const [x, y, w, h] of obstacles) {
      const nearestX = Math.max(x, Math.min(x + w, frame.point.x));
      const nearestY = Math.max(y, Math.min(y + h, frame.point.y));
      assert.ok(Math.hypot(frame.point.x - nearestX, frame.point.y - nearestY) > frame.point.radius,
        `${name}: dot overlaps measured text bounds at sample ${index}`);
    }
    if (index <= 720) assert.equal(frame.closing.shaft, 0, `${name}: arrow waits for landing`);
    return frame;
  });
  for (let i = 1; i < baseline.length; i++) {
    const previous = baseline[i - 1], current = baseline[i];
    assert.ok(current.point.y >= previous.point.y - 1e-7, `${name}: route does not retreat vertically`);
    assert.ok(current.dotOpacity <= previous.dotOpacity + 1e-12, `${name}: resolve cannot revive the dot`);
    assert.ok(current.closing.shaft >= previous.closing.shaft - 1e-12 && current.closing.head >= previous.closing.head - 1e-12,
      `${name}: the arrow unfolds without reversing`);
    assert.ok(Math.hypot(current.point.x - previous.point.x, current.point.y - previous.point.y) <= distance * 2.61 / 1000 + 1e-6,
      `${name}: no route jump between samples ${i - 1}/${i}`);
  }
  for (let i = positions.length - 1; i >= 0; i--) {
    assert.deepEqual(closingFrame(positions[i], closing), baseline[i], `${name}: reverse seek ${i}`);
  }
  for (let i = 0; i < positions.length; i++) {
    const index = i * 73 % positions.length;
    assert.deepEqual(closingFrame(positions[index], closing), baseline[index], `${name}: direct seek ${index}`);
  }

  const geometry = {
    width, height, closing,
    tools: { start: 1, end: 2 },
    stops: [
      { id: 'principle-2', at: closing.start - height * .07, point: { ...a } },
      { id: 'principle-2-hold', at: closing.start, point: { ...a } },
      { id: 'contact', at: closing.end, point: { ...b } },
    ],
  };
  const geometryBefore = structuredClone(geometry);
  for (let i = 0; i < positions.length; i++) {
    assert.deepEqual(siteFrame(positions[i], geometry), baseline[i], `${name}: site uses the same closing actor ${i}`);
  }
  near(siteFrame(closing.start - .001, geometry).point, start.point, ['x', 'y', 'radius'],
    `${name}: native principle hold hands off without a jump`);
  assert.deepEqual(siteFrame(maxScroll, geometry), final, `${name}: site resolves at the physical bottom`);
  const withoutClosing = { ...geometry, closing: undefined };
  assert.deepEqual(siteFrame(closing.start - height * .04, geometry), siteFrame(closing.start - height * .04, withoutClosing),
    `${name}: closing does not alter the previous principle hold`);
  assert.deepEqual(closing, original, `${name}: source and target are not mutated`);
  assert.deepEqual(geometry, geometryBefore, `${name}: integration does not mutate layout`);
  samples += positions.length * 4;
}

console.log(`AH closing passed: ${fixtures.length} viewport fixtures (2 measured); ${samples} deterministic samples; reachable ending, text-clear route, rounded-route continuity, email docking, dot-to-arrow completion, reverse/direct seeks and site integration.`);
