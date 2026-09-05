import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4193'
const output = process.env.QA_OUTPUT || '/tmp/fieldwork-qa'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
const results = []
async function check(name, run) { await run(); results.push(name); console.log('PASS', name) }
async function settled() { await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(700) }
async function noOverflow(target = page) {
  assert.equal(await target.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false)
}
try {
  await page.goto(baseURL, { waitUntil: 'networkidle' })
  await settled()
  await check('Identity, core content, and unique heading are visible', async () => {
    assert.equal(await page.locator('h1').count(), 1)
    assert.match(await page.locator('h1').innerText(), /Curiosity/)
    assert.equal(await page.locator('#work article').count(), 4)
    for (const id of ['work', 'research', 'notes', 'about', 'contact']) assert.equal(await page.locator('#' + id).count(), 1)
    assert.match(await page.locator('header').innerText(), /Damon Guan/)
    await noOverflow()
  })
  await page.screenshot({ path: output + '/01-home-desktop.png' })
  await check('The real 3D scene responds to the pointer and then rests', async () => {
    await page.waitForFunction(() => document.querySelector('canvas') && getComputedStyle(document.querySelector('svg[class*="paperSurface"]')).opacity === '0')
    const before = await page.locator('canvas').screenshot()
    await page.mouse.move(1280, 310)
    await page.waitForTimeout(1400)
    const after = await page.locator('canvas').screenshot()
    assert.equal(before.equals(after), false, 'Pointer must change the rendered surface')
    await page.evaluate(() => {
      window.__fieldworkFrames = 0
      const original = window.requestAnimationFrame
      window.requestAnimationFrame = callback => original(time => { window.__fieldworkFrames++; callback(time) })
    })
    await page.waitForTimeout(1200)
    assert.ok(await page.evaluate(() => window.__fieldworkFrames < 3), 'The settled scene must not run a continuous animation loop')
  })
  await check('Real scrolling reaches the portfolio and every case opens', async () => {
    await page.getByRole('link', { name: 'Explore my work' }).click()
    await page.waitForFunction(() => Math.abs(document.querySelector('#work').getBoundingClientRect().top - 96) < 5)
    await page.screenshot({ path: output + '/02-work-desktop.png' })
    const routes = await page.locator('#work article>a').evaluateAll(links => links.map(a => ({ url: a.getAttribute('href'), title: a.querySelector('h3').textContent.replace('↗', '').trim() })))
    for (const route of routes) {
      await page.locator('a[href="' + route.url + '"]').first().click()
      await page.waitForURL('**' + route.url)
      await page.locator('h1').waitFor()
      assert.equal(await page.locator('h1').innerText(), route.title)
      await noOverflow()
      assert.match(await page.locator('main').innerText(), /confidential|Internal|internal/)
      if (route.url.endsWith('risk-router')) await page.screenshot({ path: output + '/03-case-desktop.png' })
      await page.getByRole('link', { name: 'Damon Guan home' }).click()
      await page.waitForURL(baseURL + '/')
    }
  })
  await check('Research links and notes are discoverable, and a note can be read', async () => {
    await page.locator('header').getByRole('link', { name: 'Research', exact: true }).click()
    await page.waitForURL('**/#research')
    await settled()
    assert.equal(await page.locator('#research a[target="_blank"]').count(), 3)
    await page.screenshot({ path: output + '/04-research-desktop.png' })
    await page.locator('header').getByRole('link', { name: 'Notes', exact: true }).click()
    await page.waitForURL('**/notes')
    const notes = await page.locator('main a[href^="/notes/"]').evaluateAll(links => [...new Set(links.map(a => a.getAttribute('href')))])
    assert.equal(notes.length, 7)
    await page.locator('main a[href="' + notes[0] + '"]').first().click()
    await page.waitForURL('**' + notes[0])
    assert.equal(await page.locator('h1').count(), 1)
    assert.ok((await page.locator('main').innerText()).length > 1500)
    await page.screenshot({ path: output + '/05-note-desktop.png' })
  })
  await check('Clipboard contact interaction works without sending a message', async () => {
    await page.getByRole('button', { name: 'Copy email' }).click()
    await page.getByRole('button', { name: 'Email copied' }).waitFor()
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'hello@damon.ai')
    assert.ok(await page.locator('a[href="mailto:hello@damon.ai"]').count() >= 1)
  })
  await page.goto(baseURL, { waitUntil: 'networkidle' })
  await check('Keyboard navigation offers a working skip link', async () => {
    await page.keyboard.press('Tab')
    assert.equal(await page.locator(':focus').innerText(), 'Skip to content')
    await page.keyboard.press('Enter')
    await page.waitForURL('**/#main-content')
  })
  await check('Phone layout, menu, Escape, and in-page navigation work', async () => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    await page.screenshot({ path: output + '/06-home-mobile.png' })
    await noOverflow()
    await page.getByRole('button', { name: 'Menu +' }).click()
    assert.equal(await page.getByRole('button', { name: 'Close −' }).getAttribute('aria-expanded'), 'true')
    await page.keyboard.press('Escape')
    assert.equal(await page.locator(':focus').innerText(), 'Menu +')
    await page.getByRole('button', { name: 'Menu +' }).click()
    await page.locator('header').getByRole('link', { name: 'Work', exact: true }).click()
    await page.waitForURL('**/#work')
    await settled()
    assert.equal(await page.getByRole('button', { name: 'Menu +' }).getAttribute('aria-expanded'), 'false')
    await page.screenshot({ path: output + '/07-work-mobile.png' })
  })
  await check('Rapid resizing does not let an old context disable a new canvas', async () => {
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await settled()
    for (let i = 0; i < 3; i++) {
      await page.setViewportSize({ width: 375, height: 900 })
      await page.waitForTimeout(100)
      await page.setViewportSize({ width: 1440, height: 1000 })
      await page.waitForTimeout(1600)
      assert.equal(await page.locator('canvas').count(), 1)
    }
  })
  await check('Reduced motion and WebGL context loss preserve the full page', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await settled()
    assert.equal(await page.locator('canvas').count(), 0)
    assert.equal(await page.locator('svg[class*="paperSurface"]').evaluate(e => getComputedStyle(e).opacity), '1')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await settled()
    await page.locator('canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost')))
    await settled()
    assert.equal(await page.locator('canvas').count(), 0)
    assert.ok((await page.locator('main').innerText()).length > 4000)
  })
  await check('No-JavaScript fallback still exposes portfolio, writing, and contact', async () => {
    const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
    const staticPage = await staticContext.newPage()
    await staticPage.goto(baseURL, { waitUntil: 'load' })
    assert.equal(await staticPage.locator('h1').count(), 1)
    assert.equal(await staticPage.locator('#work article').count(), 4)
    assert.equal(await staticPage.locator('#research a[target="_blank"]').count(), 3)
    await noOverflow(staticPage)
    await staticContext.close()
  })
  assert.deepEqual(errors, [])
  await writeFile(output + '/result.json', JSON.stringify({ baseURL, passed: results, errors }, null, 2))
  console.log('Verified ' + results.length + ' end-to-end flows. Screenshots: ' + output)
} finally { await browser.close() }
