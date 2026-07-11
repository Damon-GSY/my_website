# Optimization Landscape — Handoff (2026-07-11)

> Status: site builds + works, but real-wheel-scroll has periodic stutter bursts.
> This doc is the shared brain for the next teams (engine / visual / animation).

## Project
Single-page immersive parallax personal site on `feature/optimization-landscape-3d`
(from main). Scroll-driven descent through a mathematical optimization space to a
loss minimum. Stack: React 19 + TS + Tailwind v4 + Vite, zero animation deps
(hand-written rAF engine). Spec: `docs/plans/2026-07-10-optimization-landscape-build.md`.

## Done (commits f644fbb → 98f7b7b)
- **Assets**: 4 source PNGs (24MB) → webp 2048px (~578KB total) via
  `tools/preprocess-assets.py` (budget-asserted). Source PNGs gitignored.
- **App.tsx** (264 lines): adopted a high-quality codex-authored base, refined —
  removed name branding, added blog-seed waypoint, extracted pure math to
  `src/landscape/math.ts`.
- **Parallax reduced** 4 moving layers → 2 (landscape-with-baked-glow + foreground).
  Dropped depth / noise / scan-lines. Static filters + vignette. Particles 36→14.
  No backdrop-filter. Light glow baked into landscape
  (`tools/bake-light-into-landscape.py`).
- **Scroll**: instant tracking (no lerp) — fixes reversal overshoot + input lag.
  Tightened waypoint bands (clean handoffs, no double-headline).
- **Tests**: 15 vitest tests on `math.ts` (green). tsc clean. Build green
  (210KB / 66KB-gzip, React-only — no framer/router/lucide/gsap in bundle).
- **Design QA**: ZAI-verified hero/papers/contact GOOD (contrast fixed, glow
  preserved through the bake).

## The real problem (still "十分卡")
Measured with **real wheel events** (`page.mouse.wheel`, not programmatic
`scrollTo` — programmatic was artificially heavier and masked the real story):
- **52 fps AVG**, p50 = 17ms (most frames are 60fps), **but p90 = 33ms, max = 66ms**
  → periodic **stutter bursts**, not uniformly low fps. The bursts are what feels 卡.
- CDP trace during wheel scroll (5s): **GPU = 886ms**, render (paint/raster/comp/
  layout/style) = 101ms, **GC = 22ms (negligible)**, RunTask = 5324ms (mostly
  GPU-wait). → **GPU-composite-bound.** Bursts are GPU composite spikes.

## Ruled out (don't waste time)
- **React per-frame re-render / GC**: only 22ms. NOT the bottleneck. A ref-based
  React-bypass refactor will NOT fix the bursts.
- **Smaller textures** (already 2048): composite is output-pixel-bound (retina
  device pixels), not texture-pixel-bound.
- **More layer drops**: only landscape + foreground remain; dropping either kills
  the parallax or the occlusion.

## Next — the real fix
**Canvas/WebGL rewrite of the parallax renderer.** Draw all layers into a SINGLE
canvas texture at controlled resolution (render at 1x or 1.5x, NOT retina 2x);
the DOM composites ONE element. This:
- Eliminates the multi-fullscreen-layer GPU composite (the burst source).
- Controls composite pixel count (1x = ¼ the retina work).
- Preserves the look (same layers, same transforms, just rendered to canvas).
Effort ~1–2h. This is the only path to consistent 60fps on a loaded integrated GPU.

Fallback: accept current (52fps avg + occasional bursts) — usable, not buttery.

## Teams (proposed)
- **engine** (executor + `tdd` skill): the canvas/WebGL renderer + tests. Owns a
  new `src/landscape/renderer.ts` (canvas draw loop) + `src/App.tsx` (mounts the
  canvas, keeps content overlays).
- **visual** (designer + `visual-verdict` skill + ZAI `analyze_image`/`analyze_video`):
  verify the look is preserved through the rewrite; design-QA captures at each
  scroll position.
- **animation** (designer + GSAP skill `greensock/gsap-skills`): scroll
  choreography, easing curves, waypoint band timing; optionally drive the canvas
  animation via GSAP.

Shared task list via `TaskCreate`; this doc is the shared context.

## Model constraint (blocker for "all teams on glm-5.2[1m]")
The session is `glm-5.2[1m]`. Sub-agents **cannot inherit `[1m]`** — the OMC
enforcer denies `model:"opus"` (resolves to `glm-5.2[1m]`) for Agent/Task calls;
only `sonnet` (glm-4.7) / `haiku` work for sub-agents. So "all teams on 5.2[1m]"
is impossible via sub-agents unless a non-`[1m]` 5.2 is configured for the opus
tier (`ANTHROPIC_DEFAULT_OPUS_MODEL=glm-5.2`). Options:
(a) configure that env var; (b) teams run on sonnet; (c) I drive the cohesive
canvas rewrite at top-level (5.2[1m]) and use teams only for separable periphery
(visual QA, animation tuning, tests). See memory `model-routing-subagents`.

## Quick facts for teams
- Dev server: `npm run dev` (5173, slower). Prod preview: `npm run build && npm run preview` (4173, ~28% faster — always measure on prod).
- Headed perf harnesses in `/tmp/*.cjs` (perf-headed, perf-multi, wheel, scrub, trace, recap-*). `tools/verify-landscape.cjs` exists (port hardcode 5174 — fix or use /tmp scripts).
- ZAI MCP tools: `analyze_image`, `analyze_video`, `ui_diff_check` for visual QA.
- `src/assets/optimization-*.png` are gitignored sources; originals also in `~/Downloads`.
