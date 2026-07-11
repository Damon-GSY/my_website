# Z-Balance + Agent-Orchestration Reframe — Spec for dev team

> Branch: `feature/optimization-landscape-3d`. Apply Z-shape editorial composition
> to the 6 waypoints + reframe copy toward "agent orchestration expedition."
> KEEP the 60fps canvas (renderer.ts), all effects (gradient hero/contact headlines,
> EncryptedText on mid headings, NumberTicker hero stats, MagneticButton contact CTA,
> inline trajectory details, 6 papers cards). DO NOT touch renderer.ts / canvas / math.ts.

## Z-shape principle (from layout ref #23)
Headline anchors **top-left** → content flows **down** → a right-side/bottom-right
element terminates the Z. Generous whitespace, asymmetric balance, strong hierarchy.
Currently waypoints 2-5 are `alignItems: 'center'` (vertically centered) — change to
**top-anchored** so the heading sits top-left and content flows downward (the
right-side scroll-progress bar already provides the Z's right anchor).

## Per-waypoint changes

### 1. Hero (sceneOne) — `Find the path before the answer.`
- **Layout**: top-anchor the content block (currently centered). Move the 4 stats
  from below the subtitle to a **bottom-right** absolute block (the Z's terminating
  point). Headline + subtitle stay top-left.
- **Copy**: subtitle → `"I orchestrate AI agents to explore problems that resist
  single-pass solutions — mapping the terrain before any model moves through it."`
- Keep: gradient headline, the 4 NumberTicker stats (4 / 100+ / 90% / <1s).

### 2. Multi-Agent Engine (was "Research axes") — waypoint 02
- **Layout**: `alignItems: 'center'` → `alignItems: 'flex-start'` + `paddingTop:
  'clamp(7rem,14vh,10rem)'`. Heading top-left, 4 DataRow rows flow down.
- **Copy**: label `"Research axes · waypoint 02"` → `"Multi-agent engine · 02"`.
  Heading keep `"Four axes. One agent."`
- Keep: 4 DataRows (planning/tool/memory/eval), EncryptedText heading.

### 3. Directions explored (was "Production") — waypoint 03
- **Layout**: same top-anchor change as #2.
- **Copy**: label `"Production trace · waypoint 03"` → `"Directions explored · 03"`.
  Heading keep `"Systems that survive contact with reality."`
- Keep: 4 project DataRows, EncryptedText heading.

### 4. Evaluator record (was "Papers") — waypoint 04
- **Layout**: same top-anchor change.
- **Copy**: label `"Research record · waypoint 04"` → `"Evaluator record · 04"`.
  Heading keep `"Claims must survive the benchmark."`
- Keep: 6 cards grid, EncryptedText heading.

### 5. Evolution (was "Trajectory") — waypoint 05
- **Layout**: same top-anchor change.
- **Copy**: label `"Trajectory · waypoint 05"` → `"Evolution · 05"`. Heading
  `"Research, then production."` → `"Evolution of the search."`
- Keep: inline trajectory details (4 rows with detail lines), blog list (3 posts),
  EncryptedText heading.

### 6. Philosophy / Contact — `Continue the search.`
- **Layout**: keep centered (bookend) + MagneticButton email CTA.
- **Copy**: add a philosophy line under the heading (before the subtitle):
  `"I design systems where intelligence emerges from exploration, verification, and iteration."`
  Keep heading + gradient + `"Loss minimum reached · Δ 0.0001"` label + subtitle + CTA.

## Constraints
- Only edit `src/App.tsx`. Do NOT modify renderer.ts, math.ts, effects.tsx, index.css.
- Keep `npx tsc --noEmit` + `npm run build` green.
- Do not remove any existing effect/asset.
- The Z top-anchor is the main layout change; do NOT restructure the JSX structure
  beyond the alignItems/padding + the hero stats relocation + the copy strings.
- Match existing inline-style conventions (CSSProperties, clamp(), the ACCENT/INK/MUTED/LINE tokens).

## Acceptance
- 6 waypoints top-anchored (Z-flow), copy reframed per above.
- Build + tsc green.
- Visual: heading top-left, content flowing down, generous top whitespace, balanced.
