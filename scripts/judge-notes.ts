import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const content = readFileSync(resolve(root, 'lib/content.ts'), 'utf8')
const homepage = readFileSync(resolve(root, 'components/field-notes-section.tsx'), 'utf8')
const index = readFileSync(resolve(root, 'app/notes/page.tsx'), 'utf8')
const article = readFileSync(resolve(root, 'app/notes/[slug]/page.tsx'), 'utf8')
const styles = readFileSync(resolve(root, 'app/notes/notes.module.css'), 'utf8')
const header = readFileSync(resolve(root, 'components/site-header.tsx'), 'utf8')
const sitemap = readFileSync(resolve(root, 'app/sitemap.ts'), 'utf8')

const failures: string[] = []

function requirePattern(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) failures.push(message)
}

function banPattern(source: string, pattern: RegExp, message: string) {
  if (pattern.test(source)) failures.push(message)
}

const notesBlock = content.slice(content.indexOf('export const notes'), content.indexOf('export const experience'))
const noteCount = notesBlock.match(/\n\s+slug:/g)?.length ?? 0
if (noteCount !== 7) failures.push(`Expected 7 field notes from main, found ${noteCount}.`)

requirePattern(notesBlock, /intro:[\s\S]*sections:[\s\S]*title:[\s\S]*body:/, 'Notes are not stored as structured, readable content.')
banPattern(
  article,
  /<article[^>]*dangerouslySetInnerHTML|<section[^>]*dangerouslySetInnerHTML|<p[^>]*dangerouslySetInnerHTML/,
  'Article rendering bypasses React content safety.',
)
requirePattern(
  article,
  /type="application\/ld\+json"[\s\S]*dangerouslySetInnerHTML=\{\{ __html: JSON\.stringify\(articleSchema\)\.replace\(\/<\/g,/,
  'Article schema is missing or is injected without escaping opening angle brackets.',
)
requirePattern(homepage, /notes\.slice\(0, 4\)[\s\S]*Browse all/, 'Homepage notes do not provide a focused preview and full index path.')
requirePattern(index, /notes\.map[\s\S]*\/notes\/\$\{note\.slug\}/, 'The full notes index is incomplete.')
requirePattern(article, /generateStaticParams[\s\S]*generateMetadata[\s\S]*notFound\(\)/, 'Article routes lack static generation, metadata, or 404 handling.')
requirePattern(article, /note\.intro[\s\S]*note\.sections\.map[\s\S]*nextNote/, 'Article pages lack body structure or reading continuity.')
requirePattern(header, /id: 'notes'[^\n]*href: '#notes'[^\n]*routePrefix: '\/notes'[\s\S]*routeItem[\s\S]*setActiveSection\(routeItem\.id\)/, 'Global navigation does not adapt to Notes routes.')
requirePattern(sitemap, /notes\.map[\s\S]*note\.slug/, 'Article routes are absent from the sitemap.')
requirePattern(styles, /@media \(max-width: 640px\)/, 'Notes have no small-screen reading contract.')
requirePattern(styles, /animation-timeline:\s*view\(\)/, 'Long-form reading has no restrained entry choreography.')

console.log(`Field-notes judge: ${failures.length === 0 ? 'PASS' : 'FAIL'}`)
for (const failure of failures) console.log(`- ${failure}`)
if (failures.length > 0) process.exitCode = 1
