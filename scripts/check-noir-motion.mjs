import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { URL } from 'node:url';
import process from 'node:process';
import console from 'node:console';
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:4175';
const output = process.argv[3] || '/workspace/noir-motion-check/final';
const selection = process.argv[4] || 'all';
const report = { base, startedAt: new Date().toISOString(), checks: [], errors: [], expectedErrors: [], screenshots: [], requests: [], limitations: ['Chromium uses a software GPU in this environment; these checks do not establish a device frame rate.'] };
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });

async function check(name, run) {
  try { const evidence = await run(); report.checks.push({ name, pass: true, evidence }); console.log(`PASS ${name}`); }
  catch (error) { report.checks.push({ name, pass: false, error: error.stack || String(error) }); console.error(`FAIL ${name}: ${error.message}`); }
}
async function shot(page, name) {
  const path = join(output, `${name}.png`); await page.screenshot({ path, animations: 'disabled' }); report.screenshots.push(path); return path;
}
async function withPage(name, options, run, fault = '') {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference', ...options });
  const heldFonts = [];
  if (fault === 'slow-font') await context.route(/anton.*\.woff2?(?:\?|$)/, route => { heldFonts.push(route); });
  if (fault === 'timeline') await context.route('**/oil-lab/noir/seed/timeline.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ schemaVersion: 1, fps: 0, frameCount: 0, states: [] }) }));
  if (fault === 'missing-timeline') await context.route('**/oil-lab/noir/seed/timeline.json', route => route.fulfill({ status: 404, body: 'Not found' }));
  await context.addInitScript(({ fault }) => {
    globalThis.__noirProbe = { playCalls: 0, frames: 0 };
    const raf = globalThis.requestAnimationFrame.bind(globalThis);
    globalThis.requestAnimationFrame = callback => raf(now => { globalThis.__noirProbe.frames++; callback(now); });
    const play = globalThis.HTMLMediaElement.prototype.play;
    globalThis.HTMLMediaElement.prototype.play = function (...args) { globalThis.__noirProbe.playCalls++; return Reflect.apply(play, this, args); };
    if (fault === 'webgl') {
      const get = globalThis.HTMLCanvasElement.prototype.getContext;
      globalThis.HTMLCanvasElement.prototype.getContext = function (type, ...args) { return /webgl/i.test(type) ? null : Reflect.apply(get, this, [type, ...args]); };
    }
  }, { fault });
  if (fault === 'media') await context.route('**/oil-lab/noir/**/*.mp4', route => route.abort('failed'));
  const page = await context.newPage(); page.setDefaultTimeout(25000);
  const log = (type, message, source = '') => {
    const item = { scenario: name, type, message, source };
    const pendingPilotAsset = selection === 'pilot' && /\/noir\/(relay|lens)\/.*\.mp4/.test(source) && /404/.test(message);
    if (pendingPilotAsset || (fault === 'missing-timeline' && /timeline\.json/.test(source) && /404/.test(message)) || (fault === 'webgl' && /webgl|context|3d|renderer/i.test(message)) || (fault === 'media' && /ERR_FAILED|Failed to load resource/i.test(message))) report.expectedErrors.push(item); else report.errors.push(item);
  };
  page.on('pageerror', error => log('pageerror', error.message));
  page.on('console', message => { if (message.type() === 'error') log('console', message.text(), message.location().url); });
  page.on('response', response => { if (/oil-lab\/noir/.test(response.url()) && /\.(png|mp4|webm)(?:$|\?)/.test(response.url())) report.requests.push({ scenario: name, url: response.url(), status: response.status() }); });
  try { return await run(page, async () => { await Promise.all(heldFonts.map(route => route.continue())); await context.unroute(/anton.*\.woff2?(?:\?|$)/); }); }
  catch (error) { await shot(page, `failed-${name}`).catch(() => {}); report.failureState ||= []; report.failureState.push({ scenario: name, state: await page.evaluate(() => globalThis.GDamonNoir?.getMetrics()).catch(() => null) }); throw error; }
  finally { await context.close(); }
}

async function open(page, suffix = '') {
  await page.goto(new URL('/oil-lab/noir' + suffix, base).href, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(globalThis.GDamonNoir));
  await page.evaluate(() => globalThis.document.fonts.ready);
  await page.waitForFunction(() => ['ready', 'static', 'fallback'].includes(globalThis.GDamonNoir.getMetrics().hero?.status));
}
async function metrics(page) { return page.evaluate(() => globalThis.GDamonNoir.getMetrics()); }
async function move(page, selector, progress) {
  await page.evaluate(({ selector, progress }) => {
    const story = globalThis.document.querySelector(selector);
    if (!story) throw new Error(`Missing story: ${selector}`);
    const stage = story.querySelector('.noir-stage, .noir-study-stage');
    globalThis.scrollTo({ top: globalThis.scrollY + story.getBoundingClientRect().top + Math.max(0, story.offsetHeight - (stage?.clientHeight || globalThis.innerHeight)) * progress, behavior: 'instant' });
  }, { selector, progress });
  await page.waitForFunction(({ selector, progress }) => {
    const state = globalThis.GDamonNoir.getMetrics(), id = globalThis.document.querySelector(selector).dataset.noirStudy;
    const part = id ? state.chapters.find(chapter => chapter.id === id) : state.hero;
    return part && Math.abs(part.target - progress) < .003 && part.settled;
  }, { selector, progress });
  return metrics(page);
}
async function resting(page) {
  const before = await page.evaluate(() => globalThis.__noirProbe.frames); await page.waitForTimeout(450); const after = await page.evaluate(() => globalThis.__noirProbe.frames);
  assert.ok(after - before <= 2, 'A settled visible section keeps running animation frames.');
  assert.equal(await page.evaluate(() => globalThis.__noirProbe.playCalls), 0, 'Video autoplay replaced scroll control.');
  return after - before;
}
async function pageLayout(page) {
  return page.evaluate(() => {
    const rect = element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
    return { viewport: [globalThis.innerWidth, globalThis.innerHeight], width: globalThis.document.documentElement.scrollWidth,
      headings: [...globalThis.document.querySelectorAll('h1,h2')].map(element => ({ text: element.textContent.trim(), ...rect(element) })),
      links: [...globalThis.document.querySelectorAll('a[href^="/projects#"]')].map(element => ({ text: element.textContent.trim(), href: element.getAttribute('href'), ...rect(element) })),
      stages: [...globalThis.document.querySelectorAll('.noir-stage, .noir-study-stage')].map(element => ({ ...rect(element), position: globalThis.getComputedStyle(element).position })),
      videos: [...globalThis.document.querySelectorAll('video')].map(element => ({ source: element.currentSrc, time: element.currentTime, paused: element.paused, readyState: element.readyState, error: element.error?.code || null })),
      cursor: globalThis.getComputedStyle(globalThis.document.body).cursor,
    };
  });
}
function assertLayout(geometry) {
  assert.ok(geometry.width <= geometry.viewport[0] + 1, `Horizontal overflow: ${geometry.width}`);
  for (const heading of geometry.headings.filter(value => value.y < geometry.viewport[1] && value.bottom > 0)) assert.ok(heading.x >= -1 && heading.right <= geometry.viewport[0] + 1, `Clipped heading: ${heading.text}`);
  assert.ok(geometry.cursor !== 'none', 'Native cursor has been hidden.');
  for (const stage of geometry.stages.filter(value => value.position === 'sticky' && value.y < 1 && value.bottom > 0)) assert.ok(stage.height <= geometry.viewport[1] + 1, `Pinned content is taller than the visible screen: ${stage.height}`);
}

try {
  if (selection.startsWith('flow')) for (const kind of ['film', 'matter'].filter(kind => selection === 'flow' || selection.includes(kind))) {
    const config = kind === 'film' ? { path: '/film', api: 'GDamonSite', story: '.fw-story', stage: '.fw-stage' } : { path: '/oil-lab/matter', api: 'GDamonOil', story: '.matter-story', stage: '.matter-stage' };
    const viewports = selection.endsWith('desktop') ? [[1440, 900]] : selection.endsWith('compact') ? [[390, 844], [320, 568], [844, 390]] : [[1440, 900], [390, 844]];
    for (const [width, height] of viewports) await check(`${kind}: arc transitions are reversible and settle at ${width}×${height}`, () => withPage(`${kind}-${width}`, { viewport: { width, height } }, async page => {
      await page.goto(new URL(config.path, base).href); await page.waitForFunction(api => Boolean(globalThis[api]), config.api);
      await page.waitForFunction(kind => kind === 'film' ? globalThis.document.querySelector('.fw-page')?.dataset.scene === 'ready' : globalThis.GDamonOil?.getMetrics().status === 'ready', kind);
      await page.waitForFunction(() => globalThis.document.fonts.status === 'loaded');
      const at = async progress => {
        await page.evaluate(({ progress, story, stage }) => { const element = globalThis.document.querySelector(story), panel = globalThis.document.querySelector(stage); globalThis.scrollTo({ top: globalThis.scrollY + element.getBoundingClientRect().top + (element.offsetHeight - panel.clientHeight) * progress, behavior: 'instant' }); }, { ...config, progress });
        await page.waitForFunction(({ api, progress }) => { const state = globalThis[api].getMetrics(); return Math.abs((state.targetProgress ?? state.scrollProgress) - progress) < .004 && state.settled; }, { api: config.api, progress }, { timeout: 30000 });
        return page.evaluate(api => globalThis[api].getMetrics(), config.api);
      };
      const positions = kind === 'film' ? [.24, .27, .285, .305, .33, .35, .365, .61, .635, .66, .69, .71, .735] : [.41, .445, .47, .51, .55, .59, .64, .68, .74, .78, .82, .86, .9, .96];
      const samples = [];
      for (const progress of positions) { const state = await at(progress); samples.push({ progress, state }); if (width === 1440 || progress === positions[4] || progress === .82 || progress === positions.at(-1)) await shot(page, `${kind}-${width}-pose-${Math.round(progress * 1000)}`); }
      const mid = positions[4]; const original = samples[4].state; const reverse = await at(mid);
      const shape = state => state.flow || state.particle;
      assert.deepEqual(shape(reverse).weights, shape(original).weights, 'Reversing scroll produces a different held pose.');
      assert.equal(shape(reverse).geometryVersion, shape(original).geometryVersion, 'Animation rebuilds geometry while scrolling.');
      const before = await page.evaluate(() => globalThis.__noirProbe.frames); await page.waitForTimeout(450); const after = await page.evaluate(() => globalThis.__noirProbe.frames); assert.ok(after - before <= 2, 'The settled story continues running animation frames.');
      assert.equal(await page.evaluate(() => globalThis.__noirProbe.playCalls), 0); assertLayout(await pageLayout(page));
      return { samples, reverse, idleFrames: after - before };
    }));
  }
  if (selection === 'all' || selection === 'smoke') await check('Noir: first view exposes personal content and working project destinations', () => withPage('smoke', {}, async page => {
    await open(page); const geometry = await pageLayout(page); assertLayout(geometry); assert.ok(geometry.links.length >= 3); assert.ok(geometry.headings.some(heading => /agent|research|intelligence|work|machine|signal/i.test(heading.text))); await shot(page, 'noir-hero'); return { geometry, state: await metrics(page) };
  }));
  if (selection === 'all' || selection === 'hero') for (const [width, height] of [[1440, 900], [390, 844], [320, 568], [844, 390]]) await check(`Noir: four particle poses, fine increments, reversal and rest at ${width}×${height}`, () => withPage(`hero-${width}`, { viewport: { width, height } }, async page => {
    await open(page); const samples = [];
    const progressList = width === 1440 ? [0, .12, .145, .18, .21, .25, .30, .43, .48, .54, .59, .65, .77, .82, .87, .93, 1] : [0, .21, .34, .54, .67, .86, 1];
    for (const progress of progressList) {
      const state = await move(page, '.noir-story', progress); const geometry = await pageLayout(page); assertLayout(geometry); samples.push({ progress, state: state.hero });
      await shot(page, `noir-${width}-${Math.round(progress * 100)}`);
    }
    const forward = await move(page, '.noir-story', .34); await move(page, '.noir-story', .87); const reverse = await move(page, '.noir-story', .34);
    assert.ok(Math.abs(reverse.hero.progress - forward.hero.progress) < .0001); assert.equal(reverse.hero.phase, forward.hero.phase);
    const idleFrames = await resting(page); return { samples, reverse: reverse.hero, idleFrames };
  }));
  if (selection === 'all' || selection === 'pilot' || selection === 'studies') {
    const ids = selection === 'pilot' ? ['seed'] : ['seed', 'relay', 'lens'];
    for (const id of ids) for (const [width, height] of [[1440, 900], [390, 844]]) await check(`Noir ${id}: actual generated video scrubs and reverses at ${width}×${height}`, () => withPage(`${id}-${width}`, { viewport: { width, height } }, async page => {
      await open(page); const selector = `[data-noir-study="${id}"]`; await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForFunction(id => globalThis.GDamonNoir.getMetrics().chapters.find(chapter => chapter.id === id)?.status === 'ready', id, { timeout: 45000 });
      const samples = []; for (const progress of [0, .12, .30, .50, .72, .94, 1, .45, .10]) {
        const state = (await move(page, selector, progress)).chapters.find(chapter => chapter.id === id); assert.equal(state.paused, true); assert.equal(state.seeking, false); assert.equal(state.status, 'ready');
        samples.push({ progress, state }); if (progress !== .10) await shot(page, `noir-${id}-${width}-${Math.round(progress * 100)}`);
      }
      assert.ok(samples[6].state.currentTime > 3.8, 'Final generated frame never decoded.'); assert.ok(samples.at(-1).state.currentTime < .15, 'Reverse scroll did not return to early video frames.');
      const geometry = await pageLayout(page); assertLayout(geometry); const media = geometry.videos.find(video => video.source.includes(`/${id}/`)); assert.ok(media?.readyState >= 2); assert.ok(media.paused);
      const before = (await metrics(page)).chapters.find(chapter => chapter.id === id).seeks; const idleFrames = await resting(page); const after = (await metrics(page)).chapters.find(chapter => chapter.id === id).seeks; assert.equal(after, before, 'Held clip repeatedly seeks.');
      return { samples, geometry, idleFrames };
    }));
  }
  if (selection === 'all' || selection === 'fallbacks') for (const fault of ['reduce', 'webgl', 'media']) await check(`Noir: ${fault} fallback keeps work readable`, () => withPage(`fallback-${fault}`, { viewport: { width: 390, height: 844 }, reducedMotion: fault === 'reduce' ? 'reduce' : 'no-preference' }, async page => {
    await open(page); const geometry = await pageLayout(page); assertLayout(geometry); assert.ok(geometry.links.length >= 3);
    if (fault !== 'media') {
      const hero = page.locator('.noir-story'); assert.equal(await hero.getAttribute('data-mode'), 'static'); const cards = await page.locator('.noir-pose').evaluateAll(elements => elements.map(element => ({ inert: element.inert, aria: element.getAttribute('aria-hidden'), opacity: globalThis.getComputedStyle(element).opacity }))); assert.ok(cards.every(card => !card.inert && card.aria !== 'true' && Number(card.opacity) === 1));
    }
    if (fault === 'media') { await page.locator('[data-noir-study="seed"]').scrollIntoViewIfNeeded(); await page.waitForFunction(() => globalThis.GDamonNoir.getMetrics().chapters.find(chapter => chapter.id === 'seed')?.status === 'poster'); const image = page.locator('[data-noir-study="seed"] img').first(); await image.evaluate(element => element.decode()); assert.ok(await image.evaluate(element => element.naturalWidth > 0)); await page.locator('[data-noir-study="seed"]').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' })); }
    await shot(page, `noir-fallback-${fault}`); return { state: await metrics(page), geometry };
  }, fault === 'reduce' ? '' : fault));
  if (selection === 'all' || selection === 'compact') for (const [width, height] of [[320, 568], [844, 390]]) await check(`Noir: generated study keeps its case links in view at ${width}×${height}`, () => withPage(`study-compact-${width}`, { viewport: { width, height } }, async page => {
    await open(page); const selector = '[data-noir-study="seed"]'; await page.locator(selector).scrollIntoViewIfNeeded(); await page.waitForFunction(() => globalThis.GDamonNoir.getMetrics().chapters.find(chapter => chapter.id === 'seed')?.status === 'ready');
    const samples = []; for (const progress of [0, .50, 1]) { const state = await move(page, selector, progress); const geometry = await pageLayout(page); assertLayout(geometry); const links = await page.locator(`${selector} .noir-study-copy a`).evaluateAll(elements => elements.map(element => { const r = element.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; })); assert.ok(links.every(link => link.top > 60 && link.bottom <= globalThis.Number(height) - 5), `Case links outside viewport: ${JSON.stringify(links)}`); await shot(page, `noir-seed-${width}-${Math.round(progress * 100)}`); samples.push({ progress, state: state.chapters.find(chapter => chapter.id === 'seed'), links }); }
    return samples;
  }));
  if (selection === 'all' || selection === 'lifecycle') await check('Noir: context loss exposes accessible static content', () => withPage('context-loss', {}, async page => {
    await open(page); await move(page, '.noir-story', .67);
    await page.evaluate(() => { const canvas = globalThis.document.querySelector('.noir-canvas'); (canvas.getContext('webgl2') || canvas.getContext('webgl')).getExtension('WEBGL_lose_context').loseContext(); });
    await page.waitForFunction(() => globalThis.GDamonNoir.getMetrics().hero?.status === 'fallback'); assert.equal(await page.locator('.noir-story').getAttribute('data-mode'), 'static');
    const cards = await page.locator('.noir-pose').evaluateAll(elements => elements.map(element => ({ inert: element.inert, aria: element.getAttribute('aria-hidden') }))); assert.ok(cards.every(card => !card.inert && card.aria !== 'true')); return { cards, state: await metrics(page) };
  }));
  if (selection === 'all' || selection === 'lifecycle') await check('Noir: runtime motion preference can stop and restore the story', () => withPage('motion-preference', {}, async page => {
    await open(page); await move(page, '.noir-story', .67);
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForFunction(() => globalThis.GDamonNoir.getMetrics().hero?.status === 'static');
    const cards = await page.locator('.noir-pose').evaluateAll(elements => elements.map(element => ({ inert: element.inert, aria: element.getAttribute('aria-hidden') }))); assert.ok(cards.every(card => !card.inert && card.aria !== 'true'));
    await page.evaluate(() => globalThis.scrollTo({ top: 0, behavior: 'instant' })); await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.waitForFunction(() => globalThis.GDamonNoir.getMetrics().hero?.status === 'ready');
    const restored = await move(page, '.noir-story', .34); assert.equal(restored.hero.phase, 1); return { cards, restored: restored.hero };
  }));
  if (selection === 'all' || selection === 'journeys') await check('Noir: direct work anchors and real case journeys', () => withPage('journeys', {}, async page => {
    await open(page, '#noir-train'); await page.waitForTimeout(300); const top = await page.locator('#noir-train').evaluate(element => element.getBoundingClientRect().top); assert.ok(Math.abs(top) < 160, `Direct chapter anchor missed: ${top}`); await shot(page, 'noir-direct-train');
    const link = page.locator('[data-noir-study="seed"] .noir-text-link'); const href = await link.getAttribute('href'); await link.click(); await page.waitForURL(`**${href}`); await page.waitForSelector('[data-project-id]'); assert.equal(await page.locator('[data-project-id]').getAttribute('data-project-id'), href.split('#')[1]); return { top, href, title: await page.locator('h1').innerText() };
  }));
  if (selection === 'integrity' || selection === 'font') {
    for (const id of (selection === 'font' ? [] : ['seed', 'relay', 'lens'])) await check(`Noir ${id}: manifest drives exact first, final and reversed frames`, () => withPage(`manifest-${id}`, {}, async page => {
      await open(page); const selector = `[data-noir-study="${id}"]`; await page.locator(selector).scrollIntoViewIfNeeded(); await page.waitForFunction(id => globalThis.GDamonNoir.getMetrics().chapters.find(chapter => chapter.id === id)?.status === 'ready', id);
      const samples = []; for (const progress of [0, 1, 0]) { const state = (await move(page, selector, progress)).chapters.find(chapter => chapter.id === id); assert.equal(state.timelineStatus, 'ready'); assert.equal(state.fps, 24); assert.equal(state.frameCount, 96); assert.equal(state.finalHold, 95 / 24); assert.equal(state.paused, true); samples.push({ progress, state }); }
      assert.equal(samples[0].state.frame, 0); assert.equal(samples[1].state.frame, 95); assert.equal(samples[2].state.frame, 0); await resting(page); return samples;
    }));
    for (const fault of (selection === 'font' ? [] : ['timeline', 'missing-timeline'])) await check(`Noir: ${fault} safely unpins with no video request`, () => withPage(fault, { viewport: { width: 390, height: 844 } }, async page => {
      const videos = []; page.on('request', request => { if (/\/noir\/seed\/.*\.mp4/.test(request.url())) videos.push(request.url()); });
      await open(page); await page.locator('[data-noir-study="seed"]').scrollIntoViewIfNeeded(); await page.waitForFunction(() => globalThis.GDamonNoir.getMetrics().chapters.find(chapter => chapter.id === 'seed')?.status === 'poster');
      assert.equal(await page.locator('[data-noir-study="seed"]').getAttribute('data-mode'), 'static'); assert.deepEqual(videos, []); const image = page.locator('[data-noir-study="seed"] img').first(); await image.evaluate(element => element.decode()); assert.ok(await image.evaluate(element => element.naturalWidth > 0)); await shot(page, `noir-${fault}`); return { state: await metrics(page), videos };
    }, fault));
    await check('Noir: slow signature font never exposes invisible chapter links to keyboard focus', () => withPage('slow-font', {}, async (page, releaseFonts) => {
      await page.goto(new URL('/oil-lab/noir', base).href, { waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => globalThis.GDamonNoir?.getMetrics().hero?.status === 'loading');
      const cards = await page.locator('.noir-pose').evaluateAll(elements => elements.map(element => ({ inert: element.inert, aria: element.getAttribute('aria-hidden'), opacity: globalThis.getComputedStyle(element).opacity }))); assert.equal(cards[0].inert, false); assert.ok(cards.slice(1).every(card => card.inert && card.aria === 'true'));
      const focused = []; for (let i = 0; i < 10; i++) { await page.keyboard.press('Tab'); focused.push(await page.evaluate(() => { const active = globalThis.document.activeElement, card = active.closest('.noir-pose'); return { text: active.textContent?.trim(), hidden: card ? card.inert || card.getAttribute('aria-hidden') === 'true' : false }; })); } assert.ok(focused.every(item => !item.hidden));
      await releaseFonts(); await page.waitForFunction(() => globalThis.GDamonNoir.getMetrics().hero?.status === 'ready'); return { cards, focused };
    }, 'slow-font'));
  }
  if (selection === 'index') await check('Index and Oil gallery expose Noir with a loaded current thumbnail', () => withPage('index', { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, async page => {
    await page.goto(new URL('/index.html', base).href); const card = page.locator('.pv-card').filter({ has: page.locator('h2 a[href="/oil-lab/noir"]') }); await card.scrollIntoViewIfNeeded(); await card.locator('img').evaluate(element => element.decode()); const source = await card.locator('img').getAttribute('src'); assert.ok(await card.locator('img').evaluate(element => element.naturalWidth > 0)); await shot(page, 'index-noir'); assert.ok(await page.evaluate(() => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth + 1));
    const [popup] = await Promise.all([page.waitForEvent('popup'), card.locator('h2 a').click()]); await popup.waitForURL('**/oil-lab/noir'); await popup.waitForSelector('.noir-page'); await popup.close(); await page.goto(new URL('/oil-lab', base).href); await page.waitForSelector('.oil-gallery'); const link = page.locator('a[href="/oil-lab/noir"]').first(); await link.waitFor({ state: 'visible' }); await link.locator('img').evaluate(element => element.decode()); await link.click(); await page.waitForURL('**/oil-lab/noir'); await page.waitForSelector('.noir-page'); return { source, title: await page.title() };
  }));
} finally {
  await browser.close(); report.finishedAt = new Date().toISOString(); report.pass = report.checks.every(item => item.pass) && report.errors.length === 0; await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(`Noir motion checks ${report.pass ? 'passed' : 'failed'}: ${join(output, 'report.json')}`);
if (!report.pass) process.exitCode = 1;
