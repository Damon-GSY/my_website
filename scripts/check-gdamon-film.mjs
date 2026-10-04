import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import console from 'node:console';
import { join } from 'node:path';

const base = process.argv[2] || 'http://localhost:4175';
const output = process.argv[3] || '/tmp/gdamon-film-review';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
});
const errors = [];
const report = { formats: [], determinism: [], errors };
const hash = (value) => createHash('sha256').update(value).digest('hex');
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${base}/film?render=1`);
  await page.waitForFunction(() => globalThis.GDamonFilm || globalThis.GDamonFilmError, null, { timeout: 45000 });
  const bootError = await page.evaluate(() => globalThis.GDamonFilmError);
  if (bootError) throw new Error(String(bootError));
  const capture = (time) => page.evaluate(t => globalThis.GDamonFilm.capture(t), time);
  for (const [name, width, height] of [['landscape', 960, 540], ['portrait', 360, 640], ['square', 600, 600]]) {
    await page.evaluate(([w, h]) => globalThis.GDamonFilm.setSize(w, h), [width, height]);
    for (const time of [.8, 2.6, 5.2, 6.9, 8.8, 11.3, 12.8, 14.3, 17.8]) {
      const frame = await capture(time);
      await writeFile(join(output, `${name}-${String(time).replace('.', '-')}.png`), Buffer.from(frame.split(',')[1], 'base64'));
    }
    for (const time of [0, 2.6, 8.8, 14.3, 18]) {
      const first = hash(await capture(time));
      await capture(3.2);
      await capture(16.1);
      const repeated = hash(await capture(time));
      report.determinism.push({ format: name, time, pass: first === repeated });
    }
    const metrics = await page.evaluate(() => globalThis.GDamonFilm.getMetrics());
    if (metrics.robot?.renderer !== 'three') errors.push(`${name}: robot did not render with Three.js`);
    report.formats.push({ name, ...metrics });
    console.log(`Reviewed ${name}: 9 frames and 5 out-of-order seek checks`);
  }
  await page.evaluate(() => globalThis.GDamonFilm.setSize(960, 540));
  const boundaries = [];
  for (const time of [5.999, 6, 6.22, 11.999, 12, 12.22, 17, 18]) boundaries.push({ time, hash: hash(await capture(time)) });
  report.boundaries = boundaries;
  report.pass = !errors.length && report.determinism.every(item => item.pass);
} finally {
  await writeFile(join(output, 'review.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}
if (!report.pass) throw new Error(`Film checks failed. See ${output}/review.json`);
console.log(`Film checks passed. Captures: ${output}`);
