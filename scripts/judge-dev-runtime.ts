import { execFileSync } from 'node:child_process'

const port = process.argv[2] ?? '4175'

function run(command: string, args: string[]) {
  return execFileSync(command, args, { encoding: 'utf8' }).trim()
}

try {
  const pid = run('lsof', [`-tiTCP:${port}`, '-sTCP:LISTEN']).split('\n')[0]
  const files = run('lsof', ['-p', pid])

  if (files.includes('/.next/trace')) {
    console.error(`Dev runtime judge: FAIL · server ${pid} shares the production .next directory`)
    process.exitCode = 1
  } else if (files.includes('/.next-dev/trace')) {
    console.log(`Dev runtime judge: PASS · server ${pid} is isolated in .next-dev`)
  } else {
    console.error(`Dev runtime judge: FAIL · server ${pid} has no verifiable Next.js dev trace`)
    process.exitCode = 1
  }
} catch {
  console.error(`Dev runtime judge: FAIL · no development server is listening on port ${port}`)
  process.exitCode = 1
}
