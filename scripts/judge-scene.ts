import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const scene = readFileSync(resolve(root, 'components/optimization-landscape-scene.tsx'), 'utf8')
const hero = readFileSync(resolve(root, 'components/hero.tsx'), 'utf8')
const css = readFileSync(resolve(root, 'app/globals.css'), 'utf8')
const assets = readFileSync(resolve(root, 'lib/optimization-assets.ts'), 'utf8')

const failures: string[] = []

function requirePattern(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) failures.push(message)
}

function banPattern(source: string, pattern: RegExp, message: string) {
  if (pattern.test(source)) failures.push(message)
}

requirePattern(scene, /Suspense/, 'Texture loading has no in-canvas Suspense boundary.')
requirePattern(scene, /SceneErrorBoundary/, 'WebGL and texture failures have no DOM fallback boundary.')
requirePattern(scene, /fallback=\{<div className="hero__scene-fallback"/, 'Canvas cannot fall back when WebGL is unavailable.')
requirePattern(scene, /const \[readyProfile, setReadyProfile\][\s\S]*setReadyProfile\(renderProfile\)[\s\S]*readyProfile === renderProfile[\s\S]*hero__scene-fallback--loading[\s\S]*onReady=\{handleReady\}/, 'The DOM fallback is not tied to the texture-ready state of the current WebGL profile.')
requirePattern(scene, /scrollProgress\.get[\s\S]*cameraRail\.getPointAt/, 'Scroll progress does not drive the camera dolly.')
requirePattern(scene, /function TerrainField/, 'The scene has no real 3D optimization topology.')
requirePattern(scene, /planeGeometry ref=\{geometryRef\} args=\{\[TERRAIN_WIDTH, TERRAIN_DEPTH, (?:[4-9]\d|\d{3,}), (?:[3-9]\d|\d{3,})\]\}/, 'The terrain is not sufficiently subdivided to read as a 3D field.')
requirePattern(scene, /TubeGeometry/, 'The optimization path is not a spatial curve through the landscape.')
requirePattern(scene, /function ConvergenceField/, 'The loss minimum has no authored volumetric convergence field.')
requirePattern(
  scene,
  /function ConvergenceField[\s\S]*scrollProgress\.get\(\)[\s\S]*smoothstep\(progress,\s*0\.5[\s\S]*AdditiveBlending/,
  'The convergence field is not revealed by scroll progress with additive light scattering.',
)
requirePattern(
  scene,
  /function ConvergenceField[\s\S]*rotation\.z\s*=\s*progress[\s\S]*ringGeometry/,
  'The optimization core has no scroll-scrubbed iso-loss rings.',
)
requirePattern(scene, /cameraRail\.getPointAt[\s\S]*camera\.position\.copy/, 'The camera is not moving through a real 3D path.')
requirePattern(scene, /<fog attach="fog"/, 'The scene has no atmospheric depth cue.')
requirePattern(scene, /frameloop="demand"/, 'The WebGL scene still renders continuously while idle.')
requirePattern(hero, /useSpring\(scrollYProgress,[\s\S]*stiffness:[\s\S]*damping:[\s\S]*restDelta:/, 'The scroll story has no refresh-rate-independent shared spring clock.')
requirePattern(scene, /function ScrollFrameDriver[\s\S]*scrollProgress\.on\('change', invalidate\)/, 'Demand rendering does not follow the shared scroll clock.')
banPattern(scene, /progressRef\.current\s*=|camera\.fov\s*=\s*damp/, 'The WebGL camera adds a second smoothing clock after the DOM story.')
banPattern(scene, /clock\.elapsedTime/, 'The supposedly scroll-driven scene still contains autonomous time animation.')

requirePattern(scene, /WORLD_PLATE_URLS\.mobile[\s\S]*WORLD_PLATE_URLS\.highDensity[\s\S]*WORLD_PLATE_URLS\.standard/, 'The generated mathematical world plate is missing from the WebGL scene.')
requirePattern(scene, /WORLD_PLATE_MEDIA\.highDensityWide[\s\S]*\? '1920' : '1280'/, 'WebGL does not use the shared high-density-wide asset rule.')
requirePattern(scene, /performanceProfile: 'full'[\s\S]*failIfMajorPerformanceCaveat: performanceProfile === 'full'[\s\S]*powerPreference:/, 'The full scene does not reject a major GPU performance caveat.')
requirePattern(scene, /function TerrainField[\s\S]*smoothstep\(progress, 0\.06, 0\.38\)[\s\S]*opacity = 0\.04 \+ reveal/, 'The 3D terrain competes with the authored world plate before scroll begins.')
requirePattern(scene, /function OptimizationPath[\s\S]*opacity = ignition \* 0\.9/, 'The spatial path is fully visible before the scroll story ignites it.')
banPattern(scene, /optimization-(?:depth|foreground|light)-/, 'Opaque images from incompatible viewpoints are stacked as fake depth.')

requirePattern(hero, /offset:\s*\['start start', 'end end'\]/, 'Hero scroll progress does not span the sticky sequence.')
requirePattern(css, /\.hero__viewport\s*\{[^}]*position:\s*sticky/s, 'The WebGL viewport is not sticky.')
requirePattern(css, /\.hero\s*\{[^}]*height:\s*(?:2[2-9]\d|[3-9]\d{2,})svh/s, 'The camera journey has less than 1.2 viewports of scroll runway.')
requirePattern(css, /\.hero__scene-fallback[\s\S]*optimization-world-v2-1280[\s\S]*@media \(min-width: 1280px\) and \(min-resolution: 1\.5dppx\)[\s\S]*optimization-world-v2-1920/, 'The loading fallback does not follow the standard/high-density-wide asset rule.')
requirePattern(assets, /mobile:[\s\S]*optimization-world-v2-mobile[\s\S]*standard:[\s\S]*optimization-world-v2-1280[\s\S]*highDensity:[\s\S]*optimization-world-v2-1920/, 'World-plate URLs are not centralized.')
requirePattern(css, /\.hero__scene-fallback--loading[\s\S]*transition:\s*opacity[\s\S]*\.is-ready/, 'The loading fallback has no texture-ready crossfade.')
banPattern(css, /@media \(max-width: 1024px\)[\s\S]*?\.hero__scene\s*\{[^}]*left:/, 'Responsive CSS crops the WebGL canvas horizontally.')

console.log(`Scene resilience judge: ${failures.length === 0 ? 'PASS' : 'FAIL'}`)
for (const failure of failures) console.log(`- ${failure}`)
if (failures.length > 0) process.exitCode = 1
