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
const output = process.argv[3] || '/workspace/scroll-revision/checks';
const only = process.argv[4] || 'all';
const report = {
  base, startedAt: new Date().toISOString(), checks: [], browserErrors: [],
  expectedWebGLErrors: [], failedRequests: [], mediaRequests: [], screenshots: [],
};
const url = path => new URL(path, base).href;
const hash = value => createHash('sha256').update(value).digest('hex');
const projectIds = new Set(projects.map(project => project.id));
let browser;
let currentPage;
await mkdir(output, { recursive: true });

async function shot(page, name) {
  const path = join(output, `${name}.png`);
  await page.screenshot({ path, animations: 'disabled', timeout: 20000 });
  report.screenshots.push(path);
  return path;
}

async function check(name, run) {
  const started = performance.now();
  try {
    const evidence = await run();
    report.checks.push({ name, pass: true, elapsedMs: Math.round(performance.now() - started), evidence });
    console.log(`PASS ${name}`);
  } catch (error) {
    report.checks.push({ name, pass: false, elapsedMs: Math.round(performance.now() - started), error: error.stack || String(error) });
    console.error(`FAIL ${name}: ${error.message}`);
    if (currentPage && !currentPage.isClosed()) {
      try { await shot(currentPage, `failure-${report.checks.length}`); } catch { /* Keep the original failure. */ }
    }
  }
}

async function withPage(name, options, run, blockWebGL = false) {
  const context = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: 'no-preference', ...options });
  if (blockWebGL) await context.addInitScript(() => {
    const original = globalThis.HTMLCanvasElement.prototype.getContext;
    globalThis.HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (/^(webgl2?|experimental-webgl)$/i.test(kind)) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    };
  });
  const page = await context.newPage();
  currentPage = page;
  page.setDefaultTimeout(15000);
  const log = (type, message) => {
    const entry = { scenario: name, type, message };
    if (blockWebGL && /webgl|context|3d scene/i.test(message)) report.expectedWebGLErrors.push(entry);
    else report.browserErrors.push(entry);
  };
  page.on('pageerror', error => log('pageerror', error.message));
  page.on('console', message => { if (message.type() === 'error') log('console', message.text()); });
  page.on('request', request => {
    if (/\.(?:mp4|webm|wav|mp3|ogg)(?:$|\?)/i.test(request.url())) report.mediaRequests.push({ scenario: name, url: request.url() });
  });
  page.on('response', response => {
    if (response.status() >= 400) report.failedRequests.push({ scenario: name, status: response.status(), url: response.url() });
  });
  try { return await run(page); }
  catch (error) {
    try { await shot(page, `failed-${name}`); } catch { /* Preserve the original failure. */ }
    throw error;
  } finally { await context.close(); currentPage = null; }
}

async function ready(page, path, api) {
  await page.goto(url(path), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(name => Boolean(globalThis[name]), api, { timeout: 45000 });
  if (api === 'GDamonRobot') await page.waitForFunction(() => globalThis.GDamonRobot.getMetrics().ready, null, { timeout: 30000 });
  if (api === 'GDamonSite') await page.waitForFunction(() => globalThis.document.querySelector('.fw-page')?.dataset.scene === 'ready', null, { timeout: 30000 });
  await page.evaluate(() => globalThis.document.fonts.ready);
}

const filmMetrics = page => page.evaluate(() => globalThis.GDamonSite.getMetrics());
const robotMetrics = page => page.evaluate(() => globalThis.GDamonRobot.getMetrics());

async function scrollStory(page, selector, progress) {
  const result = await page.evaluate(({ selector, progress }) => {
    const story = globalThis.document.querySelector(selector);
    if (!story) throw new Error(`Missing scroll story: ${selector}`);
    const stage = story.querySelector('.fw-stage, .rb-stage');
    const top = story.getBoundingClientRect().top + globalThis.scrollY;
    const distance = Math.max(1, story.offsetHeight - (stage?.offsetHeight || globalThis.innerHeight));
    const target = top + progress * distance;
    globalThis.scrollTo({ top: target, behavior: 'instant' });
    return { top, distance, target };
  }, { selector, progress });
  if (selector === '.fw-story') await page.waitForFunction(expected => Math.abs(globalThis.GDamonSite.getMetrics().scrollProgress - expected) < .001, progress);
  return result;
}

async function waitRobot(page, progress) {
  await page.waitForFunction(target => Math.abs(globalThis.GDamonRobot.getMetrics().progress - target) < .005, progress, { timeout: 15000 });
  return robotMetrics(page);
}

async function waitFilmSettled(page) {
  await page.waitForFunction(() => {
    const state = globalThis.GDamonSite.getMetrics();
    return state.settled && state.time === state.targetTime;
  }, null, { timeout: 15000 });
  return filmMetrics(page);
}

async function pageWidth(page) {
  return page.evaluate(() => ({
    viewport: globalThis.innerWidth,
    scrollWidth: globalThis.document.documentElement.scrollWidth,
    bodyWidth: globalThis.document.body.scrollWidth,
  }));
}

async function robotLayout(page) {
  return page.evaluate(() => {
    const stage = globalThis.document.querySelector('.rb-stage');
    const rect = element => {
      if (!element) return null;
      const value = element.getBoundingClientRect();
      return { top: value.top, left: value.left, right: value.right, bottom: value.bottom, width: value.width, height: value.height };
    };
    const visible = element => {
      for (let node = element; node && node !== stage.parentElement; node = node.parentElement) {
        const style = globalThis.getComputedStyle(node);
        if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) < .1) return false;
      }
      return true;
    };
    const header = rect(stage.querySelector('.rb-header'));
    const activeCopy = [...stage.querySelectorAll('.rb-hello-copy, .rb-inside-copy, .rb-outro-copy')].filter(visible).map(element => ({
      className: element.className,
      heading: rect(element.querySelector('h1, h2')),
      description: rect(element.querySelector('.rb-inside-description, .rb-closing-description, .rb-intro-bottom p')),
      buttons: [...element.querySelectorAll('button, a')].filter(visible).map(rect),
    }));
    return { viewport: [globalThis.innerWidth, globalThis.innerHeight], header, activeCopy, stage: rect(stage), controls: rect(stage.querySelector('.rb-motion-controls')) };
  });
}

function assertRobotLayout(evidence) {
  for (const copy of evidence.activeCopy) {
    if (copy.heading) assert.ok(copy.heading.top >= evidence.header.bottom - 2, `${copy.className} heading overlaps the navigation: ${JSON.stringify(evidence)}`);
    if (copy.description && copy.heading) assert.ok(copy.description.top >= copy.heading.bottom - 2, `${copy.className} heading overlaps its description: ${JSON.stringify(evidence)}`);
    for (const button of copy.buttons) assert.ok(button.bottom <= evidence.stage.bottom + 1 && button.left >= -1 && button.right <= evidence.viewport[0] + 1, `Robot button outside the visible stage: ${JSON.stringify(evidence)}`);
  }
  assert.ok(evidence.controls.bottom <= evidence.stage.bottom + 1, 'Robot motion controls lie outside the stage.');
}

async function kernelEvidence(page) {
  return page.evaluate(() => {
    const runtime = globalThis.GDamonRuntime;
    const stage = globalThis.document.querySelector('#stage');
    const section = globalThis.document.querySelector('#s4');
    const steps = section.querySelector('#steps');
    const rect = element => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
    };
    runtime.stage.update(globalThis.performance.now());
    const sample = globalThis.document.createElement('canvas');
    sample.width = Math.min(900, stage.width);
    sample.height = Math.round(stage.height * sample.width / stage.width);
    const ctx = sample.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(stage, 0, 0, sample.width, sample.height);
    const rgba = ctx.getImageData(0, 0, sample.width, sample.height).data;
    let count = 0, x0 = sample.width, x1 = 0, y0 = sample.height, y1 = 0;
    for (let y = 0; y < sample.height; y++) for (let x = 0; x < sample.width; x++) {
      const index = (y * sample.width + x) * 4;
      if (rgba[index] > 70 && rgba[index + 1] > 70 && rgba[index + 2] > 70 && rgba[index + 3] > 20) {
        count++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
    }
    const scale = globalThis.innerWidth / sample.width;
    return {
      viewport: [globalThis.innerWidth, globalThis.innerHeight],
      section: runtime.sectionIndex, transitioning: runtime.transitioning,
      stageOn: stage.classList.contains('on'), stageOpacity: Number(globalThis.getComputedStyle(stage).opacity),
      particleCount: Number(stage.dataset.particleCount), wordmarkReady: stage.dataset.wordmarkReady,
      weights: Object.fromEntries(['wA', 'wB', 'wC', 'squeeze'].map(key => [key, runtime.stage.uni[key].value])),
      sectionBackground: globalThis.getComputedStyle(section).backgroundColor,
      heading: rect(section.querySelector('h2')), steps: rect(steps),
      frame: runtime.stage.getFraming().s4,
      cloud: { pixels: count, left: x0 * scale, right: x1 * scale, top: y0 * scale, bottom: y1 * scale, width: (x1 - x0) * scale, height: (y1 - y0) * scale },
      cards: [...steps.querySelectorAll('.step')].map(card => ({
        tag: card.tagName, href: card.getAttribute('href'), index: card.querySelector('.st-n').textContent,
        number: card.querySelector('.st-n b').textContent,
        box: rect(card), title: rect(card.querySelector('.st-t')), body: rect(card.querySelector('.st-b')),
        footer: rect(card.querySelector('.st-link')),
        underline: globalThis.getComputedStyle(card.querySelector('.st-t')).textDecorationLine,
      })),
      scrollWidth: steps.scrollWidth, clientWidth: steps.clientWidth, scrollLeft: steps.scrollLeft,
      documentWidth: globalThis.document.documentElement.scrollWidth,
    };
  });
}

try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || '/usr/bin/chromium', headless: true,
    args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
  });

  if (only === 'all' || only === 'film') {
    await check('Film is a native scroll website with reversible, resting canvas state', () => withPage('film-desktop', { viewport: { width: 1440, height: 900 } }, async page => {
      await ready(page, '/film', 'GDamonSite');
      const initial = await waitFilmSettled(page);
      assert.equal(await page.locator('audio, video, #film-progress, #film-format').count(), 0, 'The normal website still contains film player elements.');
      const beforeY = await page.evaluate(() => globalThis.scrollY);
      await page.mouse.move(1200, 500);
      await page.mouse.wheel(0, 480);
      await page.waitForFunction(y => globalThis.scrollY > y + 100, beforeY);
      await page.waitForFunction(time => globalThis.GDamonSite.getMetrics().targetTime > time + .1, initial.time);
      const wheel = await waitFilmSettled(page);
      assert.ok(wheel.time > initial.time + .1, 'Native wheel scrolling did not advance the canvas.');
      const samples = [];
      for (const [label, progress] of [['intro', .04], ['robot', .49], ['signature', .93], ['reverse', .23]]) {
        const scroll = await scrollStory(page, '.fw-story', progress);
        const state = await waitFilmSettled(page);
        const pixels = hash(await page.locator('.fw-canvas').evaluate(canvas => canvas.toDataURL()));
        await shot(page, `film-desktop-${label}`);
        samples.push({ label, progress, scroll, state, pixels });
      }
      assert.ok(samples[1].state.time > samples[0].state.time + 3);
      assert.ok(samples[2].state.time > samples[1].state.time + 3);
      assert.ok(samples[3].state.time < samples[1].state.time - 1, 'Reverse scrolling did not reverse the artwork.');
      assert.equal(new Set(samples.map(sample => sample.pixels)).size, samples.length, 'Scrolled chapters rendered duplicate pixels.');
      const settled = await waitFilmSettled(page);
      await page.waitForTimeout(550);
      const resting = await filmMetrics(page);
      assert.equal(resting.time, settled.time, 'The website timeline keeps playing when scrolling stops.');
      const width = await pageWidth(page);
      assert.ok(width.scrollWidth <= width.viewport + 1 && width.bodyWidth <= width.viewport + 1, `Horizontal overflow: ${JSON.stringify(width)}`);
      assert.equal(report.mediaRequests.filter(entry => entry.scenario === 'film-desktop').length, 0, 'The website fetched video/audio media.');
      return { initial, wheel, samples, settled, resting, width };
    }));

    await check('Film chapter navigation, portfolio links, and contact are real webpage destinations', () => withPage('film-links', { viewport: { width: 1440, height: 900 } }, async page => {
      await ready(page, '/film', 'GDamonSite');
      const anchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => ({ href: link.getAttribute('href'), text: link.textContent.trim(), visible: Boolean(link.getClientRects().length) })));
      const valid = await page.evaluate(links => links.filter(link => link.href.length > 1).map(link => ({ ...link, exists: Boolean(globalThis.document.getElementById(decodeURIComponent(link.href.slice(1)))) })), anchors);
      assert.ok(valid.length >= 3, 'Scroll chapters need actual anchor destinations.');
      assert.ok(valid.every(link => link.exists), `Missing anchor target: ${JSON.stringify(valid)}`);
      const chapterLink = valid.find(link => /system|motion|inside|agent/i.test(link.text)) || valid.find(link => link.visible && !/skip/i.test(link.text));
      await page.locator(`a[href="${chapterLink.href}"]`).filter({ visible: true }).first().click();
      await page.waitForTimeout(800);
      assert.ok(await page.evaluate(() => globalThis.scrollY) > 100, 'Chapter navigation did not scroll the document.');
      const links = await page.locator('a[href^="/projects"], a[href^="mailto:"]').evaluateAll(links => links.map(link => ({ href: link.getAttribute('href'), text: link.textContent.trim() })));
      assert.ok(links.some(link => link.href.startsWith('/projects')), 'No selected-work destination.');
      assert.ok(links.some(link => link.href === 'mailto:hello@damon.ai'), 'No functional personal contact.');
      return { anchors: valid, links, afterNavigation: await filmMetrics(page) };
    }));

    for (const [width, height] of [[390, 844], [844, 390], [320, 568]]) {
      await check(`Film native website fits ${width}×${height}`, () => withPage(`film-${width}`, { viewport: { width, height } }, async page => {
        await ready(page, '/film', 'GDamonSite');
        const states = [];
        for (const [label, progress] of [['intro', .04], ['robot', .49], ['signature', .93]]) {
          await scrollStory(page, '.fw-story', progress);
          states.push({ label, ...(await waitFilmSettled(page)) });
          await shot(page, `film-${width}x${height}-${label}`);
        }
        const widthEvidence = await pageWidth(page);
        assert.ok(widthEvidence.scrollWidth <= width + 1 && widthEvidence.bodyWidth <= width + 1, `Horizontal overflow: ${JSON.stringify(widthEvidence)}`);
        return { states, width: widthEvidence };
      }));
    }

    for (const fallback of [false, true]) await check(`Film ${fallback ? 'unavailable WebGL' : 'reduced motion'} stays a readable website`, () => withPage(`film-${fallback ? 'fallback' : 'reduced'}`, { viewport: { width: 390, height: 844 }, reducedMotion: fallback ? 'no-preference' : 'reduce' }, async page => {
      await page.goto(url('/film'), { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction(() => {
        const root = globalThis.document.querySelector('.fw-page');
        return root && root.dataset.scene !== 'loading';
      }, null, { timeout: 45000 });
      assert.equal(await page.locator('video, audio').count(), 0, 'The accessible fallback is still a media player.');
      const layout = await page.evaluate(() => {
        const stage = globalThis.document.querySelector('.fw-stage');
        const story = globalThis.document.querySelector('.fw-story');
        return { status: globalThis.document.querySelector('.fw-page').dataset.scene, stagePosition: stage ? globalThis.getComputedStyle(stage).position : null, storyHeight: story?.offsetHeight, height: globalThis.innerHeight, text: globalThis.document.body.textContent };
      });
      if (!fallback) assert.notEqual(layout.stagePosition, 'sticky', 'Reduced motion retains the long pinned animation.');
      assert.match(layout.text, /Damon|GDAMON/i);
      const contact = page.locator('a[href="mailto:hello@damon.ai"]').last();
      await contact.scrollIntoViewIfNeeded();
      assert.equal(await contact.isVisible(), true);
      await shot(page, `film-${fallback ? 'webgl-fallback' : 'reduced'}-contact`);
      assert.equal(report.mediaRequests.filter(entry => entry.scenario === `film-${fallback ? 'fallback' : 'reduced'}`).length, 0, 'Fallback fetched MP4/audio media.');
      return { ...layout, text: layout.text.slice(0, 400), contactReachable: true, width: await pageWidth(page) };
    }, fallback));
  }

  if (only === 'all' || only === 'robot') {
    await check('Robot opens, holds, reassembles and hands off continuously; reverse works', () => withPage('robot-desktop', { viewport: { width: 1440, height: 900 } }, async page => {
      await ready(page, '/robot', 'GDamonRobot');
      await page.mouse.move(1200, 500);
      await page.mouse.wheel(0, 320);
      await page.waitForFunction(() => globalThis.scrollY > 100);
      const samples = [];
      for (const [label, progress] of [['hello', 0], ['opening', .22], ['hold', .49], ['reclosing', .74], ['handoff', .95], ['reverse', .49]]) {
        await scrollStory(page, '.rb-story', progress);
        const state = await waitRobot(page, progress);
        const layout = await robotLayout(page);
        assertRobotLayout(layout);
        if (['hello', 'hold', 'handoff'].includes(label)) await shot(page, `robot-desktop-${label}`);
        samples.push({ label, state, layout });
      }
      const [hello, opening, hold, reclosing, handoff, reverse] = samples.map(sample => sample.state);
      assert.ok(hello.explosion < .04 && opening.explosion > .15 && opening.explosion < .9);
      assert.ok(hold.explosion > .98 && reverse.explosion > .98, 'Inspection does not open/restore fully.');
      assert.ok(reclosing.explosion < hold.explosion - .1 && reclosing.explosion > handoff.explosion + .1);
      assert.ok(handoff.explosion < .03 && handoff.handoff > .6, 'The scene does not reassemble before handing off.');
      await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
      await page.waitForFunction(() => globalThis.GDamonRobot.getMetrics().paused);
      const pause = await robotMetrics(page);
      await page.waitForTimeout(350);
      assert.equal((await robotMetrics(page)).elapsed, pause.elapsed, 'Paused idle motion continued.');
      await scrollStory(page, '.rb-story', .1);
      await waitRobot(page, .1);
      assert.equal((await robotMetrics(page)).paused, true);
      return { samples, pause, pausedScroll: await robotMetrics(page) };
    }));

    for (const [width, height] of [[390, 844], [844, 390], [320, 568]]) {
      await check(`Robot scroll composition fits ${width}×${height}`, () => withPage(`robot-${width}`, { viewport: { width, height } }, async page => {
        await ready(page, '/robot', 'GDamonRobot');
        const layouts = [];
        for (const [label, progress] of [['hello', 0], ['inside', .49], ['handoff', .95]]) {
          await scrollStory(page, '.rb-story', progress);
          await waitRobot(page, progress);
          const layout = await robotLayout(page);
          assertRobotLayout(layout);
          layouts.push({ label, layout });
          await shot(page, `robot-${width}x${height}-${label}`);
        }
        const widthEvidence = await pageWidth(page);
        assert.ok(widthEvidence.scrollWidth <= width + 1 && widthEvidence.bodyWidth <= width + 1, `Horizontal overflow: ${JSON.stringify(widthEvidence)}`);
        return { layouts, width: widthEvidence };
      }));
    }

    await check('Robot reduced motion renders stable poses and keeps controls in view', () => withPage('robot-reduced', { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, async page => {
      await ready(page, '/robot', 'GDamonRobot');
      await scrollStory(page, '.rb-story', .49);
      const state = await waitRobot(page, .49);
      assert.equal(state.reduced, true);
      await page.waitForTimeout(350);
      const after = await robotMetrics(page);
      assert.equal(after.elapsed, state.elapsed);
      const layout = await robotLayout(page);
      assertRobotLayout(layout);
      await shot(page, 'robot-reduced-inside');
      return { state, after, layout };
    }));
  }

  if (only === 'all' || only === 'kernel') await check('Kernel project cards, real particle canvas, and manual mobile scrolling', () => withPage('kernel', { viewport: { width: 1440, height: 900 } }, async page => {
    await ready(page, '/kernelcode/index.html', 'GDamonRuntime');
    await page.waitForFunction(() => !globalThis.document.body.classList.contains('loading') && globalThis.GDamonRuntime.stage && globalThis.document.querySelector('#stage').dataset.wordmarkReady === 'true', null, { timeout: 45000 });
    await page.locator('.navpill a[data-section="3"]').click();
    await page.waitForFunction(() => {
      const runtime = globalThis.GDamonRuntime;
      const section = globalThis.document.querySelector('#s4');
      return runtime.sectionIndex === 3 && !runtime.transitioning && section.classList.contains('show') && Number(globalThis.getComputedStyle(section).opacity) > .99 && [...section.querySelectorAll('.rv > span')].every(span => Number(globalThis.getComputedStyle(span).opacity) > .95);
    }, null, { timeout: 20000 });
    const views = [];
    for (const [width, height] of [[1440, 900], [1024, 768], [390, 844], [844, 390], [320, 568]]) {
      await page.setViewportSize({ width, height });
      await page.mouse.move(0, 0);
      await page.waitForTimeout(650);
      const evidence = await kernelEvidence(page);
      assert.equal(evidence.stageOn, true);
      assert.equal(evidence.stageOpacity, 1);
      assert.equal(evidence.particleCount, 30000);
      assert.equal(evidence.wordmarkReady, 'true');
      assert.deepEqual(evidence.weights, { wA: 0, wB: 0, wC: 1, squeeze: 1 });
      assert.equal(evidence.sectionBackground, 'rgba(0, 0, 0, 0)');
      assert.ok(evidence.cloud.pixels > 100, `Particle layer has too few visible pixels: ${JSON.stringify(evidence.cloud)}`);
      assert.ok(evidence.cloud.width > width * .18 && evidence.cloud.height > 10, `Particle wordmark is too small: ${JSON.stringify(evidence.cloud)}`);
      assert.ok(evidence.cloud.top >= evidence.heading.bottom - 5, `Cloud overlaps heading: ${JSON.stringify(evidence)}`);
      assert.ok(evidence.cloud.bottom <= evidence.steps.top + 8, `Cloud overlaps cards: ${JSON.stringify(evidence)}`);
      assert.ok(evidence.documentWidth <= width + 1, 'The document overflows horizontally.');
      assert.deepEqual(evidence.cards.map(card => card.number), ['01', '02', '03', '04', '05']);
      const titleY = evidence.cards.map(card => card.title.top);
      assert.ok(Math.max(...titleY) - Math.min(...titleY) <= 1, 'Project titles have different vertical starting positions.');
      for (const card of evidence.cards) {
        assert.doesNotMatch(card.index, /<\/?p>/i, 'Literal HTML remains in project indices.');
        assert.equal(card.tag, 'A');
        assert.equal(card.underline, 'none');
        if (card.href.startsWith('/projects#')) assert.ok(projectIds.has(card.href.split('#')[1]), `Unknown project link: ${card.href}`);
        else assert.equal(card.href, '/blog');
        assert.ok(card.body.bottom <= card.footer.top + 1, `Project copy collides with its action: ${JSON.stringify(card)}`);
        assert.ok(card.footer.bottom <= card.box.bottom + 1, `Project footer is clipped: ${JSON.stringify(card)}`);
      }
      await shot(page, `kernel-work-${width}x${height}`);
      if (width === 390) {
        const steps = page.locator('#steps');
        await steps.hover({ position: { x: 160, y: 130 } });
        const before = await steps.evaluate(element => element.scrollLeft);
        await page.mouse.wheel(410, 0);
        await page.waitForFunction(left => globalThis.document.querySelector('#steps').scrollLeft > left + 50, before);
        await page.waitForTimeout(650);
        const manual = await steps.evaluate(element => element.scrollLeft);
        await page.waitForTimeout(4700);
        const held = await steps.evaluate(element => element.scrollLeft);
        assert.ok(Math.abs(manual - held) < 2, 'The project scroller still auto-advances while reading.');
        await page.locator('#steps .step').last().focus();
        await page.waitForTimeout(650);
        const focused = await page.locator('#steps .step').last().boundingBox();
        assert.ok(focused.x >= -1 && focused.x + focused.width <= width + 1, 'Keyboard focus does not reveal the focused project.');
        evidence.manualScroll = { before, manual, held, focused };
        await shot(page, 'kernel-work-phone-final-card');
      }
      views.push(evidence);
    }
    return { views };
  }));
} catch (error) {
  report.checks.push({ name: 'Harness initialization', pass: false, error: error.stack || String(error) });
} finally {
  await browser?.close();
  report.finishedAt = new Date().toISOString();
  report.pass = report.checks.length > 0 && report.checks.every(check => check.pass) && report.browserErrors.length === 0 && report.failedRequests.length === 0;
  await writeFile(join(output, 'scroll-report.json'), `${JSON.stringify(report, null, 2)}\n`);
}
console.log(`Scroll checks ${report.pass ? 'passed' : 'failed'}. Report: ${join(output, 'scroll-report.json')}`);
if (!report.pass) process.exitCode = 1;
