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
for (const file of cssFiles) {
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(/font-size:\s*(0?\.\d+)rem/g)) {
    const size = Number(match[1])
    if (size >= 0.6) continue
    const line = source.slice(0, match.index).split('\n').length
    findings.push(`${file}:${line} uses ${size}rem text below the evidence-legibility floor.`)
  }
}

console.log(`Legibility judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
