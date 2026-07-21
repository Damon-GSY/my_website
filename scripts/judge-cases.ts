import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const content = readFileSync(resolve(root, 'lib/content.ts'), 'utf8')
const page = readFileSync(resolve(root, 'app/work/[slug]/page.tsx'), 'utf8')
const styles = readFileSync(resolve(root, 'app/work/[slug]/case-study.module.css'), 'utf8')
const workSection = readFileSync(resolve(root, 'components/work-section.tsx'), 'utf8')
const header = readFileSync(resolve(root, 'components/site-header.tsx'), 'utf8')

const failures: string[] = []

function requirePattern(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) failures.push(message)
}

const contextCount = content.match(/\n\s+context:/g)?.length ?? 0
const principleCount = content.match(/\n\s+principle:/g)?.length ?? 0
const ownershipCount = content.match(/\n\s+ownership:/g)?.length ?? 0
const flowCount = content.match(/\n\s+flow:/g)?.length ?? 0
const workBlock = content.slice(content.indexOf('export const work'), content.indexOf('export const research'))
const outcomeCount = workBlock.match(/\n\s+outcome:/g)?.length ?? 0
const proofCount = workBlock.match(/\n\s+proof:/g)?.length ?? 0
const constraintTitleCount = workBlock.match(/\n\s+constraintTitle:/g)?.length ?? 0
const visualCaptionCount = workBlock.match(/\n\s+visualCaption:/g)?.length ?? 0
const evidenceTitleCount = workBlock.match(/\n\s+evidenceTitle:/g)?.length ?? 0
const relatedNoteCount = workBlock.match(/\n\s+relatedNote:/g)?.length ?? 0
if (contextCount !== 4) failures.push(`Expected 4 project contexts, found ${contextCount}.`)
if (principleCount !== 4) failures.push(`Expected 4 project principles, found ${principleCount}.`)
if (ownershipCount !== 4) failures.push(`Expected 4 personal ownership records, found ${ownershipCount}.`)
if (flowCount !== 4) failures.push(`Expected 4 system traces, found ${flowCount}.`)
if (outcomeCount !== 4) failures.push(`Expected 4 structured project outcomes, found ${outcomeCount}.`)
if (proofCount !== 4) failures.push(`Expected 4 evidence protocols, found ${proofCount}.`)
if (constraintTitleCount !== 4) failures.push(`Expected 4 project-specific constraint titles, found ${constraintTitleCount}.`)
if (visualCaptionCount !== 4) failures.push(`Expected 4 project-specific visual captions, found ${visualCaptionCount}.`)
if (evidenceTitleCount !== 4) failures.push(`Expected 4 project-specific evidence titles, found ${evidenceTitleCount}.`)
if (relatedNoteCount !== 4) failures.push(`Expected 4 public reasoning links from confidential case studies, found ${relatedNoteCount}.`)

requirePattern(workBlock, /id: 'tool-resolver'[\s\S]*value: '≈90%'[\s\S]*label: 'manual ticket handling'[\s\S]*Internal operational measurement[\s\S]*100 internal tools/, 'Tool outcome lacks an approximate value, internal measurement type, or supported scope.')
requirePattern(workBlock, /id: 'domain-model'[\s\S]*value: 'Internal best'[\s\S]*Frozen internal benchmark/, 'The domain model still implies public SOTA instead of a frozen internal comparison.')
requirePattern(workBlock, /id: 'reward-system'[\s\S]*value: 'Convergent'[\s\S]*Qualitative internal observation[\s\S]*zero-gradient filtering/, 'Reward mechanisms are still presented as a quantitative outcome.')

requirePattern(page, /generateStaticParams/, 'Case-study routes are not statically generated.')
requirePattern(page, /generateMetadata/, 'Case-study routes have no project metadata.')
requirePattern(page, /notFound\(\)/, 'Unknown project slugs do not reach the branded 404.')
requirePattern(page, /project\.context[\s\S]*project\.principle[\s\S]*project\.details\.map/, 'Case studies do not expose context, principle, and design decisions.')
requirePattern(page, /project\.visualCaption[\s\S]*project\.constraintTitle[\s\S]*project\.evidenceTitle/, 'Case-study chapters still reuse generic template language.')
requirePattern(page, /project\.ownership[\s\S]*project\.flow\.map/, 'Case studies do not show what Damon personally owned or how the system moves.')
requirePattern(page, /project\.outcome\.value[\s\S]*project\.outcome\.label[\s\S]*project\.outcome\.evidence/, 'Case studies do not expose structured outcome evidence.')
requirePattern(page, /project\.proof\.baseline[\s\S]*project\.proof\.intervention[\s\S]*project\.proof\.result[\s\S]*project\.proof\.scope[\s\S]*project\.proof\.disclosure/, 'Case studies do not explain baseline, intervention, result, scope, and disclosure.')
requirePattern(page, /From Damon[\s\S]*project\.relatedNote\.href[\s\S]*project\.relatedNote\.label/, 'Confidential case studies do not connect to Damon’s public reasoning record.')
requirePattern(page, /project\.outcome\.value\.length > 4[\s\S]*styles\.outcomeWord/, 'Long qualitative outcomes have no overflow-safe typographic treatment.')
requirePattern(page, /nextProject[\s\S]*Next case/, 'Case studies end without a next-project route.')
requirePattern(workSection, /href=\{`\/work\/\$\{project\.id\}`\}/, 'Homepage projects do not link to their case studies.')
requirePattern(header, /id: 'work'[^\n]*routePrefix: '\/work\/'[\s\S]*routeItem[\s\S]*setActiveSection\(routeItem\.id\)/, 'Global navigation does not mark project routes as work.')
requirePattern(header, /homeAnchor/, 'Global navigation does not return project routes to homepage sections.')
requirePattern(styles, /@media \(max-width: 720px\)/, 'Case studies have no mobile layout contract.')
requirePattern(styles, /min-height:\s*100dvh/, 'Case-study hero does not use the dynamic viewport contract.')

console.log(`Case-study judge: ${failures.length === 0 ? 'PASS' : 'FAIL'}`)
for (const failure of failures) console.log(`- ${failure}`)
if (failures.length > 0) process.exitCode = 1
