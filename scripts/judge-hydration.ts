import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium, type Browser, type ConsoleMessage } from 'playwright'
import { assertFreshBuild } from './build-provenance.ts'

const root = process.cwd()
const port = Number(process.argv[2] ?? 4194)
const origin = `http://127.0.0.1:${port}`
const manifestPath = resolve(root, '.next/react-loadable-manifest.json')

assertFreshBuild(root, 'Hydration judge')

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, { files?: string[] }>
const sceneFiles = Object.entries(manifest)
  .filter(([key]) => key.includes('optimization-landscape-scene'))
  .flatMap(([, entry]) => entry.files ?? [])

if (sceneFiles.length === 0) throw new Error('Hydration judge could not locate the immersive scene chunk.')

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

type MotionCase = {
  mode: 'reduce' | 'no-preference'
  expectedMode: 'reduced' | 'full'
  expectedProfile: 'full' | 'static-low-cpu'
  expectedJourneys: number
  expectSceneChunk: boolean
  expectCanvas: boolean
  hardwareConcurrency: number
}

const hydrationPattern = /hydration|hydrated|server rendered html|didn't match the client/i

async function verifyMotionCase(browser: Browser, testCase: MotionCase) {
  const context = await browser.newContext({ reducedMotion: testCase.mode })
  await context.addInitScript(({ hardwareConcurrency }) => {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      configurable: true,
      get: () => hardwareConcurrency,
    })
    Object.defineProperty(navigator, 'deviceMemory', {
      configurable: true,
      get: () => 8,
    })
    const connection = new EventTarget()
    Object.defineProperties(connection, {
      effectiveType: { configurable: true, get: () => '4g' },
      saveData: { configurable: true, get: () => false },
    })
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      get: () => connection,
    })
  }, { hardwareConcurrency: testCase.hardwareConcurrency })
  const page = await context.newPage()
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  const requestedFiles = new Set<string>()

  const captureConsoleError = (message: ConsoleMessage) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  }
  const capturePageError = (error: Error) => pageErrors.push(error.message)
  const captureResponse = (response: { url(): string }) => requestedFiles.add(response.url())
  page.on('console', captureConsoleError)
  page.on('pageerror', capturePageError)
  page.on('response', captureResponse)

  await page.goto(origin, { waitUntil: 'networkidle' })
  const hero = page.locator(`.hero[data-motion-mode="${testCase.expectedMode}"]`)
  await hero.waitFor({ state: 'attached' })
  await page.locator(`.hero__scene[data-performance-profile="${testCase.expectedProfile}"]`).waitFor({ state: 'attached' })
  await page.locator('h1[aria-label="Damon Guan. Agent systems, under control."]').waitFor({ state: 'visible' })

  const hydrationErrors = [...consoleErrors, ...pageErrors].filter((message) => hydrationPattern.test(message))
  if (hydrationErrors.length > 0) {
    throw new Error(`${testCase.mode} emitted hydration errors:\n${hydrationErrors.join('\n---\n')}`)
  }

  const journeyCount = await page.locator('.hero__journey').count()
  if (journeyCount !== testCase.expectedJourneys) {
    throw new Error(`${testCase.mode} rendered ${journeyCount} motion chapters; expected ${testCase.expectedJourneys}.`)
  }

  const requestedSceneChunk = sceneFiles.some((file) =>
    [...requestedFiles].some((url) => new URL(url).pathname.endsWith(file.replace(/^static\//, '/_next/static/'))),
  )
  if (requestedSceneChunk !== testCase.expectSceneChunk) {
    throw new Error(`${testCase.mode} scene chunk request was ${requestedSceneChunk}; expected ${testCase.expectSceneChunk}.`)
  }

  if (testCase.expectCanvas) {
    await page.locator('.hero__scene canvas').waitFor({ state: 'attached' })
  }
  const canvasCount = await page.locator('.hero__scene canvas').count()
  if ((canvasCount > 0) !== testCase.expectCanvas) {
    throw new Error(`${testCase.mode}/${testCase.expectedProfile} canvas count was ${canvasCount}; expected ${testCase.expectCanvas ? 'a full scene' : 'no canvas'}.`)
  }

  await context.close()
}

let browser: Browser | undefined
try {
  await waitForServer()
  browser = await chromium.launch({ headless: true })
  await verifyMotionCase(browser, {
    mode: 'reduce',
    expectedMode: 'reduced',
    expectedProfile: 'full',
    expectedJourneys: 0,
    expectSceneChunk: false,
    expectCanvas: false,
    hardwareConcurrency: 8,
  })
  await verifyMotionCase(browser, {
    mode: 'no-preference',
    expectedMode: 'full',
    expectedProfile: 'full',
    expectedJourneys: 3,
    expectSceneChunk: true,
    expectCanvas: true,
    hardwareConcurrency: 8,
  })
  await verifyMotionCase(browser, {
    mode: 'no-preference',
    expectedMode: 'full',
    expectedProfile: 'static-low-cpu',
    expectedJourneys: 3,
    expectSceneChunk: false,
    expectCanvas: false,
    hardwareConcurrency: 2,
  })
  console.log('Hydration motion judge: PASS · reduced, high-capability, and low-CPU modes hydrate with correct scene gating')
} finally {
  await browser?.close()
  server.kill('SIGTERM')
}
