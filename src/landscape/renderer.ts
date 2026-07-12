// Canvas-2D parallax renderer — draws ALL parallax layers (landscape, depth,
// light, foreground) into ONE canvas at 1x resolution. The DOM composites a
// single element, so adding more layers here is cheap (no extra DOM composite).
// This restores the full 4-layer parallax depth that was dropped for DOM-perf.
// See docs/plans/2026-07-11-optimization-landscape-handoff.md.

import { smooth } from './math'

export type LandscapeImages = { landscape: string; depth: string; light: string; foreground: string }

const clamp = (v: number) => Math.min(1, Math.max(0, v))

type Xform = {
  tx: number; ty: number; scale: number; opacity: number; filter: string; ox: number; oy: number
}

/** Landscape (z1, opaque base). */
export function landscapeXform(p: number, vw: number, vh: number): Xform {
  return {
    tx: -p * 3.5 * (vw / 100),
    ty: (5 - p * 10) * (vh / 100),
    scale: 1.04 + p * 0.38,
    opacity: 0.88,
    filter: 'brightness(.64) saturate(.9) contrast(1.18)',
    ox: 0.52, oy: 0.54,
  }
}
/** Depth (z3, mid topology, screen + linear mask). core = descent intensity. */
export function depthXform(p: number, vw: number, vh: number, core: number): Xform {
  return {
    tx: p * 5.5 * (vw / 100),
    ty: (8 - p * 15) * (vh / 100),
    scale: 1.11 + p * 0.55,
    opacity: 0.2 + core * 0.2,
    filter: 'blur(1.1px) brightness(.64)',
    ox: 0.5, oy: 0.5,
  }
}
/** Light (z4, terracotta glow path, screen + radial mask). */
export function lightXform(p: number, vw: number, vh: number, core: number): Xform {
  return {
    tx: (5 - p * 10) * (vw / 100),
    ty: (12 - p * 14) * (vh / 100),
    scale: 1.05 + p * 0.72,
    opacity: 0.07 + core * 0.42,
    filter: 'blur(2.4px) brightness(1.2) saturate(1.12)',
    ox: 0.5, oy: 0.5,
  }
}
/** Foreground (z5, near occlusion, screen + linear mask). */
export function foregroundXform(p: number, vw: number, vh: number): Xform {
  return {
    tx: (-5 - p * 8) * (vw / 100),
    ty: (18 - p * 30) * (vh / 100),
    scale: 1.22 + p * 0.84,
    opacity: 0.17 + (1 - p) * 0.15,
    filter: 'blur(1px) brightness(.48) contrast(1.16)',
    ox: 0.43, oy: 0.68,
  }
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cw: number, ch: number, xf: Xform) {
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const over = 1.12
  const s = Math.max(cw / iw, ch / ih) * over
  const dw = iw * s, dh = ih * s
  const dx = (cw - dw) * xf.ox, dy = (ch - dh) * xf.oy
  ctx.save()
  ctx.globalAlpha = xf.opacity
  ctx.filter = xf.filter
  ctx.translate(xf.tx, xf.ty)
  ctx.translate(cw / 2, ch / 2); ctx.scale(xf.scale, xf.scale); ctx.translate(-cw / 2, -ch / 2)
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.restore()
}

type MaskKind = 'depth' | 'light' | 'foreground'

function applyMask(o: CanvasRenderingContext2D, cw: number, ch: number, kind: MaskKind) {
  if (kind === 'light') {
    const cx = 0.56 * cw, cy = 0.70 * ch, R = 0.5 * Math.max(cw, ch)
    const g = o.createRadialGradient(cx, cy, 0, cx, cy, R)
    g.addColorStop(0, 'rgba(0,0,0,1)')
    g.addColorStop(0.51, 'rgba(0,0,0,1)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    o.fillStyle = g
  } else if (kind === 'depth') {
    const g = o.createLinearGradient(0, 0, 0, ch)
    g.addColorStop(0.05, 'rgba(0,0,0,0)')
    g.addColorStop(0.35, 'rgba(0,0,0,1)')
    g.addColorStop(0.82, 'rgba(0,0,0,1)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    o.fillStyle = g
  } else {
    const g = o.createLinearGradient(0, 0, 0, ch)
    g.addColorStop(0.32, 'rgba(0,0,0,0)')
    g.addColorStop(0.71, 'rgba(0,0,0,1)')
    g.addColorStop(1, 'rgba(0,0,0,1)')
    o.fillStyle = g
  }
  o.fillRect(0, 0, cw, ch)
}

export function createLandscapeRenderer(
  canvas: HTMLCanvasElement,
  images: LandscapeImages,
  options: { motionEnabled?: boolean } = {},
) {
  const motionEnabled = options.motionEnabled ?? true
  const ctx = canvas.getContext('2d')!
  let target = 0
  let dirty = true
  let raf = 0
  const mask = document.createElement('canvas')

  const make = (src: string) => {
    const img = new Image()
    img.onload = () => { dirty = true }
    img.src = src
    return img
  }
  const landscape = make(images.landscape)
  const depth = make(images.depth)
  const light = make(images.light)
  const foreground = make(images.foreground)

  function resize() {
    const w = Math.round(window.innerWidth), h = Math.round(window.innerHeight)
    canvas.width = w; canvas.height = h
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
    mask.width = w; mask.height = h
    dirty = true
  }

  function drawScreenLayer(img: HTMLImageElement, xf: Xform, kind: MaskKind, cw: number, ch: number) {
    if (!img.complete || !img.naturalHeight) return
    const o = mask.getContext('2d')!
    o.setTransform(1, 0, 0, 1, 0, 0)
    o.globalCompositeOperation = 'source-over'
    o.globalAlpha = 1
    o.filter = 'none'
    o.clearRect(0, 0, cw, ch)
    drawCover(o, img, cw, ch, xf)
    o.globalCompositeOperation = 'destination-in'
    applyMask(o, cw, ch, kind)
    ctx.globalCompositeOperation = 'screen'
    ctx.filter = 'none'
    ctx.globalAlpha = 1
    ctx.drawImage(mask, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
  }

  function draw() {
    const cw = canvas.width, ch = canvas.height
    const vw = window.innerWidth, vh = window.innerHeight
    const core = smooth(0.52, 0.94, target)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.filter = 'none'
    ctx.fillStyle = '#0a0a0c'
    ctx.fillRect(0, 0, cw, ch)

    if (landscape.complete && landscape.naturalHeight) drawCover(ctx, landscape, cw, ch, landscapeXform(target, vw, vh))

    // z2 darkening gradient
    const gg = ctx.createLinearGradient(0, 0, 0, ch)
    gg.addColorStop(0, 'rgba(3,4,4,.94)'); gg.addColorStop(0.39, 'rgba(3,4,4,.34)')
    gg.addColorStop(0.72, 'rgba(3,4,4,.04)'); gg.addColorStop(1, 'rgba(3,4,4,.44)')
    ctx.fillStyle = gg; ctx.fillRect(0, 0, cw, ch)

    drawScreenLayer(depth, depthXform(target, vw, vh, core), 'depth', cw, ch)
    drawScreenLayer(light, lightXform(target, vw, vh, core), 'light', cw, ch)
    drawScreenLayer(foreground, foregroundXform(target, vw, vh), 'foreground', cw, ch)
  }

  function tick() {
    if (dirty) { draw(); dirty = false }
    raf = requestAnimationFrame(tick)
  }
  function onScroll() {
    const range = document.documentElement.scrollHeight - window.innerHeight
    target = motionEnabled && range > 0 ? clamp(window.scrollY / range) : 0
    dirty = true
  }
  resize(); onScroll()
  if (motionEnabled) window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', resize)
  raf = requestAnimationFrame(tick)
  return {
    setProgress(p: number) { target = clamp(p); dirty = true },
    dispose() {
      cancelAnimationFrame(raf)
      if (motionEnabled) window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
    },
  }
}
