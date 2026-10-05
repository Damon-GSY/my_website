import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { URL } from 'node:url';
import process from 'node:process';
import console from 'node:console';
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:4175';
const output = process.argv[3] || '/workspace/scroll-flow-check/after';
const selection = process.argv[4] || 'all';
const report = { base, startedAt: new Date().toISOString(), checks: [], errors: [], expectedErrors: [], screenshots: [], mediaRequests: [], limitations: ['Headless Chromium uses a software GPU in this cloud environment. Frame intervals are observations, not a claim about device frame rates.'] };
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
const config = {
  film: { path: '/film', api: 'GDamonSite', story: '.fw-story', stage: '.fw-stage', canvas: '.fw-canvas', project: '.fw-project' },
  matter: { path: '/oil-lab/matter', api: 'GDamonOil', story: '.matter-story, .oil-story', stage: '.matter-stage, .oil-stage', canvas: '.matter-art canvas', project: '.oil-project' },
};

async function check(name, run) {
  try { const evidence = await run(); report.checks.push({ name, pass: true, evidence }); console.log(`PASS ${name}`); }
  catch (error) { report.checks.push({ name, pass: false, error: error.stack || String(error) }); console.error(`FAIL ${name}: ${error.message}`); }
}
async function shot(page, name) {
  const path = join(output, `${name}.png`); await page.screenshot({ path, animations: 'disabled' }); report.screenshots.push(path); return path;
}
async function withPage(name, options, run, noWebGL = false, noMedia = false) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference', ...options });
  await context.addInitScript(({ noWebGL }) => {
    globalThis.__flowProbe = { playCalls: 0, rafFired: 0 };
    const raf = globalThis.requestAnimationFrame.bind(globalThis);
    globalThis.requestAnimationFrame = callback => raf(now => { globalThis.__flowProbe.rafFired++; callback(now); });
    const play = globalThis.HTMLMediaElement.prototype.play;
    globalThis.HTMLMediaElement.prototype.play = function (...args) { globalThis.__flowProbe.playCalls++; return Reflect.apply(play, this, args); };
    if (noWebGL) {
      const get = globalThis.HTMLCanvasElement.prototype.getContext;
      globalThis.HTMLCanvasElement.prototype.getContext = function (type, ...args) { return /webgl/i.test(type) ? null : Reflect.apply(get, this, [type, ...args]); };
    }
  }, { noWebGL });
  if (noMedia) await context.route('**/oil-lab/matter/*.mp4', route => route.abort('failed'));
  const page = await context.newPage(); page.setDefaultTimeout(20000);
  const log = (type, message) => {
    const item = { scenario: name, type, message };
    if (((noWebGL || name.includes('context-loss')) && /webgl|context|3d|renderer/i.test(message)) || (noMedia && /ERR_FAILED|Failed to load resource/i.test(message))) report.expectedErrors.push(item); else report.errors.push(item);
  };
  page.on('pageerror', error => log('pageerror', error.message));
  page.on('console', message => { if (message.type() === 'error') log('console', message.text()); });
  page.on('request', request => { if (/\.(mp4|webm)(?:$|\?)/.test(request.url())) report.mediaRequests.push({ scenario: name, url: request.url() }); });
  try { return await run(page); }
  catch (error) { await shot(page, `failed-${name}`).catch(() => {}); report.failureState ||= []; report.failureState.push({ scenario: name, state: await page.evaluate(() => globalThis.GDamonOil?.getMetrics() || globalThis.GDamonSite?.getMetrics()).catch(() => null) }); throw error; }
  finally { await context.close(); }
}
async function metrics(page, kind) { return page.evaluate(api => globalThis[api].getMetrics(), config[kind].api); }
async function open(page, kind, suffix = '') {
  await page.goto(new URL(config[kind].path + suffix, base).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(api => Boolean(globalThis[api]), config[kind].api);
  await page.waitForFunction(kind => kind === 'film' ? ['ready', 'static', 'fallback'].includes(globalThis.document.querySelector('.fw-page')?.dataset.scene) : ['ready', 'static', 'error', 'fallback'].includes(globalThis.GDamonOil?.getMetrics().status), kind, { timeout: 45000 });
  await page.evaluate(() => globalThis.document.fonts.ready);
}
async function move(page, kind, progress, settle = true) {
  await page.evaluate(({ story, stage, progress }) => {
    const element = globalThis.document.querySelector(story); const panel = globalThis.document.querySelector(stage);
    globalThis.scrollTo({ top: globalThis.scrollY + element.getBoundingClientRect().top + (element.offsetHeight - panel.clientHeight) * progress, behavior: 'instant' });
  }, { ...config[kind], progress });
  if (settle) {
    await page.waitForFunction(({ api, progress }) => {
      const state = globalThis[api].getMetrics(); const target = state.targetProgress ?? state.scrollProgress ?? state.progress;
      return Math.abs(target - progress) < .003 && state.settled;
    }, { api: config[kind].api, progress }, { timeout: 25000 });
  }
  return metrics(page, kind);
}
function clock(state) { return state.renderedProgress ?? state.visualProgress ?? (state.time !== undefined ? (state.time - .55) / 17.45 : state.progress); }
function brief(state) {
  return Object.fromEntries(Object.entries(state).filter(([key]) => /progress|time|chapter|phase|weight|squeeze|count|draw|animating|settled|visible|status|control|renderer|frame|failure|reduced|static|flow|motion|particle/i.test(key)));
}
async function layout(page, kind) {
  return page.evaluate(({ stage, kind }) => {
    const rect = element => { if (!element) return null; const r = element.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; };
    const panel = globalThis.document.querySelector(stage);
    const active = kind === 'film' ? panel.querySelector('.fw-story-chapter.is-active') : panel.querySelector('.matter-chapter.is-current') || panel;
    const heading = kind === 'film' ? active?.querySelector('.fw-story-heading') : active?.querySelector('h1, h2, .oil-heading h1');
    return { viewport: [globalThis.innerWidth, globalThis.innerHeight], documentWidth: globalThis.document.documentElement.scrollWidth, stage: rect(panel), header: rect(panel.querySelector('header')), heading: rect(heading), canvas: rect(panel.querySelector('canvas')), proof: rect(active?.querySelector('.matter-proof')), bottom: rect(panel.querySelector('.matter-bottom')), stagePosition: globalThis.getComputedStyle(panel).position, links: [...active.querySelectorAll('a[href^="/projects#"]')].map(element => ({ text: element.textContent.trim(), href: element.getAttribute('href'), box: rect(element) })) };
  }, { ...config[kind], kind });
}
function assertLayout(value) {
  assert.ok(value.documentWidth <= value.viewport[0] + 1, `Horizontal overflow: ${JSON.stringify(value)}`);
  if (value.heading) {
    assert.ok(value.heading.left >= -1 && value.heading.right <= value.viewport[0] + 1, 'Heading clips horizontally.');
    assert.ok(value.heading.top >= value.header.bottom - 2, 'Heading overlaps navigation.');
  }
  if (value.stagePosition === 'sticky' && value.proof && value.bottom) assert.ok(value.proof.bottom <= value.bottom.top + 1, 'Project proof overlaps the chapter controls.');
  for (const link of value.links) assert.ok(link.box.left >= -1 && link.box.right <= value.viewport[0] + 1, 'Case link clips horizontally.');
}
async function motionCheck(page, kind) {
  await open(page, kind); const samples = [];
  await page.mouse.move(800, 700); await page.mouse.wheel(0, 140); await page.waitForFunction(api => globalThis[api].getMetrics().targetProgress > .01 || globalThis[api].getMetrics().scrollProgress > .01, config[kind].api);
  for (const progress of [0, .24, .30, .33, .36, .42, .49, .62, .69, .70, .93]) {
    const state = await move(page, kind, progress); samples.push({ input: progress, state: brief(state) });
    if ([0, .33, .36, .42, .49, .69, .93].includes(progress)) await shot(page, `${kind}-${Math.round(progress * 100)}`);
  }
  assert.ok(clock(samples.at(-1).state) > clock(samples[0].state) + .8, 'Forward scroll did not advance the artwork.');
  const forward = await move(page, kind, .75);
  await move(page, kind, .18, false);
  await page.waitForTimeout(80);
  const reversing = await metrics(page, kind);
  const reverse = await move(page, kind, .18);
  assert.ok(clock(reverse) < clock(forward) - .45, 'Reverse input did not reverse the artwork.');
  const resting = await metrics(page, kind); const rafBefore = await page.evaluate(() => globalThis.__flowProbe.rafFired); await page.waitForTimeout(450); const rested = await metrics(page, kind); const rafAfter = await page.evaluate(() => globalThis.__flowProbe.rafFired);
  assert.ok(rafAfter - rafBefore <= 2, 'The settled page continues scheduling animation frames.');
  assert.ok(Math.abs(clock(rested) - clock(resting)) < .0001, 'The scroll story keeps playing after input stops.');
  assert.equal(await page.evaluate(() => globalThis.__flowProbe.playCalls), 0, 'Media autoplay replaced scroll control.');
  const geometry = await layout(page, kind); assertLayout(geometry);
  return { samples, reversing: brief(reversing), reverse: brief(reverse), resting: brief(rested), idleRafCallbacks: rafAfter - rafBefore, geometry };
}
try {
  for (const kind of ['film', 'matter'].filter(kind => selection === 'all' || selection === kind)) {
    await check(`${kind}: continuous forward/reverse scroll settles without autoplay`, () => withPage(`${kind}-motion`, {}, page => motionCheck(page, kind)));
    if (kind === 'film') await check('Film: direct Deploy anchor opens the right work chapter', () => withPage('film-anchor', {}, async page => {
      await open(page, 'film', '#fw-agent'); await page.waitForFunction(() => globalThis.GDamonSite.getMetrics().chapter === 'deploy' && globalThis.GDamonSite.getMetrics().settled);
      const state = await metrics(page, 'film'); assert.ok(await page.evaluate(() => globalThis.scrollY) > 100); await shot(page, 'film-anchor');
      const next = page.locator('.fw-chapter-nav a[href="#fw-signal"]'); await next.click(); await page.waitForFunction(() => globalThis.GDamonSite.getMetrics().chapter === 'evaluate' && globalThis.GDamonSite.getMetrics().settled);
      await page.locator('.fw-chapter-nav a[href="#fw-agent"]').click(); await page.waitForFunction(() => globalThis.GDamonSite.getMetrics().chapter === 'deploy' && globalThis.GDamonSite.getMetrics().settled);
      return { anchor: brief(state), returned: brief(await metrics(page, 'film')) };
    }));
    for (const [width, height] of [[390, 844], [320, 568], [844, 390]]) await check(`${kind}: ${width}×${height} readable and reversible`, () => withPage(`${kind}-${width}`, { viewport: { width, height }, hasTouch: width < 700, isMobile: width < 700 }, async page => {
      await open(page, kind); const samples = [];
      for (const progress of [.06, .49, .94, .25]) { const state = await move(page, kind, progress); const geometry = await layout(page, kind); assertLayout(geometry); samples.push({ progress, state: brief(state), geometry }); if (progress !== .25) await shot(page, `${kind}-${width}-${Math.round(progress * 100)}`); }
      return samples;
    }));
    for (const mode of ['reduce', 'fallback']) await check(`${kind}: ${mode} preserves readable work and links`, () => withPage(`${kind}-${mode}`, { viewport: { width: 390, height: 844 }, reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference' }, async page => {
      await open(page, kind); const state = await metrics(page, kind); const geometry = await layout(page, kind); assertLayout(geometry); assert.notEqual(geometry.stagePosition, 'sticky', 'Fallback remains a long pinned story.');
      const links = await page.locator(config[kind].project).evaluateAll(elements => elements.map(element => element.getAttribute('href'))); assert.ok(links.length >= 3); assert.ok(links.every(link => link.startsWith('/projects#')));
      const before = clock(state); await page.evaluate(() => globalThis.scrollBy({ top: 300, behavior: 'instant' })); await page.waitForTimeout(200); const after = await metrics(page, kind); assert.equal(clock(after), before);
      await shot(page, `${kind}-${mode}`); return { state: brief(after), geometry, links };
    }, mode === 'fallback'));
    await check(`${kind}: case link opens a real project case`, () => withPage(`${kind}-case`, {}, async page => {
      await open(page, kind); const link = page.locator(config[kind].project).first(); const href = await link.getAttribute('href'); await link.scrollIntoViewIfNeeded(); await link.click(); await page.waitForURL(`**${href}`); await page.waitForSelector('[data-project-id]'); assert.equal(await page.locator('[data-project-id]').getAttribute('data-project-id'), href.split('#')[1]); return { href, title: await page.locator('h1').innerText() };
    }));
  }
  if (selection === 'finish') {
    await check('Matter: direct endpoint seek settles and idle context loss uses a visible poster', () => withPage('matter-endpoint-context-loss', {}, async page => {
      await open(page, 'matter'); const state = await move(page, 'matter', .49); assert.equal(state.currentFrame, 95); assert.equal(state.seeking, false);
      await page.waitForTimeout(500); const rested = await metrics(page, 'matter'); assert.equal(rested.seekCount, state.seekCount, 'The last decoded frame is repeatedly sought.'); assert.equal(rested.particle.renders, state.particle.renders);
      const reversed = []; for (const progress of [.08, .9, .2]) reversed.push(brief(await move(page, 'matter', progress)));
      await page.evaluate(() => globalThis.document.querySelector('.matter-art canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()); await page.waitForFunction(() => globalThis.GDamonOil.getMetrics().status === 'error');
      const cards = await page.locator('.matter-chapter').evaluateAll(elements => elements.map(element => ({ inert: element.inert, aria: element.getAttribute('aria-hidden') }))); assert.ok(cards.every(card => !card.inert && card.aria === 'false'));
      const poster = await page.locator('.matter-last').evaluate(element => ({ width: element.naturalWidth, opacity: globalThis.getComputedStyle(element).opacity })); assert.ok(poster.width > 0 && Number(poster.opacity) > 0); return { state: brief(rested), reversed, cards, poster };
    }));
    for (const [width, height] of [[1440, 900], [390, 844]]) await check(`Matter: held chapter boundaries have no text overlap at ${width}×${height}`, () => withPage(`matter-fades-${width}`, { viewport: { width, height } }, async page => {
      await open(page, 'matter'); const samples = [];
      for (const progress of [.42, .435, .45, .77, .785, .80]) { await move(page, 'matter', progress); const opacity = await page.locator('.matter-chapter').evaluateAll(elements => elements.map(element => Number(globalThis.getComputedStyle(element).opacity))); assert.ok(opacity.filter(value => value > .001).length <= 1, `Two chapters overlap at ${progress}: ${opacity}`); samples.push({ progress, opacity }); if (progress === .42 || progress === .80) await shot(page, `matter-readable-${width}-${Math.round(progress * 100)}`); }
      return samples;
    }));
    await check('Index: Film and Matter are first with loaded current thumbnails at 390px', () => withPage('index-mobile', { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, async page => {
      await page.goto(new URL('/index.html', base).href, { waitUntil: 'domcontentloaded' }); await page.waitForSelector('.pv-card'); const quick = await page.locator('.pv-review>a').evaluateAll(elements => elements.slice(0,2).map(element => element.getAttribute('href'))); assert.deepEqual(quick, ['/film', '/oil-lab/matter']);
      const cards = page.locator('.pv-card'); const evidence = [];
      for (let i=0; i<2; i++) { const card=cards.nth(i); await card.scrollIntoViewIfNeeded(); await card.locator('img').evaluate(element => element.decode()); evidence.push(await card.evaluate(element => ({ href: element.querySelector('h2 a').getAttribute('href'), image: element.querySelector('img').getAttribute('src'), width: element.querySelector('img').naturalWidth }))); await shot(page, `index-mobile-${i}`); }
      assert.deepEqual(evidence.map(value => value.href), quick); assert.ok(evidence.every(value => value.width > 0)); assert.ok(await page.evaluate(() => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth + 1)); return { quick, cards: evidence };
    }));
  }
  if (selection === 'refine') {
    for (const [width, height] of [[1440, 900], [390, 844]]) await check(`Film: refined helmet and off-story idle at ${width}×${height}`, () => withPage(`film-refine-${width}`, { viewport: { width, height } }, async page => {
      await open(page, 'film', '#fw-agent'); await page.waitForFunction(() => globalThis.GDamonSite.getMetrics().chapter === 'deploy' && globalThis.GDamonSite.getMetrics().settled); await shot(page, `film-deploy-${width}`);
      const state = await metrics(page, 'film'); assert.equal(state.flow.drawCalls, 1); assert.equal(state.motion.running, false);
      await move(page, 'film', 1); await page.evaluate(() => globalThis.scrollBy({ top: 500, behavior: 'instant' })); await page.waitForTimeout(100); const before = await metrics(page, 'film');
      await page.evaluate(() => globalThis.scrollBy({ top: 100, behavior: 'instant' })); await page.waitForTimeout(100); const after = await metrics(page, 'film'); assert.equal(after.flow.renderedFrames, before.flow.renderedFrames, 'Off-story scroll redraws a clamped artwork.'); return { state: brief(state), offStory: brief(after) };
    }));
    for (const [width, height] of [[1440, 900], [390, 844], [320, 568], [844, 390]]) await check(`Matter: media seam and six-node forms at ${width}×${height}`, () => withPage(`matter-refine-${width}`, { viewport: { width, height } }, async page => {
      await open(page, 'matter'); const samples = [];
      for (const progress of [.12, .33, .36, .42, .69, .97]) { const state = await move(page, 'matter', progress); const geometry = await layout(page, 'matter'); assertLayout(geometry); samples.push({ progress, state: brief(state), geometry }); await shot(page, `matter-${width}-${Math.round(progress * 100)}`); }
      const before = await page.evaluate(() => globalThis.__flowProbe.rafFired); await page.waitForTimeout(450); const after = await page.evaluate(() => globalThis.__flowProbe.rafFired); assert.ok(after - before <= 2); return { samples, idleRafCallbacks: after - before };
    }));
  }
  if (selection === 'all' || selection === 'refine' || selection === 'lifecycle') {
    await check('Matter: changing motion preference keeps the visible chapter interactive', () => withPage('matter-preference', {}, async page => {
      await open(page, 'matter'); await move(page, 'matter', .97); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForFunction(() => globalThis.GDamonOil.getMetrics().status === 'static');
      const still = await page.locator('.matter-last').evaluate(element => ({ width: element.naturalWidth, opacity: globalThis.getComputedStyle(element).opacity, visibility: globalThis.getComputedStyle(element).visibility })); assert.ok(still.width > 0 && Number(still.opacity) > 0 && still.visibility === 'visible');
      await page.evaluate(() => globalThis.scrollTo({ top: 0, behavior: 'instant' })); await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.waitForFunction(() => globalThis.GDamonOil.getMetrics().status === 'ready' && globalThis.GDamonOil.getMetrics().phase === 'form');
      const card = page.locator('.matter-chapter').first(); const state = await card.evaluate(element => ({ inert: element.inert, ariaHidden: element.getAttribute('aria-hidden'), opacity: globalThis.getComputedStyle(element).opacity })); assert.equal(state.inert, false); assert.equal(state.ariaHidden, 'false'); assert.ok(Number(state.opacity) > .99); await card.locator('a').click(); await page.waitForURL('**/projects#supply-chain-domain-llm'); await page.waitForSelector('[data-project-id="supply-chain-domain-llm"]'); return state;
    }));
    for (const kind of ['film', 'matter']) await check(`${kind}: idle context loss immediately exposes static content`, () => withPage(`${kind}-context-loss`, {}, async page => {
      await open(page, kind); await move(page, kind, .49); await page.evaluate(selector => { const canvas = globalThis.document.querySelector(selector); const gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); gl.getExtension('WEBGL_lose_context').loseContext(); }, config[kind].canvas);
      await page.waitForFunction(kind => kind === 'film' ? globalThis.document.querySelector('.fw-page').dataset.scene === 'fallback' : globalThis.GDamonOil.getMetrics().status === 'error', kind);
      const cards = await page.locator(kind === 'film' ? '.fw-story-chapter' : '.matter-chapter').evaluateAll(elements => elements.map(element => ({ inert: element.inert, aria: element.getAttribute('aria-hidden'), opacity: globalThis.getComputedStyle(element).opacity }))); assert.ok(cards.every(card => !card.inert && card.aria === 'false' && Number(card.opacity) === 1));
      if (kind === 'matter') { const still = await page.locator('.matter-last').evaluate(element => ({ width: element.naturalWidth, opacity: globalThis.getComputedStyle(element).opacity })); assert.ok(still.width > 0 && Number(still.opacity) > 0); }
      const state = await metrics(page, kind); const geometry = await layout(page, kind); assert.notEqual(geometry.stagePosition, 'sticky'); await shot(page, `${kind}-context-loss`); return { state: brief(state), cards };
    }));
    await check('Film archive: render mode retains its original canvas scenes', () => withPage('film-archive', {}, async page => {
      await page.goto(new URL('/film?render=1', base).href, { waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => Boolean(globalThis.GDamonFilm));
      const state = await page.evaluate(() => { globalThis.GDamonFilm.seek(8); return globalThis.GDamonFilm.getMetrics(); }); assert.equal(state.time, 8); assert.equal(state.robot.renderer, 'three'); assert.ok(state.robot.triangles > 1000); assert.equal(state.flow, undefined); return { time: state.time, robot: state.robot, playing: state.playing };
    }));
  }
  if (selection === 'all' || selection === 'matter' || selection === 'media' || selection === 'refine') await check('Matter: unavailable video keeps the source poster and particle story working', () => withPage('matter-media-fallback', {}, async page => {
    await open(page, 'matter'); await page.waitForFunction(() => globalThis.GDamonOil.getMetrics().mediaStatus === 'poster');
    await move(page, 'matter', .12); await shot(page, 'matter-media-fallback-poster');
    const poster = await page.locator('.matter-last').evaluate(element => ({ complete: element.complete, width: element.naturalWidth, opacity: globalThis.getComputedStyle(element).opacity })); assert.ok(poster.complete && poster.width > 0 && Number(poster.opacity) > 0);
    const state = await move(page, 'matter', .67); assert.equal(state.status, 'ready'); assert.ok(state.particle.opacity > .99); await shot(page, 'matter-media-fallback-particles');
    const before = await page.evaluate(() => globalThis.__flowProbe.rafFired); await page.waitForTimeout(450); const after = await page.evaluate(() => globalThis.__flowProbe.rafFired); assert.ok(after - before <= 2); return { poster, state: brief(state), idleRafCallbacks: after - before };
  }, false, true));
  if (selection === 'all' || selection === 'smoke' || selection === 'refine') for (const id of ['archive', 'handoff']) await check(`Oil ${id}: original frame study remains scroll controlled`, () => withPage(`smoke-${id}`, {}, async page => {
    await page.goto(new URL(`/oil-lab/${id}`, base).href); await page.waitForFunction(() => globalThis.GDamonOil?.getMetrics().status === 'ready'); const initial = await metrics(page, 'matter'); assert.equal(initial.control, 'frame-scrub'); await move(page, 'matter', .55); const state = await metrics(page, 'matter'); assert.ok(state.currentFrame > 40); assert.equal(state.paused, true); return brief(state);
  }));
} finally {
  await browser.close(); report.finishedAt = new Date().toISOString(); report.pass = report.checks.every(item => item.pass) && report.errors.length === 0; await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(`Scroll flow checks ${report.pass ? 'passed' : 'failed'}: ${join(output, 'report.json')}`);
if (!report.pass) process.exitCode = 1;
