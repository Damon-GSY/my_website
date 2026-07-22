import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const roots = ['app', 'components']
const cssFiles: string[] = []

function collectCss(directory: string) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) collectCss(path)
    else if (entry.name.endsWith('.css')) cssFiles.push(path)
  }
}

roots.forEach(collectCss)

const findings: string[] = []
const responsiveGridContracts = [
  {
    file: 'app/globals.css',
    pattern: /@media \(max-width: 720px\)[\s\S]*\.section-intro\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*\}[\s\S]*\.section-intro > \*\s*\{[^}]*min-width:\s*0/s,
    message: 'Mobile work headings can force the page wider than the viewport.',
  },
  {
    file: 'components/earlier-systems-section.module.css',
    pattern: /@media \(max-width: 720px\)[\s\S]*\.intro\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*\}[\s\S]*\.intro > \*\s*\{[^}]*min-width:\s*0/s,
    message: 'Mobile earlier-system headings can force the page wider than the viewport.',
  },
  {
    file: 'components/research-section.module.css',
    pattern: /@media \(max-width: 820px\), \(max-height: 700px\)[\s\S]*\.mobileRecord \.record > a\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*min-width:\s*0[^}]*\}[\s\S]*\.mobileRecord \.record > a > \*\s*\{[^}]*min-width:\s*0/s,
    message: 'Mobile research headings can force the page wider than the viewport.',
  },
  {
    file: 'components/about-section.module.css',
    pattern: /@media \(max-width: 720px\)[\s\S]*\.trajectoryHead\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^}]*\}[\s\S]*\.trajectoryHead > \*\s*\{[^}]*min-width:\s*0/s,
    message: 'Mobile trajectory headings can force the page wider than the viewport.',
  },
] as const

for (const file of cssFiles) {
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(/font-size:\s*(0?\.\d+)rem/g)) {
    const size = Number(match[1])
    if (size >= 0.6) continue
    const line = source.slice(0, match.index).split('\n').length
    findings.push(`${file}:${line} uses ${size}rem text below the evidence-legibility floor.`)
  }
}

for (const contract of responsiveGridContracts) {
  const source = readFileSync(contract.file, 'utf8')
  if (!contract.pattern.test(source)) findings.push(`${contract.file}: ${contract.message}`)
}

console.log(`Legibility judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
