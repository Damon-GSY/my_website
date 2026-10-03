# Star Lab: sources and reproduction

Reviewed on **2026-10-03**. This collection explores four different interactions using repositories from [Damon-GSY's public stars](https://github.com/Damon-GSY?tab=stars).

## Discovery

The public [Web Frontend list](https://github.com/stars/Damon-GSY/lists/web-frontend) contains ThreeUI, sticker-forge, cult-ui, react-three-fiber, and Gooey-Text. The [Content & Media list](https://github.com/stars/Damon-GSY/lists/content-media) contains cursor-lab. The [Skills & Prompts](https://github.com/stars/Damon-GSY/lists/skills-prompts) and [Templates & Starters](https://github.com/stars/Damon-GSY/lists/templates-starters) lists were also consulted during discovery.

The selected repositories were read at the pinned revisions below. They contribute specific interactions to new portfolio studies; this is a curated selection from the public lists, not a claim that every starred repository has been integrated.

## Routes and rendering

| Route | Study | Interaction | Rendering |
| --- | --- | --- | --- |
| `/lab` | Comparison index | Choose a study and inspect its source | React and CSS |
| `/lab/observatory` | The Observatory | Scroll through a spatial research scene with camera parallax | Three.js / WebGL |
| `/lab/tactile` | A Working Surface | Peel a research poster with a curved surface and moving shadow | Three.js / WebGL shaders |
| `/lab/gallery` | The Research Archive | Rotate a project carousel and open a project detail | CSS 3D transforms and Framer Motion |
| `/lab/signal` | Signal / Noise | Move through a field that reacts to the pointer | Canvas 2D |

The CSS carousel and Canvas field have their rendering technologies listed explicitly. Their depth and motion do not require a Three.js scene. The studies use the site's existing dependencies and project content.

## Adapted sources

### Observatory — MengTo/threeui

- Repository: [MengTo/threeui](https://github.com/MengTo/threeui).
- Revision: [`68802d5428071ada5c20db8094b1649e6bb770ed`](https://github.com/MengTo/threeui/tree/68802d5428071ada5c20db8094b1649e6bb770ed).
- Adapted source: [Kage camera rail](https://github.com/MengTo/threeui/blob/68802d5428071ada5c20db8094b1649e6bb770ed/public/landing-pages/kage.html#L4033-L4107): dual Catmull–Rom tracks, camera/field-of-view interpolation, aspect fitting, pointer drift, and section anchors.
- Technique inspiration only: the [bookshelf renderer](https://github.com/MengTo/threeui/blob/68802d5428071ada5c20db8094b1649e6bb770ed/src/shaders/bookshelf/bookshelfRenderer.js) informed the physical paper/cloth/foil materials and canvas lettering. The observatory architecture, procedural exhibit textures, project content, and composition are newly authored. No ThreeUI images, fonts, or models are copied.
- License: MIT, **Copyright (c) 2026 Meng To**. [Local notice](licenses/threeui-MIT.txt); [pinned upstream license](https://github.com/MengTo/threeui/blob/68802d5428071ada5c20db8094b1649e6bb770ed/LICENSE).

ThreeUI also documents [asset licensing](https://github.com/MengTo/threeui/blob/68802d5428071ada5c20db8094b1649e6bb770ed/ASSET-LICENSES.md). Its remote catalog thumbnails/videos are outside the repository's MIT grant. This study uses procedural artwork and the site's own content; it does not redistribute those catalog media or ThreeUI Pro/Beta components.

### Tactile — CatsJuice/sticker-forge

- Repository: [CatsJuice/sticker-forge](https://github.com/CatsJuice/sticker-forge).
- Revision: [`068caa49eef69745564a5debbc01bab3fcd31042`](https://github.com/CatsJuice/sticker-forge/tree/068caa49eef69745564a5debbc01bab3fcd31042).
- Source references: [curl deformation and normals](https://github.com/CatsJuice/sticker-forge/blob/068caa49eef69745564a5debbc01bab3fcd31042/lib/shaders.ts#L1-L116), [projected shadow](https://github.com/CatsJuice/sticker-forge/blob/068caa49eef69745564a5debbc01bab3fcd31042/lib/shaders.ts#L184-L234), [pointer-depth calculation](https://github.com/CatsJuice/sticker-forge/blob/068caa49eef69745564a5debbc01bab3fcd31042/lib/sticker-forge.ts#L1463-L1537), [spring substeps](https://github.com/CatsJuice/sticker-forge/blob/068caa49eef69745564a5debbc01bab3fcd31042/lib/sticker-forge.ts#L2147-L2188).
- Adaptation: the cylindrical curl math, surface normals, projected shadow, pointer-to-peel depth, and spring integration are adapted to a self-contained portfolio poster interaction. The poster textures and page composition are newly authored.
- The editor, export pipeline, background-removal models, audio, and upstream artwork are not bundled into this study.
- License: MIT, **Copyright (c) 2026 CatsJuice**. [Local notice](licenses/sticker-forge-MIT.txt); [pinned upstream license](https://github.com/CatsJuice/sticker-forge/blob/068caa49eef69745564a5debbc01bab3fcd31042/LICENSE).

### Gallery — nolly-studio/cult-ui

- Repository: [nolly-studio/cult-ui](https://github.com/nolly-studio/cult-ui).
- Revision: [`67a66c6ac1cd240914ba688a907611b3437a7a2b`](https://github.com/nolly-studio/cult-ui/tree/67a66c6ac1cd240914ba688a907611b3437a7a2b).
- Source references: [`three-d-carousel.tsx`](https://github.com/nolly-studio/cult-ui/blob/67a66c6ac1cd240914ba688a907611b3437a7a2b/apps/www/registry/default/ui/three-d-carousel.tsx), [`expandable-screen.tsx`](https://github.com/nolly-studio/cult-ui/blob/67a66c6ac1cd240914ba688a907611b3437a7a2b/apps/www/registry/default/ui/expandable-screen.tsx).
- Adaptation: the cylindrical card arrangement uses CSS perspective, rotation, and translated depth. Project expansion uses Motion transitions, adapted to the existing React/Vite site and Framer Motion package. Project copy and visual artwork belong to this portfolio study.
- License: MIT, **Copyright (c) 2023 Jordan-Gilliam**. [Local notice](licenses/cult-ui-MIT.txt); [pinned upstream license](https://github.com/nolly-studio/cult-ui/blob/67a66c6ac1cd240914ba688a907611b3437a7a2b/LICENSE.md).

### Signal — oleksand4rux-del/cursor-lab

- Repository: [oleksand4rux-del/cursor-lab](https://github.com/oleksand4rux-del/cursor-lab).
- Revision: [`c55b31c5c5ac5e4fe8ca10377ab38846ca3f4aa7`](https://github.com/oleksand4rux-del/cursor-lab/tree/c55b31c5c5ac5e4fe8ca10377ab38846ca3f4aa7).
- Source references: [Magnet Lines](https://github.com/oleksand4rux-del/cursor-lab/blob/c55b31c5c5ac5e4fe8ca10377ab38846ca3f4aa7/assets/db-field.js#L17) and [Dot Grid Warp](https://github.com/oleksand4rux-del/cursor-lab/blob/c55b31c5c5ac5e4fe8ca10377ab38846ca3f4aa7/assets/db-field.js#L392), both in `assets/db-field.js`.
- Adaptation: Magnet Lines heading and distance falloff, plus Dot Grid Warp's squared radial displacement, are adapted in `src/lab/signal/SignalField.jsx`. The React lifecycle, Plan/Resolve/Evaluate field compositions, typography, and portfolio content are newly authored. No other upstream files are copied or adapted.
- License: MIT, **Copyright (c) 2026 Oleksandr Yeromin**. [Local notice](licenses/cursor-lab-MIT.txt); [pinned upstream license](https://github.com/oleksand4rux-del/cursor-lab/blob/c55b31c5c5ac5e4fe8ca10377ab38846ca3f4aa7/LICENSE).

## Reviewed without code integration

| Repository | Decision |
| --- | --- |
| [Quantapar/Gooey-Text](https://github.com/Quantapar/Gooey-Text/tree/0f08e5527f06f9548d95046beb3554081633c996) | Reviewed as a fluid typography reference. No license file was found in the reviewed revision; no source code, glyph artwork, or assets were copied. |
| [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | Reviewed as an alternative React renderer for Three.js. The current studies use the existing Three.js dependency directly, so this renderer was not added. |

## Reproduce locally

From an existing checkout of `Damon-GSY/my_website`:

```bash
git fetch origin
git switch codex/three-concept-previews
git pull --ff-only
npm ci
npm run dev
```

Use the address printed by Vite and append `/lab`. The four study routes can also be opened directly. An additional clone inside the existing `my_website` directory is unnecessary. If local edits prevent switching or pulling, preserve those edits before changing branches.

For a production build and local preview:

```bash
npm run build
npm run preview
```

These commands are reproduction instructions, not evidence that every browser or interaction has passed validation. Verification results belong in the project's QA report.

## Attribution and maintenance

Adapted source modules identify their upstream repository and revision. Full upstream license notices are retained under [`docs/licenses`](licenses/), in the adapted modules, and in the deployed `/lab-assets/licenses.txt`. Keep these notices when distributing substantial portions of the adaptations. Existing npm dependencies retain their own licenses.

Pinned links above make the reference code reproducible even when upstream `main` changes. Update the revision, adaptation notes, and corresponding license copy together when replacing a source. The application does not fetch source code from these repositories at runtime.
