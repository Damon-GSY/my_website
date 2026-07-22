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
const header = readFileSync(resolve(root, 'components/site-header.tsx'), 'utf8')
const hero = readFileSync(resolve(root, 'components/hero.tsx'), 'utf8')
const assets = readFileSync(resolve(root, 'lib/optimization-assets.ts'), 'utf8')
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
requirePattern(workLayoutCss, /@media \(max-width: 720px\)[\s\S]*\.case-index__intro,[\s\S]*\.case-index__body[\s\S]*grid-template-columns:\s*1fr;/, 'The compact project index keeps its desktop grid on narrow screens.')
requirePattern(scene, /compactViewport \? 1\.1 : 1\.35/, 'Mobile WebGL renders above the capped pixel ratio.')
requirePattern(scene, /!compactViewport[\s\S]*<OptimizationPostEffects/, 'Mobile clients still load desktop-only postprocessing.')
requirePattern(scene, /COMPACT_VIEWPORT_QUERY = '\(max-width: 720px\), \(pointer: coarse\) and \(max-width: 900px\), \(pointer: coarse\) and \(max-width: 1200px\) and \(max-height: 600px\)'/, 'Short coarse-pointer landscape screens are misclassified as desktop WebGL clients.')
requirePattern(scene, /function useViewportProfile[\s\S]*compactQuery[\s\S]*portraitQuery[\s\S]*highDensityQuery[\s\S]*highDensityQuery\.addEventListener\('change', update\)[\s\S]*highDensityQuery\.removeEventListener\('change', update\)/, 'WebGL asset resolution does not subscribe to DPR media-query changes with cleanup.')
requirePattern(scene, /PORTRAIT_COMPOSITION_QUERY = WORLD_PLATE_MEDIA\.mobilePortrait[\s\S]*portraitComposition[\s\S]*WORLD_PLATE_URLS\.mobile/, 'Backdrop assets do not switch to the shared portrait mobile composition.')
requirePattern(page, /href=\{WORLD_PLATE_URLS\.mobile\}[\s\S]*media=\{WORLD_PLATE_MEDIA\.mobilePortrait\}/, 'The mobile hero does not preload its portrait-safe composition.')
requirePattern(assets, /mobilePortrait: '\(max-width: 720px\) and \(orientation: portrait\)'/, 'The shared mobile portrait media rule drifted from the CSS breakpoint.')
requirePattern(css, /@media \(max-width: 720px\) and \(orientation: portrait\)[\s\S]*optimization-world-v2-mobile/, 'CSS does not restrict the mobile world plate to portrait phones.')
requirePattern(hero, /COARSE_SMALL_VIEWPORT_QUERY = '[^']*pointer: coarse[^']*max-width: 900px[^']*max-width: 1200px[^']*max-height: 600px[^']*'/, 'Small coarse-pointer devices are not routed to the static performance profile.')
requirePattern(scene, /renderProfile = `\$\{assetResolution\}:\$\{compactViewport[\s\S]*readyProfile === renderProfile[\s\S]*key=\{renderProfile\}/, 'Changing WebGL performance profiles does not rebuild context creation settings behind a loading-safe profile key.')
requirePattern(scene, /setProfile\(\(current\)[\s\S]*current\.assetResolution === next\.assetResolution[\s\S]*current\.compactViewport === next\.compactViewport[\s\S]*current\.portraitComposition === next\.portraitComposition[\s\S]*\? current/, 'Resize events rerender the WebGL tree even when its responsive profile did not change.')
requirePattern(mobile, /@media \(pointer: coarse\) and \(max-width: 1200px\) and \(max-height: 600px\)[\s\S]*\.hero__viewport[\s\S]*min-height:\s*0/, 'Short landscape phones retain the desktop 48rem sticky viewport floor.')
requirePattern(hero, /COARSE_SMALL_VIEWPORT_QUERY = '\(pointer: coarse\) and \(max-width: 900px\), \(pointer: coarse\) and \(max-width: 1200px\) and \(max-height: 600px\)'[\s\S]*static-compact-coarse/, 'Landscape phones wider than the narrow CSS breakpoint can still mount WebGL.')
requirePattern(mobile, /@media \(min-width: 721px\) and \(max-height: 760px\)[\s\S]*\.hero__content[\s\S]*min-height:\s*100svh/, 'Short fine-pointer desktop screens have no compact hero layout.')
requirePattern(header, /<\/header>[\s\S]*className=\{`site-mobile-menu/, 'The fixed mobile dialog is nested inside a backdrop-filtered header containing block.')
requirePattern(header, /site-mobile-menu__close[\s\S]*aria-label="Close navigation"/, 'The full-viewport mobile dialog has no close control inside its focus trap.')

console.log(`Mobile excellence judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
