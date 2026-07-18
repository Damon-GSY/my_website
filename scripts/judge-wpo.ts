import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const scene = readFileSync(resolve(root, 'components/optimization-landscape-scene.tsx'), 'utf8')
const effectsPath = resolve(root, 'components/optimization-post-effects.tsx')
const findings: string[] = []

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
if (!/frameloop=\{active \? 'always' : 'never'\}/.test(scene)) findings.push('Offscreen WebGL rendering is not paused.')
if (!/dpr=\{\[1, compactViewport \? 1\.1 : 1\.35\]\}/.test(scene)) findings.push('Canvas device-pixel ratio is not capped.')

const manifestPath = resolve(root, '.next/react-loadable-manifest.json')
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, { files?: string[] }>
  const entry = Object.entries(manifest).find(([key]) => key.includes('optimization-landscape-scene'))?.[1]
  if (entry?.files) {
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

console.log(`Web performance judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
