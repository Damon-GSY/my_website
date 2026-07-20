import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const layout = readFileSync(resolve(root, 'app/layout.tsx'), 'utf8')
const page = readFileSync(resolve(root, 'app/page.tsx'), 'utf8')
const css = readFileSync(resolve(root, 'app/globals.css'), 'utf8')
const workLayoutCss = readFileSync(resolve(root, 'components/work-section-layout.css'), 'utf8')
const mobilePath = resolve(root, 'app/mobile-excellence.css')
let mobile = ''
try { mobile = readFileSync(mobilePath, 'utf8') } catch {}
const caseCss = readFileSync(resolve(root, 'app/work/[slug]/case-study.module.css'), 'utf8')
const notesCss = readFileSync(resolve(root, 'app/notes/notes.module.css'), 'utf8')
const scene = readFileSync(resolve(root, 'components/optimization-landscape-scene.tsx'), 'utf8')
const findings: string[] = []

function requirePattern(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) findings.push(message)
}

requirePattern(layout, /export const viewport[\s\S]*width:\s*'device-width'[\s\S]*initialScale:\s*1/, 'The responsive viewport contract is incomplete.')
requirePattern(layout, /import '\.\/mobile-excellence\.css'/, 'Mobile usability fixes are not isolated as a maintainable layer.')
requirePattern(css, /\.site-mobile-menu nav a\s*\{[^}]*padding:\s*1rem 0/s, 'Primary mobile navigation lacks large touch rows.')
requirePattern(mobile, /\.site-menu-toggle\s*\{[^}]*width:\s*2\.75rem[^}]*height:\s*2\.75rem/s, 'The menu button is smaller than 44px.')
requirePattern(mobile, /touch-action:\s*manipulation/, 'Touch interactions do not opt into low-latency manipulation behavior.')
requirePattern(mobile, /\.section-eyebrow[\s\S]*font-size:\s*0\.68rem/, 'Critical mobile metadata still inherits sub-11px text.')
requirePattern(mobile, /\.hero__foot small,[\s\S]*\.hero__foot strong[\s\S]*font-size:\s*0\.68rem/, 'The hero identity proof overrides the mobile readability floor.')
requirePattern(caseCss, /@media \(max-width: 720px\)[\s\S]*\.heroLower dt,[\s\S]*\.next span[\s\S]*font-size:\s*0\.68rem/, 'Case-study metadata drops below the mobile readability floor.')
requirePattern(notesCss, /@media \(max-width: 640px\)[\s\S]*\.articleMeta,[\s\S]*\.nextNote span[\s\S]*font-size:\s*0\.68rem/, 'Field-note metadata drops below the mobile readability floor.')
requirePattern(mobile, /\.footer-bottom a[\s\S]*min-height:\s*2\.75rem/, 'Footer links do not provide 44px touch targets.')
requirePattern(workLayoutCss, /@media \(max-width: 720px\)[\s\S]*\.case-study:nth-child\(3\) \.case-study__title,[\s\S]*grid-column:\s*1;[\s\S]*grid-row:\s*auto;/, 'The third project keeps its authored desktop grid on narrow screens.')
requirePattern(scene, /compactViewport \? 1\.1 : 1\.35/, 'Mobile WebGL renders above the capped pixel ratio.')
requirePattern(scene, /!compactViewport[\s\S]*<OptimizationPostEffects/, 'Mobile clients still load desktop-only postprocessing.')
requirePattern(scene, /COMPACT_VIEWPORT_QUERY = '\(max-width: 720px\), \(pointer: coarse\) and \(max-height: 540px\)'/, 'Short coarse-pointer landscape screens are misclassified as desktop WebGL clients.')
requirePattern(scene, /function useViewportProfile[\s\S]*compactQuery[\s\S]*portraitQuery[\s\S]*addEventListener\('resize'/, 'WebGL performance or composition mode is frozen at mount and ignores orientation changes.')
requirePattern(scene, /portraitComposition[\s\S]*optimization-signature-mobile[\s\S]*optimization-signature-\$\{assetResolution\}/, 'Backdrop assets do not switch between portrait mobile and responsive landscape compositions.')
requirePattern(page, /href="\/assets\/optimization-signature-mobile\.webp"[\s\S]*media="\(max-width: 720px\) and \(orientation: portrait\)"/, 'The mobile hero does not preload its portrait-safe composition.')
requirePattern(scene, /renderProfile = `\$\{assetResolution\}:\$\{compactViewport[\s\S]*readyProfile === renderProfile[\s\S]*key=\{renderProfile\}/, 'Changing WebGL performance profiles does not rebuild context creation settings behind a loading-safe profile key.')
requirePattern(scene, /setProfile\(\(current\)[\s\S]*current\.assetResolution === next\.assetResolution[\s\S]*current\.compactViewport === next\.compactViewport[\s\S]*current\.portraitComposition === next\.portraitComposition[\s\S]*\? current/, 'Resize events rerender the WebGL tree even when its responsive profile did not change.')
requirePattern(mobile, /@media \(pointer: coarse\) and \(max-height: 540px\)[\s\S]*\.hero__viewport[\s\S]*min-height:\s*0/, 'Short landscape phones retain the desktop 48rem sticky viewport floor.')

console.log(`Mobile excellence judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
