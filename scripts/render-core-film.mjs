import { chromium } from 'playwright';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { URL } from 'node:url';
import console from 'node:console';

// Render the actual live geometry at exact timestamps, independent of capture speed.
const baseURL = process.argv[2] || 'http://localhost:4175';
const output = new URL('../public/motion-studies/', import.meta.url).pathname;
const temporary = await mkdtemp(join(tmpdir(), 'gdamon-core-film-'));
const width = 1280, height = 800, fps = 30;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
});
let duration;
try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(new URL('/motion-lab/core', baseURL).href);
  await page.waitForFunction(() => globalThis.GDamonCore?.beginCapture, null, { timeout: 30000 });
  duration = await page.evaluate(({ width, height }) => {
    globalThis.GDamonCore.beginCapture(width, height);
    return globalThis.GDamonCore.duration;
  }, { width, height });
  for (let frame = 0; frame < duration * fps; frame++) {
    const data = await page.evaluate(t => globalThis.GDamonCore.captureFrame(t), frame / fps);
    await writeFile(join(temporary, `${String(frame).padStart(5, '0')}.png`), Buffer.from(data.split(',')[1], 'base64'));
    if (frame % 60 === 0) console.log(`Rendered ${frame} / ${duration * fps} frames`);
  }
  await page.evaluate(() => globalThis.GDamonCore.endCapture());
} finally {
  await browser.close();
}
const run = args => {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`ffmpeg failed; source frames retained at ${temporary}`);
};
run(['-framerate', String(fps), '-i', join(temporary, '%05d.png'), '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(output, 'core-film.mp4')]);
run(['-i', join(temporary, '00180.png'), '-frames:v', '1', '-c:v', 'libwebp', '-quality', '88', join(output, 'core-film-poster.webp')]);
await writeFile(join(output, 'core-film.json'), JSON.stringify({
  title: 'Inner Workings', renderer: 'Three.js procedural geometry',
  source: 'src/motion-studies/coreScene.js', duration, width, height, fps,
  frames: duration * fps, codec: 'H.264', pixelFormat: 'yuv420p',
  chapters: ['Separate', 'Connect', 'Assemble', 'Activate'],
  production: 'Deterministic frames rendered from the live scene; not an AI-generated video or interpolated still-image sequence.',
}, null, 2) + '\n');
await rm(temporary, { recursive: true });
console.log(`Exported ${duration}s / ${fps}fps to ${output}core-film.mp4`);
