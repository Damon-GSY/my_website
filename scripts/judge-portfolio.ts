import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { education, experience, heroChapters, notes, profile, research, signals, work } from '../lib/content.ts'

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
if (heroChapters.length < 3) failures.push(`Expected three distinct personal identities in the scroll story, found ${heroChapters.length}.`)
const researchProof = profile.heroProofs.find(([label]) => label === 'Research')
if (researchProof?.[1] !== '2 first-author works · ACL Findings + arXiv survey') {
  failures.push('The hero no longer states Damon’s two first-author works and their verified publication venues.')
}
if (heroChapters[0]?.evidence !== '12 scenarios · 100+ tools · <1s handoff · internal scope') {
  failures.push('The hero production evidence no longer discloses that its operational metrics have internal scope.')
}
const toolSignal = signals.find((signal) => signal.value === '≈90%')
if (toolSignal?.label !== 'manual ticket handling reduction · supported internal workflows') {
  failures.push('The hero tool-resolution signal no longer discloses its supported internal workflow scope.')
}
requirePattern(files.work, /signatureProject[\s\S]*projectIndex\.map[\s\S]*\/work\/\$\{project\.id\}/, 'Selected work does not distinguish the signature case or lead to project evidence.')
requirePattern(files.page, /<Hero \/>[\s\S]*<WorkSection \/>[\s\S]*<ResearchSection \/>[\s\S]*<FieldNotesSection \/>[\s\S]*<AboutSection \/>[\s\S]*<EarlierSystemsSection \/>/, 'The homepage does not move from selected work and research evidence into writing, biography, and earlier systems.')
requirePattern(files.earlier, /earlierSystems\.map[\s\S]*entry\.place[\s\S]*entry\.highlights\.map/, 'Earlier systems are not derived from the evidenced career record.')
requirePattern(files.casePage, /project\.context[\s\S]*project\.principle[\s\S]*project\.details/, 'Case studies lack context and design rationale.')
requirePattern(files.research, /paper\.description[\s\S]*paper\.topics[\s\S]*paper\.metric/, 'Research lacks method, dimensions, or evidence.')
requirePattern(files.notes, /featured\.title[\s\S]*latest\.map[\s\S]*\/notes/, 'Personal writing is absent from the homepage narrative.')
requirePattern(files.about, /profile\.name[\s\S]*profile\.bio[\s\S]*profile\.principles[\s\S]*profile\.facts[\s\S]*education\.map/, 'Biography lacks a dominant identity, working philosophy, or academic foundation.')
requirePattern(files.about, /education\.map\(\(entry\)[\s\S]*entry\.highlights\.map/, 'Academic history is compressed into school names without personal evidence.')
requirePattern(files.about, /trajectory\.map\(\(stop\)[\s\S]*stop\.city[\s\S]*stop\.evidence/, 'The biography lacks a continuous, evidence-led personal trajectory.')
banPattern(files.about, /experience\.map/, 'The biography repeats the complete career archive already shown through Work and Earlier Systems.')
requirePattern(files.about, /socials\.map/, 'Biography hides the creator channels that make the portfolio personal.')
requirePattern(files.about, /<BlurText[\s\S]*profile\.name/, 'React Bits motion is not integrated into the personal identity moment.')
requirePattern(files.footer, /profile\.reachOutFor\.map[\s\S]*mailto:[\s\S]*socials\.map/, 'The site has no evidence-led collaboration fit or complete contact path.')
if (!profile.bio.trim()) failures.push('Identity data lacks a personal biography.')
if (profile.principles.length === 0) failures.push('Identity data lacks working principles.')
if (!profile.creatorLine.trim()) failures.push('Identity data hides the creator practice.')
const publicWorkProof = profile.heroProofs.find(([label]) => label === 'Public work')
if (publicWorkProof?.[1] !== '7 field notes · research-linked essays' || notes.length !== 7) {
  failures.push('Creator proof is not grounded in the public writing actually available on the site.')
}
const supChainResearch = research.find((paper) => paper.index === 'R/02')
if (!supChainResearch?.description.includes('Hundreds of annotated benchmark instances')) {
  failures.push('SupChain-Bench evidence is missing from the personal narrative.')
}
const expectedReachOutFor = [
  'Production agent evaluation',
  'Post-training & reward systems',
  'Tool-use reliability',
  'Research collaboration & technical exchange',
]
if (JSON.stringify(profile.reachOutFor) !== JSON.stringify(expectedReachOutFor)) {
  failures.push(`Expected exactly four evidence-led collaboration reasons, found ${profile.reachOutFor.length}.`)
}
const evidenceData = JSON.stringify({ profile, heroChapters, signals, work, research, notes })
banPattern(evidenceData, /\b530\b/, 'An unsupported exact SupChain-Bench sample count remains in the hero, research, or notes narrative.')
banPattern(`${profile.reachOutFor.join('\n')}\n${files.footer}`, /\bavailab(?:le|ility)\b|\bopen(?:[\s-]+)(?:to|for)(?:[\s-]+)work\b/i, 'The contact narrative makes an unverified availability claim.')
if (experience.length < 8 || experience.some((entry) => entry.highlights.length === 0)) {
  failures.push(`Expected at least 8 evidenced trajectory records, found ${experience.length}.`)
}
const educationEvidence = education.flatMap((entry) => entry.highlights).join('\n')
if (!educationEvidence.includes('4.0 / 5.0 GPA') || !educationEvidence.includes('85/100 GPA')) {
  failures.push('NUS or UNSW academic evidence from main is compressed out of the public trajectory.')
}
banPattern(evidenceData, /QS global #/, 'Undated university rankings are presented as current personal evidence.')

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
