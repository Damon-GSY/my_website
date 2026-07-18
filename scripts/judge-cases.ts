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
if (contextCount !== 4) failures.push(`Expected 4 project contexts, found ${contextCount}.`)
if (principleCount !== 4) failures.push(`Expected 4 project principles, found ${principleCount}.`)
if (ownershipCount !== 4) failures.push(`Expected 4 personal ownership records, found ${ownershipCount}.`)
if (flowCount !== 4) failures.push(`Expected 4 system traces, found ${flowCount}.`)

requirePattern(page, /generateStaticParams/, 'Case-study routes are not statically generated.')
requirePattern(page, /generateMetadata/, 'Case-study routes have no project metadata.')
requirePattern(page, /notFound\(\)/, 'Unknown project slugs do not reach the branded 404.')
requirePattern(page, /project\.context[\s\S]*project\.principle[\s\S]*project\.details\.map/, 'Case studies do not expose context, principle, and design decisions.')
requirePattern(page, /project\.ownership[\s\S]*project\.flow\.map/, 'Case studies do not show what Damon personally owned or how the system moves.')
requirePattern(page, /project\.result[\s\S]*project\.secondary/, 'Case studies do not expose outcome evidence.')
requirePattern(page, /nextProject[\s\S]*Next case/, 'Case studies end without a next-project route.')
requirePattern(workSection, /href=\{`\/work\/\$\{project\.id\}`\}/, 'Homepage projects do not link to their case studies.')
requirePattern(header, /id: 'work'[^\n]*routePrefix: '\/work\/'[\s\S]*routeItem[\s\S]*setActiveSection\(routeItem\.id\)/, 'Global navigation does not mark project routes as work.')
requirePattern(header, /homeAnchor/, 'Global navigation does not return project routes to homepage sections.')
requirePattern(styles, /@media \(max-width: 720px\)/, 'Case studies have no mobile layout contract.')
requirePattern(styles, /min-height:\s*100dvh/, 'Case-study hero does not use the dynamic viewport contract.')

console.log(`Case-study judge: ${failures.length === 0 ? 'PASS' : 'FAIL'}`)
for (const failure of failures) console.log(`- ${failure}`)
if (failures.length > 0) process.exitCode = 1
