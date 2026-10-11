import assert from 'node:assert/strict';
import { toolsFrame, ROW_BEATS, EXIT_BEAT } from '../public/design-lab/storyboard-v3/tools-motion.mjs';
const fixtures = [
  { source: { x: 385, y: 251, radius: 14 }, rows: ROW_BEATS.map((_, i) => ({ x: 740, y: 265 + 62 * i, radius: 10 })), exit: { x: 76, y: 740, radius: 10 } },
  { source: { x: 260, y: 119, radius: 9 }, rows: ROW_BEATS.map((_, i) => ({ x: 45, y: 361 + 47 * i, radius: 8 })), exit: { x: 34, y: 758, radius: 8 } },
];
const near = (a, b, label, epsilon = 1e-6) => {
  for (const key of ['x', 'y', 'radius']) assert.ok(Math.abs(a[key] - b[key]) < epsilon, `${label} ${key}: ${a[key]} vs ${b[key]}`);
};
let samples = 0;
for (const geometry of fixtures) {
  near(toolsFrame(0, geometry).dot, geometry.source, 'source');
  near(toolsFrame(1, geometry).dot, geometry.exit, 'exit');
  for (let i = 0; i < ROW_BEATS.length; i++) {
    for (const p of [ROW_BEATS[i], ROW_BEATS[i] + .025]) {
      const frame = toolsFrame(p, geometry);
      near(frame.dot, geometry.rows[i], `hold ${i}`);
      assert.equal(frame.active, i);
      assert.equal(frame.selectionY, frame.dot.y, 'strip shares dot Y');
    }
  }
  for (const p of [.025, ...ROW_BEATS, EXIT_BEAT, 1]) {
    near(toolsFrame(p - 1e-7, geometry).dot, toolsFrame(p + 1e-7, geometry).dot, `continuous ${p}`, 1e-4);
  }
  const reference = Array.from({ length: 1001 }, (_, i) => toolsFrame(i / 1000, geometry));
  for (let i = 1000; i >= 0; i--) {
    const frame = toolsFrame(i / 1000, geometry);
    assert.deepEqual(frame, reference[i], 'reverse scroll is deterministic');
    for (const value of Object.values(frame.dot)) assert.ok(Number.isFinite(value));
    assert.ok(frame.dot.scaleX > 0 && frame.dot.scaleY > 0);
    if (frame.phase === 'scan') {
      assert.equal(frame.selectionY, frame.dot.y);
      assert.ok(frame.dot.x >= Math.min(...geometry.rows.map(row => row.x)) - 1e-7);
      if (i && reference[i - 1].phase === 'scan') assert.ok(frame.dot.y >= reference[i - 1].dot.y - 1e-7, 'scan travels downward without teleport');
    }
    samples++;
  }
}
console.log(`Tools motion: ${samples} forward/reverse samples; six holds, continuous handoffs and shared strip/dot geometry pass.`);
