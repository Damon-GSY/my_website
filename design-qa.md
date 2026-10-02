# Design QA — three experimental portfolio directions

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
