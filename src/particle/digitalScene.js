import * as THREE from 'three'
import { makeDigitalGeometry } from './digitalGeometry'

const clamp = (number) => Math.max(0, Math.min(1, number))
const smooth = (from, to, number) => {
  const t = clamp((number - from) / (to - from))
  return t * t * (3 - 2 * t)
}
const palettes = {
  matrix: { background: 0x010806, primary: 0x21ffa0, secondary: 0x84f4f5 },
  signature: { background: 0x030514, primary: 0x718aff, secondary: 0xcea4ff },
  neural: { background: 0x070b10, primary: 0xffbb64, secondary: 0x65dcd8 },
}

function glyphAtlas() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const context = canvas.getContext('2d')
  if (!context) throw new Error('A character atlas could not be created.')
  const glyphs = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789<>[]{}/+=:;*#%!?⊕⊗ΣΔΛΩπλμ∂∞⌘'
  context.fillStyle = '#fff'
  context.font = '700 47px monospace'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  for (let index = 0; index < 64; index++) {
    context.fillText(glyphs[index % glyphs.length], (index % 8) * 64 + 32, Math.floor(index / 8) * 64 + 32)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  return texture
}

const particleVertex = /* glsl */`
  attribute vec3 aText;
  attribute vec3 aSystem;
  attribute float aPhase;
  attribute float aSize;
  attribute float aGlyph;
  attribute float aTint;
  attribute float aLane;
  uniform float uTime;
  uniform float uNameIn;
  uniform float uSystem;
  uniform float uName;
  uniform float uVariant;
  uniform float uDpr;
  uniform float uDistance;
  uniform float uIntro;
  uniform vec2 uPointer;
  uniform vec2 uResolution;
  uniform float uHover;
  varying float vTint;
  varying float vAlpha;
  varying float vGlyph;
  varying float vName;
  varying float vVariant;
  void main() {
    vec3 original = position;
    float phase = aPhase + uTime * .25;
    if (uVariant < .5) {
      original.y = mod(position.y + 7.5 - uTime * (1.0 + aLane * 1.8), 15.0) - 7.5;
      original.x += sin(uTime * .15 + aPhase) * .018;
    } else if (uVariant < 1.5) {
      float angle = uTime * .065;
      original.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * original.xz;
      original += vec3(sin(phase + position.y), cos(phase + position.x), sin(phase)) * .075;
    } else {
      float angle = uTime * .035;
      original.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * original.xz;
      original += vec3(sin(phase), cos(phase * .8), sin(phase * .7)) * .027;
    }
    vec3 target = aSystem;
    if (uVariant > .5) {
      float turn = uTime * .032;
      target.xz = mat2(cos(turn), -sin(turn), sin(turn), cos(turn)) * target.xz;
    }
    vec3 p = mix(mix(original, aText, uNameIn), target, uSystem);
    float transit = sin(uNameIn * 3.14159265) * (1.0 - uSystem) + sin(uSystem * 3.14159265);
    p.z += sin(aPhase) * transit * 1.4;
    p.y += cos(aPhase * 1.4) * transit * .5;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 screen = (clip.xy / clip.w * .5 + .5) * uResolution;
    vec2 pointerDelta = screen - uPointer;
    float distanceToPointer = length(pointerDelta);
    float influence = (1.0 - smoothstep(0.0, 145.0, distanceToPointer)) * uHover;
    mv.xy += normalize(pointerDelta + vec2(.001)) * influence * (.5 - uName * .38);
    gl_Position = projectionMatrix * mv;
    float scale = uVariant < .5 ? mix(1.0, .68, uName) : 1.7;
    gl_PointSize = clamp(aSize * scale * uDpr * uDistance / max(1.0, -mv.z), 1.0, 38.0 * uDpr);
    vTint = aTint;
    vName = uName;
    vVariant = uVariant;
    vGlyph = mod(aGlyph + floor(uTime * (1.2 + aLane) * (1.0 - uName)), 64.0);
    float twinkle = .65 + .35 * sin(aPhase * 3.1 + uTime * 1.2);
    float depthFade = (1.0 - smoothstep(7.0, 32.0, -mv.z - (uDistance - 18.0)));
    vAlpha = (.8 + aTint * .7) * mix(twinkle, 1.0, uName) * mix(.45, 1.0, depthFade) * uIntro;
    if (uVariant < .5) {
      float head = pow(fract(aPhase * .14 + uTime * .055), 5.0);
      vAlpha *= mix(.58 + head * 1.5, 1.35, uName);
    }
  }
`

const particleFragment = /* glsl */`
  uniform sampler2D uGlyphs;
  uniform vec3 uPrimary;
  uniform vec3 uSecondary;
  varying float vTint;
  varying float vAlpha;
  varying float vGlyph;
  varying float vName;
  varying float vVariant;
  void main() {
    vec2 uv = gl_PointCoord;
    vec3 color = mix(uPrimary, uSecondary, smoothstep(.4, 1.0, vTint));
    float opacity;
    if (vVariant < .5) {
      vec2 tile = vec2(mod(vGlyph, 8.0), floor(vGlyph / 8.0));
      vec2 atlasUv = (tile + uv) / 8.0;
      atlasUv.y = 1.0 - atlasUv.y;
      opacity = texture2D(uGlyphs, atlasUv).a;
      color = mix(color, vec3(.84, 1.0, .91), vTint * .2);
    } else {
      float d = length(uv - .5) * 2.0;
      if (d > 1.0) discard;
      float core = exp(-d * d * 14.0);
      float halo = pow(1.0 - d, 1.8);
      opacity = core * .8 + halo * .55;
      color += core * .32;
    }
    if (opacity < .012) discard;
    gl_FragColor = vec4(color, opacity * vAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const networkVertex = /* glsl */`
  attribute vec3 aSystem;
  uniform float uTime;
  uniform float uName;
  uniform float uSystem;
  varying float vPhase;
  varying float vTint;
  void main() {
    vec3 p = mix(position, aSystem, uSystem);
    float angle = uTime * mix(.035, .032, uSystem);
    p.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xz;
    vPhase = length(position) * .7 + position.y * .4;
    vTint = smoothstep(-4.0, 4.0, position.x);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`
const networkFragment = /* glsl */`
  uniform float uTime;
  uniform float uName;
  uniform float uIntro;
  uniform vec3 uPrimary;
  uniform vec3 uSecondary;
  varying float vPhase;
  varying float vTint;
  void main() {
    float pulse = pow(max(0.0, cos(vPhase * 3.0 - uTime * 2.2)), 18.0);
    vec3 color = mix(uPrimary, uSecondary, vTint);
    gl_FragColor = vec4(color + pulse * .25, (.18 + pulse * .52) * (1.0 - uName) * uIntro);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

function addBackdrop(scene, colors) {
  const geometry = new THREE.PlaneGeometry(2, 2)
  const material = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(colors.primary) }, uBackground: { value: new THREE.Color(colors.background) } },
    depthWrite: false,
    depthTest: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, .999, 1.0); }',
    fragmentShader: `
      uniform vec3 uColor; uniform vec3 uBackground; varying vec2 vUv;
      void main() {
        vec2 center = (vUv - vec2(.5,.53)) * vec2(.8,1.2);
        float glow = exp(-dot(center,center)*12.0);
        vec3 color = uBackground + uColor * glow * .018;
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }`,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.renderOrder = -10
  mesh.frustumCulled = false
  scene.add(mesh)
}

/** Each instance owns its renderer, generated atlas, listeners, and GPU buffers. */
export function createDigitalScene(canvas, { variant = 'matrix', onReady = () => {}, onError = () => {}, label = 'DAMON' } = {}) {
  const kind = Object.hasOwn(palettes, variant) ? variant : 'matrix'
  const colors = palettes[kind]
  let width = Math.max(1, canvas.clientWidth || innerWidth)
  let height = Math.max(1, canvas.clientHeight || innerHeight)
  let renderer
  let texture
  let built
  const scene = new THREE.Scene()
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
    texture = glyphAtlas()
    built = makeDigitalGeometry({ variant: kind, mobile: width < 700, label })
  } catch (error) {
    renderer?.dispose()
    texture?.dispose()
    let cancelled = false
    queueMicrotask(() => { if (!cancelled) onError(error) })
    return { setProgress() {}, setPaused() {}, setReducedMotion() {}, dispose() { cancelled = true } }
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(colors.background)
  const camera = new THREE.PerspectiveCamera(42, width / height, .1, 160)
  const uniforms = {
    uTime: { value: 0 }, uNameIn: { value: 0 }, uSystem: { value: 0 }, uName: { value: 0 },
    uVariant: { value: ['matrix', 'signature', 'neural'].indexOf(kind) },
    uDpr: { value: 1 }, uDistance: { value: 18 }, uIntro: { value: 0 },
    uPointer: { value: new THREE.Vector2(-1000, -1000) }, uResolution: { value: new THREE.Vector2(width, height) },
    uHover: { value: 0 }, uGlyphs: { value: texture },
    uPrimary: { value: new THREE.Color(colors.primary) }, uSecondary: { value: new THREE.Color(colors.secondary) },
  }
  const group = new THREE.Group()
  const points = new THREE.Points(built.geometry, new THREE.ShaderMaterial({
    uniforms, vertexShader: particleVertex, fragmentShader: particleFragment,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  }))
  points.frustumCulled = false
  group.add(points)
  if (built.networkGeometry) {
    const edges = new THREE.LineSegments(built.networkGeometry, new THREE.ShaderMaterial({
      uniforms, vertexShader: networkVertex, fragmentShader: networkFragment,
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    }))
    edges.frustumCulled = false
    group.add(edges)
  }
  scene.add(group)
  addBackdrop(scene, colors)

  let disposed = false, failed = false, compiled = false, announced = false
  let paused = false, reduced = false, progress = 0, elapsed = 0, introTime = 0
  let frame = 0, lastTime = 0, pointerX = 0, pointerY = 0
  const stationary = () => paused || reduced
  const fail = (error) => {
    if (disposed || failed) return
    failed = true
    cancelAnimationFrame(frame)
    frame = 0
    canvas.dataset.digitalState = 'error'
    onError(error)
  }
  function render(timestamp) {
    frame = 0
    if (disposed || failed || !compiled || document.hidden) return
    if (lastTime && timestamp - lastTime < 1000 / 30 - 1 && !stationary()) {
      frame = requestAnimationFrame(render)
      return
    }
    const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, .08) : 1 / 30
    lastTime = timestamp
    if (!stationary()) { elapsed += delta; introTime += delta }
    const currentProgress = reduced ? .47 : progress
    const nameIn = smooth(.12, .38, currentProgress)
    const system = smooth(.60, .84, currentProgress)
    const name = nameIn * (1 - system)
    uniforms.uTime.value = reduced ? 0 : elapsed
    uniforms.uNameIn.value = nameIn
    uniforms.uSystem.value = system
    uniforms.uName.value = name
    uniforms.uIntro.value = stationary() ? 1 : smooth(0, 1.15, introTime)
    const narrow = width < 700
    const distance = Math.max(18, (narrow ? 12.6 : 12.1) / (2 * Math.tan(THREE.MathUtils.degToRad(21)) * camera.aspect))
    uniforms.uDistance.value = distance
    const easing = stationary() ? 1 : 1 - Math.exp(-delta * 2.5)
    const targetX = reduced ? 0 : pointerY * .025 * (1 - name * .7)
    const targetY = reduced ? 0 : pointerX * .08 * (1 - name * .85)
    if (!paused || reduced) {
      group.rotation.x += (targetX - group.rotation.x) * easing
      group.rotation.y += (targetY - group.rotation.y) * easing
    }
    camera.position.set(0, 1.25, distance)
    camera.lookAt(0, 1, 0)
    try {
      renderer.render(scene, camera)
      canvas.dataset.digitalState = 'ready'
      canvas.dataset.digitalVariant = kind
      canvas.dataset.digitalFrame = String(renderer.info.render.frame)
      canvas.dataset.digitalProgress = currentProgress.toFixed(3)
      if (!announced) { announced = true; onReady() }
    } catch (error) { fail(error); return }
    if (!stationary() && !disposed && !failed) frame = requestAnimationFrame(render)
  }
  function invalidate() {
    if (!frame && compiled && !disposed && !failed && !document.hidden) frame = requestAnimationFrame(render)
  }
  function resize() {
    width = Math.max(1, canvas.clientWidth || innerWidth)
    height = Math.max(1, canvas.clientHeight || innerHeight)
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, width < 700 ? 1.3 : 1.5))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // Reserve the upper 230px for the phone selector and keep the name above
    // the lower copy. Short phones need a pixel floor instead of a fixed ratio.
    const artCenter = Math.min(height * .63, Math.max(290, height * .425))
    const verticalOffset = width < 700 ? height * .5 - artCenter : height * .04
    camera.setViewOffset(width, height, 0, verticalOffset, width, height)
    camera.updateProjectionMatrix()
    uniforms.uDpr.value = renderer.getPixelRatio()
    uniforms.uResolution.value.set(width, height)
    invalidate()
  }
  function pointermove(event) {
    if (stationary() || event.pointerType === 'touch') return
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left, y = event.clientY - rect.top
    if (x < 0 || y < 0 || x > width || y > height) return pointerleave()
    pointerX = x / width - .5
    pointerY = y / height - .5
    uniforms.uPointer.value.set(x, height - y)
    uniforms.uHover.value = 1
  }
  function pointerleave() {
    if (stationary()) return
    uniforms.uHover.value = 0
    pointerX = pointerY = 0
  }
  function visibilitychange() {
    cancelAnimationFrame(frame)
    frame = 0
    lastTime = 0
    if (!document.hidden) invalidate()
  }
  function contextlost(event) {
    event.preventDefault()
    fail(new Error('The digital sculpture WebGL context was lost.'))
  }
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
  observer?.observe(canvas)
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', pointermove, { passive: true })
  document.documentElement.addEventListener('pointerleave', pointerleave)
  document.addEventListener('visibilitychange', visibilitychange)
  canvas.addEventListener('webglcontextlost', contextlost)
  resize()
  camera.position.set(0, 1.25, 18)
  camera.lookAt(0, 1, 0)
  renderer.compileAsync(scene, camera).then(() => {
    if (disposed || failed) return
    compiled = true
    invalidate()
  }).catch(fail)

  return {
    setProgress(value) {
      progress = clamp(Number.isFinite(value) ? value : 0)
      invalidate()
    },
    setPaused(value) {
      paused = Boolean(value)
      lastTime = 0
      invalidate()
    },
    setReducedMotion(value) {
      reduced = Boolean(value)
      if (reduced) {
        pointerX = pointerY = 0
        uniforms.uHover.value = 0
      }
      lastTime = 0
      invalidate()
    },
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', pointermove)
      document.documentElement.removeEventListener('pointerleave', pointerleave)
      document.removeEventListener('visibilitychange', visibilitychange)
      canvas.removeEventListener('webglcontextlost', contextlost)
      scene.traverse((object) => {
        object.geometry?.dispose()
        object.material?.dispose()
      })
      texture.dispose()
      renderer.dispose()
      delete canvas.dataset.digitalFrame
      delete canvas.dataset.digitalProgress
      delete canvas.dataset.digitalState
      delete canvas.dataset.digitalVariant
    },
  }
}
