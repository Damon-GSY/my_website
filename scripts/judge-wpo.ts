import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  resolveScenePerformanceProfile,
  type ScenePerformanceSignals,
} from '../lib/scene-performance-profile.ts'

const root = process.cwd()
const scene = readFileSync(resolve(root, 'components/optimization-landscape-scene.tsx'), 'utf8')
const hero = readFileSync(resolve(root, 'components/rebuild-hero.tsx'), 'utf8')
const page = readFileSync(resolve(root, 'app/page.tsx'), 'utf8')
const assets = readFileSync(resolve(root, 'lib/optimization-assets.ts'), 'utf8')
const css = readFileSync(resolve(root, 'components/rebuild-home.css'), 'utf8')
const mobileCss = readFileSync(resolve(root, 'app/mobile-excellence.css'), 'utf8')
const profilePolicy = readFileSync(resolve(root, 'lib/scene-performance-profile.ts'), 'utf8')
const effectsPath = resolve(root, 'components/optimization-post-effects.tsx')
const findings: string[] = []
const publicAssetsPath = resolve(root, 'public/assets')
const retiredAssetPattern =
  /^(?:optimization-(?:depth|foreground|landscape|light)(?:-(?:1280|1920))?|optimization-signature-(?:1280|1920|mobile)|supply-chain-agent-trace-v1)\.webp$/
const buildMarkerPath = resolve(root, '.next/BUILD_ID')
const buildInputs = [
  'app/globals.css',
  'app/mobile-excellence.css',
  'app/page.tsx',
  'components/rebuild-hero.tsx',
  'components/rebuild-home.css',
  'components/optimization-landscape-scene.tsx',
  'components/optimization-post-effects.tsx',
  'lib/optimization-assets.ts',
  'lib/scene-performance-profile.ts',
  'next.config.ts',
  'package.json',
  'package-lock.json',
  'postcss.config.mjs',
  'tsconfig.json',
].map((path) => resolve(root, path))

if (!existsSync(buildMarkerPath)) {
  findings.push('The production build is missing; WPO cannot validate emitted assets.')
} else {
  const latestInputTime = Math.max(...buildInputs.map((path) => statSync(path).mtimeMs))
  if (statSync(buildMarkerPath).mtimeMs < latestInputTime) {
    findings.push('The production build predates performance source changes; rebuild before WPO validation.')
  }
}

for (const asset of readdirSync(publicAssetsPath).filter((name) => retiredAssetPattern.test(name))) {
  findings.push(`Retired asset is still publicly shipped: ${asset}.`)
}

const baselineSignals: ScenePerformanceSignals = {
  compactCoarse: false,
  deviceMemory: 8,
  effectiveType: '4g',
  hardwareConcurrency: 8,
  networkConstrainedClient: false,
  saveData: false,
}
const profileCases: Array<{
  expected: ReturnType<typeof resolveScenePerformanceProfile>
  label: string
  signals: Partial<ScenePerformanceSignals>
}> = [
  { label: 'wide fine-pointer desktop on reported 3g', signals: { effectiveType: '3g' }, expected: 'full' },
  {
    label: 'compact coarse client on reported 3g',
    signals: { compactCoarse: true, effectiveType: '3g', networkConstrainedClient: true },
    expected: 'static-slow-network',
  },
  {
    label: 'compact coarse client on fast network',
    signals: { compactCoarse: true, effectiveType: '4g', networkConstrainedClient: true },
    expected: 'static-compact-coarse',
  },
  {
    label: 'constrained viewport on fast network',
    signals: { effectiveType: '4g', networkConstrainedClient: true },
    expected: 'full',
  },
  { label: 'desktop with data saver', signals: { saveData: true }, expected: 'static-save-data' },
  { label: 'desktop with low memory', signals: { deviceMemory: 2 }, expected: 'static-low-memory' },
  { label: 'desktop with low CPU concurrency', signals: { hardwareConcurrency: 4 }, expected: 'static-low-cpu' },
]

for (const testCase of profileCases) {
  const actual = resolveScenePerformanceProfile({ ...baselineSignals, ...testCase.signals })
  if (actual !== testCase.expected) {
    findings.push(`Performance profile case "${testCase.label}" returned ${actual}, expected ${testCase.expected}.`)
  }
}

if (/@react-three\/postprocessing/.test(scene)) {
  findings.push('The core WebGL chunk statically imports desktop-only postprocessing.')
}
if (!/dynamic\(\(\) => import\('@\/components\/optimization-post-effects'\)/.test(scene)) {
  findings.push('Desktop postprocessing is not isolated behind a dynamic import.')
}
if (!/!compactViewport[\s\S]*!reducedMotion[\s\S]*<OptimizationPostEffects/.test(scene)) {
  findings.push('Mobile or reduced-motion clients can still request the Bloom chunk.')
}
if (!existsSync(effectsPath)) findings.push('The isolated postprocessing component is missing.')
if (!/frameloop="demand"/.test(scene)) {
  findings.push('WebGL still renders continuously instead of waking on interaction.')
}
if (!/function ScrollFrameDriver[\s\S]*scrollProgress\.on\('change', invalidate\)/.test(scene)) {
  findings.push('Demand rendering is not driven by scroll changes.')
}
if (!/useSpring\(scrollYProgress,[\s\S]*stiffness:[\s\S]*damping:[\s\S]*restDelta:/.test(hero)) {
  findings.push('Demand rendering is not driven by a bounded spring clock.')
}
if (!/mounted && sceneEligible && !reducedMotion[\s\S]*<OptimizationLandscapeScene/.test(hero)) {
  findings.push('Static and reduced-motion clients can still instantiate the WebGL scene.')
}
if (!/min-width: 1100px[\s\S]*min-height: 720px[\s\S]*pointer: fine[\s\S]*hardwareConcurrency[\s\S]*webglAvailable/.test(hero)) {
  findings.push('The rebuild hero omits a viewport, pointer, CPU, or WebGL capability gate.')
}
if (!/static-save-data[\s\S]*static-slow-network[\s\S]*static-low-memory[\s\S]*static-low-cpu[\s\S]*static-compact-coarse/.test(profilePolicy)) {
  findings.push('Constrained clients do not resolve to explicit static performance profiles.')
}
if (!/networkConstrainedClient && effectiveType[\s\S]*SLOW_EFFECTIVE_TYPES\.has/.test(profilePolicy)) {
  findings.push('Slow-network degradation is not scoped to constrained clients.')
}
if (/userAgent|navigator\.platform/.test(hero)) {
  findings.push('The performance gate regressed to user-agent sniffing.')
}
if (/remainingFrames/.test(scene)) {
  findings.push('Demand rendering still uses a refresh-rate-dependent frame budget.')
}
if (!/dpr=\{\[1, compactViewport \? 1\.1 : 1\.35\]\}/.test(scene)) findings.push('Canvas device-pixel ratio is not capped.')
if (/WORLD_PLATE_URLS|WORLD_PLATE_MEDIA/.test(page)) {
  findings.push('The homepage still manually preloads obsolete world plates alongside its LCP art.')
}
if (!/CREATOR_HERO_VISUAL = '\/assets\/creator-hero-v1\.webp'/.test(assets)) {
  findings.push('The shared hero asset is missing from the visual manifest.')
}
if (/image-set\([\s\S]*optimization-world-v2/.test(`${css}\n${mobileCss}`)) {
  findings.push('CSS fallback selection still uses a divergent density source set.')
}

const manifestPath = resolve(root, '.next/react-loadable-manifest.json')
if (!existsSync(manifestPath)) {
  findings.push('The production loadable manifest is missing; immersive chunk loading is unverified.')
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, { files?: string[] }>
  const entry = Object.entries(manifest).find(([key]) => key.includes('optimization-landscape-scene'))?.[1]
  if (!entry?.files?.length) {
    findings.push('The immersive scene is absent from the production loadable manifest.')
  } else {
    const missingFiles = entry.files.filter((file) => !existsSync(resolve(root, '.next', file)))
    if (missingFiles.length > 0) {
      findings.push(`The immersive scene manifest references missing chunks: ${missingFiles.join(', ')}.`)
    }
    const bytes = entry.files.reduce((total, file) => {
      const filePath = resolve(root, '.next', file)
      return total + (existsSync(filePath) ? statSync(filePath).size : 0)
    }, 0)
    const kilobytes = Math.round(bytes / 1024)
    console.log(`Core immersive scene chunk: ${kilobytes} KB raw`)
    if (kilobytes > 1000) findings.push(`The core immersive scene chunk remains ${kilobytes} KB raw before desktop-only effects.`)

    const homeHtmlPath = resolve(root, '.next/server/app/index.html')
    if (existsSync(homeHtmlPath)) {
      const homeHtml = readFileSync(homeHtmlPath, 'utf8')
      const eagerlyLoaded = entry.files.filter((file) => homeHtml.includes(file.split('/').at(-1) ?? file))
      if (eagerlyLoaded.length > 0) {
        findings.push(`The homepage eagerly loads immersive chunks: ${eagerlyLoaded.join(', ')}.`)
      }
    }
  }
}

const builtHomePath = resolve(root, '.next/server/app/index.html')
const builtCasePath = resolve(root, '.next/server/app/work/risk-router.html')
if (!existsSync(builtHomePath)) {
  findings.push('Built homepage HTML is missing; responsive world-plate preloads are unverified.')
} else {
  const builtHome = readFileSync(builtHomePath, 'utf8')
  if (!/rel="preload"[^>]+creator-hero-v1\.webp/.test(builtHome)) {
    findings.push('Built homepage HTML does not emit the creator hero LCP preload.')
  }
}
if (!existsSync(builtCasePath)) {
  findings.push('Built case-study HTML is missing; route-scoped preload behavior is unverified.')
} else {
  const builtCase = readFileSync(builtCasePath, 'utf8')
  if (/rel="preload"[^>]+creator-hero-v1\.webp/.test(builtCase)) {
    findings.push('Non-home routes preload the homepage hero unnecessarily.')
  }
}

console.log(`Web performance judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
