import assert from 'node:assert/strict'

type Header = { key: string; value: string }
type HeaderRoute = { source: string; headers: Header[] }
type Mode = 'development' | 'production'

const findings: string[] = []

function check(name: string, run: () => void) {
  try {
    run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    findings.push(`${name}: ${message}`)
  }
}

function parseDirectives(csp: string) {
  const entries = csp.split('; ').map((directive) => {
    const [name, ...values] = directive.split(' ')
    return [name, values] as const
  })
  assert.equal(new Set(entries.map(([name]) => name)).size, entries.length, 'duplicate CSP directive')
  return Object.fromEntries(entries)
}

async function loadRoutes(mode: Mode) {
  const previousMode = process.env.NODE_ENV
  process.env.NODE_ENV = mode
  try {
    const configUrl = new URL(`../next.config.ts?security-judge=${mode}`, import.meta.url)
    const nextConfig = (await import(configUrl.href)).default
    return ((await nextConfig.headers?.()) ?? []) as HeaderRoute[]
  } finally {
    if (previousMode === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = previousMode
  }
}

const commonDirectives = {
  'default-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'"],
  'worker-src': ["'self'", 'blob:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
}

const expectedDirectives: Record<Mode, Record<string, string[]>> = {
  development: {
    ...commonDirectives,
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'connect-src': ["'self'", 'ws:', 'wss:'],
  },
  production: {
    ...commonDirectives,
    'script-src': ["'self'", "'unsafe-inline'"],
    'connect-src': ["'self'"],
    'upgrade-insecure-requests': [],
  },
}

const expectedHeaders = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  'x-frame-options': 'DENY',
}

function assertSecurityRoutes(routes: HeaderRoute[], mode: Mode) {
  const cspRoutes = routes.filter((route) =>
    route.headers.some((header) => header.key.toLowerCase() === 'content-security-policy'),
  )
  assert.equal(cspRoutes.length, 1, 'CSP must be set by exactly one route')
  assert.equal(cspRoutes[0]?.source, '/:path*', 'the sole CSP route must cover all paths')

  const catchAll = routes.find((route) => route.source === '/:path*')
  assert.ok(catchAll, 'missing /:path* header rule')
  const normalizedKeys = catchAll.headers.map((header) => header.key.toLowerCase())
  assert.equal(new Set(normalizedKeys).size, normalizedKeys.length, 'duplicate catch-all header')

  const headers = Object.fromEntries(
    catchAll.headers.map((header) => [header.key.toLowerCase(), header.value]),
  )
  const csp = headers['content-security-policy'] ?? ''
  assert.deepEqual(headers, {
    'content-security-policy': csp,
    ...expectedHeaders,
  })
  assert.deepEqual(parseDirectives(csp), expectedDirectives[mode])
}

const routesByMode = {} as Record<Mode, HeaderRoute[]>
for (const mode of ['production', 'development'] as const) {
  const routes = await loadRoutes(mode)
  routesByMode[mode] = routes
  check(`${mode} routes, headers, and CSP values are exact`, () => assertSecurityRoutes(routes, mode))
}

check('validator rejects an injected script origin', () => {
  const injectedRoutes = structuredClone(routesByMode.production)
  const cspHeader = injectedRoutes
    .flatMap((route) => route.headers)
    .find((header) => header.key.toLowerCase() === 'content-security-policy')
  assert.ok(cspHeader, 'test fixture is missing CSP')
  cspHeader.value = cspHeader.value.replace(
    "script-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' https://example.com",
  )
  assert.throws(() => assertSecurityRoutes(injectedRoutes, 'production'))
})

check('validator rejects an overriding CSP route', () => {
  const injectedRoutes = structuredClone(routesByMode.production)
  injectedRoutes.push({
    source: '/work/:path*',
    headers: [{ key: 'Content-Security-Policy', value: "default-src 'none'" }],
  })
  assert.throws(() => assertSecurityRoutes(injectedRoutes, 'production'))
})

console.log(`Security headers judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
