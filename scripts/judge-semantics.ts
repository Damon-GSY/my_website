import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const layout = readFileSync(resolve(root, 'app/layout.tsx'), 'utf8')
const workPage = readFileSync(resolve(root, 'app/work/[slug]/page.tsx'), 'utf8')
const notePage = readFileSync(resolve(root, 'app/notes/[slug]/page.tsx'), 'utf8')
const metadataSource = readFileSync(resolve(root, 'lib/metadata.ts'), 'utf8')
const findings: string[] = []

function requirePattern(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) findings.push(message)
}

requirePattern(layout, /'@id':\s*`\$\{profile\.siteUrl\}\/#person`/, 'The Person entity has no stable @id.')
requirePattern(layout, /subjectOf:[\s\S]*'@type':\s*'ScholarlyArticle'/, 'Published research is not connected to the Person entity.')
requirePattern(workPage, /'@type':\s*'CreativeWork'/, 'Case-study routes do not expose CreativeWork structured data.')
requirePattern(notePage, /'@type':\s*'BlogPosting'/, 'Note routes do not expose BlogPosting structured data.')
requirePattern(metadataSource, /width:\s*1200[\s\S]*height:\s*630[\s\S]*profile\.name/, 'The shared personal image descriptor is incomplete.')
requirePattern(workPage, /import \{ socialImage \}[\s\S]*images:\s*\[socialImage\]/, 'Case-study sharing metadata loses the complete personal image descriptor.')
requirePattern(notePage, /import \{ socialImage \}[\s\S]*images:\s*\[socialImage\]/, 'Article sharing metadata loses the complete personal image descriptor.')

const builtWork = resolve(root, '.next/server/app/work/risk-router.html')
const builtNote = resolve(root, '.next/server/app/notes/why-agent-evaluation-is-hard.html')
if (existsSync(builtWork) && existsSync(builtNote)) {
  const workHtml = readFileSync(builtWork, 'utf8')
  const noteHtml = readFileSync(builtNote, 'utf8')
  if (!/property="og:image"/.test(workHtml)) findings.push('Built case-study HTML has no og:image.')
  if (!/name="twitter:image"/.test(workHtml)) findings.push('Built case-study HTML has no twitter:image.')
  if (!/property="og:image"/.test(noteHtml)) findings.push('Built article HTML has no og:image.')
  if (!/name="twitter:image"/.test(noteHtml)) findings.push('Built article HTML has no twitter:image.')
}

console.log(`Semantic identity judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
