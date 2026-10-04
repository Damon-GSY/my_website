# Design QA — personal portfolio adaptations

Reviewed 2026-10-04 on `codex/oil-motion-frame-studies`. `/particle` and `/robot` now provide complete personal portfolios using Damon's existing biography, projects, articles, and contact destinations. The directory and homepage prioritize these adaptations; both original HTML files remain unchanged.

- Particle: 27 targeted Chromium checks pass across desktop, 390px, and 320px. All five navigation links fit; all four projects remain reachable in the short mobile work panel. About, Notes, and Contact follow the cinematic section without canvas overlap, and the morph progress remains scoped to the scene.
- Instrumented WebGL draw counts confirm pause/resume, offscreen suspension, and disposal on route change. Reduced-motion and disabled-WebGL modes retain the personal sections, project links, three notes, and contact; the static work heading clears the mobile header.
- Robot: desktop 1440×900, tablet 768×1024, mobile 390×844, small 320×740, and landscape 844×390 have no horizontal overflow, missing assets, or page exceptions. All four project and three article destinations match the existing data. Its four section links reach visible headings, and actual project/article navigation renders the correct destinations.
- Robot replay restarts all 11 SVG pieces and releases animation hints afterward. Initial and runtime reduced motion show the final artwork with zero animations; the replay control is disabled. The artwork is SVG assembly, not a Three.js model.
- The directory and homepage links pass desktop, 390px, and 320px checks with both new screenshots decoded. The separately served production build loads both portfolios and the directory, reaches Particle's Contact section, and reports no missing assets or page exceptions.
- `npm run lint`, `npm run build`, and `git diff --check` pass. No dependencies were added. The existing shared Three.js chunk-size advisory remains; physical-device frame rates and Safari were not measured.

Captures and structured results: `/workspace/personal-portfolio-captures/`. Content and implementation notes: [docs/personal-portfolio-adaptations.md](docs/personal-portfolio-adaptations.md).

---

# Design QA — complete pasted HTML pages

Reviewed 2026-10-03 on `codex/oil-motion-frame-studies`. The homepage now exposes `/html-studies/index.html`, which separates the exact uploaded Anchor original, the Damon adaptation, and the complete standalone Future Machine page.

- The directory passes desktop 1440px and mobile 390px/320px checks with no horizontal overflow, all three full-image thumbnails loaded, correct destinations, and no page exceptions. The homepage entry also navigates correctly at 320px.
- Both uploaded attachments have the same SHA-256. The retained original, its HTTP response, and the production copy match that hash exactly; the original source was not rewritten.
- Chromium displays the original intro and its final feature section. Its 15 CloudFront SVG requests fail in this environment; several original navigation anchors also have no target in the supplied source. The original preview preserves these source limitations rather than claiming to complete missing pages.
- The Damon adaptation reaches a ready Three.js scene and four project cards through Work navigation. Future Machine completes its 11-piece entrance and retains exactly four main children with no page scrolling. No page exceptions occurred across those checks.
- `npm run lint`, `npm run build`, and `git diff --check` pass. The build includes the directory and original HTML unchanged. Vite retains the existing shared Three.js size advisory.

Captures and browser results: `/workspace/html-studies-captures/`.

---

# Design QA — Oil Motion frame studies

Reviewed 2026-10-03 on `codex/oil-motion-frame-studies`. Three studies adapt Oil Motion to directly generated image sequences: pointer-driven Porcelain Observer, draggable Silver Bloom, and state-driven Amber Assembly. Source provenance and method: [motion-studies/README.md](motion-studies/README.md).

- Reviewed all 18 native poses over light, dark, and blue backgrounds. Each source is a real-alpha 1536×1024 image with a regular 3×2 grid of 512×512 cells; each decoded RGBA atlas occupies 6 MiB. The measured budgets and source hashes are retained with the study files.
- Each study contains six distinct source poses. Its H.264 preview is 2 seconds at 5 fps with 10 encoded frames, following a forward/reverse pose order; repeated poses are not additional generated motion. No AI video generation or optical-flow interpolation was used.
- Desktop and mobile page captures have no horizontal overflow, page exceptions, or failed assets. The UI implementation checks exercise Observer pointer selection, Bloom dragging, and Assembly playback direction.
- Independent Chromium checks pass for pointer endpoints, preview/pause, runtime reduced motion, keyboard frame selection, Bloom dragging, Assembly reversal from the current pose, hidden-tab suspension, route scroll reset, and an aborted atlas request with a usable fallback. No page exceptions were recorded.
- The separately served production build loads all three comparison artworks, navigates to a ready study, and selects the last pose by keyboard. Its exported MP4 decodes at 512×512 with a measured 2-second duration and advances during playback.
- `npm run build`, `npm run lint`, and `git diff --check` pass. Vite retains the existing advisory for the shared Three.js chunk above 500 kB. Physical-device frame rates and Safari were not measured.

**Scope:** these are intentionally stepped concept animations. Bloom retains slight generated variation in the hinges and red core between poses, so the sequence does not establish mechanically exact component continuity. No smooth-video or upstream video-Pilot acceptance is claimed.

Captures and measured review results: `/workspace/motion-studies-captures/`. Source analysis: `motion-studies/qa/`.

---

# Design QA — Future Machine standalone

Reviewed 2026-10-03 on `codex/future-machine-standalone`. Deliverable: `public/future-machine.html`.

- Independent source review confirms the requested four main children, SVG geometry, gradients, filter, URL-encoded favicon, 11 assembly animations, exact responsive rules/order, and single entrance IIFE. Only the two requested CSS explanations are included as comments.
- Chromium rendered the complete HTML while offline with zero external requests and zero page errors. This environment's managed Chromium blocks `file://` navigation, so validation loaded the file contents into an offline browser document; an actual double-click launch was not exercised here.
- Checked 1440×900, 1920×1080, 1280×1024, 1024×768, 768×1024, 800×800, 390×844, 320×568, 844×390, 568×320, 1400×1000, and 1401×1000. All content bounds fit; document/body had no overflow; attempted wheel and programmatic document scrolling remained at zero.
- All 11 SVG pieces use the specified timings and backwards fill. The page removes `is-entering` after the final reveal. A synthetic persisted `pageshow` event replaces the SVG node and replays entry; this checks the restoration handler, not browser-specific bfcache eligibility.
- With reduced motion, no CSS animations run and final artwork is immediately visible. No external images, libraries, frameworks, fonts, or media are referenced.

Captures and browser results: `/workspace/future-machine-captures/`. Repository build tools are not needed to run this file.

---

# Design QA — Particle intelligence

Reviewed 2026-10-03 on `codex/particle-intelligence`. The new homepage is `/`; `/particle` is an alias. Reference and implementation notes: [docs/particle-intelligence.md](docs/particle-intelligence.md).

## Visual and functional checks

- Compared actual browser captures against the supplied Anchor AI HTML at 1440×900 and 390×844. Retained the blue particle tree, sphere intro, rippling water/reflection, orbiting pills, pixel typography, and cube morph. Portfolio copy and project destinations replace insurance product content.
- Desktop, 390×844 mobile, 375×667 short mobile, and 844×390 landscape: no horizontal overflow or page exceptions. Corrected collapsed spaces between animated words. Mobile camera fits the tree; depth compensation keeps particles bright at the increased camera distance.
- Overview, Thinking, and Work chapter navigation reach their requested scroll positions. All four project cards navigate to matching `/projects#id` elements. The short mobile work panel scrolls to its final card without clipping its action.
- Live canvas frames change; pausing produces identical successive captures, and resuming changes the frames again. Pointer movement is accepted without errors. Scroll can select another form while paused.
- Initial and runtime reduced-motion states produce identical successive captures. Content switches to normal flow; turning the preference off restores the animated layout. The static chapter label also follows the visible section.
- Blocking WebGL creation and dispatching context loss both select the readable static layout with local imagery and all four project cards.
- Navigating to `/about` leaves no particle canvas and restores the previous title. Browser back creates one ready canvas; no route errors or stale overflow were observed.
- The production build was served separately and checked in Chromium: homepage scene becomes ready, Work navigation works, four cards are present, no failed asset requests or page errors.
- `npm run lint`, `npm run build`, and `git diff --check` pass. Vite retains its existing advisory warning for the shared Three.js chunk above 500 kB.

Screenshots: `/workspace/particle-page-captures/`. Reference captures: `/workspace/particle-reference-captures/`. These checks use Chromium with software WebGL; physical-device frame rates and Safari were not measured.

**Result: passed for the implemented portfolio and fallback paths in Chromium.**

---

# Design QA — GitHub star experiments

Reviewed 2026-10-03. The comparison index is `/lab`; actual repository sources and license notices are documented in [docs/star-lab-sources.md](docs/star-lab-sources.md).

## Implemented directions

| Route | Visual direction | Actual interaction |
| --- | --- | --- |
| `/lab/observatory` | Sandstone arches and bronze screens in a dark-green research exhibition | Three.js camera rails and pointer parallax |
| `/lab/tactile` | Vermilion, ivory, and charcoal printed research artifacts | Three.js cylindrical paper curl, moving shadow, spring release |
| `/lab/gallery` | Aubergine archive with six bespoke graphic folios | CSS 3D cylinder, drag/snap, keyboard navigation and shared-layout detail |
| `/lab/signal` | Acid-yellow typographic poster and dark vector field | Canvas 2D Plan/Resolve/Evaluate transformations and pointer response |

The index uses actual browser captures, totaling approximately 204 KiB of WebP. It mounts no canvas. Each experiment is loaded through its own dynamic import and uses existing dependencies. Both Three.js scenes are procedural geometry with authored canvas textures; no remote scene assets are required.

## Visual checks

- All four routes captured at 1440×900 and 390×844. No horizontal overflow, page exceptions, or failed asset requests in the combined route check.
- Reviewed desktop/mobile type, art placement, controls, and scrolled content. Fixed the tactile mobile paragraph spacing and gallery controls overlapping the front folio.
- Observatory initially exposed a blank scene before shaders completed. Shader compilation now precedes the first render and ready state; the architectural fallback remains visible while preparing the scene. Root review confirmed the corrected first view at 1200×750 without scrolling.
- Mobile and desktop index thumbnails are real captures of the implemented studies, including the gallery and field in their interactive sections.

## Interaction evidence

- Tactile: actual pointer drag reaches a visibly curled state and springs back; range input, End/Home, reset, and reduced motion are exercised. Simulated WebGL context loss exposes three semantic fallback artifact controls; selecting the second updates its project details.
- Gallery: drag changes the current folio without opening a dialog; arrow keys change selection; Enter opens the matching project. Tab stays inside the native modal; Escape restores focus. Runtime reduced-motion changes switch to a six-card static grid. Project links target existing `/projects#id` entries.
- Signal: all three mode buttons visibly change the canvas and linked project. Pause and reduced-motion snapshots stay stable, while normal-motion frames change. No global keyboard capture.
- Each drawing loop includes hidden/offscreen handling and cleanup. No physical-mobile or Safari performance claim is made from the Chromium checks.

Captures: `/workspace/star-lab-captures/`, `/workspace/observatory-preview-captures/`, and `/workspace/gallery-preview-captures/`.

## Final integration result

- `/lab` passes desktop and mobile layout checks; all four thumbnail images decode successfully and the index mounts zero canvases.
- Observatory passes first-view, chapter navigation, pause, reduced-motion, and no-WebGL checks at desktop/mobile sizes. Discrete chapter buttons now position the document immediately while the Three.js camera eases, avoiding delayed native smooth-scroll events; chapter indicators work independently of WebGL.
- The paper simulation also passes End/Home in normal-motion mode, with its rendered progress reaching 100% and 0%.
- `npm run build`, `npm run lint`, and `git diff --check` pass. Vite reports the existing warning for the shared Three.js chunk above 500 kB.

**Result: passed for the four browser studies and comparison index in Chromium.** The separate Oil Motion keyframe pilot below retains its pending continuous-video status.

---

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
