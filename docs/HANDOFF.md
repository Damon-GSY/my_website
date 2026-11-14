# Handoff — dimensional site

Written 2026-11-14 when the session approached the 5-hour usage limit. Branch: `claude/serene-cori-mookmf`, everything pushed.

## State

Phases 1 and 2 of `docs/plans/2026-11-14-dimensional-site-plan.md` are built: the foundation and all three openings. Phase 3 (the full site) is not started and needs a direction to be chosen first.

| Route | What happens | State |
| --- | --- | --- |
| `/` | Chooser with the three directions | Built, not screenshot-checked |
| `/parcel` | Flat box net reading "Damon Guan / I build agents / that ship." folds into a box, turns to show the shipping label, unfolds inside-out, and its six faces land on the six work cards | Works, desktop and phone |
| `/descent` | Flat page with contour lines tilts into a lit loss landscape; the headline's orange full stop rolls down it (SFT basin, then the surface changes for RL); terrain flattens, rings unroll into the work-list rules | Works, desktop and phone |
| `/rollout` | The big percentage falls from 100% to 35.8% and narrows as you scroll through a 3D decision tree; the tree collapses into one flat trace above the work list | Works, desktop and phone |

## Run

```bash
npm install
npm run dev        # or: npm run build && npm run preview
```

`npm run lint` and `npm run build` both pass.

## How it was checked

Headless Chromium with software WebGL, 12 scroll positions per route at 1440×900 and 390×844, no console errors. That is all. Not checked:

- real GPU frame rate, Safari, or a physical phone
- the static fallback (reduced motion, no WebGL): written, never rendered
- Chinese mode: strings exist, never rendered
- the plan's acceptance checks in section 8 (pixel difference at the DOM handoff, same frame when arriving from above and below)

## Added after the first handoff

- `/ink`: full-screen hero, wordmark DAMON GUAN; the pointer paints a gooey trail that reveals moving ink. Built from Damon's pasted reference spec. The reference video is in `public/ink/` as `ink.webm` (VP9) and `ink.mp4` (H.264), converted from the HEVC original, which most browsers cannot play. It loops by cross-fading two video elements; if neither file plays, the ink is generated in the shader.
- Damon is no longer based in Hangzhou. The city line is removed from the chooser, the Descent hero and the Parcel label. Still unconfirmed: current city and employer. The Parcel route still ends at `HGH 2025–`.

## Known rough edges

**Parcel**
- The net is small on phones (about 86 px per face); the face text is not readable there.
- The shipping label is only visible while the box turns.
- Cards take their background from the same canvas image as the box faces, so the swap is seamless, but card text only appears after landing.

**Descent**
- The ring-to-rule morph looks loose in the middle: lines cross each other for a moment.
- The trail has a small loop where the ball overshoots; it is real momentum, but may read as a glitch.
- Not built from the plan: captions pinned to the surface, and the footer "your run" chart (only the small live loss curve exists).

**Rollout**
- The visitor does not choose branches; scrolling follows one fixed path.
- Chapter labels (Train, Deploy, Evaluate) are very small.
- On phones the tree runs behind the lower part of the hero text.
- The WebGL trace and its SVG twin are drawn from the same numbers but were not compared pixel by pixel.

**All**
- Three.js is a 479 kB chunk (121 kB gzipped), loaded only on the opening routes.
- Fonts: Archivo and Newsreader are self-hosted; Chinese text uses system fonts.
- `profile.email` in `src/content.js` is still the unconfirmed `hello@damon.ai`.

## Where things are

- `src/content.js`: all copy and facts (English and Chinese).
- `src/engine/`: `timeline.js` (scroll to damped progress), `stage.js` (pixel-space camera, `setView({ flat, tilt, yaw })`), `dock.js` (DOM rect to stage coordinates), `useFilm.js` (wires a scene to a page, handles fallback).
- `src/directions/<name>/Scene.js`: one `frame(p)` function per opening; every timing is a `span(p, start, end)` in that function.

## Next

1. Damon picks a direction (or a mix).
2. Fix that direction's rough edges above and run the section 8 acceptance checks.
3. Phase 3: sections after the opening (Research, Path, Notes, Contact), case and note pages, Chinese typography, and a rendered check of the static fallback.
