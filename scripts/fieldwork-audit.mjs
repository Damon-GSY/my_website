import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { chromium } from 'playwright'

const require = createRequire(import.meta.url)
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4193'
const output = process.env.QA_OUTPUT || '/tmp/fieldwork-qa'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', error => errors.push(error.message))
const results = []
try {
  await page.goto(baseURL + '/sitemap.xml')
  const routes = await page.evaluate(() => [...document.querySelectorAll('loc')].map(e => new URL(e.textContent).pathname))
  assert.ok(routes.length >= 13, 'The sitemap must include all public pages')
  routes.push('/not-a-real-route')
  for (const route of routes) {
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      const response = await page.goto(baseURL + route, { waitUntil: 'networkidle' })
      assert.equal(response.status(), route === '/not-a-real-route' ? 404 : 200, route)
      assert.equal(await page.locator('h1').count(), 1, route + ' heading')
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => a.hash.length > 1 && !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash),
      }))
      assert.equal(layout.overflow, false, route + ' at ' + width)
      assert.deepEqual(layout.brokenAnchors, [], route + ' anchors')
      if (width === 1440) {
        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
        const violations = await page.evaluate(async () => {
          const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })
          return result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.html) }))
        })
        assert.deepEqual(violations, [], route + ' accessibility')
      }
      results.push({ route, width })
    }
    console.log('PASS route, layouts, anchors, and automated accessibility:', route)
  }
  assert.deepEqual(errors, [])
  await writeFile(output + '/audit.json', JSON.stringify({ baseURL, results, errors }, null, 2))
  console.log('PASS', results.length, 'route/viewport checks')
} finally { await browser.close() }
