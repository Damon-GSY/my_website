# Personal portfolio adaptations

The pasted designs are visual references for Damon's personal website. Their adapted pages use the existing biography, research, projects, writing, and contact destinations rather than the reference brands or product claims.

## Pages

- `/particle`: Matrix character rain now opens the personal portfolio, with three new scenes forming DAMON. The original blue sphere, tree, reflective water, and cube remain at `?scene=tree`. All modes include selected projects, biography, notes, and contact. See [particle directions](particle-directions.md).
- `/robot`: **Hello, human.**, an agent-themed personal portfolio with a live Three.js ceramic robot, oversized cobalt-and-cream typography, selected work, a dark navy biography, notes, and contact.
- `/html-studies/index.html`: comparison of the two personal sites, with smaller links to the preserved original references.
- `/`: the motion-study index exposes direct links to both personal sites above the image experiments.

The original `/html-studies/anchor-original.html` and `/future-machine.html` remain reference artifacts. Future Machine's no-scroll, single-file constraint applies to that original; its personal adaptation is a complete scrolling portfolio.

## Content sources

| Content | Existing source |
| --- | --- |
| Alibaba work, NUS and UNSW education, earlier experience | `src/data/about.js` |
| Selected work and project descriptions | `src/data/projects.js` |
| Article titles, excerpts, and destinations | `src/data/posts.js` |
| Email, GitHub, YouTube, Bilibili | `src/components/sections/Contact.jsx` |

Use the displayed name Damon Guo-Siyi. Do not infer degree titles or add publication URLs absent from the data. Project links use the existing `/projects#id` sections; article links use `/blog/:slug`. The existing email address is reused, not independently verified. The LinkedIn URL has a different name in its slug and is omitted from these new sections until clarified.

## Motion

The particle page uses actual Three.js geometry and shaders. The robot page now uses procedural Three.js geometry, replacing its earlier SVG helmet implementation. Its head and eyes follow the pointer, it blinks and nods in response to **Say hello**, and scrolling opens its ceramic shell around a mechanical core. **Meet the system**, **Reassemble**, **Pause**, and **Replay** provide explicit scene controls. Both pages must retain readable final states with reduced motion and meaningful links on narrow screens.

Browser review evidence and implementation limits are recorded in `design-qa.md`.
