// Canvas-2D parallax renderer.
// Draws the landscape + foreground parallax layers into ONE canvas at 1x
// resolution, so the DOM composites a single element instead of multiple
// fullscreen blended <img> layers (the GPU-composite burst behind scroll jank).
// See docs/plans/2026-07-11-optimization-landscape-handoff.md.

export type LandscapeImages = { landscape: string; foreground: string }

const clamp = (v: number) => Math.min(1, Math.max(0, v))

/** Landscape layer transform (pure). Mirrors the App.tsx z1 layer style. */
export function landscapeXform(p: number, vw: number, vh: number) {
  return {
    tx: -p * 3.5 * (vw / 100),
    ty: (5 - p * 10) * (vh / 100),
    scale: 1.04 + p * 0.38,
    opacity: 0.88,
    filter: 'brightness(.64) saturate(.9) contrast(1.18)',
    ox: 0.52,
    oy: 0.54,
  }
}

/** Foreground layer transform (pure). Mirrors the App.tsx z5 layer (screen + linear mask). */
export function foregroundXform(p: number, vw: number, vh: number) {
  return {
    tx: (-5 - p * 8) * (vw / 100),
    ty: (18 - p * 30) * (vh / 100),
    scale: 1.22 + p * 0.84,
    opacity: 0.17 + (1 - p) * 0.15,
    filter: 'blur(1px) brightness(.48) contrast(1.16)',
    ox: 0.43,
    oy: 0.68,
  }
}

type Xform = ReturnType<typeof landscapeXform>

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
  xf: Xform,
) {
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const over = 1.12 // overscan so parallax translate never reveals an edge
  const s = Math.max(cw / iw, ch / ih) * over
  const dw = iw * s
  const dh = ih * s
  const dx = (cw - dw) * xf.ox
  const dy = (ch - dh) * xf.oy
  ctx.save()
  ctx.globalAlpha = xf.opacity
  ctx.filter = xf.filter
  ctx.translate(xf.tx, xf.ty)
  ctx.translate(cw / 2, ch / 2)
  ctx.scale(xf.scale, xf.scale)
  ctx.translate(-cw / 2, -ch / 2)
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.restore()
}

export function createLandscapeRenderer(
  canvas: HTMLCanvasElement,
  images: LandscapeImages,
) {
  const ctx = canvas.getContext('2d')!
  let target = 0
  let dirty = true
  let raf = 0

  const make = (src: string) => {
    const img = new Image()
    img.onload = () => { dirty = true }
    img.src = src
    return img
  }
  const landscape = make(images.landscape)
  const foreground = make(images.foreground)
  const fgMask = document.createElement('canvas') // offscreen for the masked foreground

  function resize() {
    // 1x backing resolution (NOT devicePixelRatio x2) — the whole point.
    const w = Math.round(window.innerWidth)
    const h = Math.round(window.innerHeight)
    canvas.width = w
    canvas.height = h
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    fgMask.width = w
    fgMask.height = h
    dirty = true
  }

  function draw() {
    const cw = canvas.width
    const ch = canvas.height
    const vw = window.innerWidth
    const vh = window.innerHeight
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.filter = 'none'
    ctx.fillStyle = '#0a0a0c'
    ctx.fillRect(0, 0, cw, ch)

    if (landscape.complete && landscape.naturalHeight) {
      drawCover(ctx, landscape, cw, ch, landscapeXform(target, vw, vh))
    }

    // z2 darkening gradient (between landscape and foreground — preserves layering)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.filter = 'none'
    const gg = ctx.createLinearGradient(0, 0, 0, ch)
    gg.addColorStop(0, 'rgba(3,4,4,.94)')
    gg.addColorStop(0.39, 'rgba(3,4,4,.34)')
    gg.addColorStop(0.72, 'rgba(3,4,4,.04)')
    gg.addColorStop(1, 'rgba(3,4,4,.44)')
    ctx.fillStyle = gg
    ctx.fillRect(0, 0, cw, ch)

    // foreground: offscreen draw -> linear mask (destination-in) -> screen-blend onto main
    if (foreground.complete && foreground.naturalHeight) {
      const o = fgMask.getContext('2d')!
      o.setTransform(1, 0, 0, 1, 0, 0)
      o.globalCompositeOperation = 'source-over'
      o.globalAlpha = 1
      o.filter = 'none'
      o.clearRect(0, 0, cw, ch)
      drawCover(o, foreground, cw, ch, foregroundXform(target, vw, vh))
      // mask: transparent 0-32%, fade to opaque by 71%, opaque to bottom (matches App.tsx z5 mask)
      o.globalCompositeOperation = 'destination-in'
      const g = o.createLinearGradient(0, 0, 0, ch)
      g.addColorStop(0.32, 'rgba(0,0,0,0)')
      g.addColorStop(0.71, 'rgba(0,0,0,1)')
      g.addColorStop(1, 'rgba(0,0,0,1)')
      o.fillStyle = g
      o.fillRect(0, 0, cw, ch)
      // screen-blend onto main (black areas add nothing)
      ctx.globalCompositeOperation = 'screen'
      ctx.filter = 'none'
      ctx.globalAlpha = 1
      ctx.drawImage(fgMask, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  function tick() {
    if (dirty) {
      draw()
      dirty = false
    }
    raf = requestAnimationFrame(tick)
  }

  function onScroll() {
    const range = document.documentElement.scrollHeight - window.innerHeight
    target = range > 0 ? clamp(window.scrollY / range) : 0
    dirty = true
  }

  resize()
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', resize)
  raf = requestAnimationFrame(tick)

  return {
    setProgress(p: number) {
      target = clamp(p)
      dirty = true
    },
    dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
    },
  }
}
