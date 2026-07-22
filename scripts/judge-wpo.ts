import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const scene = readFileSync(resolve(root, 'components/optimization-landscape-scene.tsx'), 'utf8')
const hero = readFileSync(resolve(root, 'components/hero.tsx'), 'utf8')
const page = readFileSync(resolve(root, 'app/page.tsx'), 'utf8')
const assets = readFileSync(resolve(root, 'lib/optimization-assets.ts'), 'utf8')
const css = readFileSync(resolve(root, 'app/globals.css'), 'utf8')
const mobileCss = readFileSync(resolve(root, 'app/mobile-excellence.css'), 'utf8')
const effectsPath = resolve(root, 'components/optimization-post-effects.tsx')
const findings: string[] = []
const buildMarkerPath = resolve(root, '.next/BUILD_ID')
const buildInputs = [
  'app/globals.css',
  'app/mobile-excellence.css',
  'app/page.tsx',
  'components/hero.tsx',
  'components/optimization-landscape-scene.tsx',
  'components/optimization-post-effects.tsx',
  'lib/optimization-assets.ts',
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
if (!/performanceProfile === 'full' && !reduceMotion[\s\S]*<OptimizationLandscapeScene[\s\S]*hero__scene-fallback/.test(hero)) {
  findings.push('Reduced-motion and server-rendered clients still instantiate the WebGL scene.')
}
if (!/saveData[\s\S]*effectiveType[\s\S]*deviceMemory[\s\S]*hardwareConcurrency[\s\S]*COARSE_SMALL_VIEWPORT_QUERY/.test(hero)) {
  findings.push('The hero performance profile omits a required client capability signal.')
}
if (!/static-save-data[\s\S]*static-slow-network[\s\S]*static-low-memory[\s\S]*static-low-cpu[\s\S]*static-compact-coarse/.test(hero)) {
  findings.push('Constrained clients do not resolve to explicit static performance profiles.')
}
if (/userAgent|navigator\.platform/.test(hero)) {
  findings.push('The performance gate regressed to user-agent sniffing.')
}
if (/remainingFrames/.test(scene)) {
  findings.push('Demand rendering still uses a refresh-rate-dependent frame budget.')
}
if (!/dpr=\{\[1, compactViewport \? 1\.1 : 1\.35\]\}/.test(scene)) findings.push('Canvas device-pixel ratio is not capped.')
if (!/WORLD_PLATE_URLS\.mobile[\s\S]*WORLD_PLATE_MEDIA\.mobilePortrait[\s\S]*WORLD_PLATE_URLS\.standard[\s\S]*WORLD_PLATE_MEDIA\.standard[\s\S]*WORLD_PLATE_URLS\.highDensity[\s\S]*WORLD_PLATE_MEDIA\.highDensityWide/.test(page)) {
  findings.push('The homepage does not preload each mutually exclusive world-plate profile.')
}
if (!/mobilePortrait: '\(max-width: 720px\) and \(orientation: portrait\)'[\s\S]*highDensityWide: '\(min-width: 1280px\) and \(min-resolution: 1\.5dppx\)'/.test(assets)) {
  findings.push('The shared world-plate media rules do not preserve mobile and high-density-wide profiles.')
}
if (/imageSrcSet|imageSizes/.test(page)) {
  findings.push('World-plate preload selection still delegates to a divergent source-set heuristic.')
}
if (/image-set\([\s\S]*optimization-world-v2/.test(`${css}\n${mobileCss}`)) {
  findings.push('CSS fallback selection still uses a divergent density source set.')
}
if (!/\(min-width: 1280px\) and \(resolution < 1\.5dppx\)/.test(assets)) {
  findings.push('The standard preload does not exhaustively cover wide screens below the high-density threshold.')
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
  if (!/rel="preload"[^>]+optimization-world-v2-(?:mobile|1280|1920)\.webp/.test(builtHome)) {
    findings.push('Built homepage HTML does not emit the landscape image preload.')
  }
}
if (!existsSync(builtCasePath)) {
  findings.push('Built case-study HTML is missing; route-scoped preload behavior is unverified.')
} else {
  const builtCase = readFileSync(builtCasePath, 'utf8')
  if (/rel="preload"[^>]+optimization-world-v2-(?:mobile|1280|1920)\.webp/.test(builtCase)) {
    findings.push('Non-home routes preload the homepage landscape unnecessarily.')
  }
}

console.log(`Web performance judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
