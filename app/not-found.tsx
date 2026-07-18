import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="not-found">
      <span>404 / unresolved route</span>
      <h1>This path is outside the tool registry.</h1>
      <Link href="/">Return to the control surface ↗</Link>
    </main>
  )
}
