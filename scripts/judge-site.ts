import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const css = readFileSync(resolve(root, 'app/globals.css'), 'utf8')
const page = readFileSync(resolve(root, 'app/page.tsx'), 'utf8')
const layout = readFileSync(resolve(root, 'app/layout.tsx'), 'utf8')
const hero = readFileSync(resolve(root, 'components/hero.tsx'), 'utf8')
const scene = readFileSync(resolve(root, 'components/optimization-landscape-scene.tsx'), 'utf8')
const work = readFileSync(resolve(root, 'components/work-section.tsx'), 'utf8')
const earlier = readFileSync(resolve(root, 'components/earlier-systems-section.tsx'), 'utf8')
const research = readFileSync(resolve(root, 'components/research-section.tsx'), 'utf8')
const notesSection = readFileSync(resolve(root, 'components/field-notes-section.tsx'), 'utf8')
const about = readFileSync(resolve(root, 'components/about-section.tsx'), 'utf8')
const content = readFileSync(resolve(root, 'lib/content.ts'), 'utf8')
const packageJson = readFileSync(resolve(root, 'package.json'), 'utf8')

const findings: string[] = []

const localFontSourceCount = layout.match(/path:\s*'\.\.\/public\/fonts\//g)?.length ?? 0
if (localFontSourceCount > 3) findings.push(`The first load preloads ${localFontSourceCount} local font files instead of the three used weights.`)

function requirePattern(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) findings.push(message)
}

function banPattern(source: string, pattern: RegExp, message: string) {
  if (pattern.test(source)) findings.push(message)
}

for (const selector of ['site-header', 'hero', 'work-section', 'research-section', 'about-section']) {
  const count = css.match(new RegExp(`^\\.${selector}\\s*\\{`, 'gm'))?.length ?? 0
  if (count !== 1) findings.push(`${selector} has ${count} top-level style definitions instead of one.`)
}

if (css.split('\n').length > 1750) findings.push('The stylesheet has grown beyond the single-system budget.')
banPattern(css, /(?:\.work-section|\.research-section|\.about-section)[^{]*\{[^}]*height:\s*(?:1[8-9]\d|[2-9]\d{2,})svh/s, 'A content section forces an excessive scroll length.')
banPattern(css, /(?:\.work-section|\.research-section|\.about-section)[^{]*\{[^}]*background:\s*(?:white|#fff|#e8e9e5)\s*;/s, 'A light section breaks the dark visual system.')
banPattern(packageJson, /"gsap"|"@gsap\/react"/, 'A second motion engine is still installed.')
banPattern(packageJson, /"@react-three\/drei"/, 'The scene reintroduced the full Drei helper package for a trivial loader.')
requirePattern(css, /@media \(max-width: 720px\)/, 'The mobile layout contract is missing.')
requirePattern(hero, /profile\.name[\s\S]*profile\.role[\s\S]*profile\.thesis/, 'Hero no longer exposes identity, role, and thesis.')
requirePattern(hero, /profile\.heroProofs\.map/, 'The hero no longer exposes Damon’s profile evidence above the fold.')
requirePattern(hero, /chapter\.evidence/, 'The scroll chapters no longer prove Damon’s production, research, and creator identities.')
requirePattern(hero, /offset:\s*\['start start', 'end end'\]/, 'Hero scroll progress is not mapped across the sticky sequence.')
requirePattern(scene, /useLoader\(THREE\.TextureLoader/, 'The supplied landscape assets are not loaded into WebGL.')
requirePattern(scene, /scrollProgress\.get/, 'The WebGL scene does not read scroll progress.')
requirePattern(scene, /cameraRail\.getPointAt[\s\S]*camera\.position\.copy/, 'The WebGL camera has no spatial dolly movement.')
requirePattern(scene, /lookRail\.getPointAt[\s\S]*camera\.lookAt/, 'The WebGL camera gaze does not follow the optimization path.')
banPattern(scene, /optimization-(?:depth|foreground|light)-/, 'Opaque images from incompatible viewpoints are stacked as fake depth.')
requirePattern(work, /signatureProject[\s\S]*projectIndex\.map[\s\S]*project\.statement[\s\S]*project\.details\[0\][\s\S]*project\.outcome\.value[\s\S]*project\.outcome\.evidence/, 'The compact work index no longer shows a problem, key decision, and structured outcome evidence.')
requirePattern(earlier, /earlierSystems\.map/, 'The homepage no longer exposes Damon’s earlier systems work.')
requirePattern(research, /research\.map[\s\S]*paper\.description[\s\S]*paper\.metric/, 'Research records are incomplete.')
requirePattern(research, /paper\.topics\.map/, 'Research records no longer expose their evaluation dimensions.')
requirePattern(notesSection, /notes\.slice[\s\S]*\/notes\/\$\{note\.slug\}/, 'Field notes are missing from the personal narrative.')
requirePattern(about, /education\.map/, 'The biography no longer shows Damon’s academic foundation.')
banPattern(about, /experience\.map/, 'About repeats the complete career archive after Earlier Systems.')
requirePattern(about, /profile\.role/, 'Current role is missing.')
requirePattern(about, /profile\.facts\.map/, 'Personal context is missing from the biography.')
requirePattern(content, /legalName:[\s\S]*alternateNames:[\s\S]*siteUrl:/, 'Identity data is not centralized.')
requirePattern(layout, /profile\.legalName[\s\S]*socials\.map/, 'Metadata duplicates identity or social data instead of using the content source.')
requirePattern(page, /<Hero \/>[\s\S]*<WorkSection \/>[\s\S]*<AboutSection \/>[\s\S]*<ResearchSection \/>[\s\S]*<EarlierSystemsSection \/>[\s\S]*<FieldNotesSection \/>/, 'The portfolio information order changed unexpectedly.')

const score = Math.max(0, 100 - findings.length * 10)
console.log(`Site coherence judge: ${score}/100 · ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
