import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const packageJson = readFileSync(resolve(root, 'package.json'), 'utf8')
const readme = readFileSync(resolve(root, 'README.md'), 'utf8')
const findings: string[] = []

function containsFiles(directory: string): boolean {
  return readdirSync(directory).some((entry) => {
    const path = resolve(directory, entry)
    return statSync(path).isDirectory() ? containsFiles(path) : true
  })
}

for (const legacy of ['components.json', 'vite.config.js', 'tailwind.config.js', 'index.html']) {
  if (existsSync(resolve(root, legacy))) findings.push(`Legacy entry/config remains: ${legacy}.`)
}

const legacyComponents = resolve(root, 'src/components')
if (existsSync(legacyComponents) && containsFiles(legacyComponents)) {
  findings.push('The unused Vite component tree remains beside the authoritative Next app.')
}

for (const dependency of ['clsx', 'tailwind-merge']) {
  if (new RegExp(`"${dependency}"`).test(packageJson)) findings.push(`Unused legacy dependency remains: ${dependency}.`)
}

if (!existsSync(resolve(root, 'app/page.tsx'))) findings.push('The authoritative Next app entry is missing.')
if (!existsSync(resolve(root, 'components/hero.tsx'))) findings.push('The authoritative component tree is missing.')
if (!/"dev":\s*"next dev --port 4175"/.test(packageJson)) findings.push('The documented review port is not the default development runtime.')
if (/React \+ Vite|npm run preview/.test(readme)) findings.push('README still documents the retired Vite runtime.')
if (!/Next\.js 15[\s\S]*Three\.js[\s\S]*4175/.test(readme)) findings.push('README does not document the authoritative Next/Three runtime and review port.')

console.log(`Single-entry architecture judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
