import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const header = readFileSync(resolve(root, 'components/site-header.tsx'), 'utf8')
const page = readFileSync(resolve(root, 'app/page.tsx'), 'utf8')
const css = readFileSync(resolve(root, 'app/globals.css'), 'utf8')

const failures: string[] = []

function requirePattern(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) failures.push(message)
}

requirePattern(header, /aria-expanded=\{menuOpen\}[\s\S]*aria-controls="mobile-navigation"/, 'Mobile menu trigger does not expose state or ownership.')
requirePattern(header, /role="dialog"[\s\S]*aria-modal="true"[\s\S]*aria-hidden=\{!menuOpen\}/, 'Mobile menu overlay has no accessible dialog contract.')
requirePattern(header, /event\.key === 'Escape'[\s\S]*setMenuOpen\(false\)/, 'Mobile menu cannot be closed with Escape.')
requirePattern(header, /document\.body\.style\.overflow = 'hidden'/, 'Open mobile navigation does not lock background scrolling.')
requirePattern(header, /matchMedia\('\(min-width: 721px\)'\)[\s\S]*event\.matches[\s\S]*setMenuOpen\(false\)/, 'Crossing to the desktop breakpoint can leave the page scroll-locked behind a hidden mobile menu.')
requirePattern(header, /tabIndex=\{menuOpen \? 0 : -1\}/, 'Closed mobile navigation leaves hidden links in the tab order.')
requirePattern(header, /event\.key === 'Tab'[\s\S]*focusables[\s\S]*\.focus\(\)/, 'Modal navigation does not trap keyboard focus.')
requirePattern(header, /const toggle = toggleRef\.current[\s\S]*toggle\?\.isConnected[\s\S]*toggle\.focus\(\{ preventScroll: true \}\)/, 'Closing the modal navigation does not safely restore trigger focus.')
requirePattern(header, /const navItems = \[[\s\S]*\] as const/, 'Navigation sections have no single typed source of truth.')
requirePattern(header, /if \(routeItem\)[\s\S]*return[\s\S]*setActiveSection\(''\)[\s\S]*new IntersectionObserver/, 'Returning to the homepage can leave a detail-route navigation item active.')
const navMapCount = header.match(/navItems\s*\.map/g)?.length ?? 0
if (navMapCount < 3) failures.push('Scroll observation, desktop links, and mobile links do not derive from the same navigation model.')

const navModel = header.match(/const navItems = \[([\s\S]*?)\] as const/)?.[1] ?? ''
const navIds = [...navModel.matchAll(/id: '([^']+)'/g)].map((match) => match[1])
const sectionIdByComponent: Record<string, string> = {
  WorkSection: 'work',
  ResearchSection: 'research',
  FieldNotesSection: 'notes',
  AboutSection: 'about',
}
const mainSource = page.match(/<main>([\s\S]*?)<\/main>/)?.[1] ?? ''
const documentSectionIds = [...mainSource.matchAll(/<([A-Z][A-Za-z]+) \/>/g)]
  .map((match) => sectionIdByComponent[match[1]])
  .filter((id): id is string => Boolean(id))

if (JSON.stringify(navIds) !== JSON.stringify(documentSectionIds)) {
  failures.push(`Navigation order (${navIds.join(' → ')}) does not match document order (${documentSectionIds.join(' → ')}).`)
}

for (const section of ['work', 'research', 'notes', 'about']) {
  requirePattern(header, new RegExp(`#${section}`), `Mobile or desktop navigation is missing ${section}.`)
}

requirePattern(css, /@media \(max-width: 720px\)[\s\S]*\.site-menu-toggle[\s\S]*\.site-mobile-menu\.is-open/s, 'Mobile navigation has no small-screen visual state.')
requirePattern(css, /\.site-menu-toggle\.is-open span:first-child[\s\S]*rotate\(45deg\)/, 'Menu trigger does not morph into a close control.')
requirePattern(css, /env\(safe-area-inset-top\)[\s\S]*env\(safe-area-inset-bottom\)/, 'Mobile navigation ignores device safe areas.')

console.log(`Navigation judge: ${failures.length === 0 ? 'PASS' : 'FAIL'}`)
for (const failure of failures) console.log(`- ${failure}`)
if (failures.length > 0) process.exitCode = 1
