import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const page = readFileSync(resolve(root, 'app/page.tsx'), 'utf8')
const layout = readFileSync(resolve(root, 'app/layout.tsx'), 'utf8')
const header = readFileSync(resolve(root, 'components/site-header.tsx'), 'utf8')
const hero = readFileSync(resolve(root, 'components/hero.tsx'), 'utf8')
const scene = readFileSync(resolve(root, 'components/optimization-landscape-scene.tsx'), 'utf8')
const researchSection = readFileSync(resolve(root, 'components/research-section.tsx'), 'utf8')
const content = readFileSync(resolve(root, 'lib/content.ts'), 'utf8')
const css = readFileSync(resolve(root, 'app/globals.css'), 'utf8')
const ogPath = resolve(root, 'app/opengraph-image.tsx')

const findings: string[] = []

function requirePattern(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) findings.push(message)
}

function banPattern(source: string, pattern: RegExp, message: string) {
  if (pattern.test(source)) findings.push(message)
}

// Design — identity, composition, and consistent visual language.
if (!existsSync(ogPath)) {
  findings.push('No person-led social image exists; shared links still look like a generic AI landscape.')
} else {
  const og = readFileSync(ogPath, 'utf8')
  requirePattern(og, /profile\.name/, 'The social image omits Damon’s display name.')
  requirePattern(og, /profile\.role/, 'The social image omits Damon’s role.')
  requirePattern(og, /profile\.location/, 'The social image omits Damon’s location.')
}
requirePattern(page, /<WorkSection \/>[\s\S]*<AboutSection \/>/, 'The personal identity does not follow the selected-work hook.')

// Usability — orientation, access, motion preferences, and mobile behavior.
requirePattern(page, /className="skip-link"/, 'The homepage has no keyboard skip link.')
requirePattern(header, /aria-current=\{activeSection/, 'Primary navigation does not expose the current chapter.')
requirePattern(css, /@media \(prefers-reduced-motion: reduce\)/, 'Motion has no reduced-motion contract.')
requirePattern(css, /@media \(max-width: 720px\)/, 'The mobile layout contract is missing.')

// Creativity — a real spatial idea, not a decorative background.
requirePattern(scene, /cameraRail\.getPointAt/, 'The hero does not move through a curved 3D camera rail.')
requirePattern(scene, /function SpatialContours/, 'The optimization landscape has no real spatial contour field.')
requirePattern(hero, /heroChapters\.map[\s\S]*<HeroChapter/, 'The 3D experience has no data-driven personal narrative stages.')
requirePattern(content, /Production engineer[\s\S]*Researcher[\s\S]*Creator/, 'The hero chapters do not present Damon as an engineer, researcher, and creator.')

// Content — every public research claim needs provenance and Damon’s role.
for (const field of ['href', 'venue', 'year', 'authorship']) {
  const count = content.match(new RegExp(`${field}:`, 'g'))?.length ?? 0
  if (count < 3) findings.push(`Research records expose ${count}/3 ${field} fields.`)
}
requirePattern(researchSection, /href=\{paper\.href\}/, 'Research titles do not link to a primary paper source.')
requirePattern(researchSection, /paper\.authorship/, 'The page does not explain Damon’s authorship on each paper.')
requirePattern(researchSection, /paper\.venue[\s\S]*paper\.year/, 'The page omits publication venue or year.')
requirePattern(researchSection, /profile\.legalName/, 'The page does not connect Damon’s public identity to his publication name.')
banPattern(layout, /optimization-landscape-1920\.webp[\s\S]*twitter/s, 'The root social metadata still uses a generic landscape instead of the personal card.')
banPattern(header, />\s*Available\s*</, 'Navigation makes an unverified availability claim.')
banPattern(css, /#8da982|rgba\(141,\s*169,\s*130/, 'A second green accent breaks the terracotta identity system.')

console.log(`Static Awwwards criteria checklist: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
