# Damon Guan — personal site

Three opening studies for one site. In each, a 3D object and the 2D page are the same object seen two ways.

| Route | Direction | 3D ↔ 2D |
| --- | --- | --- |
| `/parcel` | The page is a box net: it folds, ships, and unpacks into the work cards | box ↔ net ↔ grid |
| `/descent` | The flat page was lying on a loss landscape | terrain ↔ contour map ↔ list rules |
| `/rollout` | The visitor is the agent; the decision tree collapses into one trace | branching space ↔ flat trace |

`/` is the chooser. The plan and the remaining phases are in `docs/plans/2026-11-14-dimensional-site-plan.md`.

## Run

```bash
npm install
npm run dev
```

## Map

- `src/content.js`: all copy and facts, English and Chinese.
- `src/engine/`: scroll timeline, pixel-space stage with the perspective-to-flat camera, DOM docking.
- `src/directions/<name>/`: one scene, one page and one stylesheet per direction.

With reduced motion or without WebGL each route shows a static page with the same content.
