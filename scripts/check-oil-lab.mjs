import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { URL } from 'node:url';
import process from 'node:process';
import console from 'node:console';
import { chromium } from 'playwright';
import { projects } from '../src/data/projects.js';

const base = process.argv[2] || 'http://localhost:4176';
const output = process.argv[3] || '/workspace/oil-lab-checks';
const selection = process.argv[4] || 'all';
const viewportSelection = process.argv[5] || 'all';
const studies = selection === 'all' ? ['matter', 'archive', 'handoff'] : selection.split(',');
const projectIds = new Set(projects.map(project => project.id));
const report = { base, studies, viewportSelection, startedAt: new Date().toISOString(), checks: [], browserErrors: [], expectedResourceErrors: [], failedResponses: [], requests: [], screenshots: [] };
const url = path => new URL(path, base).href;
const sha256 = value => createHash('sha256').update(value).digest('hex');
let browser;
await mkdir(output, { recursive: true });

async function screenshot(page, name, target = null) {
  const path = join(output, `${name}.png`);
  await (target ? page.locator(target) : page).screenshot({ path, animations: 'disabled', timeout: 20000 });
  report.screenshots.push(path);
  return path;
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
  }
}

async function withPage(name, options, run, blockedStudy = null) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference', ...options });
  await context.addInitScript(() => {
    const request = globalThis.requestAnimationFrame.bind(globalThis);
    const cancel = globalThis.cancelAnimationFrame.bind(globalThis);
    const pending = new Set();
    const probe = globalThis.__oilProbe = { scheduled: 0, fired: 0, cancelled: 0, playCalls: 0, playEvents: 0, pending: () => pending.size };
    globalThis.requestAnimationFrame = callback => {
      probe.scheduled++;
      const handle = request(now => { pending.delete(handle); probe.fired++; callback(now); });
      pending.add(handle);
      return handle;
    };
    globalThis.cancelAnimationFrame = handle => { pending.delete(handle); probe.cancelled++; cancel(handle); };
    const play = globalThis.HTMLMediaElement.prototype.play;
    globalThis.HTMLMediaElement.prototype.play = function (...args) { probe.playCalls++; return Reflect.apply(play, this, args); };
    globalThis.document.addEventListener('play', () => probe.playEvents++, true);
  });
  if (blockedStudy) await context.route(`**/oil-lab/${blockedStudy}/*.mp4`, route => route.abort('failed'));
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const error = (type, message) => {
    const item = { scenario: name, type, message };
    if (blockedStudy && /ERR_FAILED|Failed to load resource|media|video|artwork/i.test(message)) report.expectedResourceErrors.push(item);
    else report.browserErrors.push(item);
  };
  page.on('pageerror', value => error('pageerror', value.message));
  page.on('console', message => { if (message.type() === 'error') error('console', message.text()); });
  page.on('request', request => {
    if (/\/oil-lab\/.+\.(?:mp4|webm|json|webp)(?:$|\?)/.test(request.url())) report.requests.push({ scenario: name, url: request.url(), type: request.resourceType() });
  });
  page.on('response', response => { if (response.status() >= 400) report.failedResponses.push({ scenario: name, status: response.status(), url: response.url() }); });
  try { return await run(page); }
  catch (failure) {
    try { await screenshot(page, `failed-${name}`); } catch { /* Retain the original failure. */ }
    throw failure;
  } finally { await context.close(); }
}

const metrics = page => page.evaluate(() => globalThis.GDamonOil.getMetrics());
const probe = page => page.evaluate(() => {
  const value = globalThis.__oilProbe;
  return { scheduled: value.scheduled, fired: value.fired, cancelled: value.cancelled, pending: value.pending(), playCalls: value.playCalls, playEvents: value.playEvents };
});

async function open(page, id, expected = 'ready') {
  await page.goto(url(`/oil-lab/${id}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => Boolean(globalThis.GDamonOil), null, { timeout: 30000 });
  await page.waitForFunction(status => globalThis.GDamonOil.getMetrics().status === status, expected, { timeout: 30000 });
  await page.evaluate(() => globalThis.document.fonts.ready);
  const state = await metrics(page);
  assert.equal(state.id, id);
  assert.equal(state.control, 'frame-scrub');
  return state;
}

async function scrollProgress(page, progress, wait = true) {
  const geometry = await page.evaluate(value => {
    const story = globalThis.document.querySelector('.oil-story');
    const stage = globalThis.document.querySelector('.oil-stage');
    const top = globalThis.scrollY + story.getBoundingClientRect().top;
    const travel = story.offsetHeight - stage.clientHeight;
    if (travel <= 0) throw new Error('The active scroll story has no travel.');
    globalThis.scrollTo({ top: top + travel * value, behavior: 'instant' });
    return { top, travel, requestedProgress: value };
  }, progress);
  if (wait) await page.waitForFunction(value => Math.abs(globalThis.GDamonOil.getMetrics().progress - value) < .002, progress);
  return geometry;
}

async function settled(page, progress) {
  await page.waitForFunction(value => {
    const state = globalThis.GDamonOil.getMetrics();
    const target = Math.round(state.progress * (state.frameCount - 1));
    return Math.abs(state.progress - value) < .002 && state.targetFrame === target && state.currentFrame === target && state.pendingFrame === null && !state.animating && !state.seeking;
  }, progress, { timeout: 20000 });
  const state = await metrics(page);
  assert.equal(state.currentFrame, Math.round(state.progress * (state.frameCount - 1)));
  assert.ok(Math.abs(state.currentTime - state.currentFrame / state.fps) < .25 / state.fps, `Decoded media time does not match its integer frame: ${JSON.stringify(state)}`);
  assert.equal(state.paused, true, 'The scrubbed video is playing autonomously.');
  return state;
}

async function frameEvidence(page, label) {
  const image = await page.evaluate(name => {
    const video = globalThis.document.querySelector('.oil-media');
    const canvas = globalThis.document.createElement('canvas');
    canvas.width = 160;
    canvas.height = Math.round(160 * video.videoHeight / video.videoWidth);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const previous = globalThis.__oilFrameSamples ||= {};
    let differenceFromStart = null;
    if (previous.start?.length === data.length) {
      let sum = 0;
      for (let index = 0; index < data.length; index += 4) for (let channel = 0; channel < 3; channel++) sum += Math.abs(data[index + channel] - previous.start[index + channel]);
      differenceFromStart = sum / (canvas.width * canvas.height * 3);
    }
    if (name === 'start') previous.start = data.slice();
    return { pixels: canvas.toDataURL('image/png'), differenceFromStart, width: video.videoWidth, height: video.videoHeight, source: video.currentSrc, paused: video.paused, autoplay: video.autoplay, loop: video.loop, controls: video.controls };
  }, label);
  const { pixels, ...evidence } = image;
  return { ...evidence, pixelSHA256: sha256(pixels) };
}

async function layout(page) {
  return page.evaluate(() => {
    const rect = selector => {
      const value = globalThis.document.querySelector(selector).getBoundingClientRect();
      return { x: value.x, y: value.y, width: value.width, height: value.height, top: value.top, bottom: value.bottom, left: value.left, right: value.right };
    };
    return {
      viewport: [globalThis.innerWidth, globalThis.innerHeight], documentWidth: globalThis.document.documentElement.scrollWidth,
      stagePosition: globalThis.getComputedStyle(globalThis.document.querySelector('.oil-stage')).position,
      header: rect('.oil-header'), heading: rect('.oil-heading'), title: rect('.oil-heading h1'), artwork: rect('.oil-artwork'), states: rect('.oil-states'), stage: rect('.oil-stage'),
    };
  });
}

function assertLayout(value) {
  assert.ok(value.documentWidth <= value.viewport[0] + 1, `Horizontal document overflow: ${JSON.stringify(value)}`);
  assert.ok(value.heading.top >= value.header.bottom - 2, `Heading overlaps navigation: ${JSON.stringify(value)}`);
  assert.ok(value.heading.bottom <= value.states.top - 3, `Hero copy overlaps phase labels: ${JSON.stringify(value)}`);
  assert.ok(value.states.bottom <= value.viewport[1] + 1, `Phase labels are below the viewport: ${JSON.stringify(value)}`);
  assert.ok(value.title.left >= -1 && value.title.right <= value.viewport[0] + 1, 'Hero title extends outside the viewport.');
}

async function portfolioLinks(page) {
  const links = await page.locator('.oil-project, .oil-about-links a, .oil-contact-row>a, .oil-footer a').evaluateAll(elements => elements.map(element => ({ href: element.getAttribute('href'), text: element.textContent.trim() })));
  const projectLinks = links.filter(link => link.href.startsWith('/projects#'));
  assert.equal(projectLinks.length, 3);
  for (const link of projectLinks) assert.ok(projectIds.has(link.href.split('#')[1]), `Unknown project destination: ${link.href}`);
  for (const destination of ['/about', '/blog', 'mailto:hello@damon.ai', 'https://github.com/oil-oil/oil-motion']) assert.ok(links.some(link => link.href === destination), `Missing personal website link: ${destination}`);
  const anchors = await page.locator('a[href^="#"]').evaluateAll(elements => elements.map(element => ({ href: element.getAttribute('href'), exists: Boolean(globalThis.document.getElementById(element.getAttribute('href').slice(1))) })));
  assert.ok(anchors.every(anchor => anchor.exists), `Broken local anchor: ${JSON.stringify(anchors)}`);
  return { links, anchors };
}

try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  for (const id of studies) {
    for (const [width, height] of [[1440, 900], [390, 844], [844, 390]].filter(([width]) => viewportSelection === 'all' || viewportSelection.split(',').includes(String(width)))) {
      const scenario = `${id}-${width}x${height}`;
      await check(`${id}: native scrub, reverse, exact frames and layout at ${width}×${height}`, () => withPage(scenario, { viewport: { width, height } }, async page => {
        const initial = await open(page, id);
        assert.equal(initial.source, width <= 700 ? 'mobile.mp4' : 'desktop.mp4');
        assert.ok(initial.frameCount > 1 && initial.fps > 0 && initial.duration > 0);
        assert.equal(await page.locator('video').count(), 1, 'There must be one persistent media instance.');
        await page.mouse.move(width * .85, height * .4);
        await page.mouse.wheel(0, 190);
        await page.waitForFunction(() => globalThis.scrollY > 80 && globalThis.GDamonOil.getMetrics().targetFrame > 0);
        const samples = [];
        for (const [label, progress] of [['start', 0], ['middle', .5], ['finish', 1], ['reverse', .2]]) {
          const geometry = await scrollProgress(page, progress);
          const state = await settled(page, progress);
          const frame = await frameEvidence(page, label);
          assert.ok(frame.width > 0 && frame.height > 0, 'Video has not decoded real pixels.');
          assert.equal(frame.paused, true);
          assert.equal(frame.autoplay, false);
          assert.equal(frame.loop, false);
          assert.equal(frame.controls, false);
          const composition = await layout(page);
          assertLayout(composition);
          await screenshot(page, `${scenario}-${label}`);
          samples.push({ label, geometry, state, frame, layout: composition });
        }
        assert.equal(new Set(samples.slice(0, 3).map(sample => sample.frame.pixelSHA256)).size, 3, 'The requested sequence rendered identical frame pixels.');
        assert.ok(samples[1].frame.differenceFromStart > .5 && samples[2].frame.differenceFromStart > .5, `The artwork is effectively static: ${JSON.stringify(samples.map(sample => sample.frame.differenceFromStart))}`);
        const requestStart = performance.now();
        for (const progress of [.96, .04, .81, .27]) { await scrollProgress(page, progress, false); await page.waitForTimeout(16); }
        const latest = await settled(page, .27);
        assert.ok(latest.currentFrame < samples[2].state.currentFrame, 'A stale forward seek won over the final reverse target.');
        const latestSeekMs = Math.round(performance.now() - requestStart);
        const idleBefore = { state: await metrics(page), probe: await probe(page) };
        await page.waitForTimeout(650);
        const idleAfter = { state: await metrics(page), probe: await probe(page) };
        assert.equal(idleAfter.state.currentTime, idleBefore.state.currentTime, 'Media time advanced while input was idle.');
        assert.equal(idleAfter.state.seekCount, idleBefore.state.seekCount, 'Idle input continued submitting seeks.');
        assert.equal(idleAfter.probe.scheduled, idleBefore.probe.scheduled, 'requestAnimationFrame continues while settled.');
        assert.equal(idleAfter.probe.pending, 0);
        assert.equal(idleAfter.probe.playCalls, 0);
        assert.equal(idleAfter.probe.playEvents, 0);
        const destinations = await portfolioLinks(page);
        if (width === 1440) {
          const source = await page.locator('video').evaluate(video => video.currentSrc);
          await page.setViewportSize({ width: 390, height: 844 });
          await page.waitForTimeout(100);
          assert.equal(await page.locator('video').evaluate(video => video.currentSrc), source, 'Resize replaced the persistent media source.');
          await page.setViewportSize({ width, height });
          await page.locator('.oil-header a[href="#oil-work"]').click();
          // Anchor scroll margin leaves an intentional strip of the stage in view.
          await page.waitForFunction(() => globalThis.document.querySelector('#oil-work').getBoundingClientRect().top < 50);
          await page.evaluate(() => globalThis.scrollBy({ top: 50, behavior: 'instant' }));
          await page.waitForFunction(() => !globalThis.GDamonOil.getMetrics().visible);
          await page.waitForTimeout(150);
          const hidden = await metrics(page);
          assert.equal(hidden.animating, false, 'The offscreen stage is still running its animator.');
          assert.equal(hidden.paused, true);
          await screenshot(page, `${id}-selected-work`);
          for (const section of ['work', 'about', 'contact']) await screenshot(page, `${id}-${section}-section`, `.oil-${section}`);
          return { initial, samples, latest, latestSeekMs, idleBefore, idleAfter, destinations, offscreen: hidden };
        }
        return { initial, samples, latest, latestSeekMs, idleBefore, idleAfter, destinations };
      }));
    }

    await check(`${id}: reduced motion loads only the static artwork and unpins the story`, () => withPage(`${id}-reduced`, { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, async page => {
      const state = await open(page, id, 'static');
      const composition = await layout(page);
      assert.notEqual(composition.stagePosition, 'sticky');
      assert.equal(await page.locator('video').getAttribute('src'), null);
      await page.locator('.oil-poster').evaluate(image => image.decode());
      assert.equal(await page.locator('.oil-poster').isVisible(), true);
      const requests = report.requests.filter(request => request.scenario === `${id}-reduced`);
      assert.equal(requests.filter(request => /\.(mp4|webm|json)(?:$|\?)/.test(request.url)).length, 0, 'Reduced motion fetched a timeline or motion media.');
      const destinations = await portfolioLinks(page);
      await screenshot(page, `${id}-reduced-poster`);
      await page.locator('a[href="mailto:hello@damon.ai"]').scrollIntoViewIfNeeded();
      assert.equal(await page.locator('a[href="mailto:hello@damon.ai"]').isVisible(), true);
      assert.equal((await probe(page)).playCalls, 0);
      return { state, layout: composition, requests, destinations, contactReachable: true };
    }));

    await check(`${id}: blocked video reveals its poster and leaves portfolio navigation usable`, () => withPage(`${id}-blocked`, { viewport: { width: 1440, height: 900 } }, async page => {
      const state = await open(page, id, 'error');
      const composition = await layout(page);
      assert.notEqual(composition.stagePosition, 'sticky');
      assert.equal(await page.locator('video').getAttribute('src'), null);
      const poster = await page.locator('.oil-poster').evaluate(async image => { await image.decode(); return { width: image.naturalWidth, height: image.naturalHeight, visibility: globalThis.getComputedStyle(image).visibility }; });
      assert.ok(poster.width > 0 && poster.height > 0);
      assert.equal(poster.visibility, 'visible');
      assert.equal(state.animating, false);
      assert.equal(state.paused, true);
      const destinations = await portfolioLinks(page);
      await screenshot(page, `${id}-blocked-poster`);
      await page.locator('.oil-header a[href="#oil-work"]').click();
      await page.waitForFunction(() => globalThis.document.querySelector('#oil-work').getBoundingClientRect().top < globalThis.innerHeight / 2);
      assert.equal((await probe(page)).playCalls, 0);
      return { state, layout: composition, poster, destinations, workReachable: true };
    }, id));
  }
} catch (error) {
  report.checks.push({ name: 'Harness initialization', pass: false, error: error.stack || String(error) });
} finally {
  await browser?.close();
  report.finishedAt = new Date().toISOString();
  report.pass = report.checks.length > 0 && report.checks.every(check => check.pass) && report.browserErrors.length === 0 && report.failedResponses.length === 0;
  await writeFile(join(output, 'oil-lab-report.json'), `${JSON.stringify(report, null, 2)}\n`);
}
console.log(`Oil Motion website checks ${report.pass ? 'passed' : 'failed'}. Report: ${join(output, 'oil-lab-report.json')}`);
if (!report.pass) process.exitCode = 1;
