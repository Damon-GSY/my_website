import assert from 'node:assert/strict';
import { openingTimeline, openingFrame, siteFrame } from '../public/design-lab/creative/ah-site-motion.mjs';
import { workStops } from '../public/design-lab/creative/ah-journey.mjs';
import { ROW_BEATS, toolsFrame } from '../public/design-lab/storyboard-v3/tools-motion.mjs';

// Protect the two shared-stage handoffs that previously scrolled independent
// compositions through one another. These beats describe editorial sequencing,
// while the actor checks ensure the quiet handoff still has a visible subject.
const near = (actual, expected, label, tolerance = 1e-7) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} differs from ${expected}`);
const samePoint = (actual, expected, label, tolerance) => {
  for (const key of ['x', 'y', 'radius']) near(actual[key], expected[key], `${label} ${key}`, tolerance);
};
const visibleActor = (point, scroll, width, height, label) => {
  for (const key of ['x', 'y', 'radius', 'scaleX', 'scaleY']) {
    assert.ok(Number.isFinite(point[key]), `${label}: ${key} is finite`);
  }
  assert.ok(point.radius > 0 && point.scaleX > 0 && point.scaleY > 0, `${label}: actor cannot vanish`);
  const rx = point.radius * point.scaleX, ry = point.radius * point.scaleY;
  assert.ok(point.x - rx >= 0 && point.x + rx <= width, `${label}: actor stays horizontally in the shared stage`);
  assert.ok(point.y - scroll - ry >= 0 && point.y - scroll + ry <= height, `${label}: actor stays vertically in the shared stage`);
};
const opacityKeys = ['hero', 'heroContext', 'workTitle', 'workContext', 'metric', 'toolsTitle', 'toolsList', 'toolsContext'];
const fixtures = [
  { name: 'desktop', width: 1169, height: 1148, start: 0,
    hero: { x: 608, y: 436, radius: 7 },
    built: { x: 151, y: 482, radius: 5 },
    percent: { x: 953, y: 482, radius: 12 },
    rows: ROW_BEATS.map((_, i) => ({ x: 740, y: 285 + i * 62, radius: 10 })),
    exit: { x: 76, y: 740, radius: 10 } },
  { name: 'phone', width: 390, height: 844, start: 76,
    hero: { x: 203, y: 321, radius: 3.5 },
    built: { x: 65, y: 310, radius: 2.2 },
    percent: { x: 333, y: 310, radius: 4.9 },
    rows: ROW_BEATS.map((_, i) => ({ x: 45, y: 361 + i * 47, radius: 8 })),
    exit: { x: 34, y: 758, radius: 8 } },
];
let compositionSamples = 0, actorSamples = 0;

for (const f of fixtures) {
  const { name, width, height, start } = f;
  const timeline = openingTimeline(height, start);
  near(timeline.start, start, `${name} stage begins at its document offset`);
  near(timeline.heroEnd - start, height * .9, `${name} opening film duration`);
  near(timeline.heroHoldEnd - timeline.heroEnd, height * .2, `${name} identity reading hold`);
  near(timeline.workStart - timeline.heroHoldEnd, height * .85, `${name} identity-to-work handoff`);
  near(timeline.workSpan, height * 1.7, `${name} work scene duration`);
  near(timeline.toolsStart, timeline.workStart + timeline.workSpan, `${name} tools begins in the same stage`);
  near(timeline.toolsEnd - timeline.toolsStart, height * 4.6, `${name} approved tools reading distance`);
  const identityAt = p => timeline.heroHoldEnd + (timeline.workStart - timeline.heroHoldEnd) * p;
  const toolsAt = p => timeline.toolsStart + (timeline.toolsEnd - timeline.toolsStart) * p;
  const frame = scroll => openingFrame(scroll, timeline);

  for (const scroll of [start, timeline.heroEnd, timeline.heroHoldEnd]) {
    const composition = frame(scroll);
    near(composition.hero, 1, `${name} complete identity remains through its hold`);
    near(composition.heroContext, 1, `${name} hero supporting content remains through its hold`);
    for (const key of ['workTitle', 'workContext', 'metric', 'toolsTitle', 'toolsList', 'toolsContext']) {
      near(composition[key], 0, `${name} incoming ${key} is not pre-exposed`);
    }
  }
  near(frame(identityAt(.25)).heroContext, 0, `${name} supporting hero content clears first`);
  near(frame(identityAt(.39)).hero, 0, `${name} hero title is gone before Work enters`);
  near(frame(identityAt(.39)).workTitle, 0, `${name} Work title does not cross-fade over the outgoing hero`);
  near(frame(identityAt(.79)).workTitle, 1, `${name} Work title is readable before landing`);
  near(frame(timeline.workStart).workTitleY, 0, `${name} Work title settles before its reading hold`);
  near(frame(timeline.workStart + timeline.workSpan * .13).workContext, 1, `${name} work explanation completes its entrance`);
  near(frame(timeline.workStart + timeline.workSpan * .12).metric, 0, `${name} result waits for the work explanation`);
  near(frame(timeline.workStart + timeline.workSpan * .37).metric, 1, `${name} result is ready for the percentage landing`);

  for (const p of [0, .0125, .025]) {
    near(frame(toolsAt(p)).metric, 1, `${name} the original percentage remains through departure anticipation ${p}`);
  }
  near(frame(toolsAt(.055)).workContext, 0, `${name} work details clear before discovery enters`);
  near(frame(toolsAt(.065)).workTitle, 0, `${name} work title clears before discovery enters`);
  near(frame(toolsAt(.075)).metric, 0, `${name} single percentage clears after dot departure`);
  near(frame(toolsAt(.075)).toolsTitle, 0, `${name} Discover waits for outgoing information`);
  near(frame(toolsAt(.08)).toolsList, 0, `${name} table waits until the old metric is gone`);
  near(frame(toolsAt(.175)).toolsTitle, 1, `${name} Discover is fully readable before row 01 landing`);
  near(frame(toolsAt(.18)).toolsList, 1, `${name} table is fully readable before row 01 landing`);
  for (const p of [0, .08, .135, .165]) {
    near(frame(toolsAt(p)).toolsContext, 0, `${name} tool supporting content leaves the entry arc clear until .165 (${p})`);
  }
  near(frame(toolsAt(.2)).toolsContext, 1, `${name} tool supporting content is readable when row 01 lands`);

  const dock = (id, at, point) => ({ id, at, point: { ...point, y: point.y + at } });
  const tools = { start: timeline.toolsStart, end: timeline.toolsEnd, source: f.percent, rows: f.rows, exit: f.exit };
  const stops = [
    dock('hero', timeline.heroEnd, f.hero),
    dock('hero-hold', timeline.heroHoldEnd, f.hero),
    ...workStops(f.built, f.percent, timeline.workStart, timeline.workSpan),
    dock('tools-start', tools.start, f.percent),
    dock('tools-end', tools.end, f.exit),
    dock('shape-in', tools.end + height, { x: width * .5, y: height * .5, radius: f.exit.radius }),
  ];
  const geometry = { width, height, tools, stops };
  const original = structuredClone({ timeline, geometry });
  const sample = scroll => siteFrame(scroll, geometry);
  const viewportPoint = (result, scroll) => ({ ...result.point, y: result.point.y - scroll });

  for (const stop of stops.slice(0, -1)) {
    samePoint(sample(stop.at).point, stop.point, `${name} exact shared-stage ${stop.id}`);
    if (stop.at > timeline.heroEnd) {
      samePoint(sample(stop.at - .001).point, stop.point, `${name} ${stop.id} incoming continuity`, .0011);
    }
    samePoint(sample(stop.at + .001).point, stop.point, `${name} ${stop.id} outgoing continuity`, .0011);
  }
  for (const p of [0, .0125, .025]) {
    const scroll = toolsAt(p);
    samePoint(viewportPoint(sample(scroll), scroll), f.percent, `${name} no second percentage dock during tools anticipation ${p}`);
  }
  for (const [index, p] of ROW_BEATS.entries()) {
    const scroll = toolsAt(p), integrated = sample(scroll);
    samePoint(viewportPoint(integrated, scroll), f.rows[index], `${name} approved row ${index + 1} landing`);
    const measuredProgress = (scroll - tools.start) / (tools.end - tools.start);
    assert.deepEqual(integrated.tools, toolsFrame(measuredProgress, tools), `${name} row ${index + 1} retains the approved tool choreography`);
  }

  const positions = Array.from({ length: 1001 }, (_, i) => timeline.heroEnd + (timeline.toolsEnd - timeline.heroEnd) * i / 1000);
  const forward = positions.map(scroll => {
    const composition = frame(scroll), actor = sample(scroll);
    for (const key of opacityKeys) {
      assert.ok(composition[key] >= -1e-7 && composition[key] <= 1 + 1e-7, `${name} ${key} is a valid opacity`);
    }
    if (composition.toolProgress <= .165) {
      near(composition.toolsContext, 0, `${name} entry arc has no supporting-text overlap`);
    }
    if (composition.workTitle > 0) {
      near(composition.hero, 0, `${name} incoming Work does not overlap the hero title`);
      near(composition.heroContext, 0, `${name} incoming Work does not overlap hero supporting information`);
    }
    if (composition.toolsTitle > 0 || composition.toolsList > 0) {
      for (const key of ['workTitle', 'workContext', 'metric']) {
        near(composition[key], 0, `${name} discovery has no leftover ${key}`);
      }
    }
    // Even when both text hierarchies are deliberately absent, the same
    // orange actor remains in view instead of leaving a blank cut.
    visibleActor(actor.point, scroll, width, height, `${name} shared-stage frame`);
    if (scroll >= tools.start) {
      const approved = toolsFrame(composition.toolProgress, tools);
      samePoint(viewportPoint(actor, scroll), approved.dot, `${name} approved tool motion remains unchanged`);
    }
    compositionSamples++;
    actorSamples++;
    return { composition, actor };
  });
  for (let i = positions.length - 1; i >= 0; i--) {
    assert.deepEqual({ composition: frame(positions[i]), actor: sample(positions[i]) }, forward[i], `${name} reverse seek ${i}`);
  }
  for (let i = 0; i < positions.length; i++) {
    const index = i * 73 % positions.length;
    assert.deepEqual({ composition: frame(positions[index]), actor: sample(positions[index]) }, forward[index], `${name} direct seek ${index}`);
  }
  assert.deepEqual({ timeline, geometry }, original, `${name} seeking cannot mutate shared-stage geometry`);
}

console.log(`AH opening flow passed: ${fixtures.length} viewports, ${compositionSamples} composition frames and ${actorSamples} visible actor frames; ordered text exits/entries, one percentage dock, continuous shared-stage handoffs, unchanged tool row beats, reversible seeking.`);
