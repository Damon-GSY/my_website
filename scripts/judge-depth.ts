import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const scene = readFileSync(resolve(root, 'components/optimization-landscape-scene.tsx'), 'utf8')
const css = readFileSync(resolve(root, 'app/globals.css'), 'utf8')
const failures: string[] = []

function requirePattern(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) failures.push(message)
}

function banPattern(source: string, pattern: RegExp, message: string) {
  if (pattern.test(source)) failures.push(message)
}

function vectorCount(blockName: string) {
  const block = scene.match(new RegExp(`const ${blockName} = \\[([\\s\\S]*?)\\n\\]`))?.[1] ?? ''
  return [...block.matchAll(/new THREE\.Vector3\(/g)].length
}

if (vectorCount('CAMERA_RAIL_POINTS') < 6) failures.push('Camera motion is not a six-point spatial rail.')
if (vectorCount('LOOK_RAIL_POINTS') < 6) failures.push('Camera gaze is not independently choreographed along the rail.')

requirePattern(scene, /cameraRail\.getPointAt\(/, 'Scroll does not sample a curved camera rail.')
requirePattern(scene, /lookRail\.getPointAt\(/, 'Scroll does not sample a curved gaze rail.')
requirePattern(scene, /camera\.rotateZ\(/, 'The camera has no restrained banking cue while it turns.')
requirePattern(scene, /function SpatialContours/, 'There are no real transverse contour lines for the camera to pass.')
requirePattern(scene, /function AtmosphericBackdrop/, 'The scene has no single, distant photographic backdrop.')
requirePattern(scene, /backdropRef\.current\.opacity[\s\S]*progress/, 'The flat backdrop does not recede as 3D geometry takes over.')
requirePattern(scene, /<DustField/, 'The scene has no near-field particles to expose relative camera speed.')
requirePattern(css, /\.hero\s*\{[^}]*height:\s*(?:2[4-9]\d|[3-9]\d{2,})svh/s, 'The camera rail has less than 1.4 viewports of scroll runway.')

banPattern(
  scene,
  /optimization-(?:depth|foreground|light)-/,
  'Opaque images from incompatible viewpoints are still being stacked as fake depth layers.',
)

console.log(`Perceptual depth judge: ${failures.length === 0 ? 'PASS' : 'FAIL'}`)
for (const failure of failures) console.log(`- ${failure}`)
if (failures.length > 0) process.exitCode = 1
