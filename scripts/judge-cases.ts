import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { work } from '../lib/content.ts'

const root = process.cwd()
const page = readFileSync(resolve(root, 'app/work/[slug]/page.tsx'), 'utf8')
const styles = readFileSync(resolve(root, 'app/work/[slug]/case-study.module.css'), 'utf8')
const workSection = readFileSync(resolve(root, 'components/work-section.tsx'), 'utf8')
const header = readFileSync(resolve(root, 'components/site-header.tsx'), 'utf8')
const caseSignal = readFileSync(resolve(root, 'components/case-signal.tsx'), 'utf8')
const caseSignalStyles = readFileSync(resolve(root, 'components/case-signal.css'), 'utf8')

const failures: string[] = []

function requirePattern(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) failures.push(message)
}

if (work.length !== 4) failures.push(`Expected 4 structured projects, found ${work.length}.`)
for (const project of work) {
  const requiredText = [
    project.context,
    project.principle,
    project.ownership,
    project.constraintTitle,
    project.visualCaption,
    project.evidenceTitle,
    project.outcome.value,
    project.outcome.label,
    project.proof.baseline,
    project.proof.intervention,
    project.proof.result,
    project.proof.scope,
    project.proof.disclosure,
    project.relatedNote.href,
  ]
  if (requiredText.some((value) => value.trim().length === 0) || project.flow.length === 0) {
    failures.push(`${project.id} has an incomplete structured case-study contract.`)
  }
}

const toolResolver = work.find((project) => project.id === 'tool-resolver')
if (
  !toolResolver
  || toolResolver.outcome.value !== '≈90%'
  || toolResolver.outcome.label !== 'less manual ticket handling'
  || toolResolver.proof.evidenceType !== 'Internal operational measurement'
  || !toolResolver.proof.scope.includes('more than 100 internal tools')
) {
  failures.push('Tool outcome lacks an explicit reduction, approximate value, internal measurement type, or supported scope.')
}

const riskRouter = work.find((project) => project.id === 'risk-router')
if (
  !riskRouter
  || riskRouter.outcome.value !== '≈90%'
  || riskRouter.outcome.label !== 'fewer misoperations'
  || riskRouter.outcome.evidence !== '≈95% less manual intervention · <1s handoff · supported internal scope'
) {
  failures.push('Risk-router outcome no longer locks the approximate misoperation reduction, intervention reduction, or supported internal scope.')
}

const domainModel = work.find((project) => project.id === 'domain-model')
if (domainModel?.outcome.value !== 'Internal best' || domainModel?.proof.evidenceType !== 'Frozen internal benchmark') {
  failures.push('The domain model still implies public SOTA instead of a frozen internal comparison.')
}

const rewardSystem = work.find((project) => project.id === 'reward-system')
if (
  rewardSystem?.outcome.value !== 'Convergent'
  || rewardSystem?.proof.evidenceType !== 'Qualitative internal observation'
  || !rewardSystem?.proof.intervention.includes('zero-gradient filtering')
) {
  failures.push('Reward mechanisms are still presented as a quantitative outcome or omit the stabilizing intervention.')
}

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
requirePattern(styles, /@media \(max-width: 720px\)[\s\S]*\.evidenceOutcome strong\.outcomeWord\s*\{[^}]*max-width:\s*100%[^}]*font-size:\s*clamp\(2\.9rem, 15\.5vw, 5\.5rem\)[^}]*letter-spacing:\s*-0\.055em[^}]*overflow-wrap:\s*normal[^}]*word-break:\s*normal/s, 'Qualitative case outcomes can still break in the middle of a word on narrow screens.')
requirePattern(caseSignal, /Authority routing[\s\S]*OBSERVED STATE[\s\S]*RISK[\s\S]*CONSEQUENCE[\s\S]*human handoff/, 'Risk case visual does not communicate an explicit authority-routing decision path.')
requirePattern(caseSignal, /<SignalGraphic animated=\{animated\} type=\{type\} \/>/, 'One or more case visuals bypass the shared semantic SVG renderer or its shared motion state.')
if (/supply-chain-agent-trace-v1\.webp|case-signal__evidence-image/.test(caseSignal + caseSignalStyles)) {
  failures.push('Risk case still depends on the decorative raster pipe reconstruction.')
}

console.log(`Case-study judge: ${failures.length === 0 ? 'PASS' : 'FAIL'}`)
for (const failure of failures) console.log(`- ${failure}`)
if (failures.length > 0) process.exitCode = 1
