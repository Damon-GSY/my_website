import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import * as shaders from './particleShaders'

// The supplied Anchor AI study builds all its forms procedurally. Keep the same
// point-cloud silhouette and GPU morph, without embedding another Three build.
const clamp = (value) => Math.max(0, Math.min(1, value))
const smoothstep = (start, end, value) => {
  const t = clamp((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}

function makeTreeGeometry({ mobile, label }) {
  const positions = [], targets = [], spheres = [], sizes = [], phases = [], drifts = []
  const textCanvas = document.createElement('canvas')
  textCanvas.width = 720
  textCanvas.height = 180
  const context = textCanvas.getContext('2d')
  const textTargets = []
  if (context) {
    context.fillStyle = '#fff'
    context.font = '600 90px Arial, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(label, 360, 90, 680)
    const pixels = context.getImageData(0, 0, 720, 180).data
    for (let y = 0; y < 180; y += 3) {
      for (let x = 0; x < 720; x += 3) {
        if (pixels[(y * 720 + x) * 4 + 3] > 80) {
          textTargets.push(new THREE.Vector3((x - 360) / 102.5, -(y - 90) / 102.5, 2.7))
        }
      }
    }
  }

  function cubeTarget(index) {
    if (index % 4 === 0 && textTargets.length) {
      return textTargets[Math.floor(Math.random() * textTargets.length)].clone()
        .add(new THREE.Vector3((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04, 0))
    }
    const halfSize = 2.65
    const point = new THREE.Vector3(...Array.from({ length: 3 }, () => (Math.random() * 2 - 1) * halfSize))
    const face = Math.floor(Math.random() * 6)
    const axis = Math.floor(face / 2)
    point.setComponent(axis, (face % 2 ? 1 : -1) * halfSize)
    if (Math.random() < 0.34) {
      point.setComponent((axis + 1 + Math.floor(Math.random() * 2)) % 3, (Math.random() < 0.5 ? -1 : 1) * halfSize)
    }
    return point
  }

  function addPoint(x, y, z, size = 2, drift = 0) {
    positions.push(x, y, z)
    const target = cubeTarget(positions.length / 3)
    targets.push(target.x, target.y, target.z)
    sizes.push(size + 0.25)
    phases.push(Math.random() * 20)
    drifts.push(drift)
  }

  const density = mobile ? 0.38 : 1
  const canopy = [
    [-2.5, 5.3, 0, 2.8, 1.7, 2.75], [-0.8, 6.35, 0.15, 2.7, 1.8, 2.8],
    [1.35, 6.2, -0.1, 2.8, 1.8, 2.85], [3, 5.1, 0.1, 2.45, 1.55, 2.4],
    [0, 4.85, 0, 3.9, 1.6, 3.2], [-3.7, 4.5, 0.2, 1.8, 1.25, 1.9],
    [0, 5.45, 1.75, 2.55, 1.6, 2.1], [0.25, 5.3, -1.8, 2.65, 1.55, 2.15],
  ]
  for (const [cx, cy, cz, rx, ry, rz] of canopy) {
    for (let index = 0; index < 3500 * density; index++) {
      const vertical = Math.random() * 2 - 1
      const angle = Math.random() * Math.PI * 2
      const radius = Math.cbrt(Math.random())
      const horizontal = Math.sqrt(1 - vertical * vertical)
      const x = cx + Math.cos(angle) * horizontal * radius * rx
      addPoint(x, cy + vertical * radius * ry, cz + Math.sin(angle) * horizontal * radius * rz,
        1.2 + Math.random() * 2.6 + radius * radius * 1.3,
        x > 1.3 && Math.random() < 0.032 ? 0.1 + Math.random() * 0.2 : 0)
    }
  }

  function branch(start, end, thickness, count) {
    const point = new THREE.Vector3()
    for (let index = 0; index < count * density; index++) {
      const progress = Math.random()
      const width = (1 - progress) * thickness + 0.07
      point.lerpVectors(start, end, progress)
      addPoint(point.x + (Math.random() - 0.5) * width, point.y + (Math.random() - 0.5) * width,
        point.z + (Math.random() - 0.5) * width, 1.2 + Math.random() * 1.7)
    }
  }
  const vector = (x, y, z) => new THREE.Vector3(x, y, z)
  const branchEnds = [[-3.3, 5.3], [-1.7, 6], [-0.4, 6.5], [1.8, 6.2], [3.4, 5.25]]
  branch(vector(0, 0, 0), vector(0, 3.8, 0), 1.7, 3600)
  branchEnds.forEach(([x, y], index) => {
    const joint = vector(x * 0.34, 3.5 + index % 2 * 0.35, (index - 2) * 0.18)
    branch(vector(0, 1.7, 0), joint, 0.8, 850)
    branch(joint, vector(x, y, (index % 2 - 0.5) * 0.6), 0.48, 900)
  })
  for (const side of [-1, 1]) {
    for (let index = 0; index < 4; index++) {
      const start = vector((index - 1.5) * 0.34, 2.5 + index * 0.27, side * 0.18)
      const joint = vector((index - 1.5) * 0.62, 3.75 + index * 0.31, side * (1.25 + index * 0.32))
      const end = vector((index - 1.5) * 1.02, 5.15 + index * 0.28, side * (3.05 + index % 2 * 0.55))
      branch(start, joint, 0.58, 620)
      branch(joint, end, 0.34, 560)
      branch(end, vector(end.x + (index % 2 ? -0.55 : 0.55), end.y + 0.48, end.z + side * 0.48), 0.16, 260)
    }
  }
  branchEnds.forEach(([x, y], index) => {
    for (let limb = 0; limb < 3; limb++) {
      const start = vector(x * 0.62, y - 0.72 + limb * 0.18, (limb - 1) * 0.32)
      const end = vector(x + (limb - 1) * 0.72, y + 0.25 + limb * 0.36, (limb - 1) * 0.85 + (index - 2) * 0.12)
      branch(start, end, 0.24, 430)
      branch(end, vector(end.x + (limb - 1) * 0.42, end.y + 0.42, end.z + (1 - limb) * 0.26), 0.13, 230)
    }
  })
  for (let index = 0; index < positions.length / 3; index++) {
    const vertical = 1 - Math.random() * 2
    const angle = Math.random() * Math.PI * 2
    const radius = 3.15 * Math.cbrt(0.72 + Math.random() * 0.28)
    const horizontal = Math.sqrt(1 - vertical * vertical)
    spheres.push(Math.cos(angle) * horizontal * radius, 4.55 + vertical * radius, Math.sin(angle) * horizontal * radius)
  }
  const geometry = new THREE.BufferGeometry()
  for (const [name, values, itemSize] of [
    ['position', positions, 3], ['aTarget', targets, 3], ['aSphere', spheres, 3],
    ['aSize', sizes, 1], ['aPhase', phases, 1], ['aDrift', drifts, 1],
  ]) geometry.setAttribute(name, new THREE.Float32BufferAttribute(values, itemSize))
  return geometry
}

/**
 * Returns immediately. Shader compilation happens in the background; onReady
 * means a successful frame exists. All handlers and GPU objects belong to this
 * instance, so StrictMode can dispose a mount before compilation finishes.
 */
export function createParticleScene(canvas, { onReady = () => {}, onError = () => {}, label = 'Damon' } = {}) {
  let width = Math.max(1, canvas.clientWidth || window.innerWidth)
  let height = Math.max(1, canvas.clientHeight || window.innerHeight)
  const mobile = width < 700
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
  } catch (error) {
    let cancelled = false
    queueMicrotask(() => { if (!cancelled) onError(error) })
    return { setProgress() {}, setPaused() {}, setReducedMotion() {}, dispose() { cancelled = true } }
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5))
  renderer.setSize(width, height, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.35

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x01040a)
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 150)
  const composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)
  const spectralPass = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uResolution: { value: new THREE.Vector2(width, height) }, uStrength: { value: 1.4 } },
    vertexShader: shaders.spectralVertex, fragmentShader: shaders.spectralFragment,
  })
  composer.addPass(spectralPass)

  const sculpture = new THREE.Group()
  scene.add(sculpture)
  const uniforms = {
    uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() },
    uMorph: { value: 0 }, uIntro: { value: 0 }, uOpacity: { value: 1 },
    uPointScale: { value: mobile ? 1.55 : 1 }, uDepthOffset: { value: 0 },
    uPointer: { value: new THREE.Vector2(-1000, -1000) }, uResolution: { value: new THREE.Vector2(width, height) },
    uHover: { value: 0 }, uTreeRadius: { value: 170 }, uCubeRadius: { value: 200 },
    uTreeSpread: { value: 0.056 }, uCubeSpread: { value: 0.072 },
    uTreeCore: { value: 0.3 }, uCubeCore: { value: 0.7 }, uTreeRamp: { value: 1.2 }, uCubeRamp: { value: 0.8 },
  }
  const material = (vertexShader, fragmentShader, sharedUniforms, options = {}) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: sharedUniforms, vertexShader, fragmentShader, ...options,
  })
  const treeGeometry = makeTreeGeometry({ mobile, label })
  const tree = new THREE.Points(treeGeometry, material(shaders.particleVertex, shaders.particleFragment, uniforms))
  tree.frustumCulled = false // The GPU morph extends beyond the source geometry's bounds.
  tree.renderOrder = 20
  sculpture.add(tree)
  const reflection = new THREE.Points(treeGeometry, material(shaders.reflectionVertex, shaders.reflectionFragment, {
    uTime: uniforms.uTime, uMorph: uniforms.uMorph, uPixelRatio: uniforms.uPixelRatio, uIntro: uniforms.uIntro,
    uPointScale: uniforms.uPointScale,
  }))
  reflection.frustumCulled = false
  reflection.renderOrder = 4
  sculpture.add(reflection)

  const water = new THREE.Mesh(new THREE.PlaneGeometry(42, 26, mobile ? 88 : 180, mobile ? 56 : 110).rotateX(-Math.PI / 2),
    material(shaders.waterVertex, shaders.waterFragment, { uTime: uniforms.uTime, uMorph: uniforms.uMorph },
      { depthTest: true, side: THREE.DoubleSide, blending: THREE.NormalBlending }))
  water.position.y = -0.66
  scene.add(water)

  const rippleCount = mobile ? 900 : 2100
  const rippleGeometry = new THREE.BufferGeometry()
  rippleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(rippleCount * 3), 3))
  for (const [name, makeValue] of [
    ['aAngle', () => Math.random() * Math.PI * 2], ['aBand', (index) => index % 6],
    ['aJitter', () => (Math.random() - 0.5) * 0.42], ['aSize', () => (0.75 + Math.random() * 1.65) * 1.2],
    ['aPhase', () => Math.random() * 20],
  ]) rippleGeometry.setAttribute(name, new THREE.Float32BufferAttribute(Array.from({ length: rippleCount }, (_, index) => makeValue(index)), 1))
  const ripples = new THREE.Points(rippleGeometry, material(shaders.rippleVertex, shaders.rippleFragment,
    { uTime: uniforms.uTime, uPixelRatio: uniforms.uPixelRatio }, { depthTest: true }))
  ripples.frustumCulled = false
  ripples.renderOrder = 3
  scene.add(ripples)

  const mist = new THREE.Mesh(new THREE.PlaneGeometry(18, 12), material(shaders.mistVertex, shaders.mistFragment, { uTime: uniforms.uTime }))
  mist.position.set(0, 3.5, -3.5)
  mist.renderOrder = -2
  scene.add(mist)
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 12), material(shaders.shaftVertex, shaders.shaftFragment, {}))
  shaft.position.set(0, 2.6, -2.8)
  shaft.renderOrder = -1
  scene.add(shaft)

  function atmosphere(count, kind) {
    const positions = [], sizes = [], phases = []
    for (let index = 0; index < count; index++) {
      if (kind === 'star') {
        positions.push((Math.random() - 0.5) * 34, 1 + Math.random() * 16, -5 - Math.random() * 13)
        sizes.push(0.45 + Math.random() * 1.25)
      } else {
        positions.push((Math.random() - 0.5) * 24, -1 + Math.random() * 11, 5 + Math.random() * 4)
        sizes.push(10 + Math.random() * 24)
      }
      phases.push(Math.random() * 20)
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1))
    geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1))
    const points = new THREE.Points(geometry, material(shaders[`${kind}Vertex`], shaders[`${kind}Fragment`],
      { uTime: uniforms.uTime, uPixelRatio: uniforms.uPixelRatio }, { depthTest: kind === 'star' }))
    points.renderOrder = kind === 'star' ? 1 : 30
    scene.add(points)
  }
  atmosphere(mobile ? 400 : 950, 'star')
  atmosphere(mobile ? 18 : 42, 'bokeh')

  let disposed = false, failed = false, compiled = false, announced = false
  let paused = false, reducedMotion = false, progress = 0, elapsed = 0, introElapsed = 0, spin = 0
  let pointerX = 0, pointerY = 0, frame = 0, lastTimestamp = 0
  const staticMode = () => paused || reducedMotion
  const fail = (error) => {
    if (disposed || failed) return
    failed = true
    cancelAnimationFrame(frame)
    frame = 0
    onError(error)
  }

  function render(timestamp) {
    frame = 0
    if (disposed || failed || !compiled || document.hidden) return
    const delta = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 1000, 0.1) : 1 / 30
    if (lastTimestamp && timestamp - lastTimestamp < 1000 / 30 - 1) {
      frame = requestAnimationFrame(render)
      return
    }
    lastTimestamp = timestamp
    const isStatic = staticMode()
    if (!isStatic) {
      elapsed += delta
      introElapsed += delta
    }
    const morph = clamp((progress - 0.54) / 0.34)
    if (!isStatic && morph > 0.995) spin += delta * 0.108
    if (morph < 0.5) spin = 0
    uniforms.uTime.value = elapsed
    uniforms.uMorph.value = morph
    uniforms.uIntro.value = isStatic ? 1 : smoothstep(0, 2.2, introElapsed)
    sculpture.position.y = -0.38 + morph * 3.9
    sculpture.scale.setScalar(1 - morph * 0.15)
    const rotationY = pointerX * 0.12 * (1 - morph) + morph * Math.PI * 4 + morph * 0.55 + spin * smoothstep(0.9, 1, morph)
    const rotationX = pointerY * 0.035 * (1 - morph) + morph * 0.34
    const smoothing = isStatic ? 1 : 1 - Math.exp(-2.1 * delta)
    sculpture.rotation.y += (rotationY - sculpture.rotation.y) * smoothing
    sculpture.rotation.x += (rotationX - sculpture.rotation.x) * smoothing
    sculpture.rotation.z += (morph * 0.08 - sculpture.rotation.z) * smoothing
    spectralPass.uniforms.uStrength.value = 1.4 + Math.sin(morph * Math.PI) * 3.15
    const baseDistance = width < 700 ? Math.max(17, 12.5 / (2 * Math.tan(THREE.MathUtils.degToRad(21)) * camera.aspect)) : 17
    // Portrait framing moves the camera back, so compensate apparent depth and
    // point coverage to keep the sculpture as luminous as the desktop version.
    uniforms.uDepthOffset.value = baseDistance - 17
    if (width < 700) camera.setViewOffset(width, height, 0, height * (0.18 - morph * 0.08), width, height)
    camera.position.set(0, 3.1 + (isStatic ? 0 : Math.sin(elapsed * 0.21) * 0.045),
      baseDistance - progress * 0.7 - Math.sin(morph * Math.PI) * 0.182 + (isStatic ? 0 : Math.sin(elapsed * 0.34) * 0.11))
    camera.lookAt(0, 3.2, 0)
    try {
      composer.render()
      if (!announced) {
        announced = true
        onReady()
      }
    } catch (error) {
      fail(error)
      return
    }
    if (!isStatic && !disposed && !failed) frame = requestAnimationFrame(render)
  }
  function invalidate() {
    if (!frame && compiled && !disposed && !failed && !document.hidden) frame = requestAnimationFrame(render)
  }
  function resize() {
    width = Math.max(1, canvas.clientWidth || window.innerWidth)
    height = Math.max(1, canvas.clientHeight || window.innerHeight)
    const narrow = width < 700
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1 : 1.5))
    renderer.setSize(width, height, false)
    composer.setPixelRatio(renderer.getPixelRatio())
    composer.setSize(width, height)
    camera.aspect = width / height
    if (narrow) camera.setViewOffset(width, height, 0, height * 0.18, width, height)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
    spectralPass.uniforms.uResolution.value.set(width, height)
    uniforms.uResolution.value.set(width, height)
    uniforms.uPixelRatio.value = renderer.getPixelRatio()
    uniforms.uPointScale.value = narrow ? 1.55 : 1
    invalidate()
  }
  function pointermove(event) {
    if (staticMode() || event.pointerType === 'touch') return
    const bounds = canvas.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top
    pointerX = x / width - 0.5
    pointerY = y / height - 0.5
    uniforms.uPointer.value.set(x, height - y)
    uniforms.uHover.value = 1
  }
  function pointerleave() {
    uniforms.uHover.value = 0
    pointerX = 0
    pointerY = 0
  }
  function visibilitychange() {
    cancelAnimationFrame(frame)
    frame = 0
    lastTimestamp = 0
    if (!document.hidden) invalidate()
  }
  function contextlost(event) {
    event.preventDefault()
    fail(new Error('WebGL context lost'))
  }
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', pointermove, { passive: true })
  document.documentElement.addEventListener('pointerleave', pointerleave)
  document.addEventListener('visibilitychange', visibilitychange)
  canvas.addEventListener('webglcontextlost', contextlost)
  resize()
  camera.position.set(0, 3.1, 17)
  camera.lookAt(0, 3.2, 0)

  // Compilation must not reveal the canvas early: keep the DOM fallback until
  // an actual render succeeds, including the full-screen postprocessing pass.
  renderer.compileAsync(scene, camera).then(() => {
    if (disposed || failed) return
    compiled = true
    invalidate()
  }).catch(fail)

  return {
    setProgress(value) { progress = clamp(Number.isFinite(value) ? value : 0); invalidate() },
    setPaused(value) {
      paused = Boolean(value)
      if (paused) introElapsed = 2.2
      lastTimestamp = 0
      pointerleave()
      invalidate()
    },
    setReducedMotion(value) {
      reducedMotion = Boolean(value)
      if (reducedMotion) introElapsed = 2.2
      lastTimestamp = 0
      pointerleave()
      invalidate()
    },
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', pointermove)
      document.documentElement.removeEventListener('pointerleave', pointerleave)
      document.removeEventListener('visibilitychange', visibilitychange)
      canvas.removeEventListener('webglcontextlost', contextlost)
      const geometries = new Set(), materials = new Set()
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry)
        if (object.material) materials.add(object.material)
      })
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((entry) => entry.dispose())
      renderPass.dispose()
      spectralPass.dispose()
      composer.dispose()
      renderer.dispose()
    },
  }
}
