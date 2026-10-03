# Particle intelligence

## Branch and routes

- Branch: `codex/particle-intelligence`, based on `d586def` from `codex/three-concept-previews`.
- `/` and `/particle`: this portfolio interpretation of the uploaded HTML.
- `/classic`: previous homepage.
- The previous `/lab`, `/motion`, `/experiences`, and `/concepts` routes remain available.

## Reference and adaptation

The user supplied a standalone HTML file titled **Anchor AI — Intelligent Insurance Operations**. Its procedural Three.js scene and shader equations are the visual reference: a particle sphere expands into a branching tree, a reflective water surface carries concentric ripples, floating pills orbit in depth, and scroll morphs the tree into a cube.

The implementation extracts that application code into readable modules and uses the repository's installed Three.js rather than embedding the reference's entire minified r179 distribution. It retains the original blue/black palette, pixel typography, scene proportions, spectral edge pass, point reflection, and water/ripple shaders. Content is adapted to Damon's existing portfolio and project data. No insurance client relationships or product claims are carried over.

The uploaded application does not declare a separate license for its design or scene code; it is treated as user-supplied project material. Its bundled Three.js notice credits Three.js Authors under MIT. The installed Three.js MIT notice is reproduced in `public/particle-assets/Three-MIT.txt`.

The **Geist Pixel** font is extracted from the supplied document's embedded WOFF2 subset. Its family was verified from font metadata. Geist uses SIL Open Font License 1.1; the notice is retained at `public/particle-assets/Geist-OFL.txt`. Body copy uses the existing `@fontsource-variable/geist` dependency. The static fallback image is a capture of this implementation's actual scene.

The original referenced 15 CloudFront SVG assets. Those requests failed in this environment. This portfolio uses local text branding and research topics in place of the insurance logos, QR code, and app-store graphics, so it has no runtime dependency on that host.

## Code map

| File | Responsibility |
| --- | --- |
| `src/particle/ParticlePage.jsx` | Semantic content, chapter links, orbiting topic pills, pause and static layout |
| `src/particle/particleScene.js` | Geometry, camera, render loop, first-frame readiness and GPU cleanup |
| `src/particle/particleShaders.js` | Tree/cube morph, cursor repulsion, water, reflection, particles, spectral pass |
| `src/particle/particle.css` | Scoped responsive layout and typography |
| `public/particle-assets/` | Local font, scene poster and license notices |

## Runtime behavior

- Uses the native document scroll. Chapter links jump the document to the requested stage, while the scene eases its camera and rotation.
- Pointer movement affects the sculpture's view and repels nearby particles in screen space.
- Desktop keeps the reference's particle density; narrow screens use fewer particles and a fitted camera. Rendering is capped at 30 fps with a bounded pixel ratio.
- Pause freezes elapsed animation time; scrolling can still select a different stage.
- Reduced motion presents both content sections in ordinary document flow with a still scene. No floating pills, automatic camera movement, or intro animation runs.
- If WebGL creation or rendering fails, the local scene poster remains visible and both sections remain readable. There is no blocking loading screen or simulated progress percentage.
- Hidden tabs stop rendering. Unmounting removes listeners and disposes geometry, materials, composer passes, render targets, and renderer. The renderer also tolerates React StrictMode setup/cleanup.
- Small-height screens allow the work panel to scroll so all four cards remain reachable.

## Checks

Run `npm run lint` and `npm run build`. Browser checks and their results are recorded in `design-qa.md`.

The existing shared Three.js production chunk still exceeds Vite's 500 kB advisory threshold. The scene is dynamically imported and does not require a model download or generation service.
