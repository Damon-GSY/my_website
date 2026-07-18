import { readFileSync } from 'node:fs'
import * as THREE from 'three'

const scene = readFileSync('components/optimization-landscape-scene.tsx', 'utf8')
const styles = readFileSync('app/globals.css', 'utf8')
const findings: string[] = []

const cameraRailBlock = scene.match(/const CAMERA_RAIL_POINTS = \[([\s\S]*?)\]\nconst LOOK_RAIL_POINTS/)
if (!cameraRailBlock) throw new Error('Motion judge could not find the camera rail.')

const cameraPoints = [...cameraRailBlock[1].matchAll(/new THREE\.Vector3\(([-\d.]+), ([-\d.]+), ([-\d.]+)\)/g)]
  .map((match) => new THREE.Vector3(Number(match[1]), Number(match[2]), Number(match[3])))

if (cameraPoints.length < 4) findings.push('The camera rail has too few control points for a cinematic path.')

const cameraRail = new THREE.CatmullRomCurve3(cameraPoints, false, 'catmullrom', 0.32)
const dollyDistance = cameraRail.getLength()
const heroHeights = [...styles.matchAll(/\.hero\s*\{[\s\S]*?height:\s*(\d+)svh;/g)].map((match) => Number(match[1]))
const [desktopHeight, mobileHeight] = heroHeights

if (!desktopHeight || !mobileHeight) throw new Error('Motion judge could not read desktop and mobile hero heights.')

const desktopTravel = desktopHeight / 100 - 1
const mobileTravel = mobileHeight / 100 - 1
const desktopPace = dollyDistance / desktopTravel
const mobilePace = dollyDistance / mobileTravel

if (desktopPace > 8.5) {
  findings.push(`Desktop dolly is compressed to ${desktopPace.toFixed(2)} world units per viewport (maximum 8.50).`)
}
if (mobilePace > 9.5) {
  findings.push(`Mobile dolly is compressed to ${mobilePace.toFixed(2)} world units per viewport (maximum 9.50).`)
}

let minimumStep = Number.POSITIVE_INFINITY
let maximumStep = 0
let previous = cameraRail.getPointAt(0)
for (let index = 1; index <= 200; index += 1) {
  const current = cameraRail.getPointAt(index / 200)
  const step = current.distanceTo(previous)
  minimumStep = Math.min(minimumStep, step)
  maximumStep = Math.max(maximumStep, step)
  previous = current
}

if (maximumStep / minimumStep > 1.08) {
  findings.push('The camera rail changes speed abruptly between adjacent samples.')
}

if (findings.length) {
  console.error('Scroll-motion judge: FAIL')
  findings.forEach((finding) => console.error(`- ${finding}`))
  process.exit(1)
}

console.log(
  `Scroll-motion judge: PASS · ${dollyDistance.toFixed(2)} world units across ${desktopTravel.toFixed(2)} desktop / ${mobileTravel.toFixed(2)} mobile viewports`,
)
