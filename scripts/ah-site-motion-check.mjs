import assert from 'node:assert/strict';
import { siteFrame } from '../public/design-lab/creative/ah-site-motion.mjs';
import { toolsFrame, ROW_BEATS } from '../public/design-lab/storyboard-v3/tools-motion.mjs';

// The integration must not replace the approved stage choreography or create
// a visible jump when the document-space actor enters/leaves that stage.
const near = (actual, expected, label, tolerance = 1e-7) => {
  for (const key of ['x', 'y', 'radius']) {
    assert.ok(Math.abs(actual[key] - expected[key]) <= tolerance,
      `${label}: ${key} ${actual[key]} differs from ${expected[key]}`);
  }
};
const fixtures = [
  {
    name: 'desktop', width: 1169, height: 1148,
    source: { x: 385, y: 251, radius: 14 },
    rows: ROW_BEATS.map((_, i) => ({ x: 740, y: 265 + 62 * i, radius: 10 })),
    exit: { x: 76, y: 740, radius: 10 },
    paper: { x: 647, y: 574, radius: 10 },
  },
  {
    name: 'phone', width: 390, height: 844,
    source: { x: 260, y: 119, radius: 9 },
    rows: ROW_BEATS.map((_, i) => ({ x: 45, y: 361 + 47 * i, radius: 8 })),
    exit: { x: 34, y: 758, radius: 8 },
    paper: { x: 34, y: 422, radius: 8 },
  },
];
let approvedSamples = 0, routeSamples = 0, bridgeSamples = 0;

for (const { name, width, height, source, rows, exit, paper } of fixtures) {
  const tools = { start: height * 3, end: height * 7.5, source, rows, exit };
  const dock = (id, at, point) => ({ id, at, point: { ...point, y: point.y + at } });
  const shapeAt = tools.end + height;
  const researchAt = shapeAt + height * 2;
  const research = dock('research', researchAt, paper);
  const stops = [
    dock('percent-hold', tools.start - height * .7, { x: width * .8, y: height * .45, radius: source.radius }),
    dock('tools-start', tools.start, source),
    dock('tools-end', tools.end, exit),
    dock('shape-in', shapeAt, { x: width * .5, y: height * .5, radius: exit.radius }),
    research,
    { id: 'research-hold', at: researchAt + height * .1, point: { ...research.point } },
    dock('paper-02', researchAt + height * .7, { ...paper, y: height * .46 }),
  ];
  const geometry = { tools, stops, width, height };
  const original = structuredClone(geometry);
  const sample = scroll => siteFrame(scroll, geometry);
  const viewportPoint = (frame, scroll) => ({ ...frame.point, y: frame.point.y - scroll });

  for (let i = 0; i <= 1000; i++) {
    const scroll = tools.start + (tools.end - tools.start) * i / 1000;
    const local = toolsFrame((scroll - tools.start) / (tools.end - tools.start), tools);
    const integrated = sample(scroll);
    near(viewportPoint(integrated, scroll), local.dot, `${name} approved tools sample ${i}`);
    assert.equal(integrated.phase, `tools-${local.phase}`);
    assert.deepEqual(integrated.tools, local, `${name} the stage retains its selection/text timing`);
    if (local.phase === 'scan') {
      assert.ok(Math.abs(integrated.point.y - scroll - local.selectionY) < 1e-7,
        `${name} selection strip and actor remain aligned in viewport space`);
    }
    approvedSamples++;
  }

  // A stopped scroll should leave the dot attached to the active row while
  // the native document scroll increases through each reading hold.
  for (const [index, beat] of ROW_BEATS.entries()) {
    for (const progress of [beat, beat + .025]) {
      const scroll = tools.start + (tools.end - tools.start) * progress;
      near(viewportPoint(sample(scroll), scroll), rows[index], `${name} row ${index + 1} pinned hold`);
    }
  }

  // Probe both sides of the ownership boundaries, not just the exact frame.
  // A 0.001px scroll may shift document Y by 0.001px, but never teleport.
  for (const stop of stops.slice(1, -1)) {
    near(sample(stop.at).point, stop.point, `${name} exact ${stop.id}`);
    near(sample(stop.at - .001).point, stop.point, `${name} entering ${stop.id}`, .0011);
    near(sample(stop.at + .001).point, stop.point, `${name} leaving ${stop.id}`, .0011);
  }
  for (const progress of [0, .25, .5, .75, 1]) {
    near(sample(researchAt + height * .1 * progress).point, research.point,
      `${name} research is a native document hold`);
  }

  // The new handoff opens a black aperture behind one small orange actor.
  // The panel, not the actor's radius, must cover all four viewport corners.
  for (const progress of [.73, .8, .9]) {
    const scroll = shapeAt + (researchAt - shapeAt) * progress;
    const frame = sample(scroll), panel = frame.bridge.panel;
    assert.equal(frame.phase, 'aperture→research');
    for (const [x, y] of [[0, 0], [width, 0], [0, height], [width, height]]) {
      assert.ok(panel.x <= x && panel.y <= y && panel.x + panel.width >= x && panel.y + panel.height >= y,
        `${name} aperture panel covers viewport corner ${x},${y}`);
    }
  }
  for (let i = 0; i < 1000; i++) {
    const scroll = shapeAt + (researchAt - shapeAt) * i / 1000;
    const frame = sample(scroll), point = viewportPoint(frame, scroll);
    assert.equal(frame.phase, 'aperture→research', `${name}: site must not select the old orange takeover`);
    assert.ok(point.radius > 0 && point.radius <= Math.max(exit.radius, paper.radius, width < 720 ? 9 : 13) + 1e-7,
      `${name}: the focus must remain a small visible dot`);
    assert.ok(point.x - point.radius >= 0 && point.x + point.radius <= width &&
      point.y - point.radius >= 0 && point.y + point.radius <= height, `${name}: aperture actor is clipped`);
    near(point, frame.bridge.point, `${name}: integrated aperture uses the same actor ${i}`);
    bridgeSamples++;
  }

  const positions = Array.from({ length: 1001 }, (_, i) =>
    stops[0].at + (stops.at(-1).at - stops[0].at) * i / 1000);
  const forward = positions.map(scroll => {
    const frame = sample(scroll);
    for (const key of ['x', 'y', 'radius']) assert.ok(Number.isFinite(frame.point[key]), `${name} finite ${key}`);
    assert.ok(frame.point.radius > 0, `${name} actor retains a positive radius`);
    return frame;
  });
  for (let i = positions.length - 1; i >= 0; i--) {
    assert.deepEqual(sample(positions[i]), forward[i], `${name} reverse seek ${i}`);
  }
  for (let i = 0; i < positions.length; i++) {
    const index = i * 73 % positions.length;
    assert.deepEqual(sample(positions[index]), forward[index], `${name} direct seek ${index}`);
  }
  assert.deepEqual(geometry, original, `${name} animation cannot mutate layout-derived endpoints`);
  routeSamples += positions.length * 3;
}

console.log(`AH site motion passed: ${fixtures.length} viewports, ${approvedSamples} approved-tools samples, ${bridgeSamples} aperture samples, ${routeSamples} route seeks; stage/document conversion, pinned row holds, tool/aperture/research joins and reversible full-route geometry.`);
