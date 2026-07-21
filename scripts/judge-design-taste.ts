import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const layout = readFileSync(resolve(root, 'app/layout.tsx'), 'utf8')
const globalCss = readFileSync(resolve(root, 'app/globals.css'), 'utf8')
const workLayoutCss = readFileSync(resolve(root, 'components/work-section-layout.css'), 'utf8')
const aboutCss = readFileSync(resolve(root, 'components/about-section.module.css'), 'utf8')
const caseSignal = readFileSync(resolve(root, 'components/case-signal.tsx'), 'utf8')
const hero = readFileSync(resolve(root, 'components/hero.tsx'), 'utf8')
const content = readFileSync(resolve(root, 'lib/content.ts'), 'utf8')
const source = `${layout}\n${globalCss}\n${workLayoutCss}\n${aboutCss}\n${caseSignal}\n${hero}\n${content}`
const findings: string[] = []

function requirePattern(input: string, pattern: RegExp, message: string) {
  if (!pattern.test(input)) findings.push(message)
}

function banPattern(input: string, pattern: RegExp, message: string) {
  if (pattern.test(input)) findings.push(message)
}

banPattern(
  source,
  /font-family\s*:[^;]*(?:Inter|Roboto|Arial|Helvetica|Open Sans)/i,
  'The interface falls back to a default AI/SaaS typography stack.',
)
banPattern(source, /#(?:3b82f6|6366f1|8b5cf6)/i, 'A generic blue/purple SaaS accent entered the palette.')
banPattern(
  content,
  /\b(?:elevate|seamless(?:ly)?|unlock|next[- ]gen|game[- ]changer|delve|revolutioniz(?:e|ing))\b/i,
  'Generic AI-marketing language replaced concrete personal evidence.',
)
banPattern(
  globalCss,
  /\.impact-strip\s*\{[^}]*grid-template-columns:\s*repeat\(4,/,
  'Production evidence is still four equal stat cards with no editorial hierarchy.',
)
banPattern(
  aboutCss,
  /\.principles\s*\{[^}]*grid-template-columns:\s*repeat\(3,/,
  'Working principles are still a generic equal-width three-card row.',
)
requirePattern(
  globalCss,
  /\.impact-strip\s*>\s*div:first-child[\s\S]*?grid-column:/,
  'The evidence band has no dominant result or asymmetric reading order.',
)
requirePattern(
  aboutCss,
  /\.principles\s+article:nth-child\(2\)[\s\S]*?\.principles\s+article:nth-child\(3\)/,
  'The principles do not use an authored editorial rhythm.',
)
requirePattern(
  workLayoutCss,
  /\.case-study--signature[\s\S]*?\.case-index__[\s\S]*?\.case-index__item/,
  'Selected work lacks a clear signature-case versus compact-index hierarchy.',
)
requirePattern(source, /cubic-bezier\(/, 'The motion language does not define a custom easing curve.')
requirePattern(
  hero,
  /<h1[\s\S]*profile\.name[\s\S]*Agent systems,[\s\S]*under control\./,
  'The first display headline sells a generic capability before it establishes Damon as the subject.',
)
for (const graphic of ['risk', 'tools', 'benchmark', 'reward']) {
  requirePattern(
    caseSignal,
    new RegExp(`case-signal__plot--${graphic}`),
    `The ${graphic} case still lacks a visual grammar specific to its system.`,
  )
}
banPattern(
  caseSignal,
  /<span\s*\/>\s*<span\s*\/>\s*<span\s*\/>\s*<span\s*\/>/,
  'All case visuals still reuse the same anonymous four-mark HUD.',
)

console.log(`Design anti-pattern judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
