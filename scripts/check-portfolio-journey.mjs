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
const output = process.argv[3] || '/workspace/portfolio-revision/checks';
const selection = process.argv[4] || 'all';
const url = path => new URL(path, base).href;
const hash = value => createHash('sha256').update(value).digest('hex');
const byId = new Map(projects.map(project => [project.id, project]));
const report = { base, selection, startedAt: new Date().toISOString(), checks: [], errors: [], expectedErrors: [], failedResponses: [], mediaRequests: [], screenshots: [] };
let browser;
await mkdir(output, { recursive: true });

async function shot(page, name, selector = null) {
  const path = join(output, `${name}.png`);
  await (selector ? page.locator(selector) : page).screenshot({ path, animations: 'disabled', timeout: 20000 });
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

async function withPage(name, options, run, blockedWebGL = false) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference', ...options });
  if (blockedWebGL) await context.addInitScript(() => {
    const original = globalThis.HTMLCanvasElement.prototype.getContext;
    globalThis.HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (/^(webgl2?|experimental-webgl)$/i.test(kind)) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    };
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const recordError = (type, message) => {
    const item = { scenario: name, type, message };
    if (blockedWebGL && /webgl|context|3d scene/i.test(message)) report.expectedErrors.push(item);
    else report.errors.push(item);
  };
  page.on('pageerror', error => recordError('pageerror', error.message));
  page.on('console', message => { if (message.type() === 'error') recordError('console', message.text()); });
  page.on('response', response => { if (response.status() >= 400) report.failedResponses.push({ scenario: name, url: response.url(), status: response.status() }); });
  page.on('request', request => { if (/\.(?:mp4|webm|wav|mp3)(?:$|\?)/i.test(request.url())) report.mediaRequests.push({ scenario: name, url: request.url() }); });
  try { return await run(page); }
  catch (error) {
    try { await shot(page, `failed-${name}`); } catch { /* Preserve the original failure. */ }
    throw error;
  } finally { await context.close(); }
}

async function widthEvidence(page) {
  return page.evaluate(() => ({ width: globalThis.innerWidth, documentWidth: globalThis.document.documentElement.scrollWidth, bodyWidth: globalThis.document.body.scrollWidth, scrollY: globalThis.scrollY, documentHeight: globalThis.document.documentElement.scrollHeight }));
}

function assertNoOverflow(value) {
  assert.ok(value.documentWidth <= value.width + 1 && value.bodyWidth <= value.width + 1, `Horizontal overflow: ${JSON.stringify(value)}`);
}

async function kernelReady(page) {
  await page.goto(url('/kernelcode/index.html'), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => {
    const runtime = globalThis.GDamonRuntime;
    return runtime?.getPointerMetrics && runtime.stage && runtime.hero && !globalThis.document.body.classList.contains('loading') && globalThis.document.querySelector('#heroGL').dataset.signatureState === 'ready';
  }, null, { timeout: 45000 });
}

const pointerMetrics = page => page.evaluate(() => globalThis.GDamonRuntime.getPointerMetrics());

async function kernelSection(page, index) {
  const nav = page.locator(`.navpill a[data-section="${index}"]`);
  if (!(await nav.isVisible())) await page.locator('.navtoggle').click();
  await nav.click();
  await page.waitForFunction(index => {
    const runtime = globalThis.GDamonRuntime;
    const section = globalThis.document.querySelectorAll('main > section')[index];
    return runtime.sectionIndex === index && !runtime.transitioning && section.classList.contains('show') && Number(globalThis.getComputedStyle(section).opacity) > .99 && [...section.querySelectorAll('.rv > span')].every(span => Number(globalThis.getComputedStyle(span).opacity) > .95);
  }, index, { timeout: 25000 });
}

async function particleEvidence(page) {
  return page.evaluate(() => {
    const runtime = globalThis.GDamonRuntime;
    const stage = globalThis.document.querySelector('#stage');
    runtime.stage.update(globalThis.performance.now());
    const sample = globalThis.document.createElement('canvas');
    sample.width = 360;
    sample.height = Math.round(360 * stage.height / stage.width);
    const context = sample.getContext('2d', { willReadFrequently: true });
    context.drawImage(stage, 0, 0, sample.width, sample.height);
    const data = context.getImageData(0, 0, sample.width, sample.height).data;
    let brightPixels = 0;
    for (let i = 0; i < data.length; i += 4) if (data[i] > 60 && data[i + 1] > 60 && data[i + 2] > 60 && data[i + 3] > 15) brightPixels++;
    return { section: runtime.sectionIndex, on: stage.classList.contains('on'), opacity: Number(globalThis.getComputedStyle(stage).opacity), brightPixels, count: Number(stage.dataset.particleCount), weights: Object.fromEntries(['wA', 'wB', 'wC'].map(name => [name, runtime.stage.uni[name].value])) };
  });
}

async function caseEvidence(page, id) {
  const project = byId.get(id);
  assert.ok(project, `Unknown fixture project ${id}`);
  await page.locator(`.pw-case[data-project-id="${id}"] .pw-case-intro h1`).waitFor({ state: 'visible', timeout: 20000 });
  assert.equal((await page.locator('.pw-case-intro h1').innerText()).replace(/\.$/, ''), project.title);
  const body = await page.locator('main').innerText();
  assert.ok(body.includes(project.description), 'The selected case does not include its actual description.');
  assert.ok(body.includes(project.outcome), 'The selected case does not include its reported outcome.');
  for (const detail of project.details) assert.ok(body.includes(detail), `Missing contribution: ${detail}`);
  assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1, 'The case page has more than one primary heading.');
  assertNoOverflow(await widthEvidence(page));
  return { id, title: project.title, description: project.description, details: project.details, outcome: project.outcome, url: page.url(), width: await widthEvidence(page) };
}

async function filmReady(page) {
  await page.goto(url('/film'), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => globalThis.GDamonSite && globalThis.document.querySelector('.fw-page')?.dataset.scene === 'ready', null, { timeout: 45000 });
}

async function filmProgress(page, progress) {
  await page.evaluate(value => {
    const story = globalThis.document.querySelector('.fw-story');
    const stage = globalThis.document.querySelector('.fw-stage');
    globalThis.scrollTo({ top: globalThis.scrollY + story.getBoundingClientRect().top + value * (story.offsetHeight - stage.clientHeight), behavior: 'instant' });
  }, progress);
  await page.waitForFunction(value => {
    const state = globalThis.GDamonSite.getMetrics();
    return Math.abs(state.progress - value) < .001 && state.settled && state.time === state.targetTime;
  }, progress, { timeout: 20000 });
  return page.evaluate(() => globalThis.GDamonSite.getMetrics());
}

async function filmChapterEvidence(page) {
  return page.locator('.fw-story-chapter.is-active').evaluate(element => {
    const rect = node => {
      const r = node.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
    };
    return {
      text: element.innerText, heading: element.querySelector('h2').textContent,
      inert: element.inert, ariaHidden: element.getAttribute('aria-hidden'),
      headingRect: rect(element.querySelector('h2')),
      explanationRect: rect(element.querySelector('.fw-story-explanation')),
      headerRect: rect(globalThis.document.querySelector('.fw-header')),
      links: [...element.querySelectorAll('.fw-evidence-link')].map(link => ({ href: link.getAttribute('href'), title: link.querySelector('h3').textContent.trim(), text: link.textContent, rect: rect(link) })),
      viewport: [globalThis.innerWidth, globalThis.innerHeight],
    };
  });
}

function assertFilmEvidence(value, ids) {
  assert.equal(value.inert, false);
  assert.equal(value.ariaHidden, 'false');
  assert.ok(value.headingRect.top >= value.headerRect.bottom - 2, `Story heading overlaps its header: ${JSON.stringify(value)}`);
  for (const id of ids) assert.ok(value.links.some(link => link.href === `/projects#${id}`), `The chapter is missing its ${id} case link.`);
  for (const link of value.links) {
    assert.ok(link.rect.top >= value.headerRect.bottom - 2 && link.rect.bottom <= value.viewport[1] + 1, `Case evidence lies outside the usable viewport: ${JSON.stringify(value)}`);
    assert.ok(link.rect.left >= -1 && link.rect.right <= value.viewport[0] + 1, 'A case link overflows horizontally.');
    assert.ok(value.explanationRect.bottom + 8 <= link.rect.top, `The chapter explanation overlaps its case evidence: ${JSON.stringify(value)}`);
  }
}

try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'] });

  if (['all', 'kernel', 'kernel-journey'].includes(selection)) {
    await check('Kernel uses a native cursor and bounded, releasable pointer interaction', () => withPage('kernel-pointer', {}, async page => {
      await kernelReady(page);
      assert.equal(await page.locator('#cursor, #cursorLabel').count(), 0, 'Custom cursor overlays remain.');
      const cursor = await page.evaluate(() => ({ body: globalThis.getComputedStyle(globalThis.document.body).cursor, canvas: globalThis.getComputedStyle(globalThis.document.querySelector('#heroGL')).cursor, link: globalThis.getComputedStyle(globalThis.document.querySelector('.cta')).cursor }));
      assert.notEqual(cursor.body, 'none');
      assert.equal(cursor.link, 'pointer');
      assert.equal(cursor.canvas, 'grab');
      await page.mouse.move(1420, 360);
      await page.waitForFunction(() => globalThis.GDamonRuntime.getPointerMetrics().current.x > .4);
      const edge = await pointerMetrics(page);
      assert.ok(Math.abs(edge.current.x) <= .5 && Math.abs(edge.current.y) <= .5);
      await page.mouse.move(900, 330);
      await page.mouse.down();
      await page.mouse.move(1400, 600, { steps: 6 });
      const drag = await pointerMetrics(page);
      assert.equal(drag.hero.dragging, true);
      assert.ok(Math.abs(drag.hero.dragX) <= .320001 && Math.abs(drag.hero.dragY) <= .650001);
      assert.ok(Math.abs(drag.hero.velocity) <= .600001);
      assert.equal(await page.locator('#heroGL').evaluate(canvas => globalThis.getComputedStyle(canvas).cursor), 'grabbing');
      await page.mouse.up();
      await page.waitForFunction(() => !globalThis.GDamonRuntime.getPointerMetrics().hero.dragging);
      await page.waitForFunction(() => Math.abs(globalThis.GDamonRuntime.getPointerMetrics().hero.dragY) < .09, null, { timeout: 10000 });
      const released = await pointerMetrics(page);
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => { const p = globalThis.GDamonRuntime.getPointerMetrics(); return p.target.x === 0 && p.target.y === 0 && p.hero.dragX === 0 && p.hero.dragY === 0; });
      await page.mouse.move(900, 330); await page.mouse.down(); await page.mouse.move(1200, 480);
      await page.evaluate(() => globalThis.dispatchEvent(new globalThis.Event('blur')));
      await page.mouse.up();
      const reset = await pointerMetrics(page);
      assert.equal(reset.hero.dragging, false);
      assert.equal(reset.hero.dragX, 0);
      assert.equal(reset.hero.dragY, 0);
      await shot(page, 'kernel-native-pointer');
      const particles = [];
      for (const section of [1, 3]) {
        await kernelSection(page, section);
        const evidence = await particleEvidence(page);
        assert.equal(evidence.on, true); assert.equal(evidence.opacity, 1); assert.equal(evidence.count, 30000);
        assert.ok(evidence.brightPixels > 80, 'Particle morph is not actually visible.');
        particles.push(evidence);
      }
      await page.locator('.navpill a[data-section="1"]').click();
      await page.locator('.navpill a[data-section="2"]').click();
      await page.locator('.navpill a[data-section="3"]').click();
      await page.waitForFunction(() => globalThis.GDamonRuntime.sectionIndex === 3 && !globalThis.GDamonRuntime.transitioning, null, { timeout: 12000 });
      const rapidNavigation = await page.evaluate(() => ({ section: globalThis.GDamonRuntime.sectionIndex, activeLink: globalThis.document.querySelector('.navpill [aria-current="page"]')?.dataset.section }));
      assert.equal(rapidNavigation.activeLink, '3', 'Rapid explicit navigation dropped the latest requested section.');
      await shot(page, 'kernel-work-native-cursor');
      return { cursor, edge, drag, released, reset, particles, rapidNavigation };
    }));

    for (const mode of ['reduced', 'touch']) await check(`Kernel ${mode} input keeps neutral parallax and working navigation`, () => withPage(`kernel-${mode}`, mode === 'touch' ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } : { reducedMotion: 'reduce' }, async page => {
      await kernelReady(page);
      if (mode === 'touch') {
        const client = await page.context().newCDPSession(page);
        await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 290, y: 420 }] });
        await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await client.detach();
      } else await page.mouse.move(1200, 300);
      await page.waitForTimeout(120);
      const pointer = await pointerMetrics(page);
      assert.equal(pointer.hero.dragging, false);
      assert.equal(pointer.target.x, 0); assert.equal(pointer.target.y, 0);
      assert.equal(pointer.hero.dragX, 0); assert.equal(pointer.hero.dragY, 0);
      if (mode === 'touch') assert.equal(pointer.fine, false);
      else assert.equal(pointer.reduced, true);
      await kernelSection(page, 3);
      const particles = await particleEvidence(page);
      assert.ok(particles.brightPixels > 80 && particles.on, 'Project particle signature disappeared.');
      await shot(page, `kernel-${mode}-work`);
      return { pointer, particles, width: await widthEvidence(page) };
    }));
  }

  if (['all', 'projects', 'projects-responsive', 'kernel-journey'].includes(selection)) {
    if (selection !== 'projects-responsive') await check('Kernel work card opens the actual Dynamic Tools case; history and hash navigation work', () => withPage('kernel-to-case', {}, async page => {
      await kernelReady(page);
      await kernelSection(page, 3);
      const id = 'dynamic-tool-resolution-agents';
      const card = page.locator(`#steps a[href="/projects#${id}"]`);
      await card.focus();
      await page.keyboard.press('Enter');
      await page.waitForURL(value => value.pathname === '/projects' && value.hash === `#${id}`);
      const opened = await caseEvidence(page, id);
      await shot(page, 'dynamic-tools-opened-from-kernel');
      await page.reload({ waitUntil: 'domcontentloaded' });
      const reloaded = await caseEvidence(page, id);
      await page.evaluate(() => { globalThis.location.hash = '#supply-chain-agent-system'; });
      const changed = await caseEvidence(page, 'supply-chain-agent-system');
      await page.goBack({ waitUntil: 'domcontentloaded' });
      const back = await caseEvidence(page, id);
      const contributions = page.getByText(byId.get(id).details[0], { exact: true });
      await contributions.scrollIntoViewIfNeeded();
      await shot(page, 'dynamic-tools-contributions');
      assert.ok(await page.evaluate(() => globalThis.scrollY) > 0, 'Case details cannot be reached through normal document scrolling.');
      await page.goBack({ waitUntil: 'domcontentloaded' });
      await page.waitForURL(value => value.pathname === '/kernelcode/index.html');
      await page.waitForFunction(() => globalThis.GDamonRuntime?.sectionIndex === 3 && !globalThis.GDamonRuntime.transitioning && !globalThis.document.body.classList.contains('loading'), null, { timeout: 45000 });
      const returnedSection = await page.evaluate(() => globalThis.GDamonRuntime.sectionIndex);
      assert.equal(returnedSection, 3, 'Back from a project lost the Selected work chapter.');
      const returnedFocus = await page.evaluate(() => globalThis.document.activeElement?.getAttribute('href'));
      await shot(page, 'kernel-work-returned-from-case');
      return { opened, reloaded, changed, back, returnedSection, returnedFocus };
    }));

    if (!['kernel-journey', 'projects-responsive'].includes(selection)) await check('Project filters, keyboard case selection and malformed hashes remain usable', () => withPage('project-index', {}, async page => {
      await page.goto(url('/projects'), { waitUntil: 'domcontentloaded' });
      await page.locator('.pw-index-intro h1').waitFor();
      assert.equal(await page.locator('.pw-project-row').count(), projects.length);
      const filter = page.getByRole('button', { name: /^Research/ });
      await filter.focus(); await page.keyboard.press('Enter');
      await page.waitForFunction(() => [...globalThis.document.querySelectorAll('.pw-filters button')].some(button => button.textContent.startsWith('Research') && button.getAttribute('aria-pressed') === 'true'));
      const rows = await page.locator('.pw-project-row').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
      const expected = projects.filter(project => project.category === 'research').map(project => `/projects#${project.id}`);
      assert.deepEqual(rows, expected);
      await page.locator('.pw-project-row[href="/projects#multi-turn-agent-evaluation"]').focus();
      await page.keyboard.press('Enter');
      const selected = await caseEvidence(page, 'multi-turn-agent-evaluation');
      const entryFocus = await page.evaluate(() => ({ focusedHeading: globalThis.document.activeElement === globalThis.document.querySelector('.pw-case-intro h1'), scrollY: globalThis.scrollY }));
      assert.equal(entryFocus.focusedHeading, true); assert.equal(entryFocus.scrollY, 0);
      await page.getByRole('button', { name: 'Explore the work', exact: true }).focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => globalThis.scrollY > 100 && globalThis.document.activeElement?.id === 'project-contribution');
      assert.equal(new URL(page.url()).hash, '#multi-turn-agent-evaluation', 'In-page navigation replaced the canonical case hash.');
      await shot(page, 'evaluation-case-keyboard-contributions');
      await page.evaluate(() => { globalThis.location.hash = '#dynamic-tool-resolution-agents'; });
      const direct = await caseEvidence(page, 'dynamic-tool-resolution-agents');
      await page.locator('.pw-case-next .pw-next-work').click();
      await caseEvidence(page, 'supply-chain-domain-llm');
      await page.goBack({ waitUntil: 'domcontentloaded' });
      await caseEvidence(page, 'dynamic-tool-resolution-agents');
      await page.goto(url('/projects#%E0%A4%A'), { waitUntil: 'domcontentloaded' });
      await page.locator('.pw-index-intro h1').waitFor();
      assert.equal(await page.locator('.pw-project-row').count(), projects.length);
      await shot(page, 'project-index-filter-fallback');
      return { rows, selected, entryFocus, direct, malformedHashFallback: true };
    }));

    if (selection !== 'kernel-journey') for (const [width, height] of [[390, 844], [844, 390]]) await check(`Project case stays readable and natively scrollable at ${width}×${height}`, () => withPage(`case-${width}`, { viewport: { width, height } }, async page => {
      const id = 'dynamic-tool-resolution-agents';
      await page.goto(url(`/projects#${id}`), { waitUntil: 'domcontentloaded' });
      const evidence = await caseEvidence(page, id);
      await shot(page, `dynamic-tools-${width}x${height}-top`);
      await page.mouse.move(width * .8, height * .7);
      await page.mouse.wheel(0, 500);
      await page.waitForFunction(() => globalThis.scrollY > 100);
      const outcome = page.getByText(byId.get(id).outcome, { exact: true });
      await outcome.scrollIntoViewIfNeeded();
      assert.equal(await outcome.isVisible(), true);
      await shot(page, `dynamic-tools-${width}x${height}-outcome`);
      assertNoOverflow(await widthEvidence(page));
      return { ...evidence, afterWheel: await widthEvidence(page) };
    }));
  }

  if (['all', 'film', 'film-compact', 'film-static'].includes(selection)) {
    const chapters = [
      { label: 'train', progress: .04, ids: ['supply-chain-domain-llm', 'product-attribute-rl'] },
      { label: 'deploy', progress: .49, ids: ['dynamic-tool-resolution-agents', 'supply-chain-agent-system'] },
      { label: 'evaluate', progress: .9, ids: ['multi-turn-agent-evaluation', 'supchain-bench'] },
    ];
    const filmSizes = selection === 'film-static' ? [] : selection === 'film-compact' ? [[320, 568], [390, 667]] : [[1440, 900], [390, 844], [844, 390], [320, 568], [390, 667]];
    for (const [width, height] of filmSizes) await check(`Film explains real training, deployment and evaluation work at ${width}×${height}`, () => withPage(`film-work-${width}-${height}`, { viewport: { width, height } }, async page => {
      await filmReady(page);
      assert.equal(await page.locator('video, audio').count(), 0);
      const scenes = [];
      for (const chapter of chapters) {
        const state = await filmProgress(page, chapter.progress);
        const evidence = await filmChapterEvidence(page);
        await shot(page, `film-${width}x${height}-${chapter.label}`);
        assertFilmEvidence(evidence, chapter.ids);
        if (width <= height && height <= 600) {
          assert.ok(state.artworkBounds, 'Compact phones have no measured artwork region.');
          const scale = state.width / width;
          assert.ok(state.artworkBounds.y / scale >= evidence.headingRect.bottom + 8, 'Artwork intrudes into the heading.');
          assert.ok((state.artworkBounds.y + state.artworkBounds.height) / scale <= evidence.explanationRect.top - 8, 'Artwork intrudes into the explanatory text.');
        }
        assert.equal(state.chapter, chapter.label);
        assertNoOverflow(await widthEvidence(page));
        const pixels = hash(await page.locator('.fw-canvas').evaluate(canvas => canvas.toDataURL()));
        scenes.push({ state, evidence, pixels });
      }
      assert.equal(new Set(scenes.map(scene => scene.pixels)).size, 3, 'The background artwork did not change with the research chapters.');
      const reverse = await filmProgress(page, .49);
      assert.equal(reverse.chapter, 'deploy');
      await page.waitForTimeout(400);
      const resting = await page.evaluate(() => globalThis.GDamonSite.getMetrics());
      assert.equal(resting.time, reverse.time, 'Film keeps advancing after the user stops scrolling.');
      const hiddenLinks = await page.locator('.fw-story-chapter:not(.is-active)').evaluateAll(elements => elements.map(element => ({ inert: element.inert, hidden: element.getAttribute('aria-hidden') })));
      assert.ok(hiddenLinks.every(item => item.inert && item.hidden === 'true'), 'Inactive story chapter links remain focusable.');
      if (width === 1440) {
        const link = page.locator('.fw-story-chapter.is-active a[href="/projects#dynamic-tool-resolution-agents"]');
        await link.focus(); await page.keyboard.press('Enter');
        await caseEvidence(page, 'dynamic-tool-resolution-agents');
      }
      assert.equal(report.mediaRequests.filter(request => request.scenario === `film-work-${width}-${height}`).length, 0);
      return { scenes, reverse, resting, hiddenLinks };
    }));

    if (selection !== 'film-compact') for (const mode of ['reduced', 'fallback']) await check(`Film ${mode} mode preserves actual case information without a pinned animation`, () => withPage(`film-${mode}`, { viewport: { width: 390, height: 844 }, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' }, async page => {
      await page.goto(url('/film'), { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(expected => globalThis.document.querySelector('.fw-page')?.dataset.scene === expected, mode === 'reduced' ? 'static' : 'fallback', { timeout: 30000 });
      const position = await page.locator('.fw-stage').evaluate(stage => globalThis.getComputedStyle(stage).position);
      assert.notEqual(position, 'sticky');
      assert.equal(await page.locator('video, audio').count(), 0);
      const chapters = await page.locator('.fw-story-chapter').evaluateAll(elements => elements.map(element => ({ heading: element.querySelector('h2').textContent, inert: element.inert, hidden: element.getAttribute('aria-hidden'), visible: globalThis.getComputedStyle(element).visibility, height: element.getBoundingClientRect().height, links: element.querySelectorAll('a[href^="/projects#"]').length })));
      assert.equal(chapters.length, 3);
      assert.ok(chapters.every(chapter => !chapter.inert && chapter.hidden === 'false' && chapter.visible === 'visible' && chapter.height > 100 && chapter.links === 2), 'Static mode does not expose all three real-work chapters.');
      const project = page.locator('.fw-project[href="/projects#dynamic-tool-resolution-agents"]');
      await project.scrollIntoViewIfNeeded();
      const text = await project.innerText();
      assert.ok(text.includes(byId.get('dynamic-tool-resolution-agents').details[0]));
      assert.ok(text.includes(byId.get('dynamic-tool-resolution-agents').outcome));
      await shot(page, `film-${mode}-real-work`);
      assertNoOverflow(await widthEvidence(page));
      return { position, project: text, chapters };
    }, mode === 'fallback'));

    if (!['film-compact', 'film-static'].includes(selection)) await check('Archived film player still uses the original timed artwork', () => withPage('film-archive', { reducedMotion: 'reduce' }, async page => {
      await page.goto(url('/film?view=player'), { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => globalThis.GDamonFilm?.getMetrics().ready, null, { timeout: 45000 });
      await page.evaluate(() => globalThis.GDamonFilm.seek(8.8));
      const state = await page.evaluate(() => globalThis.GDamonFilm.getMetrics());
      assert.equal(state.time, 8.8); assert.equal(state.duration, 18);
      assert.equal(state.robot.renderer, 'three');
      assert.equal(await page.locator('#film-progress').count(), 1);
      await shot(page, 'archived-film-player');
      return state;
    }));
  }
} catch (error) {
  report.checks.push({ name: 'Harness initialization', pass: false, error: error.stack || String(error) });
} finally {
  await browser?.close();
  report.finishedAt = new Date().toISOString();
  report.pass = report.checks.length > 0 && report.checks.every(check => check.pass) && report.errors.length === 0 && report.failedResponses.length === 0;
  await writeFile(join(output, 'portfolio-journey-report.json'), `${JSON.stringify(report, null, 2)}\n`);
}
console.log(`Portfolio journey checks ${report.pass ? 'passed' : 'failed'}. Report: ${join(output, 'portfolio-journey-report.json')}`);
if (!report.pass) process.exitCode = 1;
