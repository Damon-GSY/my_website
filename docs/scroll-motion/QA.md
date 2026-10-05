# Scroll motion verification

Verified on 2026-10-05 against the production build at `http://localhost:4176`.
The consolidated evidence is `/workspace/noir-motion-check/verified.json`: **32 passing checks, no unexpected application errors**. Screenshots and detailed metrics remain in the cloud workspace rather than adding large test artifacts to the repository.

## What was checked

| Area | Evidence |
| --- | --- |
| Noir live particles | Sphere, torus, tool network, and GDAMON poses at 1440×900, 390×844, 320×568, and 844×390. Fine scroll increments, reversing to the same pose, readable type, bounded artwork, native cursor, and no horizontal overflow. |
| Seed / Relay / Lens | Actual desktop and mobile videos loaded, paused, and scrubbed in both directions. Each source has 96 frames at 24 fps; its final decoded frame is 95 at `95 / 24` seconds. Held views stop scheduling animation frames and stop seeking. No `video.play()` calls. |
| Short screens | Generated study artwork and both project links remain visible at 320×568 and 844×390. The pinned panels fit the viewport. |
| Accessible fallbacks | Reduced motion, unavailable WebGL, live context loss, failed media, and missing/invalid timeline manifests expose static content with usable project links. Invalid manifests do not request a video. Changing the motion preference back restores the live story when WebGL is available. |
| Loading and navigation | Delayed Anton loading does not expose invisible chapter CTAs to Tab focus. Direct `#noir-train` navigation and its project case work. The index opens Noir in its intended new tab; the Oil gallery opens the same route in place. The current thumbnail loads at 390 px. |
| Film | Fine sampling across both transitions at 1440×900 and 390×844 confirms anticipation, arc travel, and settlement. Reversing returns identical shape weights without rebuilding geometry; resting stops animation frames. |
| Matter | Both transitions checked at 1440×900, 390×844, 320×568, and 844×390. The phone camera uses the space between copy and evidence; particles no longer cross those text regions. Original silhouette handoff, reverse movement, and resting behavior remain intact. |

Visual review included intermediate poses, not only endpoints. Representative screenshots:

- `/workspace/noir-motion-check/final/noir-1440-0.png`
- `/workspace/noir-motion-check/final/noir-seed-1440-50.png`
- `/workspace/noir-motion-check/final/noir-relay-1440-50.png`
- `/workspace/noir-motion-check/final/noir-lens-390-50.png`
- `/workspace/noir-motion-check/film-production/film-1440-pose-365.png`
- `/workspace/noir-motion-check/matter-production-compact/matter-320-pose-550.png`

## Reproduce

Start a production preview after building:

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4176 --strictPort
```

In a second terminal:

```bash
node scripts/check-noir-motion.mjs http://localhost:4176 /tmp/noir-motion/all all
node scripts/check-noir-motion.mjs http://localhost:4176 /tmp/noir-motion/integrity integrity
node scripts/check-noir-motion.mjs http://localhost:4176 /tmp/noir-motion/index index
node scripts/check-noir-motion.mjs http://localhost:4176 /tmp/noir-motion/flow flow
node scripts/check-noir-motion.mjs http://localhost:4176 /tmp/noir-motion/matter-compact flow-matter-compact
```

The script uses `/usr/bin/chromium`; set `CHROMIUM_EXECUTABLE` for a different installation. Run browser checks serially.

## Evidence and limits

The accepted results combine the passing visual cases from `final/report.json` with the corrected independent lifecycle cases in `lifecycle/report.json`, metadata checks in `integrity/report.json`, the delayed-font rerun in `font/report.json`, and `index/report.json`. Film and Matter evidence is in `film-production`, `matter-production-compact`, and the desktop Matter case in `flow-production`. The consolidated record identifies superseded test-harness assumptions explicitly; they are not counted as product failures or passing checks.

Chromium uses software WebGL in this environment. These checks establish correct rendering, scrolling, reversal, and idle behavior; they do not establish a hardware frame rate. Phone and landscape checks use viewport emulation, not physical Safari or Android devices. Generation source review and native-frame provenance are recorded separately under `motion-studies/noir/`.
