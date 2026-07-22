import { existsSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const sourceExtensions = new Set(['.css', '.ts', '.tsx'])

function extension(path: string) {
  const separator = path.lastIndexOf('.')
  return separator < 0 ? '' : path.slice(separator)
}

export function collectBuildInputs(root: string) {
  const inputs: string[] = []
  const visit = (path: string) => {
    const absolutePath = resolve(root, path)
    const stat = statSync(absolutePath)
    if (stat.isDirectory()) {
      for (const entry of readdirSync(absolutePath)) visit(resolve(path, entry))
      return
    }
    if (sourceExtensions.has(extension(path))) inputs.push(absolutePath)
  }

  for (const directory of ['app', 'components', 'lib']) visit(directory)
  for (const file of [
    'next.config.ts',
    'package.json',
    'package-lock.json',
    'postcss.config.mjs',
    'tsconfig.json',
  ]) {
    inputs.push(resolve(root, file))
  }
  return inputs
}

export function assertFreshBuild(root: string, judgeName: string) {
  const artifacts = [
    '.next/BUILD_ID',
    '.next/react-loadable-manifest.json',
    '.next/server/app/index.html',
  ].map((path) => resolve(root, path))
  const missingArtifact = artifacts.find((path) => !existsSync(path))
  if (missingArtifact) {
    throw new Error(`${judgeName} requires a production build; missing ${missingArtifact}. Run \`npm run build\` first.`)
  }

  const inputs = collectBuildInputs(root)
  const latestInputTime = Math.max(...inputs.map((path) => statSync(path).mtimeMs))
  const oldestArtifactTime = Math.min(...artifacts.map((path) => statSync(path).mtimeMs))
  if (oldestArtifactTime < latestInputTime) {
    throw new Error(`${judgeName} refuses stale .next artifacts. Run \`npm run build\` after the latest app source change.`)
  }
}
