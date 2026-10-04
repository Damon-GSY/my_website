import * as THREE from 'three'

const TAU = Math.PI * 2
const GOLDEN = 0.618033988749895
const fract = (value) => value - Math.floor(value)
const mix = (a, b, amount) => a + (b - a) * amount

function seededRandom(seed) {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function alongPath(points, progress) {
  const lengths = points.slice(1).map((point, index) => Math.hypot(
    point[0] - points[index][0], point[1] - points[index][1], point[2] - points[index][2],
  ))
  let remaining = fract(progress) * lengths.reduce((sum, length) => sum + length, 0)
  for (let index = 0; index < lengths.length; index++) {
    if (remaining <= lengths[index] || index === lengths.length - 1) {
      const amount = remaining / Math.max(lengths[index], 0.0001)
      return points[index].map((value, axis) => mix(value, points[index + 1][axis], amount))
    }
    remaining -= lengths[index]
  }
  return points[0]
}

function textSamples(label, desiredCount) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('A 2D canvas is required to construct the particle signature.')
  context.font = '900 220px Arial'
  canvas.width = Math.ceil(context.measureText(label).width) + 48
  canvas.height = 280
  context.font = '900 220px Arial'
  context.fillStyle = '#ffffff'
  context.textBaseline = 'middle'
  context.fillText(label, 24, 144)
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
  let left = canvas.width, right = 0, top = canvas.height, bottom = 0, ink = 0
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (data[(y * canvas.width + x) * 4 + 3] > 160) {
        left = Math.min(left, x)
        right = Math.max(right, x)
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
        ink++
      }
    }
  }
  if (!ink) throw new Error('The particle signature label has no visible glyphs.')

  // Sample the glyph interiors on a regular lattice before selecting particles.
  // This keeps fine glyph sprites evenly spaced instead of stacking at random.
  const step = Math.max(1, Math.floor(Math.sqrt(ink / desiredCount)))
  const samples = []
  for (let y = top; y <= bottom; y += step) {
    for (let x = left; x <= right; x += step) {
      if (data[(y * canvas.width + x) * 4 + 3] > 160) samples.push([x, y])
    }
  }
  return { samples, width: right - left + 1, centerX: (left + right) / 2, centerY: (top + bottom) / 2, step }
}

function matrixHero(index, count, random) {
  const cellsPerLane = 40
  const laneCount = Math.ceil(count / cellsPerLane)
  const lane = Math.floor(index / cellsPerLane)
  const cell = index % cellsPerLane
  const column = fract(lane * GOLDEN + 0.13)
  const depth = fract(lane * 0.41421356237 + 0.3)
  return {
    point: [mix(-9.8, 9.8, column), -6 + fract(cell / cellsPerLane + lane * 0.071) * 13, mix(-6, 3, depth)],
    size: 12 + random() * 4,
    lane: lane / Math.max(1, laneCount - 1),
    phase: fract(lane * 0.754877666) * TAU,
    tint: cell === 0 ? 1 : 0.12 + (1 - cell / cellsPerLane) * 0.75,
  }
}

function matrixSystem(index, random) {
  const family = index % 10
  const progress = fract(index * GOLDEN)
  const layer = Math.floor(index / 10) % 4
  const z = -1.4 + layer * 0.8
  if (family < 4) {
    const extent = 1.45 + family * 0.29
    const bevel = 0.2
    return alongPath([
      [-extent + bevel, 1 - extent, z], [extent - bevel, 1 - extent, z],
      [extent, 1 - extent + bevel, z], [extent, 1 + extent - bevel, z],
      [extent - bevel, 1 + extent, z], [-extent + bevel, 1 + extent, z],
      [-extent, 1 + extent - bevel, z], [-extent, 1 - extent + bevel, z],
      [-extent + bevel, 1 - extent, z],
    ], progress)
  }
  if (family < 8) {
    const side = family - 4
    const pin = Math.floor(index / 10) % 9
    const offset = (pin - 4) * 0.38
    const length = 3.2 + (pin % 3) * 0.62
    const trace = alongPath([
      [2.4, offset, z], [2.7 + (pin % 3) * 0.18, offset, z],
      [3.2 + (pin % 3) * 0.18, offset + Math.sign(offset) * 0.6, z],
      [length + 1.4, offset + Math.sign(offset) * 0.6, z],
    ], progress)
    const angle = side * Math.PI / 2
    return [trace[0] * Math.cos(angle) - trace[1] * Math.sin(angle),
      1 + (trace[0] * Math.sin(angle) + trace[1] * Math.cos(angle)) * 0.67, trace[2]]
  }
  const row = Math.floor(index / 10) % 13
  const column = Math.floor(index / 130) % 13
  return [(column - 6) * 0.21, 1 + (row - 6) * 0.21, z + (random() - 0.5) * 0.035]
}

function signatureHero(index, random) {
  const ribbon = index % 5
  const angle = fract(index * GOLDEN) * TAU
  const ribbonPhase = ribbon * TAU / 5
  const transverse = (random() - 0.5) * 0.1
  const ribbonOffset = (ribbon - 2) * 0.14
  return {
    point: [Math.sin(angle) * 5.3 + Math.cos(angle) * transverse,
      1.5 + Math.sin(angle * 2 + (ribbon - 2) * 0.13) * 1.7 + ribbonOffset + transverse,
      Math.cos(angle) * 1.5 + Math.sin(angle * 3 + ribbonPhase) * 0.4 + transverse * 0.6],
    size: 1.2 + random() * 1.6,
    phase: angle,
    lane: ribbon / 4,
    tint: 0.2 + ribbon / 6,
  }
}

function signatureSystem(index, random) {
  const orbit = index % 9
  const angle = fract(index * GOLDEN) * TAU
  const phase = orbit * TAU / 9
  const width = 0.02 + random() * 0.14
  const radius = 3.6 + Math.sin(angle * 2 + phase) * 0.65 + width
  const baseX = Math.cos(angle) * radius * 1.23
  const baseY = Math.sin(angle) * radius * 0.58
  const tilt = (orbit - 4) * 0.085
  return [baseX * Math.cos(tilt) - baseY * Math.sin(tilt),
    1.15 + baseX * Math.sin(tilt) + baseY * Math.cos(tilt),
    Math.sin(angle + phase) * (0.6 + orbit * 0.17)]
}

function neuralNodes() {
  return Array.from({ length: 14 }, (_, index) => {
    const outer = index < 10
    const angle = outer ? index * TAU / 10 : (index - 10) * TAU / 4 + 0.35
    return [Math.cos(angle) * (outer ? 4.7 : 2.1),
      1.5 + Math.sin(angle) * (outer ? 2.65 : 1.3),
      Math.sin(angle * 2 + 0.35) * (outer ? 1.65 : 0.7)]
  })
}

function neuralSystemNodes() {
  return Array.from({ length: 14 }, (_, index) => {
    const angle = index * TAU / 14
    const radius = index % 2 === 0 ? 4.9 : 3.2
    return [Math.cos(angle) * radius, 1.3 + Math.sin(angle) * radius * 0.6,
      (index % 3 - 1) * 1.05]
  })
}

function shellPoint(random, radius) {
  const angle = random() * TAU
  const vertical = random() * 2 - 1
  const horizontal = Math.sqrt(1 - vertical * vertical)
  return [Math.cos(angle) * horizontal * radius, vertical * radius, Math.sin(angle) * horizontal * radius]
}

function neuralHero(index, random, nodes) {
  const family = index % 10
  const angle = fract(index * GOLDEN) * TAU
  const node = index % nodes.length
  let point
  if (family < 4) {
    const offset = shellPoint(random, 0.14 + random() * (node < 10 ? 0.19 : 0.3))
    point = nodes[node].map((value, axis) => value + offset[axis])
  } else if (family < 8) {
    const orbit = Math.floor(index / 10) % 3
    const radius = 1.25 + random() * 0.12
    const tilt = orbit * Math.PI / 3 + 0.25
    point = [Math.cos(angle) * radius * 1.05,
      1.5 + Math.sin(angle) * Math.cos(tilt) * radius,
      Math.sin(angle) * Math.sin(tilt) * radius]
  } else {
    const orbit = Math.floor(index / 10) % 3
    const radius = 4.1 + orbit * 0.28
    point = [Math.cos(angle) * radius,
      1.5 + Math.sin(angle) * radius * (0.48 + orbit * 0.025),
      Math.sin(angle * 2 + orbit * 0.4) * 1.35 + (random() - 0.5) * 0.05]
  }
  return { point, size: 1.3 + random() * 1.9, phase: angle, lane: node / 13,
    tint: node % 4 === 0 ? 0.95 : 0.08 + random() * 0.28 }
}

function neuralSystem(index, random, nodes) {
  const node = index % nodes.length
  if (index % 5 < 2) {
    const offset = shellPoint(random, 0.13 + random() * 0.26)
    return nodes[node].map((value, axis) => value + offset[axis])
  }
  if (index % 5 === 2) {
    const amount = fract(index * GOLDEN)
    const turn = Math.sin(amount * Math.PI) * 0.23
    return [nodes[node][0] * amount,
      1.3 + (nodes[node][1] - 1.3) * amount + turn,
      nodes[node][2] * amount]
  }
  const angle = fract(index * GOLDEN) * TAU
  const ring = Math.floor(index / 5) % 4
  const radius = 1.05 + ring * 0.5 + (random() - 0.5) * 0.03
  return [Math.cos(angle) * radius, 1.3 + Math.sin(angle) * radius * 0.61,
    Math.sin(angle * 2) * 0.15 + (ring - 1.5) * 0.24]
}

function networkGeometry(heroNodes, systemNodes) {
  const positions = [], systems = [], texts = [], phases = [], tints = []
  const center = [0, 1.5, 0]
  const systemCenter = [0, 1.3, 0]
  const edges = []
  for (let index = 0; index < 10; index++) {
    edges.push([index, (index + 1) % 10])
    if (index % 2 === 0) edges.push([index, (index + 3) % 10])
    edges.push([index, 10 + index % 4])
  }
  for (let index = 10; index < 14; index++) edges.push([index, -1])

  const bend = (a, b, t, edge) => {
    const bow = Math.sin(t * Math.PI) * 0.18
    return [mix(a[0], b[0], t), mix(a[1], b[1], t) + bow,
      mix(a[2], b[2], t) + bow * Math.sin(edge)]
  }
  edges.forEach(([from, to], edge) => {
    const first = heroNodes[from], last = to < 0 ? center : heroNodes[to]
    const systemFirst = systemNodes[from], systemLast = to < 0 ? systemCenter : systemNodes[to]
    for (let segment = 0; segment < 12; segment++) {
      for (const t of [segment / 12, (segment + 1) / 12]) {
        positions.push(...bend(first, last, t, edge))
        systems.push(...bend(systemFirst, systemLast, t, edge))
        texts.push(0, 1, -2)
        phases.push(edge / edges.length * TAU)
        tints.push(from % 4 === 0 ? 0.95 : 0.2)
      }
    }
  })
  const geometry = new THREE.BufferGeometry()
  for (const [name, values, size] of [
    ['position', positions, 3], ['aSystem', systems, 3], ['aText', texts, 3],
    ['aPhase', phases, 1], ['aTint', tints, 1],
  ]) geometry.setAttribute(name, new THREE.Float32BufferAttribute(values, size))
  geometry.computeBoundingSphere()
  return geometry
}

export function makeDigitalGeometry({ variant = 'matrix', mobile = false, label = 'DAMON' } = {}) {
  const settings = {
    matrix: { count: mobile ? 1000 : 1600, seed: 29102, width: 9.5, textFraction: 0.85 },
    signature: { count: mobile ? 6500 : 11000, seed: 51083, width: 10.5, textFraction: 0.8 },
    neural: { count: mobile ? 3600 : 6500, seed: 78019, width: 10, textFraction: 0.85 },
  }
  if (!settings[variant]) throw new Error(`Unknown digital particle variant: ${variant}`)
  const { count, seed, width, textFraction } = settings[variant]
  const random = seededRandom(seed)
  const textCount = Math.floor(count * textFraction)
  const glyph = textSamples(label, textCount)
  const scale = width / glyph.width
  const heroNodes = variant === 'neural' ? neuralNodes() : null
  const systemNodes = variant === 'neural' ? neuralSystemNodes() : null
  const positions = new Float32Array(count * 3)
  const text = new Float32Array(count * 3)
  const systems = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const sizes = new Float32Array(count)
  const glyphs = new Float32Array(count)
  const tints = new Float32Array(count)
  const lanes = new Float32Array(count)

  // Permute the glyph lattice once, so each column/ribbon converges into the
  // whole word instead of mapping into horizontal stripes of letter pixels.
  const order = Array.from({ length: glyph.samples.length }, (_, index) => index)
  for (let index = order.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[order[index], order[other]] = [order[other], order[index]]
  }

  for (let index = 0; index < count; index++) {
    const hero = variant === 'matrix' ? matrixHero(index, count, random)
      : variant === 'signature' ? signatureHero(index, random)
        : neuralHero(index, random, heroNodes)
    const system = variant === 'matrix' ? matrixSystem(index, random)
      : variant === 'signature' ? signatureSystem(index, random)
        : neuralSystem(index, random, systemNodes)
    positions.set(hero.point, index * 3)
    systems.set(system, index * 3)
    if (index < textCount) {
      const sampleIndex = order[Math.floor(index / textCount * order.length)]
      const [x, y] = glyph.samples[sampleIndex]
      const jitter = variant === 'matrix' ? 0 : 0.1 * glyph.step
      text.set([(x - glyph.centerX + (random() - 0.5) * jitter) * scale,
        1 - (y - glyph.centerY + (random() - 0.5) * jitter) * scale,
        (random() - 0.5) * (variant === 'matrix' ? 0.06 : 0.18)], index * 3)
    } else {
      const angle = fract(index * GOLDEN) * TAU
      const radius = 4.7 + random() * 1.45
      text.set([Math.cos(angle) * radius * 1.12,
        1 + Math.sin(angle) * radius * 0.55, -2 - random() * 2.5], index * 3)
    }
    phases[index] = hero.phase
    sizes[index] = hero.size
    glyphs[index] = Math.floor(random() * 64)
    tints[index] = hero.tint
    lanes[index] = hero.lane
  }

  const geometry = new THREE.BufferGeometry()
  for (const [name, values, size] of [
    ['position', positions, 3], ['aText', text, 3], ['aSystem', systems, 3],
    ['aPhase', phases, 1], ['aSize', sizes, 1], ['aGlyph', glyphs, 1], ['aTint', tints, 1], ['aLane', lanes, 1],
  ]) geometry.setAttribute(name, new THREE.BufferAttribute(values, size))
  geometry.computeBoundingSphere()
  return { geometry, count, textCount,
    ...(variant === 'neural' ? { networkGeometry: networkGeometry(heroNodes, systemNodes) } : {}) }
}
