import assert from 'node:assert/strict'

import nextConfig from '../next.config.ts'

type Header = { key: string; value: string }

const findings: string[] = []

function check(name: string, run: () => void) {
  try {
    run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    findings.push(`${name}: ${message}`)
  }
}

const routes = await nextConfig.headers?.()
const catchAll = routes?.find((route) => route.source === '/:path*')
const headers = new Map(
  (catchAll?.headers ?? []).map((header: Header) => [header.key.toLowerCase(), header.value]),
)
const csp = headers.get('content-security-policy') ?? ''
const directives = new Map(
  csp.split('; ').map((directive) => {
    const [name, ...values] = directive.split(' ')
    return [name, values]
  }),
)

check('all routes receive the security policy', () => {
  assert.ok(catchAll, 'missing /:path* header rule')
})

for (const [directive, requiredValues] of [
  ['default-src', ["'self'"]],
  ['script-src', ["'self'", "'unsafe-inline'"]],
  ['style-src', ["'self'", "'unsafe-inline'"]],
  ['img-src', ["'self'", 'data:', 'blob:']],
  ['font-src', ["'self'"]],
  ['connect-src', ["'self'"]],
  ['worker-src', ["'self'", 'blob:']],
  ['object-src', ["'none'"]],
  ['base-uri', ["'self'"]],
  ['form-action', ["'self'"]],
  ['frame-ancestors', ["'none'"]],
] as const) {
  check(`CSP ${directive}`, () => {
    const actualValues = directives.get(directive)
    assert.ok(actualValues, `missing ${directive}`)
    for (const value of requiredValues) {
      assert.ok(actualValues.includes(value), `${directive} is missing ${value}`)
    }
  })
}

check('CSP does not contain wildcard sources', () => {
  assert.ok(!csp.split(/\s+/).includes('*'), 'wildcard source found')
})

check('production CSP upgrades insecure requests', () => {
  if (process.env.NODE_ENV === 'production') assert.match(csp, /(?:^|; )upgrade-insecure-requests(?:;|$)/)
})

check('production CSP does not enable eval', () => {
  if (process.env.NODE_ENV === 'production') assert.doesNotMatch(csp, /'unsafe-eval'/)
})

for (const [key, expected] of [
  ['x-content-type-options', 'nosniff'],
  ['referrer-policy', 'strict-origin-when-cross-origin'],
  ['permissions-policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()'],
  ['x-frame-options', 'DENY'],
] as const) {
  check(key, () => assert.equal(headers.get(key), expected))
}

console.log(`Security headers judge: ${findings.length === 0 ? 'PASS' : 'FAIL'}`)
for (const finding of findings) console.log(`- ${finding}`)
if (findings.length > 0) process.exitCode = 1
