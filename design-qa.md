# Design QA — three experimental portfolio directions

## Reference and capture setup

| Direction | Generated visual reference | Browser route |
| --- | --- | --- |
| The Agent’s Path | `/workspace/generated_images/exec-51feba77-68d4-4d46-b666-e6b5a7e7b92c.png` | `/experiences/path` |
| Field Notes | `/workspace/generated_images/exec-a6d07644-2b07-48f6-b5cf-2f83a392c594.png` | `/experiences/field-notes` |
| World Model | `/workspace/generated_images/exec-c79b4ce7-c839-4a62-b687-cb5f83d65200.png` | `/experiences/world-model` |

Full-page browser captures are in `/workspace/experience-preview-captures/` as `{direction}-source-width.png` and `{direction}-mobile.png`. The source-width viewport was 1024 CSS pixels wide at device scale factor 1 and with reduced motion enabled; the World Model source was scaled from 860 to 1024 pixels without changing its aspect ratio. Mobile captures use a 390 × 844 CSS pixel viewport. Equal-width side-by-side sheets are named `{direction}-hero-comparison.jpg`, `{direction}-case-comparison.jpg`, and `{direction}-full-comparison.jpg`.

## Visual comparison

| Surface | Result |
| --- | --- |
| Typography | The Path uses large editorial serif type, Field Notes uses condensed display type with monospaced labels, and World Model uses a bold sans headline. Hierarchy follows each reference. |
| Spacing and composition | Hero and case-study regions retain each reference’s dominant placement and visual rhythm. Mobile layouts reposition art and controls so the text and selected actions remain readable. |
| Color | Path retains near-black, warm light, and acid yellow; Field Notes retains paper white, red, and blue; World Model retains lavender, cobalt, and coral. |
| Imagery | Six optimized WebP images retain the detailed concept art. Three.js adds live traces, glass glints, and moving routes over the images. |
| Copy | Project names, outcomes, and 100+ tools claim match the existing project data; the case studies link to the corresponding project entries. |

The Field Notes case diagram is a simplified interactive tool selector in place of the still reference’s printed diagram. It keeps the same editorial contrast and information order. Its hero title sits slightly lower than in the source. These are minor visual differences.

## Interaction and technical checks

- All three routes render successfully at desktop and mobile widths. WebGL initialized in Chromium. Screenshots taken at two different times show each scene animating with normal motion settings.
- Path stage selection changes the active trace and explanation. Field Notes unfolds and closes its trace, changes trace steps, and updates the selected tool. World Model changes the active decision and displayed explanation.
- The bottom switcher navigates between the three routes. Case-study links target the matching existing project IDs. The original homepage remains available at `/`.
- A 390-pixel mobile viewport has no horizontal overflow. Browser interaction checks produced no page errors. Reduced-motion captures retain all content and controls without automatic motion.
- `npm run build`, `npm run lint`, and `git diff --check` pass.

## Review history

Initial side-by-side review exposed overlap between controls and the fixed switcher on narrow layouts, low contrast over the World Model hero image, and a hard-to-read Path trace on bright detail. The final styles move the controls, place World Model copy on a solid lavender region, and give the Path trace a dark translucent backing. No remaining P0–P2 visual or interaction issues were found.

Final result: **passed**
