# Optimization Landscape — Build Spec

> Single-file immersive parallax personal site. Scroll-driven descent through a
> mathematical optimization space. Status: **design locked, ready to build**.

## 1. Goal & narrative

A cinematic, scroll-driven single-page site where the visitor descends along a
warm terracotta optimization path toward a loss minimum. Pure computational
topology — **no people, no buildings, no doors** (the source prompt forbids
them). Personal content (Damon's research/work/papers/contact) rides as
**waypoint overlays** along the descent.

## 2. Locked decisions (from grilling)

- **A — Hybrid**: landscape is the persistent cinematic backdrop (sticky
  viewport); content appears as scroll-triggered waypoint overlays.
- **No name**: "Damon Guo-Siyi" never appears as a big name card. Identity is
  conveyed implicitly by the work + email/GitHub.
- **6-waypoint spine** (the descent): tagline → research axes → Alibaba work →
  papers → trajectory → contact.
- **Papers**: all 4 included (SupChain-Bench, agent-eval survey, VisualDeltas,
  multi-turn eval).
- **Blog**: one seed/placeholder waypoint designed for future writing (no full
  blog routes).
- **Tech — approach X**: hand-written, zero animation deps; React + TS + Tailwind
  + Vite only. Benchmark vs Lenis / GSAP during impl, pick by data.
- **Copy language**: English (fonts Viaoda Libre + Imprima are Latin-only).
- **Colors**: bg `#0a0a0c`, accent `#d97757`, rest black/grey/white.

## 3. Reference: the dragon prompt (proven engine, reused)

The dragon "portal" prompt is a **working reference implementation** of approach
X. Keep its engine; drop its signature mechanic.

- **Keep**: single sticky viewport (`480vh` outer / `100vh` sticky inner); single
  `requestAnimationFrame` loop with threshold-gated `setState` (delta > 0.0004);
  `clamp/lerp/easeInOut` helpers; mouse parallax (per-layer MAG, lerp 0.07,
  desktop-only); entrance choreography (100/600/2200ms stagger); 3-tier
  responsive via Tailwind classes; vignette + gradient overlays.
- **Drop**: portal / arch / door-hole mask / `ARCH_MASK` generation / frame-split
  (all dragon-specific). Continuous **dolly** replaces "walk through portal".
- **Swap**: `DRAGON` → `landscape`; embers → additive `light` layer; ReelCard /
  arc slider → 6 content waypoints.

## 4. Assets (compressed + analyzed)

Source: `src/assets/optimization-{foreground,landscape,depth,light}.png` — each
2944×1648, **24MB total, RGB-only, zero alpha channel** (RGB-on-black renders).

- **Compressed** (verified): `public/assets/optimization-*.webp`, 2560×1433, q80–84,
  **942KB total (96% off)**. Budget-asserted by `tools/preprocess-assets.py`.
- **Still TODO**: darks-crush preprocess for `depth` + `light` so their non-content
  areas go to true black (needed for clean `screen` blend).

### Layer model (z-stack, bottom → top) — alpha-free, blend-mode based

| z | Layer | Pixels | Render |
|---|-------|--------|--------|
| 0 | `landscape` | dark terrain, even | opaque `<img cover>`, slowest parallax + dolly scale |
| 1 | `depth` | near-black center, edge topology | darks-crush → `mixBlendMode: screen`, medium parallax |
| 2 | `light` | bright terracotta center | darks-crush → `mixBlendMode: screen`, the path guide |
| 3 | `foreground` | bright center, dark edges, no hollow | opaque + **CSS radial mask** (fake center hollow) for occlusion; fastest parallax; crossfades through scroll |
| 4 | vignette/gradients | — | cinematic depth |
| 20–44 | 6 content waypoints | — | scroll-triggered fade overlays |
| 50 | nav + scroll cue | — | — |

## 5. Scroll structure (map waypoints to the descent)

Single scroll progress `sp ∈ [0,1]`. Continuous dolly = uniform scale-up on world
layers + differential parallax + opacity crossfades. Waypoints fade in/out at
threshold bands (e.g. waypoint k occupies `sp ∈ [k/N - ε, k/N + ε]`). Exact
thresholds tuned during build + verified visually.

Two "scenes" per source prompt: **Scene 1** (entering the landscape, waypoints
0–3) → **Scene 2** (approaching the loss minimum, waypoints 4–5 + intensified
glow/density). Scene 2 ramps volumetric light + contour density.

## 6. Toolchain reality (from main's package.json)

- Vite 6 + React 19 + **Tailwind v4** (`@tailwindcss/vite`, CSS-first `@theme` —
  NOT v3 `tailwind.config.js`). Reuse existing setup; do NOT copy the dragon
  prompt's v3 config.
- Drop runtime deps for this site: `framer-motion`, `react-router-dom`,
  `lucide-react` (inline SVGs instead). `gsap`/`lenis` remain installed for the
  benchmark comparison only.
- All logic centralized in `src/App.tsx` (per prompt).

## 7. TDD plan

- **Install vitest** (vite-native) for pure-function units: `clamp/lerp/easeInOut`,
  scroll-progress derivation, waypoint threshold bands, scale/opacity curves.
  Red → implement → green.
- **Playwright** (already a dep) for visual/scroll verification — reuse
  `tools/record.cjs` to capture scroll-through gifs (static screenshots hide
  motion, per project memory `motion-review-pipeline`).

## 8. Multi-agent build plan

OMC `team` / `ultrawork` orchestration, lanes:
1. **preprocess** — darks-crush script for depth/light; commit webp + script.
2. **engine** (TDD) — sticky viewport + rAF loop + parallax/dolly math (vitest).
3. **layers** — wire the z-stack with blend modes + masks.
4. **content** — 6 waypoint overlays from `src/data/about.js` (+ papers).
5. **benchmark** — swap scroll engine (hand-written / Lenis / GSAP), measure FPS +
   LOC + bundle; if GSAP lane, install the GSAP skill for that agent
   (https://github.com/greensock/gsap-skills).
6. **verify** — Playwright scroll capture + Lighthouse budget.

## 9. Open question (blocking agent launch)

- **"gstack"** — referenced by the user as the multi-agent approach to follow, but
   not found in filesystem or conversation history. Need user to point at a
   repo/URL/skill, or confirm "just use OMC's standard team pattern".
