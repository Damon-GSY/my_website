import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { URL } from 'node:url';
import process from 'node:process';
import console from 'node:console';

const base = process.argv[2] || 'http://localhost:4176';
const output = process.argv[3] || '/workspace/film-captures/player';
const report = { base, startedAt: new Date().toISOString(), checks: [], browserErrors: [], expectedWebGLLogs: [], mediaResponses: [], screenshots: [] };
const hash = value => createHash('sha256').update(value).digest('hex');
const url = path => new URL(path, base).href;
let browser;
let currentPage;
await mkdir(output, { recursive: true });

async function shot(page, name, canvasOnly = false) {
  const path = join(output, `${name}.png`);
  await (canvasOnly ? page.locator('.film-canvas') : page).screenshot({ path, animations: 'disabled', timeout: 15000 });
  report.screenshots.push(path);
}

async function check(name, run) {
  const start = performance.now();
  try {
    const evidence = await run();
    report.checks.push({ name, pass: true, elapsedMs: Math.round(performance.now() - start), evidence });
    console.log(`PASS ${name}`);
  } catch (error) {
    report.checks.push({ name, pass: false, elapsedMs: Math.round(performance.now() - start), error: error.stack || String(error) });
    console.error(`FAIL ${name}: ${error.message}`);
    if (currentPage && !currentPage.isClosed()) {
      try { await shot(currentPage, `failure-${report.checks.length}`); } catch { /* Preserve the original failure if the browser has closed. */ }
    }
  }
}

async function withPage(name, options, run, blockWebGL = false) {
  const context = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: 'no-preference', ...options });
  if (blockWebGL) {
    await context.addInitScript(() => {
      const original = globalThis.HTMLCanvasElement.prototype.getContext;
      globalThis.HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
        if (/^(webgl2?|experimental-webgl)$/i.test(kind)) return null;
        return Reflect.apply(original, this, [kind, ...args]);
      };
    });
  }
  const page = await context.newPage();
  currentPage = page;
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => report.browserErrors.push({ scenario: name, type: 'pageerror', message: error.message }));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const entry = { scenario: name, type: 'console', message: message.text() };
    if (blockWebGL && /webgl|creating.*context|3d scene/i.test(entry.message)) report.expectedWebGLLogs.push(entry);
    else report.browserErrors.push(entry);
  });
  page.on('response', response => {
    if (new URL(response.url()).pathname.startsWith('/films/')) report.mediaResponses.push({ scenario: name, url: response.url(), status: response.status() });
  });
  try { return await run(page); } finally { await context.close(); currentPage = null; }
}

async function ready(page, expected = 'ready') {
  await page.goto(url('/film'), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => {
    const status = globalThis.document.querySelector('.film-page')?.dataset.status;
    return status && status !== 'loading';
  }, null, { timeout: 45000 });
  const state = await page.locator('.film-page').getAttribute('data-status');
  assert.equal(state, expected, `Film entered ${state}; expected ${expected}. ${await page.evaluate(() => globalThis.GDamonFilmError || '')}`);
  if (expected === 'ready') await page.waitForFunction(() => Boolean(globalThis.GDamonFilm));
}

const metrics = page => page.evaluate(() => globalThis.GDamonFilm.getMetrics());
const seek = (page, time) => page.evaluate(t => globalThis.GDamonFilm.seek(t), time);
const waitTime = (page, time, tolerance = .08) => page.waitForFunction(({ time, tolerance }) => Math.abs(globalThis.GDamonFilm.getMetrics().time - time) < tolerance, { time, tolerance });
async function rangeSeek(page, value) {
  await page.locator('#film-progress').evaluate((input, next) => {
    const setter = Object.getOwnPropertyDescriptor(globalThis.HTMLInputElement.prototype, 'value').set;
    setter.call(input, String(next));
    input.dispatchEvent(new globalThis.Event('input', { bubbles: true }));
    input.dispatchEvent(new globalThis.Event('change', { bubbles: true }));
  }, value);
  await waitTime(page, value);
}

async function layoutEvidence(page) {
  return page.evaluate(() => {
    const root = globalThis.document.documentElement;
    const page = globalThis.document.querySelector('.film-page');
    const area = globalThis.document.querySelector('.film-screen-area').getBoundingClientRect();
    const canvas = globalThis.document.querySelector('.film-canvas').getBoundingClientRect();
    const overflow = [...page.querySelectorAll('*')].filter(element => {
      const rect = element.getBoundingClientRect();
      const style = globalThis.getComputedStyle(element);
      return rect.width > 0 && style.position !== 'absolute' && (rect.left < -1 || rect.right > globalThis.innerWidth + 1);
    }).slice(0, 8).map(element => ({ tag: element.tagName, className: element.className }));
    return { viewport: [globalThis.innerWidth, globalThis.innerHeight], documentWidth: root.scrollWidth, pageWidth: page.scrollWidth, pageClientWidth: page.clientWidth, area: { width: area.width, height: area.height }, canvas: { width: canvas.width, height: canvas.height }, format: globalThis.document.querySelector('#film-format').value, overflow };
  });
}

try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || '/usr/bin/chromium', headless: true,
    args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
  });
  await check('Desktop player controls, sound sync and end hold', () => withPage('desktop', { viewport: { width: 1440, height: 1000 } }, async page => {
    await ready(page);
    const initial = await metrics(page);
    assert.equal(initial.playing, true);
    assert.equal(initial.muted, true);
    assert.equal(await page.locator('audio').evaluate(audio => audio.paused), true);
    await page.waitForFunction(() => globalThis.GDamonFilm.getMetrics().time > .2);
    await page.getByRole('button', { name: 'Pause film', exact: true }).click();
    const paused = await metrics(page);
    assert.equal(paused.playing, false);
    await page.waitForTimeout(350);
    assert.equal((await metrics(page)).time, paused.time, 'Paused clock continued advancing.');
    await rangeSeek(page, 4);
    await page.locator('.film-chapters button').nth(2).click();
    await waitTime(page, 12);
    assert.equal(await page.locator('.film-chapters button').nth(2).getAttribute('aria-current'), 'step');
    await page.getByRole('button', { name: 'Replay film', exact: true }).click();
    await page.waitForFunction(() => { const m = globalThis.GDamonFilm.getMetrics(); return m.playing && m.time > .15 && m.time < 3; });
    await page.getByRole('button', { name: 'Pause film', exact: true }).click();
    await rangeSeek(page, 8);
    await page.getByRole('button', { name: 'Play film', exact: true }).click();
    await page.getByRole('button', { name: 'Turn sound on', exact: true }).click();
    await page.waitForFunction(() => {
      const audio = globalThis.document.querySelector('audio');
      return Number.isFinite(audio.duration) && audio.readyState >= 3 && !audio.paused && audio.currentTime > 8;
    }, null, { timeout: 20000 });
    const sound = await page.evaluate(() => {
      const audio = globalThis.document.querySelector('audio');
      const film = globalThis.GDamonFilm.getMetrics();
      return { audioTime: audio.currentTime, filmTime: film.time, drift: Math.abs(audio.currentTime - film.time), duration: audio.duration, muted: film.muted, readyState: audio.readyState };
    });
    assert.ok(sound.drift < .3, `First sound-on drift was ${sound.drift.toFixed(3)}s.`);
    assert.equal(sound.muted, false);
    await page.getByRole('button', { name: 'Mute sound', exact: true }).click();
    await seek(page, 17.6);
    await page.getByRole('button', { name: 'Play film', exact: true }).click();
    await page.waitForFunction(() => { const m = globalThis.GDamonFilm.getMetrics(); return m.time === 18 && !m.playing; });
    const held = hash(await page.locator('.film-canvas').evaluate(canvas => canvas.toDataURL()));
    await page.waitForTimeout(350);
    assert.equal(hash(await page.locator('.film-canvas').evaluate(canvas => canvas.toDataURL())), held, 'Final image changed after the film ended.');
    assert.equal((await metrics(page)).time, 18);
    for (const [name, time] of [['intro', .8], ['robot', 8.8], ['signature', 17.8]]) {
      await seek(page, time); await shot(page, `desktop-${name}`);
    }
    const layout = await layoutEvidence(page);
    assert.ok(layout.documentWidth <= 1441 && layout.pageWidth <= layout.pageClientWidth + 1 && !layout.overflow.length, `Desktop horizontal overflow: ${JSON.stringify(layout)}`);
    return { initial, sound, layout, heldFrameSHA256: held };
  }));

  for (const [width, height] of [[390, 844], [320, 568], [844, 390]]) {
    await check(`Responsive ${width}×${height}, reduced motion and chapter frames`, () => withPage(`viewport-${width}`, { viewport: { width, height }, reducedMotion: 'reduce' }, async page => {
      await ready(page);
      const initial = await metrics(page);
      assert.equal(initial.time, 0);
      assert.equal(initial.playing, false);
      await page.waitForTimeout(350);
      assert.equal((await metrics(page)).time, 0, 'Reduced-motion page started automatically.');
      const layout = await layoutEvidence(page);
      assert.ok(layout.documentWidth <= width + 1 && layout.pageWidth <= layout.pageClientWidth + 1 && !layout.overflow.length, `Horizontal overflow: ${JSON.stringify(layout)}`);
      if (width <= 600) {
        assert.equal(layout.format, 'portrait');
        assert.ok(Math.abs(layout.canvas.width - layout.area.width) <= 2, `Mobile canvas does not use full available width: ${JSON.stringify(layout)}`);
        assert.ok(Math.abs(layout.canvas.width / layout.canvas.height - 9 / 16) < .01);
      }
      for (const [name, time] of [['intro', .8], ['robot', 8.8], ['signature', 17.8]]) {
        await seek(page, time);
        await page.locator('.film-canvas').scrollIntoViewIfNeeded();
        await shot(page, `${width}x${height}-${name}`);
        if (width === 390) await shot(page, `mobile-${name}-canvas`, true);
      }
      await page.getByRole('button', { name: 'Play film', exact: true }).click();
      await page.waitForFunction(() => globalThis.GDamonFilm.getMetrics().playing || globalThis.GDamonFilm.getMetrics().time === 18);
      await seek(page, 0);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.getByRole('button', { name: 'Play film', exact: true }).click();
      await page.waitForFunction(() => globalThis.GDamonFilm.getMetrics().playing);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => !globalThis.GDamonFilm.getMetrics().playing);
      return { initial, layout };
    }));
  }

  await check('Unavailable WebGL plays the real MP4 fallback', () => withPage('blocked-webgl', { viewport: { width: 1280, height: 900 } }, async page => {
    await ready(page, 'fallback');
    const video = page.locator('.film-video');
    await video.waitFor({ state: 'visible' });
    await page.waitForFunction(() => globalThis.document.querySelector('.film-video')?.readyState >= 1, null, { timeout: 30000 });
    const metadata = await video.evaluate(video => ({ source: video.currentSrc, duration: video.duration, width: video.videoWidth, height: video.videoHeight, muted: video.muted, error: video.error?.message || null }));
    assert.ok(metadata.source.endsWith('/films/gdamon-landscape.mp4'));
    assert.ok(Math.abs(metadata.duration - 18) < .05);
    assert.deepEqual([metadata.width, metadata.height], [1280, 720]);
    assert.equal(metadata.error, null);
    await page.getByRole('button', { name: 'Play film', exact: true }).click();
    await page.waitForFunction(() => globalThis.document.querySelector('.film-video').currentTime > .25);
    const playback = await video.evaluate(video => ({ time: video.currentTime, paused: video.paused, decodedFrames: video.getVideoPlaybackQuality().totalVideoFrames, error: video.error?.message || null }));
    assert.equal(playback.paused, false);
    assert.ok(playback.decodedFrames > 0);
    assert.equal(playback.error, null);
    await page.getByRole('button', { name: 'Pause film', exact: true }).click();
    await shot(page, 'webgl-unavailable-video');
    return { metadata, playback, reportedFailure: await page.evaluate(() => globalThis.GDamonFilmError) };
  }, true));

  await check('Index first card links to /film and decodes its actual media', () => withPage('index', { viewport: { width: 1440, height: 1000 } }, async page => {
    await page.goto(url('/'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const first = page.locator('.pv-card').first();
    await first.waitFor();
    assert.equal(await first.getAttribute('data-preview'), 'make-it-useful');
    assert.equal(await first.locator('.pv-media-link').getAttribute('href'), '/film');
    const video = first.locator('video');
    await video.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const video = globalThis.document.querySelector('.pv-card video');
      return video?.readyState >= 2 && video.currentTime > .1;
    }, null, { timeout: 30000 });
    const media = await video.evaluate(video => ({ source: video.currentSrc, poster: video.poster, duration: video.duration, width: video.videoWidth, height: video.videoHeight, decodedFrames: video.getVideoPlaybackQuality().totalVideoFrames, error: video.error?.message || null }));
    assert.ok(media.source.endsWith('/films/gdamon-landscape.mp4'));
    assert.ok(media.poster.endsWith('/films/gdamon-landscape-poster.webp'));
    assert.ok(Math.abs(media.duration - 18) < .05);
    assert.ok(media.decodedFrames > 0);
    assert.equal(media.error, null);
    const poster = await page.evaluate(async source => {
      const image = new globalThis.Image(); image.src = source; await image.decode();
      return { width: image.naturalWidth, height: image.naturalHeight };
    }, media.poster);
    assert.deepEqual([poster.width, poster.height], [1280, 720]);
    for (const path of [media.source, media.poster]) {
      const response = await page.request.get(path, { headers: { Range: 'bytes=0-1023' } });
      assert.ok(response.status() === 200 || response.status() === 206, `Media request failed: ${response.status()} ${path}`);
    }
    await shot(page, 'index-first-card');
    return { media, poster };
  }));
} catch (error) {
  report.checks.push({ name: 'Harness initialization', pass: false, error: error.stack || String(error) });
} finally {
  await browser?.close();
  report.finishedAt = new Date().toISOString();
  report.failedMedia = report.mediaResponses.filter(response => response.status >= 400);
  report.pass = report.checks.length >= 6 && report.checks.every(check => check.pass) && !report.browserErrors.length && !report.failedMedia.length;
  await writeFile(join(output, 'player-report.json'), `${JSON.stringify(report, null, 2)}\n`);
}
if (!report.pass) {
  console.error(`Player checks failed. See ${join(output, 'player-report.json')}`);
  process.exitCode = 1;
} else console.log(`Player checks passed. Evidence: ${join(output, 'player-report.json')}`);
