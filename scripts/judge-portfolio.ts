import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const files = {
  page: readFileSync(resolve(root, 'app/page.tsx'), 'utf8'),
  layout: readFileSync(resolve(root, 'app/layout.tsx'), 'utf8'),
  global: readFileSync(resolve(root, 'app/globals.css'), 'utf8'),
  hero: readFileSync(resolve(root, 'components/hero.tsx'), 'utf8'),
  work: readFileSync(resolve(root, 'components/work-section.tsx'), 'utf8'),
  earlier: readFileSync(resolve(root, 'components/earlier-systems-section.tsx'), 'utf8'),
  research: readFileSync(resolve(root, 'components/research-section.tsx'), 'utf8'),
  notes: readFileSync(resolve(root, 'components/field-notes-section.tsx'), 'utf8'),
  about: readFileSync(resolve(root, 'components/about-section.tsx'), 'utf8'),
  footer: readFileSync(resolve(root, 'components/site-footer.tsx'), 'utf8'),
  header: readFileSync(resolve(root, 'components/site-header.tsx'), 'utf8'),
  casePage: readFileSync(resolve(root, 'app/work/[slug]/page.tsx'), 'utf8'),
  caseCss: readFileSync(resolve(root, 'app/work/[slug]/case-study.module.css'), 'utf8'),
  content: readFileSync(resolve(root, 'lib/content.ts'), 'utf8'),
  packageJson: readFileSync(resolve(root, 'package.json'), 'utf8'),
  favicon: readFileSync(resolve(root, 'public/favicon.svg'), 'utf8'),
  og: existsSync(resolve(root, 'app/opengraph-image.tsx'))
    ? readFileSync(resolve(root, 'app/opengraph-image.tsx'), 'utf8')
    : '',
  reactBits: existsSync(resolve(root, 'components/ui/blur-text.tsx'))
    ? readFileSync(resolve(root, 'components/ui/blur-text.tsx'), 'utf8')
    : '',
}

const failures: string[] = []

function requirePattern(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) failures.push(message)
}

function banPattern(source: string, pattern: RegExp, message: string) {
  if (pattern.test(source)) failures.push(message)
}

requirePattern(files.hero, /profile\.name[\s\S]*profile\.role[\s\S]*profile\.thesis/, 'Above-the-fold identity or point of view is incomplete.')
requirePattern(files.hero, /heroChapters\.map/, 'The scroll story does not derive its identity chapters from content.')
requirePattern(files.page, /<Hero \/>[\s\S]*<WorkSection \/>/, 'The 3D hook does not resolve directly into selected work.')
requirePattern(files.hero, /profile\.heroProofs\.map/, 'The hero lacks concise profile evidence above the fold.')
requirePattern(files.hero, /chapter\.evidence/, 'The scroll story lacks evidence for Damon’s three identities.')
const heroChapterCount = files.content.match(/index: '0\d \/[^']+'/g)?.length ?? 0
if (heroChapterCount < 3) failures.push(`Expected three distinct personal identities in the scroll story, found ${heroChapterCount}.`)
requirePattern(files.work, /work\.map[\s\S]*\/work\/\$\{project\.id\}/, 'Selected work does not lead to project evidence.')
requirePattern(files.page, /<WorkSection \/>[\s\S]*<EarlierSystemsSection \/>[\s\S]*<ResearchSection \/>/, 'Earlier systems do not broaden the all-Alibaba flagship sequence before research.')
requirePattern(files.earlier, /earlierSystems\.map[\s\S]*entry\.place[\s\S]*entry\.highlights\.map/, 'Earlier systems are not derived from the evidenced career record.')
requirePattern(files.casePage, /project\.context[\s\S]*project\.principle[\s\S]*project\.details/, 'Case studies lack context and design rationale.')
requirePattern(files.research, /paper\.description[\s\S]*paper\.topics[\s\S]*paper\.metric/, 'Research lacks method, dimensions, or evidence.')
requirePattern(files.notes, /featured\.title[\s\S]*latest\.map[\s\S]*\/notes/, 'Personal writing is absent from the homepage narrative.')
requirePattern(files.about, /profile\.name[\s\S]*profile\.bio[\s\S]*profile\.principles[\s\S]*profile\.facts[\s\S]*experience\.map/, 'Biography lacks a dominant identity, working philosophy, or trajectory.')
requirePattern(files.about, /experience\.map\(\(entry\)[\s\S]*entry\.highlights\.map/, 'Career history is compressed into titles without personal evidence.')
requirePattern(files.about, /socials\.map/, 'Biography hides the creator channels that make the portfolio personal.')
requirePattern(files.about, /<BlurText[\s\S]*profile\.name/, 'React Bits motion is not integrated into the personal identity moment.')
requirePattern(files.footer, /mailto:[\s\S]*socials\.map/, 'The site has no complete contact path.')
requirePattern(files.content, /bio:/, 'Identity data lacks a personal biography.')
requirePattern(files.content, /principles:/, 'Identity data lacks working principles.')
requirePattern(files.content, /creatorLine:/, 'Identity data hides the creator practice.')
requirePattern(files.content, /530 real-world samples/, 'SupChain-Bench evidence from main is missing from the personal narrative.')
const experienceEvidenceCount = files.content.match(/\n\s+highlights:/g)?.length ?? 0
if (experienceEvidenceCount < 8) failures.push(`Expected at least 8 evidenced trajectory records, found ${experienceEvidenceCount}.`)
requirePattern(files.content, /4\.0 \/ 5\.0 GPA[\s\S]*85\/100 GPA/, 'NUS or UNSW academic evidence from main is compressed out of the public trajectory.')
banPattern(files.content, /QS global #/, 'Undated university rankings are presented as current personal evidence.')

requirePattern(files.global, /\.site-header\s*\{[^}]*top:\s*0\.75rem[^}]*right:\s*var\(--gutter\)[^}]*left:\s*var\(--gutter\)/s, 'Navigation is not detached from the viewport edges.')
requirePattern(files.caseCss, /animation-timeline:\s*view\(\)/, 'Case-study chapters have no scroll-entry choreography.')
requirePattern(files.global, /@media \(prefers-reduced-motion: reduce\)/, 'Motion has no reduced-motion contract.')
requirePattern(files.global, /:focus-visible/, 'Keyboard focus styling is missing.')
requirePattern(files.page, /className="skip-link"/, 'Homepage skip navigation is missing.')
requirePattern(files.casePage, /className="skip-link"/, 'Case-study skip navigation is missing.')
requirePattern(files.header, /aria-current/, 'Primary navigation does not expose current location.')
requirePattern(files.header, /aria-expanded=\{menuOpen\}[\s\S]*role="dialog"/, 'Small screens have no complete navigation path.')

requirePattern(files.layout, /openGraph:[\s\S]*twitter:/, 'Social sharing metadata is incomplete.')
requirePattern(files.og, /ImageResponse[\s\S]*profile\.name[\s\S]*profile\.role/, 'The file-based social image is missing or not person-led.')
requirePattern(files.layout, /icons:[\s\S]*favicon\.svg/, 'The personal identity mark is not registered as the site icon.')
requirePattern(files.favicon, /#d97757/, 'The favicon does not belong to the terracotta identity system.')
requirePattern(files.reactBits, /React Bits[\s\S]*useReducedMotion[\s\S]*initial=\{reduceMotion \? false/, 'The adapted React Bits component lacks provenance or a real reduced-motion bypass.')
if (!existsSync(resolve(root, 'app/sitemap.ts'))) failures.push('Sitemap is missing.')
if (!existsSync(resolve(root, 'app/robots.ts'))) failures.push('Robots policy is missing.')
if (!existsSync(resolve(root, 'app/not-found.tsx'))) failures.push('Branded 404 is missing.')

banPattern(files.packageJson, /"gsap"|"@gsap\/react"/, 'A second motion engine increases runtime and choreography drift.')
banPattern(files.global, /font-family:[^;]*(?:Inter|Roboto|Arial|Helvetica)/i, 'The visual system uses a generic banned typeface.')
banPattern(files.favicon, /#863bff|#7e14ff/i, 'The legacy purple product icon is still present.')
banPattern(Object.values(files).join('\n'), /href=["']#["']/, 'A dead placeholder link remains.')

const score = Math.max(0, 100 - failures.length * 5)
console.log(`Portfolio quality judge: ${score}/100 · ${failures.length === 0 ? 'PASS' : 'FAIL'}`)
for (const failure of failures) console.log(`- ${failure}`)
if (failures.length > 0) process.exitCode = 1
