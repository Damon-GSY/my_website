import assert from 'node:assert/strict';
import console from 'node:console';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import process from 'node:process';
import { URL } from 'node:url';
import { chromium } from 'playwright';
import { projects } from '../src/data/projects.js';

const base = process.argv[2] || 'http://localhost:4175';
const output = process.argv[3] || '/workspace/kernel-density/after';
const selection = process.argv[4] || 'all';
const url = path => new URL(path, base).href;
const projectIds = new Set(projects.map(project => project.id));
const report = { base, selection, checks: [], errors: [], failedResponses: [], screenshots: [] };
let browser;
await mkdir(output, { recursive: true });

async function check(name, run) {
  const started = performance.now();
  try {
    const evidence = await run();
    report.checks.push({ name, pass: true, elapsedMs: Math.round(performance.now() - started), evidence });
    console.log(`PASS ${name}`);
  } catch (error) {
    report.checks.push({ name, pass: false, error: error.stack });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

async function shot(page, name) {
  const path = join(output, `${name}.png`);
  await page.screenshot({ path, animations: 'disabled', timeout: 20000 });
  report.screenshots.push(path);
}

async function withPage(name, options, run) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...options });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.on('pageerror', error => report.errors.push({ name, message: error.message }));
  page.on('console', message => { if (message.type() === 'error') report.errors.push({ name, message: message.text() }); });
  page.on('response', response => { if (response.status() >= 400) report.failedResponses.push({ name, url: response.url(), status: response.status() }); });
  try { return await run(page); }
  catch (error) { try { await shot(page, `failed-${name}`); } catch { /* Keep the assertion error. */ } throw error; }
  finally { await context.close(); }
}

async function ready(page) {
  await page.goto(url('/kernelcode/index.html'), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => globalThis.GDamonRuntime?.stage && globalThis.GDamonRuntime?.hero && !globalThis.document.body.classList.contains('loading'), null, { timeout: 45000 });
}

async function section(page, index) {
  const link = page.locator(`.navpill [data-section="${index}"]`);
  if (!await link.isVisible()) await page.locator('.navtoggle').click();
  await link.click();
  await page.waitForFunction(index => {
    const runtime = globalThis.GDamonRuntime;
    const shown = globalThis.document.querySelectorAll('main > section')[index];
    return runtime.sectionIndex === index && !runtime.transitioning && shown.classList.contains('show') && Number(globalThis.getComputedStyle(shown).opacity) > .99;
  }, index, { timeout: 25000 });
  await page.waitForTimeout(1000);
}

async function particles(page) {
  return page.evaluate(() => {
    const runtime = globalThis.GDamonRuntime;
    const canvas = globalThis.document.querySelector('#stage');
    runtime.stage.update(globalThis.performance.now());
    const sample = globalThis.document.createElement('canvas');
    sample.width = 360; sample.height = Math.round(360 * canvas.height / canvas.width);
    const context = sample.getContext('2d', { willReadFrequently: true });
    context.drawImage(canvas, 0, 0, sample.width, sample.height);
    const data = context.getImageData(0, 0, sample.width, sample.height).data;
    let brightPixels = 0;
    for (let i = 0; i < data.length; i += 4) if (data[i] > 60 && data[i + 1] > 60 && data[i + 2] > 60 && data[i + 3] > 15) brightPixels++;
    return { count: Number(canvas.dataset.particleCount), on: canvas.classList.contains('on'), opacity: Number(globalThis.getComputedStyle(canvas).opacity), brightPixels, weights: Object.fromEntries(['wA', 'wB', 'wC', 'squeeze'].map(name => [name, runtime.stage.uni[name].value])), framing: runtime.stage.getMetrics?.() };
  });
}

async function panelEvidence(page, selector) {
  return page.locator(selector).evaluate(element => {
    const rect = node => { const r = node.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
    const h2 = element.querySelector('h2');
    const body = element.querySelector('.panel-body');
    const visual = element.querySelector('.visual-window');
    const scrollers = [element, ...element.querySelectorAll('*')].filter(node => /auto|scroll/.test(globalThis.getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight + 1);
    return {
      text: element.innerText, h2: h2.textContent, heading: rect(h2), header: rect(globalThis.document.querySelector('header')),
      viewport: [globalThis.innerWidth, globalThis.innerHeight], documentWidth: globalThis.document.documentElement.scrollWidth, documentHeight: globalThis.document.documentElement.scrollHeight, scrollY: globalThis.scrollY,
      background: globalThis.getComputedStyle(element).backgroundColor,
      body: body ? { rect: rect(body), role: body.getAttribute('role'), label: body.getAttribute('aria-label'), tabIndex: body.tabIndex } : null,
      visual: visual ? rect(visual) : null, methods: element.querySelectorAll('.method-list > li').length,
      links: [...element.querySelectorAll('a[href]')].map(link => ({ href: link.getAttribute('href'), text: link.textContent.trim(), rect: rect(link) })),
      scrollers: scrollers.map(node => ({ tag: node.tagName, id: node.id, className: node.className, clientHeight: node.clientHeight, scrollHeight: node.scrollHeight, tabIndex: node.tabIndex, label: node.getAttribute('aria-label'), rect: rect(node) })),
    };
  });
}

function assertPanel(value, sectionId) {
  assert.ok(value.documentWidth <= value.viewport[0] + 1, 'Document overflows horizontally.');
  assert.ok(value.documentHeight <= value.viewport[1] + 1 && value.scrollY === 0, 'Scroll-hijacked page escaped into document scrolling.');
  assert.ok(value.heading.top >= value.header.bottom - 1, 'Heading overlaps the fixed header.');
  assert.ok(value.heading.bottom < value.viewport[1], 'Heading is clipped below the viewport.');
  assert.ok(value.body && value.body.role === 'region' && value.body.label && value.body.tabIndex === 0, 'Scrollable information lacks a keyboard-accessible labeled region.');
  assert.equal(value.methods, 3, 'Research/Systems methods are incomplete.');
  assert.ok(value.visual && value.visual.width >= 100 && value.visual.height >= 90, 'The new information displaced the particle artwork entirely.');
  assert.equal(value.background, 'rgba(0, 0, 0, 0)', 'Information panel hides the particle canvas.');
  assert.ok(value.text.length > 450, `${sectionId} still lacks substantive information.`);
  const caseLinks = value.links.filter(link => link.href.startsWith('/projects#'));
  assert.ok(caseLinks.length >= 2, `${sectionId} does not connect its claims to case studies.`);
  for (const link of caseLinks) assert.ok(projectIds.has(link.href.split('#')[1]), `Invalid case link: ${link.href}`);
  return caseLinks;
}

try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'] });

  if (['all', 'layout', 'final'].includes(selection)) for (const [width, height] of [[1440, 900], [1280, 720], [390, 844], [320, 568], [844, 390]]) {
    await check(`Research and Systems information stays readable at ${width}×${height}`, () => withPage(`layout-${width}x${height}`, { viewport: { width, height } }, async page => {
      await ready(page);
      const evidence = [];
      for (const [index, id] of [[1, 's2'], [2, 's3']]) {
        await section(page, index);
        const panel = await panelEvidence(page, `#${id}`);
        const caseLinks = assertPanel(panel, id);
        await shot(page, `${id}-${width}x${height}`);
        const cloud = await particles(page);
        assert.equal(cloud.on, true); assert.equal(cloud.opacity, 1); assert.equal(cloud.count, 30000);
        assert.ok(cloud.brightPixels > 80, 'White particle cloud is missing.');
        assert.deepEqual([cloud.weights.wA, cloud.weights.wB, cloud.weights.wC], index === 1 ? [1, 0, 0] : [0, 1, 0]);
        for (const link of caseLinks) {
          const locator = page.locator(`#${id} a[href="${link.href}"]`).first();
          await locator.scrollIntoViewIfNeeded();
          await locator.focus();
          const box = await locator.boundingBox();
          assert.ok(box.y >= panel.header.bottom - 1 && box.y + box.height <= height + 1, `Case link is unreachable: ${link.href}`);
          assert.ok(box.x >= -1 && box.x + box.width <= width + 1, 'Case link overflows horizontally.');
        }
        if (panel.scrollers.length) await shot(page, `${id}-${width}x${height}-details`);
        evidence.push({ panel, cloud });
      }
      return evidence;
    }));
  }

  if (['all', 'scroll'].includes(selection)) await check('Compact information regions consume wheel, keyboard and touch before changing chapters', () => withPage('inner-scroll', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, async page => {
    await ready(page); await section(page, 1);
    const body = page.locator('#s2 .panel-body');
    const extent = await body.evaluate(node => node.scrollHeight - node.clientHeight);
    assert.ok(extent > 150, 'Phone information should have an independently scrollable reading region.');
    const box = await body.boundingBox();
    await page.mouse.move(box.x + 24, box.y + 100);
    await page.mouse.wheel(0, 140);
    await page.waitForFunction(() => globalThis.document.querySelector('#s2 .panel-body').scrollTop > 50);
    assert.equal(await page.evaluate(() => globalThis.GDamonRuntime.sectionIndex), 1, 'Wheel skipped a chapter while content still had room.');
    const wheelTop = await body.evaluate(node => node.scrollTop);
    await body.evaluate(node => { node.scrollTop = 0; });
    await body.focus(); await page.keyboard.press('PageDown');
    await page.waitForFunction(() => globalThis.document.querySelector('#s2 .panel-body').scrollTop > 50);
    assert.equal(await page.evaluate(() => globalThis.GDamonRuntime.sectionIndex), 1, 'PageDown skipped readable information.');
    const keyboardTop = await body.evaluate(node => node.scrollTop);
    await body.evaluate(node => { node.scrollTop = 0; node.blur(); });
    await page.waitForTimeout(400);
    const client = await page.context().newCDPSession(page);
    const x = Math.round(box.x + box.width * .8);
    const y = Math.round(Math.min(box.y + box.height - 40, box.y + 240));
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (const delta of [30, 60, 90, 120]) {
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - delta }] });
      await page.waitForTimeout(40);
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(() => globalThis.document.querySelector('#s2 .panel-body').scrollTop > 35);
    await page.waitForTimeout(1100);
    assert.equal(await page.evaluate(() => globalThis.GDamonRuntime.sectionIndex), 1, 'Touch swipe skipped a chapter while reading its content.');
    const touchTop = await body.evaluate(node => node.scrollTop);
    await client.detach();
    await body.evaluate(node => { node.scrollTop = node.scrollHeight; });
    await page.mouse.move(box.x + 24, box.y + 100);
    await page.mouse.wheel(0, 140);
    await page.waitForFunction(() => globalThis.GDamonRuntime.sectionIndex === 2 && !globalThis.GDamonRuntime.transitioning, null, { timeout: 25000 });
    return { extent, wheelTop, keyboardTop, touchTop, nextChapterAfterEnd: 2 };
  }));

  if (['all', 'reduced'].includes(selection)) await check('Reduced motion keeps enriched content and case links accessible', () => withPage('reduced', { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, async page => {
    await ready(page);
    const evidence = [];
    for (const [index, id] of [[1, 's2'], [2, 's3']]) {
      await section(page, index);
      const panel = await panelEvidence(page, `#${id}`); assertPanel(panel, id);
      const pointer = await page.evaluate(() => globalThis.GDamonRuntime.getPointerMetrics());
      assert.equal(pointer.reduced, true); assert.equal(pointer.target.x, 0); assert.equal(pointer.target.y, 0);
      evidence.push({ id, links: panel.links.map(link => link.href), pointer });
    }
    await shot(page, 's3-reduced-390x844');
    return evidence;
  }));

  if (['all', 'journey', 'final'].includes(selection)) await check('New Research and Systems case links resolve and Back restores their chapter', () => withPage('case-journey', {}, async page => {
    await ready(page);
    const checked = [];
    for (const [index, id] of [[1, 's2'], [2, 's3']]) {
      await section(page, index);
      const paths = await page.locator(`#${id} a[href^="/projects#"]`).evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href')))]);
      for (const path of paths) {
        const projectId = path.split('#')[1];
        const link = page.locator(`#${id} a[href="${path}"]`).first();
        await link.focus(); await page.keyboard.press('Enter');
        await page.waitForURL(value => value.pathname === '/projects' && value.hash === `#${projectId}`);
        await page.locator(`.pw-case[data-project-id="${projectId}"] h1`).waitFor();
        await page.goBack({ waitUntil: 'domcontentloaded' });
        await page.waitForFunction(index => globalThis.GDamonRuntime?.sectionIndex === index && !globalThis.GDamonRuntime.transitioning && !globalThis.document.body.classList.contains('loading'), index, { timeout: 45000 });
        checked.push({ path, restoredSection: index });
      }
    }
    return checked;
  }));

  if (['all', 'journey', 'final'].includes(selection)) await check('Back from mobile case evidence restores the reading position', () => withPage('compact-case-journey', { viewport: { width: 390, height: 844 } }, async page => {
    await ready(page);
    const evidence = [];
    for (const [index, id] of [[1, 's2'], [2, 's3']]) {
      await section(page, index);
      const body = page.locator(`#${id} .panel-body`);
      const link = page.locator(`#${id} .evidence-card`).last();
      await link.scrollIntoViewIfNeeded(); await link.focus();
      const before = await body.evaluate(node => node.scrollTop);
      assert.ok(before > 80, 'Fixture never reached the lower case evidence.');
      const href = await link.getAttribute('href');
      const projectId = href.split('#')[1];
      await page.keyboard.press('Enter');
      await page.waitForURL(value => value.pathname === '/projects' && value.hash === `#${projectId}`);
      await page.locator(`.pw-case[data-project-id="${projectId}"] h1`).waitFor();
      await page.goBack({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(index => globalThis.GDamonRuntime?.sectionIndex === index && !globalThis.GDamonRuntime.transitioning && !globalThis.document.body.classList.contains('loading'), index, { timeout: 45000 });
      await page.waitForTimeout(300);
      const after = await body.evaluate(node => node.scrollTop);
      assert.ok(Math.abs(after - before) <= 3, `Back lost the reading position: ${before} → ${after}.`);
      await shot(page, `${id}-mobile-back-restored`);
      evidence.push({ href, before, after, chapter: index });
    }
    return evidence;
  }));

  if (['all', 'motion'].includes(selection)) await check('Particle morph and pointer remain responsive after adding information', () => withPage('motion', {}, async page => {
    await ready(page);
    assert.equal(await page.locator('#cursor, #cursorLabel').count(), 0);
    await page.mouse.move(1360, 300);
    await page.waitForFunction(() => globalThis.GDamonRuntime.getPointerMetrics().current.x > .35);
    const pointer = await page.evaluate(() => globalThis.GDamonRuntime.getPointerMetrics());
    assert.ok(Math.abs(pointer.current.x) <= .5 && Math.abs(pointer.current.y) <= .5);
    await section(page, 1);
    await page.evaluate(() => { globalThis.__densityMorph = []; const until = globalThis.performance.now() + 1400; function sample() { const u = globalThis.GDamonRuntime.stage.uni; globalThis.__densityMorph.push({ a: u.wA.value, b: u.wB.value, squeeze: u.squeeze.value }); if (globalThis.performance.now() < until) globalThis.requestAnimationFrame(sample); } sample(); });
    await section(page, 2);
    const morph = await page.evaluate(() => globalThis.__densityMorph);
    assert.ok(morph.some(value => value.a > 0 && value.b > 0 && value.squeeze < .5), 'Transition no longer visibly squeezes between forms.');
    await section(page, 3);
    const signature = await particles(page);
    assert.equal(signature.weights.wC, 1); assert.ok(signature.brightPixels > 80);
    return { pointer, minimumSqueeze: Math.min(...morph.map(value => value.squeeze)), signature };
  }));
} finally {
  await browser?.close();
  report.pass = report.checks.length > 0 && report.checks.every(check => check.pass) && report.errors.length === 0 && report.failedResponses.length === 0;
  await writeFile(join(output, 'kernel-density-report.json'), `${JSON.stringify(report, null, 2)}\n`);
}
console.log(`Kernel density checks ${report.pass ? 'passed' : 'failed'}. Report: ${join(output, 'kernel-density-report.json')}`);
if (!report.pass) process.exitCode = 1;
