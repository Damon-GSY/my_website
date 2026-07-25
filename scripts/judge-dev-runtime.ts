import { execFileSync } from 'node:child_process'
import { realpathSync } from 'node:fs'

const judgeUrlPort = process.env.JUDGE_URL
  ? new URL(process.env.JUDGE_URL).port
  : ''
const port = (process.argv[2] ?? judgeUrlPort) || '4175'

function run(command: string, args: string[]) {
  return execFileSync(command, args, { encoding: 'utf8' }).trim()
}

try {
  const pid = run('lsof', [`-tiTCP:${port}`, '-sTCP:LISTEN']).split('\n')[0]
  const files = run('lsof', ['-p', pid])
  const cwdEntry = run('lsof', ['-a', '-p', pid, '-d', 'cwd', '-Fn'])
    .split('\n')
    .find((entry) => entry.startsWith('n'))
  const serverCwd = cwdEntry ? realpathSync(cwdEntry.slice(1)) : ''
  const expectedCwd = realpathSync(process.cwd())

  if (serverCwd !== expectedCwd) {
    console.error(
      `Dev runtime judge: FAIL · port ${port} serves ${serverCwd || 'an unknown directory'} instead of ${expectedCwd}`,
    )
    process.exitCode = 1
  } else if (files.includes('/.next/trace')) {
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
