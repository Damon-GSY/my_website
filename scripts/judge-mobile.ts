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
const earlierCss = readFileSync(resolve(root, 'components/earlier-systems-section.module.css'), 'utf8')
const researchCss = readFileSync(resolve(root, 'components/research-section.module.css'), 'utf8')
const aboutCss = readFileSync(resolve(root, 'components/about-section.module.css'), 'utf8')
const scene = readFileSync(resolve(root, 'components/optimization-landscape-scene.tsx'), 'utf8')
const header = readFileSync(resolve(root, 'components/site-header.tsx'), 'utf8')
const hero = readFileSync(resolve(root, 'components/hero.tsx'), 'utf8')
const assets = readFileSync(resolve(root, 'lib/optimization-assets.ts'), 'utf8')
const profilePolicy = readFileSync(resolve(root, 'lib/scene-performance-profile.ts'), 'utf8')
const findings: string[] = []

function requirePattern(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) findings.push(message)
}

if (/body\s*\{[^}]*overflow-x:\s*(?:hidden|clip)/s.test(css)) {
  findings.push('The document body hides horizontal overflow instead of making narrow layouts fit.')
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
requirePattern(notesCss, /@media \(max-width: 800px\)[\s\S]*\.articleHeroGrid,[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/, 'Field-note article grids can expand beyond a narrow viewport.')
requirePattern(notesCss, /@media \(max-width: 640px\)[\s\S]*\.articleHero h1\s*\{[^}]*max-width:\s*100%[^}]*overflow-wrap:\s*anywhere[\s\S]*\.nextNote a\s*\{[^}]*max-width:\s*100%[^}]*overflow-wrap:\s*anywhere[\s\S]*\.prose section\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)[\s\S]*\.prose h2\s*\{[^}]*max-width:\s*100%[^}]*overflow-wrap:\s*anywhere/, 'Field-note display headings, continuation links, or prose grids can overflow the narrowest supported viewport.')
requirePattern(mobile, /\.footer-bottom a[\s\S]*min-height:\s*2\.75rem/, 'Footer links do not provide 44px touch targets.')
requirePattern(workLayoutCss, /@media \(max-width: 720px\)[\s\S]*\.case-index__intro,[\s\S]*\.case-index__body[\s\S]*grid-template-columns:\s*1fr;/, 'The compact project index keeps its desktop grid on narrow screens.')
requirePattern(css, /@media \(max-width: 720px\)[\s\S]*\.section-intro\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*\}[\s\S]*\.section-intro > \*\s*\{[^}]*min-width:\s*0/s, 'The mobile work intro can expand its single grid track beyond the viewport.')
requirePattern(css, /@media \(max-width: 720px\)[\s\S]*\.section-intro h2\s*\{[^}]*max-width:\s*100%[^}]*overflow-wrap:\s*anywhere/s, 'The mobile work heading can overflow on long words.')
requirePattern(earlierCss, /@media \(max-width: 720px\)[\s\S]*\.intro\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*\}[\s\S]*\.intro > \*\s*\{[^}]*min-width:\s*0/s, 'The mobile earlier-systems intro can expand its single grid track beyond the viewport.')
requirePattern(earlierCss, /@media \(max-width: 720px\)[\s\S]*\.intro h2\s*\{[^}]*max-width:\s*100%[^}]*overflow-wrap:\s*anywhere/s, 'The mobile earlier-systems heading can overflow on long words.')
requirePattern(researchCss, /@media \(max-width: 820px\), \(max-height: 700px\)[\s\S]*\.mobileRecord \.record > a\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*min-width:\s*0[^}]*\}[\s\S]*\.mobileRecord \.record > a > \*\s*\{[^}]*min-width:\s*0/s, 'Mobile research records can expand their single grid track beyond the viewport.')
requirePattern(researchCss, /@media \(max-width: 820px\), \(max-height: 700px\)[\s\S]*\.mobileHeader h2\s*\{[^}]*max-width:\s*100%[^}]*overflow-wrap:\s*anywhere[\s\S]*\.mobileRecord \.recordMeta\s*\{[^}]*flex-wrap:\s*wrap[\s\S]*\.visualCompact \.visualReadout\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) auto[^}]*min-width:\s*0[\s\S]*\.record h3\s*\{[^}]*max-width:\s*100%[^}]*overflow-wrap:\s*anywhere/s, 'Mobile research headings, metadata, or readouts can overflow the viewport.')
requirePattern(aboutCss, /@media \(max-width: 720px\)[\s\S]*\.trajectoryHead\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*\}[\s\S]*\.trajectoryHead > \*\s*\{[^}]*min-width:\s*0/s, 'The mobile trajectory heading can expand its single grid track beyond the viewport.')
requirePattern(aboutCss, /@media \(max-width: 720px\)[\s\S]*\.trajectoryHead h3\s*\{[^}]*max-width:\s*100%[^}]*overflow-wrap:\s*anywhere[\s\S]*\.principles article\s*\{[^}]*min-width:\s*0[\s\S]*\.principles article > \*\s*\{[^}]*min-width:\s*0[\s\S]*\.principles h3,[\s\S]*max-width:\s*100%[^}]*overflow-wrap:\s*anywhere/s, 'Mobile trajectory or principle headings can overflow the viewport.')
requirePattern(scene, /compactViewport \? 1\.1 : 1\.35/, 'Mobile WebGL renders above the capped pixel ratio.')
requirePattern(scene, /!compactViewport[\s\S]*<OptimizationPostEffects/, 'Mobile clients still load desktop-only postprocessing.')
requirePattern(scene, /COMPACT_VIEWPORT_QUERY = '\(max-width: 720px\), \(pointer: coarse\) and \(max-width: 900px\), \(pointer: coarse\) and \(max-width: 1200px\) and \(max-height: 600px\)'/, 'Short coarse-pointer landscape screens are misclassified as desktop WebGL clients.')
requirePattern(scene, /function useViewportProfile[\s\S]*compactQuery[\s\S]*portraitQuery[\s\S]*highDensityQuery[\s\S]*highDensityQuery\.addEventListener\('change', update\)[\s\S]*highDensityQuery\.removeEventListener\('change', update\)/, 'WebGL asset resolution does not subscribe to DPR media-query changes with cleanup.')
requirePattern(scene, /PORTRAIT_COMPOSITION_QUERY = WORLD_PLATE_MEDIA\.mobilePortrait[\s\S]*portraitComposition[\s\S]*WORLD_PLATE_URLS\.mobile/, 'Backdrop assets do not switch to the shared portrait mobile composition.')
requirePattern(page, /href=\{WORLD_PLATE_URLS\.mobile\}[\s\S]*media=\{WORLD_PLATE_MEDIA\.mobilePortrait\}/, 'The mobile hero does not preload its portrait-safe composition.')
requirePattern(assets, /mobilePortrait: '\(max-width: 720px\) and \(orientation: portrait\)'/, 'The shared mobile portrait media rule drifted from the CSS breakpoint.')
requirePattern(css, /@media \(max-width: 720px\) and \(orientation: portrait\)[\s\S]*optimization-world-v2-mobile/, 'CSS does not restrict the mobile world plate to portrait phones.')
requirePattern(hero, /COARSE_SMALL_VIEWPORT_QUERY = '[^']*pointer: coarse[^']*max-width: 900px[^']*max-width: 1200px[^']*max-height: 600px[^']*'/, 'Small coarse-pointer devices are not routed to the static performance profile.')
requirePattern(hero, /NETWORK_CONSTRAINED_CLIENT_QUERY = '\(max-width: 1200px\), \(pointer: coarse\)'[\s\S]*networkConstrainedQuery\.addEventListener\('change', onStoreChange\)[\s\S]*networkConstrainedQuery\.removeEventListener\('change', onStoreChange\)/, 'Slow-network viewport gating is not reactive or does not clean up its listener.')
requirePattern(profilePolicy, /networkConstrainedClient && effectiveType[\s\S]*static-slow-network/, 'Slow-network degradation is not limited to constrained clients.')
requirePattern(scene, /renderProfile = `\$\{assetResolution\}:\$\{compactViewport[\s\S]*readyProfile === renderProfile[\s\S]*key=\{renderProfile\}/, 'Changing WebGL performance profiles does not rebuild context creation settings behind a loading-safe profile key.')
requirePattern(scene, /setProfile\(\(current\)[\s\S]*current\.assetResolution === next\.assetResolution[\s\S]*current\.compactViewport === next\.compactViewport[\s\S]*current\.portraitComposition === next\.portraitComposition[\s\S]*\? current/, 'Resize events rerender the WebGL tree even when its responsive profile did not change.')
requirePattern(mobile, /@media \(pointer: coarse\) and \(max-width: 1200px\) and \(max-height: 600px\)[\s\S]*\.hero__viewport[\s\S]*min-height:\s*0/, 'Short landscape phones retain the desktop 48rem sticky viewport floor.')
requirePattern(hero, /COARSE_SMALL_VIEWPORT_QUERY = '\(pointer: coarse\) and \(max-width: 900px\), \(pointer: coarse\) and \(max-width: 1200px\) and \(max-height: 600px\)'[\s\S]*compactCoarse:/, 'Landscape phones wider than the narrow CSS breakpoint can still mount WebGL.')
requirePattern(mobile, /@media \(min-width: 721px\) and \(max-height: 760px\)[\s\S]*\.hero__content[\s\S]*min-height:\s*100svh/, 'Short fine-pointer desktop screens have no compact hero layout.')
requirePattern(header, /<\/header>[\s\S]*className=\{`site-mobile-menu/, 'The fixed mobile dialog is nested inside a backdrop-filtered header containing block.')
requirePattern(header, /site-mobile-menu__close[\s\S]*aria-label="Close navigation"/, 'The full-viewport mobile dialog has no close control inside its focus trap.')

console.log(`Mobile excellence judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
