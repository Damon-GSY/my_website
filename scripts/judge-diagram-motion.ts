import { chromium, type Locator, type Page } from 'playwright'

const url = process.env.JUDGE_URL ?? 'http://127.0.0.1:4175/'
const targetUrl = new URL(url)
targetUrl.searchParams.set('software-rendering', '1')

async function expectMovingSignal(
  page: Page,
  signal: Locator,
  label: string,
) {
  await signal.waitFor({ state: 'attached', timeout: 10_000 })
  let opacity = 0
  for (let attempt = 0; attempt < 30; attempt += 1) {
    opacity = Number(await signal.getAttribute('opacity') ?? 1)
    if (opacity > 0.35) break
    await page.waitForTimeout(100)
  }
  if (opacity <= 0.35) {
    const diagnostics = await signal.evaluate((element) => {
      const root = element.closest('.case-signal')
      const svg = element.closest('svg')
      return {
        className: root?.className,
        rootRect: root?.getBoundingClientRect().toJSON(),
        svgDisplay: svg ? getComputedStyle(svg).display : null,
        signalOpacity: element.getAttribute('opacity'),
        scrollY,
      }
    })
    throw new Error(
      `${label} signal never became visibly active: ${JSON.stringify(diagnostics)}`,
    )
  }
  const samples: Array<{ x: number; y: number }> = []
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const point = await signal.evaluate((element) => ({
      x: Number(element.getAttribute('cx')),
      y: Number(element.getAttribute('cy')),
      opacity: Number(element.getAttribute('opacity') ?? 1),
    }))
    if (point.opacity > 0.2 && Number.isFinite(point.x) && Number.isFinite(point.y)) {
      samples.push(point)
    }
    await page.waitForTimeout(160)
  }

  const distance = samples.reduce((maximum, point, index) => {
    return Math.max(
      maximum,
      ...samples.slice(index + 1).map((other) => Math.hypot(
        other.x - point.x,
        other.y - point.y,
      )),
    )
  }, 0)

  if (distance < 3) {
    throw new Error(`${label} signal moved only ${distance.toFixed(1)} SVG units.`)
  }
}

const browser = await chromium.launch({
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader'],
})

try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'no-preference',
  })
  const runtimeErrors: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto(targetUrl.toString(), { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('load')

  const storyLayout = await page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>('.signature-story__panel')
    const narrative = document.querySelector<HTMLElement>('.signature-story__problem-copy p')
    return {
      bodyWidth: document.body.scrollWidth,
      narrativeSize: narrative ? Number.parseFloat(getComputedStyle(narrative).fontSize) : 0,
      panelWidth: panel?.getBoundingClientRect().width ?? 0,
      viewportWidth: window.innerWidth,
    }
  })
  if (storyLayout.bodyWidth > storyLayout.viewportWidth + 1) {
    throw new Error('Signature case introduces horizontal page overflow.')
  }
  if (storyLayout.panelWidth < storyLayout.viewportWidth * 0.5) {
    throw new Error('Signature case evidence remains compressed into a narrow column.')
  }
  if (storyLayout.narrativeSize < 14) {
    throw new Error('Signature case narrative remains below a readable desktop text size.')
  }

  const caseSignal = page.locator('.case-signal--risk')
  await page.mouse.wheel(0, 4_000)
  await page.waitForTimeout(900)
  await expectMovingSignal(
    page,
    caseSignal.locator('[data-signal-traveler]'),
    'Authority routing',
  )

  const researchSection = page.locator('#research')
  await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>('#research')
    if (section) window.scrollTo(0, section.offsetTop + 40)
  })
  await expectMovingSignal(
    page,
    researchSection.locator('[data-animated="true"] [data-research-pulse]'),
    'Research taxonomy',
  )

  const offscreenTravelerOpacity = Number(
    await caseSignal.locator('[data-signal-traveler]').getAttribute('opacity') ?? 1,
  )
  if (offscreenTravelerOpacity > 0.05) {
    throw new Error('Authority-routing motion keeps rendering after leaving the viewport.')
  }

  if (runtimeErrors.length > 0) {
    throw new Error(`Diagram motion produced runtime errors: ${runtimeErrors.join(' | ')}`)
  }

  const reducedPage = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
  })
  await reducedPage.goto(targetUrl.toString(), { waitUntil: 'load' })
  const reducedCase = reducedPage.locator('.case-signal--risk')
  await reducedCase.scrollIntoViewIfNeeded()

  if (await reducedCase.locator('[data-signal-traveler]').isVisible()) {
    throw new Error('Authority routing traveler remains visible with reduced motion enabled.')
  }
  const reducedMetaOpacity = await reducedCase.locator('.case-signal__meta').evaluate(
    (element) => getComputedStyle(element).opacity,
  )
  if (Number(reducedMetaOpacity) < 0.95) {
    throw new Error('Reduced-motion mode hides the static authority-routing content.')
  }

  console.log(
    'Diagram motion judge: PASS · authority routing + research taxonomy signals move · reduced motion stays static',
  )
} finally {
  await browser.close()
}
