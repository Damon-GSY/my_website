import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const appOutput = resolve(root, '.next/server/app')
const findings: string[] = []

function collectHtml(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = resolve(directory, entry)
    return statSync(path).isDirectory() ? collectHtml(path) : path.endsWith('.html') ? [path] : []
  })
}

if (!existsSync(appOutput)) {
  findings.push('Production HTML is missing; run npm run build before this judge.')
} else {
  for (const file of collectHtml(appOutput)) {
    const relative = file.slice(appOutput.length) || '/index.html'
    const html = readFileSync(file, 'utf8')
    if (!/<html lang="en"/.test(html)) findings.push(`${relative}: document language is missing.`)

    const headings = [...html.matchAll(/<h([1-6])(?:\s[^>]*)?>/g)].map((match) => Number(match[1]))
    const h1Count = headings.filter((level) => level === 1).length
    if (h1Count !== 1) findings.push(`${relative}: expected one H1, found ${h1Count}.`)
    for (let index = 1; index < headings.length; index += 1) {
      if (headings[index] > headings[index - 1] + 1) {
        findings.push(`${relative}: heading level jumps H${headings[index - 1]} → H${headings[index]}.`)
      }
    }

    for (const match of html.matchAll(/<a class="skip-link" href="#([^"]+)"/g)) {
      if (!new RegExp(`id="${match[1]}"`).test(html)) findings.push(`${relative}: skip link target #${match[1]} is missing.`)
    }

    for (const match of html.matchAll(/<a[^>]*target="_blank"[^>]*>/g)) {
      if (!/rel="[^"]*noreferrer[^"]*"/.test(match[0])) findings.push(`${relative}: external link lacks noreferrer.`)
    }
  }
}

console.log(`Built accessibility judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
