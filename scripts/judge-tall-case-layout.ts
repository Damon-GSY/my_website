import { chromium } from 'playwright'

const url = process.env.JUDGE_URL ?? 'http://127.0.0.1:4175/'
const targetUrl = new URL(url)
targetUrl.searchParams.set('software-rendering', '1')

const viewports = [
  { width: 1216, height: 2048, label: 'reference portrait' },
  { width: 1024, height: 2048, label: 'wide tablet portrait' },
  { width: 768, height: 1366, label: 'tablet portrait' },
  { width: 721, height: 1280, label: 'narrow desktop contract' },
  { width: 1280, height: 600, label: 'short desktop' },
]

const browser = await chromium.launch({
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader'],
})

try {
  const failures: string[] = []
  const measurements: string[] = []

  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport,
      reducedMotion: 'no-preference',
    })
    await page.goto(targetUrl.toString(), { waitUntil: 'load' })

    let layout = {
      bodyWidth: 0,
      panelCount: 0,
      panelHeight: 0,
      panelPosition: '',
      plotHeight: 0,
      signalHeight: 0,
      viewportHeight: viewport.height,
      viewportWidth: viewport.width,
    }
    for (let attempt = 0; attempt < 50; attempt += 1) {
      layout = await page.evaluate(() => {
        const panel = document.querySelector<HTMLElement>('.signature-story__panel--route')
        const signal = panel?.querySelector<HTMLElement>('.case-signal--risk')
        const plot = signal?.querySelector<SVGElement>('.case-signal__plot--risk-desktop')

        return {
          bodyWidth: document.body.scrollWidth,
          panelCount: document.querySelectorAll('.signature-story__panel--route').length,
          panelHeight: panel?.getBoundingClientRect().height ?? 0,
          panelPosition: panel ? getComputedStyle(panel).position : '',
          plotHeight: plot?.getBoundingClientRect().height ?? 0,
          signalHeight: signal?.getBoundingClientRect().height ?? 0,
          viewportHeight: window.innerHeight,
          viewportWidth: window.innerWidth,
        }
      })
      if (
        layout.panelCount === 1
        && layout.panelHeight > 0
        && layout.signalHeight > 0
        && layout.plotHeight > 0
      ) {
        break
      }
      await page.waitForTimeout(100)
    }

    const prefix = `${viewport.width}×${viewport.height} ${viewport.label}`
    if (layout.panelCount !== 1) {
      failures.push(
        `${prefix} does not expose the bounded decision-layout contract; verify JUDGE_URL serves this checkout`,
      )
    }
    if (layout.bodyWidth > layout.viewportWidth + 1) {
      failures.push(`${prefix} expands to ${layout.bodyWidth}px`)
    }
    if (layout.panelHeight > 840) {
      failures.push(`${prefix} route panel expanded to ${layout.panelHeight.toFixed(1)}px`)
    }
    if (layout.signalHeight > 680) {
      failures.push(`${prefix} decision diagram expanded to ${layout.signalHeight.toFixed(1)}px`)
    }
    if (viewport.height > 900 && layout.plotHeight < 360) {
      failures.push(`${prefix} decision path drawing collapsed to ${layout.plotHeight.toFixed(1)}px`)
    }
    if (viewport.height <= 820 && layout.panelPosition === 'sticky') {
      failures.push(
        `${prefix} keeps the oversized route panel sticky`,
      )
    }
    if (viewport.height <= 820 && layout.plotHeight < 280) {
      failures.push(`${prefix} compresses the decision path to ${layout.plotHeight.toFixed(1)}px`)
    }

    measurements.push(
      `${viewport.width}×${viewport.height} ${layout.panelHeight.toFixed(0)}/${layout.signalHeight.toFixed(0)}/${layout.plotHeight.toFixed(0)}`,
    )
    await page.close()
  }

  if (failures.length > 0) {
    throw new Error(`Tall case layout regression: ${failures.join(' · ')}`)
  }

  console.log(
    `Tall case layout judge: PASS · panel/diagram/plot ${measurements.join(' · ')}`,
  )
} finally {
  await browser.close()
}
