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

function value(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1] ?? ''
}

if (!existsSync(appOutput)) {
  findings.push('Production HTML is missing; run npm run build before this judge.')
} else {
  for (const file of collectHtml(appOutput)) {
    const relative = file.slice(appOutput.length) || '/index.html'
    if (relative === '/_not-found.html') continue

    const html = readFileSync(file, 'utf8')
    const title = value(html, /<title>([^<]+)<\/title>/)
    const canonical = value(html, /<link rel="canonical" href="([^"]+)"/)
    const ogTitle = value(html, /<meta property="og:title" content="([^"]+)"/)
    const twitterTitle = value(html, /<meta name="twitter:title" content="([^"]+)"/)
    const ogImage = value(html, /<meta property="og:image" content="([^"]+)"/)
    const twitterImage = value(html, /<meta name="twitter:image" content="([^"]+)"/)

    if (!title) findings.push(`${relative}: missing title.`)
    if (!canonical) findings.push(`${relative}: missing canonical URL.`)
    if (title !== ogTitle) findings.push(`${relative}: OpenGraph title does not match the document title.`)
    if (title !== twitterTitle) findings.push(`${relative}: Twitter title does not match the document title.`)
    if (!ogImage) findings.push(`${relative}: missing OpenGraph image.`)
    if (!twitterImage) findings.push(`${relative}: missing Twitter image.`)
  }
}

console.log(`Built metadata judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
