# Design QA — Oil Motion keyframe pilot

## Scope and status

Route: `/motion`. Visual direction: a titanium-and-cobalt Agent Instrument on warm ivory, with editorial typography and a cobalt contact section. Two custom generated keyframes depict its resting and open states.

**Current delivery: keyframes and responsive page. Continuous video is pending.** The public manifest has `video: null`. There is no generated opening clip and no production video-quality acceptance result. The page uses ordinary scrolling until a valid video reaches its first decoded frame.

## Visual and page checks

- Chromium screenshots reviewed at 1440×900, 1024×768, and 390×844. The mobile hero art was reduced and moved below the primary action after review.
- Functional viewport checks at 1440×900, 1024×768, 390×844, and 320×740: no horizontal overflow, page errors, or failed asset requests.
- Both keyframe illustrations load. With `video: null`, the video element has no source and no pinned scroll section is created.
- Normal-motion scroll reveals show all three work rows after navigating to selected work. Reduced-motion renders content directly.
- The three reasoning controls expose stable corresponding panels; switching to Tool Resolution displays its content and hides the prior panel. The skip link and project keyboard navigation work.
- Project links target the existing project IDs; profile, notes, email, and GitHub destinations reuse the portfolio's existing content.
- Two WebP keyframes total approximately 192 KiB, with no video payload or additional production dependency.

Captures from this environment:

- `/workspace/motion-preview-captures/motion-1440-hero.png`
- `/workspace/motion-preview-captures/motion-1440-full.png`
- `/workspace/motion-preview-captures/motion-1024-hero.png`
- `/workspace/motion-preview-captures/motion-390-hero.png`
- `/workspace/motion-preview-captures/motion-390-full.png`

## Controller and media-pipeline checks

- Browser harness with mocked media events verifies latest-target seek serialization, initial frame-zero readiness, reverse target updates, StrictMode single-source loading, reduced-motion no-load, resize stability, and error fallback.
- Load and seek watchdog checks pass: a stalled initial frame falls back after 12 seconds; a stalled seek after 8 seconds. Hidden/offscreen states suspend those budgets.
- Page integration with mocked media passes: loading retains the normal hero; ready creates the 400svh sequence; at 60% progress the hero stays pinned and its faded copy is inert; reverse scroll restores the copy; reduced motion restores the ordinary poster layout. The same video source loads once, with no page errors.
- Local importer tested with a temporary synthetic video: output contains 180 I-frames at 30 fps for 6 seconds, H.264 yuv420p at 1440×810, with no audio. A 640×360 source is rejected and existing output hashes remain unchanged. Temporary fixtures were deleted and never published.
- The strict upstream motion-budget calculation passes for the planned 180-frame source. This is a budget, not proof that generated motion exists.
- `npm run build`, `npm run lint`, and `git diff --check` pass. Vite retains its existing large Three.js chunk warning for the earlier studies.

## Remaining acceptance gate

Generate or supply the actual source video, inspect structural continuity and lighting throughout the clip, then import it and review real forward/reverse scroll playback, mobile framing, browser decoding, and measured performance. Controller mocks and synthetic importer fixtures do not establish artistic quality or real-device video behavior.

---

# Earlier QA — three experimental portfolio directions

## Current visual direction

The previous WebGL implementation placed bright lines and outlines over still hero art. In response to the user's feedback, each hero now has its own Three.js sculpture:

| Route | 3D object | Current captures |
| --- | --- | --- |
| `/experiences/path` | Brushed metal orbital mechanism with a luminous core and selectable decision nodes | `/workspace/experience-preview-captures/sculpture-v2-path-1440.png`, `/workspace/experience-preview-captures/sculpture-v3-path-390.png` |
| `/experiences/field-notes` | Curved printed pages, layered paper, spines, and an embossed seal | `/workspace/experience-preview-captures/sculpture-v2-field-notes-1440.png`, `/workspace/experience-preview-captures/sculpture-v3-field-notes-390.png` |
| `/experiences/world-model` | Isometric operational city with rounded buildings, routes, packages, and moving carriers | `/workspace/experience-preview-captures/sculpture-v2-world-model-1440.png`, `/workspace/experience-preview-captures/sculpture-v3-world-model-390.png` |

The earlier visual references remain in `/workspace/generated_images/`. They established each page's editorial typography and palette; the hero objects were redesigned as actual 3D geometry after visual review.

## Visual review

- The three objects have separate silhouettes, materials, lighting, and movement. The Path uses warm metal and acid yellow against black; Field Notes uses textured paper, cobalt, and coral against warm white; World Model uses white architecture, cobalt routes, and coral parcels against lavender.
- At 1440 × 900 and 390 × 844 CSS pixels, the headlines, primary action, 3D object, and page controls have readable hierarchy. Mobile objects were resized and repositioned after screenshot review to keep the copy clear.
- Case-study art remains in the next section. The hero art is used as a fallback when WebGL is unavailable.

## Functional checks

- Chromium renders a WebGL canvas in all three routes with no page errors. The stage, unfold, and decision controls update their respective 3D objects. Pointer and scroll input change the view; reduced-motion mode leaves content visible without automatic movement.
- The Field Notes trace sheet remains fully visible in a 1440 × 900 viewport when opened. With WebGL disabled on World Model, the original hero image stays visible and navigation remains usable.
- The 390-pixel viewport has no horizontal overflow. The project sections and links remain present below the hero.
- `npm run build`, `npm run lint`, and `git diff --check` pass.

Final result: **passed**
