import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { chromium, type Browser } from 'playwright'
import { assertFreshBuild } from './build-provenance.ts'

const root = process.cwd()
const port = Number(process.argv[2] ?? 4197)
const origin = `http://127.0.0.1:${port}`

assertFreshBuild(root, 'Rebuild experience judge')

const server = spawn(
  process.execPath,
  [resolve(root, 'node_modules/next/dist/bin/next'), 'start', '--port', String(port)],
  { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] },
)
let serverOutput = ''
server.stdout.on('data', (chunk) => { serverOutput += chunk.toString() })
server.stderr.on('data', (chunk) => { serverOutput += chunk.toString() })

async function waitForServer() {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Next server exited early.\n${serverOutput}`)
    try {
      const response = await fetch(origin)
      if (response.ok) return
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 150))
  }
  throw new Error(`Timed out waiting for ${origin}.\n${serverOutput}`)
}

const failures: string[] = []
let browser: Browser | undefined

try {
  await waitForServer()
  browser = await chromium.launch({ headless: true })

  for (const viewport of [
    { name: 'mobile', width: 390, height: 844, expectsCanvas: false },
    { name: 'tablet', width: 768, height: 1024, expectsCanvas: false },
    { name: 'short desktop', width: 1024, height: 600, expectsCanvas: false },
    { name: 'desktop', width: 1440, height: 900, expectsCanvas: undefined },
  ]) {
    const page = await browser.newPage({
      reducedMotion: 'no-preference',
      viewport: { width: viewport.width, height: viewport.height },
    })
    const runtimeErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text())
    })
    page.on('pageerror', (error) => runtimeErrors.push(error.message))

    await page.goto(origin, { waitUntil: 'networkidle' })
    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    if (layout.scrollWidth > layout.clientWidth + 1) {
      failures.push(`${viewport.name} has horizontal overflow.`)
    }

    const canvasCount = await page.locator('canvas').count()
    if (viewport.expectsCanvas === false && canvasCount > 0) {
      failures.push(`${viewport.name} rendered ${canvasCount} canvas element(s), contrary to its performance profile.`)
    }

    const heroImage = page.locator('.prompt-hero__art-image')
    const heroLoaded = await heroImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)
    if (!heroLoaded) failures.push(`${viewport.name} did not load the hero art.`)

    await page.keyboard.press('Tab')
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
    if (focusedTag !== 'A') failures.push(`${viewport.name} did not expose keyboard navigation first.`)

    await page.getByRole('link', { name: 'Projects', exact: true }).click()
    await page.waitForTimeout(900)
    if (!page.url().endsWith('#work')) failures.push(`${viewport.name} project navigation did not update the URL.`)

    const overflow = await page.locator('.prompt-project__card').evaluateAll((cards) => cards.map((card) => ({
      clientHeight: card.clientHeight,
      scrollHeight: card.scrollHeight,
    })))
    for (const [index, card] of overflow.entries()) {
      if (card.scrollHeight > card.clientHeight + 1) {
        failures.push(`${viewport.name} project card ${index + 1} clips ${card.scrollHeight - card.clientHeight}px of internal content.`)
      }
    }

    if (viewport.name === 'desktop') {
      await page.locator('.prompt-project__card').first().scrollIntoViewIfNeeded()
      await page.evaluate(() => window.scrollBy(0, 160))
      await page.waitForTimeout(350)
      const bounds = await page.locator('.prompt-project__card').evaluateAll((cards) => cards.map((card) => {
        const rect = card.getBoundingClientRect()
        return {
          bottom: rect.bottom,
          clientHeight: card.clientHeight,
          scrollHeight: card.scrollHeight,
          top: rect.top,
        }
      }))
      for (const [index, rect] of bounds.entries()) {
        if (rect.top >= 0 && rect.top < 200 && rect.bottom > viewport.height + 1) {
          failures.push(`desktop project card ${index + 1} exceeds the viewport.`)
        }
      }
      const signalBounds = await page.locator('.prompt-project__signal > .case-signal').evaluateAll((signals) => signals.map((signal) => ({
        clientHeight: signal.clientHeight,
        scrollHeight: signal.scrollHeight,
      })))
      for (const [index, signal] of signalBounds.entries()) {
        if (signal.scrollHeight > signal.clientHeight + 1) {
          failures.push(`desktop project signal ${index + 1} clips ${signal.scrollHeight - signal.clientHeight}px of its diagram.`)
        }
      }
      const riskCopyOverlaps = await page.locator('.prompt-project__signal .case-signal--risk').evaluate((signal) => {
        const meta = signal.querySelector('.case-signal__meta')?.getBoundingClientRect()
        const disclosure = signal.querySelector('.case-signal__disclosure')?.getBoundingClientRect()
        if (!meta || !disclosure) return true
        return meta.left < disclosure.right
          && meta.right > disclosure.left
          && meta.top < disclosure.bottom
          && meta.bottom > disclosure.top
      })
      if (riskCopyOverlaps) failures.push('desktop risk signal overlaps its title and disclosure copy.')
    }

    const caseLink = page.locator('.prompt-project__card header a').first()
    if (!await caseLink.isVisible()) failures.push(`${viewport.name} hides the Full case action.`)
    await caseLink.click()
    await page.waitForURL('**/work/risk-router')
    await page.waitForLoadState('networkidle')
    if (new URL(page.url()).pathname !== '/work/risk-router') {
      failures.push(`${viewport.name} Full case did not open the first case study.`)
    }
    if (runtimeErrors.length > 0) failures.push(`${viewport.name} emitted runtime errors: ${runtimeErrors.join(' | ')}`)
    await page.close()
  }

  if (failures.length > 0) {
    console.error('Rebuild experience judge: FAIL')
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
  } else {
    console.log('Rebuild experience judge: PASS · real scroll, click, keyboard, responsive, and performance paths')
  }
} finally {
  await browser?.close()
  server.kill('SIGTERM')
}
