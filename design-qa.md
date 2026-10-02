# Design QA — three homepage concepts

Final result: **passed**

## Source and capture setup

The three user-selected visual references are:

| Concept | Source image | Local preview | Desktop capture | Mobile capture |
| --- | --- | --- | --- | --- |
| Editorial | `/workspace/generated_images/exec-6b9e7986-ccb4-44f2-a92e-fe2f8ce07115.png` | `/concepts/editorial` | `/workspace/concept-preview-captures/editorial-desktop.png` | `/workspace/concept-preview-captures/editorial-mobile.png` |
| Kinetic type | `/workspace/generated_images/exec-4a98fdee-eac0-482d-b394-e482621431d6.png` | `/concepts/kinetic` | `/workspace/concept-preview-captures/kinetic-desktop.png` | `/workspace/concept-preview-captures/kinetic-mobile.png` |
| Sculpture | `/workspace/generated_images/exec-1def31c6-3463-4f16-9f58-7d4ed4693811.png` | `/concepts/sculpture` | `/workspace/concept-preview-captures/sculpture-desktop.png` | `/workspace/concept-preview-captures/sculpture-mobile.png` |

Desktop captures use a 1003 × 900 CSS pixel viewport, device scale factor 1, reduced motion, and full-page screenshots. Mobile captures use 390 × 844 with the same settings. The references were normalized to 1003 pixels wide before visual comparison. Comparison sheets and hero/work crops are in `/workspace/concept-preview-captures/`, named `{concept}-comparison.png`, `{concept}-hero-comparison.png`, and `{concept}-work-comparison.png`.

## Visual comparison

| Surface | Result |
| --- | --- |
| Typography | Editorial's large sans headline and italic accent, kinetic's heavy stacked headline, and sculpture's serif headline follow the selected references. Work section type and numbered entries were tuned after screenshot review. |
| Spacing and hierarchy | Each hero, work section, and lower content area follows its reference's structure. Mobile layouts reflow into a single column with room for the interactive canvas and readable calls to action. |
| Color | Cobalt, coral, and warm white palettes match the intended directions. The 3D scenes use real-time lighting, so highlights and material depth vary from the rendered stills. |
| Imagery | Three live Three.js scenes replace the reference's static hero imagery. The gallery uses generated project images on the same topics as the reference cards. |
| Copy | Headlines, biography, focus, and project subjects match the concepts. Project names and descriptions are sourced from the site's real project data. |

## Functional checks

- All three routes render a WebGL canvas; drag input changes each scene.
- Concept switcher changes routes; main navigation, project links, and email/contact links work. Project deep links scroll to the corresponding entry on `/projects`.
- At 390 pixels wide, none of the three pages has horizontal overflow. Browser captures produced no page errors.
- The existing `/` route still renders the original site. Reduced-motion preference stops idle animation while retaining drag interaction.
- `npm run build`, `npm run lint`, and `git diff --check` pass.

## Review history and remaining differences

Screenshot comparison led to fixes for the concept switcher route, hero copy/orb overlap, mobile canvas overlap, kinetic letter scale, heading weights, and project deep links. Final focused crops show no remaining P0–P2 layout or interaction issues. The kinetic letters have a cleaner surface and looser arrangement than the cinematic reference, and the sculpture is milkier than the reference's refractive glass. These are visual refinement opportunities for the eventual chosen direction, rather than blockers for comparing the three working concepts.
