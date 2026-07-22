import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium, type Browser } from 'playwright'
import { notes, work } from '../lib/content.ts'

const root = process.cwd()
const port = Number(process.argv[2] ?? 4195)
const origin = `http://127.0.0.1:${port}`

if (!existsSync(resolve(root, '.next/BUILD_ID'))) {
  throw new Error('Responsive judge requires a current production build. Run `npm run build` first.')
}

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

const routes = [
  '/',
  ...work.map((project) => `/work/${project.id}`),
  '/notes',
  ...notes.map((note) => `/notes/${note.slug}`),
  '/not-a-real-route',
]

const viewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 720, height: 900 },
  { width: 1024, height: 600 },
]

const failures: string[] = []
let browser: Browser | undefined

try {
  await waitForServer()
  browser = await chromium.launch({ headless: true })

  for (const viewport of viewports) {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport })
    const page = await context.newPage()
    const runtimeErrors: string[] = []
    let activeRoute = ''
    page.on('console', (message) => {
      if (message.type() !== 'error') return
      if (activeRoute === '/not-a-real-route' && /404 \(Not Found\)/.test(message.text())) return
      runtimeErrors.push(`${activeRoute}: ${message.text()}`)
    })
    page.on('pageerror', (error) => runtimeErrors.push(`${activeRoute}: ${error.message}`))

    for (const route of routes) {
      activeRoute = route
      const response = await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' })
      const expectedStatus = route === '/not-a-real-route' ? 404 : 200
      if (response?.status() !== expectedStatus) {
        failures.push(`${viewport.width}x${viewport.height} ${route} returned ${response?.status()} instead of ${expectedStatus}.`)
      }

      const layout = await page.evaluate(() => {
        const rootElement = document.documentElement
        const bodyStyle = getComputedStyle(document.body)
        const heading = document.querySelector('h1')
        const headingRect = heading?.getBoundingClientRect()
        return {
          bodyOverflowX: bodyStyle.overflowX,
          clientWidth: rootElement.clientWidth,
          headingVisible: Boolean(
            headingRect
            && headingRect.width > 0
            && headingRect.height > 0
            && headingRect.right > 0
            && headingRect.left < rootElement.clientWidth,
          ),
          scrollWidth: rootElement.scrollWidth,
        }
      })

      if (layout.bodyOverflowX === 'hidden' || layout.bodyOverflowX === 'clip') {
        failures.push(`${viewport.width}x${viewport.height} ${route} hides body overflow (${layout.bodyOverflowX}).`)
      }
      if (layout.scrollWidth > layout.clientWidth + 1) {
        failures.push(`${viewport.width}x${viewport.height} ${route} expands to ${layout.scrollWidth}px for a ${layout.clientWidth}px viewport.`)
      }
      if (!layout.headingVisible) {
        failures.push(`${viewport.width}x${viewport.height} ${route} has no visible primary heading.`)
      }
    }

    if (runtimeErrors.length > 0) {
      failures.push(`${viewport.width}x${viewport.height} emitted runtime errors:\n${runtimeErrors.join('\n---\n')}`)
    }
    await context.close()
  }

  if (failures.length > 0) {
    console.error('Responsive route judge: FAIL')
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
  } else {
    console.log(`Responsive route judge: PASS · ${routes.length} routes × ${viewports.length} viewports · no body clipping`)
  }
} finally {
  await browser?.close()
  server.kill('SIGTERM')
}
